/** 견적서 상태 */
export type InvoiceStatus = 'draft' | 'sent' | 'approved' | 'expired';

/** 견적 항목 - Notion 테이블 블록 행 매핑 */
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
  issuedAt: Date;
  expiresAt: Date;
  clientName: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  subtotal: number;
  vat: number;
  total: number;
  items: InvoiceItem[];
}
