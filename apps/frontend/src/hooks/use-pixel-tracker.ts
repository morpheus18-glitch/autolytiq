import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initPixelTracker, trackInteraction as trackPixelInteraction, setCustomerId } from '@/lib/pixel-tracker';

export const usePixelTracker = () => {
  const [location] = useLocation();
  
  useEffect(() => {
    // Initialize pixel tracker when app loads
    initPixelTracker();
  }, []);
  
  useEffect(() => {
    // Track page changes in SPA
    if (location) {
      document.title = getPageTitle(location);
      // The pixel tracker will automatically detect the page change
      // and track it as a new page view
    }
  }, [location]);

  const trackVehicleView = (vehicleId: number) =>
    trackPixelInteraction('vehicle_view', { vehicleId });
  const trackSearch = (term: string) =>
    trackPixelInteraction('search', { term });
  const trackFilterUsage = (filter: string, value: string) =>
    trackPixelInteraction('filter_use', { filter, value });

  return {
    trackInteraction: trackPixelInteraction,
    trackVehicleView,
    trackSearch,
    trackFilterUsage,
    setTrackedCustomer: setCustomerId
  };
};

// Helper function to get page titles for different routes
const getPageTitle = (path: string): string => {
  const titles: Record<string, string> = {
    '/': 'AutolytiQ - Dashboard',
    '/inventory': 'AutolytiQ - Inventory Management',
    '/sales': 'AutolytiQ - Sales & Leads',
    '/customers': 'AutolytiQ - Customer Management',
    '/analytics': 'AutolytiQ - Analytics & Reports',
    '/competitive-pricing': 'AutolytiQ - Competitive Pricing',
    '/deal-desk': 'AutolytiQ - Deal Desk',
    '/reports': 'AutolytiQ - Professional Reports',
    '/settings': 'AutolytiQ - Settings',
    '/showroom-manager': 'AutolytiQ - Showroom Manager',
  };
  
  // Handle dynamic routes
  if (path.startsWith('/vehicles/')) {
    return 'AutolytiQ - Vehicle Details';
  }
  if (path.startsWith('/deals/')) {
    return 'AutolytiQ - Deal Details';
  }
  if (path.startsWith('/admin/')) {
    return 'AutolytiQ - Admin Panel';
  }
  
  return titles[path] || 'AutolytiQ - Dealership Management';
};