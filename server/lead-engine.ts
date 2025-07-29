import { db } from "./db";
import { marketLeads, leadActivity, leadAlerts, leadSources, intentScores } from "../shared/lead-schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import type { 
  MarketLead, 
  InsertMarketLead, 
  LeadActivity, 
  InsertLeadActivity,
  LeadAlert,
  InsertLeadAlert 
} from "../shared/lead-schema";

// ML Intent Analysis Engine
export class LeadIntelligenceEngine {
  
  // Analyze lead content and calculate intent score
  static analyzeLeadIntent(postContent: string, metadata: any = {}): number {
    if (!postContent) return 0;
    
    const content = postContent.toLowerCase();
    let score = 0;
    
    // High intent signals (20-30 points each)
    const highIntentSignals = [
      'looking to buy', 'need to buy', 'ready to purchase', 'buying this week',
      'financing approved', 'trade in value', 'best price', 'negotiate',
      'test drive today', 'available now', 'in stock', 'cash offer'
    ];
    
    // Medium intent signals (10-15 points each)
    const mediumIntentSignals = [
      'shopping for', 'comparing prices', 'looking at', 'interested in',
      'thinking about', 'considering', 'researching', 'reviews',
      'reliability', 'mpg', 'features', 'warranty'
    ];
    
    // Low intent signals (5-10 points each)
    const lowIntentSignals = [
      'car', 'vehicle', 'auto', 'dealership', 'dealer',
      'honda', 'toyota', 'ford', 'chevy', 'nissan'
    ];
    
    // Urgency multipliers
    const urgencySignals = [
      'today', 'this week', 'asap', 'immediately', 'urgent',
      'need soon', 'by friday', 'end of month'
    ];
    
    // Calculate base score
    highIntentSignals.forEach(signal => {
      if (content.includes(signal)) score += 25;
    });
    
    mediumIntentSignals.forEach(signal => {
      if (content.includes(signal)) score += 12;
    });
    
    lowIntentSignals.forEach(signal => {
      if (content.includes(signal)) score += 7;
    });
    
    // Apply urgency multiplier
    let hasUrgency = false;
    urgencySignals.forEach(signal => {
      if (content.includes(signal)) {
        hasUrgency = true;
      }
    });
    
    if (hasUrgency) {
      score = Math.min(score * 1.5, 100);
    }
    
    // Negative signals (reduce score)
    const negativeSignals = [
      'not interested', 'just looking', 'maybe someday', 'in a few years',
      'not ready', 'just browsing', 'window shopping'
    ];
    
    negativeSignals.forEach(signal => {
      if (content.includes(signal)) score = Math.max(score - 20, 0);
    });
    
    return Math.min(Math.round(score), 100);
  }
  
  // Determine lifecycle stage based on content and behavior
  static determineLifecycleStage(intentScore: number, postContent: string): string {
    const content = postContent.toLowerCase();
    
    // Purchase stage indicators
    if (intentScore > 80 || 
        content.includes('ready to buy') || 
        content.includes('financing approved') ||
        content.includes('test drive today')) {
      return 'purchase';
    }
    
    // Intent stage indicators
    if (intentScore > 60 || 
        content.includes('shopping for') ||
        content.includes('comparing') ||
        content.includes('best price')) {
      return 'intent';
    }
    
    // Consideration stage indicators
    if (intentScore > 30 || 
        content.includes('thinking about') ||
        content.includes('considering') ||
        content.includes('researching')) {
      return 'consideration';
    }
    
    // Default to awareness
    return 'awareness';
  }
  
