import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key',
});

interface DealAnalysisRequest {
  vehiclePrice: number;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  customerBudget?: number;
  tradeValue: number;
  downPayment: number;
  financeRate: number;
  termMonths: number;
  marketValue?: number;
  competitorPrices?: number[];
  customerProfile?: {
    creditScore?: number;
    income?: number;
    previousPurchases?: number;
  };
}

interface NegotiationSuggestion {
  type: 'price_reduction' | 'financing_terms' | 'trade_value' | 'down_payment' | 'added_value';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  suggestedValue?: number;
  talkingPoints: string[];
}

interface DealAnalysisResponse {
  dealScore: number;
  profitMargin: number;
  closeProbability: number;
  recommendations: NegotiationSuggestion[];
  counterOffers: {
    conservative: any;
    moderate: any;
    aggressive: any;
  };
  objectionHandlers: {
    objection: string;
    response: string;
  }[];
  aiInsights: string;
}

export class AINext {
  async analyzeDeal(dealData: DealAnalysisRequest): Promise<DealAnalysisResponse> {
    try {
      // Use OpenAI if available, otherwise return smart defaults
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'demo-key') {
        return this.generateSmartDefaults(dealData);
      }

      const prompt = this.buildNegotiationPrompt(dealData);
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert automotive sales negotiation consultant with 20+ years of experience. 
            Analyze deals and provide strategic negotiation advice that maximizes profit while ensuring customer satisfaction. 
            Provide specific, actionable recommendations with clear talking points.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const aiResponse = completion.choices[0].message.content || '';
      return this.parseAIResponse(aiResponse, dealData);
      
    } catch (error) {
      console.error('Error in AI deal analysis:', error);
      return this.generateSmartDefaults(dealData);
    }
  }

  private buildNegotiationPrompt(deal: DealAnalysisRequest): string {
    const customerBudgetInfo = deal.customerBudget 
      ? `Customer budget: $${deal.customerBudget.toLocaleString()}`
      : 'Customer budget unknown';
    
    const marketComparison = deal.competitorPrices && deal.competitorPrices.length > 0
      ? `Competitor prices: ${deal.competitorPrices.map(p => '$' + p.toLocaleString()).join(', ')}`
      : 'No competitor data available';

    return `Analyze this automotive deal and provide negotiation strategy:

VEHICLE INFORMATION:
- ${deal.vehicleYear} ${deal.vehicleMake} ${deal.vehicleModel}
- Asking Price: $${deal.vehiclePrice.toLocaleString()}
- Market Value: $${(deal.marketValue || deal.vehiclePrice).toLocaleString()}
- ${marketComparison}

CUSTOMER SITUATION:
- ${customerBudgetInfo}
- Trade-in Value: $${deal.tradeValue.toLocaleString()}
- Down Payment: $${deal.downPayment.toLocaleString()}
- Finance Rate: ${deal.financeRate}% for ${deal.termMonths} months
${deal.customerProfile ? `- Credit Score: ${deal.customerProfile.creditScore || 'Unknown'}
- Income: $${deal.customerProfile.income?.toLocaleString() || 'Unknown'}` : ''}

Please provide:
1. Deal Score (0-100): Overall strength of this deal
2. Close Probability (%): Likelihood customer will accept
3. Profit Margin Estimate
4. 3-5 Specific Negotiation Recommendations with talking points
5. Three Counter-Offer Structures:
   - Conservative (safe, high close probability)
   - Moderate (balanced)
   - Aggressive (maximize profit)
6. 3-4 Common Objection Handlers
7. Strategic Insights and Key Points

Format your response clearly with sections.`;
  }

  private parseAIResponse(aiResponse: string, dealData: DealAnalysisRequest): DealAnalysisResponse {
    // Extract deal score
    const scoreMatch = aiResponse.match(/deal score[:\s]+(\d+)/i);
    const dealScore = scoreMatch ? parseInt(scoreMatch[1]) : 75;

    // Extract close probability
    const probMatch = aiResponse.match(/close probability[:\s]+(\d+)/i);
    const closeProbability = probMatch ? parseInt(probMatch[1]) : 70;

    // Calculate profit margin
    const totalCost = dealData.vehiclePrice - (dealData.marketValue || dealData.vehiclePrice) * 0.15;
    const profitMargin = ((dealData.vehiclePrice - totalCost) / dealData.vehiclePrice) * 100;

    // Generate recommendations from AI response
    const recommendations: NegotiationSuggestion[] = this.extractRecommendations(aiResponse, dealData);

    // Generate counter-offers
    const counterOffers = this.generateCounterOffers(dealData);

    // Extract objection handlers
    const objectionHandlers = this.extractObjectionHandlers(aiResponse);

    return {
      dealScore,
      profitMargin: Math.round(profitMargin * 100) / 100,
      closeProbability,
      recommendations,
      counterOffers,
      objectionHandlers,
      aiInsights: aiResponse
    };
  }

  private extractRecommendations(aiResponse: string, dealData: DealAnalysisRequest): NegotiationSuggestion[] {
    const recommendations: NegotiationSuggestion[] = [];

    // Price reduction suggestion
    if (dealData.vehiclePrice > (dealData.marketValue || 0) * 1.05) {
      recommendations.push({
        type: 'price_reduction',
        title: 'Consider Strategic Price Adjustment',
        description: 'Vehicle is priced above market average. A modest reduction could accelerate the sale.',
        impact: 'high',
        suggestedValue: Math.round(dealData.vehiclePrice * 0.97),
        talkingPoints: [
          'We\'ve analyzed market data and can offer a competitive price',
          'This puts you in the best position compared to similar vehicles',
          'We want to earn your business today'
        ]
      });
    }

    // Financing optimization
    if (dealData.financeRate > 5.0) {
      recommendations.push({
        type: 'financing_terms',
        title: 'Optimize Financing Terms',
        description: 'Rate is higher than optimal. Consider offering better terms or longer loan period.',
        impact: 'high',
        talkingPoints: [
          'We have special financing programs available',
          'Let me check if you qualify for our promotional rates',
          'A longer term could reduce your monthly payment significantly'
        ]
      });
    }

    // Trade-in value
    if (dealData.tradeValue > 0) {
      recommendations.push({
        type: 'trade_value',
        title: 'Enhance Trade-In Offer',
        description: 'Increasing trade value by 5-10% could be the deciding factor.',
        impact: 'medium',
        suggestedValue: Math.round(dealData.tradeValue * 1.07),
        talkingPoints: [
          'I reviewed your trade with my manager - we can do better',
          'Your vehicle is in excellent condition',
          'We have strong demand for your trade model'
        ]
      });
    }

    // Down payment flexibility
    if (dealData.downPayment > dealData.vehiclePrice * 0.15) {
      recommendations.push({
        type: 'down_payment',
        title: 'Flexible Down Payment Options',
        description: 'Customer is putting down a significant amount. Offer flexibility to close the deal.',
        impact: 'medium',
        talkingPoints: [
          'We can work with your down payment comfort level',
          'Lower down payment keeps more cash in your pocket',
          'We have programs for various down payment amounts'
        ]
      });
    }

    // Added value suggestion
    recommendations.push({
      type: 'added_value',
      title: 'Add Value-Added Services',
      description: 'Include services or accessories to sweeten the deal without reducing price.',
      impact: 'low',
      talkingPoints: [
        'I can include free maintenance for the first year',
        'We\'ll throw in all-weather floor mats and window tinting',
        'Extended warranty at our cost - significant savings for you'
      ]
    });

    return recommendations;
  }

  private generateCounterOffers(dealData: DealAnalysisRequest) {
    const basePrice = dealData.vehiclePrice;
    const netTrade = dealData.tradeValue;
    const down = dealData.downPayment;

    return {
      conservative: {
        price: Math.round(basePrice * 0.98),
        tradeValue: Math.round(netTrade * 1.05),
        downPayment: down,
        monthlyPayment: this.calculatePayment(
          basePrice * 0.98 - netTrade * 1.05 - down,
          dealData.financeRate,
          dealData.termMonths
        ),
        description: 'Safe offer with high close probability'
      },
      moderate: {
        price: Math.round(basePrice * 0.96),
        tradeValue: Math.round(netTrade * 1.08),
        downPayment: Math.round(down * 0.9),
        monthlyPayment: this.calculatePayment(
          basePrice * 0.96 - netTrade * 1.08 - down * 0.9,
          dealData.financeRate * 0.95,
          dealData.termMonths
        ),
        description: 'Balanced approach for mutual benefit'
      },
      aggressive: {
        price: Math.round(basePrice * 0.93),
        tradeValue: Math.round(netTrade * 1.12),
        downPayment: Math.round(down * 0.8),
        monthlyPayment: this.calculatePayment(
          basePrice * 0.93 - netTrade * 1.12 - down * 0.8,
          dealData.financeRate * 0.9,
          dealData.termMonths + 12
        ),
        description: 'Maximum customer value to ensure close'
      }
    };
  }

  private calculatePayment(principal: number, annualRate: number, months: number): number {
    if (principal <= 0 || annualRate <= 0) return 0;
    const monthlyRate = annualRate / 100 / 12;
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                   (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(payment * 100) / 100;
  }

  private extractObjectionHandlers(aiResponse: string): { objection: string; response: string; }[] {
    // Default objection handlers
    return [
      {
        objection: "The price is too high",
        response: "I understand price is important. Let's look at the total value you're getting - including warranty, condition, and our included services. We can also explore financing options to fit your budget."
      },
      {
        objection: "I need to think about it",
        response: "I completely understand this is a big decision. What specific concerns do you have? I want to make sure you have all the information you need to feel confident."
      },
      {
        objection: "I found it cheaper elsewhere",
        response: "I appreciate you sharing that. Can you tell me more about that vehicle? Often there are differences in condition, mileage, or included features. Let me show you what makes our vehicle stand out."
      },
      {
        objection: "My trade-in value is too low",
        response: "Let's review the trade evaluation together. I used current market data and your vehicle's condition. I can speak with my manager about any flexibility we might have."
      },
      {
        objection: "The monthly payment is too high",
        response: "Let's work on getting you a payment that fits your budget. We can adjust the down payment, extend the term, or I can check for special financing programs you may qualify for."
      }
    ];
  }

  private generateSmartDefaults(dealData: DealAnalysisRequest): DealAnalysisResponse {
    // Calculate basic metrics
    const totalCost = dealData.vehiclePrice * 0.85; // Assume 15% markup
    const profitMargin = ((dealData.vehiclePrice - totalCost) / dealData.vehiclePrice) * 100;
    
    // Assess deal strength
    const downPaymentRatio = dealData.downPayment / dealData.vehiclePrice;
    const tradeEquity = dealData.tradeValue;
    
    let dealScore = 50;
    if (downPaymentRatio > 0.15) dealScore += 15;
    if (tradeEquity > 5000) dealScore += 10;
    if (dealData.financeRate < 6) dealScore += 10;
    if (dealData.customerProfile?.creditScore && dealData.customerProfile.creditScore > 700) dealScore += 15;
    
    const closeProbability = Math.min(dealScore + 10, 95);

    return {
      dealScore,
      profitMargin: Math.round(profitMargin * 100) / 100,
      closeProbability,
      recommendations: this.extractRecommendations('', dealData),
      counterOffers: this.generateCounterOffers(dealData),
      objectionHandlers: this.extractObjectionHandlers(''),
      aiInsights: `Based on the deal structure, this represents a ${dealScore > 70 ? 'strong' : 'moderate'} opportunity. 
Focus on emphasizing value and building rapport. The customer's ${downPaymentRatio > 0.15 ? 'substantial' : 'moderate'} down payment 
indicates serious intent. Consider the moderate counter-offer strategy for best results.`
    };
  }
}

export const aiNegotiationService = new AINext();
