'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { useAdminRegion } from '@/context/AdminRegionContext'

const CATEGORIES: Record<string, string> = {
  free: '자유', qna: '질문답변', info: '정보', buysell: '사고팔고',
  jobs: '구인구직', housing: '렌트/룸메', topic: '토픽', editor: '에디터',
}

function regionFilterStr(selectedRegion: string) {
  if (selectedRegion === 'ny') return `region.eq.${selectedRegion},region.eq.all,region.is.null`
  return `region.eq.${selectedRegion},region.eq.all`
}

export default function AdminPostsPage() {
  const supabase = createClient()
  const { selectedRegion } = useAdminRegion()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchPosts() }, [filter, selectedRegion])

  async function fetchPosts() {
    setLoading(true)
    let query = supabase
      .from('posts')
      .select('*, comments(id)')
      .or(regionFilterStr(selectedRegion))
      .order('created_at', { ascending: false })
      .limit(50)

    if (filter !== 'all') query = query.eq('type', filter)

    const { data } = await query
    if (data) setPosts(data.map((p: any) => ({ ...p, comment_count: p.comments?.length || 0 })))
    setLoading(false)
  }

  async function deletePost(id: string) {
    if (!confirm('이 게시글을 삭제하시겠습니까?')) return
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) alert('삭제 실패: ' + error.message)
    else fetchPosts()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">게시글 관리</h1>
        <span className="text-sm text-muted">{posts.length}개</span>
      </div>

      <div className="flex gap-2 mb-4">
        {[['all', '전체'], ['community', '커뮤니티'], ['notice', '공지'], ['magazine', '매거진']].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`px-3 py-1 text-xs rounded-full ${filter === k ? 'bg-black text-white' : 'bg-gray-100 text-secondary'}`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg-light border-b border-border">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-muted">제목</th>
              <th className="text-left px-4 py-2 font-medium text-muted w-20">유형</th>
              <th className="text-left px-4 py-2 font-medium text-muted w-20">카테고리</th>
              <th className="text-left px-4 py-2 font-medium text-muted w-16">조회</th>
              <th className="text-left px-4 py-2 font-medium text-muted w-16">댓글</th>
              <th className="text-left px-4 py-2 font-medium text-muted w-24">날짜</th>
              <th className="text-left px-4 py-2 font-medium text-muted w-24">관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted">불러오는 중...</td></tr>
            ) : posts.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted">게시글이 없습니다</td></tr>
            ) : posts.map((post) => (
              <tr key={post.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                <td className="px-4 py-2.5 truncate max-w-[250px]">
                  <Link href={`/post/${post.id}`} className="hover:underline">{post.title}</Link>
                </td>
                <td className="px-4 py-2.5 text-xs text-muted">{post.type}</td>
                <td className="px-4 py-2.5 text-xs">{CATEGORIES[post.category] || post.category}</td>
                <td className="px-4 py-2.5 text-muted">{post.views || 0}</td>
                <td className="px-4 py-2.5 text-muted">{post.comment_count}</td>
                <td className="px-4 py-2.5 text-xs text-muted">{new Date(post.created_at).toLocaleDateString('ko-KR')}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Link href={`/post/${post.id}/edit`} className="text-xs text-blue-500 hover:underline">수정</Link>
                    <button onClick={() => deletePost(post.id)} className="text-xs text-red-500 hover:underline">삭제</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
