import Link from 'next/link'

const PLANS = [
  {
    name: 'Basic',
    price: '무료',
    period: '',
    features: ['기본 업체 프로필', '전화번호 노출', '지역 검색 노출'],
    cta: '무료 등록',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/월',
    features: ['Basic 전체 포함', 'PRO 배지 표시', '상단 노출 우선순위', '리뷰 알림', '월간 통계 리포트'],
    cta: '시작하기',
    highlight: true,
  },
  {
    name: 'Premium',
    price: '$99',
    period: '/월',
    features: ['Pro 전체 포함', 'PREMIUM 배지', '최상단 고정 노출', '매거진 광고 배너', '전담 매니저', '맞춤 웹페이지 제작 할인'],
    cta: '문의하기',
    highlight: false,
  },
]

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">서비스 요금</h1>
        <p className="text-muted">이동네에서 더 많은 고객을 만나보세요</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`p-6 rounded-xl border-2 ${
              plan.highlight ? 'border-black' : 'border-border'
            }`}
          >
            {plan.highlight && (
              <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full mb-4 inline-block">
                인기
              </span>
            )}
            <h3 className="text-lg font-bold">{plan.name}</h3>
            <div className="mt-2 mb-6">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-muted text-sm">{plan.period}</span>
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="text-sm flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                plan.highlight
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'border border-border hover:bg-gray-50'
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* 부가 서비스 */}
      <div className="mt-16">
        <h2 className="text-xl font-bold mb-6 text-center">부가 서비스</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-5 border border-border rounded-lg">
            <h3 className="font-semibold mb-1">업체 웹페이지 제작</h3>
            <p className="text-2xl font-bold mb-2">$500~</p>
            <p className="text-xs text-muted">맞춤형 반응형 웹사이트 제작</p>
          </div>
          <div className="p-5 border border-border rounded-lg">
            <h3 className="font-semibold mb-1">카톡 광고 대행</h3>
            <p className="text-2xl font-bold mb-2">$200~/월</p>
            <p className="text-xs text-muted">카카오톡 채널 광고 운영 대행</p>
          </div>
          <div className="p-5 border border-border rounded-lg">
            <h3 className="font-semibold mb-1">SNS 마케팅</h3>
            <p className="text-2xl font-bold mb-2">$300~/월</p>
            <p className="text-xs text-muted">인스타/페이스북 광고 관리</p>
          </div>
        </div>
      </div>
    </div>
  )
}
