import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { EventTracker } from '@/lib/event-tracker';

export function usePageTracking() {
  const [location] = useLocation();

  useEffect(() => {
    // Track page view on route change
    EventTracker.trackPageView({
      page: location,
      timestamp: new Date().toISOString(),
    });
  }, [location]);

  return { currentPage: location };
}

// Provider component to add page tracking to the entire app
export function PageTrackingProvider({ children }: { children: React.ReactNode }) {
  usePageTracking();
  return <>{children}</>;
}