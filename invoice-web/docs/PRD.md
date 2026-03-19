# 노션 견적서 웹 뷰어 MVP PRD

## 핵심 정보

**목적**: 노션 DB에 입력한 견적서를 클라이언트가 별도 계정 없이 공유 링크로 조회하고 PDF로 저장할 수 있게 한다.
**사용자**: 견적서를 발행하는 1인 개발자/소규모팀 운영자, 견적서를 받아보는 클라이언트(고객사 담당자).

---

## 사용자 여정

```
1. 운영자 (노션에서 작업)
   견적서 작성 (노션 DB 입력)
   ↓ 공유토큰 복사 후 클라이언트에게 URL 전달

2. 클라이언트 (브라우저 접근)
   /invoice/[token] 접속
   ↓ 서버에서 공유토큰으로 Notion DB 조회

   [토큰 유효 + 상태 정상] → 견적서 웹 뷰어 렌더링
   [토큰 무효 / 만료일 초과 / 상태=만료] → 오류 페이지 표시
   ↓

3. 견적서 웹 뷰어 (견적서 확인 페이지)
   ↓ 상단 "PDF 저장" 버튼 클릭

4. PDF 다운로드
   window.print() 실행 → 브라우저 인쇄 다이얼로그 → PDF 저장 완료
```

---

## 기능 명세

### MVP 핵심 기능

| ID | 기능명 | 설명 | MVP 필수 이유 | 관련 페이지 |
|---|---|---|---|---|
| **F001** | 견적서 조회 | 공유토큰으로 Notion DB를 조회하여 견적서 데이터를 반환 | 전체 서비스의 시작점 | 견적서 확인 페이지 |
| **F002** | 견적서 렌더링 | 조회한 데이터를 브랜드 견적서 레이아웃으로 화면에 표시 | 클라이언트가 내용을 확인하는 핵심 기능 | 견적서 확인 페이지 |
| **F003** | 견적 항목 표시 | Notion 페이지 본문 테이블 블록을 품목/수량/단가/금액 테이블로 렌더링 | 견적서의 핵심 데이터 표현 | 견적서 확인 페이지 |
| **F004** | PDF 저장 | window.print() + CSS @media print로 현재 견적서를 PDF로 저장 | 클라이언트의 최종 목적 | 견적서 확인 페이지 |
| **F005** | 접근 제어 | 만료일 초과 또는 상태=만료인 견적서 접근 차단 | 유효하지 않은 견적서 노출 방지 | 오류 페이지 |

### MVP 필수 지원 기능

| ID | 기능명 | 설명 | MVP 필수 이유 | 관련 페이지 |
|---|---|---|---|---|
| **F010** | Notion API 연동 | Notion DB 속성 및 페이지 블록 데이터를 파싱하여 도메인 타입으로 변환 | 모든 기능의 데이터 소스 | 견적서 확인 페이지 |
| **F011** | 응답 캐싱 | revalidate 300(5분)으로 Notion API 반복 호출 방지 | API 속도 제한(rate limit) 대응 | 견적서 확인 페이지 |

### MVP 이후 기능 (제외)

- 운영자 대시보드 (견적서 목록 관리)
- 견적서 상태 변경 (웹에서 직접 승인 처리)
- 이메일/카카오 알림 발송
- 견적서 댓글/서명 기능
- 다국어 지원

---

## 메뉴 구조

```
공개 라우트 (인증 불필요)
├── /invoice/[token]   - 견적서 확인 페이지 (F001, F002, F003, F004, F005)
└── /invoice/error     - 오류 페이지 (F005)
```

메뉴 내비게이션 없음. 모든 접근은 공유 URL 직접 입력으로 이루어진다.
운영자는 노션에서 공유토큰을 복사하여 클라이언트에게 URL을 직접 전달한다.

---

## 페이지별 상세 기능

### 견적서 확인 페이지

> **구현 기능:** `F001` `F002` `F003` `F004` `F010` `F011` | **인증:** 불필요 (공유토큰 기반)

