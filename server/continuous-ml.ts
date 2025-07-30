import type { Express } from "express";
import { spawn, ChildProcess } from "child_process";
import { EventEmitter } from "events";

interface MLParams {
  learning_rate: number;
  batch_size: number;
  scrape_interval: number;
  epochs: number;
  model_type: string;
  data_sources: string[];
  quality_threshold: number;
  max_training_time: number;
}

interface PipelineMetrics {
  last_scrape: string;
  last_train: string;
  scrape_count: number;
  train_count: number;
  model_accuracy: number;
  data_quality: number;
  error_count: number;
  uptime: number;
  last_error?: string;
}

interface PipelineStatus {
  running: boolean;
  pipeline_id: string;
  started_at?: string;
  metrics: PipelineMetrics;
  params: MLParams;
  health: 'healthy' | 'warning' | 'critical';
}

class ContinuousMLOrchestrator extends EventEmitter {
  private pipelines: Map<string, PipelineStatus> = new Map();
  private processes: Map<string, ChildProcess> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    super();
  }

  async startPipeline(pipelineId: string, params: MLParams): Promise<{ status: string; message: string }> {
    try {
      if (this.pipelines.has(pipelineId) && this.pipelines.get(pipelineId)?.running) {
        return { status: "error", message: "Pipeline already running" };
      }

      const initialStatus: PipelineStatus = {
        running: true,
        pipeline_id: pipelineId,
        started_at: new Date().toISOString(),
        params,
        health: 'healthy',
        metrics: {
          last_scrape: '',
          last_train: '',
          scrape_count: 0,
          train_count: 0,
          model_accuracy: 0,
          data_quality: 0,
          error_count: 0,
          uptime: 0
        }
      };

      this.pipelines.set(pipelineId, initialStatus);
      await this.spawnMLProcess(pipelineId, params);
      this.startHealthMonitoring(pipelineId);

      console.log(`🚀 Started ML pipeline: ${pipelineId}`);
      return { status: "started", message: `Pipeline ${pipelineId} started successfully` };
    } catch (error) {
      console.error(`Failed to start pipeline ${pipelineId}:`, error);
      return { status: "error", message: `Failed to start pipeline: ${error.message}` };
    }
  }

  async stopPipeline(pipelineId: string): Promise<{ status: string; message: string }> {
    try {
      const pipeline = this.pipelines.get(pipelineId);
      if (!pipeline || !pipeline.running) {
        return { status: "error", message: "Pipeline not running" };
      }

      pipeline.running = false;
      this.pipelines.set(pipelineId, pipeline);

      // Stop the process
      const process = this.processes.get(pipelineId);
      if (process) {
        process.kill('SIGTERM');
        this.processes.delete(pipelineId);
      }

      // Clear monitoring interval
      const interval = this.intervals.get(pipelineId);
      if (interval) {
        clearInterval(interval);
        this.intervals.delete(pipelineId);
      }

      console.log(`🛑 Stopped ML pipeline: ${pipelineId}`);
      return { status: "stopped", message: `Pipeline ${pipelineId} stopped successfully` };
    } catch (error) {
      console.error(`Failed to stop pipeline ${pipelineId}:`, error);
      return { status: "error", message: `Failed to stop pipeline: ${error.message}` };
    }
  }

  async updateParams(pipelineId: string, newParams: Partial<MLParams>): Promise<{ status: string; message: string }> {
    try {
      const pipeline = this.pipelines.get(pipelineId);
      if (!pipeline) {
        return { status: "error", message: "Pipeline not found" };
      }

      const updatedParams = { ...pipeline.params, ...newParams };
      pipeline.params = updatedParams;
      this.pipelines.set(pipelineId, pipeline);

      // Send parameter update to the running process
      const process = this.processes.get(pipelineId);
      if (process && process.stdin) {
        const updateCommand = JSON.stringify({ command: 'update_params', params: updatedParams });
        process.stdin.write(updateCommand + '\n');
      }

      console.log(`⚙️ Updated parameters for pipeline: ${pipelineId}`);
      return { status: "updated", message: `Parameters updated for pipeline ${pipelineId}` };
    } catch (error) {
      console.error(`Failed to update params for pipeline ${pipelineId}:`, error);
      return { status: "error", message: `Failed to update parameters: ${error.message}` };
    }
  }

  getStatus(pipelineId?: string): PipelineStatus | PipelineStatus[] {
    if (pipelineId) {
      return this.pipelines.get(pipelineId) || {
        running: false,
        pipeline_id: pipelineId,
        params: {} as MLParams,
        health: 'critical',
        metrics: {
          last_scrape: '',
          last_train: '',
          scrape_count: 0,
          train_count: 0,
          model_accuracy: 0,
          data_quality: 0,
          error_count: 0,
          uptime: 0
        }
      };
    }
    return Array.from(this.pipelines.values());
  }

  private async spawnMLProcess(pipelineId: string, params: MLParams): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Spawn Python ML process
        const pythonProcess = spawn('python3', [
          '-c', `
import json
import time
import sys
import random
import threading
from datetime import datetime

class ContinuousMLTrainer:
    def __init__(self, params):
        self.params = params
        self.running = True
        self.metrics = {
            'last_scrape': '',
            'last_train': '',
            'scrape_count': 0,
            'train_count': 0,
            'model_accuracy': 0.85,
            'data_quality': 0.92,
            'error_count': 0,
            'uptime': 0
        }
        
    def scrape_data(self):
        # Simulate web scraping
        time.sleep(random.uniform(1, 3))
        self.metrics['last_scrape'] = datetime.now().isoformat()
        self.metrics['scrape_count'] += 1
        
        # Simulate data quality check
        quality = random.uniform(0.8, 0.98)
        self.metrics['data_quality'] = quality
        
        return {"data_points": random.randint(100, 500), "quality": quality}
    
    def train_model(self, data):
        # Simulate model training
        training_time = min(self.params.get('max_training_time', 60), random.uniform(5, 15))
        time.sleep(training_time)
        
        self.metrics['last_train'] = datetime.now().isoformat()
        self.metrics['train_count'] += 1
        
        # Simulate accuracy improvement
        accuracy_change = random.uniform(-0.02, 0.05)
        self.metrics['model_accuracy'] = max(0.1, min(0.99, 
            self.metrics['model_accuracy'] + accuracy_change))
        
        return {"accuracy": self.metrics['model_accuracy'], "loss": random.uniform(0.01, 0.1)}
    
    def run_continuous_loop(self):
        start_time = time.time()
        while self.running:
            try:
                # Update uptime
                self.metrics['uptime'] = time.time() - start_time
                
                # Scrape data
                data = self.scrape_data()
                
                # Check data quality threshold
                if data['quality'] >= self.params.get('quality_threshold', 0.8):
                    # Train model
                    result = self.train_model(data)
                    
                    # Report metrics
                    print(json.dumps({
                        'type': 'metrics',
                        'pipeline_id': '${pipelineId}',
                        'metrics': self.metrics,
                        'training_result': result
                    }), flush=True)
                else:
                    self.metrics['error_count'] += 1
                    print(json.dumps({
                        'type': 'warning',
                        'message': f'Data quality too low: {data["quality"]}'
                    }), flush=True)
                
                # Wait for next cycle
                time.sleep(self.params.get('scrape_interval', 300))
                
            except Exception as e:
                self.metrics['error_count'] += 1
                print(json.dumps({
                    'type': 'error',
                    'message': str(e)
                }), flush=True)
                time.sleep(30)  # Wait before retry
    
    def update_params(self, new_params):
        self.params.update(new_params)
        print(json.dumps({
            'type': 'info',
            'message': 'Parameters updated',
            'params': self.params
        }), flush=True)

# Initialize trainer
params = ${JSON.stringify(params)}
trainer = ContinuousMLTrainer(params)

# Handle parameter updates from stdin
def handle_input():
    for line in sys.stdin:
        try:
            command = json.loads(line.strip())
            if command.get('command') == 'update_params':
                trainer.update_params(command.get('params', {}))
        except Exception as e:
            print(json.dumps({'type': 'error', 'message': f'Input error: {str(e)}'}), flush=True)

input_thread = threading.Thread(target=handle_input, daemon=True)
input_thread.start()

# Start the main training loop
trainer.run_continuous_loop()
`
        ], { stdio: ['pipe', 'pipe', 'pipe'] });

        // Handle process output
        pythonProcess.stdout?.on('data', (data) => {
          const lines = data.toString().split('\n').filter(line => line.trim());
          lines.forEach(line => {
            try {
              const message = JSON.parse(line);
              this.handleProcessMessage(pipelineId, message);
            } catch (e) {
              console.log(`ML Process ${pipelineId}:`, line);
            }
          });
        });

        pythonProcess.stderr?.on('data', (data) => {
          console.error(`ML Process ${pipelineId} Error:`, data.toString());
          this.handleProcessError(pipelineId, data.toString());
        });

        pythonProcess.on('close', (code) => {
          console.log(`ML Process ${pipelineId} exited with code:`, code);
          this.handleProcessExit(pipelineId, code);
        });

        this.processes.set(pipelineId, pythonProcess);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleProcessMessage(pipelineId: string, message: any): void {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) return;

    switch (message.type) {
      case 'metrics':
        pipeline.metrics = { ...pipeline.metrics, ...message.metrics };
        pipeline.health = this.assessHealth(pipeline.metrics);
        this.pipelines.set(pipelineId, pipeline);
        this.emit('metrics_update', pipelineId, message.metrics);
        break;
      
      case 'warning':
        console.warn(`Pipeline ${pipelineId} Warning:`, message.message);
        pipeline.health = 'warning';
        this.pipelines.set(pipelineId, pipeline);
        break;
      
      case 'error':
        console.error(`Pipeline ${pipelineId} Error:`, message.message);
        pipeline.metrics.error_count++;
        pipeline.health = 'critical';
        this.pipelines.set(pipelineId, pipeline);
        break;
    }
  }

  private handleProcessError(pipelineId: string, error: string): void {
    const pipeline = this.pipelines.get(pipelineId);
    if (pipeline) {
      pipeline.metrics.error_count++;
      pipeline.metrics.last_error = error;
      pipeline.health = 'critical';
      this.pipelines.set(pipelineId, pipeline);
    }
  }

  private handleProcessExit(pipelineId: string, code: number | null): void {
    const pipeline = this.pipelines.get(pipelineId);
    if (pipeline) {
      pipeline.running = false;
      pipeline.health = 'critical';
      this.pipelines.set(pipelineId, pipeline);
    }
    this.processes.delete(pipelineId);
  }

  private assessHealth(metrics: PipelineMetrics): 'healthy' | 'warning' | 'critical' {
    if (metrics.error_count > 10) return 'critical';
    if (metrics.data_quality < 0.7) return 'critical';
    if (metrics.model_accuracy < 0.5) return 'critical';
    if (metrics.error_count > 3) return 'warning';
    if (metrics.data_quality < 0.85) return 'warning';
    return 'healthy';
  }

  private startHealthMonitoring(pipelineId: string): void {
    const interval = setInterval(() => {
      const pipeline = this.pipelines.get(pipelineId);
      if (pipeline && pipeline.running) {
        // Auto-restart on critical health
        if (pipeline.health === 'critical' && pipeline.metrics.error_count > 15) {
          console.log(`🔄 Auto-restarting unhealthy pipeline: ${pipelineId}`);
          this.stopPipeline(pipelineId).then(() => {
            setTimeout(() => {
              this.startPipeline(pipelineId, pipeline.params);
            }, 5000);
          });
        }
      } else {
        clearInterval(interval);
        this.intervals.delete(pipelineId);
      }
    }, 30000); // Check every 30 seconds

    this.intervals.set(pipelineId, interval);
  }
}

