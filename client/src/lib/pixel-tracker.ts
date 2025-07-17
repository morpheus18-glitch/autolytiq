import { apiRequest } from "./queryClient";

interface VisitorData {
  sessionId: string;
  visitorId: string;
  userAgent: string;
  referrer: string;
  landingPage: string;
  deviceType: string;
  browserName: string;
  operatingSystem: string;
  isReturningVisitor: boolean;
}

interface PageViewData {
  sessionId: string;
  pageUrl: string;
  pageTitle: string;
  timeOnPage: number;
  scrollDepth: number;
  exitPage: boolean;
}

interface InteractionData {
  sessionId: string;
  interactionType: string;
  elementId?: string;
  vehicleId?: number;
  data?: string;
}

class PixelTracker {
  private sessionId: string;
  private visitorId: string;
  private sessionStartTime: number;
  private pageStartTime: number;
  private maxScrollDepth: number;
  private isTracking: boolean;
  private heartbeatInterval: NodeJS.Timeout | null;
  private competitorDomains: Set<string>;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.visitorId = this.getOrCreateVisitorId();
    this.sessionStartTime = Date.now();
    this.pageStartTime = Date.now();
    this.maxScrollDepth = 0;
    this.isTracking = false;
    this.heartbeatInterval = null;
    this.competitorDomains = new Set([
      'cars.com',
      'autotrader.com',
      'edmunds.com',
      'cargurus.com',
      'carmax.com',
      'vroom.com',
      'carvana.com',
      'truecar.com',
      'carfax.com',
      'kbb.com'
    ]);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getOrCreateVisitorId(): string {
    let visitorId = localStorage.getItem('dealership_visitor_id');
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('dealership_visitor_id', visitorId);
    }
    return visitorId;
  }

  private detectDevice(): string {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }

  private detectBrowser(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown';
  }

  private detectOS(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private isReturningVisitor(): boolean {
    return localStorage.getItem('dealership_visitor_id') !== null;
  }

  private trackScrollDepth() {
    const scrollPercent = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );
    this.maxScrollDepth = Math.max(this.maxScrollDepth, scrollPercent);
  }

  private setupScrollTracking() {
    let ticking = false;
    const updateScrollDepth = () => {
      this.trackScrollDepth();
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollDepth);
        ticking = true;
      }
    });
  }

  private setupCompetitorTracking() {
    // Check if user came from competitor site
    const referrer = document.referrer;
    if (referrer) {
      const referrerDomain = new URL(referrer).hostname.replace('www.', '');
      if (this.competitorDomains.has(referrerDomain)) {
        this.trackCompetitorVisit(referrerDomain);
      }
    }

    // Track when user clicks external links to competitors
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');
      if (link && link.href) {
        try {
          const url = new URL(link.href);
          const domain = url.hostname.replace('www.', '');
          if (this.competitorDomains.has(domain)) {
            this.trackCompetitorVisit(domain);
          }
        } catch (e) {
          // Invalid URL, ignore
        }
      }
    });
  }

  private async trackCompetitorVisit(domain: string) {
    try {
      await apiRequest('POST', '/api/tracking/competitor', {
        sessionId: this.sessionId,
        competitorDomain: domain,
        lastVisited: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Failed to track competitor visit:', error);
    }
  }

  private setupHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.updateSession();
    }, 30000); // Update every 30 seconds
  }

  private async updateSession() {
    const sessionDuration = Math.round((Date.now() - this.sessionStartTime) / 1000);
    try {
      await apiRequest('PUT', `/api/tracking/session/${this.sessionId}`, {
        sessionDuration,
        totalPageViews: this.getTotalPageViews(),
        lastActivity: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Failed to update session:', error);
    }
  }

  private getTotalPageViews(): number {
    return parseInt(sessionStorage.getItem('page_views') || '0');
  }

  private incrementPageViews() {
    const current = this.getTotalPageViews();
    sessionStorage.setItem('page_views', (current + 1).toString());
  }

  async initializeSession() {
    const visitorData: VisitorData = {
      sessionId: this.sessionId,
      visitorId: this.visitorId,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      landingPage: window.location.pathname,
      deviceType: this.detectDevice(),
      browserName: this.detectBrowser(),
      operatingSystem: this.detectOS(),
      isReturningVisitor: this.isReturningVisitor()
    };

    try {
      await apiRequest('POST', '/api/tracking/session', visitorData);
      this.isTracking = true;
      this.setupScrollTracking();
      this.setupCompetitorTracking();
      this.setupHeartbeat();
      this.incrementPageViews();
    } catch (error) {
      console.warn('Failed to initialize tracking session:', error);
    }
  }

  async trackPageView(pageUrl: string, pageTitle: string) {
    if (!this.isTracking) return;

    const timeOnPage = Math.round((Date.now() - this.pageStartTime) / 1000);
    
    const pageViewData: PageViewData = {
      sessionId: this.sessionId,
      pageUrl,
      pageTitle,
      timeOnPage,
      scrollDepth: this.maxScrollDepth,
      exitPage: false
    };

    try {
      await apiRequest('POST', '/api/tracking/pageview', pageViewData);
      this.pageStartTime = Date.now();
      this.maxScrollDepth = 0;
      this.incrementPageViews();
    } catch (error) {
      console.warn('Failed to track page view:', error);
    }
  }

  async trackInteraction(type: string, elementId?: string, vehicleId?: number, data?: any) {
    if (!this.isTracking) return;

    const interactionData: InteractionData = {
      sessionId: this.sessionId,
      interactionType: type,
      elementId,
      vehicleId,
      data: data ? JSON.stringify(data) : undefined
    };

    try {
      await apiRequest('POST', '/api/tracking/interaction', interactionData);
    } catch (error) {
      console.warn('Failed to track interaction:', error);
    }
  }

  async trackVehicleView(vehicleId: number, vehicleDetails: any) {
    await this.trackInteraction('vehicle_view', undefined, vehicleId, vehicleDetails);
  }

  async trackLeadForm(formData: any) {
    await this.trackInteraction('lead_form', 'lead-form', undefined, formData);
  }

  async trackContactClick(contactType: string) {
    await this.trackInteraction('contact_click', contactType);
  }

  async trackSearch(searchQuery: string) {
    await this.trackInteraction('search', 'search-input', undefined, { query: searchQuery });
  }

  async trackFilterUsage(filterType: string, filterValue: string) {
    await this.trackInteraction('filter_usage', filterType, undefined, { value: filterValue });
  }

  cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    // Track final page view with exit flag
    const timeOnPage = Math.round((Date.now() - this.pageStartTime) / 1000);
    if (this.isTracking) {
      apiRequest('POST', '/api/tracking/pageview', {
        sessionId: this.sessionId,
        pageUrl: window.location.pathname,
        pageTitle: document.title,
        timeOnPage,
        scrollDepth: this.maxScrollDepth,
        exitPage: true
      }).catch(() => {
        // Ignore errors on cleanup
      });
    }
  }
}

export const pixelTracker = new PixelTracker();

// Initialize tracking when the page loads
if (typeof window !== 'undefined') {
  pixelTracker.initializeSession();
  
  // Track page view on initial load
  pixelTracker.trackPageView(window.location.pathname, document.title);
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    pixelTracker.cleanup();
  });
}