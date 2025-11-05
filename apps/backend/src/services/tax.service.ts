/**
 * Tax Calculation Service
 * Calculates sales tax, registration fees, and doc fees based on zip code and state
 */

interface TaxCalculationResult {
  salesTaxRate: number;
  salesTaxAmount: number;
  registrationFee: number;
  docFee: number;
  titleFee: number;
  plateFee: number;
  totalTaxesAndFees: number;
  breakdown: {
    label: string;
    amount: number;
  }[];
}

interface TaxCalculationInput {
  salePrice: number;
  zipCode: string;
  state?: string;
  isNew?: boolean;
}

// State tax rates and fees (simplified - in production, use external tax API)
const STATE_TAX_DATA: Record<string, {
  baseTaxRate: number;
  docFee: number;
  titleFee: number;
  registrationFee: number;
  plateFee: number;
  localTaxByCounty?: Record<string, number>;
}> = {
  CA: {
    baseTaxRate: 0.0725, // 7.25%
    docFee: 85,
    titleFee: 23,
    registrationFee: 60,
    plateFee: 23,
    localTaxByCounty: {
      // Add specific counties if needed
      'Los Angeles': 0.0175, // Additional 1.75%
      'San Francisco': 0.015,
      'San Diego': 0.01,
    },
  },
  TX: {
    baseTaxRate: 0.0625, // 6.25%
    docFee: 150,
    titleFee: 33,
    registrationFee: 75,
    plateFee: 50.75,
  },
  FL: {
    baseTaxRate: 0.06, // 6%
    docFee: 399.99, // FL allows up to $899
    titleFee: 77.25,
    registrationFee: 225,
    plateFee: 28,
  },
  NY: {
    baseTaxRate: 0.04, // 4%
    docFee: 175,
    titleFee: 50,
    registrationFee: 140,
    plateFee: 25,
  },
  // Default for other states
  DEFAULT: {
    baseTaxRate: 0.065, // 6.5%
    docFee: 200,
    titleFee: 50,
    registrationFee: 100,
    plateFee: 30,
  },
};

// Simplified zip-to-state mapping (in production, use full database)
function getStateFromZip(zipCode: string): string {
  const zip = zipCode.substring(0, 3);
  const zipNum = parseInt(zip, 10);

  // CA: 900-961
  if (zipNum >= 900 && zipNum <= 961) return 'CA';
  // TX: 750-799, 885
  if ((zipNum >= 750 && zipNum <= 799) || zipNum === 885) return 'TX';
  // FL: 320-349
  if (zipNum >= 320 && zipNum <= 349) return 'FL';
  // NY: 100-149
  if (zipNum >= 100 && zipNum <= 149) return 'NY';

  return 'DEFAULT';
}

export function calculateTax(input: TaxCalculationInput): TaxCalculationResult {
  const { salePrice, zipCode, state, isNew = false } = input;

  // Determine state
  const actualState = state || getStateFromZip(zipCode);
  const taxData = STATE_TAX_DATA[actualState] || STATE_TAX_DATA.DEFAULT;

  // Calculate sales tax
  let totalTaxRate = taxData.baseTaxRate;

  // In production, look up county by zip code and add local tax
  // For now, use a simplified approach
  if (actualState === 'CA' && zipCode.startsWith('90')) {
    // LA County example
    totalTaxRate += 0.0175;
  }

  const salesTaxAmount = salePrice * totalTaxRate;

  // Registration fee may vary for new vs used
  const registrationFee = isNew ? taxData.registrationFee * 1.2 : taxData.registrationFee;

  const breakdown = [
    { label: `Sales Tax (${(totalTaxRate * 100).toFixed(2)}%)`, amount: salesTaxAmount },
    { label: 'Documentation Fee', amount: taxData.docFee },
    { label: 'Title Fee', amount: taxData.titleFee },
    { label: 'Registration Fee', amount: registrationFee },
    { label: 'License Plate Fee', amount: taxData.plateFee },
  ];

  const totalTaxesAndFees = breakdown.reduce((sum, item) => sum + item.amount, 0);

  return {
    salesTaxRate: totalTaxRate,
    salesTaxAmount,
    registrationFee,
    docFee: taxData.docFee,
    titleFee: taxData.titleFee,
    plateFee: taxData.plateFee,
    totalTaxesAndFees,
    breakdown,
  };
}
