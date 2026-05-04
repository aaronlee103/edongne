'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { useRegion } from '@/context/RegionContext'

const NAV_ITEMS = [
  { href: '/board', label: '커뮤니티' },
  { href: '/realtors', label: '부동산' },
  { href: '/builders', label: '건축/인테리어' },
  { href: '/lawyers', label: '변호사' },
  { href: '/mortgage', label: '융자' },
  { href: '/movers', label: '이사' },
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
  const [regionOpen, setRegionOpen] = useState(false)
  const regionRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const currentCategory = searchParams.get('category') || 'all'
  const { region, setRegionCode, allRegions } = useRegion()

  const roleCacheRef = useRef<Record<string, string>>({})

  async function fetchRole(uid: string) {
    // Return cached role if available
    if (roleCacheRef.current[uid]) {
      setRole(roleCacheRef.current[uid])
      return
    }
    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', uid)
      .single()
    if (data?.role) {
      roleCacheRef.current[uid] = data.role
      setRole(data.role)
    }
  }

  useEffect(() => {
    // Use getSession() instead of getUser() — reads from local cache, no network request
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) fetchRole(currentUser.id)
    })

    // Auth state changes (login/logout) are handled reactively
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchRole(session.user.id)
      else setRole('user')
    })

    return () => subscription.unsubscribe()
  }, [])

  // Close region dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (regionRef.current && !regionRef.current.contains(e.target as Node)) {
        setRegionOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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
          <div className="flex items-center gap-1.5">
            <Link href="/" className="text-xl font-bold tracking-tight">
              이동네
            </Link>
            <div className="relative" ref={regionRef}>
              <button
                onClick={() => setRegionOpen(!regionOpen)}
                className="flex items-center gap-0.5 text-xs text-muted hover:text-primary transition-colors px-1.5 py-0.5 rounded hover:bg-gray-50"
              >
                <span>{region.name_ko}</span>
                <svg className={`w-3 h-3 transition-transform ${regionOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {regionOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-lg shadow-lg py-1 z-50 min-w-[160px]">
                  {allRegions.filter(r => r.active).map((r) => (
                    <button
                      key={r.code}
                      onClick={() => { setRegionCode(r.code); setRegionOpen(false) }}
                      className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors ${
                        r.code === region.code ? 'font-medium text-primary bg-gray-50' : 'text-secondary'
                      }`}
                    >
                      {r.name_ko}
                    </button>
                  ))}
                  <div className="border-t border-border mt-1 pt-1 px-3 py-1.5">
                    <span className="text-xs text-muted">더 많은 지역이 곧 오픈됩니다</span>
                  </div>
                </div>
              )}
            </div>
          </div>

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
            {/* 데스크톱: 로그인 상태 버튼들 */}
            {user ? (
              <div className="hidden md:flex items-center gap-2">
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

            {/* 모바일: 햄버거 메뉴 (로그인 시에도 표시) */}
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
            {user && (
              <>
                <Link
                  href="/write"
                  className="block px-2 py-2 text-sm font-medium text-primary hover:bg-gray-50 rounded"
                  onClick={() => setMobileOpen(false)}
                >
                  글쓰기
                </Link>
                <Link
                  href="/mypage"
                  className="block px-2 py-2 text-sm text-secondary hover:text-primary hover:bg-gray-50 rounded"
                  onClick={() => setMobileOpen(false)}
                >
                  마이페이지
                </Link>
                {(role === 'super' || role === 'editor') && (
                  <Link
                    href="/admin"
                    className="block px-2 py-2 text-sm text-secondary hover:text-primary hover:bg-gray-50 rounded"
                    onClick={() => setMobileOpen(false)}
                  >
                    관리
                  </Link>
                )}
                <div className="border-b border-border my-1" />
              </>
            )}
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
            {user && (
              <>
                <div className="border-b border-border my-1" />
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false) }}
                  className="block w-full text-left px-2 py-2 text-sm text-muted hover:text-primary hover:bg-gray-50 rounded"
                >
                  로그아웃
                </button>
              </>
            )}
          </nav>
        )}
      </div>

      {/* 카테고리 �m + 검색 (2번째 줄) */}
      <div className="border-t border-border bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-1 py-2">
            <div className="flex items-center gap-1 overflow-x-auto flex-1">
              {ISSUE_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => {
                    const base = cat.key === 'all' ? '/' : `/?category=${cat.key}`
                    // 같은 카테고리 재클릭 시에도 searchParams가 변하도록 타임스탬프 추가
                    const separator = base.includes('?') ? '&' : '?'
                    router.push(`${base}${separator}_t=${Date.now()}`)
                    window.scrollTo(0, 0)
                  }}
                  className={`px-3 py-2 text-sm whitespace-nowrap rounded-full transition-colors ${
                    (pathname === '/' && currentCategory === cat.key) || (pathname === '/' && cat.key === 'all' && !searchParams.get('category'))
                      ? 'bg-black text-white font-medium'
                      : 'text-secondary hover:text-primary hover:bg-gray-100'
                  }`}
                >
                  {cat.label}
                </button>
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
                    className="w-32 sm:w-40 px-3 py-1.5 text-sm border border-border rounded-full focus:outline-none focus:ring-1 focus:ring-black"
                    autoFocus
                  />
                  <button type="submit" className="p-2 hover:bg-gray-100 rounded-full">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery('') }} className="p-2 hover:bg-gray-100 rounded-full">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-secondary hover:text-primary hover:bg-gray-100 rounded-full transition-colors"
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
