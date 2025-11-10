/**
 * F&I Product Selector Component
 *
 * Checkbox list for F&I products with profit calculation
 * Shows retail price, cost, and profit for each product
 */

import { Shield, CheckSquare, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dealStudioTokens } from '@/design-tokens/deal-studio';

export interface FIProduct {
  id: string;
  name: string;
  retailPrice: number;
  cost: number;
  selected: boolean;
  description?: string;
}

export interface FIProductSelectorProps {
  products: FIProduct[];
  onChange: (productId: string, selected: boolean) => void;
  className?: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function FIProductSelector({ products, onChange, className }: FIProductSelectorProps) {
  const totalBackEnd = products
    .filter(p => p.selected)
    .reduce((sum, p) => sum + (p.retailPrice - p.cost), 0);

  const totalRetail = products
    .filter(p => p.selected)
    .reduce((sum, p) => sum + p.retailPrice, 0);

  return (
    <div className={cn('bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden', className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 px-5 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg shadow-sm">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">F&I Products</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Back-End Profit Opportunities</p>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {products.map((product) => {
          const profit = product.retailPrice - product.cost;
          const profitMargin = ((profit / product.retailPrice) * 100).toFixed(0);

          return (
            <div
              key={product.id}
              className={cn(
                'px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer',
                product.selected && 'bg-blue-50/50 dark:bg-blue-950/20'
              )}
              onClick={() => onChange(product.id, !product.selected)}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <div className="flex-shrink-0 mt-1">
                  {product.selected ? (
                    <CheckSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Square className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-4">
                    <div>
                      <h4 className={cn(
                        'text-sm font-semibold',
                        product.selected
                          ? 'text-slate-900 dark:text-slate-100'
                          : 'text-slate-700 dark:text-slate-300'
                      )}>
                        {product.name}
                      </h4>
                      {product.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {product.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                        {formatCurrency(product.retailPrice)}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Cost: {formatCurrency(product.cost)}
                      </div>
                    </div>
                  </div>

                  {/* Profit Display */}
                  <div className="mt-2 flex items-center gap-4">
                    <div className={cn(
                      'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold',
                      product.selected
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    )}>
                      <span>Profit:</span>
                      <span className="font-mono">{formatCurrency(profit)}</span>
                      <span className="text-[10px]">({profitMargin}%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 px-5 py-4 border-t-2 border-emerald-200 dark:border-emerald-700">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Total F&I</div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {products.filter(p => p.selected).length} product{products.filter(p => p.selected).length !== 1 ? 's' : ''} selected
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-600 dark:text-slate-400">Back-End Profit</div>
            <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalBackEnd)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Retail: {formatCurrency(totalRetail)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Default F&I products configuration
 */
export const defaultFIProducts: FIProduct[] = [
  {
    id: 'warranty',
    name: 'Extended Warranty',
    description: 'Comprehensive coverage up to 100k miles',
    retailPrice: 2495,
    cost: 1747,
    selected: false,
  },
  {
    id: 'gap',
    name: 'GAP Insurance',
    description: 'Covers loan balance if vehicle is totaled',
    retailPrice: 595,
    cost: 417,
    selected: false,
  },
  {
    id: 'maintenance',
    name: 'Maintenance Plan',
    description: 'Pre-paid scheduled maintenance',
    retailPrice: 1800,
    cost: 1260,
    selected: false,
  },
  {
    id: 'paintProtection',
    name: 'Paint Protection',
    description: 'Ceramic coating and protection package',
    retailPrice: 1295,
    cost: 907,
    selected: false,
  },
];
