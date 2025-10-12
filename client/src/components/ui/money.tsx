interface MoneyProps {
  cents?: number | null;
  className?: string;
  showZero?: boolean;
  currency?: string;
}

export function Money({ cents, className = "", showZero = false, currency = "$" }: MoneyProps) {
  if (cents == null || (cents === 0 && !showZero)) {
    return <span className={`inline-block min-w-24 text-right ${className}`} style={{ fontVariantNumeric: 'tabular-nums' }}>—</span>;
  }
  
  const isNegative = cents < 0;
  const absValue = Math.abs(cents);
  const formatted = (absValue / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return (
    <span 
      className={`inline-block min-w-24 text-right ${className}`}
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {isNegative ? `(${currency}${formatted})` : `${currency}${formatted}`}
    </span>
  );
}

interface MoneyInputProps {
  value?: number | null;
  onChange: (cents: number | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MoneyInput({ value, onChange, placeholder, className = "", disabled }: MoneyInputProps) {
  const displayValue = value != null ? (value / 100).toFixed(2) : '';
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/[^0-9.-]/g, '');
    if (inputValue === '' || inputValue === '-') {
      onChange(null);
      return;
    }
    
    const floatValue = parseFloat(inputValue);
    if (!isNaN(floatValue)) {
      onChange(Math.round(floatValue * 100));
    }
  };
  
  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`h-9 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-right ${className}`}
      style={{ fontVariantNumeric: 'tabular-nums' }}
    />
  );
}

interface AccountingTableProps {
  headers: string[];
  rows: React.ReactNode[][];
  footerRow?: React.ReactNode[];
  className?: string;
}

export function AccountingTable({ headers, rows, footerRow, className = "" }: AccountingTableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            {headers.map((header, idx) => (
              <th 
                key={idx}
                className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr 
              key={rowIdx}
              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="px-3 py-2 text-sm">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footerRow && (
          <tfoot>
            <tr className="border-t-2 border-gray-300 dark:border-gray-600 font-semibold">
              {footerRow.map((cell, idx) => (
                <td key={idx} className="px-3 py-3 text-sm">
                  {cell}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

interface KPICardProps {
  label: string;
  valueCents: number | null | undefined;
  color?: string;
  icon?: React.ReactNode;
  tooltip?: string;
  className?: string;
}

export function KPICard({ label, valueCents, color = "#6B7280", icon, tooltip, className = "" }: KPICardProps) {
  return (
    <div 
      className={`rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}
      title={tooltip}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      <div 
        className="text-2xl font-bold"
        style={{ color, fontVariantNumeric: 'tabular-nums' }}
      >
        <Money cents={valueCents} showZero />
      </div>
    </div>
  );
}

// Utility functions for calculations
export function centsToDisplay(cents: number | null | undefined, currency = "$"): string {
  if (cents == null) return '—';
  const isNegative = cents < 0;
  const absValue = Math.abs(cents);
  const formatted = (absValue / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return isNegative ? `(${currency}${formatted})` : `${currency}${formatted}`;
}

export function displayToCents(display: string): number | null {
  const cleaned = display.replace(/[^0-9.-]/g, '');
  const floatValue = parseFloat(cleaned);
  return isNaN(floatValue) ? null : Math.round(floatValue * 100);
}
