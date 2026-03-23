'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

const ITEMS_PER_PAGE = 12;

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

export default function RealtorsPage() {
  const supabase = createClient();
  const [realtors, setRealtors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchRealtors();
  }, []);

  async function fetchRealtors() {
    setLoading(true);
    const { data } = await supabase
      .from('businesses')
      .select('*, reviews(rating)')
      .eq('category', 'realtor')
      .order('created_at', { ascending: false });

    if (data) {
      const withRating = data.map((b: any) => {
        const ratings = b.reviews?.map((r: any) => r.rating).filter(Boolean) || [];
        const avgRating = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;
        return { ...b, avgRating, reviewCount: ratings.length };
      });
      withRating.sort((a: any, b: any) => planOrder(a.plan) - planOrder(b.plan));
      setRealtors(withRating);
    }
    setLoading(false);
  }

  const totalPages = Math.ceil(realtors.length / ITEMS_PER_PAGE);
  const paginatedRealtors = realtors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">부동산 리얼터</h1>
      <p className="text-gray-500 mb-4">NY/NJ 지역 한인 부동산 전문가를 찾아보세요</p>

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
      ) : paginatedRealtors.length === 0 ? (
        <div className="text-center py-20 text-gray-400">등록된 리얼터가 없습니다.</div>
      ) : (
        <>
          {/* 3열 그리드 - 광고 없이 풀폭 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedRealtors.map((r: any) => {
              const style = getPlanStyle(r.plan);
              return (
                <Link key={r.id} href={`/business/${r.id}`}>
                  <div className={`rounded-lg p-4 hover:shadow-lg transition-all h-full ${style.border} ${style.bg} ${style.glow}`}>
                    {r.plan && r.plan !== 'basic' && style.badgeText && (
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full mb-2 font-medium ${style.badge}`}>
                        {style.badgeText}
                      </span>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                      {r.image_url ? (
                        <img src={r.image_url} alt={r.name} className="w-14 h-14 rounded-full object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xl">
                          {r.name?.[0]}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-base">{r.name}</h3>
                        {r.region && <p className="text-xs text-gray-500">{r.region}</p>}
                      </div>
                    </div>
                    {r.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{r.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      {r.avgRating > 0 ? (
                        <span className="text-yellow-500">
                          {'★'.repeat(Math.round(r.avgRating))}{'☆'.repeat(5 - Math.round(r.avgRating))}
                          <span className="text-gray-500 ml-1">({r.reviewCount})</span>
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">리뷰 없음</span>
                      )}
                      {r.phone && <span className="text-gray-400 text-xs ml-auto">{r.phone}</span>}
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
            총 {realtors.length}개 업체
          </p>
        </>
      )}
    </div>
  );
}
