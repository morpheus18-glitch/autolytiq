import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface DealOptimizationRequest {
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    msrp: number;
    cost: number;
    marketValue?: number;
  };
  customerInfo: {
    creditTier?: string;
    monthlyBudget?: number;
    downPayment: number;
  };
  currentDeal: {
    salePrice: number;
    tradeValue: number;
    tradePayoff: number;
    term: number;
    apr: number;
    products: Array<{
      name: string;
      retailPrice: number;
      cost: number;
    }>;
  };
  marketData?: {
    competitorPricing: number;
    avgDaysOnMarket: number;
  };
}

export interface DealOptimization {
  healthScore: number;
  closingProbability: number;
  recommendations: {
    pricing: {
      suggested: number;
      reasoning: string;
      competitivePosition: string;
    };
    products: Array<{
      name: string;
      shouldInclude: boolean;
      suggestedRetail: number;
      reasoning: string;
    }>;
    financing: {
      optimalTerm: number;
      paymentReduction: number;
      reasoning: string;
    };
  };
  negotiationStrategy: {
    strengths: string[];
    objectionHandlers: Array<{
      objection: string;
      response: string;
    }>;
    closingTechniques: string[];
  };
  profitOptimization: {
    currentProfit: number;
    optimizedProfit: number;
    improvements: Array<{
      area: string;
      opportunity: number;
      action: string;
    }>;
  };
}

export class AIDealOptimizer {
  private static instance: AIDealOptimizer;

  static getInstance(): AIDealOptimizer {
    if (!this.instance) {
      this.instance = new AIDealOptimizer();
    }
    return this.instance;
  }

  async optimizeDeal(request: DealOptimizationRequest): Promise<DealOptimization> {
    try {
      const prompt = this.buildOptimizationPrompt(request);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert automotive F&I manager and deal structuring specialist with 20+ years of experience. 
            You excel at maximizing profitability while ensuring deals close successfully. You understand market dynamics, 
            customer psychology, and optimal product penetration. Provide data-driven, actionable recommendations in JSON format.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2000
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      return this.formatOptimization(result, request);
    } catch (error) {
      console.error('AI optimization error:', error);
      return this.getFallbackOptimization(request);
    }
  }

  private buildOptimizationPrompt(request: DealOptimizationRequest): string {
    const { vehicleInfo, customerInfo, currentDeal, marketData } = request;
    
    const frontProfit = currentDeal.salePrice - vehicleInfo.cost;
    const backProfit = currentDeal.products.reduce((sum, p) => sum + (p.retailPrice - p.cost), 0);
    const totalProfit = frontProfit + backProfit;
    
    const netTrade = currentDeal.tradeValue - currentDeal.tradePayoff;
    const amountFinanced = currentDeal.salePrice + 
      currentDeal.products.reduce((sum, p) => sum + p.retailPrice, 0) - 
      netTrade - customerInfo.downPayment;
    
    const monthlyRate = (currentDeal.apr / 100) / 12;
    const monthlyPayment = amountFinanced * 
      (monthlyRate * Math.pow(1 + monthlyRate, currentDeal.term)) / 
      (Math.pow(1 + monthlyRate, currentDeal.term) - 1);

    return `Analyze this automotive deal and provide optimization recommendations in JSON format:

VEHICLE: ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}
- MSRP: $${vehicleInfo.msrp.toLocaleString()}
- Dealer Cost: $${vehicleInfo.cost.toLocaleString()}
- Current Sale Price: $${currentDeal.salePrice.toLocaleString()}
${marketData ? `- Market Value: $${marketData.competitorPricing.toLocaleString()}` : ''}
${marketData ? `- Avg Days on Market: ${marketData.avgDaysOnMarket}` : ''}

CUSTOMER:
${customerInfo.creditTier ? `- Credit Tier: ${customerInfo.creditTier}` : ''}
${customerInfo.monthlyBudget ? `- Monthly Budget: $${customerInfo.monthlyBudget}` : ''}
- Down Payment: $${customerInfo.downPayment.toLocaleString()}

CURRENT DEAL:
- Trade Value: $${currentDeal.tradeValue.toLocaleString()}
- Trade Payoff: $${currentDeal.tradePayoff.toLocaleString()}
- Net Trade: $${netTrade.toLocaleString()}
- Financing: ${currentDeal.term} months @ ${currentDeal.apr}% APR
- Monthly Payment: $${Math.round(monthlyPayment).toLocaleString()}
- Front-End Profit: $${frontProfit.toLocaleString()}
- Back-End Profit: $${backProfit.toLocaleString()}
- Total Profit: $${totalProfit.toLocaleString()}

BACKEND PRODUCTS:
${currentDeal.products.map(p => `- ${p.name}: $${p.retailPrice} (cost: $${p.cost})`).join('\n')}

Provide JSON response with this structure:
{
  "healthScore": <0-100>,
  "closingProbability": <0-100>,
  "recommendations": {
    "pricing": {
      "suggested": <number>,
      "reasoning": "<why this price>",
      "competitivePosition": "<market position>"
    },
    "products": [
      {
        "name": "<product name>",
        "shouldInclude": <boolean>,
        "suggestedRetail": <number>,
        "reasoning": "<why include/exclude>"
      }
    ],
    "financing": {
      "optimalTerm": <number>,
      "paymentReduction": <number>,
      "reasoning": "<financing strategy>"
    }
  },
  "negotiationStrategy": {
    "strengths": ["<strength 1>", "<strength 2>"],
    "objectionHandlers": [
      {
        "objection": "<common objection>",
        "response": "<how to respond>"
      }
    ],
    "closingTechniques": ["<technique 1>", "<technique 2>"]
  },
  "profitOptimization": {
    "currentProfit": ${totalProfit},
    "optimizedProfit": <projected profit>,
    "improvements": [
      {
        "area": "<what to improve>",
        "opportunity": <dollar amount>,
        "action": "<specific action>"
      }
    ]
  }
}

Focus on realistic, ethical recommendations that balance profit with customer satisfaction and deal closure.`;
  }

