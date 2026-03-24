import type { MetadataRoute } from 'next';

/**
 * robots.txt 생성 (Next.js 파일 기반 메타데이터 API)
 * - /invoice/ 하위 경로는 검색엔진 크롤링 차단
 *   (클라이언트 전용 공유 링크이므로 색인 불필요)
 * - sitemap 미사용
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: '/invoice/',
    },
  };
}
