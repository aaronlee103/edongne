'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const ITEMS_PER_PAGE = 12;

const CATEGORIES = [
  { value: '', label: '전체' },
  { value: 'realtor', label: '부동산' },
  { value: 'interior', label: '인테리어' },
  { value: 'food', label: '음식/카페' },
  { value: 'education', label: '교육/학원' },
  { value: 'beauty', label: '뷰티/건강' },
  { value: 'legal', label: '법률/회계' },
  { value: 'other', label: '기타' },
];

const PLAN_STYLES: Record<string, { border: string; bg: string; badge: string; badgeText: string; glow: string }> = {
  sponsor:      { border: 'border-yellow-400 border-2', bg: 'bg-yellow-50',  badge: 'bg-yellow-400 text-white', badgeText: '스폰서',    glow: 'shadow-yellow-200 shadow-md' },
  premium_plus: { border: 'border-blue-500 border-2',   bg: 'bg-blue-50',    badge: 'bg-blue-500 text-white',   badgeText: '프리미엄+', glow: 'shadow-blue-200 shadow-md' },
  premium:      { border: 'border-green-500 border-2',  bg: 'bg-green-50',   badge: 'bg-green-500 text-white',  badgeText: '프리미엄',  glow: 'shadow-green-200 shadow-sm' },
  basic:        { border: 'border-gray-200 border',      bg: 'bg-white',      badge: '',                          badgeText: '',          glow: '' },
};

function getPlanStyle(plan?: string) {
  return PLAN_STYLES[plan || 'basic'] || PLAN_STYLES.basic;
}

function planOrder(plan?: string) {
  switch (plan) {
    case 'sponsor': return 0;
    case 'premium_plus': return 1;
    case 'premium': return 2;
    default: return 3;
  }
}

export default function BusinessesPage() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBusinesses();
  }, [selectedCategory]);

  async function fetchBusinesses() {
    setLoading(true);
    let query = supabase
      .from('businesses')
      .select('*, reviews(rating)')
      .order('created_at', { ascending: false });

    if (selectedCategory) {
      query = query.eq('category', selectedCategory);
    }

    const { data } = await query;

    if (data) {
      const withRating = data.map((b: any) => {
        const ratings = b.reviews?.map((r: any) => r.rating).filter(Boolean) || [];
        const avgRating = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;
        return { ...b, avgRating, reviewCount: ratings.length };
      });
      withRating.sort((a: any, b: any) => planOrder(a.plan) - planOrder(b.plan));
      setBusinesses(withRating);
    }
    setLoading(false);
    setCurrentPage(1);
  }

  const filtered = searchQuery
    ? businesses.filter((b: any) =>
        b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : businesses;

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">비즈니스 디렉토리</h1>
      <p className="text-gray-500 mb-4">NY/NJ 한인 비즈니스를 찾아보세요</p>

      {/* 카테고리 필터 + 검색 */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="업체명 검색..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          className="ml-auto border rounded-lg px-3 py-1.5 text-sm w-48"
        />
      </div>

      {/* 색상 범례 */}
      <div className="flex flex-wrap gap-4 mb-6 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-4 rounded border-2 border-yellow-400 bg-yellow-50" /> 스폰서
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-4 rounded border-2 border-blue-500 bg-blue-50" /> 프리미엄+
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-4 rounded border-2 border-green-500 bg-green-50" /> 프리미엄
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-4 rounded border border-gray-200" /> 일반
        </span>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">로딩 중...</div>
      ) : paginated.length === 0 ? (
        <div className="text-center py-20 text-gray-400">등록된 업체가 없습니다.</div>
      ) : (
        <>
          {/* 3열 그리드 - 사이드바 광고 없이 풀폭 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((b: any) => {
              const style = getPlanStyle(b.plan);
              return (
                <Link key={b.id} href={`/business/${b.id}`}>
                  <div className={`rounded-lg p-4 hover:shadow-lg transition-all h-full ${style.border} ${style.bg} ${style.glow}`}>
                    {b.plan && b.plan !== 'basic' && style.badgeText && (
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full mb-2 font-medium ${style.badge}`}>
                        {style.badgeText}
                      </span>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                      {b.image_url ? (
                        <img src={b.image_url} alt={b.name} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 font-bold">
                          {b.name?.[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm truncate">{b.name}</h3>
                        {b.region && <p className="text-xs text-gray-500">{b.region}</p>}
                      </div>
                    </div>
                    {b.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{b.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      {b.avgRating > 0 ? (
                        <span className="text-yellow-500">
                          {'★'.repeat(Math.round(b.avgRating))}
                          <span className="text-gray-400 ml-1">({b.reviewCount})</span>
                        </span>
                      ) : (
                        <span className="text-gray-300">리뷰 없음</span>
                      )}
                      <span className="text-gray-400">
                        {CATEGORIES.find(c => c.value === b.category)?.label || b.category}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded border text-sm disabled:opacity-30 hover:bg-gray-50"
              >
                ← 이전
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  if (totalPages <= 7) return true;
                  if (page === 1 || page === totalPages) return true;
                  if (Math.abs(page - currentPage) <= 2) return true;
                  return false;
                })
                .map((page, idx, arr) => (
                  <span key={page} className="flex items-center gap-1">
                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                      <span className="text-gray-300 px-1">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded text-sm font-medium ${
                        currentPage === page ? 'bg-black text-white' : 'border hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  </span>
                ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded border text-sm disabled:opacity-30 hover:bg-gray-50"
              >
                다음 →
              </button>
            </div>
          )}
          <p className="text-center text-xs text-gray-400 mt-3">
            총 {filtered.length}개 업체
          </p>
        </>
      )}

      {/* 하단 비즈니스 등록 유도 */}
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