| 항목 | 내용 |
|---|---|
| **역할** | 공유토큰으로 Notion에서 견적서를 조회하고 인쇄 가능한 형태로 렌더링하는 핵심 페이지 |
| **진입 경로** | 운영자가 전달한 `/invoice/[token]` URL 직접 접근 |
| **사용자 행동** | 견적서 내용 확인 후 "PDF 저장" 버튼을 클릭하여 브라우저 인쇄 다이얼로그로 PDF 저장 |
| **주요 기능** | - 공유토큰으로 Notion DB 레코드 조회 (F001, F010)<br>- 만료일/상태 유효성 검사 → 실패 시 오류 페이지로 이동 (F005)<br>- 견적서 헤더(발행일, 견적번호, 고객사, 담당자, 연락처, 이메일) 렌더링 (F002)<br>- 견적 항목 테이블(품목, 수량, 단가, 금액) 렌더링 (F003)<br>- 공급가액 / 부가세 / 합계금액 합산 표시 (F002)<br>- **PDF 저장** 버튼 (window.print() 실행) (F004)<br>- 5분 revalidate 캐싱 적용 (F011) |
| **다음 이동** | PDF 저장 성공 → 현재 페이지 유지, 유효성 검사 실패 → 오류 페이지 |

---

### 오류 페이지

> **구현 기능:** `F005` | **인증:** 불필요

| 항목 | 내용 |
|---|---|
| **역할** | 유효하지 않은 토큰, 만료된 견적서, 존재하지 않는 견적서 접근 시 안내 |
| **진입 경로** | 견적서 확인 페이지에서 접근 제어 실패 시 자동 리디렉션 |
| **사용자 행동** | 오류 원인 메시지 확인 후 페이지를 닫음 |
| **주요 기능** | - 오류 유형별 메시지 표시 (토큰 없음 / 만료 / 서버 오류)<br>- 운영자 연락 안내 문구 표시 |
| **다음 이동** | 없음 (종료 페이지) |

---

## 데이터 모델

### Invoice (견적서 - Notion DB 속성 매핑)

| 필드 | 설명 | 타입/관계 |
|---|---|---|
| id | Notion 페이지 ID | string |
| token | 공유토큰 (UUID v4, 조회 키) | string |
| title | 견적서명 | string |
| invoiceNumber | 견적번호 | string |
| status | 상태 | 'draft' \| 'sent' \| 'approved' \| 'expired' |
| issuedAt | 발행일 | Date |
| expiresAt | 만료일 | Date |
| clientName | 고객사명 | string |
| contactName | 담당자명 | string |
| contactPhone | 연락처 | string |
| contactEmail | 이메일 | string |
| subtotal | 공급가액 | number |
| vat | 부가세 (subtotal × 0.1) | number |
| total | 합계금액 (subtotal + vat) | number |
| items | 견적 항목 목록 | InvoiceItem[] |

### InvoiceItem (견적 항목 - Notion 테이블 블록 행 매핑)

| 필드 | 설명 | 타입/관계 |
|---|---|---|
| name | 품목명 | string |
| quantity | 수량 | number |
| unitPrice | 단가 | number |
| amount | 금액 (quantity × unitPrice) | number |

---

## 기술 구현 가이드

### 디렉토리 구조

```
app/
  invoice/
    [token]/
      page.tsx          # Server Component - Notion API 호출 및 렌더링
    error/
      page.tsx          # 오류 안내 페이지
features/
  invoice/
    components/
      invoice-view.tsx        # 견적서 전체 레이아웃 (인쇄 영역)
      invoice-header.tsx      # 견적서 헤더 (고객사, 발행일 등)
      invoice-items-table.tsx # 견적 항목 테이블
      invoice-summary.tsx     # 공급가액/부가세/합계 섹션
      invoice-print-button.tsx # PDF 저장 버튼 (Client Component)
lib/
  notion.ts             # Notion 클라이언트 초기화 + 파싱 유틸
types/
  invoice.ts            # Invoice, InvoiceItem 도메인 타입
```

### 핵심 타입 정의 (types/invoice.ts)

