import { Metadata } from 'next'
import Link from 'next/link'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.edongne.com'

export const metadata: Metadata = {
  title: '뉴욕·뉴저지 한인 부동산 가이드',
  description: '뉴욕 부동산, 뉴저지 부동산 매수 절차부터 모기지, 학군, 한인 동네 가이드까지 한인을 위한 종합 부동산 정보.',
  keywords: '뉴욕 부동산, 뉴저지 부동산, 한인 부동산, NY 부동산, NJ 부동산, 부동산 가이드',
  alternates: {
    canonical: `${SITE_URL}/realestate`,
  },
  openGraph: {
    title: '뉴욕·뉴저지 한인 부동산 가이드 | 이동네',
    description: '한인을 위한 NY·NJ 부동산 종합 가이드',
    url: `${SITE_URL}/realestate`,
    type: 'website',
    siteName: '이동네',
    locale: 'ko_KR',
  },
}

export default function RealEstateIndexPage() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#FF6B35]">홈</Link>
        {' › '}
        <span className="text-gray-900">부동산 가이드</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-3">
          뉴욕·뉴저지 한인 부동산 가이드
        </h1>
        <p className="text-base md:text-lg text-gray-600 leading-relaxed">
          한인이 알아야 할 뉴욕·뉴저지 부동산 매수 절차, 모기지, 학군, 동네 정보, 세금을 종합 정리한 가이드. 지역별 완벽 가이드를 확인하세요.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Link
          href="/realestate/nj"
          className="block bg-white border-2 border-gray-200 hover:border-[#FF6B35] rounded-2xl p-6 transition"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">뉴저지 부동산</h2>
          <p className="text-gray-600 mb-4">
            Bergen County · Palisades Park · Fort Lee · Englewood Cliffs · Tenafly 한인 동네와 학군, 매수 절차, 재산세까지.
          </p>
          <span className="text-[#FF6B35] font-semibold">완벽 가이드 보기 →</span>
        </Link>

        <Link
          href="/realestate/ny"
          className="block bg-white border-2 border-gray-200 hover:border-[#FF6B35] rounded-2xl p-6 transition"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">뉴욕 부동산</h2>
          <p className="text-gray-600 mb-4">
            Flushing · Bayside · Great Neck · Manhasset 한인 인기 동네, Co-op vs Condo, 매수 절차, Mansion Tax까지.
          </p>
          <span className="text-[#FF6B35] font-semibold">완벽 가이드 보기 →</span>
        </Link>
      </div>

      <section className="mb-8 pt-8 border-t border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">관련 디렉토리</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/realtors" className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition text-center">
            <p className="font-semibold text-gray-900 text-sm">부동산 에이전트</p>
          </Link>
          <Link href="/mortgage" className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition text-center">
            <p className="font-semibold text-gray-900 text-sm">모기지 브로커</p>
          </Link>
          <Link href="/lawyers" className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition text-center">
            <p className="font-semibold text-gray-900 text-sm">부동산 변호사</p>
          </Link>
          <Link href="/builders" className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition text-center">
            <p className="font-semibold text-gray-900 text-sm">건축·인테리어</p>
          </Link>
        </div>
      </section>
    </article>
  )
}
