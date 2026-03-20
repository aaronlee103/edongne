'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'

const NAV = [
  { href: '/admin', label: '대시보드', icon: '📊' },
  { href: '/admin/posts', label: '게시글', icon: '📝' },
  { href: '/admin/users', label: '회원', icon: '👥' },
  { href: '/admin/businesses', label: '업체', icon: '🏢' },
  { href: '/admin/magazine', label: '매거진', icon: '📰' },
  { href: '/admin/reports', label: '신고', icon: '🚨' },
]

const ALLOWED_ROLES = ['super', 'editor']

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth')
      return
    }

    // users 테이블에서 역할 확인
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !ALLOWED_ROLES.includes(profile.role)) {
      // 권한 없음
      setLoading(false)
      setAuthorized(false)
      return
    }

    setAuthorized(true)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
        <p className="text-muted text-sm">권한 확인 중...</p>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🔒</p>
          <h1 className="text-xl font-bold mb-2">접근 권한이 없습니다</h1>
          <p className="text-sm text-muted mb-6">관리자(super/editor) 계정으로 로그인해주세요.</p>
          <Link href="/" className="text-sm bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex">
      <aside className="w-52 border-r border-border bg-bg-light shrink-0 hidden md:block">
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-sm">관리자</h2>
        </div>
        <nav className="p-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg mb-0.5 transition-colors ${
                pathname === item.href
                  ? 'bg-black text-white'
                  : 'text-secondary hover:bg-gray-100'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 mt-auto border-t border-border">
          <Link href="/" className="text-xs text-muted hover:text-primary">← 사이트로 돌아가기</Link>
        </div>
      </aside>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 flex">
        {NAV.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 py-2 text-center text-xs ${
              pathname === item.href ? 'text-primary font-medium' : 'text-muted'
            }`}
          >
            <span className="block text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

      <main className="flex-1 p-6 pb-20 md:pb-6 overflow-auto">{children}</main>
    </div>
  )
}
