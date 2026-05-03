'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { AdminRegionProvider, useAdminRegion } from '@/context/AdminRegionContext'
import { REGIONS } from '@/lib/regions'

const NAV = [
  { href: '/admin', label: '대시보드', icon: '📊' },
  { href: '/admin/posts', label: '게시글', icon: '📝' },
  { href: '/admin/users', label: '회원', icon: '👥' },
  { href: '/admin/businesses', label: '업체', icon: '🏢' },
  { href: '/admin/ads', label: '광고', icon: '📢' },
  { href: '/admin/magazine', label: '매거진', icon: '📰' },
  { href: '/admin/reports', label: '신고', icon: '🚨' },
  { href: '/admin/inquiries', label: '문의', icon: '📩' },
]

const ALLOWED_ROLES = ['super', 'editor']

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !ALLOWED_ROLES.includes(profile.role)) {
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
    <AdminRegionProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminRegionProvider>
  )
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { selectedRegion, setSelectedRegion, userRole, isRegionAllowed } = useAdminRegion()

  const currentRegionName = REGIONS.find(r => r.code === selectedRegion)?.name_ko || selectedRegion

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col">
      {/* 지역 탭 바 */}
      <div className="bg-white border-b border-border px-4 py-0 overflow-x-auto shrink-0">
        <div className="flex items-center gap-1 min-w-max">
          <span className="text-xs text-muted mr-2 shrink-0 py-2">지역:</span>
          {REGIONS.map((region) => {
            const allowed = isRegionAllowed(region.code)
            const isSelected = selectedRegion === region.code
            return (
              <button
                key={region.code}
                onClick={() => allowed && setSelectedRegion(region.code)}
                disabled={!allowed}
                className={`px-3 py-2 text-xs whitespace-nowrap border-b-2 transition-colors ${
                  isSelected
                    ? 'border-black text-black font-bold'
                    : allowed
                      ? 'border-transparent text-secondary hover:text-black hover:border-gray-300'
                      : 'border-transparent text-gray-300 cursor-not-allowed'
                }`}
                title={!allowed ? '접근 권한이 없습니다' : region.name_ko}
              >
                {region.name_ko}
              </button>
            )
          })}
          {userRole === 'super' && (
            <span className="text-[10px] text-muted ml-2 py-2 shrink-0">👑 슈퍼관리자</span>
          )}
        </div>
      </div>

      <div className="flex flex-1">
        <aside className="w-52 border-r border-border bg-bg-light shrink-0 hidden md:block">
          <div className="p-4 border-b border-border">
            <h2 className="font-bold text-sm">관리자</h2>
            <p className="text-xs text-muted mt-0.5">{currentRegionName}</p>
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
          {NAV.map((item) => (
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
    </div>
  )
}
