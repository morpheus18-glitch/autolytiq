import { useEffect } from 'react';

interface TrackingPixelProps {
  customerId?: string;
  source?: string;
}

type InteractionMetadata = Record<string, unknown>;

type InteractionPayload = {
  elementId?: string | null;
  vehicleId?: string | number | null;
} & InteractionMetadata;

const SESSION_STORAGE_KEY = 'autolytiq_session_id';
const VISITOR_STORAGE_KEY = 'autolytiq_visitor_id';
const ANON_CUSTOMER_KEY = 'autolytiq_anonymous_customer_id';

export function TrackingPixel({ customerId, source = 'dealer_website' }: TrackingPixelProps) {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const sessionStorage = window.sessionStorage;
    const localStorage = window.localStorage;

    const ensureVisitorId = () => {
      try {
        const existing = localStorage.getItem(VISITOR_STORAGE_KEY);
        if (existing) {
          return existing;
        }
        const generated = `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
        localStorage.setItem(VISITOR_STORAGE_KEY, generated);
        return generated;
      } catch (error) {
        console.warn('Unable to access visitor storage:', error);
        return `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      }
    };

    const ensureSessionId = () => {
      try {
        const existing = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (existing) {
          return existing;
        }
        const generated = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
        sessionStorage.setItem(SESSION_STORAGE_KEY, generated);
        return generated;
      } catch (error) {
        console.warn('Unable to access session storage:', error);
        return `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      }
    };

    const ensureAnonymousCustomerId = () => {
      if (customerId) {
        return customerId;
      }

      try {
        const existing = localStorage.getItem(ANON_CUSTOMER_KEY);
        if (existing) {
          return existing;
        }
        const generated = `anonymous_${Date.now()}`;
        localStorage.setItem(ANON_CUSTOMER_KEY, generated);
        return generated;
      } catch (error) {
        console.warn('Unable to persist anonymous customer id:', error);
        return `anonymous_${Date.now()}`;
      }
    };

    const sessionId = ensureSessionId();
    const visitorId = ensureVisitorId();
    const resolvedCustomerId = ensureAnonymousCustomerId();

    let startTime = Date.now();
    let lastActivityTime = Date.now();
    let pageViewCount = 0;
    const scrollMilestones = new Set<number>();
    let scrollTimeout: number | null = null;
    let engagementTimeout: number | null = null;
    let destroyed = false;

    const headers = { 'Content-Type': 'application/json' } as const;

    const parseVehicleId = (value: unknown) => {
      if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
      }
      if (typeof value === 'string' && value.trim().length > 0) {
        const parsed = Number.parseInt(value, 10);
        return Number.isNaN(parsed) ? null : parsed;
      }
      return null;
    };

    const markActivity = () => {
      lastActivityTime = Date.now();
    };

    const sendSessionUpdate = async (payload: Record<string, unknown>, keepalive = false) => {
      if (destroyed) {
        return;
      }

      try {
        await fetch(`/api/tracking/session/${sessionId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
          keepalive,
        });
      } catch (error) {
        console.error('Session update error:', error);
      }
    };

    const sendInteraction = async (type: string, payload: InteractionPayload = {}, keepalive = false) => {
      if (destroyed) {
        return;
      }

      const { elementId = null, vehicleId = null, ...metadata } = payload;
      const normalizedVehicleId = parseVehicleId(vehicleId);

      const dataPayload: InteractionMetadata = {
        ...metadata,
        page: metadata.page ?? window.location.href,
        source,
        customerId: resolvedCustomerId,
        timestamp: new Date().toISOString(),
      };

      try {
        await fetch('/api/tracking/interaction', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            sessionId,
            interactionType: type,
            elementId,
            vehicleId: normalizedVehicleId,
            data: JSON.stringify(dataPayload),
          }),
          keepalive,
        });
      } catch (error) {
        console.error('Interaction tracking error:', error);
      }
    };

    const deriveDeviceType = () => {
      const ua = navigator.userAgent;
      if (/Mobile|Android|iPhone/i.test(ua)) {
        return 'mobile';
      }
      if (/Tablet|iPad/i.test(ua)) {
        return 'tablet';
      }
      return 'desktop';
    };

    const deriveBrowserName = () => {
      const ua = navigator.userAgent;
      if (ua.includes('Chrome')) return 'Chrome';
      if (ua.includes('Firefox')) return 'Firefox';
      if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
      if (ua.includes('Edge')) return 'Edge';
      return 'Other';
    };

    const deriveOperatingSystem = () => {
      const ua = navigator.userAgent;
      if (/Windows/i.test(ua)) return 'Windows';
      if (/Mac/i.test(ua)) return 'macOS';
      if (/Linux/i.test(ua)) return 'Linux';
      if (/Android/i.test(ua)) return 'Android';
      if (/iOS|iPhone|iPad/i.test(ua)) return 'iOS';
      return 'Other';
    };

    const ensureSession = async () => {
      try {
        const existing = await fetch(`/api/tracking/session/${sessionId}`);
        if (existing.ok) {
          return;
        }
      } catch (error) {
        console.warn('Unable to verify tracking session, creating new one:', error);
      }

      try {
        await fetch('/api/tracking/session', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            sessionId,
            visitorId,
            userAgent: navigator.userAgent,
            referrer: document.referrer || undefined,
            landingPage: window.location.pathname,
            deviceType: deriveDeviceType(),
            browserName: deriveBrowserName(),
            operatingSystem: deriveOperatingSystem(),
          }),
        });
      } catch (error) {
        console.error('Failed to create tracking session:', error);
      }
    };

    const trackPageView = async () => {
      try {
        await fetch('/api/tracking/pageview', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            sessionId,
            pageUrl: window.location.pathname,
            pageTitle: document.title,
            timeOnPage: 0,
            scrollDepth: 0,
            exitPage: false,
          }),
        });
        pageViewCount += 1;
        await sendSessionUpdate({ totalPageViews: pageViewCount, lastActivity: new Date().toISOString() });
      } catch (error) {
        console.error('Page view tracking error:', error);
      }
    };

    const trackTimeOnPage = (keepalive = false) => {
      const now = Date.now();
      const timeSpent = Math.max(0, Math.round((now - startTime) / 1000));
      const activeTime = Math.max(0, Math.round((lastActivityTime - startTime) / 1000));

      void sendInteraction(
        'time_on_page',
        {
          timeSpent,
          activeTime,
        },
        keepalive,
      );

      void sendSessionUpdate(
        {
          sessionDuration: timeSpent,
          lastActivity: new Date().toISOString(),
        },
        keepalive,
      );
    };

    const trackCustomEvent = (eventName: string, metadata: InteractionMetadata = {}) => {
      markActivity();
      void sendInteraction('custom_event', { eventName, ...metadata });
    };

    const trackVehicleInteraction = (vehicleId: string, action: string, metadata: InteractionMetadata = {}) => {
      markActivity();
      void sendInteraction('vehicle_action', {
        vehicleId,
        action,
        ...metadata,
      });
    };

    const captureElementSnapshot = (element: HTMLElement | null) => {
      if (!element) {
        return null;
      }

      const snapshot: Record<string, unknown> = {
        tag: element.tagName,
        id: element.id || undefined,
        className: element.className || undefined,
      };

      if ('textContent' in element && element.textContent) {
        snapshot.text = element.textContent.trim().slice(0, 100);
      }

      if (element instanceof HTMLAnchorElement && element.href) {
        snapshot.href = element.href;
      }

      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        snapshot.inputType = element.type;
        if (typeof element.value === 'string') {
          snapshot.valueLength = element.value.length;
        }
      }

      if (element instanceof HTMLButtonElement) {
        snapshot.buttonType = element.type;
      }

      return snapshot;
    };

    const handleDomEvent = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) {
        return;
      }

      markActivity();

      void sendInteraction('dom_event', {
        elementId: target.id || target.getAttribute('name') || target.className || target.tagName,
        eventType: event.type,
        element: captureElementSnapshot(target),
      });
    };

    const collectFormFieldMetadata = (form: HTMLFormElement) => {
      const fields: Record<string, { type: string; hasValue: boolean; length: number }> = {};
      Array.from(form.elements).forEach((element) => {
        if (!(element instanceof HTMLElement)) {
          return;
        }

        const name = 'name' in element ? element.getAttribute('name') : null;
        if (!name) {
          return;
        }

        let type = 'unknown';
        let valueLength = 0;
        let hasValue = false;

        if (element instanceof HTMLInputElement) {
          type = element.type || 'input';
          if (typeof element.value === 'string') {
            valueLength = element.value.length;
            hasValue = element.value.length > 0;
          }
        } else if (element instanceof HTMLTextAreaElement) {
          type = 'textarea';
          valueLength = element.value.length;
          hasValue = element.value.length > 0;
        } else if (element instanceof HTMLSelectElement) {
          type = 'select';
          valueLength = element.value?.length ?? 0;
          hasValue = element.value !== '';
        }

        fields[name] = {
          type,
          hasValue,
          length: valueLength,
        };
      });
      return fields;
    };

    const handleFormActivity = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) {
        return;
      }

      const form = target instanceof HTMLFormElement ? target : target.closest('form');
      if (!(form instanceof HTMLFormElement)) {
        return;
      }

      markActivity();

      const fields = collectFormFieldMetadata(form);
      void sendInteraction('form_activity', {
        elementId: target.id || target.getAttribute('name') || null,
        formId: form.id || 'unknown_form',
        action: event.type,
        fields,
      });
    };

    const handleScroll = () => {
      markActivity();

      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      scrollTimeout = window.setTimeout(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const denominator = Math.max(documentHeight - windowHeight, 1);
        const scrollPercent = Math.round(((scrollTop + windowHeight) / documentHeight) * 100);
        const normalized = Math.max(0, Math.min(100, scrollPercent));

        const thresholds = [25, 50, 75, 100];
        thresholds.forEach((threshold) => {
          if (normalized >= threshold && !scrollMilestones.has(threshold)) {
            scrollMilestones.add(threshold);
            void sendInteraction('scroll_depth', { milestone: threshold, scrollPercent: normalized });
          }
        });
      }, 150);
    };

    const handleMouseMove = () => {
      markActivity();

      if (engagementTimeout) {
        clearTimeout(engagementTimeout);
      }

      engagementTimeout = window.setTimeout(() => {
        trackCustomEvent('active_engagement');
      }, 30000);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        trackTimeOnPage(true);
      } else {
        startTime = Date.now();
        markActivity();
        trackCustomEvent('page_focused');
      }
    };

    const handleBeforeUnload = () => {
      trackTimeOnPage(true);
    };

    void (async () => {
      await ensureSession();
      await trackPageView();
    })();

    document.addEventListener('click', handleDomEvent);
    document.addEventListener('submit', handleDomEvent);
    document.addEventListener('change', handleDomEvent);
    document.addEventListener('focus', handleFormActivity, true);
    document.addEventListener('blur', handleFormActivity, true);
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    window.autoTracker = {
      trackCustomEvent,
      trackVehicleInteraction,
      sessionId,
      customerId: resolvedCustomerId,
    };

    return () => {
      destroyed = true;

      document.removeEventListener('click', handleDomEvent);
      document.removeEventListener('submit', handleDomEvent);
      document.removeEventListener('change', handleDomEvent);
      document.removeEventListener('focus', handleFormActivity, true);
      document.removeEventListener('blur', handleFormActivity, true);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);

      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      if (engagementTimeout) {
        clearTimeout(engagementTimeout);
      }

      delete window.autoTracker;
    };
  }, [customerId, source]);

  return (
    <img
      src={`/api/tracking/pixel?c=${customerId ?? ''}&s=${source}&t=${Date.now()}`}
      alt=""
      width="1"
      height="1"
      style={{ display: 'none' }}
    />
  );
}

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
    return window.autoTracker
      ? {
          sessionId: window.autoTracker.sessionId,
          customerId: window.autoTracker.customerId,
        }
      : null;
  };

  return {
    trackEvent,
    trackVehicleAction,
    getSessionInfo,
  };
}

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
