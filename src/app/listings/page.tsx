import { Suspense } from 'react';
import ListingsContent from './ListingsContent';

export const dynamic = 'force-dynamic';

export default function ListingsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">로딩 중...</div>}>
      <ListingsContent />
    </Suspense>
  );
}
