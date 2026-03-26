/**
 * Capacitor 네이티브 브릿지
 *
 * 웹에서도 앱에서도 동작하는 유틸리티 함수들
 * 웹 환경에서는 graceful fallback, 앱에서는 네이티브 기능 활성화
 */

// Capacitor 환경인지 체크
export function isNativeApp(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor?.isNativePlatform?.();
}

export function getPlatform(): 'ios' | 'android' | 'web' {
  if (typeof window === 'undefined') return 'web';
  const cap = (window as any).Capacitor;
  if (!cap?.isNativePlatform?.()) return 'web';
  return cap.getPlatform?.() || 'web';
}

// ─── 푸시 알림 ───────────────────────────────────────────
export async function initPushNotifications() {
  if (!isNativeApp()) return;

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');

    // 권한 요청
    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== 'granted') return;

    // 등록
    await PushNotifications.register();

    // 토큰 수신 → Supabase에 저장
    PushNotifications.addListener('registration', async (token) => {
      console.log('[Push] Device token:', token.value);
      // TODO: Supabase에 디바이스 토큰 저장
      // await saveDeviceToken(token.value);
    });

    // 알림 수신 (앱이 포그라운드일 때)
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[Push] Received:', notification);
    });

    // 알림 탭 (앱이 백그라운드일 때)
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('[Push] Action:', action);
      const data = action.notification.data;
      // 딥링크 처리
      if (data?.url) {
        window.location.href = data.url;
      }
    });
  } catch (error) {
    console.warn('[Push] Not available:', error);
  }
}

// ─── 상태바 ───────────────────────────────────────────────
export async function setupStatusBar() {
  if (!isNativeApp()) return;

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
  } catch (error) {
    console.warn('[StatusBar] Not available:', error);
  }
}

// ─── 키보드 ───────────────────────────────────────────────
export async function setupKeyboard() {
  if (!isNativeApp()) return;

  try {
    const { Keyboard } = await import('@capacitor/keyboard');

    Keyboard.addListener('keyboardWillShow', (info) => {
      document.body.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
    });

    Keyboard.addListener('keyboardWillHide', () => {
      document.body.style.setProperty('--keyboard-height', '0px');
    });
  } catch (error) {
    console.warn('[Keyboard] Not available:', error);
  }
}

// ─── 앱 라이프사이클 ──────────────────────────────────────
export async function setupAppLifecycle() {
  if (!isNativeApp()) return;

  try {
    const { App } = await import('@capacitor/app');

    // 뒤로가기 버튼 (Android) / 앱 URL 스킴 처리
    App.addListener('appUrlOpen', (event) => {
      // 딥링크: edongne://post/123 → /post/123
      const url = new URL(event.url);
      const path = url.pathname;
      if (path) {
        window.location.href = path;
      }
    });

    // 앱이 다시 포그라운드로 올 때 페이지 새로고침 (선택사항)
    App.addListener('appStateChange', (state) => {
      if (state.isActive) {
        console.log('[App] Resumed to foreground');
      }
    });

    // 뒤로가기 (Android)
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });
  } catch (error) {
    console.warn('[App] Lifecycle not available:', error);
  }
}

// ─── 햅틱 피드백 ──────────────────────────────────────────
export async function hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light') {
  if (!isNativeApp()) return;

  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    const styleMap = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy,
    };
    await Haptics.impact({ style: styleMap[type] });
  } catch (error) {
    // 무시 - 햅틱 미지원 기기
  }
}

// ─── 외부 링크 처리 ───────────────────────────────────────
export async function openExternalLink(url: string) {
  if (!isNativeApp()) {
    window.open(url, '_blank');
    return;
  }

  try {
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url });
  } catch (error) {
    window.open(url, '_blank');
  }
}

// ─── 모든 네이티브 기능 초기화 ────────────────────────────
export async function initCapacitor() {
  if (!isNativeApp()) return;

  console.log('[Capacitor] Initializing native features...');

  await Promise.all([
    setupStatusBar(),
    setupKeyboard(),
    setupAppLifecycle(),
    initPushNotifications(),
  ]);

  console.log('[Capacitor] Native features initialized');
}
