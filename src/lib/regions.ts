// Region configuration & utilities

export const DEFAULT_REGION = 'ny'
export const REGION_COOKIE = 'edongne_region'

export interface Region {
  code: string
  name_ko: string
  name_en: string
  subtitle: string
  active: boolean
}

// 2026-11: 이동네는 뉴욕/뉴저지 전용으로 운영한다. 다른 지역(텍사스 포함)은 모두 제거했다.
// 지역 서브도메인(xx.edongne.com)은 middleware 에서 전부 www 로 보낸다.
export const REGIONS: Region[] = [
  { code: 'ny', name_ko: '뉴욕/뉴저지', name_en: 'New York / New Jersey', subtitle: '뉴욕·뉴저지 한인 커뮤니티', active: true },
]

/**
 * Whether a region is publicly accessible. Inactive regions are visible to
 * admin users (super/editor) only — enforced in middleware.
 */
export function isRegionActive(code: string): boolean {
  return REGIONS.some(r => r.code === code && r.active)
}

export function getRegion(code: string): Region {
  return REGIONS.find(r => r.code === code) || REGIONS[0]
}

export function getActiveRegions(): Region[] {
  return REGIONS.filter(r => r.active)
}

// Map Vercel geo city -> region code
const CITY_TO_REGION: Record<string, string> = {
  // NY/NJ (2026-11: 다른 지역은 모두 정리 — 뉴욕/뉴저지 전용)
  'new york': 'ny', 'brooklyn': 'ny', 'queens': 'ny', 'bronx': 'ny', 'manhattan': 'ny',
  'jersey city': 'ny', 'newark': 'ny', 'fort lee': 'ny', 'palisades park': 'ny',
  'edgewater': 'ny', 'hackensack': 'ny', 'paramus': 'ny', 'tenafly': 'ny',
}

export function cityToRegion(city: string | null): string {
  if (!city) return DEFAULT_REGION
  const normalized = city.toLowerCase().trim()
  return CITY_TO_REGION[normalized] || DEFAULT_REGION
}

// Extract subdomain from hostname
export function getSubdomainRegion(hostname: string): string | null {
  const parts = hostname.split('.')
  if (parts.length >= 3 && parts[parts.length - 2] === 'edongne') {
    const sub = parts[0]
    if (REGIONS.some(r => r.code === sub)) return sub
  }
  return null
}
