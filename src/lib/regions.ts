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

// Static region list (matches DB regions table)
export const REGIONS: Region[] = [
  { code: 'ny', name_ko: '뉴욕/뉴저지', name_en: 'New York / New Jersey', subtitle: '뉴욕·뉴저지 한인 커뮤니티', active: true },
  { code: 'la', name_ko: '로스앤젤레스', name_en: 'Los Angeles', subtitle: 'LA·남가주 한인 커뮤니티', active: false },
  { code: 'dc', name_ko: '워싱턴 DC', name_en: 'Washington DC', subtitle: 'DC·버지니아 한인 커뮤니티', active: false },
  { code: 'seattle', name_ko: '시애틀', name_en: 'Seattle', subtitle: '시애틀·워싱턴주 한인 커뮤니티', active: false },
  { code: 'chicago', name_ko: '시카고', name_en: 'Chicago', subtitle: '시카고·중서부 한인 커뮤니티', active: false },
  { code: 'sf', name_ko: '샌프란시스코', name_en: 'San Francisco', subtitle: 'SF·실리콘밸리 한인 커뮤니티', active: false },
  { code: 'atlanta', name_ko: '애틀랜타', name_en: 'Atlanta', subtitle: '애틀랜타·조지아 한인 커뮤니티', active: false },
  { code: 'philly', name_ko: '필라델피아', name_en: 'Philadelphia', subtitle: '필라델피아·펜실베이니아 한인 커뮤니티', active: false },
  { code: 'dallas', name_ko: '달라스', name_en: 'Dallas', subtitle: '달라스·텍사스 북부 한인 커뮤니티', active: false },
  { code: 'houston', name_ko: '휴스턴', name_en: 'Houston', subtitle: '휴스턴·텍사스 남부 한인 커뮤니티', active: false },
  { code: 'hawaii', name_ko: '하와이', name_en: 'Hawaii', subtitle: '하와이 한인 커뮤니티', active: false },
  { code: 'boston', name_ko: '보스턴', name_en: 'Boston', subtitle: '보스턴·매사추세츠 한인 커뮤니티', active: false },
]

export function getRegion(code: string): Region {
  return REGIONS.find(r => r.code === code) || REGIONS[0]
}

export function getActiveRegions(): Region[] {
  return REGIONS.filter(r => r.active)
}

// Map Vercel geo city -> region code
const CITY_TO_REGION: Record<string, string> = {
  // NY/NJ
  'new york': 'ny', 'brooklyn': 'ny', 'queens': 'ny', 'bronx': 'ny', 'manhattan': 'ny',
  'jersey city': 'ny', 'newark': 'ny', 'fort lee': 'ny', 'palisades park': 'ny',
  'edgewater': 'ny', 'hackensack': 'ny', 'paramus': 'ny', 'tenafly': 'ny',
  // LA
  'los angeles': 'la', 'irvine': 'la', 'fullerton': 'la', 'torrance': 'la',
  'buena park': 'la', 'garden grove': 'la', 'anaheim': 'la', 'glendale': 'la',
  // DC
  'washington': 'dc', 'annandale': 'dc', 'centreville': 'dc', 'fairfax': 'dc', 'arlington': 'dc',
  // Seattle
  'seattle': 'seattle', 'bellevue': 'seattle', 'federal way': 'seattle', 'tacoma': 'seattle',
  // Chicago
  'chicago': 'chicago', 'glenview': 'chicago', 'niles': 'chicago', 'palatine': 'chicago',
  // SF
  'san francisco': 'sf', 'san jose': 'sf', 'santa clara': 'sf', 'sunnyvale': 'sf',
  // Atlanta
  'atlanta': 'atlanta', 'duluth': 'atlanta', 'suwanee': 'atlanta', 'lawrenceville': 'atlanta',
  // Philly
  'philadelphia': 'philly', 'cheltenham': 'philly',
  // Dallas
  'dallas': 'dallas', 'carrollton': 'dallas', 'plano': 'dallas', 'frisco': 'dallas',
  // Houston
  'houston': 'houston', 'sugar land': 'houston', 'katy': 'houston',
  // Hawaii
  'honolulu': 'hawaii',
  // Boston
  'boston': 'boston', 'cambridge': 'boston', 'allston': 'boston',
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
