import type { Metadata } from 'next'
import { Suspense } from 'react'
import { cookies } from 'next/headers'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import PageTracker from '@/components/PageTracker'
import { RegionProvider } from '@/context/RegionContext'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.edongne.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: '이동네 - 뉴욕·뉴저지 한인 커뮤니티',
    template: '%s | 이동네',
  },
  description: '뉴욕 뉴저지 한인 부동산, 건축, 변호사, 융자 전문가 찾기 & 생활정보 커뮤니티',
  keywords: '뉴욕 한인, 뉴저지 한인, 부동산, 리얼터, 건축, 인테리어, 변호사, 융자, 모기지, 커뮤니티, 생활정보',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: '이동네',
    title: '이동네 - 뉴욕·뉴저지 한인 커뮤니티',
    description: '뉴욕 뉴저지 한인 부동산, 건축, 변호사, 융자 전문가 찾기 & 생활정보 커뮤니티',
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: '이동네 - 뉴욕·뉴저지 한인 커뮤니티',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '이동네 - 뉴욕·뉴저지 한인 커뮤니티',
    description: '뉴욕 뉴저지 한인 부동산, 건축, 변호사, 융자 전문가 찾기 & 생활정보 커뮤니티',
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'bl855H3ZsiePJK5oISjc_6VvkiVQ9RM3GlMUjZUSAfM',
    other: {
      'naver-site-verification': '66bf2ce8562090d147c23bde2c5efaf2ddcb35de',
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  alternates: {
    canonical: SITE_URL,
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const initialRegion = cookieStore.get('edongne_region')?.value || 'ny'

  return (
    <html lang="ko">
      <head>
        <link
          rel="preload"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/woff2/PretendardVariable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <GoogleAnalytics />
        <PageTracker />
        <RegionProvider initialRegion={initialRegion}>
          <Suspense fallback={null}>
            <Header />
          </Suspense>
          <main className="flex-1">{children}</main>
          <Footer />
        </RegionProvider>
      </body>
    </html>
  )
}
