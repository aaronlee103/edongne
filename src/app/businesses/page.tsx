import { Suspense } from 'react';
import BusinessesContent from './BusinessesContent';

export const dynamic = 'force-dynamic';

export default function BusinessesPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">로딩 중...</div>}>
      <BusinessesContent />
    </Suspense>
  );
}