  // Extract vehicle interests from content
  static extractVehicleInterests(postContent: string): string[] {
    const content = postContent.toLowerCase();
    const interests: string[] = [];
    
    // Common car models and brands
    const vehicles = [
      'honda civic', 'toyota camry', 'ford f-150', 'chevy silverado',
      'nissan altima', 'hyundai elantra', 'mazda cx-5', 'subaru outback',
      'bmw 3 series', 'audi a4', 'mercedes c-class', 'lexus es',
      'pickup truck', 'suv', 'sedan', 'hatchback', 'coupe', 'convertible'
    ];
    
    vehicles.forEach(vehicle => {
      if (content.includes(vehicle)) {
        interests.push(vehicle);
      }
    });
    
    return interests;
  }
  
  // Check if lead should trigger an alert
  static shouldTriggerAlert(lead: MarketLead): { trigger: string; message: string; priority: string } | null {
    const score = lead.intentScore || 0;
    
    // Critical - Ready to purchase
    if (score >= 85) {
      return {
        trigger: 'high_intent_purchase',
        message: `${lead.name} shows ${score}% purchase intent - Contact immediately!`,
        priority: 'critical'
      };
    }
    
    // High - Shopping actively
    if (score >= 70) {
      return {
        trigger: 'active_shopping',
        message: `${lead.name} is actively shopping with ${score}% intent - High priority follow-up needed`,
        priority: 'high' 
      };
    }
    
    // Medium - Considering purchase
    if (score >= 50) {
      return {
        trigger: 'consideration_stage',
        message: `${lead.name} is in consideration stage with ${score}% intent - Follow up recommended`,
        priority: 'medium'
      };
    }
    
    return null;
  }
}

// Lead Storage Service
export class LeadStorageService {
  
  // Create or update a market lead
  static async upsertLead(leadData: InsertMarketLead): Promise<MarketLead> {
    // Calculate ML scores
    const intentScore = LeadIntelligenceEngine.analyzeLeadIntent(leadData.postContent || '');
    const lifecycleStage = LeadIntelligenceEngine.determineLifecycleStage(intentScore, leadData.postContent || '');
    const vehicleInterest = LeadIntelligenceEngine.extractVehicleInterests(leadData.postContent || '');
    
    // Prepare lead data with ML analysis
    const enhancedLeadData = {
      ...leadData,
      intentScore,
      lifecycleStage,
      vehicleInterest,
      updatedAt: new Date(),
    };
    
    // Check if lead already exists (by email or contact info)
    let existingLead = null;
    if (leadData.email) {
      [existingLead] = await db.select().from(marketLeads).where(eq(marketLeads.email, leadData.email));
    }
    
    let lead: MarketLead;
    
    if (existingLead) {
      // Update existing lead
      [lead] = await db
        .update(marketLeads)
        .set(enhancedLeadData)
        .where(eq(marketLeads.id, existingLead.id))
        .returning();
    } else {
      // Create new lead
      [lead] = await db
        .insert(marketLeads)
        .values(enhancedLeadData)
        .returning();
    }
    
    // Add activity record
    await this.addLeadActivity(lead.id, {
      type: 'lead_captured',
      detail: `Lead captured from ${leadData.source}`,
      source: leadData.source,
      confidence: 95,
      metadata: { originalContent: leadData.postContent }
    });
    
    // Check if we should create an alert
    const alertData = LeadIntelligenceEngine.shouldTriggerAlert(lead);
    if (alertData) {
      await this.createAlert(lead.id, alertData);
    }
    
    return lead;
  }
  
  // Add lead activity
  static async addLeadActivity(leadId: string, activity: Omit<InsertLeadActivity, 'leadId'>): Promise<LeadActivity> {
    const [newActivity] = await db
      .insert(leadActivity)
      .values({
        leadId,
        ...activity,
      })
      .returning();
    
    return newActivity;
  }
  
  // Create alert
  static async createAlert(leadId: string, alertData: { trigger: string; message: string; priority: string }): Promise<LeadAlert> {
    const [alert] = await db
      .insert(leadAlerts)
      .values({
        leadId,
        ...alertData,
      })
      .returning();
    
    return alert;
  }
  
