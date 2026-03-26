'use client';

import { useEffect } from 'react';
import { isNativeApp, initCapacitor } from '@/lib/capacitor';

/**
 * Capacitor 네이티브 기능 초기화 Provider
 *
 * layout.tsx에 추가하면 앱 시작 시 자동으로 네이티브 기능을 초기화합니다.
 * 웹 환경에서는 아무것도 하지 않으므로 안전하게 사용 가능합니다.
 */
export default function CapacitorProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (isNativeApp()) {
      initCapacitor();

      // iOS Safe Area 대응을 위한 CSS 변수 설정
      document.documentElement.style.setProperty(
        '--safe-area-top',
        'env(safe-area-inset-top)'
      );
      document.documentElement.style.setProperty(
        '--safe-area-bottom',
        'env(safe-area-inset-bottom)'
      );

      // 네이티브 앱일 때 body에 클래스 추가 (CSS 분기용)
      document.body.classList.add('native-app');
    }
  }, []);

  return <>{children}</>;
}
