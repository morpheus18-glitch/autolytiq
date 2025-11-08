/**
 * Rust Pricing Service Integration
 *
 * Connects to Rust gRPC pricing engine for real-time payment calculations
 */

interface PaymentCalculationRequest {
  vehiclePrice: number;
  downPayment: number;
  tradeValue: number;
  tradePayoff: number;
  apr: number;
  term: number;
  addOns: number;
}

interface PaymentCalculationResponse {
  monthlyPayment: number;
  totalFinanced: number;
  totalInterest: number;
  totalCost: number;
}

/**
 * Calculate monthly payment using Rust pricing engine
 *
 * TODO: Replace with actual gRPC call to Rust service
 * Currently uses HTTP endpoint as bridge
 */
export async function calculatePayment(
  request: PaymentCalculationRequest
): Promise<PaymentCalculationResponse> {
  try {
    // Option 1: Direct gRPC call (if grpc-web is set up)
    // const client = new PriceEngineClient('http://localhost:50051');
    // const result = await client.calculatePayment(request);

    // Option 2: HTTP bridge to gRPC service
    const response = await fetch('/api/pricing/calculate-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Pricing service error');
    }

    return await response.json();
  } catch (error) {
    console.error('Pricing calculation error:', error);

    // Fallback to JavaScript calculation
    return calculatePaymentFallback(request);
  }
}

/**
 * Fallback calculation if Rust service is unavailable
 * Uses standard amortization formula
 */
function calculatePaymentFallback(
  request: PaymentCalculationRequest
): PaymentCalculationResponse {
  const netTrade = request.tradeValue - request.tradePayoff;
  const totalDown = request.downPayment + netTrade;
  const totalFinanced = request.vehiclePrice - totalDown + request.addOns;

  const monthlyRate = request.apr / 100 / 12;
  const numPayments = request.term;

  const monthlyPayment = totalFinanced > 0
    ? totalFinanced * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1)
    : 0;

  const totalInterest = (monthlyPayment * numPayments) - totalFinanced;
  const totalCost = request.vehiclePrice + totalInterest + request.addOns;

  return {
    monthlyPayment,
    totalFinanced,
    totalInterest,
    totalCost,
  };
}

/**
 * Get real-time vehicle pricing from market data
 */
export async function getVehiclePricing(vin: string): Promise<{
  msrp: number;
  dealerCost: number;
  marketPrice: number;
  adjustments: { [key: string]: number };
}> {
  try {
    const response = await fetch(`/api/pricing/vehicle/${vin}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Vehicle pricing error');
    }

    return await response.json();
  } catch (error) {
    console.error('Vehicle pricing error:', error);
    throw error;
  }
}

/**
 * Get lender rates based on credit score and term
 */
export async function getLenderRates(creditScore: number, term: number): Promise<{
  lenderId: string;
  lenderName: string;
  apr: number;
  approvalProbability: number;
}[]> {
  try {
    const response = await fetch('/api/pricing/lender-rates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creditScore, term }),
    });

    if (!response.ok) {
      throw new Error('Lender rates error');
    }

    return await response.json();
  } catch (error) {
    console.error('Lender rates error:', error);

    // Fallback rates based on credit score
    return getLenderRatesFallback(creditScore, term);
  }
}

function getLenderRatesFallback(creditScore: number, term: number) {
  const baseRate = creditScore >= 740 ? 4.99 :
                   creditScore >= 670 ? 6.99 :
                   creditScore >= 580 ? 9.99 : 14.99;

  return [
    {
      lenderId: 'ALLY',
      lenderName: 'Ally Financial',
      apr: baseRate,
      approvalProbability: creditScore >= 640 ? 0.95 : 0.75,
    },
    {
      lenderId: 'CHASE',
      lenderName: 'Chase Auto',
      apr: baseRate + 0.25,
      approvalProbability: creditScore >= 660 ? 0.92 : 0.70,
    },
    {
      lenderId: 'CAPITAL_ONE',
      lenderName: 'Capital One Auto',
      apr: baseRate + 0.50,
      approvalProbability: creditScore >= 580 ? 0.88 : 0.80,
    },
  ];
}

/**
 * WebSocket connection for live pricing updates
 * Subscribes to real-time market pricing changes
 */
export class PricingWebSocket {
  private ws: WebSocket | null = null;
  private callbacks: Map<string, (data: any) => void> = new Map();

  connect() {
    // TODO: Replace with actual WebSocket endpoint
    // this.ws = new WebSocket('ws://localhost:50051/pricing/stream');

    this.ws = new WebSocket(`ws://${window.location.host}/api/pricing/stream`);

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const callback = this.callbacks.get(data.type);
      if (callback) {
        callback(data.payload);
      }
    };

    this.ws.onerror = (error) => {
      console.error('Pricing WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('Pricing WebSocket closed, reconnecting in 5s...');
      setTimeout(() => this.connect(), 5000);
    };
  }

  subscribe(type: string, callback: (data: any) => void) {
    this.callbacks.set(type, callback);
  }

  unsubscribe(type: string) {
    this.callbacks.delete(type);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Singleton instance
let pricingWS: PricingWebSocket | null = null;

export function getPricingWebSocket(): PricingWebSocket {
  if (!pricingWS) {
    pricingWS = new PricingWebSocket();
    pricingWS.connect();
  }
  return pricingWS;
}
