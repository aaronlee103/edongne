'use client'

import Script from 'next/script'

// edongne 단독 GA4 계정 (2026-07-05 교체) — 이전 ODIYA 하위 속성(G-C5KTNZ9VBZ)은 폐기
const GA_ID = 'G-8ZMZSY4CVQ'

export default function GoogleAnalytics() {
  if (!GA_ID) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  )
}
