'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { getListingLimits, canCreateListing } from '@/lib/listingLimits';
import Link from 'next/link';

const PROPERTY_TYPES = [
  { value: 'house', label: '단독주택' },
  { value: 'condo', label: '콘도' },
  { value: 'townhouse', label: '타운하우스' },
  { value: 'apartment', label: '아파트' },
  { value: 'commercial', label: '상업용' },
  { value: 'land', label: '토지' },
  { value: 'other', label: '기타' },
];

const NJ_CITIES = [
  'Palisades Park', 'Fort Lee', 'Leonia', 'Edgewater', 'Cliffside Park',
  'Ridgefield', 'Fairview', 'Englewood', 'Tenafly', 'Cresskill',
  'Bergenfield', 'Hackensack', 'Teaneck', 'Paramus', 'Ridgewood',
  'Flushing', 'Bayside', 'Manhattan', 'Other',
];

const ACCEPTED_FORMATS = 'image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif,image/avif,image/bmp,image/tiff';

export default function NewListingPage() {
  const supabase = createClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [currentCount, setCurrentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    type: 'rent' as 'sale' | 'rent',
    title: '',
    price: '',
    address: '',
    city: 'Palisades Park',
    state: 'NJ',
    zip: '',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    property_type: 'apartment',
    description: '',
  });

  useEffect(() => {
    checkAccess();
  }, []);

  async function checkAccess() {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      router.push('/login');
      return;
    }
    setUser(authUser);

    // 비즈니스 프로필 확인
    const { data: biz } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', authUser.id)
      .single();

    setBusiness(biz);

    // 현재 매물 수 확인
    const { count } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', authUser.id)
      .in('status', ['active', 'pending']);

    setCurrentCount(count || 0);
    setLoading(false);
  }

  const plan = business?.plan || 'basic';
  const limits = getListingLimits(plan);
  const allowed = canCreateListing(plan);
  const remaining = limits.maxListings - currentCount;

  function handlePhotoAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setError('');

    for (const file of files) {
      if (file.size > limits.maxPhotoSizeMB * 1024 * 1024) {
        setError(`"${file.name}" 파일이 ${limits.maxPhotoSizeMB}MB를 초과합니다.`);
        return;
      }
    }

    const total = photos.length + files.length;
    if (total > limits.maxPhotos) {
      setError(`사진은 최대 ${limits.maxPhotos}장까지 가능합니다. (현재 ${photos.length}장)`);
      return;
    }

    const newPhotos = [...photos, ...files];
    setPhotos(newPhotos);

    // 미리보기 생성
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviews(prev => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removePhoto(index: number) {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || submitting) return;

    if (!form.title || !form.price || !form.address) {
      setError('제목, 가격, 주소는 필수입니다.');
      return;
    }

    if (photos.length === 0) {
      setError('사진을 최소 1장 이상 등록해주세요.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // 사진 업로드
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const ext = photo.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `listings/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from('photos')
          .upload(fileName, photo, { contentType: photo.type });

        if (uploadErr) throw uploadErr;

        const { data } = supabase.storage.from('photos').getPublicUrl(fileName);
        photoUrls.push(data.publicUrl);
      }

      // 매물 등록
      const { error: insertErr } = await supabase.from('listings').insert({
        user_id: user.id,
        business_id: business?.id || null,
        type: form.type,
        title: form.title,
        price: parseFloat(form.price),
        address: form.address,
        city: form.city,
        state: form.state,
        zip: form.zip,
        bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
        bathrooms: form.bathrooms ? parseFloat(form.bathrooms) : null,
        sqft: form.sqft ? parseInt(form.sqft) : null,
        property_type: form.property_type,
        description: form.description,
        photos: photoUrls,
        status: 'active',
      });

      if (insertErr) throw insertErr;

      router.push('/listings?type=' + form.type);
    } catch (err: any) {
      setError(err.message || '등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-400">로딩 중...</div>;

  // 프리미엄 미만 → 업그레이드 안내
  if (!allowed) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🏠</div>
        <h1 className="text-xl font-bold mb-3">매물 등록은 프리미엄 회원 전용입니다</h1>
        <p className="text-gray-500 mb-6">
          프리미엄 플랜($29/월)부터 매물을 직접 등록하고<br />
          이동네 커뮤니티에 노출할 수 있습니다.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/pricing" className="bg-black text-white px-6 py-2.5 rounded-lg text-sm hover:bg-gray-800">
            요금제 보기
          </Link>
          <Link href="/community" className="border px-6 py-2.5 rounded-lg text-sm hover:bg-gray-50">
            돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // 매물 한도 초과
  if (remaining <= 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">📋</div>
        <h1 className="text-xl font-bold mb-3">매물 등록 한도에 도달했습니다</h1>
        <p className="text-gray-500 mb-6">
          현재 플랜({plan})에서는 최대 {limits.maxListings}개까지 등록 가능합니다.<br />
          플랜을 업그레이드하면 더 많은 매물을 등록할 수 있습니다.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/pricing" className="bg-black text-white px-6 py-2.5 rounded-lg text-sm hover:bg-gray-800">
            플랜 업그레이드
          </Link>
          <Link href="/listings" className="border px-6 py-2.5 rounded-lg text-sm hover:bg-gray-50">
            내 매물 관리
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">매물 등록</h1>
      <p className="text-sm text-gray-500 mb-6">
        등록 가능: {remaining}개 남음 (최대 {limits.maxListings}개) · 사진 매물당 {limits.maxPhotos}장
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 매매/렌트 선택 */}
        <div className="flex gap-2">
          {(['sale', 'rent'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setForm({ ...form, type: t })}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                form.type === t ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t === 'sale' ? '매매' : '렌트'}
            </button>
          ))}
        </div>

        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium mb-1">제목 *</label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="예: 팰팍 2BR 리노베이션 완료 콘도"
            className="w-full border rounded-lg px-3 py-2.5 text-sm"
            required
          />
        </div>

        {/* 가격 + 매물유형 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              {form.type === 'sale' ? '매매가' : '월 렌트'} ($) *
            </label>
            <input
              type="number"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              placeholder={form.type === 'sale' ? '500000' : '2500'}
              className="w-full border rounded-lg px-3 py-2.5 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">매물 유형</label>
            <select
              value={form.property_type}
              onChange={e => setForm({ ...form, property_type: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm bg-white"
            >
              {PROPERTY_TYPES.map(pt => (
                <option key={pt.value} value={pt.value}>{pt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 주소 */}
        <div>
          <label className="block text-sm font-medium mb-1">주소 *</label>
          <input
            type="text"
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            placeholder="123 Broad Ave, Unit 2F"
            className="w-full border rounded-lg px-3 py-2.5 text-sm"
            required
          />
        </div>

        {/* 도시 / 주 / 우편번호 */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">도시</label>
            <select
              value={form.city}
              onChange={e => setForm({ ...form, city: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm bg-white"
            >
              {NJ_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">주</label>
            <select
              value={form.state}
              onChange={e => setForm({ ...form, state: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm bg-white"
            >
              <option value="NJ">NJ</option>
              <option value="NY">NY</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">우편번호</label>
            <input
              type="text"
              value={form.zip}
              onChange={e => setForm({ ...form, zip: e.target.value })}
              placeholder="07650"
              className="w-full border rounded-lg px-3 py-2.5 text-sm"
            />
          </div>
        </div>

        {/* Bed / Bath / Sqft */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">침실</label>
            <select
              value={form.bedrooms}
              onChange={e => setForm({ ...form, bedrooms: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm bg-white"
            >
              <option value="">선택</option>
              {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n === 0 ? '스튜디오' : `${n}BR`}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">욕실</label>
            <select
              value={form.bathrooms}
              onChange={e => setForm({ ...form, bathrooms: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm bg-white"
            >
              <option value="">선택</option>
              {[1, 1.5, 2, 2.5, 3, 3.5, 4].map(n => <option key={n} value={n}>{n}BA</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">면적 (sqft)</label>
            <input
              type="number"
              value={form.sqft}
              onChange={e => setForm({ ...form, sqft: e.target.value })}
              placeholder="1200"
              className="w-full border rounded-lg px-3 py-2.5 text-sm"
            />
          </div>
        </div>

        {/* 설명 */}
        <div>
          <label className="block text-sm font-medium mb-1">상세 설명</label>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="매물에 대한 상세 설명을 입력하세요..."
            rows={4}
            className="w-full border rounded-lg px-3 py-2.5 text-sm resize-none"
          />
        </div>

        {/* 사진 업로드 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            사진 ({photos.length}/{limits.maxPhotos}) · 장당 최대 {limits.maxPhotoSizeMB}MB
          </label>

          {/* 미리보기 그리드 */}
          {previews.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-3">
              {previews.map((src, i) => (
                <div key={i} className="relative group aspect-square">
                  <img src={src} alt="" className="w-full h-full object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                      대표
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {photos.length < limits.maxPhotos && (
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
              <span className="text-2xl text-gray-400 mb-1">+</span>
              <span className="text-xs text-gray-500">클릭하여 사진 추가</span>
              <span className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, GIF, WebP, HEIC, AVIF, BMP, TIFF</span>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_FORMATS}
                multiple
                onChange={handlePhotoAdd}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* 에러 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* 제출 */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? '등록 중...' : '매물 등록하기'}
        </button>
      </form>
    </div>
  );
}
