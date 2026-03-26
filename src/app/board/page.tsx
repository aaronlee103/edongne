'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRegion } from '@/context/RegionContext'

const CATEGORIES = [
  { key: 'all', label: '전체' },
  { key: 'free', label: '자유' },
  { key: 'qna', label: '질문답변' },
  { key: 'info', label: '정보' },
  { key: 'buysell', label: '사고팔고' },
  { key: 'housing', label: '렌트/룸메' },
]

// 매물 페이지 링크 (별도 페이지로 이동)
const LISTING_TABS = [
  { label: '매매', href: '/listings?type=sale' },
  { label: '레트매물', href: '/listings?type=rent' },
]

const DEFAULT_REGION = 'ny'

function regionFilter(regionCode: string): string {
  if (regionCode === DEFAULT_REGION) {
    return `region.eq.${regionCode},region.eq.all,region.is.null`
  }
  return `region.eq.${regionCode},region.eq.all`
}

export default function BoardPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { regionCode } = useRegion()

  useEffect(() => {
    fetchPosts()
  }, [activeCategory, regionCode])

  async function fetchPosts() {
    setLoading(true)

    let query = supabase
      .from('posts')
      .select('*, votes(value), comments(id)')
      .eq('type', 'community')
      .or('published.is.null,published.eq.true')
      .or(regionFilter(regionCode))
      .order('created_at', { ascending: false })
      .limit(20)

    if (activeCategory !== 'all') {
      query = query.eq('category', activeCategory)
    }

    const { data, error } = await query

    if (!error && data) {
      setPosts(data.map((p: any) => ({
        ...p,
        vote_score: p.votes?.reduce((sum: number, v: any) => sum + v.value, 0) || 0,
        comment_count: p.comments?.length || 0,
      })))
    }
    setLoading(false)
  }

  function timeAgo(date: string) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return '방금'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`
    return `${Math.floor(seconds / 86400)}일 전`
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">커뮤니티</h1>
        <Link
          href="/write"
          className="text-sm bg-black text-white px-4 py-1.5 rounded-full hover:bg-gray-800 transition-colors"
        >
          글쓰기
        </Link>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${
              activeCategory === cat.key
                ? 'bg-black text-white'
                : 'bg-gray-100 text-secondary hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}

        {/* 구분선 - 모바인에서는 숨김 */}
        <div className="hidden sm:block w-px bg-gray-300 mx-1 self-stretch" />

        {/* 매물 탭 (별도 페이지 링크) */}
        {LISTING_TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 flex items-center gap-1"
          >
            🏠 {tab.label}
          </Link>
        ))}
      </div>

      {/* 게시글 목록 */}
      {loading ? (
        <div className="text-center py-12 text-muted text-sm">불러오는 중...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted text-sm mb-4">아직 게시글이 없습니다.</p>
          <Link
            href="/write"
            className="text-sm bg-black text-white px-4 py-1.5 rounded-full hover:bg-gray-800"
          >
            첫 글 작성하기
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/post/${post.id}`}
              className="block py-4 hover:bg-gray-50 px-2 -mx-2 rounded transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center text-xs text-muted pt-0.5 w-8 shrink-0">
                  <span>▲</span>
                  <span className="font-medium text-primary">{post.vote_score}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded text-muted">
                      {CATEGORIES.find(c => c.key === post.category)?.label || post.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium truncate">{post.title}</h3>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted">
                    <span>{timeAgo(post.created_at)}</span>
                    <span>💬 {post.comment_count}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
