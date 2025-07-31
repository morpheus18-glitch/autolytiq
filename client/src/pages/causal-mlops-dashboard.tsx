import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  RefreshCw,
  Brain,
  TrendingUp,
  AlertTriangle,
  Activity,
  Network,
  Zap,
  BarChart3,
  Eye,
  Play,
  Settings,
  Lightbulb
} from "lucide-react";

interface CausalNode {
  id: string;
  name: string;
  node_type: string;
  metrics_count: number;
  last_updated: string;
}

interface CausalEdge {
  source_node_id: string;
  target_node_id: string;
  relation_type: string;
  confidence: number;
  effect_size: number;
  discovery_method: string;
}

interface CausalGraph {
  nodes: CausalNode[];
  edges: CausalEdge[];
  metadata: {
    total_nodes: number;
    total_edges: number;
    created_at: string;
    last_updated: string;
  };
}

export default function CausalMLOpsDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [causalGraph, setCausalGraph] = useState<CausalGraph | null>(null);
  const [systemHealth, setSystemHealth] = useState<any>({});
  const [telemetryStatus, setTelemetryStatus] = useState<any>({});
  const [discoveryHistory, setDiscoveryHistory] = useState<any>({});
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [nodeInsights, setNodeInsights] = useState<any>({});

  useEffect(() => {
    loadCausalData();
    const interval = setInterval(loadCausalData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadCausalData = async () => {
    try {
      setLoading(true);
      
      // Load causal graph
      const graphResponse = await fetch('/api/causal/graph');
      if (graphResponse.ok) {
        const graphData = await graphResponse.json();
        setCausalGraph(graphData);
      }

      // Load system health
      const healthResponse = await fetch('/api/causal/health');
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setSystemHealth(healthData);
      }

      // Load telemetry status
      const telemetryResponse = await fetch('/api/causal/metrics/telemetry');
      if (telemetryResponse.ok) {
        const telemetryData = await telemetryResponse.json();
        setTelemetryStatus(telemetryData);
      }

      // Load discovery history
      const historyResponse = await fetch('/api/causal/discovery/history');
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setDiscoveryHistory(historyData);
      }

    } catch (error) {
      console.error('Error loading causal data:', error);
      toast({
        title: "Error",
        description: "Failed to load causal MLOps data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerCausalDiscovery = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/causal/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          time_range_minutes: 60,
          confidence_threshold: 0.6,
          force_refresh: true
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Discovery Started",
          description: `Analyzing ${result.data_points} data points across ${result.metrics.length} metrics`,
        });
        
        // Refresh data after a delay
        setTimeout(loadCausalData, 5000);
      } else {
        throw new Error('Discovery request failed');
      }
    } catch (error) {
      toast({
        title: "Discovery Failed",
        description: "Failed to start causal discovery process",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadNodeInsights = async (nodeId: string) => {
    try {
      const response = await fetch(`/api/causal/nodes/${nodeId}/insights`);
      if (response.ok) {
        const insights = await response.json();
        setNodeInsights(insights);
        setSelectedNode(nodeId);
      }
    } catch (error) {
      console.error('Error loading node insights:', error);
    }
  };

  const getNodeTypeIcon = (nodeType: string) => {
    switch (nodeType) {
      case 'model': return <Brain className="h-4 w-4" />;
      case 'feature': return <BarChart3 className="h-4 w-4" />;
      case 'pipeline': return <Activity className="h-4 w-4" />;
      case 'metric': return <TrendingUp className="h-4 w-4" />;
      default: return <Network className="h-4 w-4" />;
    }
  };

  const getConfidenceBadgeVariant = (confidence: number) => {
    if (confidence >= 0.8) return 'default';
    if (confidence >= 0.6) return 'secondary';
    return 'outline';
  };

  if (loading && !causalGraph) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 sm:mt-4 text-sm sm:text-base text-gray-600">Loading Causal MLOps System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Causal-Aware MLOps System
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
            Next-generation MLOps with predictive causal intelligence
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Button onClick={loadCausalData} variant="outline" disabled={loading} className="w-full sm:w-auto">
            <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-xs sm:text-sm">Refresh</span>
          </Button>
          <Button onClick={triggerCausalDiscovery} disabled={loading} className="w-full sm:w-auto">
            <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Discover Relationships</span>
          </Button>
        </div>
      </div>

      {/* System Health Alert */}
      {systemHealth.recommendations?.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <Lightbulb className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
            <strong>System Recommendations:</strong>
            <ul className="mt-1 list-disc list-inside">
              {systemHealth.recommendations.map((rec: string, idx: number) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
              Causal Nodes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-lg sm:text-xl md:text-2xl font-bold">
                {causalGraph?.metadata?.total_nodes || 0}
              </div>
              <Network className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              System components
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
              Causal Relationships
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-lg sm:text-xl md:text-2xl font-bold">
                {causalGraph?.metadata?.total_edges || 0}
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Discovered connections
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
              Active Adapters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-lg sm:text-xl md:text-2xl font-bold">
                {telemetryStatus.adapters_active || 0}
              </div>
              <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Data sources
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
              Discovery Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-lg sm:text-xl md:text-2xl font-bold">
                {discoveryHistory.total_sessions || 0}
              </div>
              <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Analysis runs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="graph" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 h-auto p-1">
          <TabsTrigger value="graph" className="text-xs sm:text-sm p-2">Causal Graph</TabsTrigger>
          <TabsTrigger value="telemetry" className="text-xs sm:text-sm p-2">Telemetry</TabsTrigger>
          <TabsTrigger value="insights" className="text-xs sm:text-sm p-2">Insights</TabsTrigger>
          <TabsTrigger value="predictions" className="text-xs sm:text-sm p-2">Predictions</TabsTrigger>
        </TabsList>

        {/* Causal Graph Tab */}
        <TabsContent value="graph" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Network className="h-4 w-4 sm:h-5 sm:w-5" />
                  Causal Nodes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {causalGraph?.nodes?.map((node) => (
                    <div
                      key={node.id}
                      className="flex items-center justify-between p-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => loadNodeInsights(node.id)}
                    >
                      <div className="flex items-center gap-2">
                        {getNodeTypeIcon(node.node_type)}
                        <div>
                          <div className="text-sm font-medium">{node.name}</div>
                          <div className="text-xs text-gray-500">{node.node_type}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {node.metrics_count} metrics
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                  Causal Relationships
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {causalGraph?.edges?.map((edge, idx) => (
                    <div key={idx} className="p-2 rounded-lg border">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-xs font-medium">
                          {edge.source_node_id} → {edge.target_node_id}
                        </div>
                        <Badge variant={getConfidenceBadgeVariant(edge.confidence)} className="text-xs">
                          {Math.round(edge.confidence * 100)}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{edge.discovery_method}</span>
                        <span>Effect: {edge.effect_size.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Telemetry Tab */}
        <TabsContent value="telemetry" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                Telemetry Adapters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2 text-sm">Active Adapters</h4>
                  <div className="space-y-1">
                    {telemetryStatus.adapter_names?.map((adapter: string) => (
                      <div key={adapter} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="capitalize">{adapter}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-sm">Available Metrics</h4>
                  <div className="text-xs text-gray-600 max-h-32 overflow-y-auto">
                    {telemetryStatus.available_metrics?.slice(0, 10).map((metric: string) => (
                      <div key={metric} className="py-0.5">{metric}</div>
                    ))}
                    {telemetryStatus.available_metrics?.length > 10 && (
                      <div className="text-gray-500 italic">
                        +{telemetryStatus.available_metrics.length - 10} more metrics
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4 sm:space-y-6">
          {selectedNode && nodeInsights.node_id ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Brain className="h-4 w-4 sm:h-5 sm:w-5" />
                  Node Insights: {nodeInsights.insights?.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 text-sm">Causal Parents (Influences)</h4>
                    <div className="space-y-1">
                      {nodeInsights.causal_parents?.map((parent: any, idx: number) => (
                        <div key={idx} className="text-sm p-2 rounded border">
                          <div className="flex justify-between">
                            <span>{parent.source}</span>
                            <Badge variant="secondary" className="text-xs">
                              {Math.round(parent.confidence * 100)}%
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{parent.method}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-sm">Causal Children (Influenced By)</h4>
                    <div className="space-y-1">
                      {nodeInsights.causal_children?.map((child: any, idx: number) => (
                        <div key={idx} className="text-sm p-2 rounded border">
                          <div className="flex justify-between">
                            <span>{child.target}</span>
                            <Badge variant="secondary" className="text-xs">
                              {Math.round(child.confidence * 100)}%
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{child.method}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a node from the Causal Graph tab to view detailed insights</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                Causal Impact Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Predict the downstream effects of system changes
                </p>
                <Button variant="outline" disabled>
                  <Play className="h-4 w-4 mr-2" />
                  Run Prediction Scenario
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Feature coming soon: What-if analysis and counterfactual predictions
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}