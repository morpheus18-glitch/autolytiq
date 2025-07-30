import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Brain,
  Settings,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  Activity,
  Database,
  Cpu,
  Zap,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Sliders
} from 'lucide-react';

interface ModelParameters {
  hyperparameters: Record<string, any>;
  features: Record<string, any>;
  dataSettings?: Record<string, any>;
}

interface PipelineStatus {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'training' | 'failed';
  lastRun: string;
  nextRun: string;
  accuracy: number;
  [key: string]: any;
}

export default function MLDashboardControl() {
  const { toast } = useToast();
  const [pipelineStatus, setPipelineStatus] = useState<{pipelines: PipelineStatus[], systemHealth: any}>({pipelines: [], systemHealth: {}});
  const [modelParameters, setModelParameters] = useState<ModelParameters>({hyperparameters: {}, features: {}});
  const [selectedModel, setSelectedModel] = useState('pricing_analysis');
  const [trainingJobs, setTrainingJobs] = useState<any[]>([]);
  const [dataStats, setDataStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statusRes, paramsRes, statsRes] = await Promise.all([
        fetch('/api/ml/pipeline/status'),
        fetch(`/api/ml/models/${selectedModel}/parameters`),
        fetch('/api/ml/data/stats')
      ]);

      if (statusRes.ok) setPipelineStatus(await statusRes.json());
      if (paramsRes.ok) setModelParameters(await paramsRes.json());
      if (statsRes.ok) setDataStats(await statsRes.json());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleParameterUpdate = async () => {
    try {
      const response = await fetch(`/api/ml/models/${selectedModel}/parameters`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modelParameters)
      });

      if (response.ok) {
        toast({
          title: "Parameters Updated",
          description: "Model parameters updated successfully. Retraining scheduled."
        });
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update model parameters.",
        variant: "destructive"
      });
    }
  };

  const triggerTraining = async (modelId: string) => {
    try {
      const response = await fetch(`/api/ml/models/${modelId}/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force_retrain: true })
      });

      if (response.ok) {
        const job = await response.json();
        setTrainingJobs(prev => [job, ...prev]);
        toast({
          title: "Training Started",
          description: `Training job ${job.jobId} queued successfully.`
        });
      }
    } catch (error) {
      toast({
        title: "Training Failed",
        description: "Failed to start model training.",
        variant: "destructive"
      });
    }
  };

  const updateHyperparameter = (param: string, value: any) => {
    setModelParameters(prev => ({
      ...prev,
      hyperparameters: {
        ...prev.hyperparameters,
        [param]: { ...prev.hyperparameters[param], value }
      }
    }));
  };

  const updateFeatureWeight = (feature: string, weight: number) => {
    setModelParameters(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: { ...prev.features[feature], weight: weight / 100 }
      }
    }));
  };

  const toggleFeature = (feature: string, enabled: boolean) => {
    setModelParameters(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: { ...prev.features[feature], enabled }
      }
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'training': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'training': return <Clock className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading ML Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">ML Pipeline Control Center</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage machine learning models, parameters, and training pipelines</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={loadDashboardData} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => triggerTraining(selectedModel)}>
            <Play className="h-4 w-4 mr-2" />
            Start Training
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Cpu className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">CPU Usage</p>
                <p className="text-2xl font-bold">{pipelineStatus?.systemHealth?.cpu || 0}%</p>
              </div>
            </div>
            <div className="mt-2">
              <Progress value={pipelineStatus?.systemHealth?.cpu || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Memory</p>
                <p className="text-2xl font-bold">{pipelineStatus?.systemHealth?.memory || 0}%</p>
              </div>
            </div>
            <div className="mt-2">
              <Progress value={pipelineStatus?.systemHealth?.memory || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Active Tasks</p>
                <p className="text-2xl font-bold">{pipelineStatus?.systemHealth?.activeTasks || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Queue</p>
                <p className="text-2xl font-bold">{pipelineStatus?.systemHealth?.queuedTasks || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pipelines" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pipelines">Pipeline Status</TabsTrigger>
          <TabsTrigger value="parameters">Model Parameters</TabsTrigger>
          <TabsTrigger value="training">Training Jobs</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>

        <TabsContent value="pipelines" className="space-y-4">
          <div className="grid gap-4">
            {pipelineStatus?.pipelines?.map((pipeline) => (
              <Card key={pipeline.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${getStatusColor(pipeline.status)}`}>
                        {getStatusIcon(pipeline.status)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{pipeline.name}</CardTitle>
                        <p className="text-sm text-gray-600">ID: {pipeline.id}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(pipeline.status)}>
                      {pipeline.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium">Accuracy</p>
                      <p className="text-xl font-bold text-green-600">{pipeline.accuracy}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Last Run</p>
                      <p className="text-sm text-gray-600">
                        {new Date(pipeline.lastRun).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Next Run</p>
                      <p className="text-sm text-gray-600">
                        {new Date(pipeline.nextRun).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => triggerTraining(pipeline.id)}
                        disabled={pipeline.status === 'training'}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Retrain
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3 mr-1" />
                        Config
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="parameters" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <Label htmlFor="model-select">Select Model:</Label>
            <Select
              value={selectedModel}
              onValueChange={setSelectedModel}
            >
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pricing_analysis">Pricing Analysis</SelectItem>
                <SelectItem value="customer_segmentation">Customer Segmentation</SelectItem>
                <SelectItem value="demand_forecasting">Demand Forecasting</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Hyperparameters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sliders className="h-5 w-5 mr-2" />
                  Hyperparameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(modelParameters.hyperparameters || {}).map(([param, config]: [string, any]) => (
                  <div key={param} className="space-y-2">
                    <Label className="capitalize">{param.replace('_', ' ')}</Label>
                    {config.type === 'float' || config.type === 'int' ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">{config.min}</span>
                          <Slider
                            value={[config.value]}
                            onValueChange={([value]) => updateHyperparameter(param, value)}
                            min={config.min}
                            max={config.max}
                            step={config.type === 'int' ? 1 : 0.001}
                            className="flex-1"
                          />
                          <span className="text-sm text-gray-500">{config.max}</span>
                        </div>
                        <Input
                          type="number"
                          value={config.value}
                          onChange={(e) => updateHyperparameter(param, parseFloat(e.target.value))}
                          min={config.min}
                          max={config.max}
                          step={config.type === 'int' ? 1 : 0.001}
                        />
                      </div>
                    ) : config.type === 'select' ? (
                      <Select
                        value={config.value}
                        onValueChange={(value) => updateHyperparameter(param, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {config.options?.map((option: string) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Feature Weights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Feature Weights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(modelParameters.features || {}).map(([feature, config]: [string, any]) => (
                  <div key={feature} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="capitalize">{feature.replace('_', ' ')}</Label>
                      <Switch
                        checked={config.enabled}
                        onCheckedChange={(enabled) => toggleFeature(feature, enabled)}
                      />
                    </div>
                    {config.enabled && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">0%</span>
                          <Slider
                            value={[Math.round((config.weight || 0) * 100)]}
                            onValueChange={([value]) => updateFeatureWeight(feature, value)}
                            min={0}
                            max={100}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-sm text-gray-500">100%</span>
                        </div>
                        <p className="text-sm text-center font-medium">
                          {Math.round((config.weight || 0) * 100)}%
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center">
            <Button onClick={handleParameterUpdate} size="lg">
              <Settings className="h-4 w-4 mr-2" />
              Update Parameters
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <div className="space-y-4">
            {trainingJobs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No training jobs running. Start a training job to monitor progress here.</p>
                </CardContent>
              </Card>
            ) : (
              trainingJobs.map((job) => (
                <Card key={job.jobId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Training Job: {job.jobId}</CardTitle>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Progress</span>
                          <span>{job.progress || 0}%</span>
                        </div>
                        <Progress value={job.progress || 0} />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Started:</p>
                          <p className="text-gray-600">{new Date(job.startedAt).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="font-medium">Estimated Duration:</p>
                          <p className="text-gray-600">{job.estimatedDuration}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <div className="grid gap-4">
            {Object.entries(dataStats.datasets || {}).map(([key, dataset]: [string, any]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="capitalize">{key.replace('_', ' ')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium">Records</p>
                      <p className="text-xl font-bold">{dataset.records?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Quality</p>
                      <p className="text-xl font-bold text-green-600">{dataset.quality}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-sm text-gray-600">
                        {new Date(dataset.lastUpdated).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Sources</p>
                      <p className="text-sm text-gray-600">{dataset.sources?.length} sources</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}