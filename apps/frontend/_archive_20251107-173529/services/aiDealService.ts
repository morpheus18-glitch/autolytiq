/**
 * AI Deal Service API Client
 *
 * Provides AI-powered deal optimization and recommendations
 * Currently uses mock responses - will be replaced with real ML service calls
 */

export type RecommendationType = 'max_profit' | 'best_close' | 'balanced';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface CustomerOffer {
  desiredPayment: number;
  desiredDownPayment: number;
  notes?: string;
}

export interface DealStructure {
  salePrice: number;
  downPayment: number;
  term: number;
  apr: number;
  warranty: number;
  gap: number;
  maintenance: number;
  paintProtection: number;
  tradeValue?: number;
  tradePayoff?: number;
}

export interface DealMetrics {
  monthlyPayment: number;
  grossProfit: number;
  closeProb: number;
  approvalProb: number;
}

export interface AIRecommendation {
  type: RecommendationType;
  label: string;
  structure: DealStructure;
  metrics: DealMetrics;
  talkingPoint: string;
  confidence: ConfidenceLevel;
  reasoning: string;
}

export interface CustomerProfile {
  creditScore: number;
  monthlyIncome?: number;
  monthlyDebt?: number;
  previousDeals?: number;
  walkProbability: number;
}

export interface VehicleContext {
  vehicleId: string;
  vin?: string;
  daysInStock: number;
  currentPrice: number;
  cost: number;
  marketValue?: number;
}

export interface DealAnalysis {
  customerProfile: CustomerProfile;
  vehicleContext: VehicleContext;
  gapFromTarget: number;
  profitTarget: number;
  recommendations: AIRecommendation[];
  warnings: string[];
  insights: string[];
  dealHistory: DealHistoryInsight[];
}

export interface DealHistoryInsight {
  metric: string;
  value: string;
  description: string;
}

export interface OptimizationRequest {
  currentDeal: DealStructure;
  customerOffer?: CustomerOffer;
  customerProfile: CustomerProfile;
  vehicleContext: VehicleContext;
  constraints?: {
    minProfit?: number;
    maxPayment?: number;
    maxLTV?: number;
  };
}

/**
 * Get AI recommendations for a deal based on customer offer
 *
 * @param request - Optimization request with current deal and customer context
 * @returns AI analysis with recommendations
 */
export async function getAIRecommendations(
  request: OptimizationRequest
): Promise<DealAnalysis> {
  // Simulate network delay (50-200ms)
  await delay(50 + Math.random() * 150);

  const { currentDeal, customerOffer, customerProfile, vehicleContext, constraints } = request;

  // Calculate gap from customer offer
  const gapFromTarget = customerOffer
    ? calculatePaymentGap(currentDeal, customerOffer.desiredPayment)
    : 0;

  // Generate recommendations based on ML model (mocked)
  const recommendations = generateRecommendations(
    currentDeal,
    customerOffer,
    customerProfile,
    vehicleContext,
    constraints
  );

  // Generate warnings based on risk factors
  const warnings = generateWarnings(currentDeal, customerProfile, vehicleContext);

  // Generate insights
  const insights = generateInsights(currentDeal, customerProfile, recommendations);

  // Generate deal history insights
  const dealHistory = generateDealHistory(vehicleContext, customerProfile);

  return {
    customerProfile,
    vehicleContext,
    gapFromTarget,
    profitTarget: constraints?.minProfit || 2000,
    recommendations,
    warnings,
    insights,
    dealHistory,
  };
}

/**
 * Analyze deal structure and provide optimization suggestions
 */
export async function analyzeDealStructure(deal: DealStructure): Promise<{
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}> {
  await delay(50);

  const totalFI = deal.warranty + deal.gap + deal.maintenance + deal.paintProtection;
  const score = Math.min(100, 60 + (totalFI / 5000) * 40);

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];

  if (deal.warranty > 0) {
    strengths.push('Extended warranty included');
  } else {
    weaknesses.push('No warranty protection');
    suggestions.push('Add extended warranty ($2,495) to increase profit and customer value');
  }

  if (deal.gap > 0) {
    strengths.push('GAP insurance included');
  } else {
    suggestions.push('Consider adding GAP insurance ($595)');
  }

  if (deal.downPayment >= 3000) {
    strengths.push('Strong down payment');
  } else {
    weaknesses.push('Low down payment increases risk');
    suggestions.push('Negotiate higher down payment for better approval odds');
  }

  if (deal.term <= 60) {
    strengths.push('Conservative loan term');
  } else {
    weaknesses.push('Extended loan term (72+ months)');
  }

  return { score, strengths, weaknesses, suggestions };
}

