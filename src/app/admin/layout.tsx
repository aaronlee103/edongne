'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin', label: '대시보드', icon: '📊' },
  { href: '/admin/posts', label: '게시글', icon: '📝' },
  { href: '/admin/users', label: '회원', icon: '👥' },
  { href: '/admin/businesses', label: '업체', icon: '🏢' },
  { href: '/admin/reports', label: '신고', icon: '🚨' },
  { href: '/admin/content', label: '콘텐츠', icon: '📰' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-[calc(100vh-56px)] flex">
      {/* 사이드바 */}
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

      {/* 모바일 탭바 */}
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

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-6 pb-20 md:pb-6 overflow-auto">{children}</main>
    </div>
  )
}
