import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';

interface ValuationData {
  source: string;
  value: number;
  lastUpdated: string;
  trend?: 'up' | 'down' | 'stable';
  change?: number;
  confidence?: 'high' | 'medium' | 'low';
  dataAge?: number; // in days
}

interface ValuationCardProps {
  valuations: ValuationData[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

export default function ValuationCard({ 
  valuations, 
  onRefresh, 
  isLoading = false 
}: ValuationCardProps) {
  const getSourceColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'kbb':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'mmr':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'black book':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'j.d. power':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getDataFreshnessColor = (days: number) => {
    if (days <= 1) return 'text-green-600';
    if (days <= 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Market Valuations</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {valuations.map((valuation, index) => (
            <div key={index} className={`p-4 rounded-lg border-2 ${getSourceColor(valuation.source)}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{valuation.source}</h3>
                {valuation.trend && getTrendIcon(valuation.trend)}
              </div>
              
              <div className="text-2xl font-bold mb-1">
                ${valuation.value.toLocaleString()}
              </div>
              
              {valuation.change && (
                <div className="flex items-center text-sm mb-2">
                  {valuation.trend === 'up' ? '+' : valuation.trend === 'down' ? '-' : ''}
                  ${Math.abs(valuation.change).toLocaleString()} from last check
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Updated:</span>
                  <span className={getDataFreshnessColor(valuation.dataAge || 0)}>
                    {format(new Date(valuation.lastUpdated), 'MMM dd, HH:mm')}
                  </span>
                </div>
                
                {valuation.confidence && (
                  <Badge variant="outline" className={getConfidenceColor(valuation.confidence)}>
                    {valuation.confidence} confidence
                  </Badge>
                )}
              </div>
              
              {valuation.dataAge && valuation.dataAge > 7 && (
                <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                  Data is {valuation.dataAge} days old - consider refreshing
                </div>
              )}
            </div>
          ))}
        </div>
        
        {valuations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No valuation data available</p>
            <Button variant="outline" className="mt-2" onClick={onRefresh}>
              Fetch Valuations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}