import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const REGION_COOKIE = 'edongne_region'
const DEFAULT_REGION = 'ny'
const VALID_REGIONS = ['ny', 'la', 'dc', 'seattle', 'chicago', 'sf', 'atlanta', 'philly', 'dallas', 'houston', 'hawaii', 'boston']

// Vercel IP city -> region mapping
const CITY_MAP: Record<string, string> = {
  'new york': 'ny', 'brooklyn': 'ny', 'queens': 'ny', 'bronx': 'ny', 'manhattan': 'ny',
  'jersey city': 'ny', 'newark': 'ny', 'fort lee': 'ny', 'palisades park': 'ny',
  'edgewater': 'ny', 'hackensack': 'ny', 'paramus': 'ny', 'tenafly': 'ny',
  'los angeles': 'la', 'irvine': 'la', 'fullerton': 'la', 'torrance': 'la',
  'buena park': 'la', 'garden grove': 'la', 'anaheim': 'la', 'glendale': 'la',
  'washington': 'dc', 'annandale': 'dc', 'centreville': 'dc', 'fairfax': 'dc', 'arlington': 'dc',
  'seattle': 'seattle', 'bellevue': 'seattle', 'federal way': 'seattle', 'tacoma': 'seattle',
  'chicago': 'chicago', 'glenview': 'chicago', 'niles': 'chicago', 'palatine': 'chicago',
  'san francisco': 'sf', 'san jose': 'sf', 'santa clara': 'sf', 'sunnyvale': 'sf',
  'atlanta': 'atlanta', 'duluth': 'atlanta', 'suwanee': 'atlanta', 'lawrenceville': 'atlanta',
  'philadelphia': 'philly', 'cheltenham': 'philly',
  'dallas': 'dallas', 'carrollton': 'dallas', 'plano': 'dallas', 'frisco': 'dallas',
  'houston': 'houston', 'sugar land': 'houston', 'katy': 'houston',
  'honolulu': 'hawaii',
  'boston': 'boston', 'cambridge': 'boston', 'allston': 'boston',
}

function getSubdomainRegion(hostname: string): string | null {
  // strip port if any
  const host = hostname.split(':')[0]
  const parts = host.split('.')
  // Need at least sub.edongne.com (3 parts) and middle part to be 'edongne'
  if (parts.length >= 3 && parts[parts.length - 2] === 'edongne') {
    const sub = parts[0]
    if (sub === 'www') return null
    if (VALID_REGIONS.includes(sub)) return sub
  }
  return null
}

function getGeoRegion(request: NextRequest): string | null {
  const city = request.headers.get('x-vercel-ip-city')
  if (!city) return null
  try {
    const decoded = decodeURIComponent(city).toLowerCase().trim()
    return CITY_MAP[decoded] || null
  } catch {
    return null
  }
}

/**
 * Resolve the active region for this request.
 * Priority:
 *   1. Subdomain (la.edongne.com -> 'la')              [authoritative]
 *   2. User cookie (their saved preference)            [when on www / apex]
 *   3. Geo IP city                                     [first-time visitors]
 *   4. DEFAULT_REGION                                  [fallback]
 *
 * NOTE: We deliberately keep geo as a *signal* (exposed via x-geo-region)
 * rather than an automatic redirect. The client-side GeoRegionPrompt uses
 * it to ask the user once: "Detected LA — switch?".
 */
function detectRegion(request: NextRequest): { region: string; source: 'subdomain' | 'cookie' | 'geo' | 'default' } {
  const hostname = request.headers.get('host') || ''
  const sub = getSubdomainRegion(hostname)
  if (sub) return { region: sub, source: 'subdomain' }

  const cookieRegion = request.cookies.get(REGION_COOKIE)?.value
  if (cookieRegion && VALID_REGIONS.includes(cookieRegion)) {
    return { region: cookieRegion, source: 'cookie' }
  }

  const geo = getGeoRegion(request)
  if (geo) return { region: geo, source: 'geo' }

  return { region: DEFAULT_REGION, source: 'default' }
}

export async function middleware(request: NextRequest) {
  const { region, source } = detectRegion(request)
  const geoRegion = getGeoRegion(request)
  const hostname = (request.headers.get('host') || '').split(':')[0]
  const isEdongne = hostname.endsWith('edongne.com')

  // ---- Forward region info to server components via REQUEST headers ----
  // (response headers don't reach next/headers' headers() inside RSC)
  const forwardedHeaders = new Headers(request.headers)
  forwardedHeaders.set('x-region', region)
  forwardedHeaders.set('x-region-source', source)
  if (geoRegion) forwardedHeaders.set('x-geo-region', geoRegion)
  forwardedHeaders.set('x-host', hostname)

  // ---- Build response, propagating Supabase auth ----
  let response = NextResponse.next({ request: { headers: forwardedHeaders } })

  // Supabase session refresh (mirror of updateSession but using forwarded headers)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request: { headers: forwardedHeaders } })
          cookiesToSet.forEach(({ name, value, options }) => {
            const opts = { ...(options as any) }
            if (isEdongne) opts.domain = '.edongne.com'
            response.cookies.set(name, value, opts)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // ---- Always sync region cookie to detected region (subdomain wins) ----
  // Only set the cookie when the source is authoritative (subdomain) OR
  // when no cookie exists yet. We do NOT overwrite a user's saved cookie
  // just because they hit the www domain — that would clobber their pref.
  const existingCookie = request.cookies.get(REGION_COOKIE)?.value
  const shouldSyncCookie =
    source === 'subdomain' ||                 // subdomain always wins
    !existingCookie ||                         // first visit
    !VALID_REGIONS.includes(existingCookie || '')

  if (shouldSyncCookie && existingCookie !== region) {
    const cookieOpts: any = {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    }
    if (isEdongne) cookieOpts.domain = '.edongne.com'
    response.cookies.set(REGION_COOKIE, region, cookieOpts)
  }

  // Echo region to response headers too (useful for debugging via curl -I)
  response.headers.set('x-region', region)

  // ---- /admin route protection ----
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role, region')
      .eq('id', user.id)
      .single()

    if (!profile || !['super', 'editor'].includes(profile.role)) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    response.headers.set('x-admin-role', profile.role)
    if (profile.region) {
      response.headers.set('x-admin-region', profile.region)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
