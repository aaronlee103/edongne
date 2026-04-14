'use client'

import { useEffect, useState } from 'react'
import { REGIONS, DEFAULT_REGION, REGION_COOKIE, getRegion, isRegionActive } from '@/lib/regions'

const DISMISS_KEY = 'edongne_geo_prompt_dismissed'

interface Props {
  currentRegion: string
  geoRegion: string
  regionSource: string
}

/**
 * One-time prompt shown on the apex/www domain when the visitor's geo IP
 * suggests a region different from the currently displayed one.
 *
 * Behavior:
 *   - Only shows on www / apex domain (gated by parent layout)
 *   - Only shows if user hasn't permanently dismissed it
 *   - Only shows if region was NOT already chosen via subdomain
 *   - Three actions: Go (redirect to subdomain) / Stay / Don't ask again
 */
export default function GeoRegionPrompt({ currentRegion, geoRegion, regionSource }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Subdomain is authoritative — never override
    if (regionSource === 'subdomain') return
    // Already on the geo region — nothing to ask
    if (currentRegion === geoRegion) return
    // Don't offer to switch to a region that isn't publicly launched yet —
    // middleware would immediately redirect the visitor back to www.
    if (!isRegionActive(geoRegion)) return
    // Permanently dismissed
    try {
      if (localStorage.getItem(DISMISS_KEY) === '1') return
    } catch {}
    // Session-level dismiss
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === '1') return
    } catch {}
    setVisible(true)
  }, [currentRegion, geoRegion, regionSource])

  if (!visible) return null

  const target = getRegion(geoRegion)
  const targetHost = geoRegion === DEFAULT_REGION ? 'www.edongne.com' : `${geoRegion}.edongne.com`

  function setCookie(value: string) {
    const isEdongne = window.location.hostname.endsWith('edongne.com')
    const domain = isEdongne ? '; domain=.edongne.com' : ''
    document.cookie = `${REGION_COOKIE}=${value}; path=/; max-age=31536000; SameSite=Lax${domain}`
  }

  function handleGo() {
    setCookie(geoRegion)
    try { sessionStorage.setItem(DISMISS_KEY, '1') } catch {}
    window.location.href = `https://${targetHost}${window.location.pathname}${window.location.search}`
  }

  function handleStay() {
    try { sessionStorage.setItem(DISMISS_KEY, '1') } catch {}
    setVisible(false)
  }

  function handleNever() {
    try { localStorage.setItem(DISMISS_KEY, '1') } catch {}
    setVisible(false)
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-md bg-white border border-border rounded-2xl shadow-2xl p-4 sm:p-5 animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-primary">
            현재 위치가 <span className="font-bold">{target.name_ko}</span>로 감지되었어요
          </p>
          <p className="text-xs text-muted mt-1">
            {target.name_ko} 지역으로 이동할까요? 한 번 선택하면 다음부터는 자동으로 보여드려요.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <button
              onClick={handleGo}
              className="text-xs bg-black text-white px-3 py-1.5 rounded-full hover:bg-gray-800 transition-colors font-medium"
            >
              {target.name_ko}로 이동
            </button>
            <button
              onClick={handleStay}
              className="text-xs text-secondary hover:text-primary px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors"
            >
              괜찮아요
            </button>
            <button
              onClick={handleNever}
              className="text-xs text-muted hover:text-primary px-2 py-1.5 transition-colors ml-auto"
            >
              다시 묻지 않기
            </button>
          </div>
        </div>
        <button
          onClick={handleStay}
          aria-label="닫기"
          className="flex-shrink-0 text-muted hover:text-primary p-1 -mr-1 -mt-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
