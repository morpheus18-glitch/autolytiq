import { useEffect, useCallback } from 'react';
import { getTracker } from '@/lib/tracker';

export function useTracking() {
  const tracker = getTracker();

  const trackEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    tracker.track(eventName, properties);
  }, [tracker]);

  const trackPageView = useCallback(() => {
    tracker.trackPageView();
  }, [tracker]);

  const trackVehicleView = useCallback((vehicleId: string, vehicleData: Record<string, any>) => {
    tracker.trackVehicleView(vehicleId, vehicleData);
  }, [tracker]);

  const trackFormSubmit = useCallback((formName: string, formData?: Record<string, any>) => {
    tracker.trackFormSubmit(formName, formData);
  }, [tracker]);

  const identify = useCallback((customerId: string, traits?: Record<string, any>) => {
    tracker.identify(customerId, traits);
  }, [tracker]);

  return {
    trackEvent,
    trackPageView,
    trackVehicleView,
    trackFormSubmit,
    identify,
  };
}

// Hook for automatic page view tracking
export function usePageViewTracking() {
  const { trackPageView } = useTracking();

  useEffect(() => {
    trackPageView();
  }, [trackPageView]);
}
