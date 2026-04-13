'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRegion } from '@/context/RegionContext'
import Link from 'next/link'

const PER_PAGE = 30
const DEFAULT_REGION = 'ny'

function getBusinessRegionCodes(regionCode: string): string[] {
  if (regionCode === DEFAULT_REGION) return ['NY', 'NJ']
  return [regionCode.toUpperCase()]
}

export default function MoversPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedSubRegion, setSelectedSubRegion] = useState('전체')
  const [selectedArea, setSelectedArea] = useState('전체')
  const [searchQuery, setSearchQuery] = useState('')
  const { regionCode } = useRegion()

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true)
      const supabase = createClient()
      const codes = getBusinessRegionCodes(regionCode)
      const { data } = await supabase
        .from('businesses')
        .select('*, reviews(score)')
        .eq('type', 'mover')
        .in('region', codes)
        .or('status.is.null,status.eq.active')
        .or('published.is.null,published.eq.true')
        .order('sort_priority', { ascending: false })
        .order('created_at', { ascending: false })
      if (data) setItems(data)
      setLoading(false)
    }
    fetchItems()
  }, [regionCode])

  const subRegions = regionCode === DEFAULT_REGION ? ['전체', 'NY', 'NJ'] : []

  const areas = useMemo(() => {
    let data = items
    if (selectedSubRegion !== '전체') {
      data = data.filter(b => b.region === selectedSubRegion)
    }
    return [...new Set(data.map(b => b.area).filter(Boolean))].sort()
  }, [items, selectedSubRegion])

  useEffect(() => {
    setSelectedArea('전체')
  }, [selectedSubRegion])

  const filtered = items.filter(b => {
    if (selectedSubRegion !== '전체' && b.region !== selectedSubRegion) return false
    if (selectedArea !== '전체' && b.area !== selectedArea) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return b.kor_name?.toLowerCase().includes(q) ||
             b.eng_name?.toLowerCase().includes(q) ||
             b.area?.toLowerCase().includes(q) ||
             b.specialty?.toLowerCase().includes(q)
    }
    return true
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  const getAvgRating = (reviews: any[]) => {
    if (!reviews || reviews.length === 0) return null
    return (reviews.reduce((sum: number, r: any) => sum + r.score, 0) / reviews.length).toFixed(1)
  }

  if (loading) return <div className="text-center py-20 text-gray-400">로딩 중...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1">이사</h1>
      <p className="text-sm text-gray-500 mb-6">한인 이사업체 {filtered.length}개</p>

      {subRegions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {subRegions.map(region => (
            <button
              key={region}
              onClick={() => { setSelectedSubRegion(region); setCurrentPage(1) }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedSubRegion === region
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {region === '전체' ? '전체' : region === 'NY' ? '뉴욕' : '뉴저지'}
            </button>
          ))}
        </div>
      )}

      {areas.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => { setSelectedArea('전체'); setCurrentPage(1) }} className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${selectedArea === '전체' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>전체</button>
          {areas.map((area: string) => (
            <button key={area} onClick={() => { setSelectedArea(area); setCurrentPage(1) }} className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${selectedArea === area ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{area}</button>
          ))}
        </div>
      )}

      <div className="mb-6">
        <input type="text" placeholder="이름, 지역, 전문분야 검색..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }} className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {paged.length === 0 ? (
        <div className="text-center py-20 text-gray-400">등록된 이사업체가 없습니다.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paged.map((b: any) => {
            const avg = getAvgRating(b.reviews)
            return (
              <Link href={`/business/${b.id}`} key={b.id}>
                <div className="border rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer bg-white">
                  {b.hero_image && (
                    <div className="w-full h-48 overflow-hidden">
                      <img src={b.hero_image} alt={b.kor_name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    <h2 className="text-lg font-semibold">{b.kor_name}</h2>
                    {b.eng_name && <p className="text-sm text-gray-500">{b.eng_name}</p>}
                    <p className="text-sm text-gray-600 mt-1">{b.region}{b.area ? ` · ${b.area}` : ''}</p>
                    {b.specialty && <p className="text-sm text-blue-600 mt-1">{b.specialty}</p>}
                    <div className="flex items-center justify-between mt-2">
                      {avg && <span className="text-sm text-yellow-500 font-medium">★ {avg}</span>}
                      {b.phone1 && <span className="text-sm text-gray-500">{b.phone1}</span>}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50">이전</button>
          <span className="text-sm text-gray-600">{currentPage} / {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50">다음</button>
        </div>
      )}
    </div>
  )
}
