import { Metadata } from 'next'
import { createServerSupabase } from '@/lib/supabase-server'

export const revalidate = 300

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.edongne.com'

export const metadata: Metadata = {
  title: '변호사 찾기',
  description: '뉴욕, 뉴저지 지역 변호사를 검색하세요. 부동산 법률, 이민, 비즈니스 전문 변호사의 프로필과 리뷰를 확인하세요.',
  keywords: '변호사, 뉴욕 변호사, 뉴저지 변호사, 부동산 변호사, 법률 상담, attorney, lawyer',
  openGraph: {
    title: '변호사 찾기 | 이동네',
    description: '뉴욕, 뉴저지 지역 변호사를 검색하세요.',
    type: 'website',
  },
}

export default async function LawyersLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase()
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, kor_name')
    .eq('type', 'lawyer')
    .or('status.is.null,status.eq.active')
    .order('sort_priority', { ascending: false })
    .limit(30)

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '변호사',
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
      { '@type': 'ListItem', position: 2, name: '변호사' },
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
