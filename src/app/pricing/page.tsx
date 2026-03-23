'use client'

import Link from 'next/link'

const PLANS = [
  {
    name: '기본 등록',
    price: '$5',
    period: '일회성',
    description: '이동네에 업체를 등록하고 고객을 만나보세요',
    features: [
      '업체 개인 페이지',
      '기본 정보 (이름, 전화, 주소)',
      '업체 소개 작성',
      '포트폴리오 이미지 등록',
      '고객 리뷰 수집',
    ],
    cta: '등록하기',
    href: '/business-register',
    highlight: false,
    badge: null,
  },
  {
    name: '프리미엄',
    price: '$29',
    period: '/월',
    description: '상위 노출과 강화된 프로필로 더 많은 고객을 확보하세요',
    features: [
      '기본 등록 모든 기능',
      '카테고리 상위 노출 (2~5위)',
      'PREMIUM 배지 표시',
      '프로필 강화 (배경 이미지 등)',
      '월간 조회수/문의 통계',
    ],
    cta: '프리미엄 시작',
    href: '/contact',
    highlight: true,
    badge: '인기',
  },
  {
    name: '프리미엄 플러스',
    price: '$79',
    period: '/월',
    description: '매거진 기고와 배너 광고로 브랜드를 알리세요',
    features: [
      '프리미엄 모든 기능',
      '카테고리 페이지 1위 노출',
      '매거진 기고 권한',
      '작성 글 프로필 자동 연동',
      '상세 통계 대시보드',
    ],
    cta: '플러스 시작',
    href: '/contact',
    highlight: false,
    badge: null,
  },
  {
    name: '스폰서십',
    price: '$199',
    period: '/월~',
    description: '홈페이지 배너와 독점 위치로 최대 노출을 확보하세요',
    features: [
      '프리미엄 플러스 모든 기능',
      '홈페이지 배너 광고',
      '매거진 사이드바 배너',
      '매거진 협찬 기사',
      '독점 카테고리 위치',
    ],
    cta: '문의하기',
    href: '/contact',
    highlight: false,
    badge: null,
  },
]

export default function PricingPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-3">광고 요금</h1>
        <p className="text-muted">이동네에서 뉴욕·뉴저지 한인 고객을 만나보세요</p>
        <p className="text-xs text-muted mt-2">첫 광고주 특별 할인 혜택이 있습니다</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-xl border p-6 flex flex-col ${
              plan.highlight
                ? 'border-black shadow-lg scale-[1.02]'
                : 'border-border'
            }`}
          >
            {plan.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-3 py-1 rounded-full">
                {plan.badge}
              </span>
            )}
            <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-sm text-muted">{plan.period}</span>
            </div>
            <p className="text-xs text-muted mb-5">{plan.description}</p>

            <ul className="space-y-2 mb-6 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="text-sm flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href={plan.href}
              className={`block text-center py-2.5 rounded-full text-sm font-medium transition-colors ${
                plan.highlight
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'border border-border hover:bg-gray-50'
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center text-sm text-muted">
        <p>연간 결제 시 20% 할인 · 모든 요금에 세금 별도</p>
        <p className="mt-1">
          문의:{' '}
          <Link href="/contact" className="text-primary hover:underline">
            광고 상담하기
          </Link>
        </p>
      </div>
    </div>
  )
}
