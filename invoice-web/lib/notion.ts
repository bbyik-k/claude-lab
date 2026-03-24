import { Client } from '@notionhq/client';
import { unstable_cache } from 'next/cache';
import type { Invoice, InvoiceItem, InvoiceStatus } from '@/types/invoice';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

/** Invoices DB ID (환경변수) */
const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

/** Items DB ID (MVP이므로 상수로 하드코딩) */
const ITEMS_DATABASE_ID = '32c842779dcf800fb66dc078f0d9bfa3';

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
function parseTotalAmount(prop: any): number {
  if (!prop) return 0;

  // number 타입
  if (prop.type === 'number' && prop.number != null) return prop.number;

  // formula 타입 (결과가 number인 경우)
  if (prop.type === 'formula') {
    const formula = prop.formula;
    if (formula?.type === 'number' && formula.number != null) return formula.number;
  }

  // rollup 타입 (집계 결과가 number인 경우)
  if (prop.type === 'rollup') {
    const rollup = prop.rollup;
    if (rollup?.type === 'number' && rollup.number != null) return rollup.number;
    // array 타입 rollup (sum 등)
    if (rollup?.type === 'array') {
      const nums = (rollup.array ?? [])
        .map((item: any) => parseTotalAmount(item))
        .filter((n: number) => !isNaN(n));
      return nums.reduce((acc: number, n: number) => acc + n, 0);
    }
  }

  return 0;
}

/** Notion Invoices DB 페이지 속성 -> Invoice 기본 정보 변환 */
function parseInvoiceProperties(page: any): Omit<Invoice, 'items'> {
  const props = page.properties;

  // 총금액: rollup / formula / number 타입 모두 대응
  const total = parseTotalAmount(props['총금액']);
  // 부가세는 총금액에 포함된 구조이므로 역산 (MVQ: 총금액 = 공급가액 × 1.1)
  const subtotal = Math.round(total / 1.1);
  const vat = total - subtotal;

  // 견적서 번호: title 타입
  const invoiceNumber = props['견적서 번호']?.title?.[0]?.plain_text ?? '';

  return {
    id: page.id,
    token: props['공유토큰']?.rich_text?.[0]?.plain_text ?? '',
    // title은 견적서 번호 값 그대로 사용
    title: invoiceNumber,
    invoiceNumber,
    status: parseStatus(props['상태']?.status?.name),
    issuedAt: props['발행일']?.date?.start ?? '',
    expiresAt: props['유효기간']?.date?.start ?? '',
    clientName: props['클라이언트명']?.rich_text?.[0]?.plain_text ?? '',
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
async function parseInvoiceItems(page: any): Promise<InvoiceItem[]> {
  const relationItems: { id: string }[] =
    page.properties['항목']?.relation ?? [];

  if (relationItems.length === 0) return [];

  // 각 Items DB 레코드 병렬 조회
  const itemPages = await Promise.all(
    relationItems.map((rel) =>
      notion.pages.retrieve({ page_id: rel.id })
    )
  );

  return itemPages.map((itemPage: any) => {
    const props = itemPage.properties;

    // 항목명: title 타입
    const name = props['항목명']?.title?.[0]?.plain_text ?? '';
    const quantity = props['수량']?.number ?? 0;
    const unitPrice = props['단가']?.number ?? 0;

    // 금액: formula 타입 (수량 × 단가), 없을 경우 직접 계산
    const amountProp = props['금액'];
    const amount =
      amountProp?.type === 'formula' && amountProp.formula?.type === 'number'
        ? (amountProp.formula.number ?? quantity * unitPrice)
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
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: '공유토큰',
        rich_text: { equals: token },
      },
    });

    if (response.results.length === 0) return null;

    const page = response.results[0];
    const base = parseInvoiceProperties(page);

    // relation 조회를 위해 page 객체 전달
    const items = await parseInvoiceItems(page);

    return { ...base, items };
  },
  ['invoice-by-token'],
  { revalidate: 300 }
);
