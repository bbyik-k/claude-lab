import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * 보안 HTTP 응답 헤더 설정
   * 모든 경로에 공통 적용하여 XSS, 클릭재킹, MIME 스니핑 등을 방어한다.
   */
  async headers() {
    return [
      {
        // 모든 경로에 적용
        source: "/(.*)",
        headers: [
          {
            // 콘텐츠 보안 정책: 허용된 출처의 리소스만 로드 허용
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';",
          },
          {
            // 클릭재킹 방어: 동일 출처 iframe만 허용
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            // MIME 타입 스니핑 방어
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // Referrer 정책: 동일 출처는 전체 URL, 크로스 오리진은 origin만 전송
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
