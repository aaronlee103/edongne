import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { updateSession } from '@/lib/supabase-middleware'

const REGION_COOKIE = 'edongne_region'
const DEFAULT_REGION = 'ny'
const VALID_REGIONS = ['ny', 'la', 'dc', 'seattle', 'chicago', 'sf', 'atlanta', 'philly', 'dallas', 'houston', 'hawaii', 'boston']

// Vercel IP city -> region mapping
const CITY_MAP: Record<string, string> = {
  'new york': 'ny', 'brooklyn': 'ny', 'queens': 'ny', 'bronx': 'ny',
  'jersey city': 'ny', 'newark': 'ny', 'fort lee': 'ny', 'palisades park': 'ny',
  'los angeles': 'la', 'irvine': 'la', 'fullerton': 'la', 'torrance': 'la',
  'washington': 'dc', 'annandale': 'dc', 'centreville': 'dc', 'fairfax': 'dc', 'arlington': 'dc',
  'seattle': 'seattle', 'bellevue': 'seattle', 'federal way': 'seattle', 'tacoma': 'seattle',
  'chicago': 'chicago', 'glenview': 'chicago',
  'san francisco': 'sf', 'san jose': 'sf', 'santa clara': 'sf',
  'atlanta': 'atlanta', 'duluth': 'atlanta', 'suwanee': 'atlanta',
  'philadelphia': 'philly',
  'dallas': 'dallas', 'carrollton': 'dallas', 'plano': 'dallas',
  'houston': 'houston', 'sugar land': 'houston',
  'honolulu': 'hawaii',
  'boston': 'boston', 'cambridge': 'boston',
}

function detectRegion(request: NextRequest): string {
  // 1. Check subdomain: ny.edongne.com -> 'ny'
  const hostname = request.headers.get('host') || ''
  const parts = hostname.split('.')
  if (parts.length >= 3) {
    const sub = parts[0]
    if (VALID_REGIONS.includes(sub)) return sub
  }

  // 2. Check cookie
  const cookieRegion = request.cookies.get(REGION_COOKIE)?.value
  if (cookieRegion && VALID_REGIONS.includes(cookieRegion)) return cookieRegion

  // 3. Check Vercel geo header (IP-based)
  const city = request.headers.get('x-vercel-ip-city')
  if (city) {
    const mapped = CITY_MAP[city.toLowerCase().trim()]
    if (mapped) return mapped
  }

  // 4. Default to NY
  return DEFAULT_REGION
}

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  // Detect region and set header + cookie
  const region = detectRegion(request)
  response.headers.set('x-region', region)

  // Set cookie if not already set
  if (!request.cookies.get(REGION_COOKIE)?.value) {
    response.cookies.set(REGION_COOKIE, region, {
      path: '/',
      maxAge: 31536000, // 1 year
      sameSite: 'lax',
    })
  }

  // /admin 경로 서버사이드 보호
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options as any)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

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

    // 관리자 역할과 담당 지역을 헤더로 전달
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
