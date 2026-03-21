export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">개인정보처리방침</h1>
      <p className="text-sm text-muted mb-2">시행일: 2025년 1월 1일</p>

      <div className="space-y-6 text-sm leading-relaxed text-gray-700">
        <section>
          <h2 className="text-lg font-semibold mb-2 text-gray-900">1. 수집하는 개인정보</h2>
          <p>이동네(edongne.com)는 서비스 이용 시 다음의 개인정보를 수집합니다:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>소셜 로그인 시: 이름, 이메일, 프로필 사진</li>
            <li>서비스 이용 시: 작성 게시물, 댓글, 접속 기록</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2 text-gray-900">2. 개인정보의 이용 목적</h2>
          <p>수집된 개인정보는 다음 목적으로 이용됩니다:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>회원 식별 및 로그인 서비스 제공</li>
            <li>커뮤니티 서비스 운영</li>
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
          <h2 className="text-lg font-semibold mb-2 text-gray-900">5. 데이터 삭제 요청</h2>
          <p>
            사용자는 언제든지 자신의 데이터 삭제를 요청할 수 있습니다.
            삭제 요청은 이메일(aaronlee103@gmail.com)로 보내주시면 처리해 드립니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2 text-gray-900">6. 문의</h2>
          <p>
            개인정보 관련 문의사항은 아래 연락처로 보내주세요.<br />
            이메일: aaronlee103@gmail.com
          </p>
        </section>
      </div>
    </div>
  )
}
