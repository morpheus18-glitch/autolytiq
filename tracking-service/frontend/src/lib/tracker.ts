/**
 * Customer Behavior Tracking SDK
 * Tracks all user interactions for analytics and lead scoring
 */

interface TrackingConfig {
  apiUrl?: string;
  tenantId: string;
  flushInterval?: number;
  flushSize?: number;
  debug?: boolean;
}

interface TrackingEvent {
  event_id?: string;
  event_name: string;
  event_timestamp: number;
  session_id: string;
  customer_id?: string;
  anonymous_id: string;
  tenant_id: string;
  
  page_url: string;
  page_title: string;
  page_path: string;
  referrer?: string;
  
  user_agent: string;
  device_type: string;
  browser: string;
  browser_version: string;
  os: string;
  screen_width: number;
  screen_height: number;
  
  properties: Record<string, any>;
  
  time_on_page?: number;
  scroll_depth?: number;
  
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

class CustomerTracker {
  private config: Required<TrackingConfig>;
  private eventQueue: TrackingEvent[] = [];
  private sessionId: string;
  private anonymousId: string;
  private customerId?: string;
  private flushTimer?: number;
  private pageStartTime: number = Date.now();
  private maxScrollDepth: number = 0;
  private pageViewId?: string;

  constructor(config: TrackingConfig) {
    this.config = {
      apiUrl: config.apiUrl || '/api/tracking',
      tenantId: config.tenantId,
      flushInterval: config.flushInterval || 5000, // 5 seconds
      flushSize: config.flushSize || 10,
      debug: config.debug || false,
    };

    this.sessionId = this.getOrCreateSessionId();
    this.anonymousId = this.getOrCreateAnonymousId();
    
    this.initialize();
  }

  private initialize() {
    // Track initial page view
    this.trackPageView();

    // Start auto-flush
    this.startAutoFlush();

    // Attach event listeners
    this.attachGlobalListeners();

    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.trackTimeOnPage();
        this.flush();
      });

