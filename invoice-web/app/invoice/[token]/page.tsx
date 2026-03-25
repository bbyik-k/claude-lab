import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getInvoiceByToken } from '@/lib/notion';
import { InvoiceView } from '@/features/invoice/components/invoice-view';
import type { Invoice } from '@/types/invoice';

/** 토큰 기본 유효성 검사 정규식 (1~100자, 영문/숫자/하이픈/언더스코어) */
const TOKEN_PATTERN = /^[a-zA-Z0-9_-]{1,100}$/;

interface Props {
  params: Promise<{ token: string }>;
}

/**
 * 견적서 페이지 동적 메타데이터 생성
 * - mock 토큰: 미리보기 제목 반환
 * - 견적서 조회 성공: 견적서 제목으로 OpenGraph 포함 설정
 * - 견적서 없음 / 오류: 기본 제목 반환
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;

  // 유효하지 않은 토큰 형식은 기본 제목 반환
  if (token !== 'mock' && !TOKEN_PATTERN.test(token)) {
    return { title: '견적서 | 견적서 뷰어' };
  }

  // 개발용 mock 토큰
  if (token === 'mock') {
    return { title: '견적서 미리보기 | 견적서 뷰어' };
  }

  try {
    const invoice = await getInvoiceByToken(token);

    // 토큰에 해당하는 견적서가 없는 경우
    if (!invoice) {
      return { title: '견적서 | 견적서 뷰어' };
    }

    // 정상 조회 시 견적서 제목으로 메타데이터 설정
    return {
      title: `${invoice.title} | 견적서 뷰어`,
      openGraph: {
        title: `${invoice.title} | 견적서 뷰어`,
      },
    };
  } catch {
    // Notion API 오류 등 예외 상황 시 기본 제목 반환
    return { title: '견적서 | 견적서 뷰어' };
  }
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

  // 기본 형식 검증 (보안: 비정상적으로 긴 문자열 등 차단)
  if (token !== 'mock' && !TOKEN_PATTERN.test(token)) {
    notFound();
  }

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
