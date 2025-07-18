"""
Periodic retraining module for the vehicle pricing model
"""

import os
import sys
import logging
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from models import VehiclePriceModel
from utils.data_storage import DataStorage

class ModelRetrainer:
    """Handles periodic retraining of the vehicle pricing model"""
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or self._load_default_config()
        self.data_storage = DataStorage(self.config['database_path'])
        self.price_model = VehiclePriceModel(self.config['model_path'])
        self.logger = logging.getLogger(__name__)
        
    def _load_default_config(self) -> Dict[str, Any]:
        """Load default retraining configuration"""
        return {
            'database_path': 'data/vehicle_listings.db',
            'model_path': 'models/vehicle_price_model.pkl',
            'backup_path': 'models/backups/',
            'min_training_samples': 1000,
            'performance_threshold': 0.1,  # 10% degradation threshold
            'retraining_interval_days': 7,
            'data_freshness_days': 30,
            'cross_validation_folds': 5,
            'hyperparameter_tuning': True,
            'model_comparison_metrics': ['mae', 'rmse', 'r2'],
            'backup_old_models': True
        }
    
    def should_retrain(self) -> Dict[str, Any]:
        """Determine if model should be retrained"""
        reasons = []
        
        # Check if model exists
        if not os.path.exists(self.config['model_path']):
            reasons.append("Model file does not exist")
            return {'should_retrain': True, 'reasons': reasons}
        
        # Check model age
        model_age = self._get_model_age()
        if model_age > self.config['retraining_interval_days']:
            reasons.append(f"Model is {model_age} days old (threshold: {self.config['retraining_interval_days']})")
        
        # Check data freshness
        data_freshness = self._check_data_freshness()
        if not data_freshness['is_fresh']:
            reasons.append(f"Training data is stale: {data_freshness['message']}")
        
        # Check performance degradation
        performance_check = self._check_performance_degradation()
        if performance_check['degraded']:
            reasons.append(f"Performance degraded: {performance_check['message']}")
        
        # Check data volume
        data_volume = self._check_data_volume()
        if data_volume['volume'] < self.config['min_training_samples']:
            reasons.append(f"Insufficient training data: {data_volume['volume']} samples")
            return {'should_retrain': False, 'reasons': reasons}
        
        should_retrain = len(reasons) > 0
        
        return {
            'should_retrain': should_retrain,
            'reasons': reasons,
            'model_age_days': model_age,
            'data_volume': data_volume['volume'],
            'performance_metrics': performance_check.get('metrics', {})
        }
    
    def retrain_model(self, force: bool = False) -> Dict[str, Any]:
        """Retrain the model with latest data"""
        self.logger.info("Starting model retraining process")
        
        # Check if retraining is needed
        if not force:
            retrain_check = self.should_retrain()
            if not retrain_check['should_retrain']:
                return {
                    'success': False,
                    'message': 'Retraining not needed',
                    'reasons': retrain_check['reasons']
                }
        
        try:
            # Backup existing model
            backup_path = None
            if self.config['backup_old_models'] and os.path.exists(self.config['model_path']):
                backup_path = self._backup_current_model()
            
            # Load training data
            training_data = self._load_training_data()
            
            if len(training_data) < self.config['min_training_samples']:
                return {
                    'success': False,
                    'message': f'Insufficient training data: {len(training_data)} samples',
                    'min_required': self.config['min_training_samples']
                }
            
            # Prepare data
            X, y = self.price_model.prepare_data(training_data)
            
            # Cross-validate current model performance (if exists)
            baseline_metrics = self._get_baseline_metrics()
            
            # Train new model
            new_model = VehiclePriceModel(self.config['model_path'])
            training_metrics = new_model.train(
                X, y, 
                optimize_params=self.config['hyperparameter_tuning']
            )
            
            # Compare with baseline
            comparison_result = self._compare_models(training_metrics, baseline_metrics)
            
            # Decide whether to keep new model
            if comparison_result['keep_new_model']:
                # Save new model
                new_model.save_model()
                
                # Store metrics
                self.data_storage.store_training_metrics(training_metrics)
                
                # Log success
                self.logger.info(f"Model retrained successfully: {training_metrics}")
                
                result = {
                    'success': True,
                    'message': 'Model retrained successfully',
                    'metrics': training_metrics,
                    'comparison': comparison_result,
                    'backup_path': backup_path,
                    'training_samples': len(training_data)
                }
                
            else:
                # Restore backup if comparison failed
                if backup_path:
                    self._restore_backup(backup_path)
                
                result = {
                    'success': False,
                    'message': 'New model performance worse than baseline',
                    'metrics': training_metrics,
                    'comparison': comparison_result,
                    'backup_restored': backup_path is not None
                }
            
            return result
            
        except Exception as e:
            self.logger.error(f"Error during model retraining: {str(e)}")
            return {
                'success': False,
                'message': f'Retraining failed: {str(e)}',
                'error': str(e)
            }
    
    def _get_model_age(self) -> int:
        """Get age of current model in days"""
        try:
            model_path = self.config['model_path']
            if os.path.exists(model_path):
                modification_time = os.path.getmtime(model_path)
                modification_date = datetime.fromtimestamp(modification_time)
                age = (datetime.now() - modification_date).days
                return age
            return float('inf')
        except Exception:
            return float('inf')
    
    def _check_data_freshness(self) -> Dict[str, Any]:
        """Check if training data is fresh enough"""
        try:
            latest_data_time = self.data_storage.get_latest_data_time()
            
            if not latest_data_time:
                return {'is_fresh': False, 'message': 'No training data available'}
            
            data_age = (datetime.now() - latest_data_time).days
            is_fresh = data_age <= self.config['data_freshness_days']
            
            return {
                'is_fresh': is_fresh,
                'data_age_days': data_age,
                'message': f'Latest data is {data_age} days old'
            }
            
        except Exception as e:
            return {'is_fresh': False, 'message': f'Error checking data freshness: {str(e)}'}
    
    def _check_performance_degradation(self) -> Dict[str, Any]:
        """Check if model performance has degraded"""
        try:
            # Get recent prediction accuracy
            recent_metrics = self.data_storage.get_recent_prediction_metrics()
            baseline_metrics = self.data_storage.get_baseline_metrics()
            
            if not recent_metrics or not baseline_metrics:
                return {'degraded': False, 'message': 'Insufficient metrics for comparison'}
            
            # Calculate performance degradation
            degradation_pct = {}
            for metric in self.config['model_comparison_metrics']:
                if metric in recent_metrics and metric in baseline_metrics:
                    if metric == 'r2':  # Higher is better for R2
                        degradation = (baseline_metrics[metric] - recent_metrics[metric]) / baseline_metrics[metric]
                    else:  # Lower is better for MAE, RMSE
                        degradation = (recent_metrics[metric] - baseline_metrics[metric]) / baseline_metrics[metric]
                    
                    degradation_pct[metric] = degradation
            
            # Check if any metric has degraded beyond threshold
            max_degradation = max(degradation_pct.values()) if degradation_pct else 0
            is_degraded = max_degradation > self.config['performance_threshold']
            
            return {
                'degraded': is_degraded,
                'max_degradation': max_degradation,
                'degradation_by_metric': degradation_pct,
                'metrics': recent_metrics,
                'message': f'Max degradation: {max_degradation:.2%}'
            }
            
        except Exception as e:
            return {'degraded': False, 'message': f'Error checking performance: {str(e)}'}
    
    def _check_data_volume(self) -> Dict[str, Any]:
        """Check available training data volume"""
        try:
            volume = self.data_storage.get_training_data_volume()
            
            return {
                'volume': volume,
                'sufficient': volume >= self.config['min_training_samples'],
                'message': f'{volume} training samples available'
            }
            
        except Exception as e:
            return {'volume': 0, 'sufficient': False, 'message': f'Error checking data volume: {str(e)}'}
    
    def _load_training_data(self) -> pd.DataFrame:
        """Load training data for retraining"""
        return self.price_model.load_training_data(self.config['database_path'])
    
    def _get_baseline_metrics(self) -> Optional[Dict[str, float]]:
        """Get baseline model metrics"""
        try:
            if os.path.exists(self.config['model_path']):
                # Load existing model to get its metrics
                existing_model = VehiclePriceModel(self.config['model_path'])
                existing_model.load_model()
                return existing_model.model_metrics
            return None
        except Exception:
            return None
    
    def _compare_models(self, new_metrics: Dict[str, float], baseline_metrics: Optional[Dict[str, float]]) -> Dict[str, Any]:
        """Compare new model with baseline"""
        if not baseline_metrics:
            return {
                'keep_new_model': True,
                'reason': 'No baseline model to compare',
                'improvement': {}
            }
        
        improvements = {}
        for metric in self.config['model_comparison_metrics']:
            if metric in new_metrics and metric in baseline_metrics:
                if metric == 'r2':  # Higher is better
                    improvement = (new_metrics[metric] - baseline_metrics[metric]) / baseline_metrics[metric]
                else:  # Lower is better
                    improvement = (baseline_metrics[metric] - new_metrics[metric]) / baseline_metrics[metric]
                
                improvements[metric] = improvement
        
        # Decision logic: keep new model if it improves on primary metric (MAE)
        primary_metric = 'mae'
        if primary_metric in improvements:
            keep_new = improvements[primary_metric] > -0.05  # Allow 5% degradation
            reason = f"MAE {'improved' if improvements[primary_metric] > 0 else 'degraded'} by {improvements[primary_metric]:.2%}"
        else:
            keep_new = True
            reason = "Primary metric not available for comparison"
        
        return {
            'keep_new_model': keep_new,
            'reason': reason,
            'improvement': improvements,
            'new_metrics': new_metrics,
            'baseline_metrics': baseline_metrics
        }
    
    def _backup_current_model(self) -> str:
        """Backup current model"""
        try:
            backup_dir = Path(self.config['backup_path'])
            backup_dir.mkdir(parents=True, exist_ok=True)
            
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_filename = f"vehicle_price_model_backup_{timestamp}.pkl"
            backup_path = backup_dir / backup_filename
            
            # Copy current model to backup
            import shutil
            shutil.copy2(self.config['model_path'], backup_path)
            
            self.logger.info(f"Model backed up to {backup_path}")
            return str(backup_path)
            
        except Exception as e:
            self.logger.error(f"Error backing up model: {str(e)}")
            return None
    
    def _restore_backup(self, backup_path: str):
        """Restore model from backup"""
        try:
            import shutil
            shutil.copy2(backup_path, self.config['model_path'])
            self.logger.info(f"Model restored from backup: {backup_path}")
        except Exception as e:
            self.logger.error(f"Error restoring backup: {str(e)}")
    
    def get_retraining_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get history of retraining events"""
        return self.data_storage.get_retraining_history(limit)
    
    def schedule_retraining(self, cron_schedule: str = "0 2 * * 0"):  # Weekly on Sunday at 2 AM
        """Schedule automatic retraining"""
        try:
            import schedule
            import time
            
            def retrain_job():
                result = self.retrain_model()
                self.logger.info(f"Scheduled retraining result: {result}")
            
            # Parse cron-like schedule (simplified)
            if cron_schedule == "0 2 * * 0":  # Weekly
                schedule.every().sunday.at("02:00").do(retrain_job)
            elif cron_schedule == "0 2 * * *":  # Daily
                schedule.every().day.at("02:00").do(retrain_job)
            
            self.logger.info(f"Retraining scheduled: {cron_schedule}")
            
            while True:
                schedule.run_pending()
                time.sleep(3600)  # Check every hour
                
        except ImportError:
            self.logger.error("Schedule library not available for automatic retraining")
        except Exception as e:
            self.logger.error(f"Error scheduling retraining: {str(e)}")

def main():
    """Main function for retraining operations"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Vehicle Price Model Retrainer')
    parser.add_argument('--action', choices=['check', 'retrain', 'schedule'], 
                       default='check', help='Action to perform')
    parser.add_argument('--force', action='store_true', 
                       help='Force retraining even if not needed')
    parser.add_argument('--config', type=str, help='Path to config file')
    
    args = parser.parse_args()
    
    # Initialize retrainer
    retrainer = ModelRetrainer()
    
    if args.action == 'check':
        result = retrainer.should_retrain()
        print(f"Retraining check result: {result}")
        
    elif args.action == 'retrain':
        result = retrainer.retrain_model(force=args.force)
        print(f"Retraining result: {result}")
        
    elif args.action == 'schedule':
        print("Starting scheduled retraining...")
        retrainer.schedule_retraining()

if __name__ == "__main__":
    main()