# 노션 견적서 웹 뷰어 개발 로드맵

Notion DB의 견적서를 공유 링크로 조회하고 PDF로 저장할 수 있는 경량 웹 뷰어 MVP

## 개요

노션 견적서 웹 뷰어는 1인 개발자/소규모팀 운영자를 위한 견적서 공유 솔루션으로 다음 기능을 제공합니다:

- **견적서 조회 및 렌더링**: 공유토큰 기반 Notion DB 견적서 조회 및 브랜드 레이아웃 표시 (F001, F002, F003)
- **PDF 저장**: window.print() + CSS @media print 기반 PDF 다운로드 (F004)
- **접근 제어**: 만료일/상태 기반 견적서 접근 차단 및 오류 안내 (F005)
- **Notion API 연동**: DB 속성 + 페이지 블록 파싱, 5분 캐싱 적용 (F010, F011)

## 개발 워크플로우

1. **작업 계획**

   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - 새로운 작업을 포함하도록 `ROADMAP.md` 업데이트
   - 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**

   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - `/tasks` 디렉토리에 새 작업 파일 생성
   - 명명 형식: `XXX-description.md` (예: `001-setup.md`)
   - 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
   - API/비즈니스 로직 작업 시 "## 테스트 체크리스트" 섹션 필수 포함 (Playwright MCP 테스트 시나리오 작성)
   - 예시를 위해 `/tasks` 디렉토리의 마지막 완료된 작업 참조

3. **작업 구현**

   - 작업 파일의 명세서를 따름
   - 기능과 기능성 구현
   - API 연동 및 비즈니스 로직 구현 시 Playwright MCP로 테스트 수행 필수
   - 각 단계 후 작업 파일 내 단계 진행 상황 업데이트
   - 각 단계 완료 후 중단하고 추가 지시를 기다림

4. **로드맵 업데이트**

   - 로드맵에서 완료된 작업을 완료 표시로 갱신

---

## 개발 단계

### Phase 1: 애플리케이션 골격 구축 - 완료

> 프로젝트 기반 설정, 라우트 구조, 타입 정의, 디렉토리 골격 완성

- **Task 001: 프로젝트 초기 설정 및 라우트 구조 생성** - 완료
  - See: 초기 커밋 참조
  - Next.js App Router 기반 라우트 구조 생성 (`/invoice/[token]`, `/invoice/error`)
  - 공통 레이아웃 컴포넌트 (`app/layout.tsx`) 설정
  - TailwindCSS v4 + shadcn/ui (new-york) 초기화
  - ESLint, TypeScript 설정

- **Task 002: 타입 정의 및 데이터 모델 설계** - 완료
  - See: `types/invoice.ts`
  - `InvoiceStatus` 타입 정의 (`draft`, `sent`, `approved`, `expired`)
  - `InvoiceItem` 인터페이스 정의 (품목명, 수량, 단가, 금액)
  - `Invoice` 인터페이스 정의 (견적서 전체 속성 - Notion DB 매핑)

### Phase 2: UI/UX 완성 (Mock 데이터 활용) - 완료

> 모든 페이지 UI를 하드코딩된 mock 데이터로 완성하여 전체 사용자 플로우 체험 가능

- **Task 003: 견적서 UI 컴포넌트 라이브러리 구현** - 완료
  - See: `features/invoice/components/`
  - `InvoiceView` - 견적서 전체 레이아웃 (인쇄 영역 포함) (F002)
  - `InvoiceHeader` - 견적서 헤더 (고객사, 담당자, 발행일, 만료일 등) (F002)
  - `InvoiceItemsTable` - 견적 항목 테이블 (품목/수량/단가/금액) (F003)
  - `InvoiceSummary` - 공급가액/부가세/합계금액 합산 섹션 (F002)
  - `InvoicePrintButton` - PDF 저장 버튼 (Client Component, window.print()) (F004)

- **Task 004: 견적서 확인 페이지 UI 완성 (Mock 데이터)** - 완료
  - See: `app/invoice/[token]/page.tsx`
  - 견적서 확인 페이지 Server Component 구현 (F001, F002, F003, F004, F005)
  - `/invoice/mock` 경로로 mock 데이터 기반 UI 검증 가능
  - 만료 체크 로직 구현 (상태 `expired` 또는 만료일 초과 시 차단) (F005)

- **Task 005: 오류 페이지 및 인쇄 스타일 구현** - 완료
  - See: `app/invoice/error/page.tsx`, `app/globals.css`
  - 오류 유형별 메시지 표시 (토큰 없음 / 만료 / 서버 오류) (F005)
  - 운영자 연락 안내 문구 표시
  - CSS `@media print` 인쇄 스타일 설정 (여백 제거, 항목 잘림 방지) (F004)

### Phase 3: 핵심 기능 구현 (Notion API 연동)

> Mock 데이터를 실제 Notion API 호출로 교체하고 비즈니스 로직 검증

