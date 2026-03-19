'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

export default function AdminContentPage() {
  const supabase = createClient()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('magazine')

  useEffect(() => { fetchPosts() }, [filter])

  async function fetchPosts() {
    setLoading(true)
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('type', filter)
      .order('created_at', { ascending: false })
      .limit(30)
    if (data) setPosts(data)
    setLoading(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">콘텐츠 관리</h1>
        <Link href="/write" className="bg-black text-white px-3 py-1.5 rounded-full text-xs hover:bg-gray-800">
          + 새 콘텐츠
        </Link>
      </div>

      <div className="flex gap-2 mb-4">
        {[['magazine', '매거진'], ['notice', '공지']].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`px-3 py-1 text-xs rounded-full ${filter === k ? 'bg-black text-white' : 'bg-gray-100 text-secondary'}`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-center py-8 text-muted text-sm">불러오는 중...</p>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <p className="text-muted text-sm mb-2">{filter === 'magazine' ? '매거진' : '공지'} 콘텐츠가 없습니다</p>
            <p className="text-xs text-muted">대시보드의 빠른 글쓰기에서 유형을 선택해 작성하세요</p>
          </div>
        ) : posts.map((post) => (
          <div key={post.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-gray-50">
            <div>
              <span className="text-xs text-muted mr-2">{post.category}</span>
              <Link href={`/post/${post.id}`} className="text-sm font-medium hover:underline">{post.title}</Link>
              <p className="text-xs text-muted mt-1">{new Date(post.created_at).toLocaleDateString('ko-KR')} · 조회 {post.views || 0}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
