'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

const PLAN_LABEL: Record<string, string> = { premium: 'PREMIUM', pro: 'PRO' }
const PLAN_COLOR: Record<string, string> = {
  premium: 'bg-black text-white',
  pro: 'bg-blue-600 text-white',
}

export default function BusinessDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const [business, setBusiness] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [score, setScore] = useState(5)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user)
    })
  }, [])

  async function fetchData() {
    setLoading(true)
    const { data: biz } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', params.id)
      .single()

    if (biz) setBusiness(biz)

    const { data: revs } = await supabase
      .from('reviews')
      .select('*, user:users(nickname, avatar_animal)')
      .eq('business_id', params.id)
      .order('created_at', { ascending: false })

    if (revs) setReviews(revs)
    setLoading(false)
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return router.push('/auth')

    setSubmitting(true)
    const { error } = await supabase.from('reviews').insert({
      business_id: params.id,
      user_id: user.id,
      score,
      text: text.trim() || null,
    })

    if (error) {
      if (error.code === '23505') {
        alert('이미 이 업체에 리뷰를 작성하셨습니다.')
      } else {
        alert('리뷰 작성 실패: ' + error.message)
      }
      setSubmitting(false)
      return
    }

    setText('')
    setScore(5)
    setShowForm(false)
    setSubmitting(false)
    fetchData()
  }

  const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n)

  const AVATAR_EMOJI: Record<string, string> = {
    bear: '🐻', rabbit: '🐰', fox: '🦊', cat: '🐱',
    dog: '🐶', owl: '🦉', penguin: '🐧', deer: '🦌',
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-center text-muted py-12">불러오는 중...</p>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-center text-muted py-12">업체를 찾을 수 없습니다.</p>
        <Link href="/realtors" className="text-sm text-muted hover:text-primary">← 목록으로</Link>
      </div>
    )
  }

  const TYPE_BACK: Record<string, string> = {
    realtor: '/realtors',
    builder: '/builders',
    lawyer: '/lawyers',
    mortgage: '/mortgage',
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href={TYPE_BACK[business.type] || '/realtors'}
        className="text-sm text-muted hover:text-primary mb-6 inline-block"
      >
        ← 목록으로 돌아가기
      </Link>

      <div className="border border-border rounded-xl p-6 mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            {business.plan !== 'basic' && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${PLAN_COLOR[business.plan] || ''}`}>
                {PLAN_LABEL[business.plan]}
              </span>
            )}
            <h1 className="text-2xl font-bold mt-2">{business.kor_name}</h1>
            {business.eng_name && (
              <p className="text-muted text-sm">{business.eng_name}</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            {business.region && (
              <p><span className="text-muted w-16 inline-block">지역</span> {business.region}{business.area ? ` · ${business.area}` : ''}</p>
            )}
            {business.specialty && (
              <p><span className="text-muted w-16 inline-block">전문</span> {business.specialty}</p>
            )}
            {business.phone1 && (
              <p><span className="text-muted w-16 inline-block">전화</span> {business.phone1}</p>
            )}
          </div>
          <div className="space-y-2">
            {business.address && (
              <p><span className="text-muted w-16 inline-block">주소</span> {business.address}</p>
            )}
            <p><span className="text-muted w-16 inline-block">가입</span> {new Date(business.created_at).toLocaleDateString('ko-KR')}</p>
          </div>
        </div>
      </div>

      {/* 리뷰 섹션 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">리뷰 {reviews.length > 0 && <span className="text-muted font-normal text-sm">({reviews.length})</span>}</h2>
          <button
            onClick={() => {
              if (!user) return router.push('/auth')
              setShowForm(!showForm)
            }}
            className="text-sm bg-black text-white px-4 py-1.5 rounded-full hover:bg-gray-800 transition-colors"
          >
            {showForm ? '취소' : '리뷰 작성'}
          </button>
        </div>

        {/* 리뷰 작성 폼 */}
        {showForm && (
          <form onSubmit={handleReviewSubmit} className="border border-border rounded-lg p-4 mb-6 space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">별점</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setScore(n)}
                    className={`text-2xl ${n <= score ? 'text-yellow-500' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">리뷰 내용</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="이 업체에 대한 경험을 공유해주세요"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm min-h-[80px] resize-y focus:outline-none focus:border-black"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-black text-white px-5 py-2 rounded-full text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {submitting ? '등록 중...' : '리뷰 등록'}
            </button>
          </form>
        )}

        {/* 리뷰 목록 */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-muted py-4">아직 리뷰가 없습니다. 첫 리뷰를 작성해보세요!</p>
          ) : reviews.map((r) => (
            <div key={r.id} className="py-4 border-b border-border last:border-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-yellow-500 text-sm">{stars(r.score)}</span>
                <span className="text-sm">
                  {r.user?.avatar_animal ? AVATAR_EMOJI[r.user.avatar_animal] : '🐻'}
                </span>
                <span className="text-sm font-medium">{r.user?.nickname || '알 수 없음'}</span>
                <span className="text-xs text-muted">{new Date(r.created_at).toLocaleDateString('ko-KR')}</span>
              </div>
              {r.text && <p className="text-sm mt-1">{r.text}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