- **Task 006: Notion API 클라이언트 검증 및 연동 완성** - 우선순위
  - 관련 기능: F001, F010, F011
  - 관련 파일: `lib/notion.ts`
  - `@notionhq/client` 패키지 설치 및 환경 변수 설정 (`NOTION_API_KEY`, `NOTION_DATABASE_ID`)
  - Notion DB 속성 파싱 함수 (`parseInvoiceProperties`) 실제 데이터 검증
  - Notion 페이지 본문 테이블 블록 파싱 (`parseInvoiceItems`) 실제 데이터 검증
  - `getInvoiceByToken` 함수의 `unstable_cache` 5분 캐싱 동작 확인 (F011)
  - `notion.databases.query` API 호출 정상 동작 검증 (현재 `dataSources.query`로 되어 있어 수정 필요)
  - Playwright MCP를 활용한 API 엔드포인트 통합 테스트

- **Task 007: 접근 제어 및 에러 핸들링 강화** - 우선순위
  - 관련 기능: F005
  - 관련 파일: `app/invoice/[token]/page.tsx`, `app/invoice/error/page.tsx`
  - 만료된 견적서 접근 시 오류 페이지(`/invoice/error?reason=expired`)로 리다이렉트 구현
  - 존재하지 않는 토큰 접근 시 오류 페이지(`/invoice/error?reason=not-found`)로 리다이렉트 구현
  - Notion API 오류 발생 시 사용자 친화적 에러 표시
  - `error.tsx`, `not-found.tsx` Next.js 에러 바운더리 파일 추가
  - Playwright MCP로 접근 제어 플로우 E2E 테스트 수행

- **Task 008: 핵심 기능 통합 테스트**
  - 관련 기능: F001 ~ F005, F010, F011
  - Playwright MCP를 사용한 전체 사용자 플로우 테스트
    - 유효한 토큰으로 견적서 정상 조회 및 렌더링 확인
    - 만료된 견적서 접근 시 오류 페이지 표시 확인
    - 존재하지 않는 토큰 접근 시 오류 처리 확인
    - PDF 저장 버튼 클릭 시 브라우저 인쇄 다이얼로그 호출 확인
  - API 연동 및 비즈니스 로직 검증
    - Notion DB 속성 매핑 정합성 검증
    - 견적 항목 테이블 파싱 정확성 검증
    - 금액 계산 (공급가액, 부가세, 합계) 정확성 검증
  - 에러 핸들링 및 엣지 케이스 테스트
    - 빈 견적 항목 테이블 처리
    - Notion API 타임아웃/네트워크 오류 처리
    - 캐싱된 응답 갱신 동작 확인

### Phase 4: 품질 보증 및 배포

> 프로덕션 배포를 위한 최적화, 보안 점검, 배포 파이프라인 구축

- **Task 009: 메타데이터 및 SEO 설정**
  - `app/invoice/[token]/page.tsx`에 동적 메타데이터 생성 (`generateMetadata`)
  - Open Graph 태그 설정 (공유 시 견적서 제목 표시)
  - `robots.txt` 설정 (견적서 페이지 크롤링 방지 - `noindex`)
  - 파비콘 및 기본 메타 정보 설정

- **Task 010: 성능 최적화 및 보안 점검**
  - Notion API 응답 에러 시 재시도 로직 구현 (최대 2회)
  - 환경 변수 유효성 검증 (서버 시작 시 `NOTION_API_KEY`, `NOTION_DATABASE_ID` 확인)
  - Content Security Policy 헤더 설정
  - 토큰 형식 검증 (UUID v4 패턴 매칭)으로 불필요한 API 호출 방지
  - `next build` 정적 분석 오류 0건 확인

- **Task 011: Vercel 배포 및 환경 설정**
  - Vercel 프로젝트 생성 및 GitHub 연동
  - 환경 변수 (`NOTION_API_KEY`, `NOTION_DATABASE_ID`) Vercel에 등록
  - 프로덕션 배포 및 도메인 설정
  - 배포 후 실제 Notion DB 연동 E2E 검증
  - Playwright MCP로 프로덕션 환경 스모크 테스트 수행

---

## MVP 이후 기능 (Post-MVP)

> PRD에서 제외된 기능으로, MVP 안정화 이후 검토

- **운영자 대시보드**: 견적서 목록 관리, 상태 변경, 통계 확인
- **견적서 상태 변경**: 웹에서 직접 승인/거절 처리
- **알림 발송**: 이메일/카카오톡 견적서 전달 및 상태 변경 알림
- **견적서 댓글/서명**: 클라이언트 온라인 서명 및 코멘트 기능
- **다국어 지원**: 영문 견적서 템플릿 및 다국어 UI
- **견적서 템플릿**: 다양한 브랜드 레이아웃 선택 기능
- **견적서 이력 관리**: 버전 관리 및 수정 이력 추적
