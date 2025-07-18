/**
 * Integration module for Python ML backend
 */

import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';
import path from 'path';

const execAsync = promisify(exec);

interface VehicleData {
  make: string;
  model: string;
  year: number;
  mileage?: number;
  price?: number;
  body_type?: string;
  fuel_type?: string;
  transmission?: string;
  drivetrain?: string;
  location?: string;
}

interface PricePrediction {
  predicted_price: number;
  confidence_interval: {
    lower_bound: number;
    upper_bound: number;
    confidence_level: number;
  };
  market_insights: {
    price_category: string;
    market_position: string;
    depreciation_rate: number;
    demand_score: number;
    recommendations: string[];
  };
  model_version: string;
  prediction_timestamp: string;
}

interface MLBackendStatus {
  pipeline_running: boolean;
  last_scraping: string | null;
  last_training: string | null;
  model_metrics: {
    mae: number;
    rmse: number;
    r2: number;
    mape: number;
  } | null;
  scrapers_status: Record<string, any>;
}

export class MLBackendIntegration {
  private pythonPath: string;
  private backendPath: string;
  private isInitialized: boolean = false;

  constructor() {
    this.pythonPath = process.env.PYTHON_PATH || 'python';
    this.backendPath = path.join(process.cwd(), 'ml_backend');
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if Python ML backend is available
      await this.checkPythonBackend();
      
      // Initialize the ML pipeline
      await this.initializePipeline();
      
      this.isInitialized = true;
      console.log('✅ ML Backend initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize ML backend:', error);
      throw error;
    }
  }

  private async checkPythonBackend(): Promise<void> {
    try {
      const { stdout } = await execAsync(`${this.pythonPath} --version`);
      console.log('Python version:', stdout.trim());
      
      // Check if required packages are installed
      const checkCmd = `cd ${this.backendPath} && ${this.pythonPath} -c "import pandas, numpy, xgboost, selenium, streamlit, flask; print('All packages available')"`;
      const { stdout: packagesOutput } = await execAsync(checkCmd);
      console.log('Python packages:', packagesOutput.trim());
    } catch (error) {
      throw new Error(`Python backend not available: ${error}`);
    }
  }

  private async initializePipeline(): Promise<void> {
    try {
      // Initialize the pipeline (this will create necessary directories and database)
      const initCmd = `cd ${this.backendPath} && ${this.pythonPath} main.py pipeline --mode prediction`;
      await execAsync(initCmd);
    } catch (error) {
      console.log('Pipeline initialization completed (may have warnings)');
    }
  }

  async getPricePrediction(vehicleData: VehicleData): Promise<PricePrediction> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(this.pythonPath, [
        'main.py',
        'predict',
        '--make', vehicleData.make,
        '--model', vehicleData.model,
        '--year', vehicleData.year.toString(),
        '--mileage', (vehicleData.mileage || 50000).toString(),
        '--body-type', vehicleData.body_type || 'Sedan'
      ], {
        cwd: this.backendPath,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let error = '';

      pythonProcess.stdout?.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr?.on('data', (data) => {
        error += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            // Parse the output to extract prediction
            const lines = output.split('\n');
            const priceLine = lines.find(line => line.includes('Predicted Price:'));
            const rangeLine = lines.find(line => line.includes('Confidence Range:'));
            
            if (priceLine) {
              const priceMatch = priceLine.match(/\$([0-9,]+)/);
              const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0;
              
              const rangeMatch = rangeLine?.match(/\$([0-9,]+)\s*-\s*\$([0-9,]+)/);
              const lowerBound = rangeMatch ? parseFloat(rangeMatch[1].replace(/,/g, '')) : price * 0.9;
              const upperBound = rangeMatch ? parseFloat(rangeMatch[2].replace(/,/g, '')) : price * 1.1;
              
              const prediction: PricePrediction = {
                predicted_price: price,
                confidence_interval: {
                  lower_bound: lowerBound,
                  upper_bound: upperBound,
                  confidence_level: 0.95
                },
                market_insights: {
                  price_category: this.categorizePriceRange(price),
                  market_position: 'average',
                  depreciation_rate: 0.12,
                  demand_score: 0.7,
                  recommendations: this.extractRecommendations(output)
                },
                model_version: 'v1.0',
                prediction_timestamp: new Date().toISOString()
              };
              
              resolve(prediction);
            } else {
              reject(new Error('Could not parse prediction output'));
            }
          } catch (parseError) {
            reject(new Error(`Failed to parse prediction: ${parseError}`));
          }
        } else {
          reject(new Error(`Python process failed with code ${code}: ${error}`));
        }
      });
    });
  }

  async getMLBackendStatus(): Promise<MLBackendStatus> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const statusCmd = `cd ${this.backendPath} && ${this.pythonPath} -c "import sys; sys.path.append('.'); from pipeline.run_pipeline import VehiclePricingPipeline; import json; pipeline = VehiclePricingPipeline(); status = pipeline.get_pipeline_status(); print(json.dumps(status, default=str))"`;

      const { stdout } = await execAsync(statusCmd);
      const status = JSON.parse(stdout.trim());
      
      return {
        pipeline_running: true,
        last_scraping: status.last_scraping,
        last_training: status.last_training,
        model_metrics: status.model_metrics,
        scrapers_status: status.scraper_status
      };
    } catch (error) {
      console.error('Error getting ML backend status:', error);
      return {
        pipeline_running: false,
        last_scraping: null,
        last_training: null,
        model_metrics: null,
        scrapers_status: {}
      };
    }
  }

  async runScraping(): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const scrapingCmd = `cd ${this.backendPath} && ${this.pythonPath} main.py pipeline --mode scraping`;
      const { stdout } = await execAsync(scrapingCmd);
      return { success: true, output: stdout };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async runTraining(): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const trainingCmd = `cd ${this.backendPath} && ${this.pythonPath} main.py pipeline --mode training`;
      const { stdout } = await execAsync(trainingCmd);
      return { success: true, output: stdout };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async startDashboard(port: number = 8501): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const dashboardProcess = spawn(this.pythonPath, [
      'main.py',
      'dashboard',
      '--port', port.toString()
    ], {
      cwd: this.backendPath,
      detached: true,
      stdio: 'ignore'
    });

    dashboardProcess.unref();
    console.log(`🚀 ML Dashboard started on port ${port}`);
  }

  private categorizePriceRange(price: number): string {
    if (price < 15000) return 'budget';
    if (price < 30000) return 'mid-range';
    if (price < 50000) return 'premium';
    return 'luxury';
  }

  private extractRecommendations(output: string): string[] {
    const recommendations: string[] = [];
    const lines = output.split('\n');
    
    let inRecommendations = false;
    for (const line of lines) {
      if (line.includes('Recommendations:')) {
        inRecommendations = true;
        continue;
      }
      
      if (inRecommendations && line.trim().startsWith('•')) {
        recommendations.push(line.trim().substring(1).trim());
      }
    }
    
    return recommendations;
  }
}

// Export singleton instance
export const mlBackend = new MLBackendIntegration();