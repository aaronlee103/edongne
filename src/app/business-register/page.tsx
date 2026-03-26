'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { uploadImage } from '@/lib/upload'

const TYPES = [
  { key: 'realtor', label: '부동산' },
  { key: 'builder', label: '건축/인테리어' },
  { key: 'lawyer', label: '변호사' },
  { key: 'mortgage', label: '융자/모기지' },
]

const MAX_PORTFOLIO = 10
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

export default function BusinessRegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [step, setStep] = useState(1) // 1: 기본정보, 2: 상세정보/포트폴리오

  const [form, setForm] = useState({
    type: 'realtor',
    kor_name: '',
    eng_name: '',
    phone1: '',
    region: 'NJ',
    area: '',
    specialty: '',
    website: '',
    email: '',
    tagline: '',
    description: '',
  })
  const [heroImage, setHeroImage] = useState('')
  const [portfolio, setPortfolio] = useState<{ url: string; caption: string }[]>([])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/auth')
        return
      }
      setUser(data.user)
      setLoading(false)
    })
  }, [])

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  async function handleImageUpload(file: File, onSuccess: (url: string) => void) {
    if (file.size > MAX_FILE_SIZE) {
      alert('파일 크기는 2MB 이하여야 합니다.')
      return
    }
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.')
      return
    }
    setUploading(true)
    const url = await uploadImage(file)
    setUploading(false)
    if (url) {
      onSuccess(url)
    } else {
      alert('이미지 업로드에 실패했습니다.')
    }
  }

  function addPortfolioImage(url: string) {
    if (portfolio.length >= MAX_PORTFOLIO) {
      alert(`포트폴리오 이미지는 최대 ${MAX_PORTFOLIO}장까지 가능합니다.`)
      return
    }
    setPortfolio(prev => [...prev, { url, caption: '' }])
  }

  function updatePortfolioCaption(index: number, caption: string) {
    setPortfolio(prev => prev.map((p, i) => i === index ? { ...p, caption } : p))
  }

  function removePortfolioImage(index: number) {
    setPortfolio(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.kor_name.trim()) return

    setSubmitting(true)

    try {
      // 1. DB에 pending 상태로 저장
      const { data: biz, error: insertErr } = await supabase
        .from('businesses')
        .insert({
          ...form,
          hero_image: heroImage || null,
          portfolio: portfolio.length > 0 ? portfolio : null,
          plan: 'basic',
          status: 'pending',
          user_id: user.id,
        })
        .select('id')
        .single()

      if (insertErr || !biz) {
        alert('업체 정보 저장에 실패했습니다: ' + (insertErr?.message || ''))
        setSubmitting(false)
        return
      }

      // 2. Stripe 결제 페이지로 이동
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_id: biz.id }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        // 결제 실패 시 pending 업체 삭제
        await supabase.from('businesses').delete().eq('id', biz.id)
        alert('결제 페이지를 열 수 없습니다: ' + (data.error || ''))
        setSubmitting(false)
      }
    } catch (err) {
      alert('오류가 발생했습니다. 다시 시도해주세요.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-muted text-sm">불러오는 중...</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">업체 등록</h1>
      <p className="text-muted text-sm mb-6">이동네에 업체를 등록하고 더 많은 고객을 만나보세요.</p>

      {/* 등록비 숈내 */}
      <div className="bg-gray-50 border border-border rounded-xl p-5 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm">업체 등록비</h3>
            <p className="text-xs text-muted mt-1">1회 결제 · 업체 프로필 + 포트폴리오 페이지 · 지역 검색 노출</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold">$5</span>
            <span className="text-xs text-muted block">일회성</span>
          </div>
        </div>
      </div>

      {/* 단계 표시 */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => setStep(1)} className={`flex items-center gap-1.5 text-sm ${step === 1 ? 'font-bold text-black' : 'text-muted'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 1 ? 'bg-black text-white' : 'bg-gray-200'}`}>1</span>
          기본 정보
        </button>
        <div className="w-8 h-px bg-border" />
        <button onClick={() => step >= 1 && setStep(2)} className={`flex items-center gap-1.5 text-sm ${step === 2 ? 'font-bold text-black' : 'text-muted'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 2 ? 'bg-black text-white' : 'bg-gray-200'}`}>2</span>
          상세 정보 & 포트폴리오
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: 기본 정보 */}
        {step === 1 && (
          <div className="space-y-5">
            {/* 업종 */}
            <div>
              <label className="block text-sm font-medium mb-2">업종 *</label>
              <div className="flex flex-wrap gap-2">
                {TYPES.map(t => (
                  <button key={t.key} type="button" onClick={() => update('type', t.key)}
                    className={`px-4 py-2 text-sm rounded-lg border transition-colors ${form.type === t.key ? 'border-black bg-black text-white' : 'border-border hover:bg-gray-50'}`}
                  >{t.label}</button>
                ))}
              </div>
            </div>

            {/* 업체명 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">업체명 (한글) *</label>
                <input type="text" value={form.kor_name} onChange={e => update('kor_name', e.target.value)}
                  placeholder="예: 김철수 부동산" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-black" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">업체명 (영문)</label>
                <input type="text" value={form.eng_name} onChange={e => update('eng_name', e.target.value)}
                  placeholder="예: CS Realty" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-black" />
              </div>
            </div>

            {/* 연락처 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">전화번호</label>
                <input type="tel" value={form.phone1} onChange={e => update('phone1', e.target.value)}
                  placeholder="201-000-0000" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-black" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">이메일</label>
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                  placeholder="info@example.com" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-black" />
              </div>
            </div>

            {/* 웹사이트 */}
            <div>
              <label className="block text-sm font-medium mb-1.5">웹사이트</label>
              <input type="url" value={form.website} onChange={e => update('website', e.target.value)}
                placeholder="https://example.com" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-black" />
            </div>

            {/* 지역 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">주 *</label>
                <select value={form.region} onChange={e => update('region', e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-black">
                  <option value="NJ">New Jersey</option>
                  <option value="NY">New York</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">상세 지역</label>
                <input type="text" value={form.area} onChange={e => update('area', e.target.value)}
                  placeholder="예: 패팍, 포트리, 퀸즈" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-black" />
              </div>
            </div>

            {/* 전문분야 */}
            <div>
              <label className="block text-sm font-medium mb-1.5">전문분야</label>
              <input type="text" value={form.specialty} onChange={e => update('specialty', e.target.value)}
                placeholder="예: 주거용 매매, 상업용 부동산, 신축 건설" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-black" />
            </div>

            <div className="pt-4">
              <button type="button" onClick={() => setStep(2)}
                className="bg-black text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                다음: 상세 정보 & 포트폴리오 →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 상세 정보 & 포트폴리오 */}
        {step === 2 && (
          <div className="space-y-6">
            {/* 대표 이미지 */}
            <div>
              <label className="block text-sm font-medium mb-2">대표 이미지</label>
              <p className="text-xs text-muted mb-2">업체 페이지 상단에 표시됩니다. (최대 2MB)</p>
              {heroImage ? (
                <div className="relative inline-block">
                  <img src={heroImage} alt="대표 이미지" className="w-full max-w-sm sm:max-w-md h-48 object-cover rounded-lg border border-border" />
                  <button type="button" onClick={() => setHeroImage('')}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/70 text-white rounded-full text-xs flex items-center justify-center hover:bg-black">✕</button>
                </div>
              ) : (
                <label className="inline-flex w-full max-w-sm sm:max-w-md h-36 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-gray-50 items-center justify-center">
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, setHeroImage); e.target.value = '' }} />
                  <span className="text-sm text-muted">{uploading ? '업로드 중...' : '📷 이미지를 선택하세요'}</span>
                </label>
              )}
            </div>

            {/* 광고 문구 */}
            <div>
              <label className="block text-sm font-medium mb-1.5">광고 문구</label>
              <input type="text" value={form.tagline} onChange={e => update('tagline', e.target.value)}
                placeholder="예: 뉴저지 No.1 한인 리얼터, 20년 경력의 믿을 수 있는 서비스"
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-black"
                maxLength={100} />
              <p className="text-xs text-muted mt-1">{form.tagline.length}/100</p>
            </div>

            {/* 업체 소개 */}
            <div>
              <label className="block text-sm font-medium mb-1.5">업체 소개</label>
              <textarea value={form.description} onChange={e => update('description', e.target.value)}
                placeholder="업체에 대한 소개를 자유롭게 작성해주세요. 업체 페이지에 표시됩니다."
                className="w-full px-4 py-3 border border-border rounded-lg text-sm min-h-[120px] resize-y focus:outline-none focus:border-black"
                maxLength={1000} />
              <p className="text-xs text-muted mt-1">{form.description.length}/1000</p>
            </div>

            {/* 포트폴리오 */}
            <div>
              <label className="block text-sm font-medium mb-2">포트폴리오</label>
              <p className="text-xs text-muted mb-3">시공 사례, 거래 실적 등의 이미지를 올려주세요. (최대 {MAX_PORTFOLIO}장, 장당 2MB)</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                {portfolio.map((item, i) => (
                  <div key={i} className="relative">
                    <img src={item.url} alt={`포트폴리오 ${i + 1}`} className="w-full h-32 object-cover rounded-lg border border-border" />
                    <button type="button" onClick={() => removePortfolioImage(i)}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/70 text-white rounded-full text-xs flex items-center justify-center hover:bg-black">✕</button>
                    <input
                      type="text"
                      value={item.caption}
                      onChange={e => updatePortfolioCaption(i, e.target.value)}
                      placeholder="캡션 (선택)"
                      className="w-full mt-1 px-2 py-1 border border-border rounded text-xs focus:outline-none focus:border-black"
                      maxLength={80}
                    />
                  </div>
                ))}

                {portfolio.length < MAX_PORTFOLIO && (
                  <label className="flex h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-gray-50 items-center justify-center">
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, addPortfolioImage); e.target.value = '' }} />
                    <span className="text-xs text-muted text-center">
                      {uploading ? '업로드 중...' : <>📷 추가<br />{portfolio.length}/{MAX_PORTFOLIO}</>}
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* 결제 버튼 */}
            <div className="pt-4 flex flex-col gap-3">
              <button type="submit" disabled={submitting || !form.kor_name.trim()}
                className="w-full md:w-auto bg-black text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
                {submitting ? '결제 페이지로 이동 중...' : '결제하고 등록하기 ($5)'}
              </button>
              <button type="button" onClick={() => setStep(1)} className="text-sm text-muted hover:text-primary">
                ← 이전 단계로
              </button>
              <p className="text-xs text-muted">
                결제는 Stripe를 통해 안전하게 처리됩니다.
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
