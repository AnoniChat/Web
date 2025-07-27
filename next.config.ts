/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone 모드 활성화 (Docker 최적화) - 필수!
  output: 'standalone',
  
  // 환경변수 설정
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  },
  
  // 이미지 최적화 설정
  images: {
    domains: ['anonichat.world'],
    unoptimized: false,
  },
  
  // 압축 활성화
  compress: true,
  
  // 정적 파일 캐싱
  poweredByHeader: false,
  
  // API 라우트 리다이렉트 (필요한 경우)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/:path*`,
      },
    ]
  },
  
  // 헤더 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig