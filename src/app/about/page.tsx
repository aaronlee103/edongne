import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">이동네 소개</h1>
      <p className="text-muted text-sm mb-10">뉴욕·뉴저지 한인을 위한 지역 커뮤니티 플랫폼</p>

      <div className="space-y-8 text-sm leading-relaxed text-gray-700">
        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-900">이동네는</h2>
          <p>
            이동네(edongne.com)는 뉴욕과 뉴저지에 거주하는 한인들을 위한 지역 커뮤니티 플랫폼입니다.
            부동산, 건축/인테리어, 법률, 융자/모기지 등 생활에 필요한 전문 업체 정보를 한곳에서 찾아볼 수 있으며,
            자유게시판, 질문답변, 사고팔고, 구인구직 등 다양한 커뮤니티 기능을 제공합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-900">주요 서비스</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-1">업체 디렉토리</h3>
              <p className="text-muted">부동산 리얼터, 건축업체, 변호사, 융자 전문가 등 검증된 한인 업체 정보를 지역별로 검색하고 리뷰를 확인할 수 있습니다.</p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-1">커뮤니티</h3>
              <p className="text-muted">자유게시판, 질문답변, 사고팔고, 구인구직 등 한인 커뮤니티 게시판을 통해 이웃과 소통할 수 있습니다.</p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-1">매거진</h3>
              <p className="text-muted">부동산 시장 동향, 법률 정보, 생활 팁 등 유용한 한인 생활 정보를 매거진 형태로 제공합니다.</p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-1">업체 등록</h3>
              <p className="text-muted">사업체를 운영하고 계신다면 이동네에 등록하여 더 많은 한인 고객을 만나보세요.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-900">커뮤니티 이용 안내</h2>
          <div className="bg-gray-50 border border-border rounded-lg p-5">
            <p className="mb-3">
              이동네 커뮤니티(자유게시판, 질문답변, 사고팔고, 구인구직 등)에 게시되는 모든 콘텐츠는
              <strong> 작성자 본인의 책임</strong>하에 게시됩니다.
            </p>
            <ul className="space-y-2 text-muted">
              <li>• 게시물의 정확성, 신뢰성, 적법성에 대한 책임은 작성자 본인에게 있습니다.</li>
              <li>• 타인의 명예를 훼손하거나 개인정보를 침해하는 게시물은 삭제될 수 있습니다.</li>
              <li>• 허위 정보, 사기성 게시물, 불법적인 내용은 경고 없이 삭제되며 계정이 정지될 수 있습니다.</li>
              <li>• 사고팔고/구인구직 거래는 당사자 간의 직접 거래이며, 이동네는 거래에 대한 책임을 지지 않습니다.</li>
              <li>• 게시물 작성 시 개인정보(전화번호, 주소 등) 노출에 주의해 주세요.</li>
            </ul>
            <p className="mt-3 text-muted">
              건전하고 유익한 커뮤니티를 만들기 위해 모든 이용자의 협조를 부탁드립니다.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-900">연락처</h2>
          <div className="space-y-1.5">
            <p>이메일: <a href="mailto:info@edongne.com" className="text-blue-600 hover:underline">info@edongne.com</a></p>
            <p>웹사이트: <a href="https://edongne.com" className="text-blue-600 hover:underline">edongne.com</a></p>
          </div>
        </section>
      </div>

      <div className="mt-10 pt-6 border-t border-border flex gap-4 text-sm">
        <Link href="/contact" className="text-blue-600 hover:underline">문의하기 →</Link>
        <Link href="/privacy" className="text-blue-600 hover:underline">개인정보처리방침 →</Link>
      </div>
    </div>
  )
}
