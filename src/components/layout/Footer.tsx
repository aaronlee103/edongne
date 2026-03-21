import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <h4 className="font-semibold mb-3">이동네</h4>
            <p className="text-muted leading-relaxed">
              뉴욕·뉴저지 한인 커뮤니티<br />
              부동산 · 건축 · 법률 · 융자
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
              <li><Link href="/pricing" className="hover:text-primary">요금 안내</Link></li>
              <li><Link href="/business-register" className="hover:text-primary">업체 등록</Link></li>
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
