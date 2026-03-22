'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

// 봇/크롤러 user-agent 패턴
const BOT_PATTERNS = /bot|crawl|spider|slurp|baiduspider|yandex|sogou|exabot|facebot|ia_archiver|semrush|ahref|mj12bot|dotbot|petalbot|bytespider|gptbot|claudebot|ccbot|dataforseo|serpstat|screaming frog|lighthouse|pagespeed|gtmetrix|pingdom|uptimerobot|headlesschrome|phantomjs|selenium/i

function isBot(): boolean {
  if (typeof navigator === 'undefined') return true
  const ua = navigator.userAgent
  if (!ua || ua.length < 20) return true
  if (BOT_PATTERNS.test(ua)) return true
  // headless 브라우저 감지
  if ((navigator as any).webdriver) return true
  return false
}

// 세션당 한번만 카운트되는 visitor_id 생성
function getVisitorId(): string {
  const key = 'edongne_vid'
  let vid = sessionStorage.getItem(key)
  if (!vid) {
    vid = crypto.randomUUID()
    sessionStorage.setItem(key, vid)
  }
  return vid
}

export default function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname) return
    if (pathname.startsWith('/admin')) return
    if (isBot()) return

    const visitorId = getVisitorId()
    const supabase = createClient()
    supabase.from('page_views').insert({
      path: pathname,
      referrer: typeof document !== 'undefined' ? document.referrer || null : null,
      visitor_id: visitorId,
    }).then(() => {})
  }, [pathname])

  return null
}
