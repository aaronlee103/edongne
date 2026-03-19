'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'

export default function Home() {
  const supabase = createClient()
  const [topics, setTopics] = useState<any[]>([])
  const [popularPosts, setPopularPosts] = useState<any[]>([])
  const [businessCounts, setBusinessCounts] = useState({ realtor: 0, builder: 0, lawyer: 0, mortgage: 0 })

  useEffect(() => {
    fetchTopics()
    fetchPopularPosts()
    fetchBusinessCounts()
  }, [])

  async function fetchTopics() {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('type', 'magazine')
      .order('created_at', { ascending: false })
      .limit(4)
    if (data) setTopics(data)
  }

  async function fetchPopularPosts() {
    const { data } = await supabase
      .from('posts')
      .select('*, comments(id), votes(value)')
      .eq('type', 'community')
      .order('created_at', { ascending: false })
      .limit(5)
    if (data) {
      setPopularPosts(data.map((p: any) => ({
        ...p,
        vote_score: p.votes?.reduce((sum: number, v: any) => sum + v.value, 0) || 0,
        comment_count: p.comments?.length || 0,
      })))
    }
  }

  async function fetchBusinessCounts() {
    const types = ['realtor', 'builder', 'lawyer', 'mortgage'] as const
    const counts: any = {}
    for (const t of types) {
      const { count } = await supabase.from('businesses').select('id', { count: 'exact', head: true }).eq('type', t)
      counts[t] = count || 0
    }
    setBusinessCounts(counts)
  }

  const CATEGORIES: Record<string, string> = {
    free: '자유', qna: '질문답변', info: '정보', buysell: '사고팔고',
    jobs: '구인구직', housing: '렌트/룸메',
  }

  function timeAgo(date: string) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`
    return `${Math.floor(seconds / 86400)}일 전`
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 히어로 */}
      <section className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">이동네</h1>
        <p className="text-muted text-lg">뉴욕·뉴저지 한인을 위한 부동산·생활 커뮤니티</p>
      </section>

      {/* 매거진 토픽 */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">매거진</h2>
          <Link href="/board" className="text-sm text-muted hover:text-primary">더보기 →</Link>
        </div>
        {topics.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {topics.map((post) => (
              <Link key={post.id} href={`/post/${post.id}`} className="magazine-card block border border-border rounded-lg overflow-hidden">
                {post.thumbnail && (
                  <img src={post.thumbnail} alt="" className="w-full h-40 object-cover" />
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-muted uppercase tracking-wider">{post.category}</span>
                    {post.tags?.map((t: string) => (
                      <span key={t} className="text-xs text-muted">#{t}</span>
                    ))}
                  </div>
                  <h3 className="text-lg font-bold mb-1">{post.title}</h3>
                  <p className="text-sm text-secondary line-clamp-2">{post.content?.substring(0, 100)}</p>
                  <span className="text-xs text-muted mt-2 block">{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 border border-dashed border-border rounded-lg text-center">
              <p className="text-sm text-muted">아직 매거진 글이 없습니다</p>
              <Link href="/admin/magazine" className="text-xs text-primary hover:underline mt-1 block">관리자에서 작성하기</Link>
            </div>
          </div>
        )}
      </section>

      {/* 커뮤니티 + 사이드바 */}
      <div className="grid md:grid-cols-3 gap-8">
        <section className="md:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">커뮤니티</h2>
            <Link href="/board" className="text-sm text-muted hover:text-primary">더보기 →</Link>
          </div>
          {popularPosts.length > 0 ? (
            <div className="space-y-1">
              {popularPosts.map((post) => (
                <Link key={post.id} href={`/post/${post.id}`} className="flex items-center gap-3 py-3 border-b border-border hover:bg-gray-50 px-2 rounded transition-colors">
                  <span className="text-xs text-muted font-medium w-16 shrink-0">{CATEGORIES[post.category] || post.category}</span>
                  <span className="text-sm flex-1 truncate">{post.title}</span>
                  <span className="text-xs text-muted shrink-0">💬 {post.comment_count}</span>
                  <span className="text-xs text-muted shrink-0">▲ {post.vote_score}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-border rounded-lg">
              <p className="text-sm text-muted mb-2">아직 게시글이 없습니다</p>
              <Link href="/write" className="text-sm bg-black text-white px-4 py-1.5 rounded-full hover:bg-gray-800">첫 글 작성하기</Link>
            </div>
          )}
        </section>

        <aside>
          <h2 className="text-xl font-bold mb-6">업체 찾기</h2>
          <div className="space-y-3">
            <DirectoryLink href="/realtors" label="부동산 리얼터" count={businessCounts.realtor} />
            <DirectoryLink href="/builders" label="건축/인테리어" count={businessCounts.builder} />
            <DirectoryLink href="/lawyers" label="변호사" count={businessCounts.lawyer} />
            <DirectoryLink href="/mortgage" label="융자/모기지" count={businessCounts.mortgage} />
          </div>

          <div className="mt-8 p-4 bg-bg-light rounded-lg border border-border">
            <h3 className="font-semibold text-sm mb-2">업체 등록 안내</h3>
            <p className="text-xs text-muted mb-3">이동네에 업체를 등록하고 더 많은 고객을 만나보세요.</p>
            <Link href="/pricing" className="text-xs font-medium text-primary hover:underline">요금 안내 보기 →</Link>
          </div>
        </aside>
      </div>
    </div>
  )
}

function DirectoryLink({ href, label, count }: { href: string; label: string; count: number }) {
  return (
    <Link href={href} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-gray-50 transition-colors">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs text-muted">{count}개</span>
    </Link>
  )
}
