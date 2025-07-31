"""
Telemetry Adapters: Connect to existing monitoring infrastructure
Supports Prometheus, MLflow, Kafka, and custom metrics
"""

import asyncio
import aiohttp
import pandas as pd
from typing import Dict, List, Optional, Any, AsyncGenerator
from dataclasses import dataclass
from datetime import datetime, timedelta
import json
import logging
from abc import ABC, abstractmethod
import os

from .causal_core import CausalMetric, CausalNode, CausalNodeType

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class TelemetryPoint:
    """Single telemetry data point"""
    metric_name: str
    value: float
    timestamp: datetime
    labels: Dict[str, str]
    source: str

class TelemetryAdapter(ABC):
    """Base class for telemetry adapters"""
    
    @abstractmethod
    async def collect_metrics(self, time_range_minutes: int = 60) -> List[TelemetryPoint]:
        """Collect metrics from the source"""
        pass
    
    @abstractmethod
    def get_adapter_name(self) -> str:
        """Return adapter name"""
        pass

class PrometheusAdapter(TelemetryAdapter):
    """Adapter for Prometheus metrics"""
    
    def __init__(self, prometheus_url: str, query_mappings: Dict[str, str] = None):
        self.prometheus_url = prometheus_url.rstrip('/')
        self.query_mappings = query_mappings or self._default_query_mappings()
        
    def _default_query_mappings(self) -> Dict[str, str]:
        """Default Prometheus queries for common MLOps metrics"""
        return {
            "model_prediction_latency": "histogram_quantile(0.95, rate(model_prediction_duration_seconds_bucket[5m]))",
            "model_accuracy": "model_accuracy_score",
            "feature_drift_score": "feature_drift_detector_score",
            "cpu_usage": "100 - (avg by (instance) (irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
            "memory_usage": "(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100",
            "request_rate": "rate(http_requests_total[5m])",
            "error_rate": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "data_pipeline_throughput": "rate(data_pipeline_processed_records_total[5m])",
            "model_inference_count": "rate(model_inference_total[5m])"
        }
    
    async def collect_metrics(self, time_range_minutes: int = 60) -> List[TelemetryPoint]:
        """Collect metrics from Prometheus"""
        telemetry_points = []
        
        async with aiohttp.ClientSession() as session:
            for metric_name, query in self.query_mappings.items():
                try:
                    # Query Prometheus for the metric
                    params = {
                        'query': query,
                        'time': datetime.utcnow().isoformat()
                    }
                    
                    async with session.get(f"{self.prometheus_url}/api/v1/query", params=params) as response:
                        if response.status == 200:
                            data = await response.json()
                            
                            if data.get('status') == 'success':
                                results = data.get('data', {}).get('result', [])
                                
                                for result in results:
                                    value = float(result['value'][1])
                                    timestamp = datetime.fromtimestamp(float(result['value'][0]))
                                    labels = result.get('metric', {})
                                    
                                    telemetry_point = TelemetryPoint(
                                        metric_name=metric_name,
                                        value=value,
                                        timestamp=timestamp,
                                        labels=labels,
                                        source="prometheus"
                                    )
                                    telemetry_points.append(telemetry_point)
                        else:
                            logger.warning(f"Failed to query Prometheus for {metric_name}: {response.status}")
                            
                except Exception as e:
                    logger.error(f"Error querying Prometheus for {metric_name}: {e}")
        
        logger.info(f"Collected {len(telemetry_points)} telemetry points from Prometheus")
        return telemetry_points
    
    def get_adapter_name(self) -> str:
        return "prometheus"

class MLflowAdapter(TelemetryAdapter):
    """Adapter for MLflow experiment tracking"""
    
    def __init__(self, mlflow_url: str, experiments: List[str] = None):
        self.mlflow_url = mlflow_url.rstrip('/')
        self.experiments = experiments or ["Default"]
        
    async def collect_metrics(self, time_range_minutes: int = 60) -> List[TelemetryPoint]:
        """Collect metrics from MLflow experiments"""
        telemetry_points = []
        cutoff_time = datetime.utcnow() - timedelta(minutes=time_range_minutes)
        
        async with aiohttp.ClientSession() as session:
            try:
                # Get experiments
                async with session.get(f"{self.mlflow_url}/api/2.0/mlflow/experiments/search") as response:
                    if response.status == 200:
                        experiments_data = await response.json()
                        
                        for experiment in experiments_data.get('experiments', []):
                            experiment_id = experiment['experiment_id']
                            
                            # Get runs for this experiment
                            runs_params = {
                                'experiment_ids': [experiment_id],
                                'max_results': 100
                            }
                            
                            async with session.post(
                                f"{self.mlflow_url}/api/2.0/mlflow/runs/search",
                                json=runs_params
                            ) as runs_response:
                                if runs_response.status == 200:
                                    runs_data = await runs_response.json()
                                    
                                    for run in runs_data.get('runs', []):
                                        run_info = run.get('info', {})
                                        run_data = run.get('data', {})
                                        
                                        # Check if run is recent enough
                                        start_time = datetime.fromtimestamp(int(run_info.get('start_time', 0)) / 1000)
                                        if start_time >= cutoff_time:
                                            
                                            # Collect metrics from this run
                                            metrics = run_data.get('metrics', {})
                                            for metric_name, metric_value in metrics.items():
                                                telemetry_point = TelemetryPoint(
                                                    metric_name=f"mlflow_{metric_name}",
                                                    value=float(metric_value),
                                                    timestamp=start_time,
                                                    labels={
                                                        "experiment_id": experiment_id,
                                                        "run_id": run_info.get('run_id', ''),
                                                        "status": run_info.get('status', '')
                                                    },
                                                    source="mlflow"
                                                )
                                                telemetry_points.append(telemetry_point)
                    
            except Exception as e:
                logger.error(f"Error collecting from MLflow: {e}")
        
        logger.info(f"Collected {len(telemetry_points)} telemetry points from MLflow")
        return telemetry_points
    
    def get_adapter_name(self) -> str:
        return "mlflow"

