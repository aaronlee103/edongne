'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { uploadImage } from '@/lib/upload'

const TYPES: Record<string, string> = { realtor: '부동산', builder: '건축', lawyer: '변호사', mortgage: '융자' }
const PLAN_OPTIONS = ['basic', 'pro', 'premium']
const STATUS_OPTIONS = ['active', 'pending', 'suspended']

export default function AdminBusinessesPage() {
  const supabase = createClient()
  const [businesses, setBusinesses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  useEffect(() => { fetchBusinesses() }, [filter])

  async function fetchBusinesses() {
    setLoading(true)
    let query = supabase.from('businesses').select('*').order('created_at', { ascending: false }).limit(100)
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

  async function quickUpdate(id: string, field: string, value: string) {
    const { error } = await supabase.from('businesses').update({ [field]: value }).eq('id', id)
    if (error) {
      alert('변경 실패: ' + error.message)
    } else {
      setBusinesses(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b))
    }
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
              <th className="text-left px-4 py-2 font-medium text-muted w-24">플랜</th>
              <th className="text-left px-4 py-2 font-medium text-muted w-24">상태</th>
              <th className="text-left px-4 py-2 font-medium text-muted w-28">전화</th>
              <th className="text-left px-4 py-2 font-medium text-muted w-24">관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted">불러오는 중...</td></tr>
            ) : businesses.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted">등록된 업체가 없습니다</td></tr>
            ) : businesses.map((b) => (
              <tr key={b.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                <td className="px-4 py-2.5">
                  <div className="font-medium">{b.kor_name}</div>
                  {b.eng_name && <div className="text-xs text-muted">{b.eng_name}</div>}
                </td>
                <td className="px-4 py-2.5 text-xs">{TYPES[b.type] || b.type}</td>
                <td className="px-4 py-2.5 text-xs text-muted">{b.region}</td>
                <td className="px-4 py-2.5">
                  <select
                    value={b.plan || 'basic'}
                    onChange={e => quickUpdate(b.id, 'plan', e.target.value)}
                    className={`text-xs px-1.5 py-0.5 rounded border-0 cursor-pointer ${
                      b.plan === 'premium' ? 'bg-black text-white' :
                      b.plan === 'pro' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-muted'
                    }`}
                  >
                    {PLAN_OPTIONS.map(p => (
                      <option key={p} value={p}>{p.toUpperCase()}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2.5">
                  <select
                    value={b.status || 'active'}
                    onChange={e => quickUpdate(b.id, 'status', e.target.value)}
                    className={`text-xs px-1.5 py-0.5 rounded border-0 cursor-pointer ${
                      b.status === 'active' || !b.status ? 'bg-green-100 text-green-700' :
                      b.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s === 'active' ? '활성' : s === 'pending' ? '대기' : '정지'}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2.5 text-xs text-muted">{b.phone1}</td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-2">
                    <button onClick={() => setEditId(editId === b.id ? null : b.id)} className="text-xs text-blue-600 hover:underline">수정</button>
                    <button onClick={() => deleteBusiness(b.id)} className="text-xs text-red-500 hover:underline">삭제</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 수정 모달 */}
      {editId && (
        <EditBusinessModal
          supabase={supabase}
          business={businesses.find(b => b.id === editId)}
          onClose={() => setEditId(null)}
          onSave={() => { fetchBusinesses(); setEditId(null) }}
        />
      )}
    </div>
  )
}

function EditBusinessModal({ supabase, business, onClose, onSave }: { supabase: any; business: any; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    kor_name: business.kor_name || '',
    eng_name: business.eng_name || '',
    type: business.type || 'realtor',
    phone1: business.phone1 || '',
    email: business.email || '',
    website: business.website || '',
    region: business.region || 'NY',
    area: business.area || '',
    specialty: business.specialty || '',
    tagline: business.tagline || '',
    description: business.description || '',
    plan: business.plan || 'basic',
    status: business.status || 'active',
  })
  const [heroImage, setHeroImage] = useState<string | null>(business.hero_image || null)
  const [portfolio, setPortfolio] = useState<{ url: string; caption: string }[]>(business.portfolio || [])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  async function handleHeroUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert('이미지는 2MB 이하만 업로드 가능합니다.'); return }
    setUploading(true)
    const url = await uploadImage(file)
    if (url) setHeroImage(url)
    else alert('이미지 업로드에 실패했습니다.')
    setUploading(false)
    e.target.value = ''
  }

  async function handlePortfolioUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.size > 2 * 1024 * 1024) continue
      const url = await uploadImage(file)
      if (url) setPortfolio(prev => [...prev, { url, caption: '' }])
    }
    setUploading(false)
    e.target.value = ''
  }

  function removePortfolioItem(index: number) {
    setPortfolio(prev => prev.filter((_, i) => i !== index))
  }

  function updatePortfolioCaption(index: number, caption: string) {
    setPortfolio(prev => prev.map((item, i) => i === index ? { ...item, caption } : item))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.kor_name.trim()) return
    setSaving(true)
    const { error } = await supabase.from('businesses').update({
      ...form,
      hero_image: heroImage,
      portfolio: portfolio.length > 0 ? portfolio : null,
    }).eq('id', business.id)
    if (error) {
      alert('수정 실패: ' + error.message)
    } else {
      onSave()
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">업체 수정</h2>
          <button onClick={onClose} className="text-muted hover:text-primary text-xl">✕</button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* 업종 & 플랜 & 상태 */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">업종</label>
              <select value={form.type} onChange={e => update('type', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm">
                <option value="realtor">부동산</option><option value="builder">건축</option>
                <option value="lawyer">변호사</option><option value="mortgage">융자</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">플랜</label>
              <select value={form.plan} onChange={e => update('plan', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm">
                <option value="basic">BASIC</option><option value="pro">PRO</option><option value="premium">PREMIUM</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">상태</label>
              <select value={form.status} onChange={e => update('status', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm">
                <option value="active">활성</option><option value="pending">대기</option><option value="suspended">정지</option>
              </select>
            </div>
          </div>

          {/* 대표 이미지 */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1">대표 이미지</label>
            <div className="flex items-center gap-3">
              {heroImage ? (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                  <img src={heroImage} alt="대표 이미지" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setHeroImage(null)}
                    className="absolute top-0.5 right-0.5 bg-black/60 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center hover:bg-black/80">✕</button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">없음</div>
              )}
              <label className={`text-xs px-3 py-1.5 rounded-full cursor-pointer ${uploading ? 'bg-gray-200 text-gray-400' : 'bg-gray-100 text-secondary hover:bg-gray-200'}`}>
                {uploading ? '업로드 중...' : '이미지 변경'}
                <input type="file" accept="image/*" onChange={handleHeroUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
          </div>

          {/* 업체명 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">업체명 (한글) *</label>
              <input value={form.kor_name} onChange={e => update('kor_name', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">업체명 (영문)</label>
              <input value={form.eng_name} onChange={e => update('eng_name', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          {/* 연락처 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">전화번호</label>
              <input value={form.phone1} onChange={e => update('phone1', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">이메일</label>
              <input value={form.email} onChange={e => update('email', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          {/* 웹사이트 */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1">웹사이트</label>
            <input value={form.website} onChange={e => update('website', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
          </div>

          {/* 지역 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">주</label>
              <select value={form.region} onChange={e => update('region', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm">
                <option value="NY">NY</option><option value="NJ">NJ</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">상세 지역</label>
              <input value={form.area} onChange={e => update('area', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          {/* 전문분야 */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1">전문분야</label>
            <input value={form.specialty} onChange={e => update('specialty', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
          </div>

          {/* 광고 문구 */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1">광고 문구</label>
            <input value={form.tagline} onChange={e => update('tagline', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm" maxLength={100} />
          </div>

          {/* 업체 소개 */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1">업체 소개</label>
            <textarea value={form.description} onChange={e => update('description', e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm min-h-[80px] resize-y" maxLength={1000} />
          </div>

          {/* 포트폴리오 이미지 */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1">포트폴리오 이미지</label>
            {portfolio.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-2">
                {portfolio.map((item, i) => (
                  <div key={i} className="relative border border-border rounded-lg overflow-hidden">
                    <img src={item.url} alt="" className="w-full h-24 object-cover" />
                    <button type="button" onClick={() => removePortfolioItem(i)}
                      className="absolute top-1 right-1 bg-black/60 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center hover:bg-black/80">✕</button>
                    <input
                      type="text"
                      value={item.caption}
                      onChange={e => updatePortfolioCaption(i, e.target.value)}
                      placeholder="설명 (선택)"
                      className="w-full px-2 py-1 text-xs border-t border-border focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            )}
            <label className={`inline-block text-xs px-3 py-1.5 rounded-full cursor-pointer ${uploading ? 'bg-gray-200 text-gray-400' : 'bg-gray-100 text-secondary hover:bg-gray-200'}`}>
              {uploading ? '업로드 중...' : '+ 이미지 추가'}
              <input type="file" accept="image/*" multiple onChange={handlePortfolioUpload} className="hidden" disabled={uploading} />
            </label>
            <span className="text-xs text-muted ml-2">최대 2MB, 여러 장 선택 가능</span>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-muted hover:text-primary">취소</button>
            <button type="submit" disabled={saving || uploading} className="bg-black text-white px-6 py-2 rounded-full text-sm hover:bg-gray-800 disabled:opacity-50">
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
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
