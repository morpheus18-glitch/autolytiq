/**
 * ML Service Integration for AI Deal Optimization
 *
 * Connects to Python FastAPI ML service for deal recommendations
 */

export interface DealOptimizationRequest {
  customer: {
    creditScore: number;
    annualIncome?: number;
    employmentStatus?: string;
    housingStatus?: string;
    monthlyHousingPayment?: number;
    monthlyDebtPayments?: number;
  };
  vehicle: {
    vin?: string;
    year: number;
    make: string;
    model: string;
    mileage?: number;
    cost: number;
    marketPrice: number;
  };
  currentStructure: {
    salePrice: number;
    downPayment: number;
    tradeValue: number;
    tradePayoff: number;
    term: number;
    apr: number;
    warranty?: number;
    gap?: number;
    maintenance?: number;
  };
  constraints?: {
    minGrossProfit?: number;
    maxLTV?: number;
    maxPTI?: number;
    minTermMonths?: number;
    maxTermMonths?: number;
  };
}

export interface DealRecommendation {
  type: 'max_profit' | 'best_close' | 'balanced';
  label: string;
  structure: {
    salePrice?: number;
    downPayment?: number;
    tradeAllowance?: number;
    term?: number;
    apr?: number;
    warranty?: number;
    gap?: number;
    maintenance?: number;
  };
  metrics: {
    monthlyPayment: number;
    grossProfit: number;
    frontEndProfit: number;
    backEndProfit: number;
    totalProfit: number;
    closeProb: number;
    approvalProb: number;
    dealCloseProb: number;
  };
  reasoning: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface DealOptimizationResponse {
  recommendations: DealRecommendation[];
  sensitivityAnalysis: {
    downPaymentRange: Array<{
      amount: number;
      closeProb: number;
      profit: number;
    }>;
    termRange: Array<{
      months: number;
      payment: number;
      closeProb: number;
      profit: number;
    }>;
  };
  warnings: Array<{
    type: 'HIGH_LTV' | 'HIGH_PTI' | 'LOW_APPROVAL' | 'HIGH_PAYMENT';
    severity: 'high' | 'medium' | 'low';
    message: string;
  }>;
  metadata: {
    structuresEvaluated: number;
    executionTimeMs: number;
    modelVersion: string;
    confidence: 'high' | 'medium' | 'low';
  };
}

/**
 * Get AI-powered deal optimization recommendations
 */
export async function optimizeDeal(
  request: DealOptimizationRequest
): Promise<DealOptimizationResponse> {
  try {
    const response = await fetch('/api/ml/optimize-deal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('ML optimization error');
    }

    return await response.json();
  } catch (error) {
    console.error('ML optimization error:', error);

    // Return fallback recommendations
    return generateFallbackRecommendations(request);
  }
}

/**
 * Predict deal close probability
 */
export async function predictCloseProb(deal: {
  customerCreditScore: number;
  monthlyPayment: number;
  downPayment: number;
  term: number;
}): Promise<number> {
  try {
    const response = await fetch('/api/ml/predict-close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deal),
    });

    if (!response.ok) {
      throw new Error('Close prediction error');
    }

    const data = await response.json();
    return data.probability;
  } catch (error) {
    console.error('Close prediction error:', error);

    // Fallback heuristic
    return predictCloseProbFallback(deal);
  }
}

/**
 * Predict lender approval probability
 */
export async function predictApprovalProb(deal: {
  customerCreditScore: number;
  loanAmount: number;
  apr: number;
  term: number;
  ltv: number;
}): Promise<number> {
  try {
    const response = await fetch('/api/ml/predict-approval', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deal),
    });

    if (!response.ok) {
      throw new Error('Approval prediction error');
    }

    const data = await response.json();
    return data.probability;
  } catch (error) {
    console.error('Approval prediction error:', error);

    // Fallback heuristic
    return predictApprovalProbFallback(deal);
  }
}

/**
 * Fallback deal optimization when ML service is unavailable
 */
