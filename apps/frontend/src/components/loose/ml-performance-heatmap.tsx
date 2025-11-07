import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Button } from '@repo/ui';
import { Badge } from '@repo/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui';
import { Progress } from '@repo/ui';
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@repo/ui';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  ZoomIn,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Activity,
  Eye,
  MoreHorizontal
} from "lucide-react";

interface HeatmapCell {
  x: string;
  y: string;
  value: number;
  color: string;
  metadata: {
    accuracy: number;
    predictions: number;
    errors: number;
    lastUpdated: Date;
    drift: number;
    confidence: number;
  };
}

interface DrillDownData {
  dimension: string;
  value: string;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    auc: number;
    predictions: number;
    errors: number;
    avgLatency: number;
  };
  timeSeries: Array<{
    timestamp: Date;
    accuracy: number;
    predictions: number;
  }>;
  featureImportance: Record<string, number>;
  errorBreakdown: Record<string, number>;
}

export default function MLPerformanceHeatmap() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState<HeatmapCell[]>([]);
  const [selectedMetric, setSelectedMetric] = useState('accuracy');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null);
  const [showDrillDown, setShowDrillDown] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);
  const [filterDimension, setFilterDimension] = useState('model');

  const models = ['pricing_model', 'customer_segmentation', 'demand_forecasting', 'inventory_optimization'];
  const timeRanges = ['1h', '6h', '24h', '7d', '30d'];
  const metrics = [
    { value: 'accuracy', label: 'Accuracy', format: (v: number) => `${(v * 100).toFixed(1)}%` },
    { value: 'latency', label: 'Latency', format: (v: number) => `${v.toFixed(1)}ms` },
    { value: 'throughput', label: 'Throughput', format: (v: number) => `${v.toFixed(0)}/s` },
    { value: 'error_rate', label: 'Error Rate', format: (v: number) => `${(v * 100).toFixed(2)}%` },
    { value: 'drift_score', label: 'Drift Score', format: (v: number) => `${(v * 100).toFixed(1)}%` }
  ];

  useEffect(() => {
    loadHeatmapData();
    const interval = setInterval(loadHeatmapData, 30000);
    return () => clearInterval(interval);
  }, [selectedMetric, selectedTimeRange, filterDimension]);

  const loadHeatmapData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from API first, fallback to generated data
      let data: HeatmapCell[] = [];
      
      try {
        const response = await fetch(`/api/ml-heatmap/data?metric=${selectedMetric}&timeRange=${selectedTimeRange}&dimension=${filterDimension}`);
        if (response.ok) {
          const result = await response.json();
          data = result.data || [];
        }
      } catch (apiError) {
        console.log('API unavailable, generating demo data');
      }
      
      // Generate demo data if API failed or returned empty
      if (data.length === 0) {
        if (filterDimension === 'model') {
          // Model x Time heatmap
          const timeSlots = ['00-04', '04-08', '08-12', '12-16', '16-20', '20-24'];

          models.forEach(model => {
            timeSlots.forEach(timeSlot => {
              const baseAccuracy = 0.85 + Math.random() * 0.15;
              const predictions = Math.floor(Math.random() * 10000) + 1000;
              const errors = Math.floor(predictions * (1 - baseAccuracy));
              const drift = Math.random() * 0.2;

              let value = baseAccuracy;
              let color = getHeatmapColor(value, selectedMetric);

              if (selectedMetric === 'latency') {
                value = 5 + Math.random() * 50;
                color = getHeatmapColor(1 - (value / 55), selectedMetric);
              } else if (selectedMetric === 'error_rate') {
                value = 1 - baseAccuracy;
                color = getHeatmapColor(1 - value, selectedMetric);
              } else if (selectedMetric === 'drift_score') {
                value = drift;
                color = getHeatmapColor(1 - value, selectedMetric);
              }

              data.push({
                x: model,
                y: timeSlot,
                value,
                color,
                metadata: {
                  accuracy: baseAccuracy,
                  predictions,
                  errors,
                  lastUpdated: new Date(),
                  drift,
                  confidence: 0.8 + Math.random() * 0.2
                }
              });
            });
          });
        } else if (filterDimension === 'feature') {
          // Feature x Model heatmap
          const features = ['vehicle_age', 'mileage', 'make_model', 'condition', 'location', 'season'];

          models.forEach(model => {
            features.forEach(feature => {
              const importance = Math.random();
              const stability = 0.7 + Math.random() * 0.3;

              data.push({
                x: model,
                y: feature,
                value: selectedMetric === 'accuracy' ? importance : stability,
                color: getHeatmapColor(selectedMetric === 'accuracy' ? importance : stability, selectedMetric),
                metadata: {
                  accuracy: importance,
                  predictions: 1000,
                  errors: 50,
                  lastUpdated: new Date(),
                  drift: 1 - stability,
                  confidence: stability
                }
              });
            });
          });
        }
      }

      setHeatmapData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading heatmap data:', error);
      toast({
        title: "Error Loading Heatmap",
        description: "Failed to load performance data",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const getHeatmapColor = (value: number, metric: string): string => {
    // Normalize value to 0-1 range
    const normalized = Math.max(0, Math.min(1, value));
    
    // Color scales based on metric type
    if (metric === 'accuracy' || metric === 'throughput') {
      // Green scale for "higher is better"
      const intensity = Math.floor(normalized * 255);
      return `rgb(${255 - intensity}, 255, ${255 - intensity})`;
    } else {
      // Red scale for "lower is better" 
      const intensity = Math.floor((1 - normalized) * 255);
      return `rgb(255, ${intensity}, ${intensity})`;
    }
  };

  const handleCellClick = async (cell: HeatmapCell) => {
    try {
      // Generate detailed drill-down data
      const drillDown: DrillDownData = {
        dimension: `${cell.x} - ${cell.y}`,
        value: cell.x,
        metrics: {
          accuracy: cell.metadata.accuracy,
          precision: 0.88 + Math.random() * 0.12,
          recall: 0.85 + Math.random() * 0.15,
          f1Score: 0.86 + Math.random() * 0.14,
          auc: 0.92 + Math.random() * 0.08,
          predictions: cell.metadata.predictions,
          errors: cell.metadata.errors,
          avgLatency: 8 + Math.random() * 15
        },
        timeSeries: Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 3600000),
          accuracy: 0.8 + Math.random() * 0.2,
          predictions: Math.floor(Math.random() * 500) + 100
        })),
        featureImportance: {
          'vehicle_age': 0.35,
          'mileage': 0.28,
          'make_model': 0.22,
          'condition': 0.15
        },
        errorBreakdown: {
          'Prediction Out of Range': 0.4,
          'Feature Missing': 0.25,
          'Model Drift': 0.2,
          'Data Quality': 0.15
        }
      };
      
      setDrillDownData(drillDown);
      setShowDrillDown(true);
    } catch (error) {
      toast({
        title: "Error Loading Details",
        description: "Failed to load drill-down data",
        variant: "destructive",
      });
    }
  };

  const uniqueXValues = useMemo(() => {
    const uniqueSet = new Set(heatmapData.map(cell => cell.x));
    return Array.from(uniqueSet);
  }, [heatmapData]);

  const uniqueYValues = useMemo(() => {
    const uniqueSet = new Set(heatmapData.map(cell => cell.y));
    return Array.from(uniqueSet);
  }, [heatmapData]);

  const currentMetric = metrics.find(m => m.value === selectedMetric);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading performance heatmap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {metrics.map(metric => (
                <SelectItem key={metric.value} value={metric.value}>
                  {metric.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map(range => (
                <SelectItem key={range} value={range}>
                  {range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-gray-500" />
          <Select value={filterDimension} onValueChange={setFilterDimension}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="model">Model View</SelectItem>
              <SelectItem value="feature">Feature View</SelectItem>
              <SelectItem value="time">Time View</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={loadHeatmapData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>

        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Main Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            ML Performance Heatmap - {currentMetric?.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Heatmap Grid */}
            <div className="grid gap-1 p-4" style={{
              gridTemplateColumns: `80px repeat(${uniqueXValues.length}, 1fr)`,
              gridTemplateRows: `40px repeat(${uniqueYValues.length}, 1fr)`
            }}>
              {/* Empty corner */}
              <div></div>
              
              {/* X-axis labels */}
              {uniqueXValues.map(x => (
                <div key={x} className="text-xs font-medium text-center py-2 truncate">
                  {x.replace('_', ' ')}
                </div>
              ))}
              
              {/* Y-axis labels and data cells */}
              {uniqueYValues.map(y => (
                <React.Fragment key={y}>
                  <div className="text-xs font-medium flex items-center pr-2 truncate">
                    {y.replace('_', ' ')}
                  </div>
                  {uniqueXValues.map(x => {
                    const cell = heatmapData.find(c => c.x === x && c.y === y);
                    if (!cell) return <div key={`${x}-${y}`} className="h-12 bg-gray-100"></div>;
                    
                    return (
                      <TooltipProvider key={`${x}-${y}`}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className="h-12 rounded cursor-pointer border border-gray-200 hover:border-gray-400 transition-all duration-200 flex items-center justify-center text-xs font-medium"
                              style={{ backgroundColor: cell.color }}
                              onClick={() => handleCellClick(cell)}
                              onMouseEnter={() => setHoveredCell(cell)}
                              onMouseLeave={() => setHoveredCell(null)}
                            >
                              {currentMetric?.format(cell.value)}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1">
                              <div className="font-medium">{cell.x} - {cell.y}</div>
                              <div>Accuracy: {(cell.metadata.accuracy * 100).toFixed(1)}%</div>
                              <div>Predictions: {cell.metadata.predictions.toLocaleString()}</div>
                              <div>Errors: {cell.metadata.errors}</div>
                              <div>Drift: {(cell.metadata.drift * 100).toFixed(1)}%</div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>

            {/* Color Legend */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <span className="text-sm text-gray-600">Low</span>
              <div className="flex">
                {Array.from({ length: 10 }, (_, i) => (
                  <div
                    key={i}
                    className="w-6 h-4"
                    style={{ backgroundColor: getHeatmapColor(i / 9, selectedMetric) }}
                  ></div>
                ))}
              </div>
              <span className="text-sm text-gray-600">High</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drill-down Modal/Panel */}
      {showDrillDown && drillDownData && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ZoomIn className="h-5 w-5" />
                Performance Details: {drillDownData.dimension}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowDrillDown(false)}
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="metrics" className="space-y-4">
              <TabsList>
                <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
                <TabsTrigger value="trends">Time Trends</TabsTrigger>
                <TabsTrigger value="features">Feature Impact</TabsTrigger>
                <TabsTrigger value="errors">Error Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="metrics" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {(drillDownData.metrics.accuracy * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {(drillDownData.metrics.precision * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Precision</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {(drillDownData.metrics.recall * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Recall</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {drillDownData.metrics.avgLatency.toFixed(1)}ms
                    </div>
                    <div className="text-sm text-gray-600">Avg Latency</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium mb-2">Prediction Volume</div>
                    <div className="text-xl font-bold">
                      {drillDownData.metrics.predictions.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {drillDownData.metrics.errors} errors
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">Model Health</div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-medium">Healthy</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="trends" className="space-y-4">
                <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Performance trend visualization</p>
                    <p className="text-sm text-gray-400">24-hour accuracy and volume trends</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="features" className="space-y-4">
                <div className="space-y-3">
                  {Object.entries(drillDownData.featureImportance).map(([feature, importance]) => (
                    <div key={feature} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{feature.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={importance * 100} className="w-32" />
                        <span className="text-sm w-12 text-right">
                          {(importance * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="errors" className="space-y-4">
                <div className="space-y-3">
                  {Object.entries(drillDownData.errorBreakdown).map(([errorType, percentage]) => (
                    <div key={errorType} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{errorType}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={percentage * 100} className="w-32" />
                        <span className="text-sm w-12 text-right">
                          {(percentage * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}