```typescript
export type InvoiceStatus = 'draft' | 'sent' | 'approved' | 'expired';

export interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  token: string;
  title: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issuedAt: Date;
  expiresAt: Date;
  clientName: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  subtotal: number;
  vat: number;
  total: number;
  items: InvoiceItem[];
}
```

### Notion 클라이언트 (lib/notion.ts)

```typescript
import { Client } from '@notionhq/client';
import type { Invoice, InvoiceItem } from '@/types/invoice';
import { unstable_cache } from 'next/cache';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

// Notion DB 속성 -> Invoice 타입 변환
function parseInvoiceProperties(page: any): Omit<Invoice, 'items'> {
  const props = page.properties;
  const subtotal = props['공급가액']?.number ?? 0;
  return {
    id: page.id,
    token: props['공유토큰']?.rich_text?.[0]?.plain_text ?? '',
    title: props['견적서명']?.title?.[0]?.plain_text ?? '',
    invoiceNumber: props['견적번호']?.rich_text?.[0]?.plain_text ?? '',
    status: parseStatus(props['상태']?.status?.name),
    issuedAt: new Date(props['발행일']?.date?.start ?? ''),
    expiresAt: new Date(props['만료일']?.date?.start ?? ''),
    clientName: props['고객사명']?.rich_text?.[0]?.plain_text ?? '',
    contactName: props['담당자명']?.rich_text?.[0]?.plain_text ?? '',
    contactPhone: props['연락처']?.rich_text?.[0]?.plain_text ?? '',
    contactEmail: props['이메일']?.rich_text?.[0]?.plain_text ?? '',
    subtotal,
    vat: Math.round(subtotal * 0.1),
    total: Math.round(subtotal * 1.1),
  };
}

function parseStatus(name?: string): Invoice['status'] {
  const map: Record<string, Invoice['status']> = {
    '작성중': 'draft',
    '발송완료': 'sent',
    '승인': 'approved',
    '만료': 'expired',
  };
  return map[name ?? ''] ?? 'draft';
}

// Notion 테이블 블록 -> InvoiceItem[] 변환
async function parseInvoiceItems(pageId: string): Promise<InvoiceItem[]> {
  const blocks = await notion.blocks.children.list({ block_id: pageId });
  const tableBlock = blocks.results.find((b: any) => b.type === 'table');
  if (!tableBlock) return [];

  const rows = await notion.blocks.children.list({ block_id: tableBlock.id });
  // 첫 번째 행은 헤더로 건너뜀
  return rows.results.slice(1).map((row: any) => {
    const cells = row.table_row.cells;
    const quantity = Number(cells[1]?.[0]?.plain_text ?? 0);
    const unitPrice = Number(cells[2]?.[0]?.plain_text ?? 0);
    return {
      name: cells[0]?.[0]?.plain_text ?? '',
      quantity,
      unitPrice,
      amount: quantity * unitPrice,
    };
  });
}

// 공유토큰으로 견적서 전체 조회 (5분 캐싱)
export const getInvoiceByToken = unstable_cache(
  async (token: string): Promise<Invoice | null> => {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: '공유토큰',
        rich_text: { equals: token },
      },
    });

    if (response.results.length === 0) return null;

    const page = response.results[0];
    const base = parseInvoiceProperties(page);
    const items = await parseInvoiceItems(page.id);

    return { ...base, items };
  },
  ['invoice-by-token'],
  { revalidate: 300 }
);
```

### 견적서 확인 페이지 (app/invoice/[token]/page.tsx)

```typescript
import { notFound } from 'next/navigation';
import { getInvoiceByToken } from '@/lib/notion';
import { InvoiceView } from '@/features/invoice/components/invoice-view';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function InvoicePage({ params }: Props) {
  const { token } = await params;
  const invoice = await getInvoiceByToken(token);

  if (!invoice) notFound();

  // 만료 체크
  const isExpired =
    invoice.status === 'expired' || new Date() > invoice.expiresAt;

  if (isExpired) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">
          만료된 견적서입니다. 담당자에게 문의해 주세요.
        </p>
      </div>
    );
  }

  return <InvoiceView invoice={invoice} />;
}
```

