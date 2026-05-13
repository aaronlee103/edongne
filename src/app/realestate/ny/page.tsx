import { Metadata } from 'next'
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase-server'

export const revalidate = 3600

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.edongne.com'
const PAGE_URL = `${SITE_URL}/realestate/ny`

export const metadata: Metadata = {
  title: '뉴욕 부동산 완벽 가이드 2026: Co-op vs Condo·매수 절차·한인 동네·학군',
  description: '뉴욕 부동산 매수 절차, Co-op과 Condo 차이, 한인 인기 동네(Flushing·Bayside·Great Neck), 학군, 모기지, 클로징 비용까지. NY 한인 부동산 전문 정보를 한 페이지에.',
  keywords: '뉴욕 부동산, NY 부동산, 뉴욕 한인 부동산, Flushing 부동산, Bayside 부동산, Great Neck 부동산, Manhasset 부동산, 뉴욕 코업, 뉴욕 콘도, 뉴욕 모기지, 뉴욕 학군',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: '뉴욕 부동산 완벽 가이드 2026 | 이동네',
    description: '뉴욕 부동산 Co-op vs Condo, 매수 절차, 한인 동네, 학군, 모기지 종합 가이드',
    url: PAGE_URL,
    type: 'article',
    siteName: '이동네',
    locale: 'ko_KR',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: '뉴욕 부동산 완벽 가이드',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '뉴욕 부동산 완벽 가이드 2026',
    description: 'Co-op vs Condo·매수 절차·한인 동네·학군',
  },
}

interface PostSummary {
  id: string
  title: string
  thumbnail: string | null
  category: string
  created_at: string
}

