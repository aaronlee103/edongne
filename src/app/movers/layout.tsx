import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '이사 업체 찾기',
  description: '뉴욕, 뉴저지 지역 이사 전문 업체를 검색하세요. 가정이사, 상업이사, 포장이사 업체의 리뷰와 견적을 비교해보세요.',
  keywords: '이사, 이사업체, 뉴욕 이사, 뉴저지 이사, 포장이사, moving company, movers',
  openGraph: {
    title: '이사 업체 찾기 | 이동네',
    description: '뉴욕, 뉴저지 지역 이사 전문 업체를 검색하세요.',
    type: 'website',
  },
}

export default function MoversLayout({ children }: { children: React.ReactNode }) {
  return children
}
