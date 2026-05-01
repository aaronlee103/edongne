import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '융자/모기지 전문가 찾기',
  description: '뉴욕, 뉴저지 지역 모기지, 주택융자 전문가를 검색하세요. 첫 주택 구매, 재융자, 다운페이먼트 프로그램 상담을 받아보세요.',
  keywords: '모기지, 주택융자, 재융자, 뉴욕 모기지, 뉴저지 융자, mortgage, refinance',
  openGraph: {
    title: '융자/모기지 전문가 찾기 | 이동네',
    description: '뉴욕, 뉴저지 지역 모기지, 주택융자 전문가를 검색하세요.',
    type: 'website',
  },
}

export default function MortgageLayout({ children }: { children: React.ReactNode }) {
  return children
}
