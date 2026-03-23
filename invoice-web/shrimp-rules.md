# Development Guidelines — 노션 견적서 웹 뷰어

## 1. 프로젝트 개요

- **목적**: Notion DB 견적서를 공유토큰 기반 URL로 조회·렌더링하고 PDF로 저장하는 경량 웹 뷰어 MVP
- **스택**: Next.js 15.5.3 (App Router) + React 19 + TypeScript 5 + TailwindCSS v4 + shadcn/ui (new-york) + @notionhq/client
- **패키지 매니저**: pnpm 전용
- **인증 없음**: 모든 라우트는 공개 접근 (공유토큰만으로 접근 제어)
- **개발 서버**: `pnpm dev` → localhost:3000, mock UI 확인: `/invoice/mock`

---

## 2. 디렉토리 구조 및 파일 역할

```
app/
  invoice/
    [token]/page.tsx     # Server Component - Notion API 호출, 만료 체크, InvoiceView 렌더링
    error/page.tsx       # 오류 안내 페이지 (토큰 없음 / 만료 / 서버 오류)
  layout.tsx             # 루트 레이아웃
  globals.css            # 전역 CSS + @media print 인쇄 스타일
components/
  ui/                    # shadcn/ui 자동 생성 컴포넌트 (직접 수정 최소화)
  common/                # 프로젝트 공통 UI 컴포넌트 (범용)
features/
  invoice/
    components/          # 견적서 전용 UI 컴포넌트
      invoice-view.tsx        # 견적서 전체 레이아웃 (인쇄 영역 포함)
      invoice-header.tsx      # 견적서 헤더 (고객사, 발행일 등)
      invoice-items-table.tsx # 견적 항목 테이블 (품목/수량/단가/금액)
      invoice-summary.tsx     # 공급가액/부가세/합계 섹션
      invoice-print-button.tsx # PDF 저장 버튼 (Client Component)
lib/
  notion.ts              # Notion 클라이언트 싱글톤 + 파싱 유틸 + getInvoiceByToken
  utils.ts               # cn() 클래스 병합 유틸 (clsx + tailwind-merge)
  fetch.ts               # 얇은 fetch 래퍼 (fetchJson)
types/
  invoice.ts             # Invoice, InvoiceItem, InvoiceStatus 도메인 타입 단일 출처
```

---

## 3. 다중 파일 연동 규칙

| 작업 | 반드시 함께 수정할 파일 |
|------|------------------------|
| Invoice 타입 필드 추가/변경 | `types/invoice.ts` + `lib/notion.ts` (`parseInvoiceProperties`) |
| 새 견적서 UI 컴포넌트 추가 | `features/invoice/components/[name].tsx` 생성 + `invoice-view.tsx`에서 import |
| 인쇄 스타일 변경 | `app/globals.css` 의 `@media print` 블록 |
| 새 shadcn/ui 컴포넌트 필요 | `pnpm dlx shadcn@latest add [name]` 실행 (자동으로 `components/ui/`에 생성) |
| 오류 처리 강화 | `app/invoice/[token]/page.tsx` + `app/invoice/error/page.tsx` |
| 환경 변수 추가 | `.env.example` + `lib/notion.ts` 참조 코드 |

---

## 4. 코드 작성 규칙

### 파일 명명
- 파일명: **kebab-case** (예: `invoice-header.tsx`)
- 컴포넌트 함수: **PascalCase** export (예: `export function InvoiceHeader`)
- 훅: **camelCase** `use` 접두사 (예: `useInvoiceData`)

### 타입
- 도메인 타입(`Invoice`, `InvoiceItem`, `InvoiceStatus`)은 **반드시 `types/invoice.ts`에서 import**
- `types/invoice.ts` 외부에 같은 타입 중복 정의 **금지**

### 스타일링
- 클래스 병합: **`cn()` from `@/lib/utils` 사용 필수** (직접 문자열 연결 금지)
- 다크모드: `.dark` 클래스 기반 (`@custom-variant dark (&:is(.dark *))`)
- 인쇄 숨김: `print:hidden` Tailwind 변형 사용
- 디자인 토큰: `globals.css` 의 CSS 변수 참조 (`--color-*`, `--radius-*`)
- TailwindCSS v4: `tailwind.config.js` 없음, `globals.css`의 `@theme inline` 블록에서 설정

