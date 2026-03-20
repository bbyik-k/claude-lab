import type { InvoiceItem } from '@/types/invoice';

interface InvoiceItemsTableProps {
  items: InvoiceItem[];
}

/** 견적 항목 테이블 - 품목, 수량, 단가, 금액 표시 (F003) */
export function InvoiceItemsTable({ items }: InvoiceItemsTableProps) {
  const formatCurrency = (amount: number) =>
    amount.toLocaleString('ko-KR') + '원';

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">품목</th>
            <th className="px-4 py-3 text-right font-semibold">수량</th>
            <th className="px-4 py-3 text-right font-semibold">단가</th>
            <th className="px-4 py-3 text-right font-semibold">금액</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((item, index) => (
            <tr key={index} className="invoice-item">
              <td className="px-4 py-3">{item.name}</td>
              <td className="px-4 py-3 text-right">{item.quantity}</td>
              <td className="px-4 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
              <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
