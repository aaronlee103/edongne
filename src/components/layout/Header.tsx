'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

const NAV_ITEMS = [
  { href: '/board', label: '커뮤니티' },
  { href: '/?category=realestate', label: '부동산' },
  { href: '/?category=construction', label: '건축/인테리어' },
  { href: '/?category=legal', label: '변호사' },
  { href: '/?category=finance', label: '융자' },
  { href: '/?category=neighborhood', label: '이동네어때' },
]

const ISSUE_CATEGORIES = [
  { key: 'all', label: '전체' },
  { key: 'editor', label: '에디터 픽' },
  { key: 'neighborhood', label: '이동네어때' },
  { key: 'realestate', label: '부동산' },
  { key: 'legal', label: '부동산 법률' },
  { key: 'living', label: '생활정보' },
  { key: 'construction', label: '건축/인테리어' },
  { key: 'finance', label: '주택융자' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string>('user')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const supabase = createClient()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const currentCategory = searchParams.get('category') || 'all'

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
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

      {/* 카테고리 탭 + 검색 (2번째 줄) */}
      <div className="border-t border-border bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-1 py-2">
            <div className="flex items-center gap-1 overflow-x-auto flex-1">
              {ISSUE_CATEGORIES.map((cat) => (
                <Link
                  key={cat.key}
                  href={cat.key === 'all' ? '/' : `/?category=${cat.key}`}
                  className={`px-3 py-1.5 text-sm whitespace-nowrap rounded-full transition-colors ${
                    (pathname === '/' && currentCategory === cat.key) || (pathname === '/' && cat.key === 'all' && !searchParams.get('category'))
                      ? 'bg-black text-white font-medium'
                      : 'text-secondary hover:text-primary hover:bg-gray-100'
                  }`}
                >
                  {cat.label}
                </Link>
              ))}
            </div>

            {/* 검색 버튼 */}
            <div className="flex items-center ml-2 shrink-0">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="검색어 입력..."
                    className="w-40 px-3 py-1.5 text-sm border border-border rounded-full focus:outline-none focus:ring-1 focus:ring-black"
                    autoFocus
                  />
                  <button type="submit" className="p-1.5 hover:bg-gray-100 rounded-full">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery('') }} className="p-1.5 hover:bg-gray-100 rounded-full">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-secondary hover:text-primary hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="hidden sm:inline">검색</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
