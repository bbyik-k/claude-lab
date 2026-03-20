import { Client } from '@notionhq/client';
import { unstable_cache } from 'next/cache';
import type { Invoice, InvoiceItem, InvoiceStatus } from '@/types/invoice';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

/** Notion 상태 이름 -> InvoiceStatus 변환 */
function parseStatus(name?: string): InvoiceStatus {
  const map: Record<string, InvoiceStatus> = {
    작성중: 'draft',
    발송완료: 'sent',
    승인: 'approved',
    만료: 'expired',
  };
  return map[name ?? ''] ?? 'draft';
}

/** Notion DB 페이지 속성 -> Invoice 기본 정보 변환 */
function parseInvoiceProperties(page: any): Omit<Invoice, 'items'> {
  const props = page.properties;
  const subtotal = props['공급가액']?.number ?? 0;

  return {
    id: page.id,
    token: props['공유토큰']?.rich_text?.[0]?.plain_text ?? '',
    title: props['견적서명']?.title?.[0]?.plain_text ?? '',
    invoiceNumber: props['견적번호']?.rich_text?.[0]?.plain_text ?? '',
    status: parseStatus(props['상태']?.status?.name),
    issuedAt: new Date(props['발행일']?.date?.start ?? ''),
    expiresAt: new Date(props['만료일']?.date?.start ?? ''),
    clientName: props['고객사명']?.rich_text?.[0]?.plain_text ?? '',
    contactName: props['담당자명']?.rich_text?.[0]?.plain_text ?? '',
    contactPhone: props['연락처']?.rich_text?.[0]?.plain_text ?? '',
    contactEmail: props['이메일']?.rich_text?.[0]?.plain_text ?? '',
    subtotal,
    vat: Math.round(subtotal * 0.1),
    total: Math.round(subtotal * 1.1),
  };
}

/** Notion 페이지 본문 테이블 블록 -> InvoiceItem[] 변환 */
async function parseInvoiceItems(pageId: string): Promise<InvoiceItem[]> {
  const blocks = await notion.blocks.children.list({ block_id: pageId });
  const tableBlock = blocks.results.find((b: any) => b.type === 'table');
  if (!tableBlock) return [];

  const rows = await notion.blocks.children.list({ block_id: (tableBlock as any).id });

  // 첫 번째 행은 헤더이므로 건너뜀
  return rows.results.slice(1).map((row: any) => {
    const cells = row.table_row.cells;
    const quantity = Number(cells[1]?.[0]?.plain_text ?? 0);
    const unitPrice = Number(cells[2]?.[0]?.plain_text ?? 0);
    return {
      name: cells[0]?.[0]?.plain_text ?? '',
      quantity,
      unitPrice,
      amount: quantity * unitPrice,
    };
  });
}

/**
 * 공유토큰으로 견적서 전체 조회
 * Notion API 반복 호출 방지를 위해 5분(300초) 캐싱 적용 (F011)
 */
export const getInvoiceByToken = unstable_cache(
  async (token: string): Promise<Invoice | null> => {
    const response = await notion.dataSources.query({
      data_source_id: DATABASE_ID,
      filter: {
        property: '공유토큰',
        rich_text: { equals: token },
      },
    });

    if (response.results.length === 0) return null;

    const page = response.results[0];
    const base = parseInvoiceProperties(page);
    const items = await parseInvoiceItems(page.id);

    return { ...base, items };
  },
  ['invoice-by-token'],
  { revalidate: 300 }
);
