'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import AdBanner from '@/components/AdBanner';

const ITEMS_PER_PAGE = 12;

const PLAN_STYLES: Record<string, { border: string; bg: string; badge: string; badgeText: string }> = {
  sponsor:      { border: 'border-yellow-400 border-2', bg: 'bg-yellow-50',  badge: 'bg-yellow-400 text-white', badgeText: '스폰서' },
  premium_plus: { border: 'border-blue-500 border-2',   bg: 'bg-blue-50',    badge: 'bg-blue-500 text-white',   badgeText: '프리미엄+' },
  premium:      { border: 'border-green-500 border-2',  bg: 'bg-green-50',   badge: 'bg-green-500 text-white',  badgeText: '프리미엄' },
  basic:        { border: 'border-gray-200 border',      bg: 'bg-white',      badge: 'bg-gray-200 text-gray-600', badgeText: '일반' },
};

function getPlanStyle(plan?: string) {
  return PLAN_STYLES[plan || 'basic'] || PLAN_STYLES.basic;
}

// 플랜 정렬 우선순위
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
    const { data, error } = await supabase
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
      // 프리미엄 우선 정렬
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">부동산 리얼터</h1>
      <p className="text-gray-500 mb-6">NY/NJ 지역 한인 부동산 전문가를 찾아보세요</p>

      <div className="grid md:grid-cols-[1fr_240px] gap-6">
        {/* 리스트 */}
        <div>
          {loading ? (
            <div className="text-center py-20 text-gray-400">로딩 중...</div>
          ) : paginatedRealtors.length === 0 ? (
            <div className="text-center py-20 text-gray-400">등록된 리얼터가 없습니다.</div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedRealtors.map((r: any) => {
                  const style = getPlanStyle(r.plan);
                  return (
                    <Link key={r.id} href={`/business/${r.id}`}>
                      <div className={`rounded-lg p-4 hover:shadow-lg transition-shadow ${style.border} ${style.bg}`}>
                        {/* 플랜 뱃지 */}
                        {r.plan && r.plan !== 'basic' && (
                          <span className={`inline-block text-xs px-2 py-0.5 rounded-full mb-2 font-medium ${style.badge}`}>
                            {style.badgeText}
                          </span>
                        )}
                        {/* 프로필 이미지 */}
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
                        {/* 설명 */}
                        {r.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{r.description}</p>
                        )}
                        {/* 평점 */}
                        <div className="flex items-center gap-2 text-sm">
                          {r.avgRating > 0 && (
                            <span className="text-yellow-500">
                              {'★'.repeat(Math.round(r.avgRating))}{'☆'.repeat(5 - Math.round(r.avgRating))}
                              <span className="text-gray-500 ml-1">({r.reviewCount})</span>
                            </span>
                          )}
                          {r.phone && <span className="text-gray-400 text-xs">{r.phone}</span>}
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded text-sm font-medium ${
                        currentPage === page
                          ? 'bg-black text-white'
                          : 'border hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
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
            </>
          )}
        </div>

        {/* 사이드바 광고 */}
        <aside className="hidden md:block">
          <div className="sticky top-20">
            <AdBanner variant="sidebar" />
          </div>
        </aside>
      </div>
    </div>
  );
}
