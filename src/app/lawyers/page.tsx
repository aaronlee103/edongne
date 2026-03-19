'use client'

import { useState } from 'react'
import Link from 'next/link'

const MOCK_LAWYERS = [
  { id: '20', kor_name: '김변호사 법률사무소', eng_name: 'Kim Law Office', region: 'NY', area: '맨하탄', phone1: '212-555-1000', specialty: '이민법', plan: 'premium' },
  { id: '21', kor_name: '박앤리 법률그룹', eng_name: 'Park & Lee Legal', region: 'NY', area: '퀸즈', phone1: '718-555-2000', specialty: '부동산법', plan: 'pro' },
  { id: '22', kor_name: '이정우 변호사', eng_name: 'JW Lee, Esq.', region: 'NJ', area: '포트리', phone1: '201-555-3000', specialty: '형사법', plan: 'basic' },
  { id: '23', kor_name: '한미 법률센터', eng_name: 'Korean American Legal Center', region: 'NY', area: '맨하탄', phone1: '212-555-4000', specialty: '노동법', plan: 'pro' },
  { id: '24', kor_name: '최변호사 이민법', eng_name: 'Choi Immigration Law', region: 'NJ', area: '팰팍', phone1: '201-555-5000', specialty: '이민/비자', plan: 'premium' },
  { id: '25', kor_name: '정앤정 법률', eng_name: 'Jung & Jung Law', region: 'NY', area: '브루클린', phone1: '718-555-6000', specialty: '가족법', plan: 'basic' },
]

export default function LawyersPage() {
  const [region, setRegion] = useState('전체')
  const filtered = region === '전체' ? MOCK_LAWYERS : MOCK_LAWYERS.filter(l => l.region === region)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">변호사</h1>
        <p className="text-muted text-sm">뉴욕·뉴저지 한인 변호사 426명</p>
      </div>
      <div className="flex gap-2 mb-6">
        {['전체', 'NY', 'NJ'].map((r) => (
          <button key={r} onClick={() => setRegion(r)} className={`px-3 py-1.5 text-sm rounded-full transition-colors ${region === r ? 'bg-black text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'}`}>{r}</button>
        ))}
      </div>
      <input type="text" placeholder="변호사 이름, 전문분야로 검색..." className="w-full md:w-96 px-4 py-2 border border-border rounded-lg text-sm mb-6 focus:outline-none focus:border-black" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((l) => (
          <Link key={l.id} href={`/business/${l.id}`} className="block p-4 border border-border rounded-lg hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-sm">{l.kor_name}</h3>
                <p className="text-xs text-muted">{l.eng_name}</p>
              </div>
              {l.plan !== 'basic' && <span className={`text-xs px-1.5 py-0.5 rounded ${l.plan === 'premium' ? 'bg-black text-white' : 'bg-gray-200'}`}>{l.plan.toUpperCase()}</span>}
            </div>
            <div className="space-y-1 text-xs text-secondary">
              <p>📍 {l.region} · {l.area}</p>
              <p>📞 {l.phone1}</p>
              <p>⚖️ {l.specialty}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
