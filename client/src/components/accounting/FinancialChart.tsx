import { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export type ChartSeries = {
  dataKey: string;
  name: string;
  color?: string;
};

export type FinancialChartType = 'line' | 'bar' | 'area';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

interface FinancialChartProps<T extends Record<string, unknown>> {
  data: T[];
  xKey: keyof T;
  series: ChartSeries[];
  type?: FinancialChartType;
  height?: number;
  showLegend?: boolean;
  formatCurrency?: boolean;
}

export function FinancialChart<T extends Record<string, unknown>>({
  data,
  xKey,
  series,
  type = 'line',
  height = 260,
  showLegend = true,
  formatCurrency = true,
}: FinancialChartProps<T>) {
  const chartData = useMemo(() => data ?? [], [data]);

  const formatYAxis = (value: number) => (formatCurrency ? currencyFormatter.format(value) : numberFormatter.format(value));
  const formatTooltip = (value: number) => formatYAxis(Number(value));

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={height}>
        {type === 'bar' ? (
          <BarChart data={chartData} className="text-muted-foreground">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey={xKey as string} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={formatYAxis} tickLine={false} axisLine={false} width={80} />
            <Tooltip formatter={formatTooltip} />
            {showLegend && <Legend />}
            {series.map((item) => (
              <Bar key={item.dataKey} dataKey={item.dataKey} name={item.name} fill={item.color ?? '#2563eb'} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        ) : type === 'area' ? (
          <AreaChart data={chartData} className="text-muted-foreground">
            <defs>
              {series.map((item) => (
                <linearGradient key={item.dataKey} id={`gradient-${item.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={item.color ?? '#2563eb'} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={item.color ?? '#2563eb'} stopOpacity={0.05} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey={xKey as string} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={formatYAxis} tickLine={false} axisLine={false} width={80} />
            <Tooltip formatter={formatTooltip} />
            {showLegend && <Legend />}
            {series.map((item) => (
              <Area
                key={item.dataKey}
                type="monotone"
                dataKey={item.dataKey}
                name={item.name}
                stroke={item.color ?? '#2563eb'}
                fill={`url(#gradient-${item.dataKey})`}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        ) : (
          <LineChart data={chartData} className="text-muted-foreground">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey={xKey as string} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={formatYAxis} tickLine={false} axisLine={false} width={80} />
            <Tooltip formatter={formatTooltip} />
            {showLegend && <Legend />}
            {series.map((item) => (
              <Line
                key={item.dataKey}
                type="monotone"
                dataKey={item.dataKey}
                name={item.name}
                stroke={item.color ?? '#2563eb'}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export default FinancialChart;
