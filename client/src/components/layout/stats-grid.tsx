import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatItem {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  color?: 'default' | 'blue' | 'green' | 'red' | 'orange';
}

interface StatsGridProps {
  stats: StatItem[];
  cols?: 2 | 3 | 4;
}

export default function StatsGrid({ stats, cols = 4 }: StatsGridProps) {
  const colsClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  }[cols];

  const getColorClass = (color: string = 'default') => {
    const colors = {
      default: 'text-gray-600',
      blue: 'text-blue-600',
      green: 'text-green-600',
      red: 'text-red-600',
      orange: 'text-orange-600'
    };
    return colors[color as keyof typeof colors] || colors.default;
  };

  return (
    <div className={`grid ${colsClass} gap-4 mb-6`}>
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  {stat.trend && (
                    <div className={`flex items-center text-sm ${
                      stat.trend.direction === 'up' ? 'text-green-600' :
                      stat.trend.direction === 'down' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {stat.trend.direction === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
                      {stat.trend.direction === 'down' && <TrendingDown className="w-3 h-3 mr-1" />}
                      {stat.trend.value}
                    </div>
                  )}
                </div>
              </div>
              {stat.icon && (
                <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 ${getColorClass(stat.color)}`}>
                  {stat.icon}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}