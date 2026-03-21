'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

const TYPES = [
  { key: 'realtor', label: '부동산' },
  { key: 'builder', label: '건축/인테리어' },
  { key: 'lawyer', label: '변호사' },
  { key: 'mortgage', label: '융자/모기지' },
]

export default function BusinessRegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const [form, setForm] = useState({
    type: 'realtor',
    kor_name: '',
    eng_name: '',
    phone1: '',
    region: 'NJ',
    area: '',
    specialty: '',
  })

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.kor_name.trim()) return

    setSubmitting(true)

    const { error } = await supabase.from('businesses').insert({
      ...form,
      plan: 'basic',
      user_id: user.id,
    })

    if (error) {
      alert('등록 실패: ' + error.message)
      setSubmitting(false)
      return
    }

    setDone(true)
  }

  if (loading) {
    return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-muted text-sm">불러오는 중...</div>
  }

  if (done) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">✓</div>
        <h1 className="text-2xl font-bold mb-3">업체 등록이 완료되었습니다</h1>
        <p className="text-muted text-sm mb-8">
          무료 Basic 플랜으로 등록되었습니다.<br />
          Pro/Premium 플랜으로 업그레이드하시면 더 많은 혜택을 받으실 수 있습니다.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/" className="px-6 py-2.5 border border-border rounded-full text-sm hover:bg-gray-50">
            홈으로
          </Link>
          <Link href="/pricing" className="bg-black text-white px-6 py-2.5 rounded-full text-sm hover:bg-gray-800">
            요금제 보기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">업체 등록</h1>
      <p className="text-muted text-sm mb-8">이동네에 업체를 등록하고 더 많은 고객을 만나보세요. 기본 등록은 무료입니다.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 업종 */}
        <div>
          <label className="block text-sm font-medium mb-2">업종 *</label>
          <div className="flex flex-wrap gap-2">
            {TYPES.map(t => (
              <button
                key={t.key}
                type="button"
                onClick={() => update('type', t.key)}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                  form.type === t.key
                    ? 'border-black bg-black text-white'
                    : 'border-border hover:bg-gray-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 업체명 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">업체명 (한글) *</label>
            <input
              type="text"
              value={form.kor_name}
              onChange={e => update('kor_name', e.target.value)}
              placeholder="예: 김철수 부동산"
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">업체명 (영문)</label>
            <input
              type="text"
              value={form.eng_name}
              onChange={e => update('eng_name', e.target.value)}
              placeholder="예: CS Realty"
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {/* 연락처 */}
        <div>
          <label className="block text-sm font-medium mb-1.5">전화번호</label>
          <input
            type="tel"
            value={form.phone1}
            onChange={e => update('phone1', e.target.value)}
            placeholder="201-000-0000"
            className="w-full md:w-1/2 px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-black"
          />
        </div>

        {/* 지역 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">주 *</label>
            <select
              value={form.region}
              onChange={e => update('region', e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-black"
            >
              <option value="NJ">New Jersey</option>
              <option value="NY">New York</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">상세 지역</label>
            <input
              type="text"
              value={form.area}
              onChange={e => update('area', e.target.value)}
              placeholder="예: 팰팍, 포트리, 퀸즈"
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {/* 전문분야 */}
        <div>
          <label className="block text-sm font-medium mb-1.5">전문분야</label>
          <input
            type="text"
            value={form.specialty}
            onChange={e => update('specialty', e.target.value)}
            placeholder="예: 주거용 매매, 상업용 부동산, 신축 건설"
            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-black"
          />
        </div>

        {/* 제출 */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="bg-black text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {submitting ? '등록 중...' : '무료 등록하기'}
          </button>
          <p className="text-xs text-muted mt-3">
            Pro/Premium 플랜은 등록 후 <Link href="/pricing" className="underline">요금 안내</Link> 페이지에서 업그레이드하실 수 있습니다.
          </p>
        </div>
      </form>
    </div>
  )
}
