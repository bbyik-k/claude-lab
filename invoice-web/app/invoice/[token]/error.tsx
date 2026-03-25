'use client';

import { useEffect } from 'react';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * 견적서 페이지 에러 바운더리 (클라이언트 컴포넌트)
 * 렌더링 중 예기치 않은 오류 발생 시 사용자에게 안내하고 재시도 기회를 제공한다.
 */
export default function InvoiceError({ error, reset }: Props) {
  useEffect(() => {
    // 오류 로깅 (향후 모니터링 서비스 연동 지점)
    console.error('[InvoiceError]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">오류가 발생했습니다</h1>
        <p className="text-muted-foreground text-sm">
          견적서를 불러오는 중 문제가 생겼습니다.
        </p>
      </div>

      <button
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        다시 시도
      </button>

      <p className="text-muted-foreground text-xs border-t pt-4">
        문제가 지속되면 담당자에게 문의해 주세요.
      </p>
    </div>
  );
}
