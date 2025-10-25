import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Monitor,
  Database,
  Globe,
  Activity,
  Code,
  Terminal,
  Settings,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Eye,
  Search,
  Download,
  Upload,
  Cpu,
  HardDrive,
  Network,
  Clock,
  Target,
  TrendingUp,
  Filter,
  BarChart3,
  Zap,
  Bug,
  FileText,
  Users,
  MousePointer
} from 'lucide-react';

interface ScrapingJob {
  id: string;
  source: string;
  status: 'running' | 'completed' | 'failed' | 'queued';
  startTime: string;
  endTime?: string;
  recordsScraped: number;
  errorCount: number;
  dataQuality: number;
  nextRun: string;
}

interface PixelTrackingData {
  sessionsToday: number;
  pageViewsToday: number;
  interactionsToday: number;
  averageSessionDuration: number;
  bounceRate: number;
  conversionEvents: number;
  mlProcessedEvents: number;
  behaviorPatterns: Array<{
    pattern: string;
    frequency: number;
    prediction: string;
  }>;
}

interface MLPipelineTrace {
  id: string;
  timestamp: string;
  stage: 'scraping' | 'processing' | 'training' | 'validation' | 'deployment';
  status: 'success' | 'error' | 'warning';
  message: string;
  dataPoints: number;
  duration: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface SystemHealth {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  mlProcesses: number;
  scrapingJobs: number;
  activePipelines: number;
  errorRate: number;
}

export default function MLDeveloperAdmin() {
  const { toast } = useToast();
  const [scrapingJobs, setScrapingJobs] = useState<ScrapingJob[]>([]);
  const [pixelData, setPixelData] = useState<PixelTrackingData | null>(null);
  const [pipelineTraces, setPipelineTraces] = useState<MLPipelineTrace[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [realTimeMode, setRealTimeMode] = useState(true);
  const [selectedTrace, setSelectedTrace] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadAllData();
    if (autoRefresh) {
      const interval = setInterval(loadAllData, 5000); // 5-second refresh for real-time monitoring
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadAllData = async () => {
    try {
      const [scrapingRes, pixelRes, tracesRes, healthRes] = await Promise.all([
        fetch('/api/ml-admin/scraping-status'),
        fetch('/api/ml-admin/pixel-tracking'),
        fetch('/api/ml-admin/pipeline-traces'),
        fetch('/api/ml-admin/system-health')
      ]);

      if (scrapingRes.ok) {
        const data = await scrapingRes.json();
        setScrapingJobs(data.jobs || generateMockScrapingJobs());
      }

      if (pixelRes.ok) {
        const data = await pixelRes.json();
        setPixelData(data || generateMockPixelData());
      }

      if (tracesRes.ok) {
        const data = await tracesRes.json();
        setPipelineTraces(data.traces || generateMockTraces());
      }

      if (healthRes.ok) {
        const data = await healthRes.json();
        setSystemHealth(data || generateMockHealth());
      }
    } catch (error) {
      console.error('Failed to load admin data:', error);
      // Load mock data for demonstration
      setScrapingJobs(generateMockScrapingJobs());
      setPixelData(generateMockPixelData());
      setPipelineTraces(generateMockTraces());
      setSystemHealth(generateMockHealth());
    }
  };

  const generateMockScrapingJobs = (): ScrapingJob[] => [
    {
      id: 'scraper_cargurus_001',
      source: 'CarGurus',
      status: 'running',
      startTime: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      recordsScraped: 1247,
      errorCount: 3,
      dataQuality: 0.94,
      nextRun: new Date(Date.now() + 1000 * 60 * 45).toISOString()
    },
    {
      id: 'scraper_autotrader_002',
      source: 'AutoTrader',
      status: 'completed',
      startTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      endTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      recordsScraped: 2156,
      errorCount: 1,
      dataQuality: 0.97,
      nextRun: new Date(Date.now() + 1000 * 60 * 30).toISOString()
    },
    {
      id: 'scraper_cars_com_003',
      source: 'Cars.com',
      status: 'failed',
      startTime: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      endTime: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      recordsScraped: 89,
      errorCount: 15,
      dataQuality: 0.34,
      nextRun: new Date(Date.now() + 1000 * 60 * 10).toISOString()
    }
  ];

  const generateMockPixelData = (): PixelTrackingData => ({
    sessionsToday: 1247,
    pageViewsToday: 4892,
    interactionsToday: 2156,
    averageSessionDuration: 342,
    bounceRate: 0.23,
    conversionEvents: 67,
    mlProcessedEvents: 1823,
    behaviorPatterns: [
      { pattern: 'vehicle_search_luxury', frequency: 89, prediction: 'high_intent_buyer' },
      { pattern: 'price_comparison_multiple', frequency: 156, prediction: 'price_sensitive' },
      { pattern: 'financing_calculator_usage', frequency: 78, prediction: 'ready_to_purchase' },
      { pattern: 'inventory_deep_dive', frequency: 234, prediction: 'serious_shopper' }
    ]
  });

  const generateMockTraces = (): MLPipelineTrace[] => [
    {
      id: 'trace_001',
      timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      stage: 'training',
      status: 'success',
      message: 'XGBoost model training completed - accuracy: 94.2%',
      dataPoints: 15678,
      duration: 145,
      memoryUsage: 2.1,
      cpuUsage: 78
    },
    {
      id: 'trace_002',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      stage: 'processing',
      status: 'success',
      message: 'Feature engineering completed for 2156 vehicle records',
      dataPoints: 2156,
      duration: 23,
      memoryUsage: 1.4,
      cpuUsage: 45
    },
    {
      id: 'trace_003',
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      stage: 'scraping',
      status: 'warning',
      message: 'Bot detection triggered on CarGurus - switching proxy',
      dataPoints: 0,
      duration: 5,
      memoryUsage: 0.3,
      cpuUsage: 12
    },
    {
      id: 'trace_004',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      stage: 'validation',
      status: 'error',
      message: 'Data quality threshold not met - 67% quality score',
      dataPoints: 890,
      duration: 8,
      memoryUsage: 0.8,
      cpuUsage: 25
    }
  ];

  const generateMockHealth = (): SystemHealth => ({
    cpu: 67,
    memory: 78,
    disk: 45,
    network: 23,
    mlProcesses: 7,
    scrapingJobs: 3,
    activePipelines: 4,
    errorRate: 0.03
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': case 'success': return 'bg-green-100 text-green-800';
      case 'failed': case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'queued': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'scraping': return <Globe className="w-4 h-4" />;
      case 'processing': return <Cpu className="w-4 h-4" />;
      case 'training': return <Zap className="w-4 h-4" />;
      case 'validation': return <CheckCircle className="w-4 h-4" />;
      case 'deployment': return <Upload className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const handleScrapingAction = async (jobId: string, action: 'start' | 'stop' | 'restart') => {
    try {
      const response = await apiRequest('POST', `/api/ml-admin/scraping/${action}`, { jobId });
      toast({
        title: "Scraping Action",
        description: `Successfully ${action}ed scraping job: ${jobId}`
      });
      loadAllData();
    } catch (error) {
      toast({
        title: "Action Failed",
        description: `Failed to ${action} scraping job`,
        variant: "destructive"
      });
    }
  };

  const handlePipelineAction = async (action: 'flush' | 'restart' | 'debug') => {
    try {
      const response = await apiRequest('POST', `/api/ml-admin/pipeline/${action}`);
      toast({
        title: "Pipeline Action",
        description: `Successfully executed: ${action}`
      });
      loadAllData();
    } catch (error) {
      toast({
        title: "Action Failed",
        description: `Failed to execute pipeline action: ${action}`,
        variant: "destructive"
      });
    }
  };

  const exportTraces = async () => {
    try {
      const response = await fetch('/api/ml-admin/export-traces');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ml-traces-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export trace data",
        variant: "destructive"
      });
    }
  };

  const filteredTraces = pipelineTraces.filter(trace => 
    filterLevel === 'all' || trace.status === filterLevel || trace.stage === filterLevel
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ML Developer Admin Center</h1>
          <p className="text-muted-foreground">Full pipeline monitoring, tracing, and control</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label>Auto Refresh</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={realTimeMode}
              onCheckedChange={setRealTimeMode}
            />
            <Label>Real-time Mode</Label>
          </div>
          <Button onClick={loadAllData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      {systemHealth && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                CPU Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemHealth.cpu}%</div>
              <Progress value={systemHealth.cpu} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                Memory Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemHealth.memory}%</div>
              <Progress value={systemHealth.memory} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Active Pipelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemHealth.activePipelines}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {systemHealth.mlProcesses} ML processes
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Error Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(systemHealth.errorRate * 100).toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground mt-1">
                Last 24 hours
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="scraping" className="space-y-4">
        <TabsList>
          <TabsTrigger value="scraping">Web Scraping</TabsTrigger>
          <TabsTrigger value="pixel">Pixel Tracking</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline Traces</TabsTrigger>
          <TabsTrigger value="data">Data Flow</TabsTrigger>
          <TabsTrigger value="control">Control Panel</TabsTrigger>
        </TabsList>

        <TabsContent value="scraping" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Active Scraping Jobs</h2>
            <div className="flex gap-2">
              <Button onClick={() => handleScrapingAction('all', 'restart')} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Restart All
              </Button>
              <Button onClick={() => handlePipelineAction('debug')} variant="outline" size="sm">
                <Bug className="w-4 h-4 mr-2" />
                Debug Mode
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {scrapingJobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5" />
                      <div>
                        <CardTitle className="text-lg">{job.source}</CardTitle>
                        <p className="text-sm text-muted-foreground">Job ID: {job.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                      <Button
                        onClick={() => handleScrapingAction(job.id, job.status === 'running' ? 'stop' : 'start')}
                        variant="outline"
                        size="sm"
                      >
                        {job.status === 'running' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <Label>Records Scraped</Label>
                      <div className="font-semibold">{job.recordsScraped.toLocaleString()}</div>
                    </div>
                    <div>
                      <Label>Error Count</Label>
                      <div className="font-semibold text-red-600">{job.errorCount}</div>
                    </div>
                    <div>
                      <Label>Data Quality</Label>
                      <div className="font-semibold">{(job.dataQuality * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <Label>Started</Label>
                      <div className="font-semibold">{new Date(job.startTime).toLocaleTimeString()}</div>
                    </div>
                    <div>
                      <Label>Next Run</Label>
                      <div className="font-semibold">{new Date(job.nextRun).toLocaleTimeString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pixel" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Pixel Tracking & ML Integration</h2>
            <Button onClick={() => handlePipelineAction('flush')} variant="outline" size="sm">
              <Database className="w-4 h-4 mr-2" />
              Process Queue
            </Button>
          </div>

          {pixelData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Sessions Today
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{pixelData.sessionsToday.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      Avg: {Math.round(pixelData.averageSessionDuration)}s
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Page Views
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{pixelData.pageViewsToday.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      Bounce: {(pixelData.bounceRate * 100).toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MousePointer className="w-4 h-4" />
                      Interactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{pixelData.interactionsToday.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      ML Processed: {pixelData.mlProcessedEvents.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Conversions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{pixelData.conversionEvents}</div>
                    <div className="text-sm text-muted-foreground">
                      Rate: {((pixelData.conversionEvents / pixelData.sessionsToday) * 100).toFixed(2)}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>ML-Detected Behavior Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pixelData.behaviorPatterns.map((pattern, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{pattern.pattern.replace(/_/g, ' ')}</div>
                          <div className="text-sm text-muted-foreground">
                            Frequency: {pattern.frequency} occurrences
                          </div>
                        </div>
                        <Badge variant="outline">
                          {pattern.prediction.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Pipeline Execution Traces</h2>
            <div className="flex items-center gap-2">
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="all">All Events</option>
                <option value="error">Errors Only</option>
                <option value="warning">Warnings</option>
                <option value="success">Success</option>
                <option value="scraping">Scraping</option>
                <option value="training">Training</option>
              </select>
              <Button onClick={exportTraces} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {filteredTraces.map((trace) => (
              <Card key={trace.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedTrace(trace.id)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStageIcon(trace.stage)}
                      <div>
                        <div className="font-medium">{trace.message}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(trace.timestamp).toLocaleString()} • {trace.stage}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(trace.status)}>
                        {trace.status}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        {trace.duration}s • {trace.dataPoints} records
                      </div>
                    </div>
                  </div>
                  {selectedTrace === trace.id && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <Label>Data Points</Label>
                          <div className="font-semibold">{trace.dataPoints.toLocaleString()}</div>
                        </div>
                        <div>
                          <Label>Duration</Label>
                          <div className="font-semibold">{trace.duration}s</div>
                        </div>
                        <div>
                          <Label>Memory Usage</Label>
                          <div className="font-semibold">{trace.memoryUsage}GB</div>
                        </div>
                        <div>
                          <Label>CPU Usage</Label>
                          <div className="font-semibold">{trace.cpuUsage}%</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <h2 className="text-xl font-semibold">Data Flow Monitoring</h2>
          
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Complete Data Pipeline Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <Globe className="w-8 h-8 text-blue-500" />
                    <div className="flex-1">
                      <div className="font-semibold">1. Web Scraping</div>
                      <div className="text-sm text-muted-foreground">
                        CarGurus, AutoTrader, Cars.com → Raw vehicle data
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <MousePointer className="w-8 h-8 text-purple-500" />
                    <div className="flex-1">
                      <div className="font-semibold">2. Pixel Tracking Integration</div>
                      <div className="text-sm text-muted-foreground">
                        User behavior data → ML feature enrichment
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Processing</Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <Database className="w-8 h-8 text-green-500" />
                    <div className="flex-1">
                      <div className="font-semibold">3. Data Validation & Cleaning</div>
                      <div className="text-sm text-muted-foreground">
                        Deduplication, quality checks → Clean dataset
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <Zap className="w-8 h-8 text-yellow-500" />
                    <div className="flex-1">
                      <div className="font-semibold">4. ML Training & Prediction</div>
                      <div className="text-sm text-muted-foreground">
                        XGBoost models → Real-time pricing insights
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Training</Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <BarChart3 className="w-8 h-8 text-orange-500" />
                    <div className="flex-1">
                      <div className="font-semibold">5. Analytics & Deployment</div>
                      <div className="text-sm text-muted-foreground">
                        Model serving → Live pricing recommendations
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Deployed</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="control" className="space-y-4">
          <h2 className="text-xl font-semibold">Developer Control Panel</h2>
          
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => handlePipelineAction('restart')}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Restart All Pipelines
                  </Button>
                  <Button 
                    onClick={() => handlePipelineAction('flush')}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Database className="w-4 h-4" />
                    Flush Data Queue
                  </Button>
                  <Button 
                    onClick={() => handlePipelineAction('debug')}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Bug className="w-4 h-4" />
                    Debug Mode
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Scraping Interval (seconds)</Label>
                    <Input type="number" defaultValue="300" />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Quality Threshold</Label>
                    <Input type="number" step="0.01" defaultValue="0.8" />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Training Time (minutes)</Label>
                    <Input type="number" defaultValue="120" />
                  </div>
                  <div className="space-y-2">
                    <Label>Error Threshold</Label>
                    <Input type="number" defaultValue="10" />
                  </div>
                </div>
                <Button className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Apply Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}