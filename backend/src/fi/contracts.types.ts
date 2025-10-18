export const CONTRACT_TYPES = [
  'RISC',
  'BUYERS_ORDER',
  'VSC',
  'GAP',
  'TIRE_WHEEL',
  'ODOMETER',
  'BILL_OF_SALE',
  'TILA',
  'PRIVACY',
  'ARBITRATION',
  'TRADE_IN',
  'POA',
] as const;

export type ContractType = (typeof CONTRACT_TYPES)[number];

export const CONTRACT_DISPLAY_NAMES: Record<ContractType, string> = {
  RISC: 'Retail Installment Sales Contract',
  BUYERS_ORDER: "Buyer’s Order",
  VSC: 'Vehicle Service Contract',
  GAP: 'GAP Waiver',
  TIRE_WHEEL: 'Tire & Wheel Protection',
  ODOMETER: 'Odometer Disclosure',
  BILL_OF_SALE: 'Bill of Sale',
  TILA: 'Truth in Lending',
  PRIVACY: 'Privacy Policy Acknowledgement',
  ARBITRATION: 'Arbitration Agreement',
  TRADE_IN: 'Trade-In Agreement',
  POA: 'Power of Attorney',
};

export function getContractDisplayName(type: ContractType) {
  return CONTRACT_DISPLAY_NAMES[type] ?? type;
}

export interface ContractSigner {
  name: string;
  email: string;
  role: string;
  roleLabel?: string;
  routingOrder?: number;
  clientUserId?: string;
}

export const REQUIRED_CONTRACT_TYPES: ContractType[] = [
  'RISC',
  'BUYERS_ORDER',
  'BILL_OF_SALE',
  'TILA',
  'PRIVACY',
  'ARBITRATION',
  'POA',
];
