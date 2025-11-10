import { useMemo } from 'react';
import type { ApprovalPredictions, DeskingDeal, PaymentScenario, SimilarDealSummary } from '@/features/desking/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@repo/ui';
import { Button } from '@repo/ui';
import { format } from 'date-fns';

interface PencilPrintPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: DeskingDeal;
  scenario?: PaymentScenario;
  predictions?: ApprovalPredictions;
  similarDeals?: SimilarDealSummary[];
  formatCurrency: (value: number) => string;
  onSaveToDeal?: () => void;
}

export function PencilPrintPreview({
  open,
  onOpenChange,
  deal,
  scenario,
  predictions,
  similarDeals,
  formatCurrency,
  onSaveToDeal,
}: PencilPrintPreviewProps) {
  const handlePrint = () => {
    window.print();
  };

  const amountFinanced = useMemo(() => {
    if (!scenario) {
      return undefined;
    }
    const monthlyRate = scenario.apr / 1200;
    if (monthlyRate === 0) {
      return scenario.monthlyPayment * scenario.termMonths;
    }
    const denominator = 1 - (1 + monthlyRate) ** -scenario.termMonths;
    if (denominator === 0) {
      return scenario.monthlyPayment * scenario.termMonths;
    }
    return (scenario.monthlyPayment * denominator) / monthlyRate;
  }, [scenario]);

  const paymentTable = useMemo(() => {
    if (!scenario || !amountFinanced) {
      return [] as Array<{ month: number; principal: number; interest: number; balance: number }>;
    }
    const monthlyRate = scenario.apr / 1200;
    let balance = amountFinanced;
    const rows: Array<{ month: number; principal: number; interest: number; balance: number }> = [];
    for (let month = 1; month <= Math.min(6, scenario.termMonths); month += 1) {
      const interest = monthlyRate === 0 ? 0 : balance * monthlyRate;
      const principal = Math.max(0, scenario.monthlyPayment - interest);
      balance = Math.max(0, balance - principal);
      rows.push({ month, principal, interest, balance });
    }
    return rows;
  }, [amountFinanced, scenario]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl overflow-hidden bg-white print:max-w-none print:w-full print:rounded-none print:border-0 print:p-0"
        data-testid="print-preview-modal"
      >
        <DialogHeader className="no-print">
          <DialogTitle>Pencil Print Preview</DialogTitle>
          <DialogDescription>Review the pencil summary before generating a printable worksheet.</DialogDescription>
        </DialogHeader>
        <div className="no-print flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="modal-close">
            Close
          </Button>
          {onSaveToDeal && (
            <Button variant="secondary" onClick={onSaveToDeal} data-testid="pencil-save-to-deal">
              Save to deal
            </Button>
          )}
          <Button onClick={handlePrint}>Print</Button>
        </div>
        <div className="print-container print:bg-white">
          {deal && scenario ? (
            <div className="space-y-6 p-6 text-sm leading-relaxed text-slate-700 print:p-8">
              <header className="flex flex-col gap-1 border-b border-slate-200 pb-4">
                <h2 className="text-2xl font-semibold text-slate-900">{deal.dealership}</h2>
                <p className="text-xs uppercase tracking-wide text-slate-500">Desk Manager: {deal.deskManager}</p>
                <p className="text-xs text-slate-500">Generated {format(new Date(), 'PPpp')}</p>
              </header>

              <section className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-900">Customer</h3>
                  <p className="text-slate-700">{deal.customer.name}</p>
                  <p className="text-slate-500 text-xs">{deal.customer.email} • {deal.customer.phone}</p>
                  <p className="text-xs text-slate-500">Credit Score: {deal.customer.creditScore}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-900">Vehicle</h3>
                  <p className="text-slate-700">{deal.vehicle.year} {deal.vehicle.make} {deal.vehicle.model}</p>
                  <p className="text-xs text-slate-500">VIN {deal.vehicle.vin}</p>
                  <p className="text-xs text-slate-500">Stock {deal.vehicle.stockNumber} • {deal.vehicle.mileage.toLocaleString()} miles</p>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-slate-900">Selected Structure</h3>
                <div className="mt-2 grid grid-cols-2 gap-4 rounded-lg border border-slate-200 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Scenario</p>
                    <p className="text-base font-semibold text-slate-900">{scenario.label}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Monthly</p>
                    <p className="text-base font-semibold text-slate-900">{formatCurrency(scenario.monthlyPayment)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">APR / Term</p>
                    <p className="text-slate-700">{scenario.apr.toFixed(2)}% • {scenario.termMonths} months</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Due at signing</p>
                    <p className="text-slate-700">{formatCurrency(scenario.totalDueAtSigning)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Total of payments</p>
                    <p className="text-slate-700">{formatCurrency(scenario.totalOfPayments)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Cash down</p>
                    <p className="text-slate-700">{formatCurrency(scenario.cashDown)}</p>
                  </div>
                  {typeof amountFinanced === 'number' && Number.isFinite(amountFinanced) && (
                    <div className="col-span-2">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Amount financed</p>
                      <p className="text-slate-700" data-testid="print-amount-financed">
                        {formatCurrency(amountFinanced)}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-slate-900">Gross Summary</h3>
                <div className="mt-2 grid grid-cols-4 gap-4 rounded-lg border border-slate-200 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Front</p>
                    <p className="text-base font-semibold text-slate-900">{formatCurrency(deal.gross.frontGross)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Back</p>
                    <p className="text-base font-semibold text-slate-900">{formatCurrency(deal.gross.backGross)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">F&I</p>
                    <p className="text-base font-semibold text-slate-900">{formatCurrency(deal.gross.fAndIGross)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
                    <p className="text-base font-semibold text-slate-900">{formatCurrency(deal.gross.totalGross)}</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-slate-900">Fees & Taxes</h3>
                <div className="mt-2 grid grid-cols-3 gap-4 rounded-lg border border-slate-200 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Doc</p>
                    <p>{formatCurrency(deal.fees.docFee)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Acquisition</p>
                    <p>{formatCurrency(deal.fees.acquisitionFee)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">License</p>
                    <p>{formatCurrency(deal.fees.licenseFee)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Registration</p>
                    <p>{formatCurrency(deal.fees.registration)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Taxes</p>
                    <p>{formatCurrency(deal.fees.taxes)}</p>
                  </div>
                </div>
              </section>

              {paymentTable.length > 0 && (
                <section>
                  <h3 className="text-sm font-semibold text-slate-900">Payment schedule snapshot</h3>
                  <div className="mt-2 overflow-hidden rounded-lg border border-slate-200">
                    <table className="w-full text-left text-xs" data-testid="print-payment-table">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="px-3 py-2 font-medium">Month</th>
                          <th className="px-3 py-2 font-medium">Principal</th>
                          <th className="px-3 py-2 font-medium">Interest</th>
                          <th className="px-3 py-2 font-medium">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentTable.map(row => (
                          <tr key={row.month} className="odd:bg-white even:bg-slate-50">
                            <td className="px-3 py-2">{row.month}</td>
                            <td className="px-3 py-2">{formatCurrency(row.principal)}</td>
                            <td className="px-3 py-2">{formatCurrency(row.interest)}</td>
                            <td className="px-3 py-2">{formatCurrency(row.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {predictions && (
                <section>
                  <h3 className="text-sm font-semibold text-slate-900">Approval Outlook</h3>
                  <div className="mt-2 grid grid-cols-3 gap-4 rounded-lg border border-slate-200 p-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Overall probability</p>
                      <p className="text-base font-semibold text-slate-900">{Math.round(predictions.overallProbability * 100)}%</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Funding window</p>
                      <p className="text-slate-700">{predictions.likelyFundingWindowHours} hours</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Risk signals</p>
                      <ul className="mt-1 list-disc space-y-1 pl-5">
                        {predictions.riskSignals.map(signal => (
                          <li key={signal}>{signal}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>
              )}

              {similarDeals && similarDeals.length > 0 && (
                <section>
                  <h3 className="text-sm font-semibold text-slate-900">Similar Deals</h3>
                  <div className="mt-2 space-y-3 rounded-lg border border-slate-200 p-4">
                    {similarDeals.map(dealSummary => (
                      <div key={dealSummary.id} className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{dealSummary.vehicle}</p>
                          <p className="text-xs text-slate-500">{dealSummary.customer} • {dealSummary.structure}</p>
                          <p className="text-xs text-slate-500">Highlights: {dealSummary.highlights.join('; ')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">{formatCurrency(dealSummary.payment)}</p>
                          <p className="text-xs text-slate-500">Close {Math.round(dealSummary.closeProbability * 100)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center">
              <p className="text-sm text-muted-foreground">Loading deal data…</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PencilPrintPreview;
