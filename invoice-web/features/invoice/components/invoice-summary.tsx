import type { Invoice } from '@/types/invoice';

interface InvoiceSummaryProps {
  invoice: Pick<Invoice, 'subtotal' | 'vat' | 'total'>;
}

/** 공급가액 / 부가세 / 합계금액 합산 섹션 (F002) */
export function InvoiceSummary({ invoice }: InvoiceSummaryProps) {
  const formatCurrency = (amount: number) =>
    amount.toLocaleString('ko-KR') + '원';

  return (
    <div className="flex justify-end">
      <div className="w-64 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">공급가액</span>
          <span>{formatCurrency(invoice.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">부가세 (10%)</span>
          <span>{formatCurrency(invoice.vat)}</span>
        </div>
        <div className="flex justify-between border-t pt-2 font-semibold text-base">
          <span>합계금액</span>
          <span>{formatCurrency(invoice.total)}</span>
        </div>
      </div>
    </div>
  );
}
