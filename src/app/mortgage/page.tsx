'use client'

import { useState } from 'react'
import Link from 'next/link'

const MOCK_MORTGAGE = [
  { id: '30', kor_name: '한미 모기지', eng_name: 'Korean American Mortgage', region: 'NY', area: '퀸즈', phone1: '718-555-7000', specialty: '주택 구매 융자', plan: 'premium' },
  { id: '31', kor_name: '뉴스타 융자', eng_name: 'New Star Lending', region: 'NJ', area: '포트리', phone1: '201-555-8000', specialty: '리파이낸싱', plan: 'pro' },
  { id: '32', kor_name: '베스트 론', eng_name: 'Best Loan Corp', region: 'NY', area: '맨하탄', phone1: '212-555-9000', specialty: 'FHA/VA 론', plan: 'basic' },
  { id: '33', kor_name: '프라임 렌딩', eng_name: 'Prime Lending NY', region: 'NY', area: '퀸즈', phone1: '917-555-0100', specialty: '투자용 융자', plan: 'basic' },
]

export default function MortgagePage() {
  const [region, setRegion] = useState('전체')
  const filtered = region === '전체' ? MOCK_MORTGAGE : MOCK_MORTGAGE.filter(m => m.region === region)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">융자/모기지</h1>
        <p className="text-muted text-sm">뉴욕·뉴저지 한인 융자 전문가 48명</p>
      </div>
      <div className="flex gap-2 mb-6">
        {['전체', 'NY', 'NJ'].map((r) => (
          <button key={r} onClick={() => setRegion(r)} className={`px-3 py-1.5 text-sm rounded-full transition-colors ${region === r ? 'bg-black text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'}`}>{r}</button>
        ))}
      </div>
      <input type="text" placeholder="업체명, 전문분야로 검색..." className="w-full md:w-96 px-4 py-2 border border-border rounded-lg text-sm mb-6 focus:outline-none focus:border-black" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((m) => (
          <Link key={m.id} href={`/business/${m.id}`} className="block p-4 border border-border rounded-lg hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-sm">{m.kor_name}</h3>
                <p className="text-xs text-muted">{m.eng_name}</p>
              </div>
              {m.plan !== 'basic' && <span className={`text-xs px-1.5 py-0.5 rounded ${m.plan === 'premium' ? 'bg-black text-white' : 'bg-gray-200'}`}>{m.plan.toUpperCase()}</span>}
            </div>
            <div className="space-y-1 text-xs text-secondary">
              <p>📍 {m.region} · {m.area}</p>
              <p>📞 {m.phone1}</p>
              <p>💰 {m.specialty}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
