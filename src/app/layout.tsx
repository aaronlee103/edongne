import type { Metadata } from 'next'
import { Suspense } from 'react'
import { cookies, headers } from 'next/headers'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import PageTracker from '@/components/PageTracker'
import GeoRegionPrompt from '@/components/GeoRegionPrompt'
import { RegionProvider } from '@/context/RegionContext'
import { REGIONS, DEFAULT_REGION, getRegion } from '@/lib/regions'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.edongne.com'

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers()
  const regionCode = h.get('x-region') || DEFAULT_REGION
  const region = getRegion(regionCode)

  // Per-region branding
  const titleDefault = `이동네 - ${region.subtitle}`
  const description = `${region.name_ko} 한인 부동산, 건축, 변호사, 융자 전문가 찾기 & 생활정보 커뮤니티`
  const keywords = `${region.name_ko} 한인, 부동산, 리얼터, 건축, 인테리어, 변호사, 융자, 모기지, 커뮤니티, 생활정보`

  // Canonical URL: subdomain for non-default regions, www for default
  const canonical =
    regionCode === DEFAULT_REGION
      ? 'https://www.edongne.com'
      : `https://${regionCode}.edongne.com`

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: titleDefault,
      template: '%s | 이동네',
    },
    description,
    keywords,
    openGraph: {
      type: 'website',
      locale: 'ko_KR',
      siteName: '이동네',
      title: titleDefault,
      description,
      url: canonical,
      images: [
        {
          url: `${SITE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: titleDefault,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titleDefault,
      description,
      images: [`${SITE_URL}/og-image.png`],
    },
    alternates: {
      canonical,
      languages: Object.fromEntries(
        REGIONS.filter(r => r.active).map(r => [
          `ko-${r.code.toUpperCase()}`,
          r.code === DEFAULT_REGION ? 'https://www.edongne.com' : `https://${r.code}.edongne.com`,
        ])
      ),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'bl855H3ZsiePJK5oISjc_6VvkiVQ9RM3GlMUjZUSAfM',
      other: {
        'naver-site-verification': '66bf2ce8562090d147c23bde2c5efaf2ddcb35de',
      },
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      ],
      apple: '/apple-touch-icon.png',
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Region resolution priority:
  //   1. x-region header (set by middleware — most authoritative)
  //   2. edongne_region cookie (user's saved preference)
  //   3. DEFAULT_REGION
  const h = await headers()
  const cookieStore = await cookies()
  const headerRegion = h.get('x-region')
  const cookieRegion = cookieStore.get('edongne_region')?.value
  const initialRegion = headerRegion || cookieRegion || DEFAULT_REGION

  // Geo signal — used by GeoRegionPrompt to ask the user once if they're
  // visiting from a different region than the one currently shown.
  const geoRegion = h.get('x-geo-region') || null
  const regionSource = h.get('x-region-source') || 'default'
  const host = h.get('x-host') || h.get('host') || ''
  // Only show the prompt on the apex/www domain — not on dedicated subdomains.
  const isApex = host === 'edongne.com' || host === 'www.edongne.com' || host.startsWith('localhost')

  // Organization + WebSite JSON-LD (홈페이지 전체)
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: '이동네',
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/apple-touch-icon.png`,
          width: 180,
          height: 180,
        },
        sameAs: [
          'https://www.facebook.com/edongne',
          'https://www.instagram.com/edongne',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: '이동네',
        publisher: { '@id': `${SITE_URL}/#organization` },
        inLanguage: 'ko',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/?search={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }

  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <link
          rel="preload"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/woff2/PretendardVariable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <GoogleAnalytics />
        <PageTracker />
        <RegionProvider initialRegion={initialRegion}>
          <Suspense fallback={null}>
            <Header />
          </Suspense>
          <main className="flex-1">{children}</main>
          <Footer />
          {isApex && geoRegion && geoRegion !== initialRegion && (
            <GeoRegionPrompt
              currentRegion={initialRegion}
              geoRegion={geoRegion}
              regionSource={regionSource}
            />
          )}
        </RegionProvider>
      </body>
    </html>
  )
}
