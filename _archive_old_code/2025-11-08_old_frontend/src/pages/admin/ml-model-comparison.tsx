import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Button } from '@repo/ui';
import { Badge } from '@repo/ui';
import { Progress } from '@repo/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui';
import { Alert, AlertDescription } from '@repo/ui';
import { useToast } from "@repo/ui";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter
} from "recharts";
import {
  TrendingUp,
  BarChart3,
  Target,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Eye,
  Activity,
  Brain,
  Gauge
} from "lucide-react";

interface ModelMetrics {
  id: string;
  name: string;
  type: string;
  version: string;
  status: 'active' | 'training' | 'inactive';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  trainingTime: number;
  inferenceTime: number;
  dataSize: number;
  lastTrained: string;
  predictions: number;
  errorRate: number;
  confidence: number;
  performanceHistory: Array<{
    date: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  }>;
  featureImportance: Record<string, number>;
  confusionMatrix: {
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
  };
}

interface ComparisonData {
  metric: string;
  model1: number;
  model2: number;
  model3?: number;
  model4?: number;
}

export default function MLModelComparison() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<ModelMetrics[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [comparisonMode, setComparisonMode] = useState<'metrics' | 'performance' | 'features' | 'timeline'>('metrics');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadModelMetrics();
  }, []);

  const loadModelMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ml/models/comparison-data');
      if (response.ok) {
        const data = await response.json();
        setModels(data.models || []);
        if (data.models && data.models.length >= 2) {
          setSelectedModels([data.models[0].id, data.models[1].id]);
        }
      }
    } catch (error) {
      console.error('Error loading model metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load model comparison data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompareModels = async () => {
    if (selectedModels.length < 2) {
      toast({
        title: "Selection Required",
        description: "Please select at least 2 models to compare",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/ml/models/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelIds: selectedModels, timeRange })
      });

      if (response.ok) {
        const data = await response.json();
        // Update models with comparison data
        setModels(data.models || models);
        toast({
          title: "Comparison Updated",
          description: `Successfully compared ${selectedModels.length} models`,
        });
      }
    } catch (error) {
      console.error('Error comparing models:', error);
      toast({
        title: "Comparison Failed",
        description: "Failed to generate model comparison",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getComparisonData = (): ComparisonData[] => {
    const selectedModelData = models.filter(m => selectedModels.includes(m.id));
    if (selectedModelData.length < 2) return [];

    return [
      {
        metric: 'Accuracy',
        model1: selectedModelData[0]?.accuracy || 0,
        model2: selectedModelData[1]?.accuracy || 0,
        model3: selectedModelData[2]?.accuracy,
        model4: selectedModelData[3]?.accuracy,
      },
      {
        metric: 'Precision',
        model1: selectedModelData[0]?.precision || 0,
        model2: selectedModelData[1]?.precision || 0,
        model3: selectedModelData[2]?.precision,
        model4: selectedModelData[3]?.precision,
      },
      {
        metric: 'Recall',
        model1: selectedModelData[0]?.recall || 0,
        model2: selectedModelData[1]?.recall || 0,
        model3: selectedModelData[2]?.recall,
        model4: selectedModelData[3]?.recall,
      },
      {
        metric: 'F1 Score',
        model1: selectedModelData[0]?.f1Score || 0,
        model2: selectedModelData[1]?.f1Score || 0,
        model3: selectedModelData[2]?.f1Score,
        model4: selectedModelData[3]?.f1Score,
      },
      {
        metric: 'AUC',
        model1: selectedModelData[0]?.auc || 0,
        model2: selectedModelData[1]?.auc || 0,
        model3: selectedModelData[2]?.auc,
        model4: selectedModelData[3]?.auc,
      }
    ];
  };

  const getPerformanceTimelineData = () => {
    const selectedModelData = models.filter(m => selectedModels.includes(m.id));
    if (selectedModelData.length === 0) return [];

    // Combine performance history from all selected models
    const combinedData: any[] = [];
    const dateSet = new Set<string>();

    selectedModelData.forEach(model => {
      model.performanceHistory?.forEach(point => {
        dateSet.add(point.date);
      });
    });

    Array.from(dateSet).sort().forEach(date => {
      const dataPoint: any = { date };
      selectedModelData.forEach((model, index) => {
        const modelPoint = model.performanceHistory?.find(p => p.date === date);
        if (modelPoint) {
          dataPoint[`model${index + 1}_accuracy`] = modelPoint.accuracy;
          dataPoint[`model${index + 1}_f1`] = modelPoint.f1Score;
        }
      });
      combinedData.push(dataPoint);
    });

    return combinedData;
  };

  const getRadarChartData = () => {
    const selectedModelData = models.filter(m => selectedModels.includes(m.id));
    if (selectedModelData.length === 0) return [];

    return [
      {
        metric: 'Accuracy',
        fullMark: 1,
        ...selectedModelData.reduce((acc, model, index) => {
          acc[`model${index + 1}`] = model.accuracy;
          return acc;
        }, {} as any)
      },
      {
        metric: 'Precision',
        fullMark: 1,
        ...selectedModelData.reduce((acc, model, index) => {
          acc[`model${index + 1}`] = model.precision;
          return acc;
        }, {} as any)
      },
      {
        metric: 'Recall',
        fullMark: 1,
        ...selectedModelData.reduce((acc, model, index) => {
          acc[`model${index + 1}`] = model.recall;
          return acc;
        }, {} as any)
      },
      {
        metric: 'F1 Score',
        fullMark: 1,
        ...selectedModelData.reduce((acc, model, index) => {
          acc[`model${index + 1}`] = model.f1Score;
          return acc;
        }, {} as any)
      },
      {
        metric: 'Confidence',
        fullMark: 1,
        ...selectedModelData.reduce((acc, model, index) => {
          acc[`model${index + 1}`] = model.confidence;
          return acc;
        }, {} as any)
      }
    ];
  };

  const exportComparison = async () => {
    try {
      const data = {
        models: models.filter(m => selectedModels.includes(m.id)),
        comparisonData: getComparisonData(),
        timelineData: getPerformanceTimelineData(),
        exportTime: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `model-comparison-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Model comparison data has been exported",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export comparison data",
        variant: "destructive",
      });
    }
  };

  const selectedModelData = models.filter(m => selectedModels.includes(m.id));

  return (
    <div className="min-h-0 bg-gray-50 mobile-scroll">
      {/* Mobile-Optimized Header */}
      <div className="bg-white border-b border-gray-200 sticky top-14 lg:top-16 z-40">
        <div className="p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">
                Model Performance Comparison
              </h1>
              <p className="text-sm lg:text-base text-gray-600 mt-1">
                Compare ML model performance metrics side-by-side
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={exportComparison} variant="outline" size="sm" className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={loadModelMetrics} variant="outline" size="sm" className="w-full sm:w-auto">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Content */}
      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">

      {/* Model Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Model Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Models (2-4)</label>
              <div className="space-y-2">
                {models.map(model => (
                  <div key={model.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={model.id}
                      checked={selectedModels.includes(model.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          if (selectedModels.length < 4) {
                            setSelectedModels([...selectedModels, model.id]);
                          }
                        } else {
                          setSelectedModels(selectedModels.filter(id => id !== model.id));
                        }
                      }}
                      className="rounded"
                    />
                    <label htmlFor={model.id} className="flex items-center gap-2 text-sm">
                      <Badge variant={model.status === 'active' ? 'default' : 'secondary'}>
                        {model.status}
                      </Badge>
                      {model.name} v{model.version}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Time Range</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleCompareModels} disabled={loading || selectedModels.length < 2} className="w-full">
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <BarChart3 className="h-4 w-4 mr-2" />
                )}
                Compare Models
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedModels.length >= 2 && (
        <>
          {/* Model Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {selectedModelData.map((model, index) => (
              <Card key={model.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center justify-between">
                    {model.name}
                    <Badge variant={model.status === 'active' ? 'default' : 'secondary'}>
                      {model.status}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-600">v{model.version} • {model.type}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Accuracy</span>
                      <span className="font-medium">{(model.accuracy * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={model.accuracy * 100} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Precision</span>
                      <div className="font-medium">{(model.precision * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Recall</span>
                      <div className="font-medium">{(model.recall * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <span className="text-gray-600">F1 Score</span>
                      <div className="font-medium">{(model.f1Score * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <span className="text-gray-600">AUC</span>
                      <div className="font-medium">{(model.auc * 100).toFixed(1)}%</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Clock className="h-3 w-3" />
                      {model.inferenceTime}ms inference
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Activity className="h-3 w-3" />
                      {model.predictions.toLocaleString()} predictions
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison Tabs */}
          <Tabs value={comparisonMode} onValueChange={setComparisonMode} className="space-y-4">
            <TabsList>
              <TabsTrigger value="metrics">Metrics Comparison</TabsTrigger>
              <TabsTrigger value="performance">Performance Timeline</TabsTrigger>
              <TabsTrigger value="features">Feature Analysis</TabsTrigger>
              <TabsTrigger value="timeline">Training History</TabsTrigger>
            </TabsList>

            {/* Metrics Comparison */}
            <TabsContent value="metrics" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getComparisonData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="metric" />
                        <YAxis domain={[0, 1]} />
                        <Tooltip formatter={(value: any) => [`${(value * 100).toFixed(1)}%`, 'Value']} />
                        <Legend />
                        <Bar dataKey="model1" fill="#3b82f6" name={selectedModelData[0]?.name || 'Model 1'} />
                        <Bar dataKey="model2" fill="#ef4444" name={selectedModelData[1]?.name || 'Model 2'} />
                        {selectedModelData[2] && <Bar dataKey="model3" fill="#22c55e" name={selectedModelData[2].name} />}
                        {selectedModelData[3] && <Bar dataKey="model4" fill="#f59e0b" name={selectedModelData[3].name} />}
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Radar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={getRadarChartData()}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" />
                        <PolarRadiusAxis angle={90} domain={[0, 1]} />
                        <Radar
                          name={selectedModelData[0]?.name || 'Model 1'}
                          dataKey="model1"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.1}
                        />
                        <Radar
                          name={selectedModelData[1]?.name || 'Model 2'}
                          dataKey="model2"
                          stroke="#ef4444"
                          fill="#ef4444"
                          fillOpacity={0.1}
                        />
                        {selectedModelData[2] && (
                          <Radar
                            name={selectedModelData[2].name}
                            dataKey="model3"
                            stroke="#22c55e"
                            fill="#22c55e"
                            fillOpacity={0.1}
                          />
                        )}
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Metrics Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Metric</th>
                          {selectedModelData.map(model => (
                            <th key={model.id} className="text-center py-2 px-4">{model.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { key: 'accuracy', label: 'Accuracy', format: (v: number) => `${(v * 100).toFixed(2)}%` },
                          { key: 'precision', label: 'Precision', format: (v: number) => `${(v * 100).toFixed(2)}%` },
                          { key: 'recall', label: 'Recall', format: (v: number) => `${(v * 100).toFixed(2)}%` },
                          { key: 'f1Score', label: 'F1 Score', format: (v: number) => `${(v * 100).toFixed(2)}%` },
                          { key: 'auc', label: 'AUC', format: (v: number) => `${(v * 100).toFixed(2)}%` },
                          { key: 'trainingTime', label: 'Training Time', format: (v: number) => `${v}min` },
                          { key: 'inferenceTime', label: 'Inference Time', format: (v: number) => `${v}ms` },
                          { key: 'errorRate', label: 'Error Rate', format: (v: number) => `${(v * 100).toFixed(2)}%` },
                          { key: 'predictions', label: 'Predictions', format: (v: number) => v.toLocaleString() }
                        ].map(metric => (
                          <tr key={metric.key} className="border-b">
                            <td className="py-2 px-4 font-medium">{metric.label}</td>
                            {selectedModelData.map(model => (
                              <td key={model.id} className="text-center py-2 px-4">
                                {metric.format(model[metric.key as keyof ModelMetrics] as number)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Timeline */}
            <TabsContent value="performance">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={getPerformanceTimelineData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 1]} />
                      <Tooltip formatter={(value: any) => [`${(value * 100).toFixed(1)}%`, 'Accuracy']} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="model1_accuracy"
                        stroke="#3b82f6"
                        name={`${selectedModelData[0]?.name || 'Model 1'} Accuracy`}
                      />
                      <Line
                        type="monotone"
                        dataKey="model2_accuracy"
                        stroke="#ef4444"
                        name={`${selectedModelData[1]?.name || 'Model 2'} Accuracy`}
                      />
                      {selectedModelData[2] && (
                        <Line
                          type="monotone"
                          dataKey="model3_accuracy"
                          stroke="#22c55e"
                          name={`${selectedModelData[2].name} Accuracy`}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Feature Analysis */}
            <TabsContent value="features">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {selectedModelData.map(model => (
                  <Card key={model.id}>
                    <CardHeader>
                      <CardTitle>{model.name} - Feature Importance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(model.featureImportance || {}).slice(0, 8).map(([feature, importance]) => (
                          <div key={feature} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{feature}</span>
                              <span className="font-medium">{(importance * 100).toFixed(1)}%</span>
                            </div>
                            <Progress value={importance * 100} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Training History */}
            <TabsContent value="timeline">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                {selectedModelData.map(model => (
                  <Card key={model.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{model.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Last trained: {new Date(model.lastTrained).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-blue-500" />
                          Training time: {model.trainingTime} min
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Brain className="h-4 w-4 text-purple-500" />
                          Data size: {model.dataSize.toLocaleString()} samples
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <h4 className="font-medium mb-2">Confusion Matrix</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-green-100 p-2 rounded text-center">
                            <div className="font-medium">TP</div>
                            <div>{model.confusionMatrix?.truePositive || 0}</div>
                          </div>
                          <div className="bg-red-100 p-2 rounded text-center">
                            <div className="font-medium">FP</div>
                            <div>{model.confusionMatrix?.falsePositive || 0}</div>
                          </div>
                          <div className="bg-red-100 p-2 rounded text-center">
                            <div className="font-medium">FN</div>
                            <div>{model.confusionMatrix?.falseNegative || 0}</div>
                          </div>
                          <div className="bg-green-100 p-2 rounded text-center">
                            <div className="font-medium">TN</div>
                            <div>{model.confusionMatrix?.trueNegative || 0}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}

      {selectedModels.length < 2 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Select at least 2 models to start comparison analysis.
          </AlertDescription>
        </Alert>
        )}
      </div>
    </div>
  );
}