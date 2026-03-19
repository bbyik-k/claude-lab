import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common/page-header';

const structure = [
  { folder: 'app/', desc: '라우트, 레이아웃, 페이지' },
  { folder: 'components/ui/', desc: 'shadcn/ui 컴포넌트' },
  { folder: 'components/common/', desc: '프로젝트 공통 UI 컴포넌트' },
  { folder: 'features/', desc: '기능별 모듈 (컴포넌트+훅+타입 묶음)' },
  { folder: 'hooks/', desc: '전역 커스텀 훅' },
  { folder: 'lib/', desc: '유틸리티 함수, 외부 라이브러리 래퍼' },
  { folder: 'types/', desc: '전역 공통 타입 정의' },
];

export default function Home() {
  return (
    <main className='mx-auto max-w-2xl px-6 py-16 space-y-10'>
      <PageHeader title='Invoice Web' description='Invoice Web' />

      {/* 프로젝트 구조 */}
      <section className='space-y-3'>
        <h2 className='text-lg font-semibold'>프로젝트 구조</h2>
        <ul className='divide-y rounded-lg border text-sm'>
          {structure.map(({ folder, desc }) => (
            <li key={folder} className='flex gap-4 px-4 py-2.5'>
              <code className='w-44 shrink-0 text-foreground'>{folder}</code>
              <span className='text-muted-foreground'>{desc}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 버튼 예시 */}
      <section className='space-y-3'>
        <h2 className='text-lg font-semibold'>컴포넌트 예시</h2>
        <div className='flex flex-wrap gap-3'>
          <Button>시작하기</Button>
          <Button variant='outline'>문서 보기</Button>
        </div>
      </section>
    </main>
  );
}
