import { notFound, redirect } from 'next/navigation';
import { getInvoiceByToken } from '@/lib/notion';
import { InvoiceView } from '@/features/invoice/components/invoice-view';
import type { Invoice } from '@/types/invoice';

interface Props {
  params: Promise<{ token: string }>;
}

/** 개발용 mock 데이터 - /invoice/mock 으로 접속하여 UI 확인 */
const MOCK_INVOICE: Invoice = {
  id: 'mock-id',
  token: 'mock',
  title: '웹 서비스 개발 견적서',
  invoiceNumber: 'INV-2026-001',
  status: 'sent',
  issuedAt: '2026-03-01',
  expiresAt: '2026-04-30',
  clientName: '(주)클라이언트',
  contactName: '홍길동',
  contactPhone: '010-1234-5678',
  contactEmail: 'hong@client.co.kr',
  subtotal: 5000000,
  vat: 500000,
  total: 5500000,
  items: [
    { name: '기획 및 설계', quantity: 1, unitPrice: 1000000, amount: 1000000 },
    { name: '프론트엔드 개발', quantity: 1, unitPrice: 2000000, amount: 2000000 },
    { name: '백엔드 API 개발', quantity: 1, unitPrice: 1500000, amount: 1500000 },
    { name: '배포 및 인프라 설정', quantity: 1, unitPrice: 500000, amount: 500000 },
  ],
};

/**
 * 견적서 확인 페이지 (F001, F002, F003, F004, F005, F010, F011)
 * 공유토큰으로 Notion DB를 조회하여 견적서를 렌더링한다.
 */
export default async function InvoicePage({ params }: Props) {
  const { token } = await params;

  // 개발용 mock 토큰 처리
  if (token === 'mock') {
    return <InvoiceView invoice={MOCK_INVOICE} />;
  }

  let invoice: Invoice | null = null;

  try {
    invoice = await getInvoiceByToken(token);
  } catch {
    // Notion API 호출 실패 시 서버 오류 페이지로 리다이렉트
    redirect('/invoice/error?reason=server-error');
  }

  // 토큰에 해당하는 견적서가 없으면 404
  if (!invoice) notFound();

  // 만료 체크: 상태가 'expired'이거나 만료일이 지난 경우 오류 페이지로 리다이렉트 (F005)
  const isExpired =
    invoice.status === 'expired' || new Date() > new Date(invoice.expiresAt);

  if (isExpired) {
    redirect('/invoice/error?reason=expired');
  }

  return <InvoiceView invoice={invoice} />;
}
