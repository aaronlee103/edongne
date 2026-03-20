'use client'

import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

const ISSUE_CATEGORIES = [
  { key: 'all', label: '전체' },
  { key: 'editor', label: '에디터 추천' },
  { key: 'topic', label: '이번주 토픽' },
  { key: 'realestate', label: '부동산' },
  { key: 'legal', label: '부동산 법률' },
  { key: 'living', label: '생활정보' },
  { key: 'construction', label: '건축/인테리어' },
  { key: 'finance', label: '주택융자' },
  { key: 'neighborhood', label: '이동네어때' },
]

const ITEMS_PER_PAGE = 12

export default function Home() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto px-4 py-10 text-center text-muted">로딩중...</div>}>
      <HomeContent />
    </Suspense>
  )
}

function HomeContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const [issueCategory, setIssueCategory] = useState('all')
  const [allPosts, setAllPosts] = useState<any[]>([])
  const [popularPosts, setPopularPosts] = useState<any[]>([])
  const [weeklyPopular, setWeeklyPopular] = useState<any[]>([])
  const [businessCounts, setBusinessCounts] = useState({ realtor: 0, builder: 0, lawyer: 0, mortgage: 0 })
  const [currentPage, setCurrentPage] = useState(1)

  // URL 쿼리 파라미터에서 카테고리 읽기
  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat && ISSUE_CATEGORIES.some(c => c.key === cat)) {
      setIssueCategory(cat)
    }
  }, [searchParams])

  useEffect(() => {
    fetchPopularPosts()
    fetchWeeklyPopular()
    fetchBusinessCounts()
  }, [])

  useEffect(() => {
    fetchAllPosts()
    setCurrentPage(1)
  }, [issueCategory])

  async function fetchAllPosts() {
    let query = supabase
      .from('posts')
      .select('*, users(nickname)')
      .eq('type', 'magazine')
      .order('created_at', { ascending: false })
    if (issueCategory !== 'all') {
      query = query.eq('category', issueCategory)
    }
    const { data } = await query
    if (data) setAllPosts(data)
  }

  async function fetchPopularPosts() {
    const { data } = await supabase
      .from('posts')
      .select('*, comments(id), votes(value)')
      .eq('type', 'community')
      .order('created_at', { ascending: false })
      .limit(6)
    if (data) {
      setPopularPosts(data.map((p: any) => ({
        ...p,
        vote_score: p.votes?.reduce((sum: number, v: any) => sum + v.value, 0) || 0,
        comment_count: p.comments?.length || 0,
      })))
    }
  }

  async function fetchWeeklyPopular() {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data } = await supabase
      .from('posts')
      .select('*, users(nickname)')
      .eq('type', 'magazine')
      .gte('created_at', weekAgo)
      .order('views', { ascending: false })
      .limit(4)
    if (data) setWeeklyPopular(data)
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
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간`
    return `${Math.floor(seconds / 86400)}일`
  }

  // Split posts: hero(1) + featured(2) + grid(rest with pagination)
  const heroPosts = allPosts.slice(0, 1)
  const featuredPosts = allPosts.slice(1, 3)
  const gridPosts = allPosts.slice(3)
  const totalPages = Math.ceil(gridPosts.length / ITEMS_PER_PAGE)
  const paginatedPosts = gridPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  function handleCategoryChange(key: string) {
    setIssueCategory(key)
    setCurrentPage(1)
  }

  return (
    <div>
      {/* ======= 이동네이슈 매거진 영역 ======= */}
      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4">
          {/* 카테고리 메뉴 */}
          <div className="flex items-center gap-1 overflow-x-auto py-3 border-b border-border">
            {ISSUE_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => handleCategoryChange(cat.key)}
                className={`px-3 py-1.5 text-sm whitespace-nowrap rounded-full transition-colors ${
                  issueCategory === cat.key
                    ? 'bg-black text-white font-medium'
                    : 'text-secondary hover:text-primary hover:bg-gray-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* 메인 레이아웃: 피처드 + 인기 */}
          <div className="grid md:grid-cols-3 gap-6 py-6">
            {/* 왼쪽: 오늘의 토픽 (대형 카드) */}
            <div className="md:col-span-2">
              {heroPosts[0] ? (
                <Link href={`/post/${heroPosts[0].id}`} className="block group">
                  <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-[16/9]">
                    {heroPosts[0].thumbnail ? (
                      <img src={heroPosts[0].thumbnail} alt="" className="w-full h-full object-cover opacity-70 group-hover:opacity-60 transition-opacity" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
                    )}
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <span className="inline-block bg-white text-black text-xs font-bold px-2 py-1 rounded mb-3 w-fit">오늘의 토픽</span>
                      <h2 className="text-white text-xl md:text-2xl font-bold leading-tight mb-2">{heroPosts[0].title}</h2>
                      <p className="text-gray-300 text-sm line-clamp-2">{heroPosts[0].content?.substring(0, 120)}</p>
                      {heroPosts[0].users?.nickname && (
                        <p className="text-gray-400 text-xs mt-2">by {heroPosts[0].users.nickname}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="rounded-xl bg-bg-light border border-dashed border-border aspect-[16/9] flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-muted text-sm mb-2">아직 매거진 글이 없습니다</p>
                    <Link href="/admin/magazine" className="text-xs text-primary hover:underline">관리자에서 작성하기</Link>
                  </div>
                </div>
              )}

              {/* 아래 작은 카드 2개 */}
              {featuredPosts.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {featuredPosts.map((post) => (
                    <Link key={post.id} href={`/post/${post.id}`} className="group block">
                      <div className="rounded-lg overflow-hidden border border-border hover:shadow-md transition-shadow">
                        {post.thumbnail ? (
                          <img src={post.thumbnail} alt="" className="w-full h-28 object-cover" />
                        ) : (
                          <div className="w-full h-28 bg-gradient-to-br from-gray-100 to-gray-200" />
                        )}
                        <div className="p-3">
                          <h3 className="text-sm font-bold line-clamp-2 group-hover:text-secondary transition-colors">{post.title}</h3>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted">
                            {post.users?.nickname && <span>{post.users.nickname}</span>}
                            {post.users?.nickname && <span>·</span>}
                            <span>{post.category}</span>
                            <span>·</span>
                            <span>{timeAgo(post.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 오른쪽: 이번주 인기 */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-bold">이번주 인기</h3>
                <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">📊</span>
              </div>
              <div className="space-y-4">
                {(weeklyPopular.length > 0 ? weeklyPopular : allPosts.slice(0, 4)).map((post, i) => (
                  <Link key={post.id} href={`/post/${post.id}`} className="flex gap-3 group">
                    <div className="flex items-start">
                      <span className={`text-lg font-bold w-6 ${i === 0 ? 'text-primary' : 'text-muted'}`}>{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium line-clamp-2 group-hover:text-secondary transition-colors">{post.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted">
                        {post.users?.nickname && <span>{post.users.nickname}</span>}
                        {post.users?.nickname && <span>·</span>}
                        <span>{post.category}</span>
                        <span>·</span>
                        <span>{timeAgo(post.created_at)}</span>
                        {post.views > 0 && <span>· 조회 {post.views}</span>}
                      </div>
                    </div>
                    {post.thumbnail && (
                      <img src={post.thumbnail} alt="" className="w-16 h-12 object-cover rounded shrink-0" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* 이슈 카드 리스트 (12개씩 페이지네이션) */}
          {paginatedPosts.length > 0 && (
            <div className="py-6 border-t border-border">
              <div className="grid md:grid-cols-4 gap-4">
                {paginatedPosts.map((post) => (
                  <Link key={post.id} href={`/post/${post.id}`} className="group block">
                    <div className="rounded-lg overflow-hidden border border-border hover:shadow-md transition-all">
                      {post.thumbnail ? (
                        <img src={post.thumbnail} alt="" className="w-full h-32 object-cover" />
                      ) : (
                        <div className="w-full h-32 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-muted text-xs">{post.category}</div>
                      )}
                      <div className="p-3">
                        <h3 className="text-sm font-medium line-clamp-2 group-hover:text-secondary">{post.title}</h3>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted">
                          {post.users?.nickname && <span>{post.users.nickname}</span>}
                          {post.users?.nickname && <span>·</span>}
                          <span>{timeAgo(post.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 mt-6">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded text-sm border border-border hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ←
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-colors ${
                        currentPage === page
                          ? 'bg-black text-white font-medium'
                          : 'border border-border hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded text-sm border border-border hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ======= 커뮤니티 + 업체 찾기 ======= */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-8">
          {/* 커뮤니티 인기글 */}
          <div className="md:col-span-2">
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
          </div>

          {/* 업체 찾기 사이드바 */}
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
      </section>
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
