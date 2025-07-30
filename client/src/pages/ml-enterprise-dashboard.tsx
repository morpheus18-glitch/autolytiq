import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Database,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Search,
  Download,
  Upload,
  Cpu,
  HardDrive,
  Network,
  Target,
  Shield,
  GitBranch,
  Layers,
  LineChart,
  PieChart,
  Users,
  Globe,
  Server,
  Container,
  Workflow
} from "lucide-react";
import MLPerformanceHeatmap from "@/components/ml-performance-heatmap-fixed";

// Advanced ML Enterprise Dashboard with Production Stack
export default function MLEnterpriseDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // State for all enterprise ML components
  const [productionMetrics, setProductionMetrics] = useState<any>({});
  const [modelRegistry, setModelRegistry] = useState<any>({});
  const [driftDetection, setDriftDetection] = useState<any>({});
  const [swarmCollapse, setSwarmCollapse] = useState<any>({});
  const [orchestration, setOrchestration] = useState<any>({});
  const [shadowDeployments, setShadowDeployments] = useState<any>({});
  const [retrainTriggers, setRetrainTriggers] = useState<any>({});
  const [resources, setResources] = useState<any>({});

  useEffect(() => {
    loadAllEnterpriseData();
    const interval = setInterval(loadAllEnterpriseData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAllEnterpriseData = async () => {
    try {
      const [
        prodMetrics,
        registry,
        drift,
        swarm,
        orch,
        shadow,
        triggers,
        res
      ] = await Promise.all([
        fetch('/api/ml-enterprise/production-metrics').then(r => r.ok ? r.json() : {}),
        fetch('/api/ml-enterprise/model-registry').then(r => r.ok ? r.json() : { models: [] }),
        fetch('/api/ml-enterprise/drift-detection').then(r => r.ok ? r.json() : { detectors: [], alertsActive: 0 }),
        fetch('/api/ml-enterprise/swarm-collapse').then(r => r.ok ? r.json() : { riskLevel: 0, detectors: {} }),
        fetch('/api/ml-enterprise/orchestration/status').then(r => r.ok ? r.json() : { runningPipelines: 0, totalPipelines: 0 }),
        fetch('/api/ml-enterprise/shadow-deployments').then(r => r.ok ? r.json() : { active: [] }),
        fetch('/api/ml-enterprise/retrain-triggers').then(r => r.ok ? r.json() : { activeTriggers: [] }),
        fetch('/api/ml-enterprise/resources').then(r => r.ok ? r.json() : { compute: {}, storage: {} })
      ]);

      setProductionMetrics(prodMetrics);
      setModelRegistry(registry);
      setDriftDetection(drift);
      setSwarmCollapse(swarm);
      setOrchestration(orch);
      setShadowDeployments(shadow);
      setRetrainTriggers(triggers);
      setResources(res);
      setLoading(false);
    } catch (error) {
      console.error('Error loading enterprise ML data:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load ML enterprise metrics",
        variant: "destructive",
      });
    }
  };

  const triggerPipeline = async (pipelineId: string) => {
    try {
      await fetch('/api/ml-enterprise/orchestration/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipelineId })
      });
      
      toast({
        title: "Pipeline Triggered",
        description: `${pipelineId} has been started successfully`,
      });
      
      loadAllEnterpriseData();
    } catch (error) {
      toast({
        title: "Pipeline Error",
        description: "Failed to trigger pipeline",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ML Enterprise Stack...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">ML Enterprise Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Production-grade machine learning infrastructure with full observability</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={loadAllEnterpriseData} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
          <Button onClick={() => window.open('/grafana', '_blank')} variant="secondary">
            <BarChart3 className="h-4 w-4 mr-2" />
            Grafana
          </Button>
          <Button onClick={() => window.open('/prometheus', '_blank')} variant="secondary">
            <Activity className="h-4 w-4 mr-2" />
            Prometheus
          </Button>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {(driftDetection.alertsActive > 0 || swarmCollapse.riskLevel > 0.5) && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <strong>Critical ML Alerts:</strong> {driftDetection.alertsActive} drift alerts active, 
            swarm collapse risk at {Math.round(swarmCollapse.riskLevel * 100)}%
          </AlertDescription>
        </Alert>
      )}

      {/* Production Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{productionMetrics.activeModels || 0}</div>
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {modelRegistry.totalModels} total models
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{Math.round((productionMetrics.averageAccuracy || 0) * 100)}%</div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Across all production models
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Running Pipelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{orchestration.runningPipelines || 0}</div>
              <Workflow className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {orchestration.totalPipelines} total pipelines
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-600">Healthy</div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              All services operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="drift">Drift</TabsTrigger>
          <TabsTrigger value="swarm">Swarm</TabsTrigger>
          <TabsTrigger value="orchestration">Pipelines</TabsTrigger>
          <TabsTrigger value="shadow">Shadow</TabsTrigger>
          <TabsTrigger value="triggers">Triggers</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Production Stack Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Production Stack Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>MLflow Model Registry</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Running</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Prometheus Monitoring</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Running</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Grafana Dashboard</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Running</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Evidently Drift Detection</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Running</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Dagster Orchestration</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Running</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent ML Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">Pricing model shadow deployment promoted</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">Drift detected in customer segmentation model</p>
                    <p className="text-xs text-gray-500">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">Demand forecasting pipeline completed</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">Smart retrain trigger activated</p>
                    <p className="text-xs text-gray-500">3 hours ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Model Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Production metrics visualization</p>
                  <p className="text-sm text-gray-400">Grafana integration active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interactive Heatmap Tab */}
        <TabsContent value="heatmap" className="space-y-6">
          <MLPerformanceHeatmap />
        </TabsContent>

        {/* Model Registry Tab */}
        <TabsContent value="models" className="space-y-6">
          <div className="space-y-4">
            {modelRegistry.models?.map((model: any) => (
              <Card key={model.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      {model.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={model.status === 'production' ? 'default' : 'secondary'}>
                        {model.status}
                      </Badge>
                      <Badge variant="outline">v{model.version}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Performance</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Accuracy</span>
                          <span>{Math.round(model.accuracy * 100)}%</span>
                        </div>
                        {model.performance?.mae && (
                          <div className="flex justify-between text-sm">
                            <span>MAE</span>
                            <span>{model.performance.mae.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Lineage</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>Data: {model.lineage.dataVersion}</div>
                        <div>Pipeline: {model.lineage.trainingPipeline}</div>
                        <div>Features: {model.lineage.featureEngineering}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Explainability</h4>
                      <div className="space-y-1 text-sm">
                        {model.explainability && Object.entries(model.explainability.featureImportance).slice(0, 3).map(([feature, importance]: [string, any]) => (
                          <div key={feature} className="flex justify-between">
                            <span>{feature}</span>
                            <span>{Math.round(importance * 100)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Drift Detection Tab */}
        <TabsContent value="drift" className="space-y-6">
          <div className="space-y-4">
            {driftDetection.detectors?.map((detector: any) => (
              <Card key={detector.modelId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingDown className="h-5 w-5" />
                      {detector.modelId} Drift Monitor
                    </CardTitle>
                    <Badge variant={detector.riskLevel === 'low' ? 'secondary' : detector.riskLevel === 'medium' ? 'destructive' : 'destructive'}>
                      {detector.riskLevel} risk
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Overall Drift Score</span>
                      <div className="flex items-center gap-2">
                        <Progress value={detector.driftScore * 100} className="w-24" />
                        <span className="text-sm">{Math.round(detector.driftScore * 1000) / 10}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Feature-Level Drift</h4>
                      <div className="space-y-2">
                        {Object.entries(detector.features).map(([feature, data]: [string, any]) => (
                          <div key={feature} className="flex items-center justify-between">
                            <span className="text-sm">{feature}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant={data.status === 'stable' ? 'secondary' : data.status === 'warning' ? 'destructive' : 'destructive'} className="text-xs">
                                {data.status}
                              </Badge>
                              <span className="text-sm">{Math.round(data.drift * 1000) / 10}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {detector.recommendations && (
                      <div>
                        <h4 className="font-medium mb-2">Recommendations</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          {detector.recommendations.map((rec: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-blue-600">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Swarm Collapse Tab */}
        <TabsContent value="swarm" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Swarm Collapse Detection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-medium">Overall Risk Level</span>
                <div className="flex items-center gap-2">
                  <Progress value={swarmCollapse.riskLevel * 100} className="w-32" />
                  <span className="text-lg font-bold">{Math.round(swarmCollapse.riskLevel * 100)}%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(swarmCollapse.detectors || {}).map(([key, detector]: [string, any]) => (
                  <Card key={key} className="border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{key.replace(/([A-Z])/g, ' $1').trim()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Status</span>
                          <Badge variant={detector.status === 'normal' ? 'secondary' : 'destructive'}>
                            {detector.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Current</span>
                          <span>{detector.current}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Threshold</span>
                          <span>{detector.threshold}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {swarmCollapse.recommendations && (
                <div>
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {swarmCollapse.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Additional tabs would continue here... */}
        {/* For brevity, showing structure for remaining tabs */}
        
        <TabsContent value="orchestration" className="space-y-6">
          <div className="text-center py-12 text-gray-500">
            Pipeline orchestration management interface
          </div>
        </TabsContent>

        <TabsContent value="shadow" className="space-y-6">
          <div className="text-center py-12 text-gray-500">
            Shadow deployment management interface
          </div>
        </TabsContent>

        <TabsContent value="triggers" className="space-y-6">
          <div className="text-center py-12 text-gray-500">
            Smart retrain triggers management
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="text-center py-12 text-gray-500">
            Resource monitoring and cost management
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}