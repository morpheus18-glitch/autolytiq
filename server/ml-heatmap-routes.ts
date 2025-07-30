import { Express } from "express";

// ML Performance Heatmap API endpoints
export function registerMLHeatmapRoutes(app: Express): void {
  
  // Get heatmap data with various dimensions and metrics
  app.get("/api/ml-heatmap/data", async (req, res) => {
    try {
      const { metric = 'accuracy', timeRange = '7d', dimension = 'model' } = req.query;
      
      // Generate comprehensive heatmap data based on dimension
      let heatmapData: any[] = [];
      
      if (dimension === 'model') {
        // Model performance across time slots
        const models = ['pricing_model', 'customer_segmentation', 'demand_forecasting', 'inventory_optimization'];
        const timeSlots = ['00-04', '04-08', '08-12', '12-16', '16-20', '20-24'];
        
        models.forEach(model => {
          timeSlots.forEach(timeSlot => {
            const baseAccuracy = 0.82 + Math.random() * 0.18;
            const predictions = Math.floor(Math.random() * 15000) + 2000;
            const errors = Math.floor(predictions * (1 - baseAccuracy));
            const drift = Math.random() * 0.25;
            const latency = 8 + Math.random() * 25;
            
            let value = baseAccuracy;
            if (metric === 'latency') value = latency;
            else if (metric === 'error_rate') value = 1 - baseAccuracy;
            else if (metric === 'drift_score') value = drift;
            else if (metric === 'throughput') value = predictions / 3600; // per second
            
            heatmapData.push({
              x: model,
              y: timeSlot,
              value,
              color: getHeatmapColor(value, metric as string),
              metadata: {
                accuracy: baseAccuracy,
                predictions,
                errors,
                lastUpdated: new Date(),
                drift,
                confidence: 0.75 + Math.random() * 0.25,
                latency
              }
            });
          });
        });
      } else if (dimension === 'feature') {
        // Feature importance across models
        const models = ['pricing_model', 'customer_segmentation', 'demand_forecasting'];
        const features = ['vehicle_age', 'mileage', 'make_model', 'condition', 'location', 'season', 'market_trend'];
        
        models.forEach(model => {
          features.forEach(feature => {
            const importance = Math.random();
            const stability = 0.6 + Math.random() * 0.4;
            const impact = Math.random();
            
            let value = importance;
            if (metric === 'stability') value = stability;
            else if (metric === 'impact') value = impact;
            
            heatmapData.push({
              x: model,
              y: feature,
              value,
              color: getHeatmapColor(value, metric as string),
              metadata: {
                importance,
                stability,
                impact,
                correlations: Math.random() * 0.8,
                variance: Math.random() * 0.3,
                lastAnalyzed: new Date()
              }
            });
          });
        });
      } else if (dimension === 'geography') {
        // Geographic performance distribution
        const models = ['pricing_model', 'customer_segmentation'];
        const regions = ['North', 'South', 'East', 'West', 'Central', 'Coastal'];
        
        models.forEach(model => {
          regions.forEach(region => {
            const performance = 0.7 + Math.random() * 0.3;
            const volume = Math.floor(Math.random() * 8000) + 1000;
            
            heatmapData.push({
              x: model,
              y: region,
              value: performance,
              color: getHeatmapColor(performance, metric as string),
              metadata: {
                accuracy: performance,
                volume,
                marketShare: Math.random(),
                seasonality: Math.random() * 0.4,
                competition: Math.random() * 0.6
              }
            });
          });
        });
      }
      
      res.json({
        data: heatmapData,
        metadata: {
          metric,
          timeRange,
          dimension,
          lastUpdated: new Date(),
          totalCells: heatmapData.length
        }
      });
    } catch (error) {
      console.error("ML heatmap data error:", error);
      res.status(500).json({ message: "Failed to get heatmap data" });
    }
  });

  // Get drill-down data for specific cell
  app.get("/api/ml-heatmap/drill-down", async (req, res) => {
    try {
      const { x, y, metric } = req.query;
      
      // Generate detailed drill-down analytics
      const drillDownData = {
        dimension: `${x} - ${y}`,
        value: x,
        metrics: {
          accuracy: 0.87 + Math.random() * 0.13,
          precision: 0.84 + Math.random() * 0.16,
          recall: 0.82 + Math.random() * 0.18,
          f1Score: 0.85 + Math.random() * 0.15,
          auc: 0.91 + Math.random() * 0.09,
          predictions: Math.floor(Math.random() * 25000) + 5000,
          errors: Math.floor(Math.random() * 500) + 50,
          avgLatency: 6 + Math.random() * 20,
          throughput: Math.floor(Math.random() * 1000) + 200,
          errorRate: Math.random() * 0.05
        },
        timeSeries: Array.from({ length: 48 }, (_, i) => ({
          timestamp: new Date(Date.now() - (47 - i) * 1800000), // 30-min intervals
          accuracy: 0.75 + Math.random() * 0.25,
          predictions: Math.floor(Math.random() * 800) + 100,
          latency: 5 + Math.random() * 15,
          errorRate: Math.random() * 0.08
        })),
        featureImportance: {
          'vehicle_age': 0.28 + Math.random() * 0.15,
          'mileage': 0.24 + Math.random() * 0.12,
          'make_model': 0.20 + Math.random() * 0.10,
          'condition': 0.15 + Math.random() * 0.08,
          'location': 0.08 + Math.random() * 0.05,
          'season': 0.05 + Math.random() * 0.03
        },
        errorBreakdown: {
          'Prediction Out of Range': 0.35 + Math.random() * 0.15,
          'Feature Missing': 0.20 + Math.random() * 0.10,
          'Model Drift': 0.18 + Math.random() * 0.08,
          'Data Quality': 0.15 + Math.random() * 0.07,
          'System Error': 0.07 + Math.random() * 0.03,
          'Timeout': 0.05 + Math.random() * 0.02
        },
        performanceDistribution: {
          'Excellent (>95%)': Math.random() * 0.3,
          'Good (85-95%)': 0.4 + Math.random() * 0.3,
          'Fair (75-85%)': 0.2 + Math.random() * 0.2,
          'Poor (<75%)': Math.random() * 0.1
        },
        correlations: {
          'with_other_models': Math.random() * 0.8,
          'with_features': Math.random() * 0.9,
          'temporal': Math.random() * 0.7
        },
        recommendations: [
          'Monitor feature drift in vehicle_age - showing increased variance',
          'Consider retraining with recent data - accuracy declining over time',
          'Investigate error spike in morning hours (08-12)',
          'Feature engineering opportunity in location data'
        ],
        alerts: [
          {
            type: 'warning',
            message: 'Error rate increased by 15% in last 4 hours',
            timestamp: new Date(Date.now() - 2400000)
          },
          {
            type: 'info',
            message: 'New training data available (2,500 samples)',
            timestamp: new Date(Date.now() - 3600000)
          }
        ]
      };
      
      res.json(drillDownData);
    } catch (error) {
      console.error("ML heatmap drill-down error:", error);
      res.status(500).json({ message: "Failed to get drill-down data" });
    }
  });

  // Get available dimensions and metrics
  app.get("/api/ml-heatmap/config", async (req, res) => {
    try {
      const config = {
        dimensions: [
          { value: 'model', label: 'Model Performance', description: 'Models vs Time Slots' },
          { value: 'feature', label: 'Feature Analysis', description: 'Models vs Features' },
          { value: 'geography', label: 'Geographic Distribution', description: 'Models vs Regions' },
          { value: 'customer', label: 'Customer Segments', description: 'Models vs Segments' },
          { value: 'product', label: 'Product Categories', description: 'Models vs Products' }
        ],
        metrics: [
          { value: 'accuracy', label: 'Accuracy', format: 'percentage', description: 'Model prediction accuracy' },
          { value: 'latency', label: 'Latency', format: 'milliseconds', description: 'Response time' },
          { value: 'throughput', label: 'Throughput', format: 'per_second', description: 'Predictions per second' },
          { value: 'error_rate', label: 'Error Rate', format: 'percentage', description: 'Prediction error rate' },
          { value: 'drift_score', label: 'Drift Score', format: 'percentage', description: 'Data drift measurement' },
          { value: 'confidence', label: 'Confidence', format: 'percentage', description: 'Prediction confidence' },
          { value: 'stability', label: 'Stability', format: 'percentage', description: 'Performance stability' }
        ],
        timeRanges: [
          { value: '1h', label: '1 Hour', description: 'Last hour data' },
          { value: '6h', label: '6 Hours', description: 'Last 6 hours data' },
          { value: '24h', label: '24 Hours', description: 'Last day data' },
          { value: '7d', label: '7 Days', description: 'Last week data' },
          { value: '30d', label: '30 Days', description: 'Last month data' }
        ],
        refreshIntervals: [
          { value: 10, label: '10 seconds' },
          { value: 30, label: '30 seconds' },
          { value: 60, label: '1 minute' },
          { value: 300, label: '5 minutes' }
        ]
      };
      
      res.json(config);
    } catch (error) {
      console.error("ML heatmap config error:", error);
      res.status(500).json({ message: "Failed to get heatmap configuration" });
    }
  });

  // Export heatmap data
  app.post("/api/ml-heatmap/export", async (req, res) => {
    try {
      const { metric, timeRange, dimension, format = 'json' } = req.body;
      
      // Generate export data (would normally fetch from database)
      const exportData = {
        metadata: {
          exportedAt: new Date(),
          metric,
          timeRange,
          dimension,
          format
        },
        data: [] as any[], // Would contain the actual heatmap data
        summary: {
          totalCells: 0,
          averageValue: 0,
          maxValue: 0,
          minValue: 0
        }
      };
      
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=ml-performance-heatmap.csv');
        // Would generate CSV content here
        res.send('x,y,value,metric\n');
      } else {
        res.json(exportData);
      }
    } catch (error) {
      console.error("ML heatmap export error:", error);
      res.status(500).json({ message: "Failed to export heatmap data" });
    }
  });
}

// Helper function to generate heatmap colors
function getHeatmapColor(value: number, metric: string): string {
  const normalized = Math.max(0, Math.min(1, value));
  
  // Different color schemes for different metric types
  if (metric === 'accuracy' || metric === 'throughput' || metric === 'confidence' || metric === 'stability') {
    // Green scale for "higher is better" metrics
    const intensity = Math.floor(normalized * 255);
    return `rgb(${255 - intensity}, 255, ${255 - intensity})`;
  } else if (metric === 'latency' || metric === 'error_rate' || metric === 'drift_score') {
    // Red scale for "lower is better" metrics
    const intensity = Math.floor((1 - normalized) * 255);
    return `rgb(255, ${intensity}, ${intensity})`;
  } else {
    // Blue scale for neutral metrics
    const intensity = Math.floor(normalized * 255);
    return `rgb(${255 - intensity}, ${255 - intensity}, 255)`;
  }
}