### PDF 저장 버튼 (features/invoice/components/invoice-print-button.tsx)

```typescript
'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export function InvoicePrintButton() {
  return (
    <Button onClick={() => window.print()} className="print:hidden">
      <Printer className="mr-2 h-4 w-4" />
      PDF 저장
    </Button>
  );
}
```

### CSS 인쇄 설정 (app/globals.css에 추가)

```css
@media print {
  /* 인쇄 시 버튼, 헤더 숨김 */
  .print\:hidden {
    display: none !important;
  }

  /* 여백 제거, 전체 너비 사용 */
  body {
    margin: 0;
    padding: 0;
  }

  /* 페이지 중간에서 항목이 잘리지 않도록 */
  tr,
  .invoice-item {
    break-inside: avoid;
  }
}
```

---

## 환경 변수

```bash
# .env.local
NOTION_API_KEY=secret_xxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Notion 통합 설정 순서

1. [notion.so/my-integrations](https://www.notion.so/my-integrations)에서 Integration 생성 → API Key 복사
2. 견적서 Notion DB 페이지 우측 상단 "..." → "연결" → 생성한 Integration 추가
3. DB URL에서 Database ID 복사 (`notion.so/[workspace]/[DATABASE_ID]?...`)
4. `.env.local`에 두 값 저장

---

## Notion DB 스키마 설정

| 속성명 | Notion 타입 | 비고 |
|---|---|---|
| 견적서명 | Title | 기본 제목 필드 |
| 견적번호 | Rich Text | 예: INV-2026-001 |
| 상태 | Status | 작성중 / 발송완료 / 승인 / 만료 |
| 발행일 | Date | |
| 만료일 | Date | |
| 고객사명 | Rich Text | |
| 담당자명 | Rich Text | |
| 연락처 | Rich Text | |
| 이메일 | Rich Text | |
| 공급가액 | Number | 직접 입력 (원 단위) |
| 부가세 | Formula | `prop("공급가액") * 0.1` |
| 합계금액 | Formula | `prop("공급가액") * 1.1` |
| 공유토큰 | Rich Text | UUID v4 수동 입력 또는 자동화 도구로 생성 |

**견적 항목**: 각 노션 페이지 본문에 테이블 블록으로 삽입.
헤더 행: `품목 | 수량 | 단가 | 금액` 순서 고정.

---

## 기술 스택

### 프론트엔드 프레임워크

- **Next.js 15.5.3** (App Router + Turbopack) - 풀스택 프레임워크, Server Component로 Notion API 직접 호출
- **React 19.1.0** - UI 라이브러리
- **TypeScript 5** - 타입 안전성

### 스타일링 & UI

- **TailwindCSS v4** - 설정 파일 없는 CSS 엔진
- **shadcn/ui** (new-york style) - Button, Table 등 컴포넌트
- **Lucide React** - 아이콘 (Printer 등)

### 외부 API

- **@notionhq/client** - Notion 공식 Node.js SDK

### 캐싱

- **Next.js unstable_cache** - Notion API 응답 5분 캐싱

### 배포

- **Vercel** - Next.js 최적화 배포, 환경 변수 관리

### 패키지 관리

- **pnpm** - 의존성 관리

---

## 패키지 설치

```bash
pnpm add @notionhq/client
```

---

## 정합성 검증

- F001 (견적서 조회) → 견적서 확인 페이지 구현
- F002 (견적서 렌더링) → 견적서 확인 페이지 구현
- F003 (견적 항목 표시) → 견적서 확인 페이지 구현
- F004 (PDF 저장) → 견적서 확인 페이지 구현
- F005 (접근 제어) → 견적서 확인 페이지 + 오류 페이지 구현
- F010 (Notion API 연동) → 견적서 확인 페이지 구현
- F011 (응답 캐싱) → 견적서 확인 페이지 구현
- 모든 기능이 두 페이지(견적서 확인 / 오류) 중 하나 이상에서 구현됨
- 누락 기능 없음