  // Get all market leads with pagination
  static async getMarketLeads(page = 1, limit = 50, filters: any = {}) {
    const baseQuery = db.select().from(marketLeads);
    
    const leads = await baseQuery
      .orderBy(desc(marketLeads.intentScore), desc(marketLeads.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);
    
    return leads;
  }
  
  // Get lead with activity
  static async getLeadWithActivity(leadId: string) {
    const [lead] = await db.select().from(marketLeads).where(eq(marketLeads.id, leadId));
    
    if (!lead) return null;
    
    const activities = await db
      .select()
      .from(leadActivity)
      .where(eq(leadActivity.leadId, leadId))
      .orderBy(desc(leadActivity.timestamp));
    
    return { ...lead, activities };
  }
  
  // Get active alerts
  static async getActiveAlerts(limit = 20) {
    return await db
      .select({
        alert: leadAlerts,
        lead: marketLeads,
      })
      .from(leadAlerts)
      .innerJoin(marketLeads, eq(leadAlerts.leadId, marketLeads.id))
      .where(eq(leadAlerts.status, 'new'))
      .orderBy(desc(leadAlerts.createdAt))
      .limit(limit);
  }
  
  // Get lead analytics
  static async getLeadAnalytics() {
    const totalLeads = await db.$count(marketLeads);
    const highIntentLeads = await db.$count(marketLeads, gte(marketLeads.intentScore, 70));
    const readyToBuyLeads = await db.$count(marketLeads, gte(marketLeads.intentScore, 85));
    const activeAlerts = await db.$count(leadAlerts, eq(leadAlerts.status, 'new'));
    const convertedLeads = await db.$count(marketLeads, eq(marketLeads.isConverted, true));
    
    // Get leads by lifecycle stage
    const stageDistribution = await db
      .select({
        stage: marketLeads.lifecycleStage,
        count: sql<number>`count(*)`,
      })
      .from(marketLeads)
      .groupBy(marketLeads.lifecycleStage);
    
    return {
      totalLeads,
      highIntentLeads,
      readyToBuyLeads,
      activeAlerts,
      convertedLeads,
      conversionRate: totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0,
      stageDistribution,
    };
  }
}

// Sample lead data for testing
export const sampleLeadData: InsertMarketLead[] = [
  {
    name: "Jessica Park",
    email: "jessica.park@email.com",
    phone: "(555) 123-4567",
    source: "reddit.com/r/cars",
    sourceUrl: "https://reddit.com/r/cars/comments/abc123",
    postContent: "Looking to buy a reliable Honda Civic this week. Have financing approved and ready to make a deal. Anyone know best dealerships in Austin area?",
    region: "Austin, TX",
    budgetRange: "$25,000-$30,000",
    timeframe: "this week",
  },
  {
    name: "Mike Rodriguez", 
    email: "mrod87@email.com",
    source: "cars.com/forum",
    sourceUrl: "https://cars.com/forum/topic/456789",
    postContent: "Shopping for a family SUV. Comparing Toyota Highlander vs Honda Pilot. Need 3rd row seating and good mpg. Test driving both this weekend.",
    region: "Dallas, TX",
    budgetRange: "$35,000-$45,000", 
    timeframe: "next 2 weeks",
  },
  {
    name: "Sarah Chen",
    email: "sarah.chen.99@email.com",
    source: "facebook.com/marketplace",
    postContent: "Need a pickup truck for work. Looking at Ford F-150 vs Chevy Silverado. Which has better towing capacity? Want to buy end of month.",
    region: "Houston, TX",
    budgetRange: "$40,000-$55,000",
    timeframe: "end of month",
  },
  {
    name: "David Wilson",
    contact: "@dwilson_cars",
    source: "twitter.com",
    postContent: "Just browsing car lots today. Maybe thinking about upgrading my sedan to something newer. Not in a rush though.",
    region: "San Antonio, TX",
    budgetRange: "unknown",
    timeframe: "maybe next year",
  },
];