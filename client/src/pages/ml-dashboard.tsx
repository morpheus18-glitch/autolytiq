import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { usePixelTracker } from '@/hooks/use-pixel-tracker';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Brain, 
  TrendingUp, 
  BarChart3, 
  Target, 
  Zap, 
  Activity,
  PlayCircle,
  Settings,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Car,
  Clock,
  Database,
  Monitor,
  Server,
  Cpu,
  Eye
} from 'lucide-react';

interface MLStatus {
  pipeline_running: boolean;
  last_scraping: string | null;
  last_training: string | null;
  model_metrics: {
    mae: number;
    rmse: number;
    r2: number;
    mape: number;
  } | null;
  scrapers_status: Record<string, any>;
}

interface PricePrediction {
  predicted_price: number;
  confidence_interval: {
    lower_bound: number;
    upper_bound: number;
    confidence_level: number;
  };
  market_insights: {
    price_category: string;
    market_position: string;
    depreciation_rate: number;
    demand_score: number;
    recommendations: string[];
  };
  model_version: string;
  prediction_timestamp: string;
}

export default function MLDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { trackInteraction } = usePixelTracker();
  
  const [predictionForm, setPredictionForm] = useState({
    make: '',
    model: '',
    year: '',
    mileage: '',
    bodyType: 'Sedan'
  });
  
  const [showPredictionDialog, setShowPredictionDialog] = useState(false);
  const [latestPrediction, setLatestPrediction] = useState<PricePrediction | null>(null);

  // Fetch ML status
  const { data: mlStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/ml/status'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Run scraping mutation
  const scrapeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/ml/scrape');
      return response.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: 'Scraping started', 
        description: data.success ? 'Scraping cycle initiated successfully' : 'Scraping failed to start'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ml/status'] });
    },
    onError: () => {
      toast({ title: 'Failed to start scraping', variant: 'destructive' });
    },
  });

  // Run training mutation
  const trainMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/ml/train');
      return response.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: 'Training started', 
        description: data.success ? 'Model training initiated successfully' : 'Training failed to start'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ml/status'] });
    },
    onError: () => {
      toast({ title: 'Failed to start training', variant: 'destructive' });
    },
  });

  // Price prediction mutation
  const predictMutation = useMutation({
    mutationFn: async (vehicleData: any) => {
      const response = await apiRequest('POST', '/api/ml/predict-price', vehicleData);
      return response.json();
    },
    onSuccess: (data) => {
      setLatestPrediction(data);
      toast({ title: 'Price prediction generated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to generate price prediction', variant: 'destructive' });
    },
  });

  // Start dashboard mutation
  const startDashboardMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/ml/start-dashboard');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'ML Dashboard started on port 8501' });
    },
    onError: () => {
      toast({ title: 'Failed to start ML dashboard', variant: 'destructive' });
    },
  });

  const handlePrediction = () => {
    if (!predictionForm.make || !predictionForm.model || !predictionForm.year) {
      toast({ title: 'Please fill in make, model, and year', variant: 'destructive' });
      return;
    }

    const vehicleData = {
      make: predictionForm.make,
      model: predictionForm.model,
      year: parseInt(predictionForm.year),
      mileage: parseInt(predictionForm.mileage) || 50000,
      body_type: predictionForm.bodyType
    };

    trackInteraction('ml_prediction', 'predict-button');
    predictMutation.mutate(vehicleData);
  };

  const handleScrape = () => {
    trackInteraction('ml_scrape', 'scrape-button');
    scrapeMutation.mutate();
  };

  const handleTrain = () => {
    trackInteraction('ml_train', 'train-button');
    trainMutation.mutate();
  };

  const handleStartDashboard = () => {
    trackInteraction('ml_dashboard', 'dashboard-button');
    startDashboardMutation.mutate();
  };

  if (statusLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const status = mlStatus as MLStatus;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ML Dashboard</h1>
          <p className="text-gray-600">Machine Learning Pricing Intelligence</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleStartDashboard}
            disabled={startDashboardMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Monitor className="h-4 w-4 mr-2" />
            {startDashboardMutation.isPending ? 'Starting...' : 'Open Full Dashboard'}
          </Button>
          <Button 
            onClick={() => setShowPredictionDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Brain className="h-4 w-4 mr-2" />
            Get Price Prediction
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {status?.pipeline_running ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
              <span className="text-sm font-medium">
                {status?.pipeline_running ? 'Running' : 'Stopped'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Scraping</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {status?.last_scraping 
                ? new Date(status.last_scraping).toLocaleDateString()
                : 'Never'
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Training</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {status?.last_training 
                ? new Date(status.last_training).toLocaleDateString()
                : 'Never'
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {status?.model_metrics?.mae 
                ? `MAE: $${status.model_metrics.mae.toLocaleString()}`
                : 'No metrics'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="scrapers">Scrapers</TabsTrigger>
          <TabsTrigger value="model">Model Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pipeline Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Pipeline Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleScrape}
                  disabled={scrapeMutation.isPending}
                  className="w-full"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {scrapeMutation.isPending ? 'Scraping...' : 'Run Scraping Cycle'}
                </Button>
                <Button 
                  onClick={handleTrain}
                  disabled={trainMutation.isPending}
                  className="w-full"
                  variant="outline"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {trainMutation.isPending ? 'Training...' : 'Train Model'}
                </Button>
              </CardContent>
            </Card>

            {/* Latest Prediction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Latest Prediction
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latestPrediction ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Predicted Price:</span>
                      <span className="text-xl font-bold text-green-600">
                        ${latestPrediction.predicted_price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Range:</span>
                      <span className="text-sm">
                        ${latestPrediction.confidence_interval.lower_bound.toLocaleString()} - 
                        ${latestPrediction.confidence_interval.upper_bound.toLocaleString()}
                      </span>
                    </div>
                    <Badge variant="outline" className="w-fit">
                      {latestPrediction.market_insights.price_category}
                    </Badge>
                    {latestPrediction.market_insights.recommendations.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">Recommendations:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {latestPrediction.market_insights.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No predictions yet</p>
                    <p className="text-sm">Click "Get Price Prediction" to generate one</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Price Prediction Tool</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="make">Make</Label>
                  <Input
                    id="make"
                    placeholder="e.g., Toyota"
                    value={predictionForm.make}
                    onChange={(e) => setPredictionForm({...predictionForm, make: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    placeholder="e.g., Camry"
                    value={predictionForm.model}
                    onChange={(e) => setPredictionForm({...predictionForm, model: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="e.g., 2020"
                    value={predictionForm.year}
                    onChange={(e) => setPredictionForm({...predictionForm, year: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="mileage">Mileage</Label>
                  <Input
                    id="mileage"
                    type="number"
                    placeholder="e.g., 50000"
                    value={predictionForm.mileage}
                    onChange={(e) => setPredictionForm({...predictionForm, mileage: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="bodyType">Body Type</Label>
                  <Select value={predictionForm.bodyType} onValueChange={(value) => setPredictionForm({...predictionForm, bodyType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sedan">Sedan</SelectItem>
                      <SelectItem value="SUV">SUV</SelectItem>
                      <SelectItem value="Truck">Truck</SelectItem>
                      <SelectItem value="Coupe">Coupe</SelectItem>
                      <SelectItem value="Hatchback">Hatchback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handlePrediction}
                    disabled={predictMutation.isPending}
                    className="w-full"
                  >
                    {predictMutation.isPending ? 'Predicting...' : 'Get Prediction'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scrapers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {status?.scrapers_status && Object.entries(status.scrapers_status).map(([name, info]: [string, any]) => (
              <Card key={name}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="capitalize">{name}</span>
                    <Badge variant={info.status === 'healthy' ? 'default' : 'destructive'}>
                      {info.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {info.last_success && (
                      <div>
                        <span className="font-medium">Last Success:</span> {new Date(info.last_success).toLocaleString()}
                      </div>
                    )}
                    {info.last_error && (
                      <div>
                        <span className="font-medium">Last Error:</span> {new Date(info.last_error).toLocaleString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="model" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {status?.model_metrics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">${status.model_metrics.mae.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Mean Absolute Error</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">${status.model_metrics.rmse.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Root Mean Square Error</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{status.model_metrics.r2.toFixed(3)}</div>
                    <div className="text-sm text-gray-600">R² Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{status.model_metrics.mape.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Mean Absolute Percentage Error</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No model metrics available</p>
                  <p className="text-sm">Train a model to see performance metrics</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Prediction Dialog */}
      <Dialog open={showPredictionDialog} onOpenChange={setShowPredictionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Get Price Prediction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="dialog-make">Make</Label>
              <Input
                id="dialog-make"
                placeholder="e.g., Toyota"
                value={predictionForm.make}
                onChange={(e) => setPredictionForm({...predictionForm, make: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="dialog-model">Model</Label>
              <Input
                id="dialog-model"
                placeholder="e.g., Camry"
                value={predictionForm.model}
                onChange={(e) => setPredictionForm({...predictionForm, model: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="dialog-year">Year</Label>
              <Input
                id="dialog-year"
                type="number"
                placeholder="e.g., 2020"
                value={predictionForm.year}
                onChange={(e) => setPredictionForm({...predictionForm, year: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="dialog-mileage">Mileage</Label>
              <Input
                id="dialog-mileage"
                type="number"
                placeholder="e.g., 50000"
                value={predictionForm.mileage}
                onChange={(e) => setPredictionForm({...predictionForm, mileage: e.target.value})}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handlePrediction}
                disabled={predictMutation.isPending}
                className="flex-1"
              >
                {predictMutation.isPending ? 'Predicting...' : 'Get Prediction'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowPredictionDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}