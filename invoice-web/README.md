# 노션 견적서 웹 뷰어

노션 DB에 입력한 견적서를 클라이언트가 별도 계정 없이 공유 링크로 조회하고 PDF로 저장할 수 있는 웹 뷰어입니다.

## 프로젝트 개요

**목적**: 운영자가 노션에서 작성한 견적서를 클라이언트에게 URL로 공유하고, 클라이언트는 별도 로그인 없이 견적서 확인 및 PDF 저장이 가능하다.

**사용자**:
- 운영자 (1인 개발자/소규모팀): 노션에서 견적서 작성 후 공유토큰 URL 전달
- 클라이언트 (고객사 담당자): 공유 URL로 견적서 확인 및 PDF 저장

## 주요 페이지

| 경로 | 설명 |
|---|---|
| `/invoice/[token]` | 공유토큰 기반 견적서 확인 페이지 |
| `/invoice/error` | 유효하지 않은 토큰/만료 안내 오류 페이지 |

메뉴 내비게이션 없음. 모든 접근은 공유 URL 직접 입력으로 이루어진다.

## 핵심 기능

- **견적서 조회**: 공유토큰으로 Notion DB를 조회하여 견적서 데이터 반환 (5분 캐싱)
- **견적서 렌더링**: 조회 데이터를 헤더/항목 테이블/합계 레이아웃으로 표시
- **PDF 저장**: `window.print()` + CSS `@media print`로 PDF 저장
- **접근 제어**: 만료일 초과 또는 상태=만료인 견적서 접근 차단

## 기술 스택

- **Framework**: Next.js 15.5.3 (App Router + Turbopack)
- **Runtime**: React 19 + TypeScript 5
- **Styling**: TailwindCSS v4 + shadcn/ui (new-york style)
- **외부 API**: @notionhq/client
- **캐싱**: Next.js unstable_cache (5분)
- **배포**: Vercel
- **패키지 관리**: pnpm

## 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local`에 Notion 연동 정보를 입력한다.

```bash
NOTION_API_KEY=secret_xxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Notion 통합 설정 순서:
1. [notion.so/my-integrations](https://www.notion.so/my-integrations)에서 Integration 생성 후 API Key 복사
2. 견적서 Notion DB 페이지 우측 "..." → "연결" → Integration 추가
3. DB URL에서 Database ID 복사 후 `.env.local`에 저장

### 3. 개발 서버 실행

```bash
pnpm dev
```

[http://localhost:3000/invoice/[token]](http://localhost:3000) 형태로 접근.

### 4. 빌드

```bash
pnpm build
pnpm start
```

## Notion DB 스키마

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
| 공급가액 | Number | 원 단위 직접 입력 |
| 공유토큰 | Rich Text | UUID v4 |

**견적 항목**: 각 Notion 페이지 본문에 테이블 블록으로 삽입. 헤더 행 순서: `품목 | 수량 | 단가 | 금액`

## 개발 상태

- 기본 프로젝트 구조 설정 완료
- 개발 진행 중

## 문서

- [PRD 문서](./docs/PRD.md) - 상세 요구사항
- [개발 로드맵](./docs/ROADMAP.md) - 개발 계획
- [개발 가이드](./CLAUDE.md) - 개발 지침
