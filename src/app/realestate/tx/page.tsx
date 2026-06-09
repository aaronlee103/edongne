import { Metadata } from 'next'
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase-server'

export const revalidate = 3600

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.edongne.com'
const PAGE_URL = `${SITE_URL}/realestate/tx`

export const metadata: Metadata = {
  title: '텍사스 부동산 완벽 가이드 2026: Carrollton·Plano·Frisco 한인 동네와 매수 절차',
  description: '텍사스 부동산 매수 절차, Dallas-Fort Worth(Carrollton·Plano·Frisco)와 Houston 한인 동네, 재산세, 무소득세 혜택, 학군까지 한인 매수자를 위한 종합 가이드.',
  keywords: '텍사스 부동산, Texas 부동산, Dallas 부동산, Plano 부동산, Frisco 부동산, Carrollton 부동산, Houston 부동산, Sugar Land 부동산, TX 한인 부동산, 텍사스 학군, 텍사스 재산세, 텍사스 무소득세',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: '텍사스 부동산 완벽 가이드 2026 | 이동네',
    description: 'Carrollton·Plano·Frisco·Sugar Land·Katy 한인 동네 + 매수 절차 + 학군 + 재산세 종합',
    url: PAGE_URL,
    type: 'article',
    siteName: '이동네',
    locale: 'ko_KR',
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: '텍사스 부동산 완벽 가이드' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '텍사스 부동산 완벽 가이드 2026',
    description: 'Carrollton·Plano·Frisco·Sugar Land 한인 동네·학군·재산세 완전 정리',
  },
}

interface PostSummary {
  id: string
  title: string
  thumbnail: string | null
  category: string
  created_at: string
}

