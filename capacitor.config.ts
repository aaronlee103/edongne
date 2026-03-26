import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.edongne.app',
  appName: '이동네',
  // 라이브 서버를 사용하여 항상 최신 웹 콘텐츠 제공
  // 앱 업데이트 없이도 콘텐츠가 실시간 반영됨
  server: {
    url: 'https://www.edongne.com',
    cleartext: false,
    // iOS에서 네이티브 브릿지 활성화
    iosScheme: 'capacitor',
  },
  ios: {
    // 상태바 스타일
    preferredContentMode: 'mobile',
    // 스크롤 바운스 효과
    scrollEnabled: true,
    // 배경색 (로딩 중 표시)
    backgroundColor: '#FFFFFF',
    // Safe Area 자동 처리
    contentInset: 'automatic',
    // 링크 프리뷰 비활성화 (앱 내에서 처리)
    allowsLinkPreview: false,
  },
  plugins: {
    SplashScreen: {
      // 스플래시 스크린 설정
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#FFFFFF',
      showSpinner: false,
      // 스플래시 이미지 (iOS Assets에서 관리)
      launchFadeOutDuration: 300,
    },
    StatusBar: {
      // 상태바 스타일 (다크 텍스트)
      style: 'DARK',
      backgroundColor: '#FFFFFF',
    },
    Keyboard: {
      // 키보드가 올라올 때 화면 리사이즈
      resize: 'body',
      // 키보드 위에 액세서리 바 표시
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      // 푸시 알림 - 앱 시작 시 자동 등록
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
