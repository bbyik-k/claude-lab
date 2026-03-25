import { redirect } from 'next/navigation';

/**
 * 루트 접근 시 오류 페이지로 리다이렉트
 * 모든 접근은 /invoice/[token] URL을 통해 이루어진다.
 */
export default function RootPage() {
  redirect('/invoice/error');
}
