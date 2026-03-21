export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">개인정보처리방침</h1>
      <p className="text-sm text-muted mb-8">시행일: 2025년 1월 1일</p>

      <div className="space-y-6 text-sm leading-relaxed text-gray-700">
        <section>
          <h2 className="text-lg font-semibold mb-2 text-gray-900">1. 수집하는 개인정보</h2>
          <p>이동네(edongne.com)는 서비스 이용 시 다음의 개인정보를 수집합니다:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>소셜 로그인 시: 이름, 이메일, 프로필 사진</li>
            <li>서비스 이용 시: 작성 게시물, 댓글, 접속 기록</li>
            <li>업체 등록 시: 업체명, 전화번호, 이메일, 주소, 업체 이미지</li>
            <li>문의 시: 이름, 이메일, 전화번호, 문의 내용</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2 text-gray-900">2. 개인정보의 이용 목적</h2>
          <p>수집된 개인정보는 다음 목적으로 이용됩니다:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>회원 식별 및 로그인 서비스 제공</li>
            <li>커뮤니티 서비스 운영</li>
            <li>업체 디렉토리 서비스 운영</li>
            <li>문의 응대 및 고객 지원</li>
            <li>서비스 개선 및 통계 분석</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2 text-gray-900">3. 개인정보의 보유 및 파기</h2>
          <p>
            회원 탈퇴 시 개인정보는 즉시 파기됩니다. 단, 관련 법령에 따라 일정 기간 보관이
            필요한 경우 해당 기간 동안 보관 후 파기합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2 text-gray-900">4. 개인정보의 제3자 제공</h2>
          <p>
            이동네는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다.
            다만, 법령에 의한 요청이 있는 경우 예외로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2 text-gray-900">5. 이용자 게시물 관련</h2>
          <p>
            커뮤니티 게시판(자유게시판, 질문답변, 사고팔고, 구인구직 등)에 게시되는 모든 콘텐츠는
            작성자 본인의 책임하에 게시됩니다. 이동네는 이용자가 게시한 콘텐츠의 정확성, 신뢰성, 적법성에 대해 보증하지 않으며,
            게시물로 인해 발생하는 분쟁에 대한 책임은 작성자 본인에게 있습니다.
          </p>
          <p className="mt-2">
            다음에 해당하는 게시물은 사전 통보 없이 삭제될 수 있으며, 반복 위반 시 계정이 정지될 수 있습니다:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>타인의 명예를 훼손하거나 개인정보를 침해하는 게시물</li>
            <li>허위 정보, 사기성 게시물, 불법적인 내용</li>
            <li>음란물, 폭력적 콘텐츠, 혐오 표현</li>
            <li>상업적 스팸 또는 반복적 광고성 게시물</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2 text-gray-900">6. 면책 사항</h2>
          <p>
            이동네는 플랫폼 제공자로서, 이용자 간의 거래(사고팔고, 구인구직 등)에 대한 책임을 지지 않습니다.
            업체 디렉토리에 등록된 업체 정보의 정확성은 해당 업체에 책임이 있으며, 이동네는 이를 보증하지 않습니다.
            이용자는 자신의 판단과 책임하에 서비스를 이용해야 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2 text-gray-900">7. 데이터 삭제 요청</h2>
          <p>
            사용자는 언제든지 자신의 데이터 삭제를 요청할 수 있습니다.
            삭제 요청은 아래 이메일로 보내주시면 처리해 드립니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2 text-gray-900">8. 문의</h2>
          <p>
            개인정보 관련 문의사항은 아래 연락처로 보내주세요.
          </p>
          <p className="mt-1">이메일: <a href="mailto:info@edongne.com" className="text-blue-600 hover:underline">info@edongne.com</a></p>
        </section>
      </div>
    </div>
  )
}
