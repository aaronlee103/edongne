import Link from 'next/link'

// 업체 상세 프로필 (SSR - Supabase 연결 후 동적 데이터)
export default function BusinessDetailPage({ params }: { params: { id: string } }) {
  // TODO: Supabase에서 업체 정보 가져오기
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/realtors" className="text-sm text-muted hover:text-primary mb-6 inline-block">
        ← 목록으로 돌아가기
      </Link>

      <div className="border border-border rounded-xl p-6 mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full">PREMIUM</span>
            <h1 className="text-2xl font-bold mt-2">김영수 부동산</h1>
            <p className="text-muted text-sm">Young S. Kim Realty</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p><span className="text-muted w-16 inline-block">지역</span> NY · 퀸즈</p>
            <p><span className="text-muted w-16 inline-block">전문</span> 주거/상가</p>
            <p><span className="text-muted w-16 inline-block">전화</span> 718-123-4567</p>
          </div>
          <div className="space-y-2">
            <p><span className="text-muted w-16 inline-block">주소</span> 136-20 38th Ave, Flushing, NY</p>
            <p><span className="text-muted w-16 inline-block">가입</span> 2024.06.15</p>
          </div>
        </div>
      </div>

      {/* 리뷰 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">리뷰</h2>
          <button className="text-sm bg-black text-white px-4 py-1.5 rounded-full hover:bg-gray-800 transition-colors">
            리뷰 작성
          </button>
        </div>
        <div className="space-y-4">
          <div className="py-4 border-b border-border">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-yellow-500 text-sm">★★★★★</span>
              <span className="text-sm font-medium">플러싱토끼</span>
              <span className="text-xs text-muted">2025.02.10</span>
            </div>
            <p className="text-sm">친절하고 전문적입니다. 퀸즈 지역 매물을 잘 알고 계세요.</p>
          </div>
          <div className="py-4 border-b border-border">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-yellow-500 text-sm">★★★★☆</span>
              <span className="text-sm font-medium">맨하탄곰</span>
              <span className="text-xs text-muted">2025.01.22</span>
            </div>
            <p className="text-sm">응대가 빠르고 계약 과정을 꼼꼼하게 설명해주셨습니다.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
