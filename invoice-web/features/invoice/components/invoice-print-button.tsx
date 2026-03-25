'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

/** PDF 저장 버튼 - 브라우저 인쇄 다이얼로그 실행 (F004) */
export function InvoicePrintButton() {
  return (
    <Button onClick={() => window.print()} className="print:hidden">
      <Printer className="mr-2 h-4 w-4" />
      PDF 저장
    </Button>
  );
}
