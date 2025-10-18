export type LoanTermInput = number | string | { months?: number; years?: number };

export interface LoanAmortizationInput {
  amountFinanced: number;
  apr: number;
  term: LoanTermInput;
  fees?: number;
}

export interface LoanAmortizationResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  termInMonths: number;
}

const roundToCents = (value: number): number => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

const roundToBasisPoints = (value: number): number => {
  return Math.round((value + Number.EPSILON) * 10000) / 10000;
};

const parseTermString = (term: string): number => {
  const normalized = term.trim().toLowerCase();
  if (!normalized) {
    throw new RangeError('Term cannot be empty');
  }

  const numericPart = parseFloat(normalized.replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(numericPart) || numericPart <= 0) {
    throw new RangeError(`Unable to parse term: ${term}`);
  }

  if (normalized.includes('y')) {
    return Math.round(numericPart * 12);
  }

  return Math.round(numericPart);
};

const ensurePositiveFinite = (value: number, name: string): void => {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative finite number`);
  }
};

export const normalizeTerm = (term: LoanTermInput): number => {
  if (typeof term === 'number') {
    ensurePositiveFinite(term, 'term');
    const rounded = Math.round(term);
    if (rounded === 0) {
      throw new RangeError('Term must be at least 1 month');
    }
    return rounded;
  }

  if (typeof term === 'string') {
    return parseTermString(term);
  }

  if (typeof term === 'object' && term !== null) {
    const { months, years } = term;
    if (years !== undefined) {
      ensurePositiveFinite(years, 'years');
      return Math.round(years * 12);
    }

    if (months !== undefined) {
      ensurePositiveFinite(months, 'months');
      const rounded = Math.round(months);
      if (rounded === 0) {
        throw new RangeError('Term must be at least 1 month');
      }
      return rounded;
    }
  }

  throw new TypeError('Unsupported loan term input');
};

export const aprFromBuySell = (buyRate: number, sellRate: number): number => {
  ensurePositiveFinite(buyRate, 'buyRate');
  ensurePositiveFinite(sellRate, 'sellRate');
  const markup = sellRate - buyRate;
  return roundToBasisPoints(Math.max(markup, 0));
};

export const computePTI = (monthlyPayment: number, grossMonthlyIncome: number): number => {
  ensurePositiveFinite(monthlyPayment, 'monthlyPayment');
  if (!Number.isFinite(grossMonthlyIncome) || grossMonthlyIncome <= 0) {
    throw new RangeError('grossMonthlyIncome must be a positive finite number');
  }

  return roundToBasisPoints(monthlyPayment / grossMonthlyIncome);
};

export const computeDTI = (totalMonthlyDebt: number, grossMonthlyIncome: number): number => {
  ensurePositiveFinite(totalMonthlyDebt, 'totalMonthlyDebt');
  if (!Number.isFinite(grossMonthlyIncome) || grossMonthlyIncome <= 0) {
    throw new RangeError('grossMonthlyIncome must be a positive finite number');
  }

  return roundToBasisPoints(totalMonthlyDebt / grossMonthlyIncome);
};

const toMonthlyRate = (apr: number): number => {
  if (!Number.isFinite(apr) || apr < 0) {
    throw new RangeError('APR must be a non-negative finite number');
  }

  return apr / 1200;
};

export const amortization = (input: LoanAmortizationInput): LoanAmortizationResult => {
  const termInMonths = normalizeTerm(input.term);
  if (termInMonths <= 0) {
    throw new RangeError('Loan term must be at least one month');
  }

  const principal = input.amountFinanced + (input.fees ?? 0);
  ensurePositiveFinite(principal, 'amountFinanced + fees');

  if (principal === 0) {
    return {
      monthlyPayment: 0,
      totalPayment: 0,
      totalInterest: 0,
      termInMonths,
    };
  }

  const monthlyRate = toMonthlyRate(input.apr);

  let monthlyPayment = 0;
  if (monthlyRate === 0) {
    monthlyPayment = principal / termInMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, termInMonths);
    monthlyPayment = (principal * monthlyRate * factor) / (factor - 1);
  }

  const roundedMonthly = roundToCents(monthlyPayment);
  const totalPayment = roundToCents(roundedMonthly * termInMonths);
  const totalInterest = roundToCents(totalPayment - roundToCents(principal));

  return {
    monthlyPayment: roundedMonthly,
    totalPayment,
    totalInterest,
    termInMonths,
  };
};
