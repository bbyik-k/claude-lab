# 🤖 Claude Code 개발 지침

**노션 기반 견적서 관리 시스템 MVP** - 노션을 데이터베이스로 활용하여 견적서를 관리하고, 클라이언트가 웹에서 조회 및 PDF 다운로드할 수 있는 시스템

📋 상세 프로젝트 요구사항은 @/docs/PRD.md 참조

## 🛠️ 핵심 기술 스택

- **Framework**: Next.js 16.1.7 (App Router + Turbopack)
- **Runtime**: React 19.2.3 + TypeScript 5
- **Styling**: TailwindCSS v4 + shadcn/ui (new-york style)
- **Forms**: React Hook Form + Zod + Server Actions
- **UI Components**: Radix UI + Lucide Icons
- **External API**: @notionhq/client (Notion API SDK)
- **Development**: ESLint + Prettier + Husky + lint-staged

## 📚 개발 가이드

- **📋 프로젝트 요구사항 (PRD)**: `@/docs/PRD.md` - 견적서 시스템 상세 명세
- **📁 프로젝트 구조**: `@/docs/guides/project-structure.md`
- **🎨 스타일링 가이드**: `@/docs/guides/styling-guide.md`
- **🧩 컴포넌트 패턴**: `@/docs/guides/component-patterns.md`
- **⚡ Next.js 16.1.7 전문 가이드**: `@/docs/guides/nextjs-15.md`
- **📝 폼 처리 완전 가이드**: `@/docs/guides/forms-react-hook-form.md`

## ⚡ 자주 사용하는 명령어

```bash
pnpm dev       # 개발 서버 실행 (localhost:3000)
pnpm build     # 프로덕션 빌드
pnpm start     # 프로덕션 서버 실행
pnpm lint      # ESLint 실행
pnpm run check-all   # 모든 검사 통합 실행 (권장)

# UI 컴포넌트
npx shadcn@latest add button    # 새 컴포넌트 추가
```

테스트 설정은 현재 없음.

## 아키텍처 및 디렉토리 구조

```
app/
  invoice/
    [token]/   # 견적서 확인 페이지 (Server Component)
    error/     # 오류 안내 페이지
components/
  ui/          # shadcn/ui 컴포넌트 (자동 생성/수정 최소화)
  common/      # 프로젝트 공통 UI 컴포넌트
features/
  invoice/
    components/ # 견적서 UI 컴포넌트 모음
hooks/         # 전역 커스텀 훅
lib/
  notion.ts    # Notion 클라이언트 + 파싱 유틸
  utils.ts     # cn() 등 공통 유틸
types/
  invoice.ts   # Invoice, InvoiceItem 도메인 타입
```

## 핵심 패턴

**스타일링**: Tailwind CSS v4 사용. `globals.css`에서 CSS 변수로 디자인 토큰을 정의하고 `@theme inline`으로 Tailwind에 연결. 다크모드는 `.dark` 클래스 기반.

**클래스 병합**: `lib/utils.ts`의 `cn()` 함수를 항상 사용 (`clsx` + `tailwind-merge` 조합).

**컴포넌트**: shadcn/ui 컴포넌트는 `components/ui/`에 위치. `cva`로 variant를 관리하고, `asChild` 패턴(`radix-ui`의 `Slot.Root`)을 지원.

**경로 별칭**: `@/`는 프로젝트 루트를 가리킴 (tsconfig 기준).

**데이터 페칭**: `lib/notion.ts`의 `getInvoiceByToken()` 사용. `unstable_cache`로 5분 캐싱 적용.

## ✅ 작업 완료 체크리스트

```bash
pnpm run check-all   # 모든 검사 통과 확인
pnpm run build       # 빌드 성공 확인
```

💡 **상세 규칙은 위 개발 가이드 문서들을 참조하세요**
