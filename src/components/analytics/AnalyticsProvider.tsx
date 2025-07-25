'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { setupAnalytics, trackPageView, isAnalyticsEnabled } from '@/lib/analytics';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize analytics on mount
    if (typeof window !== 'undefined') {
      setupAnalytics();
    }
  }, []);

  useEffect(() => {
    // Track page views when pathname changes
    if (isAnalyticsEnabled() && pathname) {
      trackPageView(pathname);
    }
  }, [pathname]);

  return <>{children}</>;
}
