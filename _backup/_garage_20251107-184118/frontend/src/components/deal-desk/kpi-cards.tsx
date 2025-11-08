import { KPICard } from '@repo/ui';
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@repo/ui';

interface KPIData {
  // Vehicle fields
  salePriceCents?: number | null;
  aftermarketCents?: number | null;
  vehicleCostCents?: number | null;
  packCents?: number | null;
  holdbackCents?: number | null;
  rebatesCents?: number | null;
  rebatesTaxable?: boolean;
  
  // Trade
  tradeAllowanceCents?: number | null;
  
  // Finance
  cashDownCents?: number | null;
  reserveAmountCents?: number | null;
  
  // Products & Fees
  productsRetailCents?: number | null;
  productsCostCents?: number | null;
  feesCents?: number | null;
  
  // Tax
  taxCents?: number | null;
}

interface KPICardsProps {
  data: KPIData;
  className?: string;
}

export function KPICards({ data, className = "" }: KPICardsProps) {
  // Front-End Gross Calculation
  const frontEnd = calculateFrontEnd(data);
  
  // Back-End Gross Calculation
  const backEnd = calculateBackEnd(data);
  
  // Total Gross
  const totalGross = frontEnd + backEnd;
  
  // Out-The-Door
  const otd = calculateOTD(data);
  
  // Build formula tooltips
  const frontEndTooltip = buildFrontEndFormula(data);
  const backEndTooltip = buildBackEndFormula(data);
  const otdTooltip = buildOTDFormula(data);

  return (
    <div className={`space-y-4 ${className}`} data-testid="kpi-cards-container">
      <div className="sticky top-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          Deal Summary
        </h3>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <KPICard
                  label="Front-End Gross"
                  valueCents={frontEnd}
                  color="#1D4ED8"
                  icon={<Info className="w-3 h-3" />}
                  tooltip={frontEndTooltip}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-sm">
              <div className="text-xs font-mono whitespace-pre-line">
                {frontEndTooltip}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <KPICard
                  label="Back-End Gross"
                  valueCents={backEnd}
                  color="#059669"
                  icon={<Info className="w-3 h-3" />}
                  tooltip={backEndTooltip}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-sm">
              <div className="text-xs font-mono whitespace-pre-line">
                {backEndTooltip}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <KPICard
          label="Total Gross Profit"
          valueCents={totalGross}
          color="#7C3AED"
          className="ring-2 ring-purple-200 dark:ring-purple-800"
        />

        <KPICard
          label="Sales Tax"
          valueCents={data.taxCents}
          color="#6B7280"
        />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <KPICard
                  label="Out-The-Door"
                  valueCents={otd}
                  color="#DC2626"
                  icon={<Info className="w-3 h-3" />}
                  tooltip={otdTooltip}
                  className="border-2 border-red-200 dark:border-red-800"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-sm">
              <div className="text-xs font-mono whitespace-pre-line">
                {otdTooltip}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

// Calculation Functions
function calculateFrontEnd(data: KPIData): number {
  const salePrice = (data.salePriceCents || 0) + (data.aftermarketCents || 0);
  const cost = data.vehicleCostCents || 0;
  const pack = data.packCents || 0;
  const holdback = data.holdbackCents || 0;
  const rebates = data.rebatesCents || 0;
  
  // If rebates are taxable, don't subtract them from front gross
  const rebateAdjustment = data.rebatesTaxable ? 0 : rebates;
  
  return salePrice - cost - pack + holdback - rebateAdjustment;
}

function calculateBackEnd(data: KPIData): number {
  const productsProfit = (data.productsRetailCents || 0) - (data.productsCostCents || 0);
  const reserve = data.reserveAmountCents || 0;
  
  return productsProfit + reserve;
}

function calculateOTD(data: KPIData): number {
  const salePrice = data.salePriceCents || 0;
  const aftermarket = data.aftermarketCents || 0;
  const fees = data.feesCents || 0;
  const products = data.productsRetailCents || 0;
  const tax = data.taxCents || 0;
  const tradeAllowance = data.tradeAllowanceCents || 0;
  const cashDown = data.cashDownCents || 0;

  return salePrice + aftermarket + fees + products + tax - tradeAllowance - cashDown;
}

// Formula Builders
function buildFrontEndFormula(data: KPIData): string {
  const fmt = (cents: number | null | undefined) => cents ? `$${(cents / 100).toFixed(2)}` : '$0.00';
  const aftermarketLine = data.aftermarketCents ? `+ Aftermarket:  ${fmt(data.aftermarketCents)}\n` : '';

  return `Front-End Gross:
Sale Price:     ${fmt(data.salePriceCents)}
${aftermarketLine}- Vehicle Cost: ${fmt(data.vehicleCostCents)}
- Pack:         ${fmt(data.packCents)}
+ Holdback:     ${fmt(data.holdbackCents)}
${data.rebatesTaxable ? '(Rebates taxable - no adj)' : `- Rebates:      ${fmt(data.rebatesCents)}`}
= ${fmt(calculateFrontEnd(data))}`;
}

function buildBackEndFormula(data: KPIData): string {
  const fmt = (cents: number | null | undefined) => cents ? `$${(cents / 100).toFixed(2)}` : '$0.00';
  const productsProfit = (data.productsRetailCents || 0) - (data.productsCostCents || 0);
  
  return `Back-End Gross:
Products Profit: ${fmt(productsProfit)}
+ F&I Reserve:   ${fmt(data.reserveAmountCents)}
= ${fmt(calculateBackEnd(data))}`;
}

function buildOTDFormula(data: KPIData): string {
  const fmt = (cents: number | null | undefined) => cents ? `$${(cents / 100).toFixed(2)}` : '$0.00';
  const aftermarketLine = data.aftermarketCents ? `+ Aftermarket:   ${fmt(data.aftermarketCents)}\n` : '';

  return `Out-The-Door:
Sale Price:      ${fmt(data.salePriceCents)}
${aftermarketLine}+ Fees:          ${fmt(data.feesCents)}
+ Products:      ${fmt(data.productsRetailCents)}
+ Tax:           ${fmt(data.taxCents)}
- Trade Allow:   ${fmt(data.tradeAllowanceCents)}
- Cash Down:     ${fmt(data.cashDownCents)}
= ${fmt(calculateOTD(data))}`;
}