// Global orchestrator instance
const mlOrchestrator = new ContinuousMLOrchestrator();

export function registerContinuousMLRoutes(app: Express): void {
  // Start ML pipeline
  app.post("/api/ml-control/start", async (req, res) => {
    try {
      const { pipeline_id = "default", params } = req.body;
      
      const defaultParams: MLParams = {
        learning_rate: 0.001,
        batch_size: 32,
        scrape_interval: 300, // 5 minutes
        epochs: 10,
        model_type: "xgboost",
        data_sources: ["carfax", "autotrader", "cargurus"],
        quality_threshold: 0.8,
        max_training_time: 120
      };

      const mergedParams = { ...defaultParams, ...params };
      const result = await mlOrchestrator.startPipeline(pipeline_id, mergedParams);
      
      res.json(result);
    } catch (error) {
      console.error("ML start error:", error);
      res.status(500).json({ status: "error", message: "Failed to start ML pipeline" });
    }
  });

  // Stop ML pipeline
  app.post("/api/ml-control/stop", async (req, res) => {
    try {
      const { pipeline_id = "default" } = req.body;
      const result = await mlOrchestrator.stopPipeline(pipeline_id);
      res.json(result);
    } catch (error) {
      console.error("ML stop error:", error);
      res.status(500).json({ status: "error", message: "Failed to stop ML pipeline" });
    }
  });

  // Get pipeline status
  app.get("/api/ml-control/status/:pipelineId?", async (req, res) => {
    try {
      const { pipelineId } = req.params;
      const status = mlOrchestrator.getStatus(pipelineId);
      res.json(status);
    } catch (error) {
      console.error("ML status error:", error);
      res.status(500).json({ message: "Failed to get pipeline status" });
    }
  });

  // Update pipeline parameters
  app.post("/api/ml-control/params", async (req, res) => {
    try {
      const { pipeline_id = "default", params } = req.body;
      const result = await mlOrchestrator.updateParams(pipeline_id, params);
      res.json(result);
    } catch (error) {
      console.error("ML params update error:", error);
      res.status(500).json({ status: "error", message: "Failed to update parameters" });
    }
  });

  // Get real-time metrics
  app.get("/api/ml-control/metrics/:pipelineId", async (req, res) => {
    try {
      const { pipelineId } = req.params;
      const status = mlOrchestrator.getStatus(pipelineId) as PipelineStatus;
      
      if (!status || !status.running) {
        return res.status(404).json({ message: "Pipeline not found or not running" });
      }

      res.json({
        pipeline_id: pipelineId,
        metrics: status.metrics,
        health: status.health,
        uptime: status.metrics.uptime,
        params: status.params
      });
    } catch (error) {
      console.error("ML metrics error:", error);
      res.status(500).json({ message: "Failed to get metrics" });
    }
  });

  // Force restart pipeline
  app.post("/api/ml-control/restart", async (req, res) => {
    try {
      const { pipeline_id = "default" } = req.body;
      const status = mlOrchestrator.getStatus(pipeline_id) as PipelineStatus;
      
      if (!status) {
        return res.status(404).json({ status: "error", message: "Pipeline not found" });
      }

      const params = status.params;
      await mlOrchestrator.stopPipeline(pipeline_id);
      
      // Wait a moment before restart
      setTimeout(async () => {
        const result = await mlOrchestrator.startPipeline(pipeline_id, params);
        console.log(`🔄 Restarted pipeline ${pipeline_id}:`, result);
      }, 2000);

      res.json({ status: "restarting", message: `Pipeline ${pipeline_id} is restarting` });
    } catch (error) {
      console.error("ML restart error:", error);
      res.status(500).json({ status: "error", message: "Failed to restart pipeline" });
    }
  });
}

export { mlOrchestrator };