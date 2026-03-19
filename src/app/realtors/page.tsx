'use client'

import { useState } from 'react'
import Link from 'next/link'

const REGIONS = ['전체', 'NY', 'NJ']
const AREAS_NY = ['맨하탄', '퀸즈', '브루클린', '브롱스', '스태튼아일랜드', '롱아일랜드', '웨체스터']
const AREAS_NJ = ['포트리', '팰팍', '잉글우드', '테넥', '리지필드', '에지워터', '버겐카운티']

// 목업 데이터
const MOCK_REALTORS = [
  { id: '1', kor_name: '김영수 부동산', eng_name: 'Young S. Kim Realty', region: 'NY', area: '퀸즈', phone1: '718-123-4567', specialty: '주거/상가', plan: 'premium' },
  { id: '2', kor_name: '박미선 리얼터', eng_name: 'Misun Park', region: 'NY', area: '맨하탄', phone1: '212-987-6543', specialty: '콘도/렌탈', plan: 'pro' },
  { id: '3', kor_name: '이정호 부동산', eng_name: 'JH Lee Realty', region: 'NJ', area: '포트리', phone1: '201-555-0123', specialty: '주택매매', plan: 'pro' },
  { id: '4', kor_name: '최은영 리얼터', eng_name: 'Eunyoung Choi', region: 'NY', area: '브루클린', phone1: '718-555-7890', specialty: '투자용부동산', plan: 'basic' },
  { id: '5', kor_name: '한승우 부동산', eng_name: 'SW Han Realty', region: 'NJ', area: '팰팍', phone1: '201-555-4567', specialty: '주거/상가', plan: 'basic' },
  { id: '6', kor_name: '정수민 리얼터', eng_name: 'Sumin Jung', region: 'NY', area: '퀸즈', phone1: '917-555-2345', specialty: '신축분양', plan: 'premium' },
]

export default function RealtorsPage() {
  const [region, setRegion] = useState('전체')

  const filtered = region === '전체'
    ? MOCK_REALTORS
    : MOCK_REALTORS.filter(r => r.region === region)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">부동산 리얼터</h1>
        <p className="text-muted text-sm">뉴욕·뉴저지 한인 리얼터 286명</p>
      </div>

      {/* 필터 */}
      <div className="flex gap-2 mb-6">
        {REGIONS.map((r) => (
          <button
            key={r}
            onClick={() => setRegion(r)}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              region === r
                ? 'bg-black text-white'
                : 'bg-gray-100 text-secondary hover:bg-gray-200'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* 검색 */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="리얼터 이름, 지역으로 검색..."
          className="w-full md:w-96 px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-black transition-colors"
        />
      </div>

      {/* 리스트 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((realtor) => (
          <Link
            key={realtor.id}
            href={`/business/${realtor.id}`}
            className="block p-4 border border-border rounded-lg hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-sm">{realtor.kor_name}</h3>
                <p className="text-xs text-muted">{realtor.eng_name}</p>
              </div>
              {realtor.plan !== 'basic' && (
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  realtor.plan === 'premium' ? 'bg-black text-white' : 'bg-gray-200 text-primary'
                }`}>
                  {realtor.plan === 'premium' ? 'PREMIUM' : 'PRO'}
                </span>
              )}
            </div>
            <div className="space-y-1 text-xs text-secondary">
              <p>📍 {realtor.region} · {realtor.area}</p>
              <p>📞 {realtor.phone1}</p>
              <p>🏠 {realtor.specialty}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
