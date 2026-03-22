import type { Metadata } from 'next'
import { Suspense } from 'react'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import PageTracker from '@/components/PageTracker'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://edongne.com'

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
  },
  twitter: {
    card: 'summary_large_image',
    title: '이동네 - 뉴욕·뉴저지 한인 커뮤니티',
    description: '뉴욕 뉴저지 한인 부동산, 건축, 변호사, 융자 전문가 찾기 & 생활정보 커뮤니티',
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
  },
  alternates: {
    canonical: SITE_URL,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col">
        <GoogleAnalytics />
        <PageTracker />
        <Suspense fallback={null}>
          <Header />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
