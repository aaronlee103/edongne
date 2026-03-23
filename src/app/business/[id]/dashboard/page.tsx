'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

export default function BusinessDashboard() {
  const params = useParams()
  const router = useRouter()
  const bizId = params.id as string
  const supabase = createClient()

  const [business, setBusiness] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ views: 0, reviews: 0, avgRating: 0, posts: 0 })
  const [recentReviews, setRecentReviews] = useState<any[]>([])
  const [authorPosts, setAuthorPosts] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { router.push('/auth'); return }
      setUser(u)

      const { data: biz } = await supabase.from('businesses').select('*').eq('id', bizId).single()
      if (!biz || biz.user_id !== u.id) { router.push('/mypage'); return }
      setBusiness(biz)

      // Reviews
      const { data: reviews } = await supabase
        .from('reviews')
        .select('*, user:users(nickname, avatar_animal)')
        .eq('business_id', bizId)
        .order('created_at', { ascending: false })
        .limit(5)
      if (reviews) {
        setRecentReviews(reviews)
        const avg = reviews.length > 0
          ? reviews.reduce((s, r) => s + r.score, 0) / reviews.length
          : 0
        // Get total count
        const { count: totalReviews } = await supabase
          .from('reviews')
          .select('id', { count: 'exact', head: true })
          .eq('business_id', bizId)
        setStats(prev => ({ ...prev, reviews: totalReviews || 0, avgRating: avg }))
      }

      // Posts by owner
      const { data: posts } = await supabase
        .from('posts')
        .select('id, title, views, created_at, type')
        .eq('user_id', u.id)
        .or('published.is.null,published.eq.true')
        .order('created_at', { ascending: false })
        .limit(10)
      if (posts) {
        setAuthorPosts(posts)
        const totalPostViews = posts.reduce((s, p) => s + (p.views || 0), 0)
        setStats(prev => ({ ...prev, posts: posts.length, views: totalPostViews }))
      }

      setLoading(false)
    }
    load()
  }, [bizId])

  const AVATAR_EMOJI: Record<string, string> = { bear: '🐻', rabbit: '🐰', fox: '🦊', cat: '🐱', dog: '🐶', owl: '🦉', penguin: '🐧', deer: '🦌' }
  const stars = (n: number) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n))

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-muted text-sm">불러오는 중...</div>
  if (!business) return null

  const PLAN_LABEL: Record<string, string> = { basic: '기본', premium: '프리미엄', pro: '프리미엄 플러스' }
  const canWriteMagazine = business.plan === 'premium' || business.plan === 'pro'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">광고 관리</h1>
          <p className="text-sm text-muted">{business.kor_name} · {PLAN_LABEL[business.plan] || business.plan} 플랜</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/business/${bizId}`} className="text-xs border border-border px-3 py-1.5 rounded-full hover:bg-gray-50">업체 페이지</Link>
          {business.plan === 'basic' && (
            <Link href="/pricing" className="text-xs bg-black text-white px-3 py-1.5 rounded-full hover:bg-gray-800">플랜 업그레이드</Link>
          )}
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{stats.views}</p>
          <p className="text-xs text-muted mt-1">글 총 조회수</p>
        </div>
        <div className="border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{stats.reviews}</p>
          <p className="text-xs text-muted mt-1">리뷰 수</p>
        </div>
        <div className="border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-500">{stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '-'}</p>
          <p className="text-xs text-muted mt-1">평균 평점</p>
        </div>
        <div className="border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{stats.posts}</p>
          <p className="text-xs text-muted mt-1">작성한 글</p>
        </div>
      </div>

      {/* 플랜 안내 */}
      {business.plan === 'basic' && (
        <div className="bg-gray-50 border border-border rounded-lg p-5 mb-8">
          <h3 className="font-bold text-sm mb-2">프리미엄으로 업그레이드하세요</h3>
          <p className="text-xs text-muted mb-3">상위 노출, PREMIUM 배지, 통계 대시보드 등 더 많은 기능을 사용할 수 있습니다.</p>
          <Link href="/pricing" className="text-xs bg-black text-white px-4 py-1.5 rounded-full hover:bg-gray-800">요금 확인하기</Link>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* 최근 리뷰 */}
        <div>
          <h2 className="font-bold mb-4">최근 리뷰</h2>
          {recentReviews.length === 0 ? (
            <p className="text-sm text-muted py-4">아직 리뷰가 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {recentReviews.map((r) => (
                <div key={r.id} className="border border-border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-yellow-500 text-xs">{stars(r.score)}</span>
                    <span className="text-xs">{AVATAR_EMOJI[r.user?.avatar_animal] || '🐻'} {r.user?.nickname || '알 수 없음'}</span>
                  </div>
                  {r.text && <p className="text-xs text-secondary">{r.text}</p>}
                  <p className="text-xs text-muted mt-1">{new Date(r.created_at).toLocaleDateString('ko-KR')}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 작성한 글 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">작성한 글</h2>
            {canWriteMagazine && (
              <Link href="/write" className="text-xs bg-black text-white px-3 py-1.5 rounded-full hover:bg-gray-800">매거진 기고</Link>
            )}
          </div>
          {authorPosts.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted mb-2">아직 작성한 글이 없습니다.</p>
              {canWriteMagazine && (
                <Link href="/write" className="text-xs text-primary hover:underline">매거진 기고로 전문성을 알려보세요 →</Link>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {authorPosts.map((p) => (
                <Link key={p.id} href={`/post/${p.id}`} className="flex items-center justify-between border border-border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{p.title}</p>
                    <p className="text-xs text-muted mt-0.5">{new Date(p.created_at).toLocaleDateString('ko-KR')}</p>
                  </div>
                  <span className="text-xs text-muted ml-3 shrink-0">조회 {p.views || 0}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
