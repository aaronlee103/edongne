'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
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
  const [editorPicks, setEditorPicks] = useState<any[]>([])
  const [popularPosts, setPopularPosts] = useState<any[]>([])
  const [weeklyPopular, setWeeklyPopular] = useState<any[]>([])
  const [businessCounts, setBusinessCounts] = useState({ realtor: 0, builder: 0, lawyer: 0, mortgage: 0, mover: 0 })
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const slideInterval = useRef<NodeJS.Timeout | null>(null)

  // 에디터 픽 자동 슬라이드
  const startSlideTimer = useCallback(() => {
    if (slideInterval.current) clearInterval(slideInterval.current)
    slideInterval.current = setInterval(() => {
      setCurrentSlide(prev => (editorPicks.length > 0 ? (prev + 1) % editorPicks.length : 0))
    }, 4000)
  }, [editorPicks.length])

  useEffect(() => {
    if (!isPaused && editorPicks.length > 1) {
      startSlideTimer()
    }
    return () => { if (slideInterval.current) clearInterval(slideInterval.current) }
  }, [isPaused, editorPicks.length, startSlideTimer])

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
    Promise.all([fetchEditorPicks(), fetchAllPosts(), fetchPopularPosts(), fetchWeeklyPopular(), fetchBusinessCounts()])
  }, [regionCode])

  useEffect(() => {
    fetchAllPosts()
    setCurrentPage(1)
  }, [issueCategory, searchTerm])

  async function fetchEditorPicks() {
    const { data } = await supabase
      .from('posts')
      .select('*, users(nickname)')
      .eq('type', 'magazine')
      .eq('category', 'editor')
      .or('published.is.null,published.eq.true')
      .or(regionFilter(regionCode))
      .order('created_at', { ascending: false })
      .limit(5)
    if (data) setEditorPicks(data)
  }

  async function fetchAllPosts() {
    let query = supabase
      .from('posts')
      .select('*, users(nickname)')
      .eq('type', 'magazine')
      .or('published.is.null,published.eq.true')
      .or(regionFilter(regionCode))
      .order('created_at', { ascending: false })
    if (searchTerm) {
      // 제목 또는 내용에서 검색어 포함 여부 확인
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

  // 에디터 픽 ID를 제외한 나머지 글
  const editorPickIds = new Set(editorPicks.map(p => p.id))
  const nonEditorPosts = allPosts.filter(p => !editorPickIds.has(p.id))
  // 슬라이드 아래 2개 카드
  const featuredPosts = nonEditorPosts.slice(0, 2)
  // 나머지 그리드 (페이지네이션)
  const gridPosts = nonEditorPosts.slice(2)
  const totalPages = Math.ceil(gridPosts.length / ITEMS_PER_PAGE)
  const paginatedPosts = gridPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  function stripMarkdown(text: string): string {
    return text
      .replace(/!\[[^\]]*\]\([^)]+\)/g, '')   // 이미지 제거
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 링크 → 텍스트만
      .replace(/^#{1,3}\s+/gm, '')              // 헤딩 제거
      .replace(/\*\*(.+?)\*\*/g, '$1')          // 볼드 제거
      .replace(/\*(.+?)\*/g, '$1')              // 이탈릭 제거
      .replace(/\n{2,}/g, ' ')                  // 줄바꿈 → 공백
      .trim()
  }

  function handleCategoryChange(key: string) {
    setIssueCategory(key)
    setCurrentPage(1)
  }

  return (
    <div>
      {/* ======= 검색 결과 (NYT 스타일 리스트) ======= */}
      {searchTerm ? (
        <section className="border-b border-border">
          <div className="max-w-3xl mx-auto px-4 py-8">
            {/* 검색어 헤더 */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">{searchTerm}</h1>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted">{allPosts.length}건의 검색 결과</p>
                <Link href="/" className="text-sm text-muted hover:text-primary">검색 초기화 ✕</Link>
              </div>
            </div>

            {/* 검색 결과 리스트 */}
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

      {/* ======= 이동네이슈 매거진 영역 (검색 중이 아닐 때만) ======= */}
      {!searchTerm && <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4">
          {/* 메인 레이아웃: 피처드 + 인기 */}
          <div className="grid md:grid-cols-3 gap-6 py-6">
            {/* 왼쪽: 에디터 픽 슬라이드 */}
            <div className="md:col-span-2">
              {editorPicks.length > 0 ? (
                <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-[16/9]">
                  {/* 슬라이드 컨테이너 */}
                  {editorPicks.map((post, idx) => (
                    <Link
                      key={post.id}
                      href={`/post/${post.id}`}
                      className={`absolute inset-0 transition-opacity duration-700 ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                      {post.thumbnail ? (
                        <img src={post.thumbnail} alt="" className="w-full h-full object-cover opacity-70 hover:opacity-60 transition-opacity" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
                      )}
                      <div className="absolute inset-0 flex flex-col justify-end p-6">
                        <span className="inline-block bg-white text-black text-xs font-bold px-2 py-1 rounded mb-3 w-fit">에디터 픽</span>
                        <h2 className="text-white text-xl md:text-2xl font-bold leading-tight mb-2">{post.title}</h2>
                        <p className="text-gray-300 text-sm line-clamp-2">{stripMarkdown(post.content || '').substring(0, 120)}</p>
                        {post.users?.nickname && (
                          <p className="text-gray-400 text-xs mt-2">by {post.users.nickname}</p>
                        )}
                      </div>
                    </Link>
                  ))}

                  {/* 좌우 화살표 */}
                  {editorPicks.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentSlide(prev => (prev - 1 + editorPicks.length) % editorPicks.length)
                          setIsPaused(true)
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="10,2 4,8 10,14" /></svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentSlide(prev => (prev + 1) % editorPicks.length)
                          setIsPaused(true)
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6,2 12,8 6,14" /></svg>
                      </button>
                    </>
                  )}

                  {/* 컨트롤: 일시정지/재생 + 슬라이드 번호 */}
                  {editorPicks.length > 1 && (
                    <div className="absolute bottom-4 right-4 z-20 flex items-center gap-0 bg-black/60 rounded-full overflow-hidden">
                      <button
                        onClick={(e) => { e.preventDefault(); setIsPaused(!isPaused) }}
                        className="flex items-center justify-center w-10 h-10 text-white hover:bg-white/10 transition-colors"
                      >
                        {isPaused ? (
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><polygon points="2,0 14,7 2,14" /></svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="0" width="4" height="14" /><rect x="9" y="0" width="4" height="14" /></svg>
                        )}
                      </button>
                      <span className="text-white text-sm font-medium pr-4 tabular-nums">
                        {currentSlide + 1} / {editorPicks.length}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl bg-bg-light border border-dashed border-border aspect-[16/9] flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-muted text-sm mb-2">아직 매거진 글이 없습니다</p>
                    <Link href="/admin/magazine" className="text-xs text-primary hover:underline">관리자에서 작성하기</Link>
                  </div>
                </div>
              )}

              {/* 슬라이드 아래 최신 2개 카드 */}
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
                {(weeklyPopular.length > 0 ? weeklyPopular : allPosts.slice(0, 5)).map((post, i) => (
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

              {/* 배너 광고 모집 */}
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
      </section>}

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
              <DirectoryLink href="/movers" label="이사" count={businessCounts.mover} />
            </div>

            <div className="mt-8 p-4 bg-bg-light rounded-lg border border-border">
              <h3 className="font-semibold text-sm mb-2">업체 등록 안내</h3>
              <p className="text-xs text-muted mb-3">이동네에 업체를 등록하고 더 많은 고객을 만나보세요.</p>
              <Link href="/business-register" className="text-xs font-medium text-primary hover:underline">업체 등록하기 →</Link>
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