function generateFallbackRecommendations(
  request: DealOptimizationRequest
): DealOptimizationResponse {
  const { currentStructure, customer, vehicle } = request;

  // Simple heuristics for recommendations
  const basePayment = calculateSimplePayment(
    currentStructure.salePrice,
    currentStructure.downPayment,
    currentStructure.tradeValue - currentStructure.tradePayoff,
    currentStructure.term,
    currentStructure.apr
  );

  const baseProfit = currentStructure.salePrice - vehicle.cost +
    (currentStructure.warranty || 0) * 0.3 +
    (currentStructure.gap || 0) * 0.3 +
    (currentStructure.maintenance || 0) * 0.3;

  const recommendations: DealRecommendation[] = [
    {
      type: 'max_profit',
      label: 'Maximum Profit',
      structure: {
        salePrice: currentStructure.salePrice + 500,
        downPayment: currentStructure.downPayment + 500,
        warranty: (currentStructure.warranty || 0) + 500,
      },
      metrics: {
        monthlyPayment: basePayment + 25,
        grossProfit: baseProfit + 750,
        frontEndProfit: currentStructure.salePrice - vehicle.cost + 500,
        backEndProfit: ((currentStructure.warranty || 0) + 500) * 0.3,
        totalProfit: baseProfit + 750,
        closeProb: 0.68,
        approvalProb: 0.89,
        dealCloseProb: 0.60,
      },
      reasoning: 'Increase price and warranty to maximize profit. Close probability drops slightly.',
      confidence: 'medium',
    },
    {
      type: 'best_close',
      label: 'Best Close Probability',
      structure: {
        downPayment: currentStructure.downPayment - 500,
        term: Math.min(currentStructure.term + 12, 84),
      },
      metrics: {
        monthlyPayment: basePayment - 75,
        grossProfit: baseProfit - 300,
        frontEndProfit: currentStructure.salePrice - vehicle.cost,
        backEndProfit: (currentStructure.warranty || 0) * 0.3,
        totalProfit: baseProfit - 300,
        closeProb: 0.87,
        approvalProb: 0.92,
        dealCloseProb: 0.80,
      },
      reasoning: 'Lower payment by extending term and reducing down payment. Higher close rate.',
      confidence: 'high',
    },
    {
      type: 'balanced',
      label: 'Balanced Approach',
      structure: {
        warranty: (currentStructure.warranty || 0) + 200,
      },
      metrics: {
        monthlyPayment: basePayment + 10,
        grossProfit: baseProfit + 200,
        frontEndProfit: currentStructure.salePrice - vehicle.cost,
        backEndProfit: ((currentStructure.warranty || 0) + 200) * 0.3,
        totalProfit: baseProfit + 200,
        closeProb: 0.78,
        approvalProb: 0.91,
        dealCloseProb: 0.71,
      },
      reasoning: 'Moderate warranty increase balances profit and close probability.',
      confidence: 'high',
    },
  ];

  return {
    recommendations,
    sensitivityAnalysis: {
      downPaymentRange: [
        { amount: currentStructure.downPayment - 1000, closeProb: 0.82, profit: baseProfit - 200 },
        { amount: currentStructure.downPayment, closeProb: 0.75, profit: baseProfit },
        { amount: currentStructure.downPayment + 1000, closeProb: 0.68, profit: baseProfit + 200 },
      ],
      termRange: [
        { months: 48, payment: basePayment + 100, closeProb: 0.65, profit: baseProfit },
        { months: 60, payment: basePayment, closeProb: 0.75, profit: baseProfit },
        { months: 72, payment: basePayment - 85, closeProb: 0.85, profit: baseProfit - 200 },
      ],
    },
    warnings: [],
    metadata: {
      structuresEvaluated: 100,
      executionTimeMs: 50,
      modelVersion: 'fallback-v1',
      confidence: 'low',
    },
  };
}

function calculateSimplePayment(
  price: number,
  down: number,
  netTrade: number,
  term: number,
  apr: number
): number {
  const financed = price - down - netTrade;
  const monthlyRate = apr / 100 / 12;
  return financed * (monthlyRate * Math.pow(1 + monthlyRate, term)) /
    (Math.pow(1 + monthlyRate, term) - 1);
}

function predictCloseProbFallback(deal: {
  customerCreditScore: number;
  monthlyPayment: number;
  downPayment: number;
  term: number;
}): number {
  let prob = 0.5;

  // Credit score factor
  if (deal.customerCreditScore >= 740) prob += 0.2;
  else if (deal.customerCreditScore >= 670) prob += 0.1;
  else if (deal.customerCreditScore < 580) prob -= 0.1;

  // Payment factor (assume customer can afford ~$500/mo)
  if (deal.monthlyPayment < 400) prob += 0.15;
  else if (deal.monthlyPayment > 600) prob -= 0.15;

  // Down payment factor
  if (deal.downPayment > 5000) prob += 0.1;
  else if (deal.downPayment < 2000) prob -= 0.1;

  return Math.max(0, Math.min(1, prob));
}

function predictApprovalProbFallback(deal: {
  customerCreditScore: number;
  loanAmount: number;
  ltv: number;
}): number {
  let prob = 0.5;

  // Credit score factor
  if (deal.customerCreditScore >= 740) prob += 0.3;
  else if (deal.customerCreditScore >= 670) prob += 0.2;
  else if (deal.customerCreditScore >= 580) prob += 0.1;
  else prob -= 0.2;

  // LTV factor
  if (deal.ltv < 1.0) prob += 0.1;
  else if (deal.ltv > 1.2) prob -= 0.1;

  // Loan amount factor
  if (deal.loanAmount < 20000) prob += 0.05;
  else if (deal.loanAmount > 50000) prob -= 0.05;

  return Math.max(0, Math.min(1, prob));
}
