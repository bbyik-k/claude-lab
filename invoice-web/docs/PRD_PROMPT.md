# MVP PRD 생성 메타 프롬프트

> 이 문서는 "노션 견적서 → 웹 뷰어 + PDF 다운로드" MVP의 PRD를 Claude Code가 작성하도록 유도하는 메타 프롬프트입니다.
> 아래 프롬프트를 Claude Code에 그대로 붙여넣어 `docs/PRD.md`를 생성하세요.

---

## 사용 방법

1. 아래 `--- PROMPT START ---` 부터 `--- PROMPT END ---` 사이의 텍스트를 복사합니다.
2. Claude Code 채팅창에 붙여넣고 실행합니다.
3. 생성된 PRD는 `docs/PRD.md`에 저장됩니다.

---

--- PROMPT START ---

당신은 시니어 프로덕트 매니저이자 풀스택 개발자입니다.
아래 컨텍스트를 바탕으로 MVP PRD 문서를 한국어로 작성하고 `docs/PRD.md` 파일로 저장하세요.

## 프로젝트 컨텍스트

**제품명**: 노션 견적서 웹 뷰어
**한 줄 설명**: 노션에서 작성한 견적서를 클라이언트가 웹 브라우저로 확인하고 PDF로 다운로드할 수 있는 서비스
**단계**: MVP (Minimum Viable Product)

**현재 기술 스택** (`CLAUDE.md` 기준):
- Framework: Next.js 15.5.3 (App Router)
- Runtime: React 19 + TypeScript 5
- Styling: Tailwind CSS v4 + shadcn/ui (new-york style)
- 패키지 매니저: pnpm

**핵심 플로우**:
1. 사업자(Admin)가 Notion에서 견적서 데이터를 입력한다
2. 시스템이 Notion API를 통해 데이터를 읽어온다
3. 클라이언트(고객)가 고유 URL로 견적서를 웹에서 확인한다
4. 클라이언트가 버튼 클릭 한 번으로 PDF를 다운로드한다

---

## PRD 작성 지침

다음 구조와 품질 기준에 맞춰 PRD를 작성하세요.

### 1. 문서 메타데이터
- 문서 버전, 작성일, 상태(Draft / Review / Approved)를 헤더에 포함

### 2. 배경 및 문제 정의
- 현재 견적서 공유 방식의 Pain Point를 구체적으로 서술 (예: 이메일 첨부, 수동 PDF 변환, 버전 불일치)
- 이 제품이 해결하는 핵심 문제 1~3가지

### 3. 목표 및 성공 지표 (Goals & Success Metrics)
- MVP 목표: 정성적 목표 2개, 정량적 목표 2개
- 성공 지표: 측정 가능한 KPI 형태로 작성 (예: PDF 다운로드 성공률 > 95%)

### 4. 사용자 정의 (User Personas)
아래 두 페르소나를 포함하세요:
- **Admin (사업자)**: Notion을 사용해 견적서를 관리하는 주체
- **Client (고객)**: 링크를 받아 견적서를 확인하고 PDF를 저장하는 주체

각 페르소나에 대해: 역할, 주요 목표, 기술 수준, 핵심 Pain Point를 작성

### 5. 기능 요구사항 (Functional Requirements)

MVP 범위 내에서 다음 기능들을 **MoSCoW 우선순위**로 분류하세요:

#### Must Have
- [ ] Notion API 연동: 지정된 Notion Database에서 견적서 데이터 읽기
- [ ] 견적서 웹 뷰어: 고유 URL(`/invoice/[id]`)로 견적서 렌더링
- [ ] PDF 다운로드: 브라우저에서 인쇄 최적화 PDF 생성 및 다운로드
- [ ] 견적서 만료 처리: 유효기간이 지난 견적서 접근 시 안내 메시지 표시

#### Should Have
- [ ] 견적서 상태 표시: 작성중 / 전송됨 / 승인됨 / 만료됨
- [ ] 로딩 스켈레톤 UI
- [ ] 반응형 레이아웃 (모바일 대응)

