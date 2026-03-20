import type { Invoice } from '@/types/invoice';
import { InvoiceHeader } from './invoice-header';
import { InvoiceItemsTable } from './invoice-items-table';
import { InvoiceSummary } from './invoice-summary';
import { InvoicePrintButton } from './invoice-print-button';

interface InvoiceViewProps {
  invoice: Invoice;
}

/** 견적서 전체 레이아웃 - 인쇄 영역 포함 (F002, F003, F004) */
export function InvoiceView({ invoice }: InvoiceViewProps) {
  return (
    <div className="min-h-screen bg-muted/30 py-10 print:bg-white print:py-0">
      {/* 인쇄 시 숨겨지는 액션 바 */}
      <div className="mx-auto mb-6 max-w-3xl px-6 flex justify-end print:hidden">
        <InvoicePrintButton />
      </div>

      {/* 인쇄 영역 */}
      <div className="mx-auto max-w-3xl bg-white px-10 py-10 shadow-sm print:shadow-none print:max-w-full">
        <div className="space-y-8">
          <InvoiceHeader invoice={invoice} />
          <InvoiceItemsTable items={invoice.items} />
          <InvoiceSummary invoice={invoice} />
        </div>
      </div>
    </div>
  );
}
