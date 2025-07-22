import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { initPixelTracker, trackInteraction as trackPixelInteraction } from '@/lib/pixel-tracker';

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

  // Return the tracking function for use in components
  return {
    trackInteraction: trackPixelInteraction
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
    '/ml-dashboard': 'AutolytiQ - ML Analytics Dashboard',
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