export default async function TXRealEstatePillarPage() {
  const supabase = createServerSupabase()

  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, thumbnail, category, created_at')
    .eq('type', 'magazine')
    .eq('published', true)
    .in('category', ['realestate', 'finance', 'legal', 'construction', 'living'])
    .or('region.eq.dallas,region.eq.houston,region.eq.all')
    .order('created_at', { ascending: false })
    .limit(30)

  const articles: PostSummary[] = posts || []
  const byCategory = (cat: string) => articles.filter(a => a.category === cat).slice(0, 4)

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: '텍사스 부동산 완벽 가이드 2026',
    description: '텍사스 부동산 매수 절차, Dallas-Fort Worth·Houston 한인 동네, 무소득세 혜택, 학군, 재산세 종합 가이드',
    author: { '@type': 'Organization', name: '이동네' },
    publisher: {
      '@type': 'Organization',
      name: '이동네',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/apple-touch-icon.png`, width: 180, height: 180 },
    },
    datePublished: '2026-06-09T00:00:00+00:00',
    dateModified: new Date().toISOString(),
    mainEntityOfPage: { '@type': 'WebPage', '@id': PAGE_URL },
    image: { '@type': 'ImageObject', url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 },
    inLanguage: 'ko',
    articleSection: '부동산 가이드',
    keywords: '텍사스 부동산, Carrollton, Plano, Frisco, Sugar Land, Katy',
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: '부동산 가이드', item: `${SITE_URL}/realestate` },
      { '@type': 'ListItem', position: 3, name: '텍사스 부동산', item: PAGE_URL },
    ],
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '텍사스 부동산이 한인에게 매력적인 이유는?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '텍사스는 미국에서 9개 주뿐인 무소득세(No State Income Tax) 주 중 하나로, 같은 연봉이라도 NY/CA 대비 실수령액이 5~13% 더 많습니다. 또한 NY/NJ 대비 평균 주택 가격이 약 30~40% 저렴하면서 학군 우수 지역(Plano, Frisco, Sugar Land) 인프라가 발달했고, Carrollton·Plano·Sugar Land·Spring Branch 등에 한인 마트(H Mart, 한국식당, 학원, 교회)가 풍부합니다.',
        },
      },
      {
        '@type': 'Question',
        name: '텍사스에서 한인이 가장 많이 사는 동네는?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Dallas-Fort Worth 지역의 Carrollton(달라스 한인타운), Plano, Frisco, Coppell이 가장 한인 밀집 지역입니다. Houston은 Sugar Land(Sweetwater), Katy(Cinco Ranch), Spring Branch(휴스턴 한인타운), Pearland 지역에 한인이 많이 거주합니다.',
        },
      },
      {
        '@type': 'Question',
        name: '텍사스 재산세는 얼마나 높은가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '텍사스 유효 재산세율은 약 1.6~2.5% 수준으로 NJ(2.13%)와 비슷하거나 약간 낮습니다. 다만 주 소득세가 0%이므로 전체 세금 부담은 NJ·NY 대비 크게 적습니다. Homestead Exemption(주거주 공제) 신청 시 평가가액에서 일정 금액을 차감받을 수 있고, 65세 이상 또는 장애인은 추가 공제가 가능합니다.',
        },
      },
      {
        '@type': 'Question',
        name: '텍사스 부동산 매수 절차는 어떻게 되나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '일반적으로 30~40일이 소요됩니다. Pre-approval(1~2주) → 매물 결정 → Offer + 1~3% Earnest Money 예치 → Option Period(보통 7~10일, 매수자가 자유롭게 계약 취소 가능) → 인스펙션·감정평가 → 모기지 최종 승인 → Closing 순서. 텍사스는 NJ와 달리 변호사 의무가 아니며 보통 Title Company가 closing 절차를 진행합니다.',
        },
      },
      {
        '@type': 'Question',
        name: '텍사스 학군은 어디가 좋은가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Plano ISD, Frisco ISD, Carroll ISD(Southlake), Coppell ISD, Lovejoy ISD가 Dallas-Fort Worth 최상위 학구입니다. Houston은 Katy ISD, Fort Bend ISD(Sugar Land), Tomball ISD가 우수합니다. 한국·아시아계 학부모 비율이 높은 학구는 Plano, Frisco, Carrollton, Sugar Land, Katy 학구입니다.',
        },
      },
      {
        '@type': 'Question',
        name: '텍사스 부동산 가격은 어떻게 변하고 있나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '2026년 5월 기준 Dallas-Fort Worth 중간 가격 약 $415K, Houston 약 $345K, Austin 약 $545K. 한인 인기 지역인 Plano $580K, Frisco $620K, Carrollton $475K, Sugar Land $520K, Katy $450K. 2024~2026년 매년 3~5% 안정적 상승. NY/NJ 대비 매물 회전이 빠르고 신축 단지가 많아 매수자 선택권이 풍부합니다.',
        },
      },
      {
        '@type': 'Question',
        name: '캘리포니아·뉴욕에서 텍사스로 이주할 때 주의점은?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '주 소득세 0%로 실수령액이 늘지만, 텍사스 재산세는 NJ만큼 높으니 총 세금 부담을 비교하세요. 운전 중심 도시(공공교통 약함), 여름 기온 100°F+, 토네이도·우박 보험 필수. 단점보다 장점이 많지만, 이주 후 첫해는 적응이 필요합니다. NY/CA에서 가져온 자금을 텍사스 부동산에 투자하는 경우, 1031 Exchange 활용 시 양도세 이연 가능합니다.',
        },
      },
    ],
  }

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <article className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-[#FF6B35]">홈</Link>
          {' › '}
          <span>부동산 가이드</span>
          {' › '}
          <span className="text-gray-900">텍사스 부동산</span>
        </nav>

        <header className="mb-10">
          <span className="inline-block px-3 py-1 bg-[#FF6B35] text-white text-xs font-semibold rounded-full mb-3">
            종합 가이드
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-3">
            텍사스 부동산 완벽 가이드 2026
          </h1>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed">
            텍사스는 미국에서 한인 인구가 빠르게 증가하는 주 중 하나입니다. <strong className="text-gray-900">무소득세(No State Income Tax)</strong>로 같은 연봉 대비 실수령액이 많고, NY/CA보다 30~40% 저렴한 주택 가격, 우수한 학군(Plano·Frisco·Carroll·Coppell·Katy ISD), 그리고 Carrollton·Sugar Land·Spring Branch에 형성된 한인 인프라가 매력 요소입니다. 본 가이드는 텍사스 부동산을 고려하시는 한인 가족이 알아야 할 시장 현황, 매수 절차, 동네, 학군, 세금까지 종합 정리했습니다.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            업데이트: 2026년 6월 · 이동네 편집팀 · 약 15분 읽기
          </p>
        </header>

        <nav className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-10">
          <h2 className="text-base font-semibold text-gray-900 mb-3">📋 목차</h2>
          <ol className="text-sm space-y-1.5 text-gray-700">
            <li><a href="#why-texas" className="hover:text-[#FF6B35]">1. 왜 텍사스인가 — 무소득세 + 학군 + 한인 인프라</a></li>
            <li><a href="#market" className="hover:text-[#FF6B35]">2. 2026년 텍사스 부동산 시장 현황</a></li>
            <li><a href="#dfw" className="hover:text-[#FF6B35]">3. Dallas-Fort Worth 한인 동네 Top 7</a></li>
            <li><a href="#houston" className="hover:text-[#FF6B35]">4. Houston 한인 동네 Top 5</a></li>
            <li><a href="#process" className="hover:text-[#FF6B35]">5. 텍사스 매수 절차 6단계</a></li>
            <li><a href="#schools" className="hover:text-[#FF6B35]">6. 학군 가이드</a></li>
            <li><a href="#taxes" className="hover:text-[#FF6B35]">7. 세금 — 무소득세 vs 높은 재산세</a></li>
            <li><a href="#moving" className="hover:text-[#FF6B35]">8. NY/CA에서 이주 시 체크리스트</a></li>
            <li><a href="#faq" className="hover:text-[#FF6B35]">9. 자주 묻는 질문 (FAQ)</a></li>
          </ol>
        </nav>

        <section id="why-texas" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. 왜 텍사스인가 — 무소득세 + 학군 + 한인 인프라</h2>
          <div className="space-y-4 text-gray-800 leading-relaxed">
            <p><strong>무소득세 (No State Income Tax)</strong>:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>텍사스는 미국 9개 무소득세 주 중 하나 (TX, FL, NV, WA, TN, SD, AK, WY, NH)</li>
              <li>NJ 주 소득세 최고 10.75%, NY 10.9%, CA 13.3% — 텍사스 0%</li>
              <li>연봉 $200K 가족 기준: NY/CA 대비 연 $15,000~$25,000 절감</li>
              <li>다만 재산세가 1.6~2.5%로 높은 편이라 종합 세금 부담은 균형 맞춤</li>
            </ul>
            <p><strong>주택 가격 격차</strong>:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>NJ Tenafly 중간 $1.1M vs TX Plano 중간 $580K — 약 47% 저렴</li>
              <li>NJ Bergen County 단독 평균 $675K vs TX DFW $415K — 약 39% 저렴</li>
              <li>같은 예산으로 더 큰 집(평균 평방피트 +30%) + 더 큰 마당</li>
            </ul>
            <p><strong>학군</strong>: Plano ISD, Frisco ISD, Carroll ISD(Southlake)는 미국 전국 학구 평가 Top 50권. 한인 학부모 비율이 높아 한국어 학원·SAT 학원 인프라 발달.</p>
            <p><strong>한인 인프라</strong>: Carrollton에 H Mart·Komart·한국 식당가, Plano에 한인 학원·교회 밀집. Sugar Land Sweetwater 지역도 한인 커뮤니티 형성.</p>
          </div>
        </section>

        <section id="market" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. 2026년 텍사스 부동산 시장 현황</h2>
          <div className="space-y-4 text-gray-800 leading-relaxed">
            <p><strong>2026년 6월 주요 지역 중간 가격</strong>:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Dallas-Fort Worth(DFW) 전체: <strong>$415,000</strong> (+3.5% YoY)</li>
              <li>Houston: <strong>$345,000</strong> (+2.8%)</li>
              <li>Austin: <strong>$545,000</strong> (+1.2%)</li>
              <li>Plano: <strong>$580,000</strong> (+4.1%)</li>
              <li>Frisco: <strong>$620,000</strong> (+4.5%)</li>
              <li>Carrollton: <strong>$475,000</strong> (+3.8%)</li>
              <li>Sugar Land: <strong>$520,000</strong> (+3.2%)</li>
              <li>Katy(Cinco Ranch): <strong>$450,000</strong> (+3.5%)</li>
              <li>Coppell: <strong>$640,000</strong> (+4.2%)</li>
            </ul>
            <p><strong>특징</strong>: NY/NJ 대비 매물 회전이 빠릅니다(평균 DOM 28일). 신축 단지가 많아 매수자 선택권이 넓고, Builder Incentives(빌더 측 금리 매수자 부담 일부 지원)도 자주 제공됩니다. 텍사스 인구 유입(연 40만 명)이 가격 상승의 주요 동력입니다.</p>
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

        <section id="dfw" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Dallas-Fort Worth 한인 동네 Top 7</h2>
          <div className="space-y-5 text-gray-800 leading-relaxed">
            {[
              { name: 'Carrollton', kor: '캐럴튼', price: '$475K', features: 'DFW 한인타운, H Mart·한국 식당·학원 밀집, Carrollton-Farmers Branch ISD, 통근 편리(35분 다운타운)' },
              { name: 'Plano', kor: '플레이노', price: '$580K', features: 'Plano ISD 최우수 학군, 한국·아시아계 학부모 비율 높음, Toyota·JCPenney 본사 인접, 한인 인프라 풍부' },
              { name: 'Frisco', kor: '프리스코', price: '$620K', features: 'Frisco ISD Top 학군, Dallas Cowboys 본사, 신축 단지 다수, 한인 인구 빠르게 증가' },
              { name: 'Coppell', kor: '코펠', price: '$640K', features: 'Coppell ISD 학군 매우 우수, 조용한 가족 동네, DFW 공항 인접, 한인 의사·전문직 선호' },
              { name: 'Southlake', kor: '사우스레이크', price: '$1.1M', features: 'Carroll ISD 텍사스 최상위 학군, 한인 부유층 선호, 큰 단독주택, 평균 lot 0.5에이커+' },
              { name: 'Allen', kor: '앨런', price: '$475K', features: 'Allen ISD 우수, 신축 단지 위주, Plano 인접, 가족 동네' },
              { name: 'McKinney', kor: '맥키니', price: '$455K', features: 'McKinney ISD, Plano·Frisco보다 저렴, 다운타운 매력 있음, 한인 인구 증가' },
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

        <section id="houston" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Houston 한인 동네 Top 5</h2>
          <div className="space-y-5 text-gray-800 leading-relaxed">
            {[
              { name: 'Sugar Land', kor: '슈가랜드', price: '$520K', features: 'Fort Bend ISD 우수, Sweetwater 지역 한인 밀집, 의료·전문직 다수, 다운타운 휴스턴 30분' },
              { name: 'Katy (Cinco Ranch)', kor: '케이티', price: '$450K', features: 'Katy ISD 우수, Cinco Ranch 신축 단지 많음, 한국 마트·식당, 가족 동네' },
              { name: 'Spring Branch', kor: '스프링 브랜치', price: '$385K', features: '휴스턴 한인타운, 한국 마트·식당·학원 집중, 다운타운 휴스턴 인접, 다양한 가격대' },
              { name: 'Pearland', kor: '펄랜드', price: '$365K', features: 'Pearland ISD, 한인 인구 증가, NASA 인접, Medical Center 통근' },
              { name: 'Cypress', kor: '사이프러스', price: '$340K', features: 'Cy-Fair ISD, Tomball ISD 인접, 가족 동네, 신축 단지 다수' },
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

        <section id="process" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. 텍사스 매수 절차 6단계</h2>
          <div className="space-y-5 text-gray-800 leading-relaxed">
            <div className="border-l-4 border-[#FF6B35] pl-4">
              <h3 className="font-semibold text-lg mb-1">Step 1. 모기지 사전 승인 (Pre-Approval) — 1~2주</h3>
              <p>한인 모기지 브로커 또는 은행에서 사전 승인. 텍사스 매물 시장이 빠르므로 사전 승인 필수.</p>
            </div>
            <div className="border-l-4 border-[#FF6B35] pl-4">
              <h3 className="font-semibold text-lg mb-1">Step 2. 매물 쇼핑 — 수주</h3>
              <p>한인 부동산 에이전트와 함께 동네·학군·예산 조건에 맞는 매물 탐색. DFW는 신축 단지가 많아 builder 직거래도 옵션.</p>
            </div>
            <div className="border-l-4 border-[#FF6B35] pl-4">
              <h3 className="font-semibold text-lg mb-1">Step 3. Offer + Earnest Money — 1~3일</h3>
              <p>오퍼와 함께 매매가의 <strong>1~3% Earnest Money</strong>를 Title Company에 예치. NJ의 10% 다운페이먼트보다 훨씬 낮음.</p>
            </div>
            <div className="border-l-4 border-[#FF6B35] pl-4">
              <h3 className="font-semibold text-lg mb-1">Step 4. Option Period — 7~10일 (텍사스 특수)</h3>
              <p>텍사스만의 특이한 제도. 매수자가 보통 $100~$500 정도 Option Fee 내고 7~10일 동안 인스펙션·재협상·계약 취소 자유. 인스펙션 결과 마음에 안 들면 페널티 없이 빠질 수 있음.</p>
            </div>
            <div className="border-l-4 border-[#FF6B35] pl-4">
              <h3 className="font-semibold text-lg mb-1">Step 5. 모기지 최종 승인 + 감정평가 — 3~4주</h3>
              <p>모기지 회사가 감정평가·소득·자산 최종 검증.</p>
            </div>
            <div className="border-l-4 border-[#FF6B35] pl-4">
              <h3 className="font-semibold text-lg mb-1">Step 6. Closing — 1일</h3>
              <p>Title Company 사무실에서 진행. 변호사 의무 아님(NJ와 차이). 매수자 잔금 + closing 비용 wire transfer로 송금. 총 closing 비용 매매가의 2~3% 수준 (NJ 5~6%보다 적음).</p>
            </div>
          </div>
        </section>

        <section id="schools" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. 학군 가이드</h2>
          <div className="space-y-4 text-gray-800 leading-relaxed">
            <p className="font-semibold text-gray-900">DFW 최상위 학군 (GreatSchools 9~10점):</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li><strong>Plano ISD</strong> — SAT 평균 1280+, 아이비리그 진학자 다수, 한인·아시아계 학부모 25%+</li>
              <li><strong>Frisco ISD</strong> — 신생 학구이지만 빠르게 명문화, 시설 최신</li>
              <li><strong>Carroll ISD (Southlake)</strong> — 텍사스 전체 Top 5</li>
              <li><strong>Coppell ISD</strong> — 작은 학구지만 학력 매우 우수</li>
              <li><strong>Lovejoy ISD</strong> — 소수 정예 학구</li>
              <li><strong>Allen ISD</strong> — 대규모 학구지만 quality 유지</li>
              <li><strong>Eanes ISD (Austin)</strong> — Austin 최상위</li>
            </ul>
            <p className="font-semibold text-gray-900">Houston 우수 학군:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li><strong>Katy ISD</strong> — Cinco Ranch 지역 학교 최상위</li>
              <li><strong>Fort Bend ISD</strong> — Sugar Land 지역 우수</li>
              <li><strong>Tomball ISD</strong> — 북서부 신축 단지 인기</li>
              <li><strong>Pearland ISD</strong> — 안정적 우수</li>
            </ul>
            <p><strong>한인 학부모 팁</strong>: 텍사스는 학구별 zoning이 명확하지만 일부 학구는 transfer 가능. 매물 보기 전 zoning 확인 필수. Plano·Frisco·Katy ISD는 한국어 SAT/AP 학원도 풍부.</p>
          </div>
        </section>

        <section id="taxes" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. 세금 — 무소득세 vs 높은 재산세</h2>
          <div className="space-y-4 text-gray-800 leading-relaxed">
            <p><strong>주 소득세 0%</strong>: 연방세만 부담. NJ/NY/CA 대비 연 수천~수만 달러 절감.</p>
            <p><strong>재산세 1.6~2.5%</strong>: 시 + 카운티 + 학구 합산. NJ(2.13%)와 비슷. 동네별 편차 있음.</p>
            <p className="font-semibold text-gray-900">주요 동네 재산세 예시 (시가 $500K 단독 기준):</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Carrollton: 약 2.4% → 연 <strong>$12,000</strong></li>
              <li>Plano: 약 2.1% → 연 <strong>$10,500</strong></li>
              <li>Frisco: 약 2.3% → 연 <strong>$11,500</strong></li>
              <li>Coppell: 약 2.4% → 연 <strong>$12,000</strong></li>
              <li>Southlake: 약 2.1% → 연 <strong>$10,500</strong></li>
              <li>Sugar Land: 약 2.2% → 연 <strong>$11,000</strong></li>
              <li>Katy: 약 2.5% → 연 <strong>$12,500</strong></li>
            </ul>
            <p><strong>Homestead Exemption</strong>: 주거주 주택 신청 시 평가가액에서 $100,000 차감(2025년 기준). 매년 학구·시 기준 추가 공제 가능. <strong>매수 후 다음 해 1월 1일까지 신청 필수</strong>.</p>
            <p><strong>65세 이상 / 장애인 공제</strong>: Homestead 추가 차감 $10,000~$25,000. 또한 학구 재산세 동결 옵션도 있음.</p>
          </div>
        </section>

        <section id="moving" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. NY/CA에서 이주 시 체크리스트</h2>
          <div className="space-y-4 text-gray-800 leading-relaxed">
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li><strong>무소득세 효과 계산</strong>: 같은 연봉 기준 NY/CA 대비 실수령액 +5~13%</li>
              <li><strong>재산세 비교</strong>: NJ만큼 높음. 무소득세로 절감한 만큼 재산세로 빠짐. 그래도 총 세금 부담은 적음</li>
              <li><strong>운전 중심 도시</strong>: 공공교통 약함. 자동차 2대 가족이 일반적</li>
              <li><strong>여름 기온</strong>: 6~9월 평균 95~105°F. 에어컨 전기세 부담 큼</li>
              <li><strong>토네이도·우박 보험</strong>: Home Insurance 보험료 NJ의 2배 정도. 우박으로 지붕 교체 비용 보장 옵션 확인</li>
              <li><strong>홍수 보험</strong>: Houston 특히 필요. FEMA Flood Zone 확인 필수</li>
              <li><strong>1031 Exchange</strong>: NY/CA 부동산 매도 후 텍사스 부동산 매수 시 양도세 이연 가능</li>
              <li><strong>한국 식료품·식당</strong>: Carrollton·Sugar Land·Spring Branch에서 충분. Plano·Frisco·Katy도 H Mart 입점</li>
              <li><strong>의료</strong>: Houston Medical Center 미국 최대. DFW도 medical 인프라 충분</li>
              <li><strong>교회·종교 시설</strong>: 한인 교회 다수. 동네 선택 시 통학·교회 거리 함께 고려</li>
            </ul>
          </div>
        </section>

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

        <section className="mb-8 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">관련 가이드 & 디렉토리</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link href="/realestate/ny" className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition">
              <p className="font-semibold text-gray-900">뉴욕 부동산 완벽 가이드</p>
              <p className="text-sm text-gray-600 mt-1">NY 매수 절차·Co-op vs Condo·학군</p>
            </Link>
            <Link href="/realestate/nj" className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition">
              <p className="font-semibold text-gray-900">뉴저지 부동산 완벽 가이드</p>
              <p className="text-sm text-gray-600 mt-1">NJ 매수 절차·동네·재산세 종합</p>
            </Link>
            <Link href="/realtors" className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition">
              <p className="font-semibold text-gray-900">한인 부동산 에이전트</p>
              <p className="text-sm text-gray-600 mt-1">NY·NJ·TX 등록 에이전트</p>
            </Link>
            <Link href="/mortgage" className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition">
              <p className="font-semibold text-gray-900">한인 모기지 브로커</p>
              <p className="text-sm text-gray-600 mt-1">전국 모기지 전문가</p>
            </Link>
          </div>
        </section>

        <section className="bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">텍사스 부동산 매수 준비를 시작하세요</h2>
          <p className="text-gray-300 mb-6">
            이동네에 등록된 한인 부동산 에이전트, 모기지 브로커와 한국어로 상담받으세요.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/realtors" className="inline-block bg-[#FF6B35] hover:bg-[#e55a2b] text-white font-semibold px-6 py-3 rounded-lg transition">
              에이전트 찾기
            </Link>
            <Link href="/mortgage" className="inline-block bg-white hover:bg-gray-100 text-gray-900 font-semibold px-6 py-3 rounded-lg transition">
              모기지 상담
            </Link>
          </div>
        </section>
      </article>
    </>
  )
}
