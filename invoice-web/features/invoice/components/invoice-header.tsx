import type { Invoice } from '@/types/invoice';

interface InvoiceHeaderProps {
  invoice: Pick<Invoice, 'title' | 'invoiceNumber' | 'issuedAt' | 'expiresAt' | 'clientName' | 'contactName' | 'contactPhone' | 'contactEmail'>;
}

/** 견적서 헤더 - 고객사, 담당자, 발행일 등 기본 정보 표시 (F002) */
export function InvoiceHeader({ invoice }: InvoiceHeaderProps) {
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

  return (
    <div className='space-y-6'>
      <div className='flex items-start justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>{invoice.title}</h1>
          <p className='text-muted-foreground text-sm mt-1'>견적번호: {invoice.invoiceNumber}</p>
        </div>
        <div className='text-right text-sm space-y-1'>
          <p>발행일: {formatDate(invoice.issuedAt)}</p>
          <p>만료일: {formatDate(invoice.expiresAt)}</p>
        </div>
      </div>

      <div className='border rounded-lg p-4 space-y-2 text-sm'>
        <p className='font-semibold text-base'>{invoice.clientName}</p>
        <p>담당자: {invoice.contactName}</p>
        <p>연락처: {invoice.contactPhone}</p>
        <p>이메일: {invoice.contactEmail}</p>
      </div>
    </div>
  );
}
