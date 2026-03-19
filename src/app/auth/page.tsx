'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'

type Step = 'login' | 'phone' | 'nickname' | 'complete'

export default function AuthPage() {
  const [step, setStep] = useState<Step>('login')
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      alert('로그인 중 오류가 발생했습니다: ' + error.message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">이동네 로그인</h1>
        <p className="text-sm text-muted">뉴욕·뉴저지 한인 커뮤니티</p>
      </div>

      {step === 'login' && (
        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 border border-border rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            {loading ? '로그인 중...' : 'Google로 계속하기'}
          </button>
          <button
            onClick={() => setStep('phone')}
            className="w-full flex items-center justify-center gap-3 py-3 bg-[#FEE500] rounded-lg hover:bg-[#FDD800] transition-colors text-sm font-medium text-[#000000cc]"
          >
            💬 카카오로 계속하기
          </button>
          <p className="text-xs text-muted text-center mt-4">
            가입 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.
          </p>
        </div>
      )}

      {step === 'phone' && (
        <div>
          <h2 className="font-semibold mb-1">전화번호 인증</h2>
          <p className="text-sm text-muted mb-4">미국 전화번호를 입력해주세요 (VoIP 번호 불가)</p>
          <div className="flex gap-2 mb-3">
            <span className="flex items-center px-3 bg-gray-100 rounded-lg text-sm">+1</span>
            <input
              type="tel"
              placeholder="000-000-0000"
              className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-black"
            />
          </div>
          <button
            onClick={() => setStep('nickname')}
            className="w-full py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            인증번호 받기
          </button>
        </div>
      )}

      {step === 'nickname' && (
        <div>
          <h2 className="font-semibold mb-1">프로필 설정</h2>
          <p className="text-sm text-muted mb-4">닉네임과 아바타를 선택해주세요</p>
          <input
            type="text"
            placeholder="닉네임 (2-12자)"
            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm mb-3 focus:outline-none focus:border-black"
          />
          <p className="text-xs text-muted mb-2">아바타 동물 선택</p>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {['🐻 곰', '🐰 토끼', '🦊 여우', '🐱 고양이', '🐶 강아지', '🦉 부엉이', '🐧 펭귄', '🦌 사슴'].map((a) => (
              <button
                key={a}
                className="py-2 border border-border rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                {a}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep('complete')}
            className="w-full py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            가입 완료
          </button>
        </div>
      )}

      {step === 'complete' && (
        <div className="text-center py-8">
          <p className="text-4xl mb-4">🎉</p>
          <h2 className="text-lg font-bold mb-2">가입이 완료되었습니다!</h2>
          <p className="text-sm text-muted mb-6">이동네에 오신 것을 환영합니다.</p>
          <a
            href="/"
            className="inline-block bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            홈으로 가기
          </a>
        </div>
      )}

      {/* 단계 표시 */}
      {step !== 'complete' && (
        <div className="flex justify-center gap-2 mt-8">
          {['login', 'phone', 'nickname'].map((s, i) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full ${
                s === step ? 'bg-black' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
