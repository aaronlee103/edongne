import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // 로그인 후 돌아갈 곳: 쿼리 ?next → auth_next 쿠키 → 홈. 사이트 안의 경로('/…')만 허용한다.
  const rawNext = searchParams.get('next') ?? decodeURIComponent(cookies().get('auth_next')?.value ?? '')
  const next = /^\/(?![\/\\])/.test(rawNext) ? rawNext : '/'

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                cookieStore.set(name, value, options as any)
              } catch {}
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // 로그인 성공 후 users 테이블에 프로필 자동 생성
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: existing } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single()

        if (!existing) {
          // 신규 유저 → users 테이블에 등록
          const nickname = user.user_metadata?.full_name
            || user.user_metadata?.name
            || user.user_metadata?.preferred_username
            || user.email?.split('@')[0]
            || '새회원'
          await supabase.from('users').insert({
            id: user.id,
            email: user.email || user.user_metadata?.email || '',
            nickname,
            role: 'user',
            avatar_animal: 'bear',
          })
        }
      }

      const res = NextResponse.redirect(`${origin}${next}`)
      res.cookies.set('auth_next', '', { path: '/', maxAge: 0 })
      return res
    }
    console.error('Auth callback error:', error.message)
  }

  return NextResponse.redirect(`${origin}/auth?error=auth_failed`)
}