### Server vs Client Component
- **기본값은 Server Component** (파일 상단 지시어 없음)
- 브라우저 API(`window`, `document`), 이벤트 핸들러, useState/useEffect 사용 시만 `'use client'` 추가
- **Client Component에서 Notion API 직접 호출 금지** — Notion 호출은 Server Component(`app/invoice/[token]/page.tsx`) 또는 `lib/notion.ts`에서만

### 경로 별칭
- `@/` = 프로젝트 루트 (tsconfig 기준)
- 상대 경로보다 `@/` 절대 경로 선호

---

## 5. Notion API 연동 규칙

- Notion 클라이언트 인스턴스는 `lib/notion.ts` 내부에서만 생성 — 외부에서 `new Client()` 재생성 **금지**
- `getInvoiceByToken`은 **반드시 `unstable_cache`로 감싸서 5분(revalidate: 300) 캐싱 유지**
- Notion DB 쿼리 메서드: **`notion.databases.query`** 사용 (`notion.dataSources.query` 사용 금지)
- Notion DB 속성 파싱 시 한국어 속성명 그대로 사용 (`props['공유토큰']`, `props['견적서명']` 등)
- 테이블 블록 파싱 시 첫 번째 행(헤더)은 `slice(1)`로 건너뜀
- 환경 변수: `NOTION_API_KEY`, `NOTION_DATABASE_ID` (`.env.local`에 설정)

---

## 6. 견적서 비즈니스 로직 규칙

- **만료 판단**: `invoice.status === 'expired'` OR `new Date() > invoice.expiresAt` — 두 조건 중 하나라도 참이면 만료
- **금액 계산**: `vat = Math.round(subtotal * 0.1)`, `total = Math.round(subtotal * 1.1)` — 반올림 필수
- **상태 매핑**: 노션 상태명 → InvoiceStatus: `작성중→draft`, `발송완료→sent`, `승인→approved`, `만료→expired`
- **PDF 저장**: `window.print()` 호출로 구현 — 별도 PDF 라이브러리 도입 **금지**
- **mock 토큰**: `token === 'mock'` 조건으로 개발용 하드코딩 데이터 반환 (프로덕션에서도 유지)

---

## 7. 컴포넌트 배치 의사결정

```
새 컴포넌트 필요
  ├── 견적서 데이터(Invoice/InvoiceItem) 를 props로 받는가?
  │     ├── YES → features/invoice/components/[name].tsx
  │     └── NO  → 범용 UI인가?
  │               ├── YES → components/common/[name].tsx
  │               └── NO  → 해당 페이지 파일 내 inline 컴포넌트로 처리
  │
  └── shadcn/ui 기본 컴포넌트 필요?
        → pnpm dlx shadcn@latest add [name] 실행
```

---

## 8. 금지 사항

- **`npm` 또는 `yarn` 사용 금지** — pnpm만 사용
- **`components/ui/` 파일 직접 수정 금지** — shadcn/ui 자동 생성 파일, 재생성 시 덮어써짐
- **`getInvoiceByToken`에서 `unstable_cache` 제거 금지** — Notion API rate limit 대응 필수
- **`notion.dataSources.query` 사용 금지** — `notion.databases.query` 사용
- **Client Component에서 Notion API 호출 금지**
- **`types/invoice.ts` 외부에 Invoice/InvoiceItem 타입 재정의 금지**
- **`cn()` 없이 className 문자열 직접 연결 금지**
- **PDF 저장에 외부 라이브러리 도입 금지** — `window.print()` + CSS @media print로 구현
- **MVP 이후 기능 선제 구현 금지** (운영자 대시보드, 이메일 알림, 댓글/서명, 다국어 등)

---

## 9. 현재 알려진 버그 (Task 006 대상)

- `lib/notion.ts` 70번째 줄: `notion.dataSources.query` → `notion.databases.query` 로 교체 필요
- Task 006 수행 시 반드시 이 부분 수정

---

## 10. 명령어 참고

```bash
pnpm dev                              # 개발 서버 (localhost:3000)
pnpm build                            # 프로덕션 빌드
pnpm lint                             # ESLint 실행
pnpm dlx shadcn@latest add [name]     # shadcn/ui 컴포넌트 추가
```
