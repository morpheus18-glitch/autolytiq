/**
 * Pixel Tracking System for AutolytiQ
 * 
 * This module handles all customer behavior tracking across the dealership website:
 * - Page views and time on page
 * - Vehicle views and interactions
 * - Form submissions and contact attempts
 * - Session tracking and user journey mapping
 */

let sessionId: string | null = null;
let startTime: number = Date.now();
let lastActivityTime: number = Date.now();

// Initialize pixel tracking
export const initPixelTracker = () => {
  // Create or resume session
  sessionId = localStorage.getItem('dealer_session_id') || generateSessionId();
  localStorage.setItem('dealer_session_id', sessionId);
  
  // Start session tracking
  trackSession();
  
  // Track page views
  trackPageView();
  
  // Track user interactions
  setupInteractionTrackers();
  
  // Track session end
  setupSessionEndTrackers();
  
  console.log('🎯 Pixel Tracker initialized:', sessionId);
};

// Generate unique session ID
const generateSessionId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `session_${timestamp}_${random}`;
};

// Track new session or update existing
const trackSession = async () => {
  if (!sessionId) return;
  
  try {
    const sessionData = {
      sessionId,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      screenResolution: `${screen.width}x${screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    
    // Check if session exists, if not create new one
    const existingSession = await fetch(`/api/tracking/session/${sessionId}`).then(r => r.ok ? r.json() : null);
    
    if (!existingSession) {
      await fetch('/api/tracking/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      });
    } else {
      // Update session activity
      await fetch(`/api/tracking/session/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastActivity: new Date() })
      });
    }
  } catch (error) {
    console.error('Session tracking error:', error);
  }
};

// Track page views
const trackPageView = async () => {
  if (!sessionId) return;
  
  const pageData = {
    sessionId,
    pageUrl: window.location.pathname,
    pageTitle: document.title,
    timestamp: new Date(),
    loadTime: Date.now() - startTime,
  };
  
  try {
    await fetch('/api/tracking/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pageData)
    });
  } catch (error) {
    console.error('Page view tracking error:', error);
  }
  
  // Track time on page when user leaves
  const trackTimeOnPage = () => {
    const timeOnPage = Date.now() - startTime;
    updatePageView(timeOnPage);
  };
  
  // Listen for page unload
  window.addEventListener('beforeunload', trackTimeOnPage);
  window.addEventListener('pagehide', trackTimeOnPage);
};

// Update page view with time spent
const updatePageView = async (timeOnPage: number) => {
  if (!sessionId) return;
  
  try {
    await fetch(`/api/tracking/pageview/${sessionId}/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        timeOnPage,
        exitTime: new Date()
      })
    });
  } catch (error) {
    console.error('Page view update error:', error);
  }
};

// Track specific interactions
export const trackInteraction = async (type: string, data: any = {}) => {
  if (!sessionId) return;
  
  const interactionData = {
    sessionId,
    interactionType: type,
    elementId: data.elementId || null,
    vehicleId: data.vehicleId || null,
    data: data,
    timestamp: new Date(),
  };
  
  try {
    await fetch('/api/tracking/interaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(interactionData)
    });
    
    console.log('🎯 Tracked interaction:', type, data);
  } catch (error) {
    console.error('Interaction tracking error:', error);
  }
};

// Setup automatic interaction tracking
const setupInteractionTrackers = () => {
  // Track vehicle card clicks
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const vehicleCard = target.closest('[data-vehicle-id]');
    
    if (vehicleCard) {
      const vehicleId = vehicleCard.getAttribute('data-vehicle-id');
      trackInteraction('vehicle_view', {
        vehicleId,
        elementId: target.id || target.className,
        clickPosition: { x: event.clientX, y: event.clientY }
      });
    }
    
    // Track button clicks
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      const button = target.tagName === 'BUTTON' ? target : target.closest('button');
      trackInteraction('button_click', {
        buttonText: button?.textContent || 'Unknown',
        elementId: button?.id || button?.className
      });
    }
    
    // Track form submissions
    if (target.type === 'submit' || target.closest('[type="submit"]')) {
      trackInteraction('form_submit', {
        formId: target.closest('form')?.id || 'unknown_form',
        elementId: target.id || target.className
      });
    }
  });
  
  // Track scroll depth
  let maxScrollDepth = 0;
  window.addEventListener('scroll', () => {
    const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    if (scrollDepth > maxScrollDepth) {
      maxScrollDepth = scrollDepth;
      
      // Track significant scroll milestones
      if (scrollDepth >= 25 && maxScrollDepth < 25) {
        trackInteraction('scroll_25', { scrollDepth });
      } else if (scrollDepth >= 50 && maxScrollDepth < 50) {
        trackInteraction('scroll_50', { scrollDepth });
      } else if (scrollDepth >= 75 && maxScrollDepth < 75) {
        trackInteraction('scroll_75', { scrollDepth });
      } else if (scrollDepth >= 90 && maxScrollDepth < 90) {
        trackInteraction('scroll_complete', { scrollDepth });
      }
    }
  });
  
  // Track focus events (form field interactions)
  document.addEventListener('focus', (event) => {
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
      trackInteraction('form_field_focus', {
        fieldType: target.tagName.toLowerCase(),
        fieldName: target.getAttribute('name') || target.id,
        formId: target.closest('form')?.id
      });
    }
  }, true);
};

// Setup session end tracking
const setupSessionEndTrackers = () => {
  const updateActivity = () => {
    lastActivityTime = Date.now();
    if (sessionId) {
      // Update session with latest activity (throttled)
      clearTimeout(window.activityTimeout);
      window.activityTimeout = setTimeout(() => {
        trackSession();
      }, 5000); // Update every 5 seconds of activity
    }
  };
  
  // Track user activity
  ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, updateActivity, true);
  });
  
  // Track session duration on page unload
  window.addEventListener('beforeunload', () => {
    const sessionDuration = Date.now() - startTime;
    navigator.sendBeacon(`/api/tracking/session/${sessionId}/end`, 
      JSON.stringify({ 
        sessionDuration,
        endTime: new Date(),
        lastActivity: new Date(lastActivityTime)
      })
    );
  });
};

// Track specific vehicle interest
export const trackVehicleInterest = async (vehicleId: number, vehicleInfo: any) => {
  await trackInteraction('vehicle_interest', {
    vehicleId,
    vehicleInfo: `${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}`,
    price: vehicleInfo.price,
    vin: vehicleInfo.vin
  });
};

// Track contact form submissions
export const trackContactSubmission = async (formType: string, formData: any) => {
  await trackInteraction('contact_form', {
    formType,
    customerInfo: {
      name: formData.firstName && formData.lastName ? `${formData.firstName} ${formData.lastName}` : null,
      email: formData.email || null,
      phone: formData.phone || null
    },
    interestedVehicle: formData.vehicleId || null
  });
};

// Track phone number clicks
export const trackPhoneClick = async (phoneNumber: string) => {
  await trackInteraction('phone_click', {
    phoneNumber,
    source: 'website'
  });
};

// Get current session ID
export const getCurrentSessionId = (): string | null => {
  return sessionId;
};

// Declare global timeout for activity tracking
declare global {
  interface Window {
    activityTimeout: NodeJS.Timeout;
  }
}