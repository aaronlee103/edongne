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
            {/* 소셜 미디어 */}
            <div className="flex items-center gap-3 mt-3">
              <a href="https://www.facebook.com/profile.php?id=61576790757314" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted hover:text-primary transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://www.instagram.com/edongnedotcom/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted hover:text-primary transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="https://www.threads.net/@edongnedotcom" target="_blank" rel="noopener noreferrer" aria-label="Threads" className="text-muted hover:text-primary transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.187.408-2.26 1.33-3.017.88-.724 2.104-1.132 3.542-1.183 1.058-.037 2.035.068 2.913.31-.02-1.08-.242-1.904-.665-2.459-.494-.649-1.296-.978-2.383-.978h-.058c-.89.015-1.63.29-2.2.818l-1.378-1.503c.903-.83 2.073-1.28 3.526-1.333h.096c1.626 0 2.89.537 3.758 1.596.758.928 1.143 2.2 1.148 3.783v.182c1.273.655 2.243 1.593 2.82 2.76.818 1.651.893 4.407-1.31 6.67-1.86 1.907-4.123 2.736-7.335 2.758zm-.636-7.97c-1.053.037-1.868.293-2.358.742-.44.402-.634.908-.601 1.504.06 1.083 1.005 1.78 2.528 1.696 1.073-.058 1.904-.462 2.474-1.2.457-.593.764-1.405.882-2.378-.82-.218-1.734-.38-2.925-.364z"/></svg>
              </a>
            </div>
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
