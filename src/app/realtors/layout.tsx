import { Metadata } from 'next'
import { createServerSupabase } from '@/lib/supabase-server'

export const revalidate = 300 // 5분마다 재생성

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.edongne.com'

export const metadata: Metadata = {
  title: '부동산 에이전트 찾기',
  description: '뉴욕, 뉴저지 지역 부동산 에이전트를 검색하세요. 전문 리얼터의 프로필, 전문분야, 리뷰를 확인하고 직접 연락하세요.',
  keywords: '부동산, 리얼터, 에이전트, 뉴욕 부동산, 뉴저지 부동산, 부동산 중개, realtor',
  openGraph: {
    title: '부동산 에이전트 찾기 | 이동네',
    description: '뉴욕, 뉴저지 지역 부동산 에이전트를 검색하세요.',
    type: 'website',
  },
}

export default async function RealtorsLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase()
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, kor_name, specialty, region, area')
    .eq('type', 'realtor')
    .or('status.is.null,status.eq.active')
    .order('sort_priority', { ascending: false })
    .limit(30)

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '부동산 에이전트',
    itemListElement: (businesses || []).map((biz, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/business/${biz.id}`,
      name: biz.kor_name,
    })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: '부동산 에이전트' },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {children}
    </>
  )
}
