import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '건축/인테리어 업체 찾기',
  description: '뉴욕, 뉴저지 지역 건축, 인테리어, 리모델링 전문 업체를 검색하세요. 포트폴리오와 리뷰를 확인하고 견적을 받아보세요.',
  keywords: '건축, 인테리어, 리모델링, 뉴욕 건축, 뉴저지 인테리어, 홈 리노베이션, contractor',
  openGraph: {
    title: '건축/인테리어 업체 찾기 | 이동네',
    description: '뉴욕, 뉴저지 지역 건축, 인테리어 전문 업체를 검색하세요.',
    type: 'website',
  },
}

export default function BuildersLayout({ children }: { children: React.ReactNode }) {
  return children
}
