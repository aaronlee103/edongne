'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

export default function AdminDashboard() {
  const supabase = createClient()
  const [stats, setStats] = useState({ posts: 0, users: 0, businesses: 0, reports: 0 })
  const [recentPosts, setRecentPosts] = useState<any[]>([])
  const [viewStats, setViewStats] = useState({ today: 0, week: 0, total: 0 })
  const [topPages, setTopPages] = useState<{ path: string; label: string; count: number }[]>([])

  useEffect(() => {
    fetchStats()
    fetchRecentPosts()
    fetchViewStats()
  }, [])

  async function fetchStats() {
    const [posts, businesses, reports, usersRes] = await Promise.all([
      supabase.from('posts').select('id', { count: 'exact', head: true }),
      supabase.from('businesses').select('id', { count: 'exact', head: true }),
      supabase.from('reports').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }),
    ])
    setStats({
      posts: posts.count || 0,
      users: usersRes.count || 0,
      businesses: businesses.count || 0,
      reports: reports.count || 0,
    })
  }

  async function fetchRecentPosts() {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    if (data) setRecentPosts(data)
  }

  async function fetchViewStats() {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString()

    // visitor_id 기준 고유 방문자 집계
    const [todayRes, weekRes, totalRes, topRes] = await Promise.all([
      supabase.from('page_views').select('visitor_id').gte('created_at', todayStart).not('visitor_id', 'is', null),
      supabase.from('page_views').select('visitor_id').gte('created_at', weekStart).not('visitor_id', 'is', null),
      supabase.from('page_views').select('visitor_id').not('visitor_id', 'is', null),
      supabase.from('page_views').select('path, visitor_id').gte('created_at', weekStart),
    ])

    const uniqueCount = (data: any[] | null) => data ? new Set(data.map((r: any) => r.visitor_id)).size : 0

    setViewStats({
      today: uniqueCount(todayRes.data),
      week: uniqueCount(weekRes.data),
      total: uniqueCount(totalRes.data),
    })

    // 인기 페이지 집계 (고유 방문자 기준)
    if (topRes.data) {
      const PATH_LABELS: Record<string, string> = {
        '/': '메인 페이지',
        '/realtors': '부동산/리얼터',
        '/builders': '건축/인테리어',
        '/lawyers': '변호사',
        '/mortgage': '융자',
        '/businesses': '업체 디렉토리',
        '/board': '커뮤니티 게시판',
        '/listings': '부동산 매물',
        '/mypage': '마이페이지',
        '/auth': '로그인',
        '/write': '글쓰기',
        '/pricing': '요금제',
        '/contact': '문의',
        '/about': '소개',
        '/business-register': '업체 등록',
        '/privacy': '개인정보처리방침',
        '/admin': '관리자',
      }

      const pathVisitors: Record<string, Set<string>> = {}
      topRes.data.forEach((row: any) => {
        if (!pathVisitors[row.path]) pathVisitors[row.path] = new Set()
        if (row.visitor_id) pathVisitors[row.path].add(row.visitor_id)
      })
      const sorted = Object.entries(pathVisitors)
        .sort((a, b) => b[1].size - a[1].size)
        .slice(0, 10)
        .map(([path, visitors]) => ({ path, label: '', count: visitors.size }))

      // /post/uuid 경로에서 글 제목 가져오기
      const postIds = sorted
        .filter(p => p.path.startsWith('/post/'))
        .map(p => p.path.replace('/post/', ''))
      if (postIds.length > 0) {
        const { data: posts } = await supabase
          .from('posts')
          .select('id, title')
          .in('id', postIds)
        const titleMap: Record<string, string> = {}
        posts?.forEach((p: any) => { titleMap[p.id] = p.title })
        sorted.forEach(page => {
          if (page.path.startsWith('/post/')) {
            const id = page.path.replace('/post/', '')
            page.label = titleMap[id] || page.path
          }
        })
      }

      // /business/uuid 경로에서 업체명 가져오기
      const bizIds = sorted
        .filter(p => p.path.startsWith('/business/'))
        .map(p => p.path.replace('/business/', ''))
      if (bizIds.length > 0) {
        const { data: bizs } = await supabase
          .from('businesses')
          .select('id, kor_name')
          .in('id', bizIds)
        const nameMap: Record<string, string> = {}
        bizs?.forEach((b: any) => { nameMap[b.id] = b.kor_name })
        sorted.forEach(page => {
          if (page.path.startsWith('/business/')) {
            const id = page.path.replace('/business/', '')
            page.label = nameMap[id] || page.path
          }
        })
      }

      // 정적 경로 라벨 적용
      sorted.forEach(page => {
        if (!page.label) {
          page.label = PATH_LABELS[page.path] || page.path
        }
      })

      setTopPages(sorted)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">대시보드</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="게시글" value={stats.posts} href="/admin/posts" />
        <StatCard label="업체" value={stats.businesses} href="/admin/businesses" />
        <StatCard label="신고" value={stats.reports} href="/admin/reports" color="red" />
        <StatCard label="회원" value={stats.users} href="/admin/users" />
      </div>

      {/* 방문자 분석 */}
      <div className="mb-8 border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold">📈 실제 방문자 분석</h2>
          <a
            href="https://analytics.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline"
          >
            Google Analytics 상세 →
          </a>
        </div>

        {/* 방문수 카드 */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-bg-light rounded-lg p-3 text-center">
            <p className="text-xs text-muted mb-1">오늘</p>
            <p className="text-xl font-bold">{viewStats.today}</p>
          </div>
          <div className="bg-bg-light rounded-lg p-3 text-center">
            <p className="text-xs text-muted mb-1">이번 주</p>
            <p className="text-xl font-bold">{viewStats.week}</p>
          </div>
          <div className="bg-bg-light rounded-lg p-3 text-center">
            <p className="text-xs text-muted mb-1">전체</p>
            <p className="text-xl font-bold">{viewStats.total}</p>
          </div>
        </div>

        {/* 인기 페이지 */}
        {topPages.length > 0 && (
          <div>
            <p className="text-xs text-muted mb-2 font-medium">이번 주 인기 페이지</p>
            <div className="space-y-1">
              {topPages.map((page, i) => (
                <div key={page.path} className="flex items-center justify-between text-sm py-1.5 px-2 rounded hover:bg-gray-50">
                  <span className="truncate flex-1">
                    <span className="text-muted mr-2">{i + 1}.</span>
                    <Link href={page.path} className="hover:underline">{page.label}</Link>
                  </span>
                  <span className="text-muted text-xs ml-2 shrink-0">{page.count}회</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 빠른 글쓰기 */}
      <QuickWrite supabase={supabase} onWrite={fetchRecentPosts} />

      {/* 최근 게시글 */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">최근 게시글</h2>
          <Link href="/admin/posts" className="text-xs text-muted hover:text-primary">전체보기 →</Link>
        </div>
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg-light border-b border-border">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-muted">제목</th>
                <th className="text-left px-4 py-2 font-medium text-muted w-24">카테고리</th>
                <th className="text-left px-4 py-2 font-medium text-muted w-28">날짜</th>
              </tr>
            </thead>
            <tbody>
              {recentPosts.map((post) => (
                <tr key={post.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-2.5 truncate max-w-[300px]">
                    <Link href={`/post/${post.id}`} className="hover:underline">{post.title}</Link>
                  </td>
                  <td className="px-4 py-2.5 text-muted">{post.category}</td>
                  <td className="px-4 py-2.5 text-muted">{new Date(post.created_at).toLocaleDateString('ko-KR')}</td>
                </tr>
              ))}
              {recentPosts.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-muted">게시글이 없습니다</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, href, color }: { label: string; value: number; href: string; color?: string }) {
  return (
    <Link href={href} className="block p-4 border border-border rounded-lg hover:shadow-sm transition-shadow">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color === 'red' && value > 0 ? 'text-red-500' : ''}`}>{value}</p>
    </Link>
  )
}

function QuickWrite({ supabase, onWrite }: { supabase: any; onWrite: () => void }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState<'community' | 'notice' | 'magazine'>('community')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { alert('로그인 필요'); setLoading(false); return }

    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      type,
      category: type === 'community' ? 'free' : 'topic',
      title: title.trim(),
      content: content.trim(),
    })

    if (error) {
      alert('작성 실패: ' + error.message)
    } else {
      setTitle('')
      setContent('')
      onWrite()
    }
    setLoading(false)
  }

  return (
    <div className="border border-border rounded-lg p-4">
      <h2 className="font-bold mb-3">빠른 글쓰기</h2>
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2 mb-3">
          {(['community', 'notice', 'magazine'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`px-3 py-1 text-xs rounded-full ${
                type === t ? 'bg-black text-white' : 'bg-gray-100 text-secondary'
              }`}
            >
              {t === 'community' ? '커뮤니티' : t === 'notice' ? '공지' : '매거진'}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          className="w-full px-3 py-2 border border-border rounded-lg text-sm mb-2 focus:outline-none focus:border-black"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용"
          className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none focus:outline-none focus:border-black"
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-4 py-1.5 rounded-full text-sm hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? '작성 중...' : '게시하기'}
          </button>
        </div>
      </form>
    </div>
  )
}
