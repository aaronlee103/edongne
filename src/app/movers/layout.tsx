import { Metadata } from 'next'
import { createServerSupabase } from '@/lib/supabase-server'

export const revalidate = 300

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.edongne.com'

export const metadata: Metadata = {
  title: '이사 업체 찾기',
  description: '뉴욕, 뉴저지 지역 이사 전문 업체를 검색하세요. 가정이사, 상업이사, 포장이사 업체의 리뷰와 견적을 비교해보세요.',
  keywords: '이사, 이사업체, 뉴욕 이사, 뉴저지 이사, 포장이사, moving company, movers',
  openGraph: {
    title: '이사 업체 찾기 | 이동네',
    description: '뉴욕, 뉴저지 지역 이사 전문 업체를 검색하세요.',
    type: 'website',
  },
}

export default async function MoversLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase()
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, kor_name')
    .eq('type', 'mover')
    .or('status.is.null,status.eq.active')
    .order('sort_priority', { ascending: false })
    .limit(30)

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '이사 업체',
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
      { '@type': 'ListItem', position: 2, name: '이사' },
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
