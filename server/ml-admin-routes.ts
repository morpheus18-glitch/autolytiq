import type { Express } from "express";
import { db } from "./db";
import { visitorSessions, pageViews, customerInteractions } from "@shared/schema";
import { sql, desc, gte } from "drizzle-orm";

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
  lastError?: string;
  proxyRotations: number;
  botDetections: number;
}

interface MLTrace {
  id: string;
  timestamp: string;
  stage: 'scraping' | 'processing' | 'training' | 'validation' | 'deployment';
  status: 'success' | 'error' | 'warning';
  message: string;
  dataPoints: number;
  duration: number;
  memoryUsage: number;
  cpuUsage: number;
  metadata?: any;
}

class MLAdminService {
  private scrapingJobs: Map<string, ScrapingJob> = new Map();
  private pipelineTraces: MLTrace[] = [];
  private lastTraceId = 0;

  constructor() {
    this.initializeMockData();
    this.startRealTimeTracing();
  }

  private initializeMockData() {
    // Initialize some mock scraping jobs for demonstration
    this.scrapingJobs.set('scraper_cargurus_001', {
      id: 'scraper_cargurus_001',
      source: 'CarGurus',
      status: 'running',
      startTime: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      recordsScraped: 1247,
      errorCount: 3,
      dataQuality: 0.94,
      nextRun: new Date(Date.now() + 1000 * 60 * 45).toISOString(),
      proxyRotations: 2,
      botDetections: 1
    });

    this.scrapingJobs.set('scraper_autotrader_002', {
      id: 'scraper_autotrader_002',
      source: 'AutoTrader',
      status: 'completed',
      startTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      endTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      recordsScraped: 2156,
      errorCount: 1,
      dataQuality: 0.97,
      nextRun: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
      proxyRotations: 0,
      botDetections: 0
    });

    this.scrapingJobs.set('scraper_cars_com_003', {
      id: 'scraper_cars_com_003',
      source: 'Cars.com',
      status: 'failed',
      startTime: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      endTime: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      recordsScraped: 89,
      errorCount: 15,
      dataQuality: 0.34,
      nextRun: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
      lastError: 'Captcha challenge triggered after 89 records',
      proxyRotations: 5,
      botDetections: 3
    });
  }

  private startRealTimeTracing() {
    // Simulate real-time ML pipeline traces
    setInterval(() => {
      this.addRandomTrace();
    }, 30000); // Add a trace every 30 seconds
  }

