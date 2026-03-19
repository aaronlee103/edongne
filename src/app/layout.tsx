import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: '이동네 - 뉴욕·뉴저지 한인 커뮤니티',
  description: '뉴욕 뉴저지 한인 부동산, 건축, 변호사, 융자 전문가 찾기 & 커뮤니티',
  keywords: '뉴욕 한인, 뉴저지 한인, 부동산, 리얼터, 건축, 변호사, 융자, 커뮤니티',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // TODO: 서버에서 유저 세션 가져오기
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col">
        <Header user={null} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
