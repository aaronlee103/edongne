import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '부동산 에이전트 찾기',
  description: '뉴욕, 뉴저지 지역 부동산 에이전트를 검색하세요. 전문 리얼터의 프로필, 전문분야, 리뷰를 확인하고 직접 연락하세요.',
  keywords: '부동산, 리얼터, 에이전트, 뉴욕 부동산, 뉴저지 부동산, 부동산 중개, realtor',
  openGraph: {
    title: '부동산 에이전트 찾기 | 이동네',
    description: '뉴욕, 뉴저지 지역 부동산 에이전트를 검색하세요.',
    type: 'website',
  },
}

export default function RealtorsLayout({ children }: { children: React.ReactNode }) {
  return children
}
