import { Metadata } from 'next'
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase-server'

export const revalidate = 3600 // 1시간마다 재생성

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.edongne.com'
const PAGE_URL = `${SITE_URL}/realestate/nj`

export const metadata: Metadata = {
  title: '뉴저지 부동산 완벽 가이드 2026: 매수 절차·시장 분석·한인 동네 Top 10',
  description: '뉴저지 부동산 매수 절차부터 모기지, 학군, 한인 인기 동네 Top 10, 재산세 가이드까지. NJ Bergen County · Palisades Park · Fort Lee · Englewood Cliffs 한인 부동산 전문 정보를 한 번에.',
  keywords: '뉴저지 부동산, NJ 부동산, 뉴저지 한인 부동산, Bergen County 부동산, Palisades Park 부동산, Fort Lee 부동산, Englewood 부동산, 뉴저지 모기지, 뉴저지 학군, 뉴저지 재산세',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: '뉴저지 부동산 완벽 가이드 2026 | 이동네',
    description: '뉴저지 부동산 매수 절차, 시장 분석, 한인 동네, 학군, 모기지, 재산세 종합 가이드',
    url: PAGE_URL,
    type: 'article',
    siteName: '이동네',
    locale: 'ko_KR',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: '뉴저지 부동산 완벽 가이드',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '뉴저지 부동산 완벽 가이드 2026',
    description: '매수 절차·시장 분석·한인 동네 Top 10·학군·재산세',
  },
}

interface PostSummary {
  id: string
  title: string
  thumbnail: string | null
  category: string
  created_at: string
}

