'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

export default function RealtorsPage() {
  const supabase = createClient()
  const [region, setRegion] = useState('전체')
  const [search, setSearch] = useState('')
  const [realtors, setRealtors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchRealtors() }, [region])

  async function fetchRealtors() {
    setLoading(true)
    let query = supabase.from('businesses').select('*').eq('type', 'realtor').or('status.is.null,status.eq.active').or('published.is.null,published.eq.true').order('kor_name')
    if (region !== '전체') query = query.eq('region', region)
    const { data } = await query
    if (data) setRealtors(data)
    setLoading(false)
  }

  const filtered = search
    ? realtors.filter(r => r.kor_name?.includes(search) || r.eng_name?.toLowerCase().includes(search.toLowerCase()) || r.area?.includes(search))
    : realtors

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">부동산 리얼터</h1>
        <p className="text-muted text-sm">뉴욕·뉴저지 한인 리얼터 {realtors.length}명</p>
      </div>
      <div className="flex gap-2 mb-6">
        {['전체', 'NY', 'NJ'].map((r) => (
          <button key={r} onClick={() => setRegion(r)} className={`px-3 py-1.5 text-sm rounded-full transition-colors ${region === r ? 'bg-black text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'}`}>{r}</button>
        ))}
      </div>
      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="리얼터 이름, 지역으로 검색..." className="w-full md:w-96 px-4 py-2 border border-border rounded-lg text-sm mb-6 focus:outline-none focus:border-black" />
      {loading ? (
        <p className="text-center py-12 text-muted text-sm">불러오는 중...</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <Link key={r.id} href={`/business/${r.id}`} className="flex border border-border rounded-lg hover:shadow-md transition-all overflow-hidden">
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-sm">{r.kor_name}</h3>
                    <p className="text-xs text-muted">{r.eng_name}</p>
                  </div>
                  {r.plan !== 'basic' && <span className={`text-xs px-1.5 py-0.5 rounded ${r.plan === 'premium' ? 'bg-black text-white' : 'bg-gray-200'}`}>{r.plan?.toUpperCase()}</span>}
                </div>
                {r.tagline && <p className="text-xs text-primary mb-2 line-clamp-1">{r.tagline}</p>}
                <div className="space-y-1 text-xs text-secondary">
                  {r.region && r.area && <p>📍 {r.region} · {r.area}</p>}
                  {r.phone1 && <p>📞 {r.phone1}</p>}
                </div>
              </div>
              {r.hero_image && (
                <div className="w-24 h-24 m-3 flex-shrink-0">
                  <img src={r.hero_image} alt={r.kor_name} className="w-full h-full object-cover rounded-lg" />
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
