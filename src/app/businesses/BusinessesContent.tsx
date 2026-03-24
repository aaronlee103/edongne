'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';

const DESKTOP_PER_PAGE = 30;
const MOBILE_PER_PAGE = 15;

const CATEGORIES = [
  { label: '전체', value: 'all' },
  { label: '부동산', value: 'realtor' },
  { label: '건축/인테리어', value: 'builder' },
  { label: '법률', value: 'lawyer' },
  { label: '융자', value: 'mortgage' },
];

export default function BusinessesContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';

  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [selectedArea, setSelectedArea] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      const supabase = createClient();
      let query = supabase.from('businesses').select('*, reviews(score)');
      if (selectedCategory !== 'all') {
        query = query.eq('type', selectedCategory);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (!error && data) setBusinesses(data);
      setLoading(false);
    };
    fetchBusinesses();
  }, [selectedCategory]);

  const areas = useMemo(() => {
    if (selectedRegion === '전체') return [];
    const regionCode = selectedRegion === '뉴욕' ? 'NY' : 'NJ';
    const regionData = businesses.filter((b: any) => b.region === regionCode);
    return [...new Set(regionData.map((b: any) => b.area).filter(Boolean))].sort();
  }, [selectedRegion, businesses]);

  useEffect(() => {
    setSelectedArea('전체');
  }, [selectedRegion]);

  const filtered = businesses.filter((b: any) => {
    if (selectedRegion !== '전체') {
      const regionCode = selectedRegion === '뉴욕' ? 'NY' : 'NJ';
      if (b.region !== regionCode) return false;
    }
    if (selectedArea !== '전체' && b.area !== selectedArea) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        b.kor_name?.toLowerCase().includes(q) ||
        b.eng_name?.toLowerCase().includes(q) ||
        b.area?.toLowerCase().includes(q) ||
        b.specialty?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const perPage = isMobile ? MOBILE_PER_PAGE : DESKTOP_PER_PAGE;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const getAvgRating = (reviews: any[]) => {
    if (!reviews || reviews.length === 0) return null;
    const avg = reviews.reduce((sum: number, r: any) => sum + r.score, 0) / reviews.length;
    return avg.toFixed(1);
  };

  if (loading) return <div className="text-center py-20 text-gray-400">로딩 중...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">업체 디렉토리</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => { setSelectedCategory(cat.value); setCurrentPage(1); setSelectedRegion('전체'); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedCategory === cat.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {['전체', '뉴욕', '뉴저지'].map(region => (
          <button
            key={region}
            onClick={() => { setSelectedRegion(region); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedRegion === region
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {region}
          </button>
        ))}
      </div>

      {selectedRegion !== '전체' && areas.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => { setSelectedArea('전체'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              selectedArea === '전체'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            전체
          </button>
          {areas.map((area: string) => (
            <button
              key={area}
              onClick={() => { setSelectedArea(area); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                selectedArea === area
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      )}

      <div className="mb-6">
        <input
          type="text"
          placeholder="이름, 지역, 전문분야 검색..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <p className="text-sm text-gray-500 mb-4">총 {filtered.length}개 업체</p>

      {paged.length === 0 ? (
        <div className="text-center py-20 text-gray-400">검색 결과가 없습니다.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paged.map((biz: any) => {
            const avg = getAvgRating(biz.reviews);
            return (
              <Link href={`/business/${biz.id}`} key={biz.id}>
                <div className="border rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer bg-white">
                  {biz.hero_image && (
                    <div className="w-full h-48 overflow-hidden">
                      <img
                        src={biz.hero_image}
                        alt={biz.kor_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h2 className="text-lg font-semibold">{biz.kor_name}</h2>
                    {biz.eng_name && (
                      <p className="text-sm text-gray-500">{biz.eng_name}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      {biz.region}{biz.area ? ` · ${biz.area}` : ''}
                    </p>
                    {biz.specialty && (
                      <p className="text-sm text-blue-600 mt-1">{biz.specialty}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      {avg && (
                        <span className="text-sm text-yellow-500 font-medium">★ {avg}</span>
                      )}
                      {biz.phone1 && (
                        <span className="text-sm text-gray-500">{biz.phone1}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          >
            이전
          </button>
          <span className="text-sm text-gray-600">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          >
            다음
          </button>
        </div>
      )}

      <div className="mt-10 text-center border-t pt-8">
        <h3 className="font-bold text-lg mb-2">내 비즈니스를 등록하세요</h3>
        <p className="text-sm text-gray-500 mb-4">이동네에 비즈니스를 등록하고 NY/NJ 한인 고객을 만나보세요.</p>
        <Link href="/business-register" className="inline-block bg-black text-white text-sm px-6 py-2.5 rounded-lg hover:bg-gray-800">
          무료 등록하기
        </Link>
      </div>
    </div>
  );
}
