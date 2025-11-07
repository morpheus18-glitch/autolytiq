import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Money, MoneyInput } from '@repo/ui';
import { Button } from '@repo/ui';
import { Input } from '@repo/ui';
import { Checkbox } from '@repo/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui';
import { Plus, Trash2, Shield } from "lucide-react";

export interface DealProduct {
  id: string;
  productCode: string;
  productName: string;
  providerName: string;
  retailCents: number | null;
  costCents: number | null;
  termMonths: number | null;
  taxable: boolean;
}

interface ProductsSectionProps {
  products: DealProduct[];
  onChange: (products: DealProduct[]) => void;
  readOnly?: boolean;
  hideProfit?: boolean; // For customer mode
}

const PRODUCT_CODES = [
  { value: "WARRANTY", label: "Extended Warranty" },
  { value: "GAP", label: "GAP Insurance" },
  { value: "MAINT", label: "Maintenance Plan" },
  { value: "WHEEL_TIRE", label: "Tire & Wheel Protection" },
  { value: "THEFT", label: "Theft Protection" },
  { value: "VSC", label: "Vehicle Service Contract" },
  { value: "OTHER", label: "Other Product" },
];

const TERM_OPTIONS = [12, 24, 36, 48, 60, 72, 84];

export function ProductsSection({ products, onChange, readOnly = false, hideProfit = false }: ProductsSectionProps) {
  const addProduct = () => {
    const newProduct: DealProduct = {
      id: `product_${Date.now()}`,
      productCode: "WARRANTY",
      productName: "",
      providerName: "",
      retailCents: null,
      costCents: null,
      termMonths: 36,
      taxable: false,
    };
    onChange([...products, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<DealProduct>) => {
    onChange(products.map((product) => (product.id === id ? { ...product, ...updates } : product)));
  };

  const removeProduct = (id: string) => {
    onChange(products.filter((product) => product.id !== id));
  };

  const totalRetail = products.reduce((sum, p) => sum + (p.retailCents || 0), 0);
  const totalCost = products.reduce((sum, p) => sum + (p.costCents || 0), 0);
  const totalProfit = totalRetail - totalCost;

  return (
    <Card data-testid="card-products-section">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          F&I Products
        </CardTitle>
        {!readOnly && (
          <Button
            onClick={addProduct}
            variant="outline"
            size="sm"
            data-testid="button-add-product"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Product
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Product
                </th>
                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Provider
                </th>
                <th className="px-3 py-2 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 w-24">
                  Term
                </th>
                <th className="px-3 py-2 text-right text-sm font-semibold text-gray-900 dark:text-gray-100 w-32">
                  Retail
                </th>
                {!hideProfit && (
                  <>
                    <th className="px-3 py-2 text-right text-sm font-semibold text-gray-900 dark:text-gray-100 w-32">
                      Cost
                    </th>
                    <th className="px-3 py-2 text-right text-sm font-semibold text-gray-900 dark:text-gray-100 w-32">
                      Profit
                    </th>
                  </>
                )}
                <th className="px-3 py-2 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 w-20">
                  Taxable
                </th>
                {!readOnly && <th className="px-3 py-2 w-12"></th>}
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={hideProfit ? 5 : 7} className="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No products added yet. Click "Add Product" to get started.
                  </td>
                </tr>
              ) : (
                products.map((product, index) => {
                  const profit = (product.retailCents || 0) - (product.costCents || 0);
                  
                  return (
                    <tr
                      key={product.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-3 py-2">
                        {readOnly ? (
                          <div>
                            <div className="text-sm font-medium">{product.productName || PRODUCT_CODES.find(c => c.value === product.productCode)?.label}</div>
                            <div className="text-xs text-gray-500">{PRODUCT_CODES.find(c => c.value === product.productCode)?.label}</div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Select
                              value={product.productCode}
                              onValueChange={(value) => updateProduct(product.id, { productCode: value })}
                            >
                              <SelectTrigger className="h-9" data-testid={`select-product-code-${index}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {PRODUCT_CODES.map((code) => (
                                  <SelectItem key={code.value} value={code.value}>
                                    {code.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              value={product.productName}
                              onChange={(e) => updateProduct(product.id, { productName: e.target.value })}
                              placeholder="Custom name (optional)"
                              className="h-8 text-xs"
                              data-testid={`input-product-name-${index}`}
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {readOnly ? (
                          <span className="text-sm">{product.providerName}</span>
                        ) : (
                          <Input
                            value={product.providerName}
                            onChange={(e) => updateProduct(product.id, { providerName: e.target.value })}
                            placeholder="Provider"
                            className="h-9"
                            data-testid={`input-provider-${index}`}
                          />
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {readOnly ? (
                          <span className="text-sm text-center block">{product.termMonths ? `${product.termMonths}mo` : '—'}</span>
                        ) : (
                          <Select
                            value={product.termMonths?.toString() || ''}
                            onValueChange={(value) => updateProduct(product.id, { termMonths: parseInt(value) })}
                          >
                            <SelectTrigger className="h-9" data-testid={`select-term-${index}`}>
                              <SelectValue placeholder="Term" />
                            </SelectTrigger>
                            <SelectContent>
                              {TERM_OPTIONS.map((term) => (
                                <SelectItem key={term} value={term.toString()}>
                                  {term}mo
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {readOnly ? (
                          <Money cents={product.retailCents} />
                        ) : (
                          <MoneyInput
                            value={product.retailCents}
                            onChange={(value) => updateProduct(product.id, { retailCents: value })}
                            placeholder="0.00"
                            data-testid={`input-retail-${index}`}
                          />
                        )}
                      </td>
                      {!hideProfit && (
                        <>
                          <td className="px-3 py-2 text-right">
                            {readOnly ? (
                              <Money cents={product.costCents} />
                            ) : (
                              <MoneyInput
                                value={product.costCents}
                                onChange={(value) => updateProduct(product.id, { costCents: value })}
                                placeholder="0.00"
                                data-testid={`input-cost-${index}`}
                              />
                            )}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <Money 
                              cents={profit} 
                              className={profit < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'} 
                            />
                          </td>
                        </>
                      )}
                      <td className="px-3 py-2">
                        <div className="flex justify-center">
                          <Checkbox
                            checked={product.taxable}
                            onCheckedChange={(checked) =>
                              updateProduct(product.id, { taxable: checked as boolean })
                            }
                            disabled={readOnly}
                            data-testid={`checkbox-product-taxable-${index}`}
                          />
                        </div>
                      </td>
                      {!readOnly && (
                        <td className="px-3 py-2">
                          <Button
                            onClick={() => removeProduct(product.id)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            data-testid={`button-remove-product-${index}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
            {products.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-gray-300 dark:border-gray-600">
                  <td colSpan={3} className="px-3 py-3 text-sm font-semibold">
                    Total Products
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Money cents={totalRetail} className="font-semibold text-base" />
                  </td>
                  {!hideProfit && (
                    <>
                      <td className="px-3 py-3 text-right">
                        <Money cents={totalCost} className="font-semibold text-base" />
                      </td>
                      <td className="px-3 py-3 text-right">
                        <Money 
                          cents={totalProfit} 
                          className={`font-semibold text-base ${totalProfit < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} 
                        />
                      </td>
                    </>
                  )}
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
