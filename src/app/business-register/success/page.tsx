'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    if (sessionId) {
      // 결제 완료 확인 (webhook이 처리하므로 약간의 딜레이 후 성공으로 표시)
      const timer = setTimeout(() => setStatus('success'), 1500)
      return () => clearTimeout(timer)
    } else {
      setStatus('error')
    }
  }, [sessionId])

  if (status === 'loading') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4 animate-pulse">⏳</div>
        <h1 className="text-xl font-bold mb-2">결제 확인 중...</h1>
        <p className="text-muted text-sm">잠시만 기다려주세요.</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold mb-2">결제 정보를 확인할 수 없습니다</h1>
        <p className="text-muted text-sm mb-6">문제가 지속되면 aaronlee103@gmail.com 으로 문의해주세요.</p>
        <Link href="/business-register" className="text-sm text-blue-600 underline">다시 시도하기</Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-green-600 text-2xl">✓</span>
      </div>
      <h1 className="text-2xl font-bold mb-3">업체 등록이 완료되었습니다!</h1>
      <p className="text-muted text-sm mb-8">
        결제가 정상 처리되었습니다. 업체 정보가 곧 이동네에 반영됩니다.
      </p>
      <div className="flex justify-center gap-3">
        <Link href="/" className="px-6 py-2.5 border border-border rounded-full text-sm hover:bg-gray-50">
          홈으로
        </Link>
        <Link href="/pricing" className="bg-black text-white px-6 py-2.5 rounded-full text-sm hover:bg-gray-800">
          플랜 업그레이드
        </Link>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-16 text-center text-muted text-sm">불러오는 중...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
