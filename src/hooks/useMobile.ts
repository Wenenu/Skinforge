import { useState, useEffect } from 'react';

export interface MobileInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isChrome: boolean;
  isFirefox: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  userAgent: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

export const useMobile = (): MobileInfo => {
  const [mobileInfo, setMobileInfo] = useState<MobileInfo>(() => {
    const userAgent = navigator.userAgent;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Mobile detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    
    // Browser detection
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    const isChrome = /Chrome/.test(userAgent) && !/Edge/.test(userAgent);
    const isFirefox = /Firefox/.test(userAgent);
    
    // Screen size detection
    const isTablet = screenWidth >= 768 && screenWidth <= 1024;
    const isDesktop = screenWidth > 1024;
    
    // Orientation detection
    const orientation = screenWidth > screenHeight ? 'landscape' : 'portrait';
    
    // Device type determination
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (isMobile && !isTablet) deviceType = 'mobile';
    else if (isTablet) deviceType = 'tablet';
    
    return {
      isMobile,
      isTablet,
      isDesktop,
      isIOS,
      isAndroid,
      isSafari,
      isChrome,
      isFirefox,
      screenWidth,
      screenHeight,
      orientation,
      userAgent,
      deviceType
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const userAgent = navigator.userAgent;
      
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isAndroid = /Android/.test(userAgent);
      const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
      const isChrome = /Chrome/.test(userAgent) && !/Edge/.test(userAgent);
      const isFirefox = /Firefox/.test(userAgent);
      
      const isTablet = screenWidth >= 768 && screenWidth <= 1024;
      const isDesktop = screenWidth > 1024;
      const orientation = screenWidth > screenHeight ? 'landscape' : 'portrait';
      
      let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
      if (isMobile && !isTablet) deviceType = 'mobile';
      else if (isTablet) deviceType = 'tablet';
      
      setMobileInfo({
        isMobile,
        isTablet,
        isDesktop,
        isIOS,
        isAndroid,
        isSafari,
        isChrome,
        isFirefox,
        screenWidth,
        screenHeight,
        orientation,
        userAgent,
        deviceType
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return mobileInfo;
};

// Utility functions for mobile-specific behavior
export const getMobileBreakpoint = (mobileInfo: MobileInfo): string => {
  if (mobileInfo.screenWidth < 640) return 'xs';
  if (mobileInfo.screenWidth < 768) return 'sm';
  if (mobileInfo.screenWidth < 1024) return 'md';
  if (mobileInfo.screenWidth < 1280) return 'lg';
  return 'xl';
};

export const shouldShowMobileLayout = (mobileInfo: MobileInfo): boolean => {
  return mobileInfo.isMobile || mobileInfo.screenWidth < 768;
};

export const getMobilePadding = (mobileInfo: MobileInfo): string => {
  if (mobileInfo.screenWidth < 640) return 'px-4';
  if (mobileInfo.screenWidth < 768) return 'px-6';
  return 'px-8';
};

export const getMobileTextSize = (mobileInfo: MobileInfo, baseSize: string): string => {
  if (mobileInfo.screenWidth < 640) {
    return baseSize.replace('text-', 'text-').replace('xl', 'lg').replace('2xl', 'xl').replace('3xl', '2xl');
  }
  return baseSize;
}; 