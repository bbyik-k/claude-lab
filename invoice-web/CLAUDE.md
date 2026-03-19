# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Claude Code 개발 지침

**claude-nextjs-starters**는 Next.js 15.5.3 + React 19 기반 모던 웹 애플리케이션 스타터 템플릿입니다.

## 개요

Next.js 16 + React 19 + Tailwind CSS v4 + shadcn/ui 기반 스타터킷. 패키지 매니저로 **pnpm**을 사용한다.

## 핵심 기술 스택

- **Framework**: Next.js 15.5.3 (App Router + Turbopack)
- **Runtime**: React 19.1.0 + TypeScript 5
- **Styling**: TailwindCSS v4 + shadcn/ui (new-york style)
- **Forms**: React Hook Form + Zod + Server Actions
- **UI Components**: Radix UI + Lucide Icons
- **Development**: ESLint + Prettier + Husky + lint-staged

## 개발 가이드

- **개발 로드맵**: `@/docs/ROADMAP.md`
- **프로젝트 요구사항**: `@/docs/PRD.md`
- **프로젝트 구조**: `@/docs/guides/project-structure.md`
- **스타일링 가이드**: `@/docs/guides/styling-guide.md`
- **컴포넌트 패턴**: `@/docs/guides/component-patterns.md`
- **Next.js 15.5.3 전문 가이드**: `@/docs/guides/nextjs-15.md`
- **폼 처리 완전 가이드**: `@/docs/guides/forms-react-hook-form.md`

## 주요 명령어

```bash
pnpm dev       # 개발 서버 실행 (localhost:3000)
pnpm build     # 프로덕션 빌드
pnpm start     # 프로덕션 서버 실행
pnpm lint      # ESLint 실행

# UI 컴포넌트
npx shadcn@latest add button    # 새 컴포넌트 추가
```

테스트 설정은 현재 없음.

## 아키텍처 및 디렉토리 구조

```
app/           # Next.js App Router - 라우트, 레이아웃, 페이지
components/
  ui/          # shadcn/ui 컴포넌트 (자동 생성/수정 최소화)
  common/      # 프로젝트 공통 UI 컴포넌트
features/      # 기능별 모듈 (컴포넌트 + 훅 + 타입 묶음) — 아직 미사용
hooks/         # 전역 커스텀 훅 — 아직 미사용
lib/           # 유틸리티 함수, 외부 라이브러리 래퍼
types/         # 전역 공통 타입 정의 — 아직 미사용
```

## 핵심 패턴

**스타일링**: Tailwind CSS v4 사용. `globals.css`에서 CSS 변수로 디자인 토큰을 정의하고 `@theme inline`으로 Tailwind에 연결. 다크모드는 `.dark` 클래스 기반.

**클래스 병합**: `lib/utils.ts`의 `cn()` 함수를 항상 사용 (`clsx` + `tailwind-merge` 조합).

**컴포넌트**: shadcn/ui 컴포넌트는 `components/ui/`에 위치. `cva`로 variant를 관리하고, `asChild` 패턴(`radix-ui`의 `Slot.Root`)을 지원.

**경로 별칭**: `@/`는 프로젝트 루트를 가리킴 (tsconfig 기준).

**데이터 페칭**: `lib/fetch.ts`의 `fetchJson<T>()` 래퍼 사용.

## shadcn/ui 컴포넌트 추가

```bash
pnpm dlx shadcn@latest add [component-name]
```

컴포넌트는 `components/ui/`에 추가된다.
