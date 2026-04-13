import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          const host = request.headers.get('host') || ''
          const isEdongne = host.includes('edongne.com')
          cookiesToSet.forEach(({ name, value, options }) => {
            const opts = { ...options } as any
            // 서브도메인 간 세션 공유를 위해 .edongne.com 도메인 설정
            if (isEdongne) opts.domain = '.edongne.com'
            supabaseResponse.cookies.set(name, value, opts)
          })
        },
      },
    }
  )

  await supabase.auth.getUser()
  return supabaseResponse
}