class AutolytiQAdapter(TelemetryAdapter):
    """Adapter for AutolytiQ internal metrics"""
    
    def __init__(self, database_connection):
        self.db = database_connection
        
    async def collect_metrics(self, time_range_minutes: int = 60) -> List[TelemetryPoint]:
        """Collect metrics from AutolytiQ database"""
        telemetry_points = []
        cutoff_time = datetime.utcnow() - timedelta(minutes=time_range_minutes)
        
        try:
            # Collect vehicle pricing accuracy metrics
            pricing_metrics = await self._collect_pricing_metrics(cutoff_time)
            telemetry_points.extend(pricing_metrics)
            
            # Collect lead conversion metrics
            lead_metrics = await self._collect_lead_metrics(cutoff_time)
            telemetry_points.extend(lead_metrics)
            
            # Collect system performance metrics
            system_metrics = await self._collect_system_metrics(cutoff_time)
            telemetry_points.extend(system_metrics)
            
        except Exception as e:
            logger.error(f"Error collecting AutolytiQ metrics: {e}")
        
        logger.info(f"Collected {len(telemetry_points)} telemetry points from AutolytiQ")
        return telemetry_points
    
    async def _collect_pricing_metrics(self, cutoff_time: datetime) -> List[TelemetryPoint]:
        """Collect vehicle pricing model metrics"""
        metrics = []
        
        # Simulated pricing accuracy metrics
        # In real implementation, this would query your actual pricing model performance
        current_time = datetime.utcnow()
        
        metrics.append(TelemetryPoint(
            metric_name="vehicle_pricing_accuracy",
            value=0.94,  # 94% accuracy
            timestamp=current_time,
            labels={"model": "xgboost_v2", "data_source": "competitive_scraping"},
            source="autolytiq"
        ))
        
        metrics.append(TelemetryPoint(
            metric_name="pricing_prediction_latency",
            value=0.15,  # 150ms
            timestamp=current_time,
            labels={"model": "xgboost_v2", "endpoint": "/api/pricing/predict"},
            source="autolytiq"
        ))
        
        return metrics
    
    async def _collect_lead_metrics(self, cutoff_time: datetime) -> List[TelemetryPoint]:
        """Collect lead management metrics"""
        metrics = []
        current_time = datetime.utcnow()
        
        metrics.append(TelemetryPoint(
            metric_name="lead_conversion_rate",
            value=0.23,  # 23% conversion rate
            timestamp=current_time,
            labels={"source": "web", "sales_team": "main"},
            source="autolytiq"
        ))
        
        metrics.append(TelemetryPoint(
            metric_name="lead_response_time",
            value=4.2,  # 4.2 minutes average response time
            timestamp=current_time,
            labels={"priority": "high", "source": "web"},
            source="autolytiq"
        ))
        
        return metrics
    
    async def _collect_system_metrics(self, cutoff_time: datetime) -> List[TelemetryPoint]:
        """Collect system performance metrics"""
        metrics = []
        current_time = datetime.utcnow()
        
        metrics.append(TelemetryPoint(
            metric_name="database_query_time",
            value=0.85,  # 850ms average query time
            timestamp=current_time,
            labels={"query_type": "inventory_search", "database": "postgresql"},
            source="autolytiq"
        ))
        
        metrics.append(TelemetryPoint(
            metric_name="active_user_sessions",
            value=42,  # 42 active sessions
            timestamp=current_time,
            labels={"user_type": "sales_staff"},
            source="autolytiq"
        ))
        
        return metrics
    
    def get_adapter_name(self) -> str:
        return "autolytiq"

