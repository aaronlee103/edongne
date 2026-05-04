import { Metadata } from 'next'
import { createServerSupabase } from '@/lib/supabase-server'

export const revalidate = 300

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.edongne.com'

export const metadata: Metadata = {
  title: '융자/모기지 전문가 찾기',
  description: '뉴욕, 뉴저지 지역 모기지, 주택융자 전문가를 검색하세요. 첫 주택 구매, 재융자, 다운페이먼트 프로그램 상담을 받아보세요.',
  keywords: '모기지, 주택융자, 재융자, 뉴욕 모기지, 뉴저지 융자, mortgage, refinance',
  openGraph: {
    title: '융자/모기지 전문가 찾기 | 이동네',
    description: '뉴욕, 뉴저지 지역 모기지, 주택융자 전문가를 검색하세요.',
    type: 'website',
  },
}

export default async function MortgageLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase()
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, kor_name')
    .eq('type', 'mortgage')
    .or('status.is.null,status.eq.active')
    .order('sort_priority', { ascending: false })
    .limit(30)

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '융자/모기지 전문가',
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
      { '@type': 'ListItem', position: 2, name: '융자/모기지' },
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
