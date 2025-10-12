import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Money, MoneyInput, AccountingTable } from "@/components/ui/money";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft } from "lucide-react";

interface TradeData {
  tradeAcvCents?: number | null;
  tradeReconCents?: number | null;
  tradeAllowanceCents?: number | null;
  tradePayoffCents?: number | null;
  payoffGoodThru?: string | null;
  lienholderName?: string | null;
  titleState?: string | null;
}

interface TradeSectionProps {
  data: TradeData;
  onChange: (updates: Partial<TradeData>) => void;
  readOnly?: boolean;
}

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

export function TradeSection({ data, onChange, readOnly = false }: TradeSectionProps) {
  // Calculate trade allowance from ACV +/- recon if not manually set
  const calculatedAllowance = (data.tradeAcvCents || 0) - (data.tradeReconCents || 0);
  const displayAllowance = data.tradeAllowanceCents ?? calculatedAllowance;
  
  // Calculate equity (allowance - payoff)
  const equity = displayAllowance - (data.tradePayoffCents || 0);

  const tableRows = [
    [
      <span className="font-medium">ACV (Actual Cash Value)</span>,
      readOnly ? (
        <Money cents={data.tradeAcvCents} />
      ) : (
        <MoneyInput
          value={data.tradeAcvCents}
          onChange={(value) => onChange({ tradeAcvCents: value })}
          placeholder="0.00"
          data-testid="input-trade-acv"
        />
      ),
    ],
    [
      <span className="font-medium">Recon/Repairs</span>,
      readOnly ? (
        <Money cents={data.tradeReconCents} />
      ) : (
        <MoneyInput
          value={data.tradeReconCents}
          onChange={(value) => onChange({ tradeReconCents: value })}
          placeholder="0.00"
          data-testid="input-trade-recon"
        />
      ),
    ],
    [
      <span className="font-medium">Allowance</span>,
      readOnly ? (
        <Money cents={displayAllowance} />
      ) : (
        <MoneyInput
          value={data.tradeAllowanceCents}
          onChange={(value) => onChange({ tradeAllowanceCents: value })}
          placeholder={`${(calculatedAllowance / 100).toFixed(2)}`}
          data-testid="input-trade-allowance"
        />
      ),
    ],
    [
      <span className="font-medium">Payoff</span>,
      readOnly ? (
        <Money cents={data.tradePayoffCents} />
      ) : (
        <MoneyInput
          value={data.tradePayoffCents}
          onChange={(value) => onChange({ tradePayoffCents: value })}
          placeholder="0.00"
          data-testid="input-trade-payoff"
        />
      ),
    ],
  ];

  const footerRow = [
    <span className="font-bold text-base">Net Equity</span>,
    <Money 
      cents={equity} 
      className={`font-bold text-base ${equity < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} 
    />,
  ];

  return (
    <Card data-testid="card-trade-section">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5" />
          Trade-In Vehicle
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AccountingTable
          headers={["Description", "Amount"]}
          rows={tableRows}
          footerRow={footerRow}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            <Label htmlFor="payoff-good-thru">Payoff Good Through</Label>
            <Input
              id="payoff-good-thru"
              type="date"
              value={data.payoffGoodThru || ''}
              onChange={(e) => onChange({ payoffGoodThru: e.target.value })}
              disabled={readOnly}
              data-testid="input-payoff-date"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lienholder">Lienholder</Label>
            <Input
              id="lienholder"
              type="text"
              value={data.lienholderName || ''}
              onChange={(e) => onChange({ lienholderName: e.target.value })}
              placeholder="Bank/Credit Union"
              disabled={readOnly}
              data-testid="input-lienholder"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title-state">Title State</Label>
            <Select
              value={data.titleState || ''}
              onValueChange={(value) => onChange({ titleState: value })}
              disabled={readOnly}
            >
              <SelectTrigger id="title-state" data-testid="select-title-state">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {!data.tradeAllowanceCents && (
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            Allowance auto-calculated as ACV - Recon. Override by entering a custom value.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
