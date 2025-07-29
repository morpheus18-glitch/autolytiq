// Enhanced customer lifecycle tracking service
export interface CustomerJourney {
  customerId: string;
  sessionId: string;
  startDate: Date;
  currentStage: 'awareness' | 'interest' | 'consideration' | 'research' | 'decision' | 'purchase';
  purchaseIntent: number; // 0-100
  totalSessions: number;
  totalPageViews: number;
  timeSpent: number; // in minutes
  websites: WebsiteActivity[];
  searchTerms: string[];
  behavior: CustomerBehavior;
  lifecycle: JourneyStage[];
  signals: PurchaseSignal[];
}

export interface WebsiteActivity {
  site: string;
  visits: number;
  timeSpent: number; // in minutes
  pages: PageView[];
  referrer?: string;
  exitPage?: string;
}

export interface PageView {
  url: string;
  title: string;
  timestamp: Date;
  timeOnPage: number;
  interactions: Interaction[];
}

export interface Interaction {
  type: 'click' | 'scroll' | 'form_fill' | 'download' | 'search' | 'filter' | 'save' | 'share';
  element: string;
  timestamp: Date;
  value?: string;
  metadata?: Record<string, any>;
}

export interface CustomerBehavior {
  viewedVehicles: number;
  savedVehicles: number;
  requestedInfo: number;
  calculatorUse: number;
  financingViews: number;
  comparisonActions: number;
  socialShares: number;
  returnVisits: number;
}

export interface JourneyStage {
  stage: string;
  date: Date;
  duration: number; // in days
  triggers: string[];
  exitReason?: string;
}

export interface PurchaseSignal {
  type: 'high_intent' | 'financing_ready' | 'comparison' | 'local_search' | 'urgency' | 'dealer_contact' | 'ready_to_buy';
  signal: string;
  strength: number; // 0-100
  timestamp: Date;
  metadata?: Record<string, any>;
}

export class CustomerLifecycleTracker {
  private journeys: Map<string, CustomerJourney> = new Map();
  private purchaseSignalThresholds = {
    financingPageVisits: 5,
    calculatorUse: 3,
    vehicleComparisons: 2,
    inventorySearches: 8,
    timeOnSite: 30, // minutes
    returnVisits: 3,
    contactFormFills: 1
  };

  // Track external website activity (requires integration)
  async trackExternalActivity(customerId: string, activity: {
    site: string;
    url: string;
    timeSpent: number;
    interactions: Interaction[];
    referrer?: string;
  }) {
    const journey = this.getOrCreateJourney(customerId);
    
    let siteActivity = journey.websites.find(w => w.site === activity.site);
    if (!siteActivity) {
      siteActivity = {
        site: activity.site,
        visits: 0,
        timeSpent: 0,
        pages: []
      };
      journey.websites.push(siteActivity);
    }

    siteActivity.visits++;
    siteActivity.timeSpent += activity.timeSpent;
    siteActivity.pages.push({
      url: activity.url,
      title: this.extractPageTitle(activity.url),
      timestamp: new Date(),
      timeOnPage: activity.timeSpent,
      interactions: activity.interactions
    });

    // Update journey metrics
    journey.totalPageViews++;
    journey.timeSpent += activity.timeSpent;
    
    // Analyze for purchase signals
    this.analyzePurchaseSignals(journey, activity);
    
    // Update journey stage
    this.updateJourneyStage(journey);
    
    this.journeys.set(customerId, journey);
  }

  // Track search terms across platforms
  async trackSearchActivity(customerId: string, searchTerms: string[], platform: string) {
    const journey = this.getOrCreateJourney(customerId);
    
    // Add unique search terms
    searchTerms.forEach(term => {
      if (!journey.searchTerms.includes(term.toLowerCase())) {
        journey.searchTerms.push(term.toLowerCase());
      }
    });

    // Analyze search intent
    const highIntentTerms = ['financing', 'buy now', 'best price', 'incentives', 'dealer near me', 'test drive'];
    const hasHighIntentSearch = searchTerms.some(term => 
      highIntentTerms.some(intent => term.toLowerCase().includes(intent))
    );

    if (hasHighIntentSearch) {
      journey.signals.push({
        type: 'high_intent',
        signal: `High-intent search: "${searchTerms.join(', ')}" on ${platform}`,
        strength: 85,
        timestamp: new Date(),
        metadata: { platform, terms: searchTerms }
      });
    }

    this.journeys.set(customerId, journey);
  }

