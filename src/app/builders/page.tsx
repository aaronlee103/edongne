'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

export default function BuildersPage() {
  const supabase = createClient()
  const [region, setRegion] = useState('전체')
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchItems() }, [region])

  async function fetchItems() {
    setLoading(true)
    let query = supabase.from('businesses').select('*').eq('type', 'builder').order('kor_name')
    if (region !== '전체') query = query.eq('region', region)
    const { data } = await query
    if (data) setItems(data)
    setLoading(false)
  }

  const filtered = search
    ? items.filter(b => b.kor_name?.includes(search) || b.eng_name?.toLowerCase().includes(search.toLowerCase()) || b.area?.includes(search))
    : items

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">건축/인테리어</h1>
        <p className="text-muted text-sm">뉴욕·뉴저지 한인 건축업체·핸디맨 {items.length}개</p>
      </div>
      <div className="flex gap-2 mb-6">
        {['전체', 'NY', 'NJ'].map((r) => (
          <button key={r} onClick={() => setRegion(r)} className={`px-3 py-1.5 text-sm rounded-full transition-colors ${region === r ? 'bg-black text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'}`}>{r}</button>
        ))}
      </div>
      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="업체명, 지역으로 검색..." className="w-full md:w-96 px-4 py-2 border border-border rounded-lg text-sm mb-6 focus:outline-none focus:border-black" />
      {loading ? (
        <p className="text-center py-12 text-muted text-sm">불러오는 중...</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b) => (
            <Link key={b.id} href={`/business/${b.id}`} className="block p-4 border border-border rounded-lg hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-sm">{b.kor_name}</h3>
                  <p className="text-xs text-muted">{b.eng_name}</p>
                </div>
                {b.plan !== 'basic' && <span className={`text-xs px-1.5 py-0.5 rounded ${b.plan === 'premium' ? 'bg-black text-white' : 'bg-gray-200'}`}>{b.plan?.toUpperCase()}</span>}
              </div>
              <div className="space-y-1 text-xs text-secondary">
                {b.region && b.area && <p>📍 {b.region} · {b.area}</p>}
                {b.phone1 && <p>📞 {b.phone1}</p>}
                {b.specialty && <p>🔨 {b.specialty}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
