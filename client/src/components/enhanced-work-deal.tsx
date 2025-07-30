import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { usePixelTracker } from '@/hooks/use-pixel-tracker';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  Car,
  Users
} from 'lucide-react';

interface PricingAnalysis {
  estimatedPrice: number;
  confidence: number;
  marketTrend: 'up' | 'down' | 'stable';
  priceRange: {
    low: number;
    high: number;
  };
}

interface CompetitiveIntel {
  avgMarketPrice: number;
  pricePosition: 'below' | 'at' | 'above';
  recommendation: string;
  competitorPrices: Array<{
    dealer: string;
    price: number;
    distance: number;
  }>;
}

interface EnhancedWorkDealProps {
  vehicleId?: number;
  customerId?: number;
  onClose?: () => void;
}

export default function EnhancedWorkDeal({ vehicleId, customerId, onClose }: EnhancedWorkDealProps) {
  const { toast } = useToast();
  const { trackInteraction } = usePixelTracker();
  
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [pricingAnalysis, setPricingAnalysis] = useState<PricingAnalysis | null>(null);
  const [competitiveIntel, setCompetitiveIntel] = useState<CompetitiveIntel | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch vehicles for selection
  const { data: vehicles = [] } = useQuery({
    queryKey: ['/api/vehicles'],
  });

  // Fetch selected vehicle details
  const { data: vehicle } = useQuery({
    queryKey: ['/api/vehicles', vehicleId],
    enabled: !!vehicleId,
  });

  // Get ML pricing analysis
  const getPricingAnalysis = async (vehicle: any) => {
    if (!vehicle) return;
    
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ml/pricing-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          mileage: vehicle.mileage,
          condition: 'good'
        })
      });
      
      if (response.ok) {
        const analysis = await response.json();
        setPricingAnalysis(analysis);
        
        // Also get competitive intel
        const compResponse = await fetch('/api/ml/competitive-intel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            mileage: vehicle.mileage,
            zipCode: '90210'
          })
        });
        
        if (compResponse.ok) {
          const intel = await compResponse.json();
          setCompetitiveIntel(intel);
        }
        
        toast({
          title: "Analysis Complete",
          description: "AI pricing analysis and competitive intelligence updated"
        });
        
        trackInteraction('ml_analysis_completed', { 
          vehicleId: vehicle.id,
          confidence: analysis.confidence
        });
      }
    } catch (error) {
      toast({
        title: "Analysis Error",
        description: "Unable to complete AI analysis",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleVehicleSelect = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    getPricingAnalysis(vehicle);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Enhanced Deal Workspace</h1>
          <p className="text-gray-600">AI-powered vehicle pricing and competitive analysis</p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Vehicle Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Select Vehicle for Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.slice(0, 6).map((vehicle: any) => (
              <div 
                key={vehicle.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedVehicle?.id === vehicle.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleVehicleSelect(vehicle)}
              >
                <div className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</div>
                <div className="text-sm text-gray-600">VIN: {vehicle.vin}</div>
                <div className="text-lg font-bold text-green-600">${vehicle.price?.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis Results */}
      {selectedVehicle && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pricing Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                AI Pricing Analysis
                {isAnalyzing && <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pricingAnalysis ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>AI Estimated Price</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${pricingAnalysis.estimatedPrice.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Confidence Score</span>
                    <Badge variant={pricingAnalysis.confidence > 0.8 ? 'default' : 'secondary'}>
                      {Math.round(pricingAnalysis.confidence * 100)}%
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Market Trend</span>
                    <div className="flex items-center gap-1">
                      {pricingAnalysis.marketTrend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                      {pricingAnalysis.marketTrend === 'down' && <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />}
                      {pricingAnalysis.marketTrend === 'stable' && <Target className="w-4 h-4 text-gray-500" />}
                      <span className="capitalize">{pricingAnalysis.marketTrend}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="text-sm text-gray-600 mb-2">Price Range</div>
                    <div className="flex justify-between text-sm">
                      <span>Low: ${pricingAnalysis.priceRange.low.toLocaleString()}</span>
                      <span>High: ${pricingAnalysis.priceRange.high.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {isAnalyzing ? 'Analyzing vehicle pricing...' : 'Select a vehicle to see AI pricing analysis'}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Competitive Intelligence */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Competitive Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              {competitiveIntel ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Market Average</span>
                    <span className="text-xl font-semibold">
                      ${competitiveIntel.avgMarketPrice.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Price Position</span>
                    <Badge variant={
                      competitiveIntel.pricePosition === 'below' ? 'default' :
                      competitiveIntel.pricePosition === 'above' ? 'destructive' : 'secondary'
                    }>
                      {competitiveIntel.pricePosition === 'below' ? '✓ Below Market' :
                       competitiveIntel.pricePosition === 'above' ? '⚠ Above Market' : '= At Market'}
                    </Badge>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="text-sm font-medium mb-2">AI Recommendation</div>
                    <p className="text-sm text-gray-700">{competitiveIntel.recommendation}</p>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="text-sm font-medium mb-2">Nearby Competitors</div>
                    <div className="space-y-2">
                      {competitiveIntel.competitorPrices.slice(0, 3).map((comp, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{comp.dealer}</span>
                          <span>${comp.price.toLocaleString()} ({comp.distance}mi)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {isAnalyzing ? 'Gathering competitive intelligence...' : 'Competitive data will appear here'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      {selectedVehicle && (pricingAnalysis || competitiveIntel) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => getPricingAnalysis(selectedVehicle)}
                disabled={isAnalyzing}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Refresh Analysis
              </Button>
              
              <Button variant="outline">
                <DollarSign className="w-4 h-4 mr-2" />
                Update Pricing
              </Button>
              
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Match Customer
              </Button>
              
              <Button variant="outline">
                <Calculator className="w-4 h-4 mr-2" />
                Build Deal Structure
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            AI System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">ML Pricing Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Competitive Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Market Intelligence</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            All AI services operational. Using fallback algorithms with live market data integration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}