'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';

const DESKTOP_PER_PAGE = 30;
const MOBILE_PER_PAGE = 15;

export default function RealtorsPage() {
  const supabase = createClient();
  const [realtors, setRealtors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { fetchRealtors(); }, []);

  async function fetchRealtors() {
    setLoading(true);
    const { data } = await supabase
      .from('businesses')
      .select('*, reviews(score)')
      .eq('type', 'realtor')
      .order('created_at', { ascending: false });
    if (data) {
      const withRating = data.map((b: any) => {
        const scores = b.reviews?.map((r: any) => r.score).filter(Boolean) || [];
        const avg = scores.length > 0 ? scores.reduce((a: number, c: number) => a + c, 0) / scores.length : 0;
        return { ...b, avgRating: avg, reviewCount: scores.length };
      });
      setRealtors(withRating);
    }
    setLoading(false);
    setCurrentPage(1);
  }

  const filtered = realtors.filter((r: any) => {
    if (selectedRegion && r.region !== selectedRegion) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return r.kor_name?.toLowerCase().includes(q) || r.eng_name?.toLowerCase().includes(q) || r.specialty?.toLowerCase().includes(q) || r.area?.toLowerCase().includes(q);
    }
    return true;
  });

  const itemsPerPage = isMobile ? MOBILE_PER_PAGE : DESKTOP_PER_PAGE;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">부동산 리얼터</h1>
      <p className="text-gray-500 mb-4">NY/NJ 지역 한인 부동산 전문가를 찾아보세요</p>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-2">
          {[{ value: '', label: '전체' }, { value: 'NY', label: '뉴욕' }, { value: 'NJ', label: '뉴저지' }].map(r => (
            <button key={r.value} onClick={() => { setSelectedRegion(r.value); setCurrentPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedRegion === r.value ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {r.label}
            </button>
          ))}
        </div>
        <input type="text" placeholder="업체명, 지역 검색..." value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          className="ml-auto border rounded-lg px-3 py-1.5 text-sm w-48" />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">로딩 중...</div>
      ) : paginated.length === 0 ? (
        <div className="text-center py-20 text-gray-400">등록된 리얼터가 없습니다.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((r: any) => (
              <Link key={r.id} href={`/business/${r.id}`}>
                <div className="rounded-lg border border-gray-200 hover:shadow-lg transition-all h-full overflow-hidden bg-white">
                  {r.hero_image && (
                    <div className="aspect-[16/9] bg-gray-100">
                      <img src={r.hero_image} alt={r.kor_name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-base">{r.kor_name}</h3>
                    {r.eng_name && <p className="text-xs text-gray-400">{r.eng_name}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      {r.region && <span className="text-xs text-gray-500">{r.region}</span>}
                      {r.area && <span className="text-xs text-gray-400">· {r.area}</span>}
                    </div>
                    {r.specialty && <p className="text-xs text-gray-500 mt-1">{r.specialty}</p>}
                    <div className="flex items-center justify-between mt-2 text-xs">
                      {r.avgRating > 0 ? (
                        <span className="text-yellow-500">
                          {'★'.repeat(Math.round(r.avgRating))}{'☆'.repeat(5 - Math.round(r.avgRating))}
                          <span className="text-gray-400 ml-1">({r.reviewCount})</span>
                        </span>
                      ) : (
                        <span className="text-gray-300">리뷰 없음</span>
                      )}
                      {r.phone1 && <span className="text-gray-400">{r.phone1}</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="px-3 py-2 rounded border text-sm disabled:opacity-30 hover:bg-gray-50">← 이전</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => totalPages <= 7 || page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2)
                .map((page, idx, arr) => (
                  <span key={page} className="flex items-center gap-1">
                    {idx > 0 && arr[idx - 1] !== page - 1 && <span className="text-gray-300 px-1">...</span>}
                    <button onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded text-sm font-medium ${currentPage === page ? 'bg-black text-white' : 'border hover:bg-gray-50'}`}>{page}</button>
                  </span>
                ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="px-3 py-2 rounded border text-sm disabled:opacity-30 hover:bg-gray-50">다음 →</button>
            </div>
          )}
          <p className="text-center text-xs text-gray-400 mt-3">총 {filtered.length}개 업체</p>
        </>
      )}
    </div>
  );
}
