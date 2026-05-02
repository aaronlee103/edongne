import { Metadata } from 'next'
import { createServerSupabase } from '@/lib/supabase-server'
import BusinessDetailClient from './BusinessDetail'

export const revalidate = 60

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.edongne.com'

const TYPE_LABEL: Record<string, string> = {
  realtor: '부동산 에이전트',
  builder: '건축/인테리어',
  lawyer: '변호사',
  mortgage: '융자/모기지',
  mover: '이사',
}

const TYPE_LABEL_EN: Record<string, string> = {
  realtor: 'RealEstateAgent',
  builder: 'HomeAndConstructionBusiness',
  lawyer: 'LegalService',
  mortgage: 'FinancialService',
  mover: 'MovingCompany',
}

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const supabase = createServerSupabase()
  const { data: biz } = await supabase
    .from('businesses')
    .select('kor_name, eng_name, type, specialty, tagline, description, region, area, hero_image')
    .eq('id', params.id)
    .single()

  if (!biz) {
    return { title: '업체를 찾을 수 없습니다' }
  }

  const typeLabel = TYPE_LABEL[biz.type] || biz.type
  const title = `${biz.kor_name} - ${typeLabel}`
  const regionLabel = biz.region === 'NY' ? '뉴욕' : biz.region === 'NJ' ? '뉴저지' : biz.region
  const description = biz.tagline
    || biz.description?.substring(0, 160)
    || `${regionLabel} ${biz.area || ''} ${typeLabel} ${biz.kor_name}`.trim()
  const pageUrl = `${SITE_URL}/business/${params.id}`
  const ogImage = biz.hero_image || `${SITE_URL}/og-image.png`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: 'website',
      siteName: '이동네',
      locale: 'ko_KR',
      images: [{ url: ogImage, width: 1200, height: 630, alt: biz.kor_name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: pageUrl,
    },
  }
}

export default async function BusinessPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase()

  // Fetch business data for JSON-LD
  const { data: biz } = await supabase
    .from('businesses')
    .select('kor_name, eng_name, type, specialty, tagline, description, region, area, address, phone1, email, website, hero_image')
    .eq('id', params.id)
    .single()

  // Fetch aggregate review data
  const { data: reviewAgg } = await supabase
    .from('reviews')
    .select('score')
    .eq('business_id', params.id)

  const reviewCount = reviewAgg?.length || 0
  const avgRating = reviewCount > 0
    ? Math.round((reviewAgg!.reduce((sum, r) => sum + r.score, 0) / reviewCount) * 10) / 10
    : null

  const typeLabel = biz ? (TYPE_LABEL[biz.type] || biz.type) : ''
  const schemaType = biz ? (TYPE_LABEL_EN[biz.type] || 'LocalBusiness') : 'LocalBusiness'

  const jsonLd = biz ? {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: biz.kor_name,
    ...(biz.eng_name && { alternateName: biz.eng_name }),
    description: biz.description || biz.tagline || `${typeLabel} ${biz.kor_name}`,
    url: `${SITE_URL}/business/${params.id}`,
    ...(biz.phone1 && { telephone: biz.phone1 }),
    ...(biz.email && { email: biz.email }),
    ...(biz.website && { sameAs: biz.website }),
    ...(biz.hero_image && {
      image: {
        '@type': 'ImageObject',
        url: biz.hero_image,
      },
    }),
    ...(biz.address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: biz.address,
        addressRegion: biz.region || 'NY',
        addressCountry: 'US',
      },
    }),
    ...(biz.specialty && { knowsAbout: biz.specialty }),
    ...(avgRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating,
        reviewCount: reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    areaServed: {
      '@type': 'State',
      name: biz.region === 'NJ' ? 'New Jersey' : 'New York',
    },
  } : null

  const TYPE_BACK_LABEL: Record<string, { href: string; name: string }> = {
    realtor: { href: '/realtors', name: '부동산 에이전트' },
    builder: { href: '/builders', name: '건축/인테리어' },
    lawyer: { href: '/lawyers', name: '변호사' },
    mortgage: { href: '/mortgage', name: '융자/모기지' },
    mover: { href: '/movers', name: '이사' },
  }

  const categoryInfo = biz ? TYPE_BACK_LABEL[biz.type] || { href: '/realtors', name: '업체' } : null

  const breadcrumbJsonLd = biz ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: categoryInfo!.name, item: `${SITE_URL}${categoryInfo!.href}` },
      { '@type': 'ListItem', position: 3, name: biz.kor_name },
    ],
  } : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      <BusinessDetailClient params={params} />
    </>
  )
}
