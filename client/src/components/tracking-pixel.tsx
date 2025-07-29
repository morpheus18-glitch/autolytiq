import { useEffect } from 'react';

interface TrackingPixelProps {
  customerId?: string;
  source?: string;
}

export function TrackingPixel({ customerId, source = 'dealer_website' }: TrackingPixelProps) {
  useEffect(() => {
    // Enhanced tracking pixel implementation
    const trackingScript = `
      (function() {
        // Create unique session ID
        const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const customerId = '${customerId || 'anonymous_' + Date.now()}';
        
        // Track page views with detailed metadata
        function trackPageView() {
          const data = {
            customerId: customerId,
            sessionId: sessionId,
            url: window.location.href,
            title: document.title,
            timestamp: new Date().toISOString(),
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight
            },
            source: '${source}'
          };
          
          // Send to tracking endpoint
          fetch('/api/tracking/pageview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          }).catch(err => console.error('Tracking error:', err));
        }

        // Track interactions with detailed context
        function trackInteraction(event) {
          const element = event.target;
          const data = {
            customerId: customerId,
            sessionId: sessionId,
            type: event.type,
            element: {
              tag: element.tagName,
              id: element.id,
              className: element.className,
              text: element.textContent?.substring(0, 100),
              href: element.href,
              value: element.value
            },
            timestamp: new Date().toISOString(),
            page: window.location.href,
            source: '${source}'
          };
          
          fetch('/api/tracking/interaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          }).catch(err => console.error('Interaction tracking error:', err));
        }

        // Track scroll depth
        let maxScrollDepth = 0;
        function trackScrollDepth() {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const windowHeight = window.innerHeight;
          const documentHeight = document.documentElement.scrollHeight;
          const scrollPercent = Math.round((scrollTop + windowHeight) / documentHeight * 100);
          
          if (scrollPercent > maxScrollDepth) {
            maxScrollDepth = scrollPercent;
            
            if (scrollPercent >= 25 && scrollPercent < 50) {
              trackCustomEvent('scroll_25_percent');
            } else if (scrollPercent >= 50 && scrollPercent < 75) {
              trackCustomEvent('scroll_50_percent');
            } else if (scrollPercent >= 75 && scrollPercent < 100) {
              trackCustomEvent('scroll_75_percent');
            } else if (scrollPercent >= 100) {
              trackCustomEvent('scroll_100_percent');
            }
          }
        }

        // Track custom events
        function trackCustomEvent(eventName, metadata = {}) {
          const data = {
            customerId: customerId,
            sessionId: sessionId,
            event: eventName,
            metadata: metadata,
            timestamp: new Date().toISOString(),
            page: window.location.href,
            source: '${source}'
          };
          
          fetch('/api/tracking/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          }).catch(err => console.error('Custom event tracking error:', err));
        }

        // Track time on page
        let startTime = Date.now();
        let lastActivityTime = Date.now();
        
        function trackTimeOnPage() {
          const timeSpent = Math.round((Date.now() - startTime) / 1000);
          const activeTime = Math.round((lastActivityTime - startTime) / 1000);
          
          const data = {
            customerId: customerId,
            sessionId: sessionId,
            timeSpent: timeSpent,
            activeTime: activeTime,
            timestamp: new Date().toISOString(),
            page: window.location.href,
            source: '${source}'
          };
          
          fetch('/api/tracking/time', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          }).catch(err => console.error('Time tracking error:', err));
        }

        // Track form interactions
        function trackFormInteraction(event) {
          const form = event.target.form || event.target;
          const formData = new FormData(form);
          const fields = {};
          
          for (let [key, value] of formData.entries()) {
            // Only track field names and types, not sensitive values
            fields[key] = {
              type: form.elements[key]?.type || 'unknown',
              hasValue: !!value,
              length: typeof value === 'string' ? value.length : 0
            };
          }
          
          const data = {
            customerId: customerId,
            sessionId: sessionId,
            formId: form.id || 'unknown_form',
            action: event.type,
            fields: fields,
            timestamp: new Date().toISOString(),
            page: window.location.href,
            source: '${source}'
          };
          
          fetch('/api/tracking/form', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          }).catch(err => console.error('Form tracking error:', err));
        }

        // Enhanced vehicle-specific tracking
        function trackVehicleInteraction(vehicleId, action, metadata = {}) {
          const data = {
            customerId: customerId,
            sessionId: sessionId,
            vehicleId: vehicleId,
            action: action,
            metadata: metadata,
            timestamp: new Date().toISOString(),
            page: window.location.href,
            source: '${source}'
          };
          
          fetch('/api/tracking/vehicle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          }).catch(err => console.error('Vehicle tracking error:', err));
        }

        // Initialize tracking
        trackPageView();
        
        // Event listeners
        document.addEventListener('click', trackInteraction);
        document.addEventListener('submit', trackInteraction);
        document.addEventListener('change', trackInteraction);
        
        // Form-specific tracking
        document.addEventListener('focus', function(event) {
          if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
            trackFormInteraction(event);
          }
        }, true);
        
        document.addEventListener('blur', function(event) {
          if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
            trackFormInteraction(event);
          }
        }, true);
        
        // Scroll tracking
        let scrollTimeout;
        window.addEventListener('scroll', function() {
          lastActivityTime = Date.now();
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(trackScrollDepth, 150);
        });
        
        // Mouse movement tracking (for engagement)
        let mouseMoveTimeout;
        document.addEventListener('mousemove', function() {
          lastActivityTime = Date.now();
          clearTimeout(mouseMoveTimeout);
          mouseMoveTimeout = setTimeout(function() {
            trackCustomEvent('active_engagement');
          }, 30000); // Track every 30 seconds of activity
        });
        
        // Before unload tracking
        window.addEventListener('beforeunload', function() {
          trackTimeOnPage();
        });
        
        // Visibility change tracking
        document.addEventListener('visibilitychange', function() {
          if (document.visibilityState === 'hidden') {
            trackTimeOnPage();
          } else if (document.visibilityState === 'visible') {
            startTime = Date.now();
            lastActivityTime = Date.now();
            trackCustomEvent('page_focused');
          }
        });
        
        // Expose tracking functions globally for manual tracking
        window.autoTracker = {
          trackCustomEvent: trackCustomEvent,
          trackVehicleInteraction: trackVehicleInteraction,
          sessionId: sessionId,
          customerId: customerId
        };
        
        console.log('🎯 Enhanced AutolytiQ tracking initialized:', sessionId);
      })();
    `;

    // Create and inject the tracking script
    const script = document.createElement('script');
    script.innerHTML = trackingScript;
    document.head.appendChild(script);

    // Cleanup
    return () => {
      // Remove the script when component unmounts
      document.head.removeChild(script);
    };
  }, [customerId, source]);

  // Return invisible pixel for external tracking
  return (
    <img
      src={`/api/tracking/pixel?c=${customerId}&s=${source}&t=${Date.now()}`}
      alt=""
      width="1"
      height="1"
      style={{ display: 'none' }}
    />
  );
}

// Hook for manual tracking calls
export function useCustomerTracking() {
  const trackEvent = (eventName: string, metadata?: Record<string, any>) => {
    if (window.autoTracker) {
      window.autoTracker.trackCustomEvent(eventName, metadata);
    }
  };

  const trackVehicleAction = (vehicleId: string, action: string, metadata?: Record<string, any>) => {
    if (window.autoTracker) {
      window.autoTracker.trackVehicleInteraction(vehicleId, action, metadata);
    }
  };

  const getSessionInfo = () => {
    return window.autoTracker ? {
      sessionId: window.autoTracker.sessionId,
      customerId: window.autoTracker.customerId
    } : null;
  };

  return {
    trackEvent,
    trackVehicleAction,
    getSessionInfo
  };
}

// Declare global interface for TypeScript
declare global {
  interface Window {
    autoTracker?: {
      trackCustomEvent: (eventName: string, metadata?: Record<string, any>) => void;
      trackVehicleInteraction: (vehicleId: string, action: string, metadata?: Record<string, any>) => void;
      sessionId: string;
      customerId: string;
    };
  }
}