  // Track dealer website activity (internal)
  async trackDealerActivity(customerId: string, activity: {
    page: string;
    action: string;
    vehicleId?: string;
    timeSpent: number;
    formData?: Record<string, any>;
  }) {
    const journey = this.getOrCreateJourney(customerId);
    
    // Update behavior metrics
    switch (activity.action) {
      case 'vehicle_view':
        journey.behavior.viewedVehicles++;
        break;
      case 'vehicle_save':
        journey.behavior.savedVehicles++;
        break;
      case 'info_request':
        journey.behavior.requestedInfo++;
        break;
      case 'calculator_use':
        journey.behavior.calculatorUse++;
        break;
      case 'financing_view':
        journey.behavior.financingViews++;
        break;
      case 'vehicle_compare':
        journey.behavior.comparisonActions++;
        break;
    }

    // Generate purchase signals based on activity
    this.generateActivitySignals(journey, activity);
    
    this.journeys.set(customerId, journey);
  }

  // Analyze cross-platform behavior patterns
  private analyzePurchaseSignals(journey: CustomerJourney, activity: any) {
    const signals: PurchaseSignal[] = [];

    // Multiple financing page visits
    if (journey.behavior.financingViews >= this.purchaseSignalThresholds.financingPageVisits) {
      signals.push({
        type: 'financing_ready',
        signal: `Visited financing pages ${journey.behavior.financingViews} times`,
        strength: Math.min(95, 70 + (journey.behavior.financingViews * 5)),
        timestamp: new Date()
      });
    }

    // Heavy calculator usage
    if (journey.behavior.calculatorUse >= this.purchaseSignalThresholds.calculatorUse) {
      signals.push({
        type: 'high_intent',
        signal: `Used payment calculator ${journey.behavior.calculatorUse} times`,
        strength: Math.min(90, 60 + (journey.behavior.calculatorUse * 10)),
        timestamp: new Date()
      });
    }

    // Extensive comparison shopping
    if (journey.behavior.comparisonActions >= this.purchaseSignalThresholds.vehicleComparisons) {
      signals.push({
        type: 'comparison',
        signal: `Compared ${journey.behavior.comparisonActions} vehicles extensively`,
        strength: 85,
        timestamp: new Date()
      });
    }

    // Frequent inventory searches
    const inventorySearches = journey.searchTerms.filter(term => 
      term.includes('inventory') || term.includes('available') || term.includes('in stock')
    ).length;
    
    if (inventorySearches >= this.purchaseSignalThresholds.inventorySearches) {
      signals.push({
        type: 'local_search',
        signal: `Searched for local inventory ${inventorySearches} times`,
        strength: 90,
        timestamp: new Date()
      });
    }

    // Time spent indicates serious interest
    if (journey.timeSpent >= this.purchaseSignalThresholds.timeOnSite) {
      signals.push({
        type: 'high_intent',
        signal: `Spent ${Math.round(journey.timeSpent)} minutes researching`,
        strength: Math.min(85, 50 + (journey.timeSpent / 10)),
        timestamp: new Date()
      });
    }

    // Add new signals to journey
    journey.signals.push(...signals);
    
    // Calculate overall purchase intent
    this.calculatePurchaseIntent(journey);
  }

  private generateActivitySignals(journey: CustomerJourney, activity: any) {
    if (activity.action === 'info_request' && activity.formData) {
      journey.signals.push({
        type: 'dealer_contact',
        signal: 'Submitted contact form with personal information',
        strength: 95,
        timestamp: new Date(),
        metadata: activity.formData
      });
    }

    if (activity.action === 'calculator_use' && journey.behavior.calculatorUse > 5) {
      journey.signals.push({
        type: 'ready_to_buy',
        signal: `Intensive payment calculator usage (${journey.behavior.calculatorUse} times)`,
        strength: 88,
        timestamp: new Date()
      });
    }

    if (activity.action === 'vehicle_save' && journey.behavior.savedVehicles >= 3) {
      journey.signals.push({
        type: 'comparison',
        signal: `Saved ${journey.behavior.savedVehicles} vehicles for comparison`,
        strength: 82,
        timestamp: new Date()
      });
    }
  }

  private calculatePurchaseIntent(journey: CustomerJourney): void {
    let intentScore = 0;
    const weights = {
      financingViews: 15,
      calculatorUse: 12,
      savedVehicles: 8,
      requestedInfo: 20,
      comparisonActions: 10,
      timeSpent: 0.5, // per minute
      returnVisits: 5,
      signals: 10 // per high-strength signal
    };

    // Base scoring
    intentScore += journey.behavior.financingViews * weights.financingViews;
    intentScore += journey.behavior.calculatorUse * weights.calculatorUse;
    intentScore += journey.behavior.savedVehicles * weights.savedVehicles;
    intentScore += journey.behavior.requestedInfo * weights.requestedInfo;
    intentScore += journey.behavior.comparisonActions * weights.comparisonActions;
    intentScore += journey.timeSpent * weights.timeSpent;
    intentScore += journey.behavior.returnVisits * weights.returnVisits;

    // High-strength signals boost
    const highStrengthSignals = journey.signals.filter(s => s.strength >= 85).length;
    intentScore += highStrengthSignals * weights.signals;

    // Stage-based multipliers
    const stageMultipliers = {
      awareness: 0.2,
      interest: 0.4,
      consideration: 0.6,
      research: 0.8,
      decision: 1.0,
      purchase: 1.0
    };

    intentScore *= stageMultipliers[journey.currentStage];

    // Cap at 100
    journey.purchaseIntent = Math.min(100, Math.round(intentScore));
  }