      // Flush on visibility change (tab switching)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.trackTimeOnPage();
          this.flush();
        } else {
          this.pageStartTime = Date.now();
        }
      });
    }

    this.log('Tracker initialized', { sessionId: this.sessionId });
  }

  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return '';
    
    let sessionId = sessionStorage.getItem('_tracking_session');
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${this.generateRandomId()}`;
      sessionStorage.setItem('_tracking_session', sessionId);
    }
    return sessionId;
  }

  private getOrCreateAnonymousId(): string {
    if (typeof window === 'undefined') return '';
    
    let anonymousId = localStorage.getItem('_tracking_anonymous');
    if (!anonymousId) {
      anonymousId = `anon_${Date.now()}_${this.generateRandomId()}`;
      localStorage.setItem('_tracking_anonymous', anonymousId);
    }
    return anonymousId;
  }

  private generateRandomId(): string {
    return Math.random().toString(36).substring(2, 11);
  }

  private getDeviceInfo() {
    const ua = navigator.userAgent;
    
    // Detect device type
    let deviceType = 'desktop';
    if (/mobile/i.test(ua)) deviceType = 'mobile';
    else if (/tablet|ipad/i.test(ua)) deviceType = 'tablet';

    // Detect browser
    let browser = 'unknown';
    let browserVersion = '';
    if (ua.indexOf('Firefox') > -1) {
      browser = 'Firefox';
      browserVersion = ua.match(/Firefox\/([0-9.]+)/)?.[1] || '';
    } else if (ua.indexOf('Chrome') > -1) {
      browser = 'Chrome';
      browserVersion = ua.match(/Chrome\/([0-9.]+)/)?.[1] || '';
    } else if (ua.indexOf('Safari') > -1) {
      browser = 'Safari';
      browserVersion = ua.match(/Version\/([0-9.]+)/)?.[1] || '';
    } else if (ua.indexOf('Edge') > -1) {
      browser = 'Edge';
      browserVersion = ua.match(/Edge\/([0-9.]+)/)?.[1] || '';
    }

    // Detect OS
    let os = 'unknown';
    if (ua.indexOf('Win') > -1) os = 'Windows';
    else if (ua.indexOf('Mac') > -1) os = 'macOS';
    else if (ua.indexOf('Linux') > -1) os = 'Linux';
    else if (ua.indexOf('Android') > -1) os = 'Android';
    else if (ua.indexOf('iOS') > -1) os = 'iOS';

    return {
      device_type: deviceType,
      browser,
      browser_version: browserVersion,
      os,
      user_agent: ua,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
    };
  }

  private getUTMParameters(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};

    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    utmKeys.forEach(key => {
      const value = params.get(key);
      if (value) {
        utm[key] = value;
        // Store in session for attribution
        sessionStorage.setItem(key, value);
      } else {
        // Retrieve from session if not in URL
        const stored = sessionStorage.getItem(key);
        if (stored) utm[key] = stored;
      }
    });

    return utm;
  }

  public identify(customerId: string, traits?: Record<string, any>) {
    this.customerId = customerId;
    localStorage.setItem('_tracking_customer', customerId);

    this.track('identify', {
      customer_id: customerId,
      traits,
    });

    this.log('Customer identified', { customerId, traits });
  }

  public track(eventName: string, properties: Record<string, any> = {}) {
    if (typeof window === 'undefined') return;

    const event: TrackingEvent = {
      event_name: eventName,
      event_timestamp: Date.now(),
      session_id: this.sessionId,
      customer_id: this.customerId,
      anonymous_id: this.anonymousId,
      tenant_id: this.config.tenantId,
      
      page_url: window.location.href,
      page_title: document.title,
      page_path: window.location.pathname,
      referrer: document.referrer || undefined,
      
      ...this.getDeviceInfo(),
      ...this.getUTMParameters(),
      
      properties,
    };

    this.eventQueue.push(event);
    this.log('Event tracked', event);

    // Flush immediately for critical events
    if (this.isCriticalEvent(eventName)) {
      this.flush();
    }

    // Flush if queue is full
    if (this.eventQueue.length >= this.config.flushSize) {
      this.flush();
    }
  }

  private isCriticalEvent(eventName: string): boolean {
    const criticalEvents = [
      'form_submit',
      'test_drive_request',
      'finance_application',
      'phone_click',
      'chat_started',
      'deal_created',
    ];
    return criticalEvents.includes(eventName);
  }

  public trackPageView() {
    this.pageViewId = `pv_${Date.now()}`;
    this.pageStartTime = Date.now();
    this.maxScrollDepth = 0;

    this.track('page_view', {
      page_view_id: this.pageViewId,
    });
  }

  private trackTimeOnPage() {
    if (!this.pageViewId) return;

    const timeOnPage = Math.floor((Date.now() - this.pageStartTime) / 1000);
    
    this.track('time_on_page', {
      page_view_id: this.pageViewId,
      time_seconds: timeOnPage,
      scroll_depth: this.maxScrollDepth,
    });
  }

  public trackVehicleView(vehicleId: string, vehicleData: Record<string, any>) {
    this.track('vehicle_view', {
      vehicleId,
      ...vehicleData,
    });
  }

  public trackVehicleInteraction(vehicleId: string, interactionType: string, data?: Record<string, any>) {
    this.track('vehicle_interaction', {
      vehicleId,
      interaction_type: interactionType,
      ...data,
    });
  }

  public trackFormSubmit(formName: string, formData?: Record<string, any>) {
    this.track('form_submit', {
      form_name: formName,
      form_data: formData,
    });
  }

  public trackTestDriveRequest(vehicleId: string) {
    this.track('test_drive_request', {
      vehicleId,
    });
  }

  public trackFinanceApplication(data: Record<string, any>) {
    this.track('finance_application', data);
  }

  public trackPhoneClick(phoneNumber: string) {
    this.track('phone_click', {
      phone_number: phoneNumber,
    });
  }

  public trackSearch(query: string, filters?: Record<string, any>) {
    this.track('search', {
      query,
      filters,
    });
  }

  public trackClick(element: string, data?: Record<string, any>) {
    this.track('click', {
      element,
      ...data,
    });
  }

  private attachGlobalListeners() {
    if (typeof window === 'undefined') return;

    // Track scroll depth
    let scrollTimeout: number;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        const scrollDepth = Math.floor(
          (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );
        this.maxScrollDepth = Math.max(this.maxScrollDepth, scrollDepth);
      }, 100);
    });

    // Track clicks on tracked elements
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      // Track vehicle cards
      const vehicleCard = target.closest('[data-vehicle-id]');
      if (vehicleCard) {
        const vehicleId = vehicleCard.getAttribute('data-vehicle-id');
        if (vehicleId) {
          this.track('vehicle_click', { vehicleId });
        }
      }

      // Track CTAs
      const cta = target.closest('[data-track-cta]');
      if (cta) {
        const ctaName = cta.getAttribute('data-track-cta');
        this.track('cta_click', { cta_name: ctaName });
      }

      // Track phone numbers
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('tel:')) {
        const phone = target.getAttribute('href')?.replace('tel:', '');
        if (phone) this.trackPhoneClick(phone);
      }

      // Track heatmap data
      this.trackClickHeatmap(e);
    });

    // Track form interactions
    document.addEventListener('focusin', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        const form = target.closest('form');
        const formName = form?.getAttribute('name') || form?.getAttribute('id') || 'unknown';
        const fieldName = (target as HTMLInputElement).name || (target as HTMLInputElement).id;
        
        this.track('form_field_focus', {
          form_name: formName,
          field_name: fieldName,
        });
      }
    });
  }

  private trackClickHeatmap(event: MouseEvent) {
    const target = event.target as HTMLElement;
    
    this.track('click_heatmap', {
      x_position: event.clientX,
      y_position: event.clientY,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      x_percent: Math.floor((event.clientX / window.innerWidth) * 100),
      y_percent: Math.floor((event.clientY / window.innerHeight) * 100),
      element_tag: target.tagName,
      element_id: target.id || null,
      element_class: target.className || null,
    });
  }

  private startAutoFlush() {
    this.flushTimer = window.setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flush();
      }
    }, this.config.flushInterval);
  }

  public async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
        keepalive: true, // Important for beforeunload
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      this.log('Events flushed', { count: events.length });
    } catch (error) {
      console.error('Failed to flush events:', error);
      // Re-queue events
      this.eventQueue.unshift(...events);
    }
  }

  private log(message: string, data?: any) {
    if (this.config.debug) {
      console.log(`[Tracker] ${message}`, data);
    }
  }

  public destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

// Singleton instance
let trackerInstance: CustomerTracker | null = null;

export function initializeTracker(config: TrackingConfig): CustomerTracker {
  if (!trackerInstance) {
    trackerInstance = new CustomerTracker(config);
  }
  return trackerInstance;
}

export function getTracker(): CustomerTracker {
  if (!trackerInstance) {
    throw new Error('Tracker not initialized. Call initializeTracker() first.');
  }
  return trackerInstance;
}

export { CustomerTracker };
export type { TrackingEvent, TrackingConfig };