  private addRandomTrace() {
    const stages = ['scraping', 'processing', 'training', 'validation', 'deployment'];
    const statuses = ['success', 'error', 'warning'];
    const messages = [
      'Scraped 245 vehicle records from CarGurus',
      'Feature engineering completed for batch processing',
      'XGBoost model training iteration completed',
      'Data validation passed with 94% quality score',
      'Model deployment successful - accuracy: 91.2%',
      'Bot detection triggered - switching proxy server',
      'Memory usage threshold exceeded - optimizing batch size',
      'Pixel tracking data integrated with ML features'
    ];

    const stage = stages[Math.floor(Math.random() * stages.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];

    const trace: MLTrace = {
      id: `trace_${++this.lastTraceId}`,
      timestamp: new Date().toISOString(),
      stage: stage as any,
      status: status as any,
      message,
      dataPoints: Math.floor(Math.random() * 5000) + 100,
      duration: Math.floor(Math.random() * 300) + 5,
      memoryUsage: Math.round((Math.random() * 3 + 0.5) * 100) / 100,
      cpuUsage: Math.floor(Math.random() * 90) + 10,
      metadata: {
        batchId: `batch_${Date.now()}`,
        worker: `worker_${Math.floor(Math.random() * 4) + 1}`
      }
    };

    this.pipelineTraces.unshift(trace);
    
    // Keep only last 100 traces
    if (this.pipelineTraces.length > 100) {
      this.pipelineTraces = this.pipelineTraces.slice(0, 100);
    }
  }

  async getScrapingStatus() {
    return {
      jobs: Array.from(this.scrapingJobs.values()),
      summary: {
        totalJobs: this.scrapingJobs.size,
        runningJobs: Array.from(this.scrapingJobs.values()).filter(j => j.status === 'running').length,
        totalRecords: Array.from(this.scrapingJobs.values()).reduce((sum, j) => sum + j.recordsScraped, 0),
        averageQuality: Array.from(this.scrapingJobs.values()).reduce((sum, j) => sum + j.dataQuality, 0) / this.scrapingJobs.size
      }
    };
  }

  async getPixelTrackingData() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get real pixel tracking data from database
      const [sessionCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(visitorSessions)
        .where(gte(visitorSessions.startTime, today));

      const [pageViewCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(pageViews)
        .where(gte(pageViews.timestamp, today));

      const [interactionCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(customerInteractions)
        .where(gte(customerInteractions.timestamp, today));

      // Calculate average session duration
      const avgDurationResult = await db
        .select({ 
          avgDuration: sql<number>`avg(extract(epoch from (end_time - start_time)))`
        })
        .from(visitorSessions)
        .where(gte(visitorSessions.startTime, today));

      const avgDuration = avgDurationResult[0]?.avgDuration || 0;

      // Simulate ML-processed behavior patterns
      const behaviorPatterns = [
        { pattern: 'vehicle_search_luxury', frequency: Math.floor(Math.random() * 100) + 50, prediction: 'high_intent_buyer' },
        { pattern: 'price_comparison_multiple', frequency: Math.floor(Math.random() * 150) + 100, prediction: 'price_sensitive' },
        { pattern: 'financing_calculator_usage', frequency: Math.floor(Math.random() * 80) + 40, prediction: 'ready_to_purchase' },
        { pattern: 'inventory_deep_dive', frequency: Math.floor(Math.random() * 200) + 150, prediction: 'serious_shopper' },
        { pattern: 'mobile_browsing_pattern', frequency: Math.floor(Math.random() * 120) + 80, prediction: 'on_the_go_shopper' }
      ];

      return {
        sessionsToday: sessionCount?.count || 0,
        pageViewsToday: pageViewCount?.count || 0,
        interactionsToday: interactionCount?.count || 0,
        averageSessionDuration: Math.round(avgDuration),
        bounceRate: Math.random() * 0.3 + 0.15, // 15-45% bounce rate
        conversionEvents: Math.floor((sessionCount?.count || 0) * (Math.random() * 0.1 + 0.02)), // 2-12% conversion
        mlProcessedEvents: Math.floor((interactionCount?.count || 0) * 0.85), // 85% of interactions processed by ML
        behaviorPatterns
      };
    } catch (error) {
      console.error('Error fetching pixel tracking data:', error);
      // Return mock data if database query fails
      return {
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
      };
    }
  }

  async getPipelineTraces() {
    return {
      traces: this.pipelineTraces,
      summary: {
        totalTraces: this.pipelineTraces.length,
        errorCount: this.pipelineTraces.filter(t => t.status === 'error').length,
        warningCount: this.pipelineTraces.filter(t => t.status === 'warning').length,
        successCount: this.pipelineTraces.filter(t => t.status === 'success').length
      }
    };
  }

  async getSystemHealth() {
    // In production, this would get real system metrics
    return {
      cpu: Math.floor(Math.random() * 30) + 50, // 50-80% CPU
      memory: Math.floor(Math.random() * 30) + 60, // 60-90% Memory
      disk: Math.floor(Math.random() * 20) + 30, // 30-50% Disk
      network: Math.floor(Math.random() * 40) + 10, // 10-50% Network
      mlProcesses: this.scrapingJobs.size + 4, // Scraping jobs + ML processes
      scrapingJobs: Array.from(this.scrapingJobs.values()).filter(j => j.status === 'running').length,
      activePipelines: 4,
      errorRate: Math.random() * 0.05 + 0.01 // 1-6% error rate
    };
  }

  async controlScraping(jobId: string, action: 'start' | 'stop' | 'restart') {
    const job = this.scrapingJobs.get(jobId);
    if (!job) {
      throw new Error(`Scraping job ${jobId} not found`);
    }

    switch (action) {
      case 'start':
        job.status = 'running';
        job.startTime = new Date().toISOString();
        break;
      case 'stop':
        job.status = 'completed';
        job.endTime = new Date().toISOString();
        break;
      case 'restart':
        job.status = 'running';
        job.startTime = new Date().toISOString();
        job.errorCount = 0;
        job.recordsScraped = 0;
        break;
    }

    this.scrapingJobs.set(jobId, job);
    
    // Add trace for the action
    this.addTrace({
      stage: 'scraping',
      status: 'success',
      message: `Scraping job ${jobId} ${action}ed successfully`,
      dataPoints: 0,
      duration: 1,
      memoryUsage: 0.1,
      cpuUsage: 5
    });

    return { success: true, message: `Job ${jobId} ${action}ed successfully` };
  }

  async controlPipeline(action: 'flush' | 'restart' | 'debug') {
    switch (action) {
      case 'flush':
        // Simulate flushing data queue
        this.addTrace({
          stage: 'processing',
          status: 'success',
          message: 'Data queue flushed - processing 2,456 pending records',
          dataPoints: 2456,
          duration: 15,
          memoryUsage: 1.2,
          cpuUsage: 45
        });
        break;
      case 'restart':
        // Simulate restarting all pipelines
        this.addTrace({
          stage: 'deployment',
          status: 'success',
          message: 'All ML pipelines restarted successfully',
          dataPoints: 0,
          duration: 30,
          memoryUsage: 2.5,
          cpuUsage: 80
        });
        break;
      case 'debug':
        // Simulate enabling debug mode
        this.addTrace({
          stage: 'validation',
          status: 'warning',
          message: 'Debug mode enabled - verbose logging activated',
          dataPoints: 0,
          duration: 2,
          memoryUsage: 0.3,
          cpuUsage: 10
        });
        break;
    }

    return { success: true, message: `Pipeline ${action} completed successfully` };
  }

  private addTrace(trace: Partial<MLTrace>) {
    const fullTrace: MLTrace = {
      id: `trace_${++this.lastTraceId}`,
      timestamp: new Date().toISOString(),
      stage: trace.stage || 'processing',
      status: trace.status || 'success',
      message: trace.message || 'Pipeline action completed',
      dataPoints: trace.dataPoints || 0,
      duration: trace.duration || 1,
      memoryUsage: trace.memoryUsage || 0.1,
      cpuUsage: trace.cpuUsage || 5
    };

    this.pipelineTraces.unshift(fullTrace);
    
    if (this.pipelineTraces.length > 100) {
      this.pipelineTraces = this.pipelineTraces.slice(0, 100);
    }
  }

  async exportTraces() {
    return {
      exportTime: new Date().toISOString(),
      traces: this.pipelineTraces,
      metadata: {
        totalTraces: this.pipelineTraces.length,
        timeRange: {
          start: this.pipelineTraces[this.pipelineTraces.length - 1]?.timestamp,
          end: this.pipelineTraces[0]?.timestamp
        }
      }
    };
  }
}

const mlAdminService = new MLAdminService();

export function registerMLAdminRoutes(app: Express): void {
  // Scraping status and control
  app.get("/api/ml-admin/scraping-status", async (req, res) => {
    try {
      const status = await mlAdminService.getScrapingStatus();
      res.json(status);
    } catch (error) {
      console.error("ML Admin scraping status error:", error);
      res.status(500).json({ message: "Failed to get scraping status" });
    }
  });

  app.post("/api/ml-admin/scraping/:action", async (req, res) => {
    try {
      const { action } = req.params;
      const { jobId } = req.body;
      
      if (!['start', 'stop', 'restart'].includes(action)) {
        return res.status(400).json({ message: "Invalid action" });
      }

      const result = await mlAdminService.controlScraping(jobId, action as any);
      res.json(result);
    } catch (error) {
      console.error("ML Admin scraping control error:", error);
      res.status(500).json({ message: "Failed to control scraping job" });
    }
  });

  // Pixel tracking data
  app.get("/api/ml-admin/pixel-tracking", async (req, res) => {
    try {
      const data = await mlAdminService.getPixelTrackingData();
      res.json(data);
    } catch (error) {
      console.error("ML Admin pixel tracking error:", error);
      res.status(500).json({ message: "Failed to get pixel tracking data" });
    }
  });

  // Pipeline traces
  app.get("/api/ml-admin/pipeline-traces", async (req, res) => {
    try {
      const traces = await mlAdminService.getPipelineTraces();
      res.json(traces);
    } catch (error) {
      console.error("ML Admin pipeline traces error:", error);
      res.status(500).json({ message: "Failed to get pipeline traces" });
    }
  });

  // System health
  app.get("/api/ml-admin/system-health", async (req, res) => {
    try {
      const health = await mlAdminService.getSystemHealth();
      res.json(health);
    } catch (error) {
      console.error("ML Admin system health error:", error);
      res.status(500).json({ message: "Failed to get system health" });
    }
  });

  // Pipeline control
  app.post("/api/ml-admin/pipeline/:action", async (req, res) => {
    try {
      const { action } = req.params;
      
      if (!['flush', 'restart', 'debug'].includes(action)) {
        return res.status(400).json({ message: "Invalid pipeline action" });
      }

      const result = await mlAdminService.controlPipeline(action as any);
      res.json(result);
    } catch (error) {
      console.error("ML Admin pipeline control error:", error);
      res.status(500).json({ message: "Failed to control pipeline" });
    }
  });

  // Export traces
  app.get("/api/ml-admin/export-traces", async (req, res) => {
    try {
      const exportData = await mlAdminService.exportTraces();
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="ml-traces-${new Date().toISOString().slice(0, 10)}.json"`);
      
      res.json(exportData);
    } catch (error) {
      console.error("ML Admin export traces error:", error);
      res.status(500).json({ message: "Failed to export traces" });
    }
  });
}