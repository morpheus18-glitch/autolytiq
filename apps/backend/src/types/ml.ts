export interface LeadMetadataPayload {
  id: string;
  status?: string | null;
  source?: string | null;
  priority?: string | null;
  rating?: number | null;
  tags: string[];
  createdAt?: string;
  assignedToId?: string | null;
  ownerId?: string | null;
  latestScore?: number | null;
  stage?: string | null;
}

export interface ActivityAggregatePayload {
  emailOpens: number;
  emailClicks: number;
  calls: number;
  sms: number;
  websiteVisits: number;
  meetings: number;
  inboundResponses: number;
  totalInteractions: number;
  last7DayInteractions: number;
  previous7DayInteractions: number;
}

export interface TimetableInsightsPayload {
  daysInPipeline: number;
  hoursSinceLastActivity: number | null;
  lastInteractionDays: number | null;
  nextActionAt?: string | null;
  upcomingAppointmentInHours: number | null;
  engagementMomentum: number | null;
}

export interface BudgetSignalsPayload {
  hasBudget: boolean;
  estimatedBudget?: number | null;
  tradeIn: boolean;
  financingInterest: boolean;
  priority?: string | null;
  rating?: number | null;
}

export interface SimilaritySignalsPayload {
  score: number;
  sampleSize: number;
  sourceMatchRate: number;
  priorityMatchRate: number;
  tagOverlapRate: number;
}

export interface LeadScoreFactor {
  metric: string;
  score: number;
  weight: number;
  reason: string;
}

export interface LeadFeaturePayload {
  leadId: string;
  requestId?: string;
  tenantId?: string;
  metadata: LeadMetadataPayload;
  activities: ActivityAggregatePayload;
  timetable: TimetableInsightsPayload;
  budgetSignals: BudgetSignalsPayload;
  similarity: SimilaritySignalsPayload;
}

export interface LeadScoreResponsePayload {
  score: number;
  engagementScore: number;
  urgencyScore: number;
  qualificationScore: number;
  behaviorScore: number;
  factors: LeadScoreFactor[];
  confidence: number;
  requestId: string;
}

export interface NextActionRecommendationPayload {
  title: string;
  description: string;
  channel: string;
  cadences: string[];
}

export interface NextActionResponsePayload {
  requestId: string;
  primary: NextActionRecommendationPayload;
  alternates: NextActionRecommendationPayload[];
  why: string[];
  talkTracks: Record<string, unknown>[];
}

export interface SentimentMessagePayload {
  speaker: string;
  text: string;
  timestamp?: string;
}

export interface SentimentRequestPayload {
  text?: string;
  messages?: SentimentMessagePayload[];
  requestId?: string;
  tenantId?: string;
}

export interface SentimentResponsePayload {
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  confidence: number;
  keyPhrases: string[];
  requestId: string;
}

export interface LeadInsightsPayload extends LeadFeaturePayload {
  derivedEngagementScore: number;
  latestScore?: {
    score: number;
    createdAt: string;
  } | null;
}
