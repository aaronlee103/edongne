'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Region, REGIONS, DEFAULT_REGION, REGION_COOKIE, getRegion } from '@/lib/regions'

interface RegionContextType {
  region: Region
  regionCode: string
  setRegionCode: (code: string) => void
  allRegions: Region[]
}

const RegionContext = createContext<RegionContextType>({
  region: REGIONS[0],
  regionCode: DEFAULT_REGION,
  setRegionCode: () => {},
  allRegions: REGIONS,
})

/**
 * Read the region directly from the current hostname.
 * `la.edongne.com` -> `la`, `www.edongne.com` -> null, `edongne.com` -> null.
 * This is the authoritative source on the client — beats any cookie/cache.
 */
function getSubdomainRegionFromHostname(): string | null {
  if (typeof window === 'undefined') return null
  const host = window.location.hostname.split(':')[0]
  const parts = host.split('.')
  if (parts.length >= 3 && parts[parts.length - 2] === 'edongne') {
    const sub = parts[0]
    if (sub === 'www') return null
    if (REGIONS.some(r => r.code === sub)) return sub
  }
  return null
}

/**
 * Write the region cookie with the correct scope.
 * On *.edongne.com we MUST use `domain=.edongne.com` so the preference is
 * shared across subdomains; otherwise the browser stores it host-only and
 * la.edongne.com won't see what was set on www.edongne.com (and vice versa).
 */
function writeRegionCookie(code: string) {
  if (typeof window === 'undefined') return
  const isEdongne = window.location.hostname.endsWith('edongne.com')
  const domain = isEdongne ? '; domain=.edongne.com' : ''
  document.cookie = `${REGION_COOKIE}=${code}; path=/; max-age=31536000; SameSite=Lax${domain}`
}

export function RegionProvider({ children, initialRegion }: { children: ReactNode; initialRegion?: string }) {
  // Initial state must match what the server rendered to avoid a hydration
  // mismatch — so we use `initialRegion` here. The subdomain correction
  // happens in useEffect right after mount.
  const [regionCode, setRegionCodeState] = useState(initialRegion || DEFAULT_REGION)

  useEffect(() => {
    // The hostname is the only fully reliable signal on the client.
    // If we're on `la.edongne.com`, the region MUST be `la`, no matter what
    // a stale cookie or cached SSR prop says.
    const subRegion = getSubdomainRegionFromHostname()
    if (subRegion) {
      if (subRegion !== regionCode) {
        setRegionCodeState(subRegion)
      }
      // Make sure the cookie matches the current subdomain so a later visit
      // to the apex/www correctly remembers this preference.
      writeRegionCookie(subRegion)
      return
    }

    // We're on the apex/www — only fall back to cookie if the server didn't
    // give us an initialRegion. The server-side logic in middleware already
    // handles geo + cookie precedence, so trust initialRegion when present.
    if (!initialRegion) {
      const cookie = document.cookie.split('; ').find(c => c.startsWith(REGION_COOKIE + '='))
      if (cookie) {
        const val = cookie.split('=')[1]
        if (REGIONS.some(r => r.code === val)) {
          setRegionCodeState(val)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setRegionCode = (code: string) => {
    setRegionCodeState(code)
    writeRegionCookie(code)
    // /admin 경로에서는 서브도메인 리다이렉트 하지 않음 (AdminRegionContext가 별도 처리)
    if (window.location.pathname.startsWith('/admin')) return
    const hostname = window.location.hostname
    if (hostname.includes('edongne.com')) {
      const targetHost = code === DEFAULT_REGION ? 'www.edongne.com' : `${code}.edongne.com`
      if (!hostname.startsWith(code + '.') && !(code === DEFAULT_REGION && (hostname === 'www.edongne.com' || hostname === 'edongne.com'))) {
        window.location.href = `https://${targetHost}${window.location.pathname}`
        return
      }
    }
  }

  return (
    <RegionContext.Provider value={{
      region: getRegion(regionCode),
      regionCode,
      setRegionCode,
      allRegions: REGIONS,
    }}>
      {children}
    </RegionContext.Provider>
  )
}

export function useRegion() {
  return useContext(RegionContext)
}
