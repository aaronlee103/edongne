'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const ITEMS_PER_PAGE = 12;

const CITIES = ['전체', 'Palisades Park', 'Fort Lee', 'Edgewater', 'Cliffside Park', 'Leonia', 'Ridgefield', 'Englewood', 'Tenafly', 'Hackensack', 'Teaneck', 'Paramus'];
const PROPERTY_TYPE_LABELS: Record<string, string> = {
  house: '단독주택', condo: '콘도', townhouse: '타운하우스',
  apartment: '아파트', commercial: '상업용', land: '토지', other: '기타',
};

export default function ListingsPage() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [type, setType] = useState<'sale' | 'rent'>(
    (searchParams.get('type') as 'sale' | 'rent') || 'rent'
  );
  const [selectedCity, setSelectedCity] = useState('전체');

  useEffect(() => {
    fetchListings();
  }, [type]);

  async function fetchListings() {
    setLoading(true);
    const { data } = await supabase
      .from('listings')
      .select('*, users:user_id(nickname, avatar_url), businesses:business_id(name, plan)')
      .eq('type', type)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    setListings(data || []);
    setLoading(false);
    setCurrentPage(1);
  }

  const filtered = selectedCity === '전체'
    ? listings
    : listings.filter(l => l.city === selectedCity);

  // 프리미엄 우선 정렬
  const sorted = [...filtered].sort((a, b) => {
    const planOrder = (p: string) => {
      switch (p) { case 'sponsor': return 0; case 'premium_plus': return 1; case 'premium': return 2; default: return 3; }
    };
    return planOrder(a.businesses?.plan) - planOrder(b.businesses?.plan);
  });

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  function formatPrice(price: number, listingType: string) {
    if (listingType === 'rent') return `$${price.toLocaleString()}/월`;
    return `$${price.toLocaleString()}`;
  }

  const PLAN_BORDER: Record<string, string> = {
    sponsor: 'border-yellow-400 border-2 shadow-yellow-100 shadow-md',
    premium_plus: 'border-blue-500 border-2 shadow-blue-100 shadow-md',
    premium: 'border-green-500 border-2 shadow-green-100 shadow-sm',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">부동산 매물</h1>
          <p className="text-gray-500 text-sm mt-1">NY/NJ 한인 부동산 매물 정보</p>
        </div>
        <Link
          href="/listings/new"
          className="bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          + 매물 등록
        </Link>
      </div>

      {/* 매매/렌트 탭 */}
      <div className="flex gap-2 mb-4">
        {(['rent', 'sale'] as const).map(t => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              type === t ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t === 'sale' ? '매매' : '렌트'}
          </button>
        ))}
      </div>

      {/* 지역 필터 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CITIES.map(city => (
          <button
            key={city}
            onClick={() => { setSelectedCity(city); setCurrentPage(1); }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedCity === city ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">로딩 중...</div>
      ) : paginated.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 mb-4">등록된 매물이 없습니다.</p>
          <Link href="/listings/new" className="text-sm text-blue-500 hover:underline">
            첫 매물을 등록해보세요 →
          </Link>
        </div>
      ) : (
        <>
          {/* 카드 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((listing: any) => {
              const borderClass = PLAN_BORDER[listing.businesses?.plan] || 'border border-gray-200';
              return (
                <Link key={listing.id} href={`/listings/${listing.id}`}>
                  <div className={`rounded-lg overflow-hidden hover:shadow-lg transition-all ${borderClass}`}>
                    {/* 사진 */}
                    <div className="relative aspect-[4/3] bg-gray-100">
                      {listing.photos?.[0] ? (
                        <img
                          src={listing.photos[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">🏠</div>
                      )}
                      {/* 상태 뱃지 */}
                      <span className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded font-medium ${
                        listing.type === 'sale' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
                      }`}>
                        {listing.type === 'sale' ? '매매' : '렌트'}
                      </span>
                      {/* 사진 수 */}
                      {listing.photos?.length > 1 && (
                        <span className="absolute bottom-2 right-2 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">
                          📷 {listing.photos.length}
                        </span>
                      )}
                    </div>

                    {/* 정보 */}
                    <div className="p-3">
                      <p className="text-lg font-bold text-orange-500">
                        {formatPrice(listing.price, listing.type)}
                      </p>
                      <h3 className="font-medium text-sm mt-1 line-clamp-1">{listing.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        📍 {listing.address}, {listing.city}, {listing.state} {listing.zip}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        {listing.bedrooms != null && (
                          <span>🛏 {listing.bedrooms === 0 ? '스튜디오' : `${listing.bedrooms}BR`}</span>
                        )}
                        {listing.bathrooms && <span>🚿 {listing.bathrooms}BA</span>}
                        {listing.sqft && <span>📐 {listing.sqft}sqft</span>}
                        {listing.property_type && (
                          <span className="ml-auto text-gray-400">
                            {PROPERTY_TYPE_LABELS[listing.property_type] || listing.property_type}
                          </span>
                        )}
                      </div>
                      {/* 에이전트 정보 */}
                      {listing.businesses?.name && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t text-xs text-gray-500">
                          <span>{listing.businesses.name}</span>
                        </div>
                      )}
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
                .filter(page => totalPages <= 7 || page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2)
                .map((page, idx, arr) => (
                  <span key={page} className="flex items-center gap-1">
                    {idx > 0 && arr[idx - 1] !== page - 1 && <span className="text-gray-300 px-1">...</span>}
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
          <p className="text-center text-xs text-gray-400 mt-3">총 {sorted.length}개 매물</p>
        </>
      )}
    </div>
  );
}
