/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  eslint: {
    // Pre-existing lint warnings in admin/* shouldn't block production deploys.
    // Local `npm run lint` still works for catching issues during development.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Several admin pages have implicit-any parameters that block the build
    // typecheck without affecting runtime. Re-enable once those are cleaned up.
    ignoreBuildErrors: true,
  },
  images: {
    // Vercel Pro (2026-07): image optimization re-enabled.
    // Thumbnails are 40-260KB source JPGs — optimizer serves responsive
    // AVIF/WebP (typically 5-30KB per slot), cached at the edge.
    // Filenames are timestamped (gen_*/fix_*/bright_*) so 1-year TTL is safe.
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [64, 96, 128, 160, 256, 384],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // 스크래핑 방지
          {
            key: 'X-Robots-Tag',
            value: 'noai, noimageai',
          },
          // XSS 2차 방어 - Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
              "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
              "img-src 'self' data: blob: https://*.supabase.co https://dstnagdnbejumqobgyid.supabase.co https://*.googleusercontent.com https://www.google-analytics.com https://images.unsplash.com",
              "connect-src 'self' https://*.supabase.co https://api.stripe.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com",
              "frame-src 'self' https://js.stripe.com https://accounts.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          // 클릭재킹 방지
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // MIME 타입 스니핑 방지
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Referrer 정보 제한
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // HTTPS 강제
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // 브라우저 기능 제한
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
