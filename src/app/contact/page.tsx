'use client'

import { useState } from 'react'

const TOPICS = [
  { value: '', label: '문의 주제를 선택해주세요' },
  { value: 'business_register', label: '업체 등록 관련' },
  { value: 'plan_upgrade', label: '플랜 업그레이드 (Pro/Premium)' },
  { value: 'advertising', label: '광고 및 마케팅' },
  { value: 'web_development', label: '웹사이트 제작' },
  { value: 'partnership', label: '제휴/협업 문의' },
  { value: 'bug_report', label: '오류 신고 / 기능 건의' },
  { value: 'account', label: '계정 관련 (탈퇴, 수정 등)' },
  { value: 'other', label: '기타 문의' },
]

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    topic: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  const isValid = form.name.trim() && form.email.trim() && form.phone.trim() && form.topic && form.message.trim()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return

    setSubmitting(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          topic: form.topic,
          message: form.message.trim(),
        }),
      })

      if (!res.ok) throw new Error('Failed')
      setSubmitted(true)
    } catch {
      alert('문의 접수에 실패했습니다. 이메일(info@edongne.com)로 직접 문의해주세요.')
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-4xl mb-4">✓</div>
        <h1 className="text-2xl font-bold mb-2">문의가 접수되었습니다</h1>
        <p className="text-muted text-sm mb-6">빠른 시일 내에 답변 드리겠습니다. 감사합니다.</p>
        <p className="text-xs text-muted">문의 확인 이메일: <a href="mailto:info@edongne.com" className="text-blue-600">info@edongne.com</a></p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">문의하기</h1>
      <p className="text-muted text-sm mb-8">업체 등록, 광고, 제휴 등 궁금한 점이 있으시면 문의해주세요.</p>

      {/* 연락처 안내 */}
      <div className="bg-gray-50 border border-border rounded-xl p-5 mb-8">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-2">이동네 고객센터</h3>
            <div className="space-y-1 text-sm text-muted">
              <p>이메일: <a href="mailto:info@edongne.com" className="text-blue-600 hover:underline">info@edongne.com</a></p>
            </div>
          </div>
          <div className="text-right text-xs text-muted">
            <p>운영 시간</p>
            <p className="font-medium text-primary">평일 10:00 - 18:00 (EST)</p>
          </div>
        </div>
      </div>

      {/* 문의 폼 */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 문의 주제 */}
        <div>
          <label className="block text-sm font-medium mb-1.5">문의 주제 <span className="text-red-500">*</span></label>
          <select
            value={form.topic}
            onChange={e => update('topic', e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-black"
            required
          >
            {TOPICS.map(t => (
              <option key={t.value} value={t.value} disabled={!t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* 이름 & 이메일 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">이름 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={e => update('name', e.target.value)}
              placeholder="홍길동"
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">이메일 <span className="text-red-500">*</span></label>
            <input
              type="email"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              placeholder="example@email.com"
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-black"
              required
            />
          </div>
        </div>

        {/* 전화번호 */}
        <div>
          <label className="block text-sm font-medium mb-1.5">전화번호 <span className="text-red-500">*</span></label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => update('phone', e.target.value)}
            placeholder="201-000-0000"
            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-black"
            required
          />
        </div>

        {/* 문의 내용 */}
        <div>
          <label className="block text-sm font-medium mb-1.5">문의 내용 <span className="text-red-500">*</span></label>
          <textarea
            value={form.message}
            onChange={e => update('message', e.target.value)}
            placeholder="문의하실 내용을 자세히 작성해주세요."
            className="w-full px-4 py-3 border border-border rounded-lg text-sm min-h-[140px] resize-y focus:outline-none focus:border-black"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !isValid}
          className="w-full md:w-auto bg-black text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {submitting ? '접수 중...' : '문의 접수하기'}
        </button>
      </form>
    </div>
  )
}