export default async function NYRealEstatePillarPage() {
  const supabase = createServerSupabase()

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

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: '뉴욕 부동산 완벽 가이드 2026',
    description: '뉴욕 부동산 Co-op vs Condo 차이, 매수 절차, 한인 인기 동네, 학군, 모기지, 클로징 비용 종합 가이드',
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
    keywords: '뉴욕 부동산, NY 부동산, Flushing, Bayside, Great Neck, Manhasset, Co-op, Condo',
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: '부동산 가이드', item: `${SITE_URL}/realestate` },
      { '@type': 'ListItem', position: 3, name: '뉴욕 부동산', item: PAGE_URL },
    ],
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '뉴욕 부동산에서 Co-op과 Condo 중 어느 것이 좋은가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Co-op은 주식 형태로 소유하며 가격이 상대적으로 저렴하고 월 유지비는 높지만 다운페이먼트 요구가 까다롭습니다(보통 20~25%, 일부 25% 이상). 보드 인터뷰·승인 필요. Condo는 부동산 직접 소유로 자유도 높고 외국인·투자자에게도 매도 가능하며 다운페이먼트 10~20% 가능합니다. 첫 매수자·실거주자는 Co-op이 가성비 좋고, 임대·재판매 자유도가 필요하면 Condo가 유리합니다.',
        },
      },
      {
        '@type': 'Question',
        name: '뉴욕에서 한인이 가장 많이 사는 동네는 어디인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Queens의 Flushing, Bayside, Murray Hill, Whitestone, Sunnyside, Long Island City가 한인 밀집 지역입니다. Long Island Nassau County의 Great Neck, Manhasset, Roslyn, Syosset, Jericho는 학군 좋아 한인 부유층이 선호합니다. Manhattan은 Upper East Side, Upper West Side, Tribeca에 한인 전문직 거주자가 많습니다.',
        },
      },
      {
        '@type': 'Question',
        name: '뉴욕 부동산 매수 시 클로징 비용은 얼마인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Condo의 경우 매매가의 약 4~6%, Co-op은 2~4% 수준입니다. 주요 항목은 모기지 origination fee, NY Mortgage Recording Tax(2.05%, Condo만), Mansion Tax($1M 초과 시 1~3.9% 누진), 변호사비, 타이틀 보험(Condo만), 인스펙션비, 첫 모기지 페이먼트 escrow 등입니다. $1.5M Condo의 경우 약 $60,000~$90,000.',
        },
      },
      {
        '@type': 'Question',
        name: '뉴욕 부동산 매수 절차는 얼마나 걸리나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Condo는 보통 매물 결정 후 60~90일, Co-op은 보드 승인 절차 때문에 90~120일이 소요됩니다. Pre-approval(1~2주) → 매물 결정 → 변호사 검토 후 계약(2~3주) → 다운페이먼트 10% 예치 → 인스펙션·감정평가(2주) → 모기지 final approval(4~6주) → (Co-op만) 보드 인터뷰(2~4주) → Closing 순서를 거칩니다.',
        },
      },
      {
        '@type': 'Question',
        name: '뉴욕 부동산 가격은 어떻게 변하고 있나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '2026년 5월 기준 NY 시 전체 중간 가격 약 $850,000, Manhattan 콘도 중간 $1.95M, Queens Flushing 콘도 중간 $720K, Long Island Great Neck 단독주택 중간 $1.4M 수준입니다. 코로나 이후 회복세로 2024~2026년 매년 3~6% 상승. 한인 인기 지역인 Queens·Long Island North Shore는 학군 수요로 견조한 상승세 유지.',
        },
      },
      {
        '@type': 'Question',
        name: '뉴욕 부동산 재산세는 얼마인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'NYC는 평가가액의 약 0.85~1.93%로 실제 시가 대비 유효세율은 약 0.4~1.5%입니다. Long Island Nassau County는 유효세율 약 2.0~2.5%로 NJ에 가깝게 높습니다. Manhattan Condo는 평가가액이 시가보다 낮게 책정되어 재산세 부담이 비교적 적은 편입니다. Mortgage Recording Tax(Condo 매수 시 2.05%)와 별개입니다.',
        },
      },
      {
        '@type': 'Question',
        name: 'Co-op 보드 인터뷰는 어떻게 준비하나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '보드 패키지(Board Package)에 W-2·세금 신고서·자산 증명·추천서·은행 잔액 등 30~50페이지 분량 서류를 제출합니다. 인터뷰는 30분~1시간으로 빌딩 거주 규칙 이해, 재정 상태, 거주 의도 등을 확인합니다. 정치·종교·논쟁적 화제 회피, 깔끔한 정장 착용, 빌딩에 대한 관심 표현이 필수입니다. 한인 부동산 에이전트는 보드 인터뷰 코칭도 함께 제공합니다.',
        },
      },
      {
        '@type': 'Question',
        name: '뉴욕에서 한국인 자녀 학군 좋은 곳은 어디인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Long Island Nassau County의 Great Neck, Manhasset, Jericho, Roslyn, Syosset, Herricks 학군이 NY 최상위입니다. Queens는 PS 41(Bayside), Stuyvesant·Bronx Science 같은 매그닛 고등학교 진학률이 높은 District 26(Bayside·Little Neck 지역)이 인기입니다. Manhattan은 PS 6(Lillie D. Blake) 같은 우수 공립학교 학군이 있습니다.',
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
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-[#FF6B35]">홈</Link>
          {' › '}
          <span>부동산 가이드</span>
          {' › '}
          <span className="text-gray-900">뉴욕 부동산</span>
        </nav>

        <header className="mb-10">
          <span className="inline-block px-3 py-1 bg-[#FF6B35] text-white text-xs font-semibold rounded-full mb-3">
            종합 가이드
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-3">
            뉴욕 부동산 완벽 가이드 2026
          </h1>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed">
            뉴욕 부동산은 미국에서 가장 복잡하고 독특한 시장입니다. <strong className="text-gray-900">Co-op과 Condo</strong>의 차이, 보드 승인 절차, Mansion Tax, Mortgage Recording Tax 등 다른 지역에는 없는 특수 사항이 많습니다. 본 가이드는 NY 부동산 매수를 고려하시는 한인 가족·전문직·투자자가 알아야 할 시장 구조, 매수 절차, 한인 인기 동네(Flushing·Bayside·Great Neck), 학군, 세금까지 종합 정리했습니다.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            업데이트: 2026년 5월 · 이동네 편집팀 · 약 18분 읽기
          </p>
        </header>

        <nav className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-10">
          <h2 className="text-base font-semibold text-gray-900 mb-3">📋 목차</h2>
          <ol className="text-sm space-y-1.5 text-gray-700">
            <li><a href="#market" className="hover:text-[#FF6B35]">1. 2026년 뉴욕 부동산 시장 현황</a></li>
            <li><a href="#coop-condo" className="hover:text-[#FF6B35]">2. Co-op vs Condo 완벽 비교</a></li>
            <li><a href="#process" className="hover:text-[#FF6B35]">3. 뉴욕 부동산 매수 절차</a></li>
            <li><a href="#mortgage" className="hover:text-[#FF6B35]">4. 모기지·자금 조달</a></li>
            <li><a href="#towns" className="hover:text-[#FF6B35]">5. 한인 인기 동네 Top 10</a></li>
            <li><a href="#schools" className="hover:text-[#FF6B35]">6. 학군·교육</a></li>
            <li><a href="#taxes" className="hover:text-[#FF6B35]">7. 세금·재산세·Mansion Tax</a></li>
            <li><a href="#agents" className="hover:text-[#FF6B35]">8. 추천 한인 부동산 에이전트</a></li>
            <li><a href="#faq" className="hover:text-[#FF6B35]">9. 자주 묻는 질문 (FAQ)</a></li>
          </ol>
        </nav>

        {/* 1. 시장 */}
        <section id="market" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. 2026년 뉴욕 부동산 시장 현황</h2>
          <div className="space-y-4 text-gray-800 leading-relaxed">
            <p>2026년 5월 기준 NY 주요 지역 중간 가격:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>NYC 전체 중간 가격: <strong>$850,000</strong> (+3.8% YoY)</li>
              <li>Manhattan Condo: <strong>$1,950,000</strong> (+4.2%)</li>
              <li>Manhattan Co-op: <strong>$880,000</strong> (+2.1%)</li>
              <li>Queens Flushing 콘도: <strong>$720,000</strong> (+5.6%)</li>
              <li>Queens Bayside 단독: <strong>$1,100,000</strong> (+6.1%)</li>
              <li>Long Island Great Neck: <strong>$1,400,000</strong> (+4.8%)</li>
              <li>Brooklyn 콘도: <strong>$950,000</strong> (+3.5%)</li>
            </ul>
            <p>
              <strong>2026년 NY 부동산 시장 요약</strong>: 코로나 이후 인구 유출이 멈추고 회복세 진입. 외국인·투자자 매수 활동이 다시 활발해지면서 Manhattan 고가 콘도 시장 회복. Queens·Long Island 한인 인기 지역은 학군 수요와 실거주 매수자 위주로 견조한 상승세 유지. 매물 부족 현상은 여전.
            </p>
            <p>
              <strong>매수 전략</strong>: Manhattan Condo는 외국인 매수자 비중이 높아 가격 협상 어려움. Queens·Long Island는 협상 여지 있으나 인기 학군 지역은 multiple offers 흔함. Pre-approval과 빠른 closing(Condo 60일, Co-op 100일) 가능한 매수자가 유리.
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

        {/* 2. Co-op vs Condo */}
        <section id="coop-condo" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Co-op vs Condo 완벽 비교</h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            뉴욕 부동산의 가장 큰 특징은 매물의 70% 이상이 <strong>Co-op(코퍼레이티브)</strong> 또는 <strong>Condo(콘도)</strong>라는 점입니다. 두 가지는 소유 구조부터 세금, 거주 자유도까지 모두 다릅니다.
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left">항목</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Co-op</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Condo</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border border-gray-300 px-3 py-2 font-semibold">소유 형태</td><td className="border border-gray-300 px-3 py-2">주식(shares) 소유</td><td className="border border-gray-300 px-3 py-2">부동산 직접 소유</td></tr>
                <tr><td className="border border-gray-300 px-3 py-2 font-semibold">가격대</td><td className="border border-gray-300 px-3 py-2">상대적 저렴 (Condo 대비 -30~40%)</td><td className="border border-gray-300 px-3 py-2">비쌈</td></tr>
                <tr><td className="border border-gray-300 px-3 py-2 font-semibold">다운페이먼트</td><td className="border border-gray-300 px-3 py-2">보통 20~25%, 일부 30%+</td><td className="border border-gray-300 px-3 py-2">10~20%</td></tr>
                <tr><td className="border border-gray-300 px-3 py-2 font-semibold">월 유지비(Maintenance)</td><td className="border border-gray-300 px-3 py-2">높음 (재산세 포함)</td><td className="border border-gray-300 px-3 py-2">중간 (Common Charge + 재산세 별도)</td></tr>
                <tr><td className="border border-gray-300 px-3 py-2 font-semibold">보드 승인</td><td className="border border-gray-300 px-3 py-2">필수, 거부 가능</td><td className="border border-gray-300 px-3 py-2">Right of First Refusal만</td></tr>
                <tr><td className="border border-gray-300 px-3 py-2 font-semibold">임대 자유도</td><td className="border border-gray-300 px-3 py-2">제한적 (보통 1~2년 후 가능)</td><td className="border border-gray-300 px-3 py-2">자유</td></tr>
                <tr><td className="border border-gray-300 px-3 py-2 font-semibold">외국인 매수</td><td className="border border-gray-300 px-3 py-2">대부분 불가</td><td className="border border-gray-300 px-3 py-2">가능</td></tr>
                <tr><td className="border border-gray-300 px-3 py-2 font-semibold">투자용 적합도</td><td className="border border-gray-300 px-3 py-2">낮음</td><td className="border border-gray-300 px-3 py-2">높음</td></tr>
                <tr><td className="border border-gray-300 px-3 py-2 font-semibold">클로징 비용</td><td className="border border-gray-300 px-3 py-2">매매가의 2~4%</td><td className="border border-gray-300 px-3 py-2">매매가의 4~6%</td></tr>
              </tbody>
            </table>
          </div>
          <div className="space-y-3 text-gray-800 leading-relaxed">
            <p><strong>한인 가족 추천</strong>:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li><strong>실거주 우선·예산 절약</strong> → Co-op (가성비 좋음, 가격 안정)</li>
              <li><strong>임대 가능성·재판매 자유 중요</strong> → Condo</li>
              <li><strong>외국인·비영주권자</strong> → Condo만 가능</li>
              <li><strong>한국 본국 송금 자금</strong> → Condo (Co-op 보드는 자금 출처 까다로움)</li>
            </ul>
          </div>
        </section>

        {/* 3. 매수 절차 */}
        <section id="process" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. 뉴욕 부동산 매수 절차</h2>
          <div className="space-y-5 text-gray-800 leading-relaxed">
            <div className="border-l-4 border-[#FF6B35] pl-4">
              <h3 className="font-semibold text-lg mb-1">Step 1. Pre-Approval — 1~2주</h3>
              <p>모기지 회사로부터 사전 승인. NY에서는 한국 본국 송금 자금이 있는 경우 자금 출처 증명(60일 통장 명세서, Gift Letter)을 미리 준비해야 합니다.</p>
            </div>
            <div className="border-l-4 border-[#FF6B35] pl-4">
              <h3 className="font-semibold text-lg mb-1">Step 2. 매물 쇼핑 — 수개월</h3>
              <p>Co-op/Condo/Townhouse/단독주택 중 선택. 한인 에이전트와 함께 빌딩 상태·관리비·보드 까다로움도 확인.</p>
            </div>
            <div className="border-l-4 border-[#FF6B35] pl-4">
              <h3 className="font-semibold text-lg mb-1">Step 3. Offer 제출 — 1~3일</h3>
              <p>NY는 Offer 단계에서 구두 협상이 일반적입니다. 합의 후 매수자 변호사가 매매 계약서(Contract of Sale)를 검토합니다.</p>
            </div>
            <div className="border-l-4 border-[#FF6B35] pl-4">
              <h3 className="font-semibold text-lg mb-1">Step 4. 계약 서명 + 10% 다운페이먼트 — 2~3주</h3>
              <p>변호사 검토 완료 후 매수자가 매매 계약서에 서명하고 매매가의 10%를 매도자 변호사 escrow에 예치합니다. NJ와 달리 Attorney Review 의무 기간이 없습니다.</p>
            </div>
            <div className="border-l-4 border-[#FF6B35] pl-4">
              <h3 className="font-semibold text-lg mb-1">Step 5. 인스펙션 & 감정평가 — 2주</h3>
              <p>Townhouse·단독주택은 매수 전 인스펙션 필수. Condo·Co-op은 보통 빌딩 자체는 인스펙션 안 하나 유닛 내부는 가능. 모기지 회사 감정평가 별도 진행.</p>
            </div>
            <div className="border-l-4 border-[#FF6B35] pl-4">
              <h3 className="font-semibold text-lg mb-1">Step 6. Co-op만 — Board Package + 인터뷰 — 2~4주</h3>
              <p>30~50페이지 분량 보드 패키지(재정·추천서·세금 신고서) 제출 후 인터뷰. 보드는 거부 권한이 있고 이유 설명 의무 없음. 한인 에이전트의 코칭이 매우 중요한 단계.</p>
            </div>
            <div className="border-l-4 border-[#FF6B35] pl-4">
              <h3 className="font-semibold text-lg mb-1">Step 7. Closing — 1일</h3>
              <p>변호사·은행·매도자·매수자가 한 자리에 모여 서류 서명. 매수자는 cashier&apos;s check 또는 wire transfer로 잔금 + closing 비용 지불. Condo는 보통 매수 후 60~90일, Co-op은 90~120일 소요.</p>
            </div>
          </div>
          {byCategory('legal').length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">📰 법률·계약 관련 매거진</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {byCategory('legal').map(p => <ArticleCard key={p.id} post={p} />)}
              </div>
            </div>
          )}
        </section>

        {/* 4. 모기지 */}
        <section id="mortgage" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. 모기지·자금 조달</h2>
          <div className="space-y-4 text-gray-800 leading-relaxed">
            <p>2026년 5월 기준 NY 모기지 평균 금리:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>30년 고정 Conventional: 연 <strong>5.8~6.5%</strong></li>
              <li>15년 고정: 연 <strong>5.2~5.8%</strong></li>
              <li>점보 모기지 ($806,500 초과): 연 <strong>5.8~6.8%</strong></li>
              <li>Co-op 전용 융자: 연 <strong>6.0~6.8%</strong> (Condo보다 약간 높음)</li>
            </ul>
            <p>
              <strong>NY 특수 — Mortgage Recording Tax</strong>: Condo·Townhouse·단독주택 매수 시 모기지 금액에 대해 약 2.05% 세금 부과. $1M 모기지의 경우 $20,500. Co-op은 부동산 직접 소유가 아니므로 해당 안 됨 (Co-op이 클로징 비용 적은 큰 이유).
            </p>
            <p>
              <strong>외국인·비영주권자 매수자</strong>: Foreign National Loan 가능. 다운페이먼트 30~40% + 미국 내 자산 증명 + 외화 환산 소득 증명 필요. 한인 모기지 브로커가 한국·캐나다 거주 한국인 전문 서비스 제공.
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
            <Link href="/mortgage" className="text-[#FF6B35] hover:underline font-medium">뉴욕 한인 모기지 브로커 보기 →</Link>
          </div>
        </section>

        {/* 5. 한인 인기 동네 */}
        <section id="towns" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. 한인 인기 동네 Top 10</h2>
          <div className="space-y-5 text-gray-800 leading-relaxed">
            {[
              { name: 'Flushing (Queens)', kor: '플러싱', price: '$720K (Condo)', features: 'NY 최대 한인 타운, 한인 상가·식당·병원 풍부, Q44 버스 통근, 가성비 좋음' },
              { name: 'Bayside (Queens)', kor: '베이사이드', price: '$1.1M (단독)', features: '학군 District 26 우수, 한인 부유층·전문직 선호, 조용한 주거 환경' },
              { name: 'Murray Hill (Queens)', kor: '머레이 힐', price: '$650K (Condo)', features: 'Flushing 동쪽 한인 거주지, LIRR 통근, 신축 콘도 다수' },
              { name: 'Whitestone (Queens)', kor: '화이트스톤', price: '$1.2M (단독)', features: '한인 비율 증가, Bayside 인접, 조용한 가족 동네' },
              { name: 'Great Neck (Nassau)', kor: '그레이트 넥', price: '$1.4M (단독)', features: '학군 NY Top 5, 한인 의사·변호사·전문직 다수, 맨해튼 LIRR 30분' },
              { name: 'Manhasset (Nassau)', kor: '맨해셋', price: '$1.6M (단독)', features: '학군 최상위, 한인 부유층 선호, 1에이커 단독주택 위주' },
              { name: 'Roslyn (Nassau)', kor: '로슬린', price: '$1.5M (단독)', features: '학군 우수, Great Neck 인접, 다양한 가격대' },
              { name: 'Jericho (Nassau)', kor: '제리코', price: '$1.3M (단독)', features: '학군 NY Top 10, 한인 인구 증가, 조용한 교외' },
              { name: 'Long Island City (Queens)', kor: '롱아일랜드 시티', price: '$1.05M (Condo)', features: '맨해튼 1정거장, 신축 고급 콘도, 한인 전문직 다수' },
              { name: 'Upper East Side (Manhattan)', kor: '어퍼 이스트 사이드', price: '$1.85M (Condo)', features: '한인 전문직·의사 선호, 상위 사립학교 인접' },
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

        {/* 6. 학군 */}
        <section id="schools" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. 학군·교육</h2>
          <div className="space-y-4 text-gray-800 leading-relaxed">
            <p>
              뉴욕 부동산 매수에서 학군은 가격을 결정하는 핵심 요소입니다. NY는 NJ 대비 학군 격차가 크며, 같은 동네 안에서도 학구 경계에 따라 가격이 10~20% 차이날 수 있습니다.
            </p>
            <p className="font-semibold text-gray-900">NY 한인 학부모 선호 학군 (GreatSchools 9~10점):</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li><strong>Great Neck UFSD</strong> (Nassau) — NY Top 3, SAT 평균 1370+</li>
              <li><strong>Manhasset UFSD</strong> (Nassau) — 대학 진학률 99%, 아이비리그 진학자 다수</li>
              <li><strong>Jericho UFSD</strong> (Nassau) — Newsweek 전국 Top 50 고등학교</li>
              <li><strong>Syosset CSD</strong> (Nassau) — 학구 규모 크고 시설 우수</li>
              <li><strong>Roslyn UFSD</strong> (Nassau) — 다양한 학구 옵션</li>
              <li><strong>Herricks UFSD</strong> (Nassau) — 한인 비율 매우 높음</li>
              <li><strong>NYC District 26</strong> (Bayside, Little Neck) — NYC 내 최우수 공립 학구</li>
              <li><strong>Stuyvesant·Bronx Science·Brooklyn Tech</strong> — NYC 매그닛 시험 입학 영재고</li>
            </ul>
            <p>
              <strong>학구 확인 필수</strong>: NYC는 학구가 복잡해 같은 거리 양쪽이 다른 학구일 수 있습니다. NYC DOE의 &quot;Find a School&quot; 도구로 정확한 주소별 학구를 확인하고, 매물 계약 전 학구 사무실에 자녀 등록 가능 여부를 직접 문의해야 합니다.
            </p>
          </div>
        </section>

        {/* 7. 세금 */}
        <section id="taxes" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. 세금·재산세·Mansion Tax</h2>
          <div className="space-y-4 text-gray-800 leading-relaxed">
            <p><strong>Mansion Tax (NY 특수 세금)</strong>:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>$1M 미만: 면제</li>
              <li>$1M ~ $1.99M: 매매가의 1%</li>
              <li>$2M ~ $2.99M: 1.25%</li>
              <li>$3M ~ $4.99M: 1.5%</li>
              <li>$5M ~ $9.99M: 2.25%</li>
              <li>$10M 이상: 3.9% (예: $15M Condo의 경우 Mansion Tax만 $585,000)</li>
            </ul>
            <p>매수자 부담. NYC + NY State 합산. 한인 매수자가 자주 놓치는 비용이므로 예산 계획 시 반드시 포함해야 함.</p>
            <p><strong>NYC 재산세</strong>: 평가가액(Assessed Value)의 0.85~1.93%. 시가 대비 유효세율은 약 0.4~1.5%로 NJ 대비 상대적으로 낮음. Manhattan 콘도는 평가가액이 시가의 약 6~10% 수준이라 재산세 부담이 매우 적은 경우 많음.</p>
            <p><strong>Long Island 재산세</strong>: Nassau County 유효세율 약 2.0~2.5%. Great Neck·Manhasset 단독주택의 재산세는 NJ 수준으로 높음. $1.4M Great Neck 단독주택의 경우 연간 약 $30,000~$35,000.</p>
            <p><strong>STAR(School Tax Relief)</strong>: NY 주민 학교 재산세 공제 프로그램. 매수 후 신청 필수.</p>
          </div>
        </section>

        {/* 8. 에이전트 */}
        <section id="agents" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. 추천 한인 부동산 에이전트</h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            이동네에 등록된 NY 한인 부동산 에이전트는 Queens(Flushing·Bayside)·Long Island(Great Neck·Manhasset)·Manhattan 전 지역 매물을 다루며, Co-op 보드 인터뷰 코칭·외국인 매수자 자금 출처 증명·한국 본국 송금 절차 안내 등 한인 매수자 특화 서비스를 제공합니다.
          </p>
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-5">
            <p className="text-gray-800 font-medium mb-3">
              👉 NY 한인 부동산 에이전트 전체 디렉토리에서 지역·전문분야별로 검색하실 수 있습니다.
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
            <Link href="/realestate/nj" className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition">
              <p className="font-semibold text-gray-900">뉴저지 부동산 완벽 가이드</p>
              <p className="text-sm text-gray-600 mt-1">NJ 매수 절차·동네·학군·재산세 종합</p>
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
          <h2 className="text-2xl font-bold mb-3">뉴욕 부동산 매수 준비를 시작하세요</h2>
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
