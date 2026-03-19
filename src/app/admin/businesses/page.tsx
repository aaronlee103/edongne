'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'

const TYPES: Record<string, string> = { realtor: '부동산', builder: '건축', lawyer: '변호사', mortgage: '융자' }

export default function AdminBusinessesPage() {
  const supabase = createClient()
  const [businesses, setBusinesses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => { fetchBusinesses() }, [filter])

  async function fetchBusinesses() {
    setLoading(true)
    let query = supabase.from('businesses').select('*').order('created_at', { ascending: false }).limit(50)
    if (filter !== 'all') query = query.eq('type', filter)
    const { data } = await query
    if (data) setBusinesses(data)
    setLoading(false)
  }

  async function deleteBusiness(id: string) {
    if (!confirm('이 업체를 삭제하시겠습니까?')) return
    const { error } = await supabase.from('businesses').delete().eq('id', id)
    if (error) alert('삭제 실패: ' + error.message)
    else fetchBusinesses()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">업체 관리</h1>
        <div className="flex gap-2">
          <span className="text-sm text-muted self-center">{businesses.length}개</span>
          <button onClick={() => setShowAdd(!showAdd)} className="bg-black text-white px-3 py-1.5 rounded-full text-xs hover:bg-gray-800">
            + 업체 추가
          </button>
        </div>
      </div>

      {/* 업체 추가 폼 */}
      {showAdd && <AddBusinessForm supabase={supabase} onAdd={() => { fetchBusinesses(); setShowAdd(false) }} />}

      <div className="flex gap-2 mb-4">
        {[['all', '전체'], ['realtor', '부동산'], ['builder', '건축'], ['lawyer', '변호사'], ['mortgage', '융자']].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`px-3 py-1 text-xs rounded-full ${filter === k ? 'bg-black text-white' : 'bg-gray-100 text-secondary'}`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg-light border-b border-border">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-muted">업체명</th>
              <th className="text-left px-4 py-2 font-medium text-muted w-20">유형</th>
              <th className="text-left px-4 py-2 font-medium text-muted w-16">지역</th>
              <th className="text-left px-4 py-2 font-medium text-muted w-20">플랜</th>
              <th className="text-left px-4 py-2 font-medium text-muted w-28">전화</th>
              <th className="text-left px-4 py-2 font-medium text-muted w-16">관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">불러오는 중...</td></tr>
            ) : businesses.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">등록된 업체가 없습니다</td></tr>
            ) : businesses.map((b) => (
              <tr key={b.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                <td className="px-4 py-2.5">
                  <div className="font-medium">{b.kor_name}</div>
                  {b.eng_name && <div className="text-xs text-muted">{b.eng_name}</div>}
                </td>
                <td className="px-4 py-2.5 text-xs">{TYPES[b.type] || b.type}</td>
                <td className="px-4 py-2.5 text-xs text-muted">{b.region}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    b.plan === 'premium' ? 'bg-black text-white' :
                    b.plan === 'pro' ? 'bg-gray-200' : 'text-muted'
                  }`}>
                    {b.plan}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs text-muted">{b.phone1}</td>
                <td className="px-4 py-2.5">
                  <button onClick={() => deleteBusiness(b.id)} className="text-xs text-red-500 hover:underline">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AddBusinessForm({ supabase, onAdd }: { supabase: any; onAdd: () => void }) {
  const [form, setForm] = useState({
    type: 'realtor', kor_name: '', eng_name: '', phone1: '', region: 'NY', area: '', specialty: '', plan: 'basic'
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.kor_name.trim()) return
    setLoading(true)
    const { error } = await supabase.from('businesses').insert(form)
    if (error) alert('추가 실패: ' + error.message)
    else onAdd()
    setLoading(false)
  }

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  return (
    <form onSubmit={handleSubmit} className="border border-border rounded-lg p-4 mb-6 bg-bg-light">
      <h3 className="font-bold text-sm mb-3">업체 추가</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <select value={form.type} onChange={e => update('type', e.target.value)} className="border border-border rounded px-2 py-1.5">
          <option value="realtor">부동산</option><option value="builder">건축</option>
          <option value="lawyer">변호사</option><option value="mortgage">융자</option>
        </select>
        <input value={form.kor_name} onChange={e => update('kor_name', e.target.value)} placeholder="한글명 *" className="border border-border rounded px-2 py-1.5" required />
        <input value={form.eng_name} onChange={e => update('eng_name', e.target.value)} placeholder="영문명" className="border border-border rounded px-2 py-1.5" />
        <input value={form.phone1} onChange={e => update('phone1', e.target.value)} placeholder="전화번호" className="border border-border rounded px-2 py-1.5" />
        <select value={form.region} onChange={e => update('region', e.target.value)} className="border border-border rounded px-2 py-1.5">
          <option value="NY">NY</option><option value="NJ">NJ</option>
        </select>
        <input value={form.area} onChange={e => update('area', e.target.value)} placeholder="지역 (퀸즈, 포트리...)" className="border border-border rounded px-2 py-1.5" />
        <input value={form.specialty} onChange={e => update('specialty', e.target.value)} placeholder="전문분야" className="border border-border rounded px-2 py-1.5" />
        <select value={form.plan} onChange={e => update('plan', e.target.value)} className="border border-border rounded px-2 py-1.5">
          <option value="basic">Basic</option><option value="pro">Pro</option><option value="premium">Premium</option>
        </select>
      </div>
      <div className="flex justify-end gap-2 mt-3">
        <button type="submit" disabled={loading} className="bg-black text-white px-4 py-1.5 rounded-full text-xs hover:bg-gray-800 disabled:opacity-50">
          {loading ? '추가 중...' : '추가'}
        </button>
      </div>
    </form>
  )
}
