import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Money, MoneyInput } from "@/components/ui/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, DollarSign } from "lucide-react";

export interface DealFee {
  id: string;
  code: string;
  description: string;
  amountCents: number | null;
  taxable: boolean;
}

interface FeesSectionProps {
  fees: DealFee[];
  onChange: (fees: DealFee[]) => void;
  readOnly?: boolean;
}

const FEE_CODES = [
  { value: "DOC", label: "Doc Fee" },
  { value: "TITLE", label: "Title Fee" },
  { value: "REG", label: "Registration" },
  { value: "ELEC", label: "Electronic Filing" },
  { value: "TIRE", label: "Tire/Environmental" },
  { value: "SMOG", label: "Smog/Emissions" },
  { value: "OTHER", label: "Other" },
];

export function FeesSection({ fees, onChange, readOnly = false }: FeesSectionProps) {
  const addFee = () => {
    const newFee: DealFee = {
      id: `fee_${Date.now()}`,
      code: "DOC",
      description: "",
      amountCents: null,
      taxable: false,
    };
    onChange([...fees, newFee]);
  };

  const updateFee = (id: string, updates: Partial<DealFee>) => {
    onChange(fees.map((fee) => (fee.id === id ? { ...fee, ...updates } : fee)));
  };

  const removeFee = (id: string) => {
    onChange(fees.filter((fee) => fee.id !== id));
  };

  const totalFees = fees.reduce((sum, fee) => sum + (fee.amountCents || 0), 0);
  const taxableFees = fees
    .filter((fee) => fee.taxable)
    .reduce((sum, fee) => sum + (fee.amountCents || 0), 0);

  return (
    <Card data-testid="card-fees-section">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Fees & Charges
        </CardTitle>
        {!readOnly && (
          <Button
            onClick={addFee}
            variant="outline"
            size="sm"
            data-testid="button-add-fee"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Fee
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 w-32">
                  Code
                </th>
                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Description
                </th>
                <th className="px-3 py-2 text-right text-sm font-semibold text-gray-900 dark:text-gray-100 w-32">
                  Amount
                </th>
                <th className="px-3 py-2 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 w-20">
                  Taxable
                </th>
                {!readOnly && (
                  <th className="px-3 py-2 w-12"></th>
                )}
              </tr>
            </thead>
            <tbody>
              {fees.length === 0 ? (
                <tr>
                  <td colSpan={readOnly ? 4 : 5} className="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No fees added yet. Click "Add Fee" to get started.
                  </td>
                </tr>
              ) : (
                fees.map((fee, index) => (
                  <tr
                    key={fee.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-3 py-2">
                      {readOnly ? (
                        <span className="text-sm">{FEE_CODES.find((c) => c.value === fee.code)?.label || fee.code}</span>
                      ) : (
                        <Select
                          value={fee.code}
                          onValueChange={(value) => updateFee(fee.id, { code: value })}
                        >
                          <SelectTrigger className="h-9" data-testid={`select-fee-code-${index}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FEE_CODES.map((code) => (
                              <SelectItem key={code.value} value={code.value}>
                                {code.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {readOnly ? (
                        <span className="text-sm">{fee.description}</span>
                      ) : (
                        <Input
                          value={fee.description}
                          onChange={(e) => updateFee(fee.id, { description: e.target.value })}
                          placeholder="Fee description"
                          className="h-9"
                          data-testid={`input-fee-description-${index}`}
                        />
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {readOnly ? (
                        <Money cents={fee.amountCents} />
                      ) : (
                        <MoneyInput
                          value={fee.amountCents}
                          onChange={(value) => updateFee(fee.id, { amountCents: value })}
                          placeholder="0.00"
                          className="w-full"
                          data-testid={`input-fee-amount-${index}`}
                        />
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-center">
                        <Checkbox
                          checked={fee.taxable}
                          onCheckedChange={(checked) =>
                            updateFee(fee.id, { taxable: checked as boolean })
                          }
                          disabled={readOnly}
                          data-testid={`checkbox-fee-taxable-${index}`}
                        />
                      </div>
                    </td>
                    {!readOnly && (
                      <td className="px-3 py-2">
                        <Button
                          onClick={() => removeFee(fee.id)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          data-testid={`button-remove-fee-${index}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
            {fees.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-gray-300 dark:border-gray-600">
                  <td colSpan={2} className="px-3 py-3 text-sm font-semibold">
                    Total Fees
                    {taxableFees > 0 && (
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        (${(taxableFees / 100).toFixed(2)} taxable)
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Money cents={totalFees} className="font-semibold text-base" />
                  </td>
                  <td colSpan={readOnly ? 1 : 2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
