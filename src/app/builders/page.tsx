'use client'

import { useState } from 'react'
import Link from 'next/link'

const MOCK_BUILDERS = [
  { id: '10', kor_name: '한빛 건축', eng_name: 'Hanbit Construction', region: 'NY', area: '퀸즈', phone1: '718-555-1111', specialty: '주택 리모델링', plan: 'premium' },
  { id: '11', kor_name: '새집 인테리어', eng_name: 'Saejip Interior', region: 'NJ', area: '포트리', phone1: '201-555-2222', specialty: '인테리어/페인팅', plan: 'pro' },
  { id: '12', kor_name: '프로 핸디맨', eng_name: 'Pro Handyman NYC', region: 'NY', area: '맨하탄', phone1: '212-555-3333', specialty: '핸디맨/수리', plan: 'basic' },
  { id: '13', kor_name: '명품 주방', eng_name: 'Luxury Kitchen NY', region: 'NY', area: '브루클린', phone1: '718-555-4444', specialty: '주방/욕실', plan: 'pro' },
  { id: '14', kor_name: '든든 건설', eng_name: 'Deundeun Build', region: 'NJ', area: '팰팍', phone1: '201-555-5555', specialty: '증축/신축', plan: 'basic' },
  { id: '15', kor_name: '하이 플로링', eng_name: 'High Flooring', region: 'NY', area: '퀸즈', phone1: '917-555-6666', specialty: '바닥재/타일', plan: 'basic' },
]

export default function BuildersPage() {
  const [region, setRegion] = useState('전체')
  const filtered = region === '전체' ? MOCK_BUILDERS : MOCK_BUILDERS.filter(b => b.region === region)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">건축/인테리어</h1>
        <p className="text-muted text-sm">뉴욕·뉴저지 한인 건축업체·핸디맨 319개</p>
      </div>
      <div className="flex gap-2 mb-6">
        {['전체', 'NY', 'NJ'].map((r) => (
          <button key={r} onClick={() => setRegion(r)} className={`px-3 py-1.5 text-sm rounded-full transition-colors ${region === r ? 'bg-black text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'}`}>{r}</button>
        ))}
      </div>
      <input type="text" placeholder="업체명, 지역, 전문분야로 검색..." className="w-full md:w-96 px-4 py-2 border border-border rounded-lg text-sm mb-6 focus:outline-none focus:border-black" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((b) => (
          <Link key={b.id} href={`/business/${b.id}`} className="block p-4 border border-border rounded-lg hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-sm">{b.kor_name}</h3>
                <p className="text-xs text-muted">{b.eng_name}</p>
              </div>
              {b.plan !== 'basic' && <span className={`text-xs px-1.5 py-0.5 rounded ${b.plan === 'premium' ? 'bg-black text-white' : 'bg-gray-200'}`}>{b.plan.toUpperCase()}</span>}
            </div>
            <div className="space-y-1 text-xs text-secondary">
              <p>📍 {b.region} · {b.area}</p>
              <p>📞 {b.phone1}</p>
              <p>🔨 {b.specialty}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