  private updateJourneyStage(journey: CustomerJourney): void {
    const currentStage = journey.currentStage;
    let newStage = currentStage;

    // Stage progression logic based on behavior
    if (journey.purchaseIntent >= 90 && journey.behavior.requestedInfo > 0) {
      newStage = 'purchase';
    } else if (journey.purchaseIntent >= 80 && journey.behavior.financingViews > 3) {
      newStage = 'decision';
    } else if (journey.purchaseIntent >= 60 && journey.behavior.comparisonActions > 1) {
      newStage = 'research';
    } else if (journey.purchaseIntent >= 40 && journey.behavior.savedVehicles > 0) {
      newStage = 'consideration';
    } else if (journey.purchaseIntent >= 20 && journey.behavior.viewedVehicles > 2) {
      newStage = 'interest';
    }

    // Add new stage if progressed
    if (newStage !== currentStage) {
      const lastStage = journey.lifecycle[journey.lifecycle.length - 1];
      if (lastStage) {
        lastStage.duration = Math.ceil((new Date().getTime() - lastStage.date.getTime()) / (1000 * 60 * 60 * 24));
      }

      journey.lifecycle.push({
        stage: newStage,
        date: new Date(),
        duration: 0,
        triggers: this.getStageTransitionTriggers(currentStage, newStage, journey)
      });

      journey.currentStage = newStage;
    }
  }

  private getStageTransitionTriggers(fromStage: string, toStage: string, journey: CustomerJourney): string[] {
    const triggers = [];
    
    if (toStage === 'decision' && journey.behavior.financingViews > 3) {
      triggers.push('Multiple financing page views');
    }
    if (toStage === 'purchase' && journey.behavior.requestedInfo > 0) {
      triggers.push('Contact form submission');
    }
    if (journey.behavior.calculatorUse > 5) {
      triggers.push('Intensive payment calculator usage');
    }
    
    return triggers;
  }

  private getOrCreateJourney(customerId: string): CustomerJourney {
    if (!this.journeys.has(customerId)) {
      this.journeys.set(customerId, {
        customerId,
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        startDate: new Date(),
        currentStage: 'awareness',
        purchaseIntent: 0,
        totalSessions: 0,
        totalPageViews: 0,
        timeSpent: 0,
        websites: [],
        searchTerms: [],
        behavior: {
          viewedVehicles: 0,
          savedVehicles: 0,
          requestedInfo: 0,
          calculatorUse: 0,
          financingViews: 0,
          comparisonActions: 0,
          socialShares: 0,
          returnVisits: 0
        },
        lifecycle: [{
          stage: 'awareness',
          date: new Date(),
          duration: 0,
          triggers: ['Initial website visit']
        }],
        signals: []
      });
    }
    return this.journeys.get(customerId)!;
  }

  private extractPageTitle(url: string): string {
    // Simple URL to title extraction
    const pathSegments = url.split('/').filter(Boolean);
    if (pathSegments.length === 0) return 'Home Page';
    
    return pathSegments[pathSegments.length - 1]
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  // Get journey data for analytics
  getCustomerJourney(customerId: string): CustomerJourney | null {
    return this.journeys.get(customerId) || null;
  }

  // Get all high-intent customers
  getHighIntentCustomers(threshold: number = 80): CustomerJourney[] {
    return Array.from(this.journeys.values())
      .filter(journey => journey.purchaseIntent >= threshold)
      .sort((a, b) => b.purchaseIntent - a.purchaseIntent);
  }

  // Get conversion funnel data
  getConversionFunnel(): Record<string, number> {
    const stageCounts = {
      awareness: 0,
      interest: 0,
      consideration: 0,
      research: 0,
      decision: 0,
      purchase: 0
    };

    Array.from(this.journeys.values()).forEach(journey => {
      stageCounts[journey.currentStage]++;
    });

    return stageCounts;
  }

  // Get recent high-intent activities
  getRecentHighIntentActivities(limit: number = 10): Array<{
    customerId: string;
    activity: string;
    timestamp: Date;
    intentLevel: number;
  }> {
    const activities: Array<{
      customerId: string;
      activity: string;
      timestamp: Date;
      intentLevel: number;
    }> = [];

    Array.from(this.journeys.values()).forEach(journey => {
      journey.signals
        .filter(signal => signal.strength >= 85)
        .forEach(signal => {
          activities.push({
            customerId: journey.customerId,
            activity: signal.signal,
            timestamp: signal.timestamp,
            intentLevel: signal.strength
          });
        });
    });

    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}

export const lifecycleTracker = new CustomerLifecycleTracker();