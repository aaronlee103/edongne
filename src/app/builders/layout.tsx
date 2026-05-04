import { Metadata } from 'next'
import { createServerSupabase } from '@/lib/supabase-server'

export const revalidate = 300

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.edongne.com'

export const metadata: Metadata = {
  title: '건축/인테리어 업체 찾기',
  description: '뉴욕, 뉴저지 지역 건축, 인테리어, 리모델링 전문 업체를 검색하세요. 포트폴리오와 리뷰를 확인하고 견적을 받아보세요.',
  keywords: '건축, 인테리어, 리모델링, 뉴욕 건축, 뉴저지 인테리어, 홈 리노베이션, contractor',
  openGraph: {
    title: '건축/인테리어 업체 찾기 | 이동네',
    description: '뉴욕, 뉴저지 지역 건축, 인테리어 전문 업체를 검색하세요.',
    type: 'website',
  },
}

export default async function BuildersLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase()
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, kor_name')
    .eq('type', 'builder')
    .or('status.is.null,status.eq.active')
    .order('sort_priority', { ascending: false })
    .limit(30)

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '건축/인테리어 업체',
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
      { '@type': 'ListItem', position: 2, name: '건축/인테리어' },
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