#### Could Have
- [ ] 견적서 승인/거절 버튼 (클라이언트 액션)
- [ ] 링크 공유 버튼 (클립보드 복사)

#### Won't Have (MVP 제외)
- [ ] 사용자 인증/로그인
- [ ] 견적서 편집 기능
- [ ] 이메일 자동 발송
- [ ] 다국어 지원

### 6. Notion 데이터 스키마 정의

MVP에서 사용할 Notion Database 필드를 정의하세요:

| 필드명 | Notion 타입 | 설명 | 필수 여부 |
|--------|------------|------|----------|
| (여기에 견적서에 필요한 필드를 논리적으로 설계하여 채우세요) | | | |

최소 포함 항목: 견적번호, 클라이언트명, 발행일, 유효기간, 항목(라인 아이템), 소계/세금/합계, 상태, 메모

### 7. 화면 정의 (Screen Definitions)

각 화면에 대해 URL, 목적, 주요 컴포넌트, 데이터 소스를 명세하세요:

- **견적서 뷰어** (`/invoice/[id]`)
- **만료/오류 페이지** (`/invoice/[id]` - 만료 상태)
- **404 페이지** (존재하지 않는 견적서)

### 8. 비기능 요구사항 (Non-Functional Requirements)

- **성능**: 초기 로딩 3초 이내 (LCP 기준), PDF 생성 5초 이내
- **보안**: Notion API 키 서버사이드 보관, 견적서 URL은 추측 불가한 ID 사용
- **접근성**: WCAG 2.1 AA 수준, 프린트 미디어 쿼리 최적화
- **브라우저 지원**: 크롬/엣지/사파리 최신 버전

### 9. 기술 구현 가이드

현재 스택을 기반으로 다음 항목을 명세하세요:

**API 레이어**:
- `app/api/invoice/[id]/route.ts` — Notion API 호출 및 데이터 변환
- Notion SDK: `@notionhq/client`

**페이지 레이어**:
- `app/invoice/[id]/page.tsx` — 서버 컴포넌트로 데이터 패치
- `app/invoice/[id]/loading.tsx` — 스켈레톤 UI

**컴포넌트 레이어**:
- `features/invoice/` — 견적서 도메인 컴포넌트 및 타입
- `components/ui/` — shadcn/ui 기반 공통 UI

**PDF 생성 방식** (선택지 제시 및 권고안 포함):
- Option A: `window.print()` + CSS `@media print` (의존성 없음, 권고)
- Option B: `react-pdf` 라이브러리
- Option C: Puppeteer 서버사이드 렌더링

**데이터 흐름**:
```
Notion DB → Next.js API Route → Server Component → Client UI → PDF
```

### 10. 마일스톤 및 일정

MVP를 3개의 스프린트(각 1주)로 분해하세요:

- **Sprint 1**: Notion 연동 + 기본 데이터 모델
- **Sprint 2**: 견적서 UI 렌더링
- **Sprint 3**: PDF 다운로드 + 상태 처리 + QA

### 11. 미결 사항 (Open Questions)

PRD 리뷰 전 결정이 필요한 항목들을 나열하세요:
- Notion Database ID는 환경변수로 고정할지, 동적으로 받을지
- 견적서 URL의 ID는 Notion 페이지 ID를 그대로 쓸지, 별도 slug를 쓸지
- PDF 생성 방식 최종 결정
- 견적서 접근에 별도 인증(비밀번호 등)이 필요한지

---

## 출력 형식 요구사항

- 파일 경로: `docs/PRD.md`
- 언어: 한국어 (기술 용어는 영어 병기 허용)
- 형식: GitHub Flavored Markdown
- 길이: 충분히 상세하게 (최소 500줄 이상 권장)
- 표, 체크박스, 코드블록을 적극 활용
- 각 섹션은 실제 개발에 착수할 수 있을 만큼 구체적으로 작성

작성이 완료되면 "PRD 작성 완료: `docs/PRD.md`에 저장되었습니다." 라고 알려주세요.

--- PROMPT END ---
