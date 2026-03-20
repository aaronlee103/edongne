'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'

const NAV_ITEMS = [
  { href: '/board', label: '커뮤니티' },
  { href: '/realtors', label: '부동산' },
  { href: '/builders', label: '건축/인테리어' },
  { href: '/lawyers', label: '변호사' },
  { href: '/mortgage', label: '융자' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string>('user')
  const supabase = createClient()

  async function fetchRole(uid: string) {
    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', uid)
      .single()
    if (data?.role) setRole(data.role)
  }

  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) fetchRole(data.user.id)
    })

    // 인증 상태 변화 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchRole(session.user.id)
      else setRole('user')
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = '/'
  }

  return (
    <header className="border-b border-border sticky top-0 bg-white z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="text-xl font-bold tracking-tight">
            이동네
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-secondary hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/write"
                  className="text-sm bg-black text-white px-4 py-1.5 rounded-full hover:bg-gray-800 transition-colors"
                >
                  글쓰기
                </Link>
                <Link href="/mypage" className="text-sm text-secondary hover:text-primary">
                  마이페이지
                </Link>
                {(role === 'super' || role === 'editor') && (
                  <Link href="/admin" className="text-sm text-secondary hover:text-primary">
                    관리
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm text-muted hover:text-primary"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="text-sm bg-black text-white px-4 py-1.5 rounded-full hover:bg-gray-800 transition-colors"
              >
                로그인
              </Link>
            )}

            <button
              className="md:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="메뉴"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="md:hidden border-t border-border py-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-2 py-2 text-sm text-secondary hover:text-primary hover:bg-gray-50 rounded"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
