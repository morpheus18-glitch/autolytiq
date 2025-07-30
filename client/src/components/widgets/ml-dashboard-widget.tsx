import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
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
  RotateCcw
} from "lucide-react";

interface MLMetrics {
  model_accuracy: number;
  data_quality: number;
  last_scrape: string;
  last_train: string;
  scrape_count: number;
  train_count: number;
  error_count: number;
  uptime: number;
}

interface PipelineStatus {
  running: boolean;
  pipeline_id: string;
  health: 'healthy' | 'warning' | 'critical';
  metrics: MLMetrics;
  params: any;
}

export default function MLDashboardWidget() {
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPipeline, setSelectedPipeline] = useState('pricing_analysis');

  useEffect(() => {
    loadMLStatus();
    const interval = setInterval(loadMLStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadMLStatus = async () => {
    try {
      const response = await fetch('/api/ml-control/status');
      if (response.ok) {
        const data = await response.json();
        setPipelineStatus(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to load ML status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <XCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatLastActivity = (timestamp: string): string => {
    if (!timestamp) return 'Never';
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const activePipeline = pipelineStatus.find(p => p.pipeline_id === selectedPipeline) || pipelineStatus[0];

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-blue-600" />
            ML Pipeline Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-blue-600" />
            ML Pipeline Status
          </CardTitle>
          <Link href="/ml-control">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-1" />
              Manage
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {pipelineStatus.length === 0 ? (
          <div className="text-center py-6">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-3">No ML pipelines active</p>
            <Link href="/ml-control">
              <Button size="sm">
                <Play className="h-4 w-4 mr-1" />
                Start Pipeline
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Pipeline Selector */}
            {pipelineStatus.length > 1 && (
              <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-md">
                {pipelineStatus.map((pipeline) => (
                  <Button
                    key={pipeline.pipeline_id}
                    variant={selectedPipeline === pipeline.pipeline_id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedPipeline(pipeline.pipeline_id)}
                    className="text-xs"
                  >
                    {pipeline.pipeline_id.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Button>
                ))}
              </div>
            )}

            {activePipeline && (
              <>
                {/* Status Overview */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getHealthColor(activePipeline.health)} border-0`}>
                      {getHealthIcon(activePipeline.health)}
                      <span className="ml-1 capitalize">{activePipeline.health}</span>
                    </Badge>
                    <Badge variant={activePipeline.running ? "default" : "secondary"}>
                      {activePipeline.running ? (
                        <><Activity className="h-3 w-3 mr-1" />Running</>
                      ) : (
                        <><Pause className="h-3 w-3 mr-1" />Stopped</>
                      )}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {activePipeline.running && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatUptime(activePipeline.metrics.uptime)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Model Accuracy</span>
                      <span className="font-medium">
                        {Math.round(activePipeline.metrics.model_accuracy * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={activePipeline.metrics.model_accuracy * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Data Quality</span>
                      <span className="font-medium">
                        {Math.round(activePipeline.metrics.data_quality * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={activePipeline.metrics.data_quality * 100} 
                      className="h-2"
                    />
                  </div>
                </div>

                {/* Activity Stats */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <div className="text-lg font-bold text-blue-600">
                      {activePipeline.metrics.scrape_count}
                    </div>
                    <div className="text-xs text-gray-600">Scrapes</div>
                  </div>
                  
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                    <div className="text-lg font-bold text-green-600">
                      {activePipeline.metrics.train_count}
                    </div>
                    <div className="text-xs text-gray-600">Training</div>
                  </div>
                  
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
                    <div className="text-lg font-bold text-red-600">
                      {activePipeline.metrics.error_count}
                    </div>
                    <div className="text-xs text-gray-600">Errors</div>
                  </div>
                </div>

                {/* Last Activity */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-gray-600">
                      <Database className="h-3 w-3" />
                      Last Scrape
                    </span>
                    <span>{formatLastActivity(activePipeline.metrics.last_scrape)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-gray-600">
                      <Zap className="h-3 w-3" />
                      Last Training
                    </span>
                    <span>{formatLastActivity(activePipeline.metrics.last_train)}</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Link href="/ml-control" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </Link>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadMLStatus}
                    className="px-3"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}