export default async function NJRealEstatePillarPage() {
  const supabase = createServerSupabase()

  // 부동산 관련 카테고리 매거진 글 가져오기
  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, thumbnail, category, created_at')
    .eq('type', 'magazine')
    .eq('published', true)
    .in('category', ['realestate', 'finance', 'legal', 'construction', 'living'])
    .or('region.eq.ny,region.eq.all')
    .order('created_at', { ascending: false })
    .limit(30)

  const articles: PostSummary[] = posts || []
  const byCategory = (cat: string) => articles.filter(a => a.category === cat).slice(0, 4)

  // JSON-LD: Article + BreadcrumbList + FAQPage
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: '뉴저지 부동산 완벽 가이드 2026',
    description: '뉴저지 부동산 매수 절차, 시장 분석, 한인 동네 Top 10, 학군, 모기지, 재산세 종합 가이드',
    author: { '@type': 'Organization', name: '이동네' },
    publisher: {
      '@type': 'Organization',
      name: '이동네',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/apple-touch-icon.png`, width: 180, height: 180 },
    },
    datePublished: '2026-05-13T00:00:00+00:00',
    dateModified: new Date().toISOString(),
    mainEntityOfPage: { '@type': 'WebPage', '@id': PAGE_URL },
    image: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/og-image.png`,
      width: 1200,
      height: 630,
    },
    inLanguage: 'ko',
    articleSection: '부동산 가이드',
    keywords: '뉴저지 부동산, NJ 부동산, Bergen County, Palisades Park, Fort Lee',
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: '부동산 가이드', item: `${SITE_URL}/realestate` },
      { '@type': 'ListItem', position: 3, name: '뉴저지 부동산', item: PAGE_URL },
    ],
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '뉴저지 부동산 첫 매수 시 다운페이먼트는 얼마가 적당한가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '가능하면 매매가의 20%를 권장합니다. 20% 다운페이먼트 시 PMI(Private Mortgage Insurance)를 피할 수 있고 가장 좋은 모기지 금리를 받을 수 있습니다. 다만 첫 주택 매수자 평균 다운페이먼트는 6~10% 수준이며, FHA·VA 등 정부 보증 프로그램을 통해 3.5%까지 가능합니다.',
        },
      },
      {
        '@type': 'Question',
        name: '뉴저지에서 한인이 가장 많이 사는 동네는 어디인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Bergen County의 Palisades Park, Fort Lee, Cliffside Park, Edgewater가 한인 밀집 지역으로 꼽힙니다. Palisades Park는 인구의 약 50%가 한국계로 미국에서 한인 비율이 가장 높은 도시 중 하나입니다. 학군 좋은 동네로는 Tenafly, Demarest, Englewood Cliffs, Closter, Old Tappan이 인기입니다.',
        },
      },
      {
        '@type': 'Question',
        name: '뉴저지 재산세는 얼마나 비싼가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '뉴저지는 미국에서 평균 재산세율이 가장 높은 주로 유효세율 약 2.13%~2.49% 수준입니다. 시가 $800,000 주택의 경우 연간 약 $17,000~$20,000의 재산세를 부담합니다. 다만 학군이 좋은 Bergen County 지역은 세금이 높은 대신 공교육 품질이 우수해 사립학교 비용을 절약할 수 있습니다.',
        },
      },
      {
        '@type': 'Question',
        name: '뉴저지 부동산 매수 절차는 얼마나 걸리나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '일반적으로 매물 결정 후 closing까지 30~45일이 소요됩니다. Pre-approval 받기(1~2주) → 매물 둘러보기(수주~수개월) → Offer 제출 및 수락(1~3일) → 인스펙션·감정평가(2주) → 모기지 final approval(3~4주) → Closing의 순서를 거칩니다.',
        },
      },
      {
        '@type': 'Question',
        name: 'NJ에서 첫 주택을 매수할 때 어떤 보조 프로그램이 있나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'NJ Housing and Mortgage Finance Agency(NJHMFA)의 First-Time Homebuyer Program, Down Payment Assistance Program, FHA Loan, VA Loan(군 복무자), USDA Loan(농촌 지역) 등이 있습니다. 한인 모기지 브로커와 상담 시 본인 소득·신용 점수에 맞는 프로그램을 추천받을 수 있습니다.',
        },
      },
      {
        '@type': 'Question',
        name: '뉴저지 부동산 가격은 앞으로 어떻게 될까요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '2026년 5월 기준 NJ 중간 주택 가격은 약 $540,000으로 전년 대비 +4.2%, Bergen County는 $675,000으로 +5.1% 상승했습니다. 한인 인기 지역인 Palisades Park·Fort Lee는 매물 부족이 지속되어 가격 상승세가 유지될 가능성이 높습니다.',
        },
      },
      {
        '@type': 'Question',
        name: '뉴저지 부동산 매수 시 클로징 비용은 얼마인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '매매가의 2~5% 수준입니다. 주요 항목은 모기지 origination fee, 타이틀 보험, 감정평가비, 인스펙션비, NJ 부동산 양도세(매도자 부담), 변호사비(NJ는 보통 매수자도 변호사 선임), 첫 모기지 페이먼트 escrow 등입니다. $600,000 주택의 경우 약 $12,000~$30,000 발생.',
        },
      },
      {
        '@type': 'Question',
        name: '한인 부동산 에이전트를 통하면 어떤 장점이 있나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '한국어 소통, 한인 커뮤니티에 특화된 동네·학군 정보, 한국 본국에서 송금 받는 매수자에게 필요한 자금 출처 증명 절차 안내, 한인 모기지 브로커·변호사 네트워크 등 한인에게 필요한 종합 서비스를 받을 수 있습니다.',
        },
      },
    ],
  }

  const SectionLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} className="text-[#FF6B35] hover:underline font-medium">
      {children} →
    </Link>
  )

  const ArticleCard = ({ post }: { post: PostSummary }) => (
    <Link
      href={`/post/${post.id}`}
      className="block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
    >
      {post.thumbnail && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.thumbnail} alt={post.title} className="w-full h-32 object-cover" />
      )}
      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{post.title}</p>
      </div>
    </Link>
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <article className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* 브레드크럼 */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-[#FF6B35]">홈</Link>
          {' › '}
          <span>부동산 가이드</span>
          {' › '}
          <span className="text-gray-900">뉴저지 부동산</span>
        </nav>

        {/* 헤더 */}
        <header className="mb-10">
          <span className="inline-block px-3 py-1 bg-[#FF6B35] text-white text-xs font-semibold rounded-full mb-3">
            종합 가이드
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-3">
            뉴저지 부동산 완벽 가이드 2026
          </h1>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed">
            뉴저지 부동산 시장은 2026년 5월 기준 중간 주택 가격이 <strong className="text-gray-900">$540,000</strong>으로 전년 대비 4.2% 상승했습니다. Bergen County 한인 밀집 지역은 매물 부족과 학군 수요로 가격 상승세가 이어지고 있습니다. 본 가이드는 NJ 부동산 매수를 고려하시는 한인 가족이 알아야 할 시장 현황, 매수 절차, 모기지, 동네 선택, 학군, 세금까지 종합 정리한 자료입니다.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            업데이트: 2026년 5월 · 이동네 편집팀 · 약 15분 읽기
          </p>
        </header>

        {/* 목차 */}
        <nav className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-10">
          <h2 className="text-base font-semibold text-gray-900 mb-3">📋 목차</h2>
          <ol className="text-sm space-y-1.5 text-gray-700">
            <li><a href="#market" className="hover:text-[#FF6B35]">1. 2026년 뉴저지 부동산 시장 현황</a></li>
            <li><a href="#process" className="hover:text-[#FF6B35]">2. 뉴저지 부동산 매수 절차 6단계</a></li>
            <li><a href="#mortgage" className="hover:text-[#FF6B35]">3. 모기지·자금 조달 가이드</a></li>
            <li><a href="#towns" className="hover:text-[#FF6B35]">4. 한인 인기 동네 Top 10</a></li>
            <li><a href="#schools" className="hover:text-[#FF6B35]">5. 학군·교육 가이드</a></li>
            <li><a href="#taxes" className="hover:text-[#FF6B35]">6. 세금·재산세</a></li>
            <li><a href="#legal" className="hover:text-[#FF6B35]">7. 법률·계약 주의사항</a></li>
            <li><a href="#agents" className="hover:text-[#FF6B35]">8. 추천 한인 부동산 에이전트</a></li>
            <li><a href="#faq" className="hover:text-[#FF6B35]">9. 자주 묻는 질문 (FAQ)</a></li>
          </ol>
        </nav>

        {/* 1. 시장 현황 */}
        <section id="market" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. 2026년 뉴저지 부동산 시장 현황</h2>
          <div className="prose prose-gray max-w-none space-y-4 text-gray-800 leading-relaxed">
            <p>
              <strong>2026년 5월 NJ 부동산 시장 핵심 지표</strong>:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>NJ 전체 중간 주택 가격: <strong>$540,000</strong> (전년 대비 +4.2%)</li>
              <li>Bergen County 중간 가격: <strong>$675,000</strong> (+5.1%)</li>
              <li>Palisades Park 중간 가격: <strong>$720,000</strong> (+6.8%)</li>
              <li>Fort Lee 중간 가격: <strong>$695,000</strong> (+5.4%)</li>
              <li>평균 매물 체류 기간(DOM): <strong>22일</strong> (전국 평균 41일 대비 약 2배 빠름)</li>
              <li>매수자/매도자 비율: <strong>매도자 우위 시장</strong> (Bergen County는 매물 1건당 평균 5명 매수자 경쟁)</li>
            </ul>
            <p>
              NJ는 2024~2025년 금리 상승기에도 매물 부족이 가격을 떠받쳤습니다. 특히 한인 밀집 지역인 <strong>Palisades Park, Fort Lee, Cliffside Park, Edgewater, Englewood Cliffs</strong>는 학군 수요와 통근(맨해튼 30분 이내)으로 매물 공급이 수요를 따라가지 못하는 상황이 이어지고 있습니다.
            </p>
            <p>
              <strong>2026년 매수 전략 요약</strong>: 가격 협상 여지는 크지 않지만, 인스펙션과 모기지 조건에서 매수자에게 유리한 부분을 찾는 협상 전략이 효과적입니다. Pre-approval을 미리 받아 30~45일 closing이 가능한 매수자가 유리한 위치를 차지합니다.
            </p>
          </div>
          {byCategory('realestate').length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">📰 관련 매거진 기사</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {byCategory('realestate').map(p => <ArticleCard key={p.id} post={p} />)}
              </div>
            </div>
          )}
        </section>

        {/* 2. 매수 절차 */}
        <section id="process" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. 뉴저지 부동산 매수 절차 6단계</h2>
          <div className="space-y-5 text-gray-800 leading-relaxed">
            <div className="border-l-4 border-[#FF6B35] pl-4">
              <h3 className="font-semibold text-lg mb-1">Step 1. 모기지 사전 승인 (Pre-Approval) — 1~2주</h3>
              <p>은행 또는 모기지 브로커에 신용·소득·자산 서류를 제출하고 사전 승인을 받습니다. 매물 쇼핑 시 셀러에게 신뢰를 주는 핵심 문서로, NJ 시장에서는 거의 필수입니다. 한인 모기지 브로커를 이용하면 한국어 상담 + 본국 송금 자산 인정 등의 도움을 받을 수 있습니다.</p>
            </div>
            <div className="border-l-4 border-[#FF6B35] pl-4">
              <h3 className="font-semibold text-lg mb-1">Step 2. 매물 쇼핑 — 수주~수개월</h3>
              <p>한인 부동산 에이전트와 함께 동네·예산·학군 조건에 맞는 매물을 보러 다닙니다. NJ에서는 보통 매수자 에이전트와 매도자 에이전트가 따로 있고, 매수자 에이전트 비용은 셀러가 지불합니다. Bergen County 인기 매물은 리스팅 후 1주 내 다수 오퍼가 들어옵니다.</p>
            </div>
            <div className="border-l-4 border-[#FF6B35] pl-4">
              <h3 className="font-semibold text-lg mb-1">Step 3. 오퍼 제출 및 수락 — 1~3일</h3>
              <p>가격, closing 날짜, 컨티전시(financing, inspection, appraisal) 조건을 포함한 오퍼를 제출합니다. NJ는 보통 변호사 검토 기간(Attorney Review) 3일이 의무화되어 있어 양측이 변호사를 선임해 계약서를 다듬는 단계가 있습니다.</p>
            </div>
            <div className="border-l-4 border-[#FF6B35] pl-4">
              <h3 className="font-semibold text-lg mb-1">Step 4. 인스펙션 & 감정평가 — 2주</h3>
              <p>전문 인스펙터가 주택의 구조·기계·전기·배관·지붕·HVAC을 점검합니다. 비용은 보통 $500~$1,000. 중대한 결함 발견 시 가격 재협상 또는 셀러 수리 요청이 가능합니다. 별도로 모기지 회사가 감정평가사를 보내 시장가 평가를 진행합니다.</p>
            </div>
            <div className="border-l-4 border-[#FF6B35] pl-4">
              <h3 className="font-semibold text-lg mb-1">Step 5. 모기지 최종 승인 (Clear to Close) — 3~4주</h3>
              <p>은행이 모든 서류·감정평가·타이틀 보고서를 검토 후 최종 승인합니다. 이 기간 동안 신용도에 영향 주는 행위(신용카드 신규 발급, 큰 가전 구매, 직장 이직)를 절대 피해야 합니다.</p>
            </div>
            <div className="border-l-4 border-[#FF6B35] pl-4">
              <h3 className="font-semibold text-lg mb-1">Step 6. 클로징 (Closing) — 1일</h3>
              <p>변호사 사무실에서 모든 서류에 서명하고 매도자에게 자금이 송금됩니다. 매수자는 cashier&apos;s check 또는 wire transfer로 다운페이먼트와 클로징 비용을 준비해야 합니다. 클로징 직전 매물 최종 점검(walkthrough)을 통해 매물 상태를 확인합니다.</p>
            </div>
          </div>
          {byCategory('legal').length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">📰 매수 절차 관련 매거진</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {byCategory('legal').map(p => <ArticleCard key={p.id} post={p} />)}
              </div>
            </div>
          )}
        </section>

        {/* 3. 모기지 */}
        <section id="mortgage" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. 모기지·자금 조달 가이드</h2>
          <div className="space-y-4 text-gray-800 leading-relaxed">
            <p>
              2026년 5월 기준 뉴저지 부동산 모기지 평균 금리:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>30년 고정 (Conventional): <strong>연 5.8~6.5%</strong></li>
              <li>15년 고정: <strong>연 5.2~5.8%</strong></li>
              <li>5/1 ARM (변동): <strong>연 5.4~6.0%</strong></li>
              <li>점보 모기지 ($806,500 초과 Bergen County): <strong>연 5.8~6.8%</strong></li>
            </ul>
            <p>
              <strong>다운페이먼트 권장</strong>: 20% (PMI 회피, 최적 금리). 첫 주택 매수자 평균 6~10%, FHA 대출은 3.5%까지 가능. 한국 본국에서 송금 받는 자금은 60일치 통장 명세서와 송금 증빙(Gift Letter)을 준비해야 모기지 회사가 자산으로 인정합니다.
            </p>
            <p>
              <strong>신용 점수 기준</strong>: FICO 740점 이상이 가장 좋은 금리 구간. 700~739는 0.125~0.25%p 불리, 660 이하는 금리가 크게 오르거나 거절될 수 있습니다.
            </p>
            <p>
              <strong>DTI(부채 대비 소득) 기준</strong>: 일반적으로 43% 이하. 강한 자산 또는 보장 자산(Reserve)이 있으면 50%까지도 검토 가능합니다.
            </p>
          </div>
          {byCategory('finance').length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">📰 모기지·자금 관련 매거진</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {byCategory('finance').map(p => <ArticleCard key={p.id} post={p} />)}
              </div>
            </div>
          )}
          <div className="mt-6">
            <SectionLink href="/mortgage">뉴저지 한인 모기지 브로커 보기</SectionLink>
          </div>
        </section>

        {/* 4. 한인 인기 동네 */}
        <section id="towns" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. 한인 인기 동네 Top 10</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Bergen County 일대의 한인 밀집 지역과 학군이 우수해 한인 가족이 선호하는 동네를 정리했습니다.
          </p>
          <div className="space-y-5 text-gray-800 leading-relaxed">
            {[
              { name: 'Palisades Park', kor: '팰리세이드 파크', price: '$720K', features: '한인 비율 약 50%, 한인 상가·식당 밀집, 통근 편리(GWB 인접), 학군 평균' },
              { name: 'Fort Lee', kor: '포트 리', price: '$695K', features: '맨해튼 직통 버스·페리, 콘도·고층 아파트 다수, 한인 상가 풍부' },
              { name: 'Englewood Cliffs', kor: '잉글우드 클리프스', price: '$1.2M', features: '학군 최상위, 한인 부유층 선호, 단독주택 위주, LG북미 본사 인접' },
              { name: 'Tenafly', kor: '테너플라이', price: '$1.1M', features: '학군 NJ Top 5, 한인 의사·전문직 다수, 조용한 주거 환경' },
              { name: 'Cliffside Park', kor: '클리프사이드 파크', price: '$685K', features: '한인 인구 빠르게 증가, 신축 콘도 다수, GWB 인접' },
              { name: 'Edgewater', kor: '에지워터', price: '$780K', features: '허드슨강 전망, 신축 고급 콘도, 한인 부유층 선호, 통근 편리' },
              { name: 'Demarest', kor: '드마레스트', price: '$1.0M', features: '학군 최상위, 한인 학구 가족 다수, 큰 단독주택' },
              { name: 'Closter', kor: '클로스터', price: '$950K', features: '학군 우수, Tenafly 인접, 조용한 가족 동네' },
              { name: 'Old Tappan', kor: '올드 태판', price: '$880K', features: '학군 우수, 한인 이주 증가, 잘 정돈된 단독주택' },
              { name: 'Englewood', kor: '잉글우드', price: '$650K', features: '다양한 가격대, 도심·상업지구·주택가 혼재, 다양한 학군' },
            ].map((town, i) => (
              <div key={town.name} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">
                    <span className="text-[#FF6B35] mr-2">{i + 1}.</span>
                    {town.name} <span className="text-gray-500 font-normal text-base">({town.kor})</span>
                  </h3>
                  <span className="text-sm font-medium text-gray-700 whitespace-nowrap">중간가 {town.price}</span>
                </div>
                <p className="text-sm text-gray-600">{town.features}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. 학군 */}
        <section id="schools" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. 학군·교육 가이드</h2>
          <div className="space-y-4 text-gray-800 leading-relaxed">
            <p>
              한인 가족의 NJ 부동산 매수 결정에서 학군은 가장 중요한 요소 중 하나입니다. NJ는 미국 전국 학군 평가에서 항상 상위권에 위치하며, 특히 Bergen County는 NJ 내에서도 우수 학군이 집중되어 있습니다.
            </p>
            <p className="font-semibold text-gray-900">NJ 한인 학부모 선호 학군 (GreatSchools 기준 9~10점):</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li><strong>Tenafly Public Schools</strong> — Bergen County 최상위, 대학 진학률 매우 높음</li>
              <li><strong>Northern Valley Regional High School District</strong> (Demarest, Closter, Old Tappan, Norwood, Harrington Park) — 5개 도시 공동 운영</li>
              <li><strong>Cresskill Public Schools</strong> — 한인 비율 높음, 학구 우수</li>
              <li><strong>Englewood Cliffs Public Schools</strong> — 작은 학구지만 고등학교는 Northern Valley로 통학</li>
              <li><strong>Ridgewood Public Schools</strong> — 전통 명문 학구</li>
              <li><strong>Glen Rock Public Schools</strong> — 상승하는 학구</li>
              <li><strong>Bergen County Academies</strong> (Hackensack) — 매그닛 영재 학교, NJ 최상위</li>
            </ul>
            <p>
              <strong>학군 정보 확인 방법</strong>: GreatSchools.org, Niche.com에서 학교별 평점 확인. 학군은 매물 가격에 직결되므로 매수 전 본인 자녀가 다닐 정확한 초·중·고등학교를 학구 사무실에 확인하는 것이 필수입니다.
            </p>
          </div>
        </section>

        {/* 6. 세금 */}
        <section id="taxes" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. 세금·재산세</h2>
          <div className="space-y-4 text-gray-800 leading-relaxed">
            <p>
              <strong>뉴저지는 미국에서 평균 재산세가 가장 높은 주</strong>입니다. 유효 재산세율은 약 2.13~2.49% 수준이며, Bergen County 인기 동네는 2.0~2.8% 사이로 분포합니다.
            </p>
            <p className="font-semibold text-gray-900">2026년 NJ 주요 동네 재산세 예시 (시가 $700K 단독주택 기준):</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Palisades Park: 연 약 <strong>$15,000~$17,000</strong></li>
              <li>Fort Lee: 연 약 <strong>$14,000~$16,000</strong></li>
              <li>Tenafly: 연 약 <strong>$18,000~$22,000</strong></li>
              <li>Englewood Cliffs: 연 약 <strong>$12,000~$14,000</strong> (재산세 상대적으로 낮은 편)</li>
              <li>Demarest: 연 약 <strong>$19,000~$23,000</strong></li>
            </ul>
            <p>
              <strong>재산세 절감 전략</strong>:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li><strong>Tax Appeal</strong>: 매년 1월~4월 평가 가액 이의 제기 가능. 변호사 또는 전문 어필 회사 이용 시 인하 성공률 50% 이상</li>
              <li><strong>Senior Freeze</strong> (PTR): 65세 이상 일정 소득 이하 신청 시 재산세 동결</li>
              <li><strong>Homestead Rebate / ANCHOR</strong>: NJ 주민세 보조 프로그램, 신청 필수</li>
              <li><strong>Veteran Deduction</strong>: 군 복무자 연 $250 공제</li>
            </ul>
            <p>
              <strong>연방 세금 공제</strong>: 모기지 이자(첫 $750,000까지)와 재산세(SALT $10,000 한도)는 연방 소득세 itemized deduction 가능합니다. 다만 SALT 한도 때문에 NJ 고가 주택 소유자는 재산세 일부만 공제됩니다.
            </p>
          </div>
        </section>

        {/* 7. 법률 */}
        <section id="legal" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. 법률·계약 주의사항</h2>
          <div className="space-y-4 text-gray-800 leading-relaxed">
            <p>
              <strong>변호사 선임 의무 (Attorney Review)</strong>: NJ는 매수·매도자 모두 변호사 선임이 사실상 필수입니다. 계약서 서명 후 3일간 변호사가 검토하며, 이 기간에 어느 한쪽도 페널티 없이 계약 취소가 가능합니다. 변호사 비용은 일반적으로 $800~$1,500.
            </p>
            <p>
              <strong>주요 계약 컨티전시</strong> (계약 조건):
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li><strong>Mortgage Contingency</strong> (모기지 조건부): 모기지 거절 시 다운페이먼트 환불 가능. 보통 30일</li>
              <li><strong>Inspection Contingency</strong> (인스펙션 조건부): 인스펙션 결과 만족스럽지 않을 시 재협상·계약 취소 가능. 보통 10~14일</li>
              <li><strong>Appraisal Contingency</strong> (감정평가 조건부): 감정가가 매매가에 미달 시 재협상 가능</li>
              <li><strong>Title Contingency</strong>: 타이틀 문제 발견 시 계약 취소 가능</li>
            </ul>
            <p>
              <strong>타이틀 보험</strong>: Owner&apos;s Policy (매수자 본인 보호용)와 Lender&apos;s Policy (모기지 회사 보호용) 두 가지. NJ에서는 매수자가 둘 다 부담하는 것이 일반적이며, 매매가의 약 0.5% 수준입니다.
            </p>
            <p>
              <strong>NJ 부동산 양도세 (Realty Transfer Fee)</strong>: 매도자 부담. 매매가에 따라 약 0.4~1.0%. $1M 초과 매수자는 추가로 1% 맨션세(Mansion Tax)를 부담합니다.
            </p>
          </div>
        </section>

        {/* 8. 추천 에이전트 */}
        <section id="agents" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. 추천 한인 부동산 에이전트</h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            이동네에 등록된 NJ 한인 부동산 에이전트는 Bergen County 전 지역 매물을 다루며, 한국어 상담·한인 모기지 브로커 네트워크·학군 안내 등 한인 가족 맞춤 서비스를 제공합니다.
          </p>
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-5">
            <p className="text-gray-800 font-medium mb-3">
              👉 NJ 한인 부동산 에이전트 전체 디렉토리에서 지역·전문분야별로 검색하실 수 있습니다.
            </p>
            <Link
              href="/realtors"
              className="inline-block bg-[#FF6B35] hover:bg-[#e55a2b] text-white font-semibold px-6 py-2.5 rounded-lg transition"
            >
              에이전트 전체 보기
            </Link>
          </div>
        </section>

        {/* 9. FAQ */}
        <section id="faq" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">9. 자주 묻는 질문 (FAQ)</h2>
          <div className="space-y-5">
            {faqLd.mainEntity.map((q, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="font-semibold text-gray-900 mb-2">Q. {q.name}</h3>
                <p className="text-gray-700 leading-relaxed text-sm">{q.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 관련 가이드 */}
        <section className="mb-8 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">관련 가이드 & 디렉토리</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link href="/realestate/ny" className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition">
              <p className="font-semibold text-gray-900">뉴욕 부동산 완벽 가이드</p>
              <p className="text-sm text-gray-600 mt-1">NY 매수 절차·동네·학군·세금 종합</p>
            </Link>
            <Link href="/realtors" className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition">
              <p className="font-semibold text-gray-900">한인 부동산 에이전트</p>
              <p className="text-sm text-gray-600 mt-1">NY·NJ 등록 에이전트 전체</p>
            </Link>
            <Link href="/mortgage" className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition">
              <p className="font-semibold text-gray-900">한인 모기지 브로커</p>
              <p className="text-sm text-gray-600 mt-1">NY·NJ 모기지 전문가</p>
            </Link>
            <Link href="/lawyers" className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition">
              <p className="font-semibold text-gray-900">한인 부동산 변호사</p>
              <p className="text-sm text-gray-600 mt-1">계약 검토·closing 전문</p>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">뉴저지 부동산 매수 준비를 시작하세요</h2>
          <p className="text-gray-300 mb-6">
            이동네에 등록된 한인 부동산 에이전트, 모기지 브로커, 변호사와 한국어로 상담받으세요.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/realtors"
              className="inline-block bg-[#FF6B35] hover:bg-[#e55a2b] text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              에이전트 찾기
            </Link>
            <Link
              href="/mortgage"
              className="inline-block bg-white hover:bg-gray-100 text-gray-900 font-semibold px-6 py-3 rounded-lg transition"
            >
              모기지 상담
            </Link>
          </div>
        </section>
      </article>
    </>
  )
}
