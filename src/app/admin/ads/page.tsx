'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useAdminRegion } from '@/context/AdminRegionContext'

// 지역 매핑: admin selectedRegion(소문자) → businesses 테이블 region(대문자)
function getBusinessRegionCodes(adminRegion: string): string[] {
  if (adminRegion === 'ny') return ['NY', 'NJ']
  return [adminRegion.toUpperCase()]
}

// 배치 타입 레이블
const PLACEMENT_LABELS: Record<string, string> = {
  homepage_banner: '홈페이지 배너',
  category_top: '카테고리 상단',
  sidebar: '사이드바',
  magazine_sidebar: '매거진 사이드바',
}

const PLACEMENT_OPTIONS = ['homepage_banner', 'category_top', 'sidebar', 'magazine_sidebar']

// 배치 상태 확인 함수
function isExpired(endDate: string | null): boolean {
  if (!endDate) return false
  return new Date(endDate) < new Date()
}

function isActive(startDate: string | null, endDate: string | null, active: boolean): boolean {
  if (!active) return false
  if (!startDate) return true
  if (new Date(startDate) > new Date()) return false
  if (endDate && new Date(endDate) < new Date()) return false
  return true
}

// ─── 광고 추가 폼 ───
function AddAdPlacementForm({
  supabase,
  regionCodes,
  onAdd,
}: {
  supabase: any
  regionCodes: string[]
  onAdd: () => void
}) {
  const [form, setForm] = useState({
    business_id: '',
    placement: 'homepage_banner',
    priority: 1,
    start_date: '',
    end_date: '',
    notes: '',
    active: true,
  })
  const [businesses, setBusinesses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [saving, setSaving] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    fetchBusinesses()
  }, [searchQuery])

  async function fetchBusinesses() {
    setLoading(true)
    let query = supabase
      .from('businesses')
      .select('id, kor_name, eng_name, region')
      .in('region', regionCodes)
      .order('kor_name', { ascending: true })
      .limit(50)

    if (searchQuery.trim()) {
      query = query.or(`kor_name.ilike.%${searchQuery.trim()}%,eng_name.ilike.%${searchQuery.trim()}%`)
    }

    const { data } = await query
    if (data) setBusinesses(data)
    setLoading(false)
  }

  function handleSelectBusiness(business: any) {
    setForm(f => ({ ...f, business_id: business.id }))
    setSearchQuery(business.kor_name)
    setShowDropdown(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.business_id.trim()) {
      alert('업체를 선택해주세요')
      return
    }
    if (!form.start_date.trim()) {
      alert('시작 날짜를 입력해주세요')
      return
    }
    if (!form.end_date.trim()) {
      alert('종료 날짜를 입력해주세요')
      return
    }

    setSaving(true)
    const { error } = await supabase.from('ad_placements').insert([
      {
        business_id: form.business_id,
        placement: form.placement,
        region: regionCodes[0],
        priority: parseInt(form.priority.toString()),
        start_date: form.start_date,
        end_date: form.end_date,
        notes: form.notes,
        active: form.active,
      },
    ])

    if (error) {
      alert('추가 실패: ' + error.message)
    } else {
      setForm({
        business_id: '',
        placement: 'homepage_banner',
        priority: 1,
        start_date: '',
        end_date: '',
        notes: '',
        active: true,
      })
      setSearchQuery('')
      onAdd()
    }
    setSaving(false)
  }

  const selectedBusiness = businesses.find(b => b.id === form.business_id)

  return (
    <form onSubmit={handleSubmit} className="border border-border rounded-lg p-4 mb-6 bg-gray-50/50">
      <h2 className="text-lg font-semibold mb-4">새 광고 배치 추가</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* 업체 선택 */}
        <div ref={wrapperRef} className="relative">
          <label className="block text-xs font-medium text-muted mb-2">업체 *</label>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onClick={() => setShowDropdown(true)}
            placeholder="업체명으로 검색..."
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
          />
          {loading && <div className="absolute right-3 top-8 text-xs text-muted">검색중...</div>}
          {showDropdown && (
            <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {businesses.length > 0 ? (
                businesses.map(biz => (
                  <button
                    key={biz.id}
                    type="button"
                    onClick={() => handleSelectBusiness(biz)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-border last:border-0 text-sm"
                  >
                    <div className="font-medium">{biz.kor_name}</div>
                    {biz.eng_name && <div className="text-xs text-muted">{biz.eng_name}</div>}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-muted text-center">검색 결과가 없습니다</div>
              )}
            </div>
          )}
          {selectedBusiness && (
            <div className="mt-1 text-xs text-green-600">✓ {selectedBusiness.kor_name} 선택됨</div>
          )}
        </div>

        {/* 배치 타입 */}
        <div>
          <label className="block text-xs font-medium text-muted mb-2">배치 위치 *</label>
          <select
            value={form.placement}
            onChange={e => setForm(f => ({ ...f, placement: e.target.value }))}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
          >
            {PLACEMENT_OPTIONS.map(p => (
              <option key={p} value={p}>
                {PLACEMENT_LABELS[p]}
              </option>
            ))}
          </select>
        </div>

        {/* 우선순위 */}
        <div>
          <label className="block text-xs font-medium text-muted mb-2">우선순위 (높을수록 먼저)</label>
          <input
            type="number"
            value={form.priority}
            onChange={e => setForm(f => ({ ...f, priority: parseInt(e.target.value) || 1 }))}
            min="1"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        {/* 활성 상태 */}
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
              className="w-4 h-4 rounded border-border"
            />
            <span className="text-sm font-medium text-muted">활성</span>
          </label>
        </div>

        {/* 시작 날짜 */}
        <div>
          <label className="block text-xs font-medium text-muted mb-2">시작 날짜 *</label>
          <input
            type="date"
            value={form.start_date}
            onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        {/* 종료 날짜 */}
        <div>
          <label className="block text-xs font-medium text-muted mb-2">종료 날짜 *</label>
          <input
            type="date"
            value={form.end_date}
            onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
      </div>

      {/* 메모 */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-muted mb-2">메모</label>
        <textarea
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          placeholder="선택적 메모..."
          rows={3}
          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="submit"
          disabled={saving}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 disabled:bg-gray-400"
        >
          {saving ? '추가 중...' : '광고 추가'}
        </button>
      </div>
    </form>
  )
}

// ─── 광고 편집 모달 ───
function EditAdPlacementModal({
  supabase,
  ad,
  businesses,
  onClose,
  onSave,
}: {
  supabase: any
  ad: any
  businesses: any[]
  onClose: () => void
  onSave: () => void
}) {
  const [form, setForm] = useState({
    business_id: ad.business_id,
    placement: ad.placement,
    priority: ad.priority,
    start_date: ad.start_date?.split('T')[0] || '',
    end_date: ad.end_date?.split('T')[0] || '',
    notes: ad.notes || '',
    active: ad.active,
  })
  const [saving, setSaving] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('ad_placements')
      .update({
        business_id: form.business_id,
        placement: form.placement,
        priority: parseInt(form.priority.toString()),
        start_date: form.start_date,
        end_date: form.end_date,
        notes: form.notes,
        active: form.active,
      })
      .eq('id', ad.id)

    if (error) {
      alert('저장 실패: ' + error.message)
    } else {
      onSave()
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm('이 광고 배치를 삭제하시겠습니까?')) return
    setSaving(true)

    const { error } = await supabase.from('ad_placements').delete().eq('id', ad.id)

    if (error) {
      alert('삭제 실패: ' + error.message)
    } else {
      onSave()
    }
    setSaving(false)
  }

  const selectedBusiness = businesses.find(b => b.id === form.business_id)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">광고 배치 편집</h2>
          <button onClick={onClose} className="text-2xl text-muted hover:text-secondary">
            ×
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* 업체 선택 */}
          <div>
            <label className="block text-xs font-medium text-muted mb-2">업체</label>
            <select
              value={form.business_id}
              onChange={e => setForm(f => ({ ...f, business_id: e.target.value }))}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            >
              {businesses.map(biz => (
                <option key={biz.id} value={biz.id}>
                  {biz.kor_name} {biz.eng_name && `(${biz.eng_name})`}
                </option>
              ))}
            </select>
          </div>

          {/* 배치 타입 */}
          <div>
            <label className="block text-xs font-medium text-muted mb-2">배치 위치</label>
            <select
              value={form.placement}
              onChange={e => setForm(f => ({ ...f, placement: e.target.value }))}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            >
              {PLACEMENT_OPTIONS.map(p => (
                <option key={p} value={p}>
                  {PLACEMENT_LABELS[p]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 우선순위 */}
            <div>
              <label className="block text-xs font-medium text-muted mb-2">우선순위</label>
              <input
                type="number"
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: parseInt(e.target.value) || 1 }))}
                min="1"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            {/* 활성 상태 */}
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm font-medium text-muted">활성</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 시작 날짜 */}
            <div>
              <label className="block text-xs font-medium text-muted mb-2">시작 날짜</label>
              <input
                type="date"
                value={form.start_date}
                onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            {/* 종료 날짜 */}
            <div>
              <label className="block text-xs font-medium text-muted mb-2">종료 날짜</label>
              <input
                type="date"
                value={form.end_date}
                onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-xs font-medium text-muted mb-2">메모</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="flex gap-2 justify-between pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="text-red-600 hover:text-red-700 text-sm font-medium disabled:text-red-400"
            >
              삭제
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-black text-white text-sm hover:bg-gray-800 disabled:bg-gray-400"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── 메인 페이지 ───
export default function AdminAdsPage() {
  const supabase = createClient()
  const { selectedRegion } = useAdminRegion()
  const [placements, setPlacements] = useState<any[]>([])
  const [businesses, setBusinesses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [selectedRegion, activeTab])

  async function fetchData() {
    setLoading(true)
    const regionCodes = getBusinessRegionCodes(selectedRegion)

    // 광고 배치 데이터 가져오기
    let query = supabase
      .from('ad_placements')
      .select('*')
      .in('region', regionCodes)
      .order('priority', { ascending: false })
      .order('start_date', { ascending: false })

    if (activeTab !== 'all') {
      query = query.eq('placement', activeTab)
    }

    const { data: placementsData } = await query

    // 업체 데이터 가져오기
    const { data: businessesData } = await supabase
      .from('businesses')
      .select('id, kor_name, eng_name, region')
      .in('region', regionCodes)
      .order('kor_name', { ascending: true })

    if (placementsData) setPlacements(placementsData)
    if (businessesData) setBusinesses(businessesData)
    setLoading(false)
  }

  async function quickToggle(id: string, currentActive: boolean) {
    const { error } = await supabase
      .from('ad_placements')
      .update({ active: !currentActive })
      .eq('id', id)

    if (error) {
      alert('상태 변경 실패: ' + error.message)
    } else {
      setPlacements(prev =>
        prev.map(p => (p.id === id ? { ...p, active: !currentActive } : p))
      )
    }
  }

  const tabs = [
    ['all', '전체'],
    ['homepage_banner', '홈페이지 배너'],
    ['category_top', '카테고리 상단'],
    ['sidebar', '사이드바'],
    ['magazine_sidebar', '매거진'],
  ]

  // 현재 탭의 데이터
  const tabPlacements = activeTab === 'all'
    ? placements
    : placements.filter(p => p.placement === activeTab)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">광고 관리</h1>
        <div className="flex gap-2">
          <span className="text-sm text-muted self-center">{tabPlacements.length}개</span>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="bg-black text-white px-3 py-1.5 rounded-full text-xs hover:bg-gray-800"
          >
            + 광고 추가
          </button>
        </div>
      </div>

      {showAdd && (
        <AddAdPlacementForm
          supabase={supabase}
          regionCodes={getBusinessRegionCodes(selectedRegion)}
          onAdd={() => {
            fetchData()
            setShowAdd(false)
          }}
        />
      )}

      {/* 탭 */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
              activeTab === key ? 'bg-black text-white' : 'bg-gray-100 text-secondary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 테이블 */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg-light border-b border-border">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-muted">업체명</th>
              <th className="text-left px-4 py-2 font-medium text-muted w-32">배치 위치</th>
              <th className="text-left px-4 py-2 font-medium text-muted w-16">지역</th>
              <th className="text-left px-4 py-2 font-medium text-muted w-16">우선순위</th>
              <th className="text-left px-4 py-2 font-medium text-muted w-40">기간</th>
              <th className="text-left px-4 py-2 font-medium text-muted w-20">상태</th>
              <th className="text-left px-4 py-2 font-medium text-muted w-24">관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted">
                  불러오는 중...
                </td>
              </tr>
            ) : tabPlacements.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted">
                  광고가 없습니다
                </td>
              </tr>
            ) : (
              tabPlacements.map(placement => {
                const business = businesses.find(b => b.id === placement.business_id)
                const expired = isExpired(placement.end_date)
                const active = isActive(placement.start_date, placement.end_date, placement.active)

                return (
                  <tr
                    key={placement.id}
                    className={`border-b border-border last:border-0 hover:bg-gray-50 ${
                      expired ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="px-4 py-2.5">
                      <div className="font-medium">{business?.kor_name || 'N/A'}</div>
                      {business?.eng_name && (
                        <div className="text-xs text-muted">{business.eng_name}</div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-xs">
                      {PLACEMENT_LABELS[placement.placement] || placement.placement}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted">{placement.region}</td>
                    <td className="px-4 py-2.5 text-xs font-medium">{placement.priority}</td>
                    <td className="px-4 py-2.5 text-xs">
                      {placement.start_date && placement.end_date ? (
                        <div>
                          {new Date(placement.start_date).toLocaleDateString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          ~{' '}
                          {new Date(placement.end_date).toLocaleDateString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      ) : (
                        <span className="text-muted">미정</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => quickToggle(placement.id, placement.active)}
                        className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
                          expired
                            ? 'bg-gray-200 text-gray-500 cursor-default'
                            : active
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {expired ? '만료' : active ? '활성' : '비활성'}
                      </button>
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() =>
                          setEditId(editId === placement.id ? null : placement.id)
                        }
                        className="text-xs text-blue-600 hover:underline font-medium"
                      >
                        편집
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 편집 모달 */}
      {editId && (
        <EditAdPlacementModal
          supabase={supabase}
          ad={placements.find(p => p.id === editId)}
          businesses={businesses}
          onClose={() => setEditId(null)}
          onSave={() => {
            fetchData()
            setEditId(null)
          }}
        />
      )}
    </div>
  )
}