/**
 * Calculate sensitivity analysis for key deal parameters
 */
export async function getSensitivityAnalysis(
  deal: DealStructure
): Promise<{
  parameter: string;
  currentValue: number;
  variations: Array<{
    value: number;
    payment: number;
    profit: number;
    closeProb: number;
  }>;
}[]> {
  await delay(100);

  // Mock sensitivity data
  return [
    {
      parameter: 'Down Payment',
      currentValue: deal.downPayment,
      variations: [
        { value: 2000, payment: 580, profit: 2100, closeProb: 0.75 },
        { value: 2500, payment: 560, profit: 2200, closeProb: 0.78 },
        { value: 3000, payment: 542, profit: 2300, closeProb: 0.82 },
        { value: 3500, payment: 522, profit: 2400, closeProb: 0.85 },
      ],
    },
    {
      parameter: 'Term (months)',
      currentValue: deal.term,
      variations: [
        { value: 48, payment: 680, profit: 2100, closeProb: 0.65 },
        { value: 60, payment: 580, profit: 2100, closeProb: 0.78 },
        { value: 72, payment: 505, profit: 2100, closeProb: 0.85 },
        { value: 84, payment: 450, profit: 2100, closeProb: 0.88 },
      ],
    },
  ];
}

// Helper functions

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculatePaymentGap(deal: DealStructure, targetPayment: number): number {
  // Simplified payment calculation for gap analysis
  const netTrade = (deal.tradeValue || 0) - (deal.tradePayoff || 0);
  const totalFI = deal.warranty + deal.gap + deal.maintenance + deal.paintProtection;
  const amountFinanced = deal.salePrice - deal.downPayment - netTrade + totalFI;

  // Rough payment estimate (more accurate with Rust service)
  const monthlyRate = deal.apr / 12 / 100;
  const payment = monthlyRate > 0
    ? amountFinanced * (monthlyRate * Math.pow(1 + monthlyRate, deal.term)) /
      (Math.pow(1 + monthlyRate, deal.term) - 1)
    : amountFinanced / deal.term;

  return payment - targetPayment;
}

function generateRecommendations(
  currentDeal: DealStructure,
  customerOffer: CustomerOffer | undefined,
  profile: CustomerProfile,
  vehicle: VehicleContext,
  constraints?: OptimizationRequest['constraints']
): AIRecommendation[] {
  const recommendations: AIRecommendation[] = [];

  // Max Profit Recommendation
  recommendations.push({
    type: 'max_profit',
    label: 'Maximum Profit',
    structure: {
      salePrice: vehicle.currentPrice + 500,
      downPayment: 3500,
      term: 60,
      apr: currentDeal.apr,
      warranty: 2495,
      gap: 595,
      maintenance: 0,
      paintProtection: 0,
      tradeValue: currentDeal.tradeValue,
      tradePayoff: currentDeal.tradePayoff,
    },
    metrics: {
      monthlyPayment: 525,
      grossProfit: 2850,
      closeProb: profile.creditScore >= 680 ? 0.62 : 0.52,
      approvalProb: profile.creditScore >= 680 ? 0.89 : 0.75,
    },
    talkingPoint: "We're close! To get to your payment, we just need a bit more down. This gets you the best warranty coverage too.",
    confidence: 'high',
    reasoning: 'Maximizes gross profit while maintaining reasonable close probability',
  });

  // Best Close Recommendation
  const bestClosePayment = customerOffer?.desiredPayment
    ? customerOffer.desiredPayment + 28
    : 478;

  recommendations.push({
    type: 'best_close',
    label: 'Best Close',
    structure: {
      salePrice: vehicle.currentPrice - 600,
      downPayment: 2500,
      term: 72,
      apr: currentDeal.apr,
      warranty: 0,
      gap: 0,
      maintenance: 0,
      paintProtection: 0,
      tradeValue: currentDeal.tradeValue,
      tradePayoff: currentDeal.tradePayoff,
    },
    metrics: {
      monthlyPayment: bestClosePayment,
      grossProfit: 1650,
      closeProb: 0.87,
      approvalProb: 0.92,
    },
    talkingPoint: customerOffer
      ? `I can't do $${customerOffer.desiredPayment}, but I can do $${bestClosePayment} right now with less down. This keeps it affordable and gets you approved fast.`
      : "I can do $478 right now with less down. This keeps it affordable and gets you approved fast.",
    confidence: 'high',
    reasoning: 'Optimizes for highest close probability while maintaining minimum profit',
  });

  // Balanced Recommendation
  recommendations.push({
    type: 'balanced',
    label: 'Balanced',
    structure: {
      salePrice: vehicle.currentPrice,
      downPayment: 3000,
      term: 60,
      apr: currentDeal.apr,
      warranty: 2495,
      gap: 595,
      maintenance: 0,
      paintProtection: 0,
      tradeValue: currentDeal.tradeValue,
      tradePayoff: currentDeal.tradePayoff,
    },
    metrics: {
      monthlyPayment: 502,
      grossProfit: 2275,
      closeProb: 0.74,
      approvalProb: 0.90,
    },
    talkingPoint: "Let's meet in the middle at $502. I'll throw in GAP insurance and warranty to protect your investment.",
    confidence: 'high',
    reasoning: 'Balanced approach optimizing both profit and close probability',
  });

  return recommendations;
}

