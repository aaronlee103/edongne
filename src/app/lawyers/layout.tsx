import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '변호사 찾기',
  description: '뉴욕, 뉴저지 지역 변호사를 검색하세요. 부동산 법률, 이민, 비즈니스 전문 변호사의 프로필과 리뷰를 확인하세요.',
  keywords: '변호사, 뉴욕 변호사, 뉴저지 변호사, 부동산 변호사, 법률 상담, attorney, lawyer',
  openGraph: {
    title: '변호사 찾기 | 이동네',
    description: '뉴욕, 뉴저지 지역 변호사를 검색하세요.',
    type: 'website',
  },
}

export default function LawyersLayout({ children }: { children: React.ReactNode }) {
  return children
}
