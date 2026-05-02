'use client'

import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { useRegion } from '@/context/RegionContext'

const ISSUE_CATEGORIES = [
  { key: 'all', label: '전체' },
  { key: 'editor', label: '에디터 픽' },
  { key: 'neighborhood', label: '이동네어때' },
  { key: 'realestate', label: '부동산' },
  { key: 'legal', label: '부동산 법률' },
  { key: 'living', label: '생활정보' },
  { key: 'construction', label: '건축/인테리어' },
  { key: 'finance', label: '주택융자' },
]

const ITEMS_PER_PAGE = 12
const DEFAULT_REGION = 'ny'

function regionFilter(regionCode: string): string {
  if (regionCode === DEFAULT_REGION) {
    return `region.eq.${regionCode},region.eq.all,region.is.null`
  }
  return `region.eq.${regionCode},region.eq.all`
}

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
  const { regionCode } = useRegion()
  const [issueCategory, setIssueCategory] = useState('all')
  const [allPosts, setAllPosts] = useState<any[]>([])
  const [popularPosts, setPopularPosts] = useState<any[]>([])
  const [weeklyPopular, setWeeklyPopular] = useState<any[]>([])
  const [businessCounts, setBusinessCounts] = useState({ realtor: 0, builder: 0, lawyer: 0, mortgage: 0, mover: 0 })
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  // URL 쿼리 파라미터에서 카테고리 및 검색어 읽기
  useEffect(() => {
    const cat = searchParams.get('category')
    const search = searchParams.get('search')
    if (cat && ISSUE_CATEGORIES.some(c => c.key === cat)) {
      setIssueCategory(cat)
      setSearchTerm('')
    }
    if (search) {
      setSearchTerm(search)
      setIssueCategory('all')
    }
    if (!cat && !search) {
      setIssueCategory('all')
      setSearchTerm('')
    }
  }, [searchParams])

  useEffect(() => {
    Promise.all([fetchAllPosts(), fetchPopularPosts(), fetchWeeklyPopular(), fetchBusinessCounts()])
  }, [regionCode])

  useEffect(() => {
    fetchAllPosts()
    setCurrentPage(1)
  }, [issueCategory, searchTerm])

  async function fetchAllPosts() {
    let query = supabase
      .from('posts')
      .select('*, users(nickname)')
      .eq('type', 'magazine')
      .or('published.is.null,published.eq.true')
      .or(regionFilter(regionCode))
      .order('created_at', { ascending: false })
    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
    } else if (issueCategory !== 'all') {
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
      .or('published.is.null,published.eq.true')
      .or(regionFilter(regionCode))
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
      .or('published.is.null,published.eq.true')
      .or(regionFilter(regionCode))
      .gte('created_at', weekAgo)
      .order('views', { ascending: false })
      .limit(5)
    if (data) setWeeklyPopular(data)
  }

  function getBusinessRegionCodes(rc: string): string[] {
    if (rc === DEFAULT_REGION) return ['NY', 'NJ']
    return [rc.toUpperCase()]
  }

  async function fetchBusinessCounts() {
    const types = ['realtor', 'builder', 'lawyer', 'mortgage', 'mover'] as const
    const codes = getBusinessRegionCodes(regionCode)
    const results = await Promise.all(
      types.map(t => supabase.from('businesses').select('id', { count: 'exact', head: true }).eq('type', t).in('region', codes))
    )
    const counts: any = {}
    types.forEach((t, i) => { counts[t] = results[i].count || 0 })
    setBusinessCounts(counts)
  }

  const CATEGORIES: Record<string, string> = {
    free: '자유', qna: '질문답변', info: '정보', buysell: '사고팔고',
    housing: '렌트/룸메',
  }

  function timeAgo(date: string) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간`
    return `${Math.floor(seconds / 86400)}일`
  }

  function stripMarkdown(text: string): string {
    return text
      .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/^#{1,3}\s+/gm, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/\n{2,}/g, ' ')
      .trim()
  }

  function handleCategoryChange(key: string) {
    setIssueCategory(key)
    setCurrentPage(1)
  }

  // NYT-style 레이아웃용 데이터 분할
  const heroPost = allPosts[0]
  const secondPost = allPosts[1]
  const sidebarPosts = allPosts.slice(2, 5)
  const belowHeroPosts = allPosts.slice(5)
  const totalPages = Math.ceil(belowHeroPosts.length / ITEMS_PER_PAGE)
  const paginatedPosts = belowHeroPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div>
      {/* ======= 검색 결과 (리스트 뷰) ======= */}
      {searchTerm ? (
        <section className="border-b border-border">
          <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">{searchTerm}</h1>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted">{allPosts.length}건의 검색 결과</p>
                <Link href="/" className="text-sm text-muted hover:text-primary">검색 초기화 ✕</Link>
              </div>
            </div>
            {allPosts.length > 0 ? (
              <div className="divide-y divide-border">
                {allPosts.map((post) => {
                  const catLabel = ISSUE_CATEGORIES.find(c => c.key === post.category)?.label || post.category
                  const excerpt = stripMarkdown(post.content || '').substring(0, 180)
                  const dateStr = new Date(post.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
                  return (
                    <Link key={post.id} href={`/post/${post.id}`} className="flex gap-5 py-5 group">
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-muted uppercase tracking-wide">{catLabel}</span>
                        <h2 className="text-lg font-bold mt-1 mb-1.5 group-hover:text-secondary transition-colors leading-snug">{post.title}</h2>
                        <p className="text-sm text-secondary line-clamp-2 leading-relaxed">{excerpt}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted">
                          {post.users?.nickname && <span>by {post.users.nickname}</span>}
                          {post.users?.nickname && <span>·</span>}
                          <span>{dateStr}</span>
                          {post.views > 0 && <><span>·</span><span>조회 {post.views}</span></>}
                        </div>
                      </div>
                      {post.thumbnail && (
                        <div className="w-28 h-20 md:w-36 md:h-24 flex-shrink-0 rounded overflow-hidden">
                          <img src={post.thumbnail} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted">"{searchTerm}"에 대한 검색 결과가 없습니다.</p>
                <Link href="/" className="text-sm text-primary hover:underline mt-2 inline-block">홈으로 돌아가기</Link>
              </div>
            )}
          </div>
        </section>
      ) : null}

      {/* ======= 매거진 영역 (NYT 스타일) ======= */}
      {!searchTerm && (
        <section className="border-b border-border">
          <div className="max-w-6xl mx-auto px-4">
            {/* 카테고리 탭 */}
            <nav className="flex gap-0.5 overflow-x-auto border-b border-border" style={{ scrollbarWidth: 'none' }}>
              {ISSUE_CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => handleCategoryChange(cat.key)}
                  className={`px-4 py-3 text-sm whitespace-nowrap transition-colors relative ${
                    issueCategory === cat.key
                      ? 'font-bold text-black'
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  {cat.label}
                  {issueCategory === cat.key && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                  )}
                </button>
              ))}
            </nav>

            {/* NYT-style 히어로 그리드 */}
            {allPosts.length > 0 ? (
              <>
                <div className="grid md:grid-cols-12 gap-0 pt-6 pb-8">
                  {/* 왼쪽: 메인 기사 */}
                  {heroPost && (
                    <div className="md:col-span-6 md:border-r md:border-border md:pr-6">
                      <Link href={`/post/${heroPost.id}`} className="group block">
                        {heroPost.thumbnail && (
                          <img
                            src={heroPost.thumbnail}
                            alt=""
                            className="w-full aspect-[16/10] object-cover"
                          />
                        )}
                        <div className="mt-3">
                          <span className="text-xs text-gray-500 uppercase tracking-wide">
                            {ISSUE_CATEGORIES.find(c => c.key === heroPost.category)?.label || heroPost.category}
                          </span>
                          <h2 className="text-2xl md:text-[1.75rem] font-bold mt-1 mb-2 group-hover:text-gray-600 transition-colors leading-tight">
                            {heroPost.title}
                          </h2>
                          <p className="text-[15px] text-gray-600 leading-relaxed line-clamp-3">
                            {stripMarkdown(heroPost.content || '').substring(0, 200)}
                          </p>
                          <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                            {heroPost.users?.nickname && <span>by {heroPost.users.nickname}</span>}
                            <span>·</span>
                            <span>{timeAgo(heroPost.created_at)}</span>
                            {heroPost.views > 0 && <><span>·</span><span>조회 {heroPost.views}</span></>}
                          </div>
                        </div>
                      </Link>
                    </div>
                  )}

                  {/* 가운데: 두 번째 기사 */}
                  {secondPost && (
                    <div className="md:col-span-3 md:border-r md:border-border md:px-5 mt-8 md:mt-0">
                      <Link href={`/post/${secondPost.id}`} className="group block">
                        {secondPost.thumbnail && (
                          <img
                            src={secondPost.thumbnail}
                            alt=""
                            className="w-full aspect-[4/3] object-cover"
                          />
                        )}
                        <div className="mt-3">
                          <span className="text-xs text-gray-500 uppercase tracking-wide">
                            {ISSUE_CATEGORIES.find(c => c.key === secondPost.category)?.label || secondPost.category}
                          </span>
                          <h3 className="text-lg font-bold mt-1 mb-1.5 group-hover:text-gray-600 transition-colors leading-snug">
                            {secondPost.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                            {stripMarkdown(secondPost.content || '').substring(0, 120)}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                            <span>{timeAgo(secondPost.created_at)}</span>
                            {secondPost.views > 0 && <><span>·</span><span>조회 {secondPost.views}</span></>}
                          </div>
                        </div>
                      </Link>
                    </div>
                  )}

                  {/* 오른쪽: 사이드 기사 리스트 */}
                  <div className="md:col-span-3 md:pl-5 mt-8 md:mt-0">
                    <div className="divide-y divide-border">
                      {sidebarPosts.map((post) => (
                        <Link key={post.id} href={`/post/${post.id}`} className="flex gap-3 py-4 first:pt-0 group">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[15px] font-bold leading-snug group-hover:text-gray-600 transition-colors line-clamp-3">
                              {post.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                              {stripMarkdown(post.content || '').substring(0, 80)}
                            </p>
                          </div>
                          {post.thumbnail && (
                            <img src={post.thumbnail} alt="" className="w-[72px] h-[72px] object-cover shrink-0" />
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 하단 기사 카드 그리드 */}
                {paginatedPosts.length > 0 && (
                  <div className="border-t border-border py-6">
                    {/* 첫 줄: 큰 카드 4개 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                      {paginatedPosts.slice(0, 4).map((post) => (
                        <Link key={post.id} href={`/post/${post.id}`} className="group block">
                          {post.thumbnail ? (
                            <img src={post.thumbnail} alt="" className="w-full aspect-[3/2] object-cover" />
                          ) : (
                            <div className="w-full aspect-[3/2] bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                              {ISSUE_CATEGORIES.find(c => c.key === post.category)?.label || ''}
                            </div>
                          )}
                          <h3 className="text-sm font-bold mt-2 leading-snug group-hover:text-gray-600 transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
                            {post.users?.nickname && <span>{post.users.nickname}</span>}
                            {post.users?.nickname && <span>·</span>}
                            <span>{timeAgo(post.created_at)}</span>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* 나머지: 리스트 형태 */}
                    {paginatedPosts.length > 4 && (
                      <div className="mt-6 grid md:grid-cols-2 gap-0 divide-y md:divide-y-0">
                        {paginatedPosts.slice(4).map((post, idx) => (
                          <Link
                            key={post.id}
                            href={`/post/${post.id}`}
                            className={`flex gap-4 py-4 group border-b border-border ${idx % 2 === 0 ? 'md:border-r md:pr-5' : 'md:pl-5'}`}
                          >
                            <div className="flex-1 min-w-0">
                              <span className="text-xs text-gray-400 uppercase tracking-wide">
                                {ISSUE_CATEGORIES.find(c => c.key === post.category)?.label || post.category}
                              </span>
                              <h3 className="text-[15px] font-bold mt-0.5 group-hover:text-gray-600 transition-colors line-clamp-2 leading-snug">
                                {post.title}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{stripMarkdown(post.content || '').substring(0, 100)}</p>
                            </div>
                            {post.thumbnail && (
                              <img src={post.thumbnail} alt="" className="w-24 h-16 object-cover shrink-0" />
                            )}
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* 페이지네이션 */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-1 mt-8">
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
              </>
            ) : (
              <div className="py-16 text-center">
                <p className="text-muted text-sm">아직 매거진 글이 없습니다</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ======= 이번주 인기 + 커뮤니티 + 업체 찾기 ======= */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-8">
          {/* 왼쪽: 이번주 인기 + 커뮤니티 */}
          <div className="md:col-span-2 space-y-10">
            {/* 이번주 인기 */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <h2 className="text-xl font-bold">이번주 인기</h2>
                <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">📊</span>
              </div>
              <div className="grid md:grid-cols-2 gap-0">
                {(weeklyPopular.length > 0 ? weeklyPopular : allPosts.slice(0, 5)).map((post, i) => (
                  <Link
                    key={post.id}
                    href={`/post/${post.id}`}
                    className={`flex gap-3 py-4 group border-b border-border ${i % 2 === 0 ? 'md:border-r md:pr-5' : 'md:pl-5'}`}
                  >
                    <span className={`text-2xl font-bold w-8 shrink-0 ${i === 0 ? 'text-black' : 'text-gray-300'}`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold line-clamp-2 group-hover:text-gray-600 transition-colors">{post.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        {post.users?.nickname && <span>{post.users.nickname}</span>}
                        <span>·</span>
                        <span>{timeAgo(post.created_at)}</span>
                        {post.views > 0 && <><span>·</span><span>조회 {post.views}</span></>}
                      </div>
                    </div>
                    {post.thumbnail && (
                      <img src={post.thumbnail} alt="" className="w-16 h-12 object-cover shrink-0" />
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* 커뮤니티 */}
            <div>
              <div className="flex items-center justify-between mb-5">
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
          </div>

          {/* 오른쪽: 업체 찾기 + 광고 */}
          <aside>
            <h2 className="text-xl font-bold mb-6">업체 찾기</h2>
            <div className="space-y-3">
              <DirectoryLink href="/realtors" label="부동산 리얼터" count={businessCounts.realtor} />
              <DirectoryLink href="/builders" label="건축/인테리어" count={businessCounts.builder} />
              <DirectoryLink href="/lawyers" label="변호사" count={businessCounts.lawyer} />
              <DirectoryLink href="/mortgage" label="융자/모기지" count={businessCounts.mortgage} />
              <DirectoryLink href="/movers" label="이사" count={businessCounts.mover} />
            </div>

            <div className="mt-8 p-4 bg-bg-light rounded-lg border border-border">
              <h3 className="font-semibold text-sm mb-2">업체 등록 안내</h3>
              <p className="text-xs text-muted mb-3">이동네에 업체를 등록하고 더 많은 고객을 만나보세요.</p>
              <Link href="/business-register" className="text-xs font-medium text-primary hover:underline">업체 등록하기 →</Link>
            </div>

            {/* 광고 모집 배너 */}
            <Link
              href="/contact"
              className="block mt-6 rounded-lg overflow-hidden hover:opacity-95 transition-opacity border border-dashed border-gray-300 bg-gray-50"
            >
              <div className="px-5 py-6 text-center">
                <p className="text-xs tracking-widest mb-2 text-gray-400 uppercase">Advertisement</p>
                <p className="text-lg font-medium text-gray-600 leading-snug">
                  이 자리에 광고를 게재해보세요
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  뉴욕·뉴저지 지역 비즈니스를 홍보하세요
                </p>
                <span className="inline-block mt-3 text-xs font-medium text-white bg-black px-4 py-1.5 rounded-full">
                  광고 문의하기
                </span>
              </div>
            </Link>
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
