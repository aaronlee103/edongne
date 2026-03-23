'use client'

import Link from 'next/link'

type AdBannerProps = {
  variant?: 'sidebar' | 'inline' | 'banner'
}

export default function AdBanner({ variant = 'sidebar' }: AdBannerProps) {
  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white text-center">
        <p className="text-xs tracking-widest text-gray-400 mb-2">ADVERTISE WITH US</p>
        <p className="text-lg font-bold mb-1">이동네에서 업체를 홍보하세요</p>
        <p className="text-sm text-gray-300 mb-4">첫 광고주 프리미엄 할인 혜택 제공</p>
        <Link href="/contact" className="inline-block bg-white text-black text-sm font-medium px-6 py-2 rounded-full hover:bg-gray-100 transition-colors">
          광고 문의하기
        </Link>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className="my-8 border border-border rounded-lg p-5 bg-gray-50 text-center">
        <p className="text-xs text-muted mb-1">AD</p>
        <p className="text-sm font-bold mb-1">뉴욕·뉴저지 한인에게 업체를 알리세요</p>
        <p className="text-xs text-muted mb-3">이동네 매거진 광고 · 첫 광고 시 프리미엄 할인</p>
        <Link href="/contact" className="text-xs bg-black text-white px-4 py-1.5 rounded-full hover:bg-gray-800 transition-colors inline-block">
          광고 문의 →
        </Link>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg p-4 bg-white">
      <p className="text-xs text-muted mb-3 text-center">AD</p>
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg p-4 text-white text-center">
        <p className="text-sm font-bold mb-1">업체 홍보하기</p>
        <p className="text-xs text-gray-300 mb-3">이동네에서 NY/NJ 한인 고객을 만나세요</p>
        <Link href="/contact" className="block bg-white text-black text-xs font-medium px-4 py-2 rounded-full hover:bg-gray-100 transition-colors">
          광고 문의
        </Link>
        <p className="text-xs text-gray-500 mt-2">첫 광고 할인 혜택</p>
      </div>
    </div>
  )
}
