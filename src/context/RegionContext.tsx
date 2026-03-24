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

export function RegionProvider({ children, initialRegion }: { children: ReactNode; initialRegion?: string }) {
  const [regionCode, setRegionCodeState] = useState(initialRegion || DEFAULT_REGION)

  useEffect(() => {
    if (!initialRegion) {
      const cookie = document.cookie.split('; ').find(c => c.startsWith(REGION_COOKIE + '='))
      if (cookie) {
        const val = cookie.split('=')[1]
        if (REGIONS.some(r => r.code === val)) {
          setRegionCodeState(val)
        }
      }
    }
  }, [initialRegion])

  const setRegionCode = (code: string) => {
    setRegionCodeState(code)
    document.cookie = `${REGION_COOKIE}=${code}; path=/; max-age=31536000; SameSite=Lax`
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
