import Link from 'next/link';

/**
 * 견적서 404 페이지
 * 공유 토큰에 해당하는 견적서를 찾을 수 없을 때 표시된다.
 */
export default function InvoiceNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">견적서를 찾을 수 없습니다</h1>
        <p className="text-muted-foreground text-sm">
          링크가 올바른지 확인하거나 담당자에게 새 링크를 요청해 주세요.
        </p>
      </div>

      <Link
        href="/"
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        홈으로 돌아가기
      </Link>

      <p className="text-muted-foreground text-xs border-t pt-4">
        문의사항이 있으시면 담당자에게 연락해 주세요.
      </p>
    </div>
  );
}
