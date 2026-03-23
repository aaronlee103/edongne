'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  house: '단독주택', condo: '콘도', townhouse: '타운하우스',
  apartment: '아파트', commercial: '상업용', land: '토지', other: '기타',
};

export default function ListingDetailPage() {
  const { id } = useParams();
  const supabase = createClient();
  const [listing, setListing] = useState<any>(null);
  const [mainPhoto, setMainPhoto] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListing();
  }, [id]);

  async function fetchListing() {
    const { data } = await supabase
      .from('listings')
      .select('*, users:user_id(nickname, avatar_url), businesses:business_id(id, name, plan, phone, image_url)')
      .eq('id', id)
      .single();

    if (data) {
      setListing(data);
      // 조회수 증가
      await supabase.from('listings').update({ views: (data.views || 0) + 1 }).eq('id', id);
    }
    setLoading(false);
  }

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">로딩 중...</div>;
  if (!listing) return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">매물을 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 뒤로가기 */}
      <Link href={`/listings?type=${listing.type}`} className="text-sm text-gray-500 hover:text-black mb-4 inline-block">
        ← 매물 목록으로
      </Link>

      {/* 사진 갤러리 */}
      <div className="mb-6">
        <div className="aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden mb-2">
          {listing.photos?.[mainPhoto] ? (
            <img src={listing.photos[mainPhoto]} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">🏠</div>
          )}
        </div>
        {listing.photos?.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {listing.photos.map((url: string, i: number) => (
              <button
                key={i}
                onClick={() => setMainPhoto(i)}
                className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${
                  mainPhoto === i ? 'border-black' : 'border-transparent'
                }`}
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 기본 정보 */}
      <div className="grid md:grid-cols-[1fr_280px] gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${
              listing.type === 'sale' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
            }`}>
              {listing.type === 'sale' ? '매매' : '렌트'}
            </span>
            <span className="text-xs text-gray-400">
              {PROPERTY_TYPE_LABELS[listing.property_type] || listing.property_type}
            </span>
          </div>

          <h1 className="text-2xl font-bold mb-1">{listing.title}</h1>
          <p className="text-3xl font-bold text-orange-500 mb-2">
            ${listing.price?.toLocaleString()}{listing.type === 'rent' ? '/월' : ''}
          </p>
          <p className="text-gray-500 mb-4">
            📍 {listing.address}, {listing.city}, {listing.state} {listing.zip}
          </p>

          <div className="flex gap-6 py-3 border-y mb-4">
            {listing.bedrooms != null && (
              <div className="text-center">
                <p className="text-lg font-bold">{listing.bedrooms === 0 ? '스튜디오' : listing.bedrooms}</p>
                <p className="text-xs text-gray-500">침실</p>
              </div>
            )}
            {listing.bathrooms && (
              <div className="text-center">
                <p className="text-lg font-bold">{listing.bathrooms}</p>
                <p className="text-xs text-gray-500">욕실</p>
              </div>
            )}
            {listing.sqft && (
              <div className="text-center">
                <p className="text-lg font-bold">{listing.sqft.toLocaleString()}</p>
                <p className="text-xs text-gray-500">sqft</p>
              </div>
            )}
          </div>

          {listing.description && (
            <div>
              <h2 className="font-bold mb-2">상세 설명</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{listing.description}</p>
            </div>
          )}

          <p className="text-xs text-gray-400 mt-6">
            조회 {listing.views || 0}회 · {new Date(listing.created_at).toLocaleDateString('ko-KR')} 등록
          </p>
        </div>

        {/* 에이전트 사이드바 */}
        <div>
          <div className="border rounded-lg p-4 sticky top-20">
            <h3 className="font-bold text-sm mb-3">담당 에이전트</h3>
            {listing.businesses ? (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  {listing.businesses.image_url ? (
                    <img src={listing.businesses.image_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-400">
                      {listing.businesses.name?.[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">{listing.businesses.name}</p>
                    {listing.businesses.phone && (
                      <p className="text-xs text-gray-500">{listing.businesses.phone}</p>
                    )}
                  </div>
                </div>
                <Link
                  href={`/business/${listing.businesses.id}`}
                  className="block text-center bg-black text-white text-sm py-2 rounded-lg hover:bg-gray-800 mb-2"
                >
                  프로필 보기
                </Link>
                <Link
                  href="/contact"
                  className="block text-center border text-sm py-2 rounded-lg hover:bg-gray-50"
                >
                  문의하기
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500 mb-3">
                  {listing.users?.nickname || '등록자'}
                </p>
                <Link
                  href="/contact"
                  className="block text-center bg-black text-white text-sm py-2 rounded-lg hover:bg-gray-800"
                >
                  문의하기
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
