import { TrendingUp, TrendingDown, DollarSign, Users, Car, Text } from '@repo/ui';

interface Metric {
  label: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down';
    value: number;
  };
  icon: React.ComponentType<{ className?: string }>;
}

export function ReportsPage() {
  const metrics: Metric[] = [
    {
      label: 'Revenue',
      value: '$42,500',
      trend: { direction: 'up', value: 12 },
      icon: DollarSign,
    },
    {
      label: 'Deals Closed',
      value: 8,
      trend: { direction: 'up', value: 3 },
      icon: Car,
    },
    {
      label: 'Active Leads',
      value: 23,
      trend: { direction: 'down', value: 5 },
      icon: Users,
    },
    {
      label: 'Avg Profit/Deal',
      value: '$5,312',
      trend: { direction: 'up', value: 8 },
      icon: TrendingUp,
    },
  ];

  return (
    <div className="min-h-screen bg-bg-0">
      {/* iOS-style large title header */}
      <div className="sticky top-0 z-20 bg-bg-0/95 backdrop-blur-xl">
        <div className="px-4 pt-4 pb-3">
          <Text as="h1" variant="largeTitle" color="primary" className="mb-1">
            Reports
          </Text>
          <Text variant="subheadline" color="secondary" className="mb-4 opacity-70">
            Performance analytics
          </Text>
        </div>
        <div className="h-px bg-border-base/20" />
      </div>

      {/* Metrics grid */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            const TrendIcon = metric.trend?.direction === 'up' ? TrendingUp : TrendingDown;
            const trendColor = metric.trend?.direction === 'up' ? 'text-green-500' : 'text-red-500';

            return (
              <div
                key={index}
                className="bg-bg-1 rounded-2xl p-4 min-h-[120px] flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-bg-2 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-500" />
                  </div>
                  {metric.trend && (
                    <div className={`flex items-center gap-0.5 ${trendColor}`}>
                      <TrendIcon className="w-3 h-3" />
                      <Text as="span" variant="footnoteSemibold">
                        {metric.trend.value}%
                      </Text>
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-end">
                  <Text variant="title1" color="primary" className="mb-1">
                    {metric.value}
                  </Text>
                  <Text variant="footnote" color="secondary" className="opacity-70">
                    {metric.label}
                  </Text>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent activity section */}
      <div className="px-4 py-2">
        <Text as="h2" variant="title2" color="primary" className="mb-3 px-4">
          Recent Activity
        </Text>

        <div className="bg-bg-1 rounded-2xl overflow-hidden">
          {/* Activity items */}
          <div className="px-4 py-3 min-h-[60px] flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <Text variant="bodySemibold" color="primary">
                Deal Closed
              </Text>
              <Text variant="subheadline" color="secondary" className="opacity-80">
                2023 Honda Accord • John Doe
              </Text>
            </div>
            <Text variant="bodySemibold" className="text-green-500 flex-shrink-0">
              +$4,200
            </Text>
          </div>
          <div className="h-px bg-border-base/20 ml-[34px]" />

          <div className="px-4 py-3 min-h-[60px] flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <Text variant="bodySemibold" color="primary">
                New Lead
              </Text>
              <Text variant="subheadline" color="secondary" className="opacity-80">
                Jane Smith • Interested in SUVs
              </Text>
            </div>
          </div>
          <div className="h-px bg-border-base/20 ml-[34px]" />

          <div className="px-4 py-3 min-h-[60px] flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <Text variant="bodySemibold" color="primary">
                Test Drive
              </Text>
              <Text variant="subheadline" color="secondary" className="opacity-80">
                2024 Ford F-150 • Bob Johnson
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
