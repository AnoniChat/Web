/**
 * @returns {boolean} 모바일이면 true, 데스크톱이면 false
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  // 1. User Agent 체크
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'android',
    'iphone',
    'ipad',
    'ipod',
    'blackberry',
    'windows phone',
    'webos',
  ];
  const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
 

  // 3. 화면 크기 체크
  const isSmallScreen = window.innerWidth <= 768;

  // User Agent가 모바일이거나, 화면이 작은 경우
  return isMobileUA || isSmallScreen;
};

/**
 * iOS 디바이스인지 감지합니다.
 */
export const isIOS = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const userAgent = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

/**
 * Android 디바이스인지 감지합니다.
 */
export const isAndroid = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const userAgent = navigator.userAgent.toLowerCase();
  return /android/.test(userAgent);
};

/**
 * 디바이스 타입을 반환합니다.
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export const getDeviceType = (): DeviceType => {
  if (typeof window === 'undefined') {
    return 'desktop';
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const width = window.innerWidth;

  // 태블릿 체크
  if (
    (/ipad/.test(userAgent) || (/android/.test(userAgent) && !/mobile/.test(userAgent))) ||
    (width >= 768 && width <= 1024)
  ) {
    return 'tablet';
  }

  // 모바일 체크
  if (isMobileDevice()) {
    return 'mobile';
  }

  return 'desktop';
};