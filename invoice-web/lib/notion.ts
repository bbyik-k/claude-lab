import { Client } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { unstable_cache } from 'next/cache';
import type { Invoice, InvoiceItem, InvoiceStatus } from '@/types/invoice';

/**
 * 필수 환경변수 존재 여부를 검증한다.
 * NOTION_API_KEY 또는 NOTION_DATABASE_ID가 없으면 에러를 throw한다.
 */
function validateEnv(): void {
  const missing: string[] = [];

  if (!process.env.NOTION_API_KEY) missing.push('NOTION_API_KEY');
  if (!process.env.NOTION_DATABASE_ID) missing.push('NOTION_DATABASE_ID');

  if (missing.length > 0) {
    console.error(`[notion] 필수 환경변수 누락: ${missing.join(', ')}`);
    throw new Error(`필수 환경변수가 설정되지 않았습니다: ${missing.join(', ')}`);
  }
}

// 테스트 환경이 아닐 때 모듈 로드 시점에 즉시 환경변수 검증 실행
if (process.env.NODE_ENV !== 'test') validateEnv();

const notion = new Client({ auth: process.env.NOTION_API_KEY });

/** Invoices DB ID (환경변수) */
const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

/**
 * 비동기 함수를 최대 maxRetries 횟수만큼 재시도하는 헬퍼
 * 실패 시 지수 백오프(500ms * (attempt + 1))를 적용한다.
 *
 * @param fn - 실행할 비동기 함수
 * @param maxRetries - 최대 재시도 횟수 (기본값: 2)
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      // 마지막 시도에서는 대기 없이 즉시 throw
      if (attempt === maxRetries) break;

      // 지수 백오프: 500ms, 1000ms, ...
      const delayMs = 500 * (attempt + 1);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

/** Notion 속성 값 접근용 타입 (동적 속성 파싱) */
type NotionPropValue = Record<string, unknown>;

/** Notion 상태 이름 -> InvoiceStatus 변환 */
function parseStatus(name?: string): InvoiceStatus {
  const map: Record<string, InvoiceStatus> = {
    대기: 'draft',
    작성중: 'draft',
    발송완료: 'sent',
    승인: 'approved',
    만료: 'expired',
  };
  return map[name ?? ''] ?? 'draft';
}

/**
 * 총금액 파싱 헬퍼
 * Notion 속성 타입이 rollup / formula / number 중 무엇이든 숫자를 추출한다.
 */
function parseTotalAmount(prop: NotionPropValue | null | undefined): number {
  if (!prop) return 0;

  // number 타입
  if (prop['type'] === 'number' && prop['number'] != null) return prop['number'] as number;

  // formula 타입 (결과가 number인 경우)
  if (prop['type'] === 'formula') {
    const formula = prop['formula'] as NotionPropValue | undefined;
    if (formula?.['type'] === 'number' && formula['number'] != null) return formula['number'] as number;
  }

  // rollup 타입 (집계 결과가 number인 경우)
  if (prop['type'] === 'rollup') {
    const rollup = prop['rollup'] as NotionPropValue | undefined;
    if (rollup?.['type'] === 'number' && rollup['number'] != null) return rollup['number'] as number;
    // array 타입 rollup (sum 등)
    if (rollup?.['type'] === 'array') {
      const nums = ((rollup['array'] ?? []) as NotionPropValue[])
        .map((item) => parseTotalAmount(item))
        .filter((n) => !isNaN(n));
      return nums.reduce((acc, n) => acc + n, 0);
    }
  }

  return 0;
}

/** Notion Invoices DB 페이지 속성 -> Invoice 기본 정보 변환 */
function parseInvoiceProperties(page: PageObjectResponse): Omit<Invoice, 'items'> {
  const props = page.properties as Record<string, NotionPropValue>;

  // 총금액: rollup / formula / number 타입 모두 대응
  const total = parseTotalAmount(props['총금액']);
  // 부가세는 총금액에 포함된 구조이므로 역산 (MVQ: 총금액 = 공급가액 × 1.1)
  const subtotal = Math.round(total / 1.1);
  const vat = total - subtotal;

  // 견적서 번호: title 타입
  const invoiceNumber = (props['견적서 번호']?.['title'] as { plain_text: string }[] | undefined)?.[0]?.plain_text ?? '';

  return {
    id: page.id,
    token: (props['공유토큰']?.['rich_text'] as { plain_text: string }[] | undefined)?.[0]?.plain_text ?? '',
    // title은 견적서 번호 값 그대로 사용
    title: invoiceNumber,
    invoiceNumber,
    status: parseStatus((props['상태']?.['status'] as { name?: string } | undefined)?.name),
    issuedAt: (props['발행일']?.['date'] as { start?: string } | undefined)?.start ?? '',
    expiresAt: (props['유효기간']?.['date'] as { start?: string } | undefined)?.start ?? '',
    clientName: (props['클라이언트명']?.['rich_text'] as { plain_text: string }[] | undefined)?.[0]?.plain_text ?? '',
    // DB에 없는 필드 - 빈 문자열 fallback
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    subtotal,
    vat,
    total,
  };
}

/**
 * Items DB relation 배열 -> InvoiceItem[] 변환
 * Invoices DB의 '항목' relation 속성에서 각 아이템 page_id를 꺼내
 * Items DB 레코드를 개별 조회한다.
 */
async function parseInvoiceItems(page: PageObjectResponse): Promise<InvoiceItem[]> {
  const props = page.properties as Record<string, NotionPropValue>;
  const relationItems = (props['항목']?.['relation'] ?? []) as { id: string }[];

  if (relationItems.length === 0) return [];

  // 각 Items DB 레코드 병렬 조회
  const itemPages = await Promise.all(
    relationItems.map((rel) =>
      notion.pages.retrieve({ page_id: rel.id })
    )
  );

  return itemPages.map((itemPage) => {
    const itemProps = (itemPage as PageObjectResponse).properties as Record<string, NotionPropValue>;

    // 항목명: title 타입
    const name = (itemProps['항목명']?.['title'] as { plain_text: string }[] | undefined)?.[0]?.plain_text ?? '';
    const quantity = (itemProps['수량']?.['number'] as number | null) ?? 0;
    const unitPrice = (itemProps['단가']?.['number'] as number | null) ?? 0;

    // 금액: formula 타입 (수량 × 단가), 없을 경우 직접 계산
    const amountProp = itemProps['금액'];
    const formula = amountProp?.['formula'] as NotionPropValue | undefined;
    const amount =
      amountProp?.['type'] === 'formula' && formula?.['type'] === 'number'
        ? ((formula['number'] as number | null) ?? quantity * unitPrice)
        : quantity * unitPrice;

    return { name, quantity, unitPrice, amount };
  });
}

/**
 * 공유토큰으로 견적서 전체 조회
 * Notion API 반복 호출 방지를 위해 5분(300초) 캐싱 적용
 */
export const getInvoiceByToken = unstable_cache(
  async (token: string): Promise<Invoice | null> => {
    // Notion API 호출 실패 시 최대 2회 재시도 (지수 백오프 적용)
    const response = await withRetry(() =>
      notion.databases.query({
        database_id: DATABASE_ID,
        filter: {
          property: '공유토큰',
          rich_text: { equals: token },
        },
      })
    );

    if (response.results.length === 0) return null;

    const page = response.results[0] as PageObjectResponse;
    const base = parseInvoiceProperties(page);

    // relation 조회를 위해 page 객체 전달
    const items = await parseInvoiceItems(page);

    return { ...base, items };
  },
  ['invoice-by-token'],
  { revalidate: 300 }
);
