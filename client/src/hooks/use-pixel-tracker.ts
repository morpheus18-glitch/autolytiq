import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { pixelTracker } from '../lib/pixel-tracker';

export const usePixelTracker = () => {
  const [location] = useLocation();

  useEffect(() => {
    // Track page view when location changes
    pixelTracker.trackPageView(location, document.title);
  }, [location]);

  // Return tracking functions for manual use
  return {
    trackVehicleView: pixelTracker.trackVehicleView.bind(pixelTracker),
    trackLeadForm: pixelTracker.trackLeadForm.bind(pixelTracker),
    trackContactClick: pixelTracker.trackContactClick.bind(pixelTracker),
    trackSearch: pixelTracker.trackSearch.bind(pixelTracker),
    trackFilterUsage: pixelTracker.trackFilterUsage.bind(pixelTracker),
    trackInteraction: pixelTracker.trackInteraction.bind(pixelTracker),
  };
};