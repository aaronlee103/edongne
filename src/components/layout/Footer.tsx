'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subMsg, setSubMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || submitting) return
    setSubmitting(true)
    setSubMsg('')
    try {
      const supabase = createClient()
      const { error } = await supabase.from('newsletter').insert({ email: email.trim() })
      if (error) {
        if (error.code === '23505') setSubMsg('이미 구독 중입니다!')
        else setSubMsg('오류가 발생했습니다.')
      } else {
        setSubMsg('구독 완료!')
        setEmail('')
      }
    } catch {
      setSubMsg('오류가 발생했습니다.')
    }
    setSubmitting(false)
    setTimeout(() => setSubMsg(''), 3000)
  }

  return (
    <footer className="border-t border-border mt-16">
      {/* 뉴스레터 */}
      <div className="bg-gray-50 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <h3 className="font-bold text-lg mb-1">이동네 뉴스레터</h3>
          <p className="text-sm text-muted mb-4">매주 뉴욕·뉴저지 한인 부동산 & 생활정보를 보내드립니다</p>
          <form onSubmit={handleSubscribe} className="flex items-center justify-center gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소"
              required
              className="flex-1 px-4 py-2 border border-border rounded-full text-sm focus:outline-none focus:border-black"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-black text-white text-sm px-5 py-2 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 shrink-0"
            >
              {submitting ? '...' : '구독'}
            </button>
          </form>
          {subMsg && <p className={`text-xs mt-2 ${subMsg.includes('완료') ? 'text-green-600' : 'text-red-500'}`}>{subMsg}</p>}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <h4 className="font-semibold mb-3">이동네</h4>
            <p className="text-muted leading-relaxed">
              뉴욕·뉴저지 한인 커뮤니티<br />
              부동산 · 건축 · 법률 · 융자
            </p>
            <p className="text-muted mt-2 text-xs">
              <a href="mailto:info@edongne.com" className="hover:text-primary">info@edongne.com</a>
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">커뮤니티</h4>
            <ul className="space-y-1.5 text-muted">
              <li><Link href="/board" className="hover:text-primary">자유게시판</Link></li>
              <li><Link href="/board?cat=qna" className="hover:text-primary">질문답변</Link></li>
              <li><Link href="/board?cat=buysell" className="hover:text-primary">사고팔고</Link></li>
              <li><Link href="/board?cat=jobs" className="hover:text-primary">구인구직</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">업체 찾기</h4>
            <ul className="space-y-1.5 text-muted">
              <li><Link href="/realtors" className="hover:text-primary">부동산</Link></li>
              <li><Link href="/builders" className="hover:text-primary">건축/인테리어</Link></li>
              <li><Link href="/lawyers" className="hover:text-primary">변호사</Link></li>
              <li><Link href="/mortgage" className="hover:text-primary">융자/모기지</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">서비스</h4>
            <ul className="space-y-1.5 text-muted">
              <li><Link href="/business-register" className="hover:text-primary">업체 등록</Link></li>
              <li><Link href="/pricing" className="hover:text-primary">광고 요금</Link></li>
              <li><Link href="/contact" className="hover:text-primary">문의하기</Link></li>
              <li><Link href="/about" className="hover:text-primary">이동네 소개</Link></li>
              <li><Link href="/privacy" className="hover:text-primary">개인정보처리방침</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border text-xs text-muted">
          © 2025 이동네 edongne.com · All rights reserved.
        </div>
      </div>
    </footer>
  )
}