  private formatOptimization(result: any, request: DealOptimizationRequest): DealOptimization {
    return {
      healthScore: result.healthScore || 0,
      closingProbability: result.closingProbability || 0,
      recommendations: {
        pricing: result.recommendations?.pricing || {
          suggested: request.currentDeal.salePrice,
          reasoning: 'Current pricing maintained',
          competitivePosition: 'Market aligned'
        },
        products: result.recommendations?.products || [],
        financing: result.recommendations?.financing || {
          optimalTerm: request.currentDeal.term,
          paymentReduction: 0,
          reasoning: 'Current terms optimal'
        }
      },
      negotiationStrategy: {
        strengths: result.negotiationStrategy?.strengths || [],
        objectionHandlers: result.negotiationStrategy?.objectionHandlers || [],
        closingTechniques: result.negotiationStrategy?.closingTechniques || []
      },
      profitOptimization: {
        currentProfit: result.profitOptimization?.currentProfit || 0,
        optimizedProfit: result.profitOptimization?.optimizedProfit || 0,
        improvements: result.profitOptimization?.improvements || []
      }
    };
  }

  private getFallbackOptimization(request: DealOptimizationRequest): DealOptimization {
    const frontProfit = request.currentDeal.salePrice - request.vehicleInfo.cost;
    const backProfit = request.currentDeal.products.reduce((sum, p) => sum + (p.retailPrice - p.cost), 0);
    const totalProfit = frontProfit + backProfit;

    // Simple rule-based scoring when AI is unavailable
    let healthScore = 50;
    if (frontProfit > 2000) healthScore += 20;
    if (backProfit > 1500) healthScore += 20;
    if (request.customerInfo.downPayment > 3000) healthScore += 10;

    return {
      healthScore: Math.min(healthScore, 100),
      closingProbability: healthScore - 10,
      recommendations: {
        pricing: {
          suggested: request.currentDeal.salePrice,
          reasoning: 'AI optimization temporarily unavailable. Current pricing maintained.',
          competitivePosition: 'Review market data for positioning'
        },
        products: request.currentDeal.products.map(p => ({
          name: p.name,
          shouldInclude: true,
          suggestedRetail: p.retailPrice,
          reasoning: 'Product mix under review'
        })),
        financing: {
          optimalTerm: request.currentDeal.term,
          paymentReduction: 0,
          reasoning: 'Current financing terms maintained'
        }
      },
      negotiationStrategy: {
        strengths: [
          'Competitive market pricing',
          'Comprehensive warranty options',
          'Flexible financing available'
        ],
        objectionHandlers: [
          {
            objection: 'Price is too high',
            response: 'Let me show you the total value including our warranty coverage and service benefits'
          },
          {
            objection: 'Monthly payment concerns',
            response: 'We have flexible term options - let\'s find a payment that fits your budget'
          }
        ],
        closingTechniques: [
          'Focus on total value, not just price',
          'Emphasize protection and peace of mind',
          'Create urgency with limited-time incentives'
        ]
      },
      profitOptimization: {
        currentProfit: totalProfit,
        optimizedProfit: totalProfit,
        improvements: []
      }
    };
  }

  async analyzeDealHealth(request: Pick<DealOptimizationRequest, 'vehicleInfo' | 'currentDeal'>): Promise<{
    score: number;
    factors: Array<{ factor: string; impact: 'positive' | 'negative' | 'neutral'; description: string }>;
  }> {
    const frontProfit = request.currentDeal.salePrice - request.vehicleInfo.cost;
    const backProfit = request.currentDeal.products.reduce((sum, p) => sum + (p.retailPrice - p.cost), 0);
    
    const factors = [];
    let score = 50;

    if (frontProfit > 3000) {
      factors.push({
        factor: 'Strong Front-End Profit',
        impact: 'positive' as const,
        description: `$${frontProfit.toLocaleString()} front gross exceeds target`
      });
      score += 15;
    } else if (frontProfit < 1000) {
      factors.push({
        factor: 'Low Front-End Profit',
        impact: 'negative' as const,
        description: `$${frontProfit.toLocaleString()} front gross below target`
      });
      score -= 15;
    }

    if (backProfit > 2000) {
      factors.push({
        factor: 'Excellent Backend Penetration',
        impact: 'positive' as const,
        description: `$${backProfit.toLocaleString()} in F&I products`
      });
      score += 20;
    } else if (backProfit < 500) {
      factors.push({
        factor: 'Low Product Penetration',
        impact: 'negative' as const,
        description: 'Opportunity to add protective products'
      });
      score -= 10;
    }

    if (request.currentDeal.products.length >= 3) {
      factors.push({
        factor: 'Multiple Product Coverage',
        impact: 'positive' as const,
        description: `${request.currentDeal.products.length} products protect customer investment`
      });
      score += 10;
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      factors
    };
  }
}

export const aiDealOptimizer = AIDealOptimizer.getInstance();
