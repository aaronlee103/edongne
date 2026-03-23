'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const DESKTOP_PER_PAGE = 30;
const MOBILE_PER_PAGE = 15;

const CATEGORIES = [
  { value: '', label: '전체' },
  { value: 'realtor', label: '부동산' },
  { value: 'builder', label: '건축/인테리어' },
  { value: 'lawyer', label: '법률' },
  { value: 'mortgage', label: '융자' },
];

export default function BusinessesContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('type') || '');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { fetchBusinesses(); }, [selectedCategory]);

  async function fetchBusinesses() {
    setLoading(true);
    let query = supabase
      .from('businesses')
      .select('*, reviews(score)')
      .order('created_at', { ascending: false });
    if (selectedCategory) query = query.eq('type', selectedCategory);
    const { data } = await query;
    if (data) {
      const withRating = data.map((b: any) => {
        const scores = b.reviews?.map((r: any) => r.score).filter(Boolean) || [];
        const avg = scores.length > 0 ? scores.reduce((a: number, c: number) => a + c, 0) / scores.length : 0;
        return { ...b, avgRating: avg, reviewCount: scores.length };
      });
      setBusinesses(withRating);
    }
    setLoading(false);
    setCurrentPage(1);
  }

  const filtered = businesses.filter((b: any) => {
    if (selectedRegion && b.region !== selectedRegion) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return b.kor_name?.toLowerCase().includes(q) || b.eng_name?.toLowerCase().includes(q) || b.specialty?.toLowerCase().includes(q) || b.area?.toLowerCase().includes(q);
    }
    return true;
  });

  const itemsPerPage = isMobile ? MOBILE_PER_PAGE : DESKTOP_PER_PAGE;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">비즈니스 디렉토리</h1>
      <p className="text-gray-500 mb-4">NY/NJ 한인 비즈니스를 찾아보세요</p>

      <div className="flex flex-wrap gap-2 mb-3">
        {CATEGORIES.map(cat => (
          <button key={cat.value} onClick={() => { setSelectedCategory(cat.value); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat.value ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-2">
          {[{ value: '', label: '전체' }, { value: 'NY', label: '뉴욕' }, { value: 'NJ', label: '뉴저지' }].map(r => (
            <button key={r.value} onClick={() => { setSelectedRegion(r.value); setCurrentPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedRegion === r.value ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
              {r.label}
            </button>
          ))}
        </div>
        <input type="text" placeholder="업체명 검색..." value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          className="ml-auto border rounded-lg px-3 py-1.5 text-sm w-48" />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">로딩 중...</div>
      ) : paginated.length === 0 ? (
        <div className="text-center py-20 text-gray-400">등록된 업체가 없습니다.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((b: any) => (
              <Link key={b.id} href={`/business/${b.id}`}>
                <div className="rounded-lg border border-gray-200 hover:shadow-lg transition-all h-full overflow-hidden bg-white">
                  {b.hero_image && (
                    <div className="aspect-[16/9] bg-gray-100">
                      <img src={b.hero_image} alt={b.kor_name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-base">{b.kor_name}</h3>
                    {b.eng_name && <p className="text-xs text-gray-400">{b.eng_name}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      {b.region && <span className="text-xs text-gray-500">{b.region}</span>}
                      {b.area && <span className="text-xs text-gray-400">· {b.area}</span>}
                    </div>
                    {b.specialty && <p className="text-xs text-gray-500 mt-1">{b.specialty}</p>}
                    <div className="flex items-center justify-between mt-2 text-xs">
                      {b.avgRating > 0 ? (
                        <span className="text-yellow-500">
                          {'★'.repeat(Math.round(b.avgRating))}{'☆'.repeat(5 - Math.round(b.avgRating))}
                          <span className="text-gray-400 ml-1">({b.reviewCount})</span>
                        </span>
                      ) : (
                        <span className="text-gray-300">리뷰 없음</span>
                      )}
                      {b.phone1 && <span className="text-gray-400">{b.phone1}</span>}
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

      <div className="mt-10 text-center border-t pt-8">
        <h3 className="font-bold text-lg mb-2">내 비즈니스를 등록하세요</h3>
        <p className="text-sm text-gray-500 mb-4">이동네에 비즈니스를 등록하고 NY/NJ 한인 고객을 만나보세요.</p>
        <Link href="/business-register" className="inline-block bg-black text-white text-sm px-6 py-2.5 rounded-lg hover:bg-gray-800">무료 등록하기</Link>
      </div>
    </div>
  );
}
