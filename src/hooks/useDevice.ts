import { useState, useEffect } from 'react';

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  screenWidth: number;
  screenHeight: number;
}

export const getDeviceInfo = (): DeviceInfo => {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isTouch: false,
      screenWidth: 1440,
      screenHeight: 900,
    };
  }

  const ua = navigator.userAgent;
  const isTouchDevice =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0;

  // 모바일 User-Agent 검사 (iOS, Android 등)
  const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTabletUA = /iPad|tablet/i.test(ua) || (isTouchDevice && window.innerWidth >= 768 && window.innerWidth <= 1024);

  const width = window.innerWidth;
  const height = window.innerHeight;

  // 화면 너비 기준 (768px 미만이면 스마트폰 모바일로 판단)
  const isMobileScreen = width < 768;
  const isTabletScreen = width >= 768 && width < 1024;

  const isMobile = isMobileUA || isMobileScreen;
  const isTablet = !isMobile && (isTabletUA || isTabletScreen);
  const isDesktop = !isMobile && !isTablet;

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouch: isTouchDevice,
    screenWidth: width,
    screenHeight: height,
  };
};

export const useDevice = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(getDeviceInfo);

  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(getDeviceInfo());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return deviceInfo;
};
