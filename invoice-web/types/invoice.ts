/** 견적서 상태 */
export type InvoiceStatus = 'draft' | 'sent' | 'approved' | 'expired';

/** 견적 항목 - Notion Items DB 레코드 매핑 */
export interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

/** 견적서 - Notion DB 속성 매핑 */
export interface Invoice {
  id: string;
  token: string;
  title: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  /** ISO 날짜 문자열 (unstable_cache JSON 직렬화 대응) */
  issuedAt: string;
  expiresAt: string;
  clientName: string;
  /** DB에 없는 필드 - optional */
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  subtotal: number;
  vat: number;
  total: number;
  items: InvoiceItem[];
}