function generateWarnings(
  deal: DealStructure,
  profile: CustomerProfile,
  vehicle: VehicleContext
): string[] {
  const warnings: string[] = [];

  const netTrade = (deal.tradeValue || 0) - (deal.tradePayoff || 0);
  const totalFI = deal.warranty + deal.gap + deal.maintenance + deal.paintProtection;
  const amountFinanced = deal.salePrice - deal.downPayment - netTrade + totalFI;
  const ltv = (amountFinanced / deal.salePrice) * 100;

  if (ltv > 95) {
    warnings.push(`High LTV (${ltv.toFixed(0)}%) - Consider larger down payment`);
  }

  if (profile.monthlyIncome) {
    const pti = ((deal.salePrice / deal.term) / profile.monthlyIncome) * 100;
    if (pti > 18) {
      warnings.push(`PTI approaching 20% - Customer is payment sensitive`);
    }
  }

  if (vehicle.daysInStock > 45) {
    warnings.push(`Vehicle aging (${vehicle.daysInStock} days) - Consider aggressive pricing`);
  }

  if (profile.creditScore < 650) {
    warnings.push('Subprime credit - Higher approval risk');
  }

  if (profile.walkProbability > 0.5) {
    warnings.push(`High walk probability (${(profile.walkProbability * 100).toFixed(0)}%)`);
  }

  return warnings;
}

function generateInsights(
  deal: DealStructure,
  profile: CustomerProfile,
  recommendations: AIRecommendation[]
): string[] {
  const insights: string[] = [];

  const profitRange = {
    min: Math.min(...recommendations.map(r => r.metrics.grossProfit)),
    max: Math.max(...recommendations.map(r => r.metrics.grossProfit)),
  };

  insights.push(
    `Profit range across strategies: ${formatCurrency(profitRange.min)} - ${formatCurrency(profitRange.max)}`
  );

  const bestClose = recommendations.find(r => r.type === 'best_close');
  if (bestClose) {
    insights.push(
      `Best close probability: ${(bestClose.metrics.closeProb * 100).toFixed(0)}% at $${bestClose.metrics.monthlyPayment}/mo`
    );
  }

  if (profile.creditScore >= 680) {
    insights.push('Strong credit profile enables flexible structuring');
  } else if (profile.creditScore < 620) {
    insights.push('Subprime credit may require higher down payment or co-signer');
  }

  return insights;
}

function generateDealHistory(
  vehicle: VehicleContext,
  profile: CustomerProfile
): DealHistoryInsight[] {
  return [
    {
      metric: 'Similar Deals',
      value: '12 closed',
      description: 'On this vehicle type',
    },
    {
      metric: 'Average Close',
      value: '$482/mo, $2,300 down',
      description: 'Typical deal structure',
    },
    {
      metric: 'Close Rate',
      value: '68%',
      description: 'With 72-month term',
    },
    {
      metric: 'Days to Close',
      value: '4.2 days',
      description: 'Average negotiation time',
    },
  ];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
