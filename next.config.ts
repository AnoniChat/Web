/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  // 이미지 최적화 설정
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'anonichat.world',
      },
    ],
    unoptimized: false,
  },
  
  // 압축 활성화
  compress: true,
  
  // 정적 파일 캐싱
  poweredByHeader: false,
  
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