class TelemetryOrchestrator:
    """Orchestrates multiple telemetry adapters"""
    
    def __init__(self):
        self.adapters: List[TelemetryAdapter] = []
        self.collection_history = []
        
    def add_adapter(self, adapter: TelemetryAdapter):
        """Add a telemetry adapter"""
        self.adapters.append(adapter)
        logger.info(f"Added {adapter.get_adapter_name()} adapter")
    
    async def collect_all_metrics(self, time_range_minutes: int = 60) -> pd.DataFrame:
        """Collect metrics from all adapters and return as DataFrame"""
        all_telemetry_points = []
        
        # Collect from all adapters in parallel
        tasks = [
            adapter.collect_metrics(time_range_minutes)
            for adapter in self.adapters
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"Error collecting from {self.adapters[i].get_adapter_name()}: {result}")
            else:
                all_telemetry_points.extend(result)
        
        # Convert to DataFrame for causal analysis
        if all_telemetry_points:
            df_data = []
            
            # Group by timestamp and create wide-format DataFrame
            timestamp_groups = {}
            for point in all_telemetry_points:
                timestamp_key = point.timestamp.replace(second=0, microsecond=0)  # Round to minute
                if timestamp_key not in timestamp_groups:
                    timestamp_groups[timestamp_key] = {}
                timestamp_groups[timestamp_key][point.metric_name] = point.value
            
            # Create DataFrame rows
            for timestamp, metrics in timestamp_groups.items():
                row = {"timestamp": timestamp, **metrics}
                df_data.append(row)
            
            df = pd.DataFrame(df_data)
            df = df.set_index('timestamp')
            
            # Fill missing values with forward fill then backward fill
            df = df.fillna(method='ffill').fillna(method='bfill')
            
            logger.info(f"Collected telemetry: {len(df)} timestamps, {len(df.columns)} metrics")
            
            # Store collection history
            self.collection_history.append({
                "timestamp": datetime.utcnow(),
                "data_points": len(all_telemetry_points),
                "metrics_count": len(df.columns) if not df.empty else 0,
                "adapters_used": len(self.adapters)
            })
            
            return df
        else:
            logger.warning("No telemetry data collected")
            return pd.DataFrame()
    
    async def start_continuous_collection(self, interval_seconds: int = 30):
        """Start continuous telemetry collection"""
        logger.info(f"Starting continuous telemetry collection every {interval_seconds} seconds")
        
        while True:
            try:
                await self.collect_all_metrics(time_range_minutes=60)
                await asyncio.sleep(interval_seconds)
            except Exception as e:
                logger.error(f"Error in continuous collection: {e}")
                await asyncio.sleep(interval_seconds)
    
    def get_recent_data(self, window_minutes: int = 60) -> pd.DataFrame:
        """Get recent telemetry data for causal analysis"""
        # This would typically query a database or cache
        # For now, return simulated recent data
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(minutes=window_minutes)
        
        # Generate time series
        timestamps = pd.date_range(start=start_time, end=end_time, freq='1min')
        
        # Simulated metrics with realistic relationships
        np.random.seed(42)  # For reproducible results
        data = {
            'timestamp': timestamps,
            'vehicle_pricing_accuracy': 0.94 + np.random.normal(0, 0.02, len(timestamps)),
            'feature_drift_score': np.random.exponential(0.05, len(timestamps)),
            'model_prediction_latency': 0.15 + np.random.gamma(2, 0.02, len(timestamps)),
            'cpu_usage': 65 + np.random.normal(0, 10, len(timestamps)),
            'memory_usage': 70 + np.random.normal(0, 8, len(timestamps)),
            'lead_conversion_rate': 0.23 + np.random.normal(0, 0.05, len(timestamps)),
            'database_query_time': 0.85 + np.random.gamma(2, 0.1, len(timestamps))
        }
        
        df = pd.DataFrame(data)
        df = df.set_index('timestamp')
        
        # Add causal relationships
        # Feature drift affects pricing accuracy (with lag)
        for i in range(1, len(df)):
            if df.iloc[i-1]['feature_drift_score'] > 0.1:
                df.iloc[i, df.columns.get_loc('vehicle_pricing_accuracy')] *= 0.98
        
        # CPU usage affects query time
        df['database_query_time'] += (df['cpu_usage'] - 65) * 0.01
        
        return df

# Global telemetry orchestrator
telemetry_orchestrator = TelemetryOrchestrator()

# Initialize with AutolytiQ adapter
telemetry_orchestrator.add_adapter(AutolytiQAdapter(None))  # Database connection would be injected

# Add Prometheus adapter if URL is configured
prometheus_url = os.getenv('PROMETHEUS_URL')
if prometheus_url:
    telemetry_orchestrator.add_adapter(PrometheusAdapter(prometheus_url))

# Add MLflow adapter if URL is configured
mlflow_url = os.getenv('MLFLOW_URL')
if mlflow_url:
    telemetry_orchestrator.add_adapter(MLflowAdapter(mlflow_url))