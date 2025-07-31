import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  Settings,
  TrendingUp,
  BarChart3,
  Cpu,
  Database,
  GitBranch,
  RefreshCw,
  Sliders,
  TestTube,
  Zap,
  Target,
  Brain,
  Clock,
  Users,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface MLPipeline {
  id: string;
  name: string;
  status: 'running' | 'idle' | 'failed' | 'training';
  accuracy: number;
  lastUpdated: string;
  predictions: number;
  type: 'lead_scoring' | 'pricing' | 'customer_segmentation' | 'service_recommendation';
}

interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confidenceScore: number;
  driftScore: number;
  businessImpact: {
    revenueImpact: number;
    costSavings: number;
    conversionImprovement: number;
  };
}

export default function MLOpsDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPipeline, setSelectedPipeline] = useState<string>('lead_scoring');
  const [parameterChanges, setParameterChanges] = useState<Record<string, any>>({});
  const [abTestMode, setAbTestMode] = useState(false);

  // Mock data for demonstration - in production, this would come from your ML API
  const { data: pipelines = [] } = useQuery({
    queryKey: ['/api/ml/pipelines'],
    queryFn: () => {
      return Promise.resolve([
        {
          id: 'lead_scoring',
          name: 'Lead Quality Predictor',
          status: 'running',
          accuracy: 87.3,
          lastUpdated: '2 minutes ago',
          predictions: 1247,
          type: 'lead_scoring'
        },
        {
          id: 'pricing',
          name: 'Vehicle Pricing Optimizer',
          status: 'running',
          accuracy: 92.1,
          lastUpdated: '5 minutes ago',
          predictions: 856,
          type: 'pricing'
        },
        {
          id: 'customer_segmentation',
          name: 'Customer Segmentation Engine',
          status: 'training',
          accuracy: 79.8,
          lastUpdated: '1 hour ago',
          predictions: 2341,
          type: 'customer_segmentation'
        },
        {
          id: 'service_recommendation',
          name: 'Service Recommendation AI',
          status: 'idle',
          accuracy: 84.7,
          lastUpdated: '3 hours ago',
          predictions: 432,
          type: 'service_recommendation'
        }
      ] as MLPipeline[]);
    }
  });

  const { data: metrics } = useQuery({
    queryKey: ['/api/ml/metrics', selectedPipeline],
    queryFn: () => {
      return Promise.resolve({
        accuracy: 87.3,
        precision: 89.1,
        recall: 85.2,
        f1Score: 87.1,
        confidenceScore: 92.4,
        driftScore: 3.2,
        businessImpact: {
          revenueImpact: 145000,
          costSavings: 23000,
          conversionImprovement: 12.4
        }
      } as ModelMetrics);
    }
  });

  const retrainModelMutation = useMutation({
    mutationFn: async (pipelineId: string) => {
      return await apiRequest(`/api/ml/retrain/${pipelineId}`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ml/pipelines'] });
      toast({
        title: "Model Retraining Started",
        description: "The model will be updated with new data patterns",
      });
    },
    onError: () => {
      toast({
        title: "Retraining Failed",
        description: "Could not start model retraining",
        variant: "destructive",
      });
    }
  });

  const updateParametersMutation = useMutation({
    mutationFn: async ({ pipelineId, params }: { pipelineId: string; params: any }) => {
      return await apiRequest(`/api/ml/parameters/${pipelineId}`, {
        method: 'POST',
        body: JSON.stringify(params)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ml/metrics'] });
      setParameterChanges({});
      toast({
        title: "Parameters Updated",
        description: "Model configuration has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Could not update model parameters",
        variant: "destructive",
      });
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="w-4 h-4 text-green-600" />;
      case 'training': return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'idle': return <Pause className="w-4 h-4 text-gray-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'training': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'idle': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const currentPipeline = pipelines.find(p => p.id === selectedPipeline);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ML Operations Center</h1>
          <p className="text-gray-600">Monitor and manage machine learning pipelines</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <GitBranch className="w-4 h-4 mr-2" />
            Version Control
          </Button>
          <Button size="sm">
            <TestTube className="w-4 h-4 mr-2" />
            A/B Test
          </Button>
        </div>
      </div>

      {/* Pipeline Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {pipelines.map((pipeline) => (
          <Card 
            key={pipeline.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedPipeline === pipeline.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedPipeline(pipeline.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(pipeline.status)}
                    <Badge className={getStatusColor(pipeline.status)}>
                      {pipeline.status}
                    </Badge>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">{pipeline.name}</h3>
                  <p className="text-sm text-gray-500">Updated {pipeline.lastUpdated}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{pipeline.accuracy}%</p>
                  <p className="text-xs text-gray-500">accuracy</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Performance</span>
                  <span>{pipeline.predictions} predictions</span>
                </div>
                <Progress value={pipeline.accuracy} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="parameters">Parameter Tuning</TabsTrigger>
          <TabsTrigger value="monitoring">Real-time Monitoring</TabsTrigger>
          <TabsTrigger value="business">Business Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Model Performance Metrics */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Accuracy</p>
                      <p className="text-2xl font-bold text-green-600">{metrics.accuracy}%</p>
                    </div>
                    <Target className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Precision</p>
                      <p className="text-2xl font-bold text-blue-600">{metrics.precision}%</p>
                    </div>
                    <Brain className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Recall</p>
                      <p className="text-2xl font-bold text-purple-600">{metrics.recall}%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">F1 Score</p>
                      <p className="text-2xl font-bold text-orange-600">{metrics.f1Score}%</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Confidence</p>
                      <p className="text-2xl font-bold text-teal-600">{metrics.confidenceScore}%</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-teal-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Drift Score</p>
                      <p className={`text-2xl font-bold ${metrics.driftScore > 5 ? 'text-red-600' : 'text-green-600'}`}>
                        {metrics.driftScore}%
                      </p>
                    </div>
                    <AlertTriangle className={`w-8 h-8 ${metrics.driftScore > 5 ? 'text-red-600' : 'text-green-600'}`} />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Pipeline Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Pipeline Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  onClick={() => retrainModelMutation.mutate(selectedPipeline)}
                  disabled={retrainModelMutation.isPending}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${retrainModelMutation.isPending ? 'animate-spin' : ''}`} />
                  Retrain Model
                </Button>
                
                <Button variant="outline">
                  <Cpu className="w-4 h-4 mr-2" />
                  Deploy to Production
                </Button>
                
                <Button variant="outline">
                  <Database className="w-4 h-4 mr-2" />
                  Export Model
                </Button>
                
                <div className="flex items-center gap-2">
                  <Switch 
                    id="ab-test" 
                    checked={abTestMode}
                    onCheckedChange={setAbTestMode}
                  />
                  <Label htmlFor="ab-test">A/B Testing Mode</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parameters" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sliders className="w-5 h-5" />
                Model Parameters - {currentPipeline?.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Learning Rate */}
              <div className="space-y-2">
                <Label>Learning Rate</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[parameterChanges.learningRate || 0.01]}
                    onValueChange={(value) => setParameterChanges(prev => ({...prev, learningRate: value[0]}))}
                    max={0.1}
                    min={0.001}
                    step={0.001}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 w-16">
                    {(parameterChanges.learningRate || 0.01).toFixed(3)}
                  </span>
                </div>
              </div>

              {/* Confidence Threshold */}
              <div className="space-y-2">
                <Label>Confidence Threshold</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[parameterChanges.confidenceThreshold || 0.8]}
                    onValueChange={(value) => setParameterChanges(prev => ({...prev, confidenceThreshold: value[0]}))}
                    max={1}
                    min={0.5}
                    step={0.01}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 w-16">
                    {(parameterChanges.confidenceThreshold || 0.8).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Model Type Selection */}
              <div className="space-y-2">
                <Label>Algorithm</Label>
                <Select 
                  value={parameterChanges.algorithm || 'xgboost'}
                  onValueChange={(value) => setParameterChanges(prev => ({...prev, algorithm: value}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xgboost">XGBoost</SelectItem>
                    <SelectItem value="random_forest">Random Forest</SelectItem>
                    <SelectItem value="neural_network">Neural Network</SelectItem>
                    <SelectItem value="svm">Support Vector Machine</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Feature Weights */}
              <div className="space-y-2">
                <Label>Market Competition Weight</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[parameterChanges.marketWeight || 0.3]}
                    onValueChange={(value) => setParameterChanges(prev => ({...prev, marketWeight: value[0]}))}
                    max={1}
                    min={0}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 w-16">
                    {(parameterChanges.marketWeight || 0.3).toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => updateParametersMutation.mutate({
                    pipelineId: selectedPipeline,
                    params: parameterChanges
                  })}
                  disabled={updateParametersMutation.isPending || Object.keys(parameterChanges).length === 0}
                >
                  Apply Changes
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setParameterChanges({})}
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Real-time Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Predictions/minute</span>
                    <span className="font-medium">247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average response time</span>
                    <span className="font-medium">120ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Memory usage</span>
                    <span className="font-medium">2.3GB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">CPU usage</span>
                    <span className="font-medium">34%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Processing Queue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending predictions</span>
                    <Badge variant="secondary">23</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Training jobs</span>
                    <Badge variant="outline">1 running</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Failed jobs (24h)</span>
                    <Badge variant="destructive">2</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Revenue Impact</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${metrics.businessImpact.revenueImpact.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">This month</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Cost Savings</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ${metrics.businessImpact.costSavings.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">Automation benefits</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Conversion Boost</p>
                      <p className="text-2xl font-bold text-purple-600">
                        +{metrics.businessImpact.conversionImprovement}%
                      </p>
                      <p className="text-xs text-gray-500">Lead conversion</p>
                    </div>
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>User Adoption by Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { role: 'Sales Managers', adoption: 87, users: 12 },
                  { role: 'Sales Associates', adoption: 73, users: 34 },
                  { role: 'Finance Managers', adoption: 94, users: 8 },
                  { role: 'Service Advisors', adoption: 65, users: 19 }
                ].map((item) => (
                  <div key={item.role} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{item.role}</span>
                      <span>{item.adoption}% ({item.users} users)</span>
                    </div>
                    <Progress value={item.adoption} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}