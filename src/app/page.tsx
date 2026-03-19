import Link from 'next/link'

// 매거진 홈 - 요즘IT 스타일
export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 히어로 섹션 */}
      <section className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">이동네</h1>
        <p className="text-muted text-lg">뉴욕·뉴저지 한인을 위한 부동산·생활 커뮤니티</p>
      </section>

      {/* 이번주 토픽 */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">이번주 토픽</h2>
          <Link href="/board?cat=topic" className="text-sm text-muted hover:text-primary">
            더보기 →
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <TopicCard
            title="2025 뉴욕 부동산 시장 전망"
            summary="올해 뉴욕 부동산 시장은 금리 인하 기대감과 함께 회복세를 보이고 있습니다."
            tag="부동산"
            date="2025.03.15"
          />
          <TopicCard
            title="집 수리 전 반드시 알아야 할 퍼밋 가이드"
            summary="뉴욕·뉴저지에서 리노베이션 시 필요한 허가 절차를 정리했습니다."
            tag="건축"
            date="2025.03.12"
          />
        </div>
      </section>

      {/* 커뮤니티 인기글 + 업체 찾기 2단 */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* 커뮤니티 인기글 */}
        <section className="md:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">커뮤니티 인기글</h2>
            <Link href="/board" className="text-sm text-muted hover:text-primary">
              더보기 →
            </Link>
          </div>
          <div className="space-y-1">
            <PostRow title="플러싱에서 맨하탄 출퇴근 어떤가요?" category="질문답변" comments={23} votes={45} />
            <PostRow title="뉴저지 포트리 한인 마트 추천" category="자유" comments={15} votes={32} />
            <PostRow title="H1B 변호사 추천 부탁드립니다" category="질문답변" comments={31} votes={28} />
            <PostRow title="우드사이드 1BR 월세 얼마가 적당한가요?" category="부동산" comments={19} votes={22} />
            <PostRow title="핸디맨 vs 건축업체, 어떤 경우에 뭘 써야하나" category="정보" comments={27} votes={41} />
          </div>
        </section>

        {/* 업체 찾기 사이드바 */}
        <aside>
          <h2 className="text-xl font-bold mb-6">업체 찾기</h2>
          <div className="space-y-3">
            <DirectoryLink href="/realtors" label="부동산 리얼터" count={286} />
            <DirectoryLink href="/builders" label="건축/인테리어" count={319} />
            <DirectoryLink href="/lawyers" label="변호사" count={426} />
            <DirectoryLink href="/mortgage" label="융자/모기지" count={48} />
          </div>

          <div className="mt-8 p-4 bg-bg-light rounded-lg border border-border">
            <h3 className="font-semibold text-sm mb-2">업체 등록 안내</h3>
            <p className="text-xs text-muted mb-3">
              이동네에 업체를 등록하고 더 많은 고객을 만나보세요.
            </p>
            <Link
              href="/pricing"
              className="text-xs font-medium text-primary hover:underline"
            >
              요금 안내 보기 →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}

function TopicCard({ title, summary, tag, date }: {
  title: string; summary: string; tag: string; date: string
}) {
  return (
    <Link href="#" className="magazine-card block p-6 border border-border rounded-lg">
      <span className="text-xs font-medium text-muted uppercase tracking-wider">{tag}</span>
      <h3 className="text-lg font-bold mt-2 mb-2">{title}</h3>
      <p className="text-sm text-secondary line-clamp-2">{summary}</p>
      <span className="text-xs text-muted mt-3 block">{date}</span>
    </Link>
  )
}

function PostRow({ title, category, comments, votes }: {
  title: string; category: string; comments: number; votes: number
}) {
  return (
    <Link href="#" className="flex items-center gap-3 py-3 border-b border-border hover:bg-gray-50 px-2 rounded transition-colors">
      <span className="text-xs text-muted font-medium w-16 shrink-0">{category}</span>
      <span className="text-sm flex-1 truncate">{title}</span>
      <span className="text-xs text-muted shrink-0">💬 {comments}</span>
      <span className="text-xs text-muted shrink-0">▲ {votes}</span>
    </Link>
  )
}

function DirectoryLink({ href, label, count }: {
  href: string; label: string; count: number
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-gray-50 transition-colors"
    >
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs text-muted">{count}개</span>
    </Link>
  )
}
