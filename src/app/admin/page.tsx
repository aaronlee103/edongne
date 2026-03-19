'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

export default function AdminDashboard() {
  const supabase = createClient()
  const [stats, setStats] = useState({ posts: 0, users: 0, businesses: 0, reports: 0 })
  const [recentPosts, setRecentPosts] = useState<any[]>([])

  useEffect(() => {
    fetchStats()
    fetchRecentPosts()
  }, [])

  async function fetchStats() {
    const [posts, businesses, reports] = await Promise.all([
      supabase.from('posts').select('id', { count: 'exact', head: true }),
      supabase.from('businesses').select('id', { count: 'exact', head: true }),
      supabase.from('reports').select('id', { count: 'exact', head: true }),
    ])
    setStats({
      posts: posts.count || 0,
      users: 0,
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
