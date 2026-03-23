'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { uploadImage } from '@/lib/upload'
import AdBanner from '@/components/AdBanner'
import { getPlanLimits } from '@/lib/planLimits';

const PLAN_LABEL: Record<string, string> = { premium: 'PREMIUM', pro: 'PRO' }
const PLAN_COLOR: Record<string, string> = {
  premium: 'bg-black text-white',
  pro: 'bg-blue-600 text-white',
}

const TYPE_LABEL: Record<string, string> = {
  realtor: '부동산', builder: '건축/인테리어', lawyer: '변호사', mortgage: '융자/모기지',
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
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [authorPosts, setAuthorPosts] = useState<any[]>([])
  const [showEdit, setShowEdit] = useState(false)

  const isOwner = user && business && user.id === business.user_id

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
    // Fetch posts by this business owner
    if (biz?.user_id) {
      const { data: posts } = await supabase
        .from('posts')
        .select('id, title, category, created_at, thumbnail, type')
        .eq('user_id', biz.user_id)
        .or('published.is.null,published.eq.true')
        .order('created_at', { ascending: false })
        .limit(10)
      if (posts) setAuthorPosts(posts)
    }
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
    return <div className="max-w-4xl mx-auto px-4 py-8"><p className="text-center text-muted py-12">불러오는 중...</p></div>
  }

  if (!business) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-center text-muted py-12">업체를 찾을 수 없습니다.</p>
        <Link href="/realtors" className="text-sm text-muted hover:text-primary">← 목록으로</Link>
      </div>
    )
  }

  const TYPE_BACK: Record<string, string> = {
    realtor: '/realtors', builder: '/builders', lawyer: '/lawyers', mortgage: '/mortgage',
  }

  const portfolioItems = business.portfolio || []

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href={TYPE_BACK[business.type] || '/realtors'} className="text-sm text-muted hover:text-primary mb-6 inline-block">
        ← 목록으로 돌아가기
      </Link>

      {/* 업체 정보 */}
      <div className="border border-border rounded-xl p-6 mb-8">
        <div className="flex items-start gap-5 mb-4">
          {/* 대표 이미지 - 정사각형 */}
          {business.hero_image && (
            <div className="w-28 h-28 md:w-36 md:h-36 flex-shrink-0 rounded-xl overflow-hidden">
              <img src={business.hero_image} alt={business.kor_name} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">{TYPE_LABEL[business.type] || business.type}</span>
              {business.plan !== 'basic' && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${PLAN_COLOR[business.plan] || ''}`}>
                  {PLAN_LABEL[business.plan]}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <h1 className="text-2xl font-bold">{business.kor_name}</h1>
              {isOwner && (
                <button onClick={() => setShowEdit(true)} className="text-xs bg-gray-100 text-secondary px-2.5 py-1 rounded-full hover:bg-gray-200 transition-colors">수정</button>
                <Link href={`/business/${params.id}/dashboard`} className="text-xs bg-black text-white px-2.5 py-1 rounded-full hover:bg-gray-800 transition-colors">대시보드</Link>
              )}
            </div>
            {business.eng_name && <p className="text-muted text-sm">{business.eng_name}</p>}
          </div>
        </div>

        {/* 광고 문구 */}
        {business.tagline && (
          <p className="text-sm font-medium mb-4 text-primary">{business.tagline}</p>
        )}

        {/* 연락처 정보 */}
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            {business.region && (
              <p><span className="text-muted w-16 inline-block">지역</span> {business.region}{business.area ? ` · ${business.area}` : ''}</p>
            )}
            {business.specialty && (
              <p><span className="text-muted w-16 inline-block">전문</span> {business.specialty}</p>
            )}
            {business.phone1 && (
              <p><span className="text-muted w-16 inline-block">전화</span> <a href={`tel:${business.phone1}`} className="text-blue-600 hover:underline">{business.phone1}</a></p>
            )}
          </div>
          <div className="space-y-2">
            {business.email && (
              <p><span className="text-muted w-16 inline-block">이메일</span> <a href={`mailto:${business.email}`} className="text-blue-600 hover:underline">{business.email}</a></p>
            )}
            {business.website && (
              <p><span className="text-muted w-16 inline-block">웹사이트</span> <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{business.website.replace(/^https?:\/\//, '')}</a></p>
            )}
            {business.address && (
              <p><span className="text-muted w-16 inline-block">주소</span> {business.address}</p>
            )}
          </div>
        </div>
      </div>

      {/* 업체 소개 */}
      {business.description && (
        <section className="mb-8">
          <h2 className="font-bold text-lg mb-3">업체 소개</h2>
          <div className="text-sm leading-relaxed whitespace-pre-wrap text-secondary">
            {business.description}
          </div>
        </section>
      )}

      {/* 포트폴리오 */}
      {portfolioItems.length > 0 && (
        <section className="mb-8">
          <h2 className="font-bold text-lg mb-3">포트폴리오</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {portfolioItems.map((item: any, i: number) => (
              <div key={i} className="cursor-pointer group" onClick={() => setLightbox(i)}>
                <div className="relative overflow-hidden rounded-lg border border-border">
                  <img src={item.url} alt={item.caption || `포트폴리오 ${i + 1}`}
                    className="w-full h-36 md:h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>

            {business?.portfolio && business.portfolio.length > getPlanLimits(business?.plan).maxPortfolioImages && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                현재 플랜에서는 {getPlanLimits(business?.plan).maxPortfolioImages}장까지 표시됩니다.
                포트폴리오를 더 보시려면 플랜을 업그레이드하세요.
              </p>
            )}
                {item.caption && (
                  <p className="text-xs text-muted mt-1.5 line-clamp-2">{item.caption}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 라이트박스 */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setLightbox(null)} className="absolute -top-10 right-0 text-white text-2xl hover:opacity-70">✕</button>
            <img src={portfolioItems[lightbox].url} alt="" className="w-full max-h-[80vh] object-contain rounded-lg" />
            {portfolioItems[lightbox].caption && (
              <p className="text-white text-sm text-center mt-3">{portfolioItems[lightbox].caption}</p>
            )}
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setLightbox(lightbox > 0 ? lightbox - 1 : portfolioItems.length - 1)}
                className="text-white text-sm px-4 py-2 bg-white/20 rounded-full hover:bg-white/30"
              >← 이전</button>
              <span className="text-white/60 text-sm self-center">{lightbox + 1} / {portfolioItems.length}</span>
              <button
                onClick={() => setLightbox(lightbox < portfolioItems.length - 1 ? lightbox + 1 : 0)}
                className="text-white text-sm px-4 py-2 bg-white/20 rounded-full hover:bg-white/30"
              >다음 →</button>
            </div>
          </div>
        </div>
      )}

      {/* 작성한 글 */}
      {authorPosts.length > 0 && (
        <section className="mb-8">
          <h2 className="font-bold text-lg mb-3">작성한 글</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {authorPosts.map((ap) => (
              <Link key={ap.id} href={`/post/${ap.id}`} className="flex gap-3 border border-border rounded-lg p-3 hover:shadow-md transition-all group">
                {ap.thumbnail && (
                  <img src={ap.thumbnail} alt="" className="w-20 h-16 object-cover rounded flex-shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium line-clamp-2 group-hover:text-secondary">{ap.title}</p>
                  <p className="text-xs text-muted mt-1">{new Date(ap.created_at).toLocaleDateString('ko-KR')}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 광고 배너 */}
      <div className="mb-8">
        <AdBanner variant="banner" />
      </div>

      {/* 리뷰 섹션 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">리뷰 {reviews.length > 0 && <span className="text-muted font-normal text-sm">({reviews.length})</span>}</h2>
          <button
            onClick={() => { if (!user) return router.push('/auth'); setShowForm(!showForm) }}
            className="text-sm bg-black text-white px-4 py-1.5 rounded-full hover:bg-gray-800 transition-colors"
          >
            {showForm ? '취소' : '리뷰 작성'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleReviewSubmit} className="border border-border rounded-lg p-4 mb-6 space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">별점</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setScore(n)}
                    className={`text-2xl ${n <= score ? 'text-yellow-500' : 'text-gray-300'}`}>★</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">리뷰 내용</label>
              <textarea value={text} onChange={(e) => setText(e.target.value)}
                placeholder="이 업체에 대한 경험을 공유해주세요"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm min-h-[80px] resize-y focus:outline-none focus:border-black" />
            </div>
            <button type="submit" disabled={submitting}
              className="bg-black text-white px-5 py-2 rounded-full text-sm hover:bg-gray-800 transition-colors disabled:opacity-50">
              {submitting ? '등록 중...' : '리뷰 등록'}
            </button>
          </form>
        )}

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-muted py-4">아직 리뷰가 없습니다. 첫 리뷰를 작성해보세요!</p>
          ) : reviews.map((r) => (
            <div key={r.id} className="py-4 border-b border-border last:border-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-yellow-500 text-sm">{stars(r.score)}</span>
                <span className="text-sm">{r.user?.avatar_animal ? AVATAR_EMOJI[r.user.avatar_animal] : '🐻'}</span>
                <span className="text-sm font-medium">{r.user?.nickname || '알 수 없음'}</span>
                <span className="text-xs text-muted">{new Date(r.created_at).toLocaleDateString('ko-KR')}</span>
              </div>
              {r.text && <p className="text-sm mt-1">{r.text}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* 업체 수정 모달 (소유자용) */}
      {showEdit && isOwner && (
        <OwnerEditModal
          business={business}
          onClose={() => setShowEdit(false)}
          onSave={() => { setShowEdit(false); fetchData() }}
        />
      )}
    </div>
  )
}

function OwnerEditModal({ business, onClose, onSave }: { business: any; onClose: () => void; onSave: () => void }) {
  const supabase = createClient()
  const [form, setForm] = useState({
    kor_name: business.kor_name || '',
    eng_name: business.eng_name || '',
    phone1: business.phone1 || '',
    email: business.email || '',
    website: business.website || '',
    region: business.region || 'NY',
    area: business.area || '',
    specialty: business.specialty || '',
    tagline: business.tagline || '',
    description: business.description || '',
  })
  const [heroImage, setHeroImage] = useState<string | null>(business.hero_image || null)
  const [portfolio, setPortfolio] = useState<{ url: string; caption: string }[]>(business.portfolio || [])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  async function handleHeroUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert('이미지는 2MB 이하만 업로드 가능합니다.'); return }
    setUploading(true)
    const url = await uploadImage(file)
    if (url) setHeroImage(url)
    else alert('이미지 업로드에 실패했습니다.')
    setUploading(false)
    e.target.value = ''
  }

  async function handlePortfolioUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.size > 2 * 1024 * 1024) continue
      const url = await uploadImage(file)
      if (url) setPortfolio(prev => [...prev, { url, caption: '' }])
    }
    setUploading(false)
    e.target.value = ''
  }

  function removePortfolioItem(index: number) {
    setPortfolio(prev => prev.filter((_, i) => i !== index))
  }

  function updatePortfolioCaption(index: number, caption: string) {
    setPortfolio(prev => prev.map((item, i) => i === index ? { ...item, caption } : item))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.kor_name.trim()) return
    setSaving(true)
    const { error } = await supabase.from('businesses').update({
      ...form,
      hero_image: heroImage,
      portfolio: portfolio.length > 0 ? portfolio : null,
    }).eq('id', business.id)
    if (error) {
      alert('수정 실패: ' + error.message)
    } else {
      onSave()
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">업체 정보 수정</h2>
          <button onClick={onClose} className="text-muted hover:text-primary text-xl">✕</button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* 대표 이미지 */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1">대표 이미지</label>
            <div className="flex items-center gap-3">
              {heroImage ? (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                  <img src={heroImage} alt="대표 이미지" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setHeroImage(null)}
                    className="absolute top-0.5 right-0.5 bg-black/60 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center hover:bg-black/80">✕</button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">없음</div>
              )}
              <label className={`text-xs px-3 py-1.5 rounded-full cursor-pointer ${uploading ? 'bg-gray-200 text-gray-400' : 'bg-gray-100 text-secondary hover:bg-gray-200'}`}>
                {uploading ? '업로드 중...' : '이미지 변경'}
                <input type="file" accept="image/*" onChange={handleHeroUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
          </div>

          {/* 업체명 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">업체명 (한글) *</label>
              <input value={form.kor_name} onChange={e => update('kor_name', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">업체명 (영문)</label>
              <input value={form.eng_name} onChange={e => update('eng_name', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          {/* 연락처 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">전화번호</label>
              <input value={form.phone1} onChange={e => update('phone1', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">이메일</label>
              <input value={form.email} onChange={e => update('email', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          {/* 웹사이트 */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1">웹사이트</label>
            <input value={form.website} onChange={e => update('website', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
          </div>

          {/* 지역 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">주</label>
              <select value={form.region} onChange={e => update('region', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm">
                <option value="NY">NY</option><option value="NJ">NJ</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">상세 지역</label>
              <input value={form.area} onChange={e => update('area', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          {/* 전문분야 */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1">전문분야</label>
            <input value={form.specialty} onChange={e => update('specialty', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
          </div>

          {/* 광고 문구 */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1">광고 문구</label>
            <input value={form.tagline} onChange={e => update('tagline', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm" maxLength={100} />
          </div>

          {/* 업체 소개 */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1">업체 소개</label>
            <textarea value={form.description} onChange={e => update('description', e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm min-h-[80px] resize-y" maxLength={1000} />
          </div>

          {/* 포트폴리오 이미지 */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1">포트폴리오 이미지</label>
            {portfolio.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-2">
                {portfolio.map((item, i) => (
                  <div key={i} className="relative border border-border rounded-lg overflow-hidden">
                    <img src={item.url} alt="" className="w-full h-24 object-cover" />
                    <button type="button" onClick={() => removePortfolioItem(i)}
                      className="absolute top-1 right-1 bg-black/60 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center hover:bg-black/80">✕</button>
                    <input
                      type="text"
                      value={item.caption}
                      onChange={e => updatePortfolioCaption(i, e.target.value)}
                      placeholder="설명 (선택)"
                      className="w-full px-2 py-1 text-xs border-t border-border focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            )}
            <label className={`inline-block text-xs px-3 py-1.5 rounded-full cursor-pointer ${uploading ? 'bg-gray-200 text-gray-400' : 'bg-gray-100 text-secondary hover:bg-gray-200'}`}>
              {uploading ? '업로드 중...' : '+ 이미지 추가'}
              <input type="file" accept="image/*" multiple onChange={handlePortfolioUpload} className="hidden" disabled={uploading} />
            </label>
            <span className="text-xs text-muted ml-2">최대 2MB, 여러 장 선택 가능</span>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-muted hover:text-primary">취소</button>
            <button type="submit" disabled={saving || uploading} className="bg-black text-white px-6 py-2 rounded-full text-sm hover:bg-gray-800 disabled:opacity-50">
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
