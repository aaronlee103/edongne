'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'

export default function AuthPage() {
  const [loading, setLoading] = useState<'google' | 'kakao' | null>(null)

  const handleGoogleLogin = async () => {
    setLoading('google')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      alert('로그인 중 오류가 발생했습니다: ' + error.message)
      setLoading(null)
    }
  }

  const handleKakaoLogin = async () => {
    setLoading('kakao')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'profile_nickname profile_image',
      },
    })
    if (error) {
      alert('로그인 중 오류가 발생했습니다: ' + error.message)
      setLoading(null)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">이동네 로그인</h1>
        <p className="text-sm text-muted">뉴욕·뉴저지 한인 커뮤니티</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleGoogleLogin}
          disabled={loading !== null}
          className="w-full flex items-center justify-center gap-3 py-3 border border-border rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          {loading === 'google' ? '로그인 중...' : 'Google로 계속하기'}
        </button>
        <button
          onClick={handleKakaoLogin}
          disabled={loading !== null}
          className="w-full flex items-center justify-center gap-3 py-3 bg-[#FEE500] rounded-lg hover:bg-[#FDD800] transition-colors text-sm font-medium text-[#000000cc] disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M12 3C6.48 3 2 6.36 2 10.44c0 2.62 1.75 4.93 4.38 6.24l-1.12 4.12c-.1.36.31.65.62.44l4.84-3.2c.42.04.85.06 1.28.06 5.52 0 10-3.36 10-7.66C22 6.36 17.52 3 12 3z" fill="#3C1E1E"/></svg>
          {loading === 'kakao' ? '로그인 중...' : '카카오로 계속하기'}
        </button>
        <p className="text-xs text-muted text-center mt-4">
          가입 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.
        </p>
      </div>
    </div>
  )
}
