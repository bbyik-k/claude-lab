import type { SearchParams } from 'next/dist/server/request/search-params';

interface Props {
  searchParams: Promise<SearchParams>;
}

/** 오류 유형별 메시지 반환 */
function getErrorMessage(reason?: string): string {
  switch (reason) {
    case 'not-found':
      return '요청하신 견적서를 찾을 수 없습니다.';
    case 'expired':
      return '만료된 견적서입니다.';
    default:
      return '견적서를 불러오는 중 오류가 발생했습니다.';
  }
}

/**
 * 오류 페이지 (F005)
 * 유효하지 않은 토큰, 만료된 견적서, 서버 오류 안내
 */
export default async function InvoiceErrorPage({ searchParams }: Props) {
  const { reason } = await searchParams;
  const message = getErrorMessage(reason as string | undefined);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">견적서를 확인할 수 없습니다</h1>
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
      <p className="text-muted-foreground text-sm border-t pt-4 mt-2">
        문의사항이 있으시면 담당자에게 연락해 주세요.
      </p>
    </div>
  );
}
