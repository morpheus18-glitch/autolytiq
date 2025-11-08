"""
Main pipeline for autonomous vehicle data scraping and price modeling
"""

import os
import sys
import time
import logging
import sqlite3
import pandas as pd
import schedule
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from scraper import CarGurusScraper, AutoTraderScraper
from models import VehiclePriceModel, VehicleFeatureEngineer
from utils.data_storage import DataStorage
from utils.deduplication import VehicleDeduplicator

class VehiclePricingPipeline:
    """Autonomous vehicle pricing pipeline"""
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or self._load_default_config()
        self.setup_logging()
        
        self.data_storage = DataStorage(self.config['database_path'])
        self.deduplicator = VehicleDeduplicator()
        self.price_model = VehiclePriceModel(self.config['model_path'])
        
        # Initialize scrapers
        self.scrapers = {
            'cargurus': CarGurusScraper(headless=True),
            'autotrader': AutoTraderScraper(headless=True)
        }
        
        self.logger = logging.getLogger(__name__)
    
    def _load_default_config(self) -> Dict[str, Any]:
        """Load default configuration"""
        return {
            'database_path': 'data/vehicle_listings.db',
            'model_path': 'models/vehicle_price_model.pkl',
            'scraping_interval_hours': 6,
            'retraining_interval_days': 7,
            'max_pages_per_scraper': 10,
            'search_params': {
                'zip_code': '90210',
                'radius': 50,
                'year_min': 2015,
                'year_max': 2024,
                'price_min': 5000,
                'price_max': 100000,
                'mileage_max': 150000
            },
            'model_update_threshold': 0.1,  # Retrain if MAE increases by 10%
            'log_level': 'INFO'
        }
    
    def setup_logging(self):
        """Setup logging configuration"""
        log_level = getattr(logging, self.config['log_level'])
        
        logging.basicConfig(
            level=log_level,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('pipeline.log'),
                logging.StreamHandler()
            ]
        )
    
    def run_scraping_cycle(self) -> Dict[str, Any]:
        """Run a complete scraping cycle"""
        self.logger.info("Starting scraping cycle")
        
        all_listings = []
        scraping_stats = {}
        
        for scraper_name, scraper in self.scrapers.items():
            try:
                self.logger.info(f"Running {scraper_name} scraper")
                
                # Scrape listings
                search_params = self.config['search_params'].copy()
                search_params['max_pages'] = self.config['max_pages_per_scraper']
                
                listings = scraper.scrape_listings(search_params)
                
                # Store raw listings
                stored_count = self.data_storage.store_raw_listings(listings, scraper_name)
                
                all_listings.extend(listings)
                scraping_stats[scraper_name] = {
                    'scraped': len(listings),
                    'stored': stored_count
                }
                
                self.logger.info(f"{scraper_name}: {len(listings)} scraped, {stored_count} stored")
                
            except Exception as e:
                self.logger.error(f"Error in {scraper_name} scraper: {str(e)}")
                scraping_stats[scraper_name] = {'error': str(e)}
            
            finally:
                scraper.close()
        
        # Deduplicate and clean data
        if all_listings:
            self.logger.info("Deduplicating and cleaning data")
            clean_listings = self.deduplicator.deduplicate_listings(all_listings)
            
            # Store cleaned listings
            cleaned_count = self.data_storage.store_cleaned_listings(clean_listings)
            
            scraping_stats['total'] = {
                'raw_listings': len(all_listings),
                'clean_listings': len(clean_listings),
                'stored_clean': cleaned_count
            }
        
        self.logger.info(f"Scraping cycle complete: {scraping_stats}")
        return scraping_stats
    
    def run_training_cycle(self) -> Dict[str, Any]:
        """Run model training cycle"""
        self.logger.info("Starting model training cycle")
        
        try:
            # Load training data
            training_data = self.price_model.load_training_data(self.config['database_path'])
            
            if len(training_data) < 100:
                self.logger.warning("Insufficient training data, skipping training")
                return {'error': 'insufficient_data', 'sample_count': len(training_data)}
            
            # Prepare data
            X, y = self.price_model.prepare_data(training_data)
            
            # Train model
            metrics = self.price_model.train(X, y, optimize_params=True)
            
            # Save model
            self.price_model.save_model()
            
            # Store training metrics
            self.data_storage.store_training_metrics(metrics)
            
            self.logger.info(f"Training complete: {metrics}")
            return {'success': True, 'metrics': metrics}
            
        except Exception as e:
            self.logger.error(f"Error in training cycle: {str(e)}")
            return {'error': str(e)}
    
    def run_prediction_cycle(self) -> Dict[str, Any]:
        """Generate price predictions for recent listings"""
        self.logger.info("Starting prediction cycle")
        
        try:
            # Load model if not already loaded
            if not self.price_model.model:
                self.price_model.load_model()
            
            # Get recent listings without predictions
            recent_listings = self.data_storage.get_unpredicted_listings()
            
            if not recent_listings:
                self.logger.info("No new listings to predict")
                return {'predicted_count': 0}
            
            # Generate predictions
            predictions = []
            for listing in recent_listings:
                try:
                    prediction = self.price_model.predict(listing)
                    prediction['listing_id'] = listing['id']
                    predictions.append(prediction)
                    
                except Exception as e:
                    self.logger.error(f"Error predicting for listing {listing.get('id')}: {str(e)}")
            
            # Store predictions
            stored_count = self.data_storage.store_predictions(predictions)
            
            self.logger.info(f"Prediction cycle complete: {len(predictions)} predictions, {stored_count} stored")
            return {'predicted_count': len(predictions), 'stored_count': stored_count}
            
        except Exception as e:
            self.logger.error(f"Error in prediction cycle: {str(e)}")
            return {'error': str(e)}
    
    def run_full_pipeline(self) -> Dict[str, Any]:
        """Run complete pipeline: scraping, training, and prediction"""
        self.logger.info("Starting full pipeline")
        
        results = {}
        
        # Scraping cycle
        results['scraping'] = self.run_scraping_cycle()
        
        # Check if we need to retrain
        if self._should_retrain():
            results['training'] = self.run_training_cycle()
        
        # Prediction cycle
        results['prediction'] = self.run_prediction_cycle()
        
        self.logger.info("Full pipeline complete")
        return results
    
    def _should_retrain(self) -> bool:
        """Determine if model should be retrained"""
        # Check if model exists
        if not os.path.exists(self.config['model_path']):
            return True
        
        # Check last training time
        last_training = self.data_storage.get_last_training_time()
        if not last_training:
            return True
        
        # Check if enough time has passed
        time_threshold = datetime.now() - timedelta(days=self.config['retraining_interval_days'])
        if last_training < time_threshold:
            return True
        
        # Check model performance degradation
        recent_metrics = self.data_storage.get_recent_metrics()
        if recent_metrics and self._is_model_degraded(recent_metrics):
            return True
        
        return False
    
    def _is_model_degraded(self, recent_metrics: Dict[str, float]) -> bool:
        """Check if model performance has degraded"""
        baseline_metrics = self.data_storage.get_baseline_metrics()
        
        if not baseline_metrics:
            return False
        
        # Check if MAE has increased significantly
        mae_increase = (recent_metrics['mae'] - baseline_metrics['mae']) / baseline_metrics['mae']
        
        return mae_increase > self.config['model_update_threshold']
    
    def start_scheduled_pipeline(self):
        """Start the scheduled pipeline execution"""
        self.logger.info("Starting scheduled pipeline")
        
        # Schedule scraping every N hours
        schedule.every(self.config['scraping_interval_hours']).hours.do(self.run_scraping_cycle)
        
        # Schedule training check daily
        schedule.every().day.at("02:00").do(self._check_and_train)
        
        # Schedule predictions every hour
        schedule.every().hour.do(self.run_prediction_cycle)
        
        # Initial run
        self.run_full_pipeline()
        
        # Keep running
        while True:
            schedule.run_pending()
            time.sleep(300)  # Check every 5 minutes
    
    def _check_and_train(self):
        """Check if training is needed and run if so"""
        if self._should_retrain():
            self.run_training_cycle()
    
    def get_real_time_prediction(self, vehicle_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get real-time price prediction for a vehicle"""
        try:
            # Load model if not already loaded
            if not self.price_model.model:
                self.price_model.load_model()
            
            # Generate prediction
            prediction = self.price_model.predict(vehicle_data)
            
            # Store prediction for tracking
            self.data_storage.store_single_prediction(vehicle_data, prediction)
            
            return prediction
            
        except Exception as e:
            self.logger.error(f"Error generating real-time prediction: {str(e)}")
            return {'error': str(e)}
    
    def get_market_analysis(self, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get market analysis based on recent data"""
        try:
            analysis = self.data_storage.get_market_analysis(filters)
            return analysis
            
        except Exception as e:
            self.logger.error(f"Error generating market analysis: {str(e)}")
            return {'error': str(e)}
    
    def get_pipeline_status(self) -> Dict[str, Any]:
        """Get current pipeline status"""
        try:
            status = {
                'last_scraping': self.data_storage.get_last_scraping_time(),
                'last_training': self.data_storage.get_last_training_time(),
                'last_prediction': self.data_storage.get_last_prediction_time(),
                'total_listings': self.data_storage.get_total_listings_count(),
                'model_metrics': self.data_storage.get_recent_metrics(),
                'scraper_status': self._get_scraper_status()
            }
            
            return status
            
        except Exception as e:
            self.logger.error(f"Error getting pipeline status: {str(e)}")
            return {'error': str(e)}
    
    def _get_scraper_status(self) -> Dict[str, Any]:
        """Get status of each scraper"""
        status = {}
        
        for scraper_name in self.scrapers.keys():
            last_success = self.data_storage.get_last_scraper_success(scraper_name)
            last_error = self.data_storage.get_last_scraper_error(scraper_name)
            
            status[scraper_name] = {
                'last_success': last_success,
                'last_error': last_error,
                'status': 'healthy' if last_success and (not last_error or last_success > last_error) else 'error'
            }
        
        return status

def main():
    """Main function to run the pipeline"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Vehicle Pricing Pipeline')
    parser.add_argument('--mode', choices=['scraping', 'training', 'prediction', 'full', 'scheduled'], 
                       default='full', help='Pipeline mode to run')
    parser.add_argument('--config', type=str, help='Path to config file')
    
    args = parser.parse_args()
    
    # Initialize pipeline
    pipeline = VehiclePricingPipeline()
    
    # Run based on mode
    if args.mode == 'scraping':
        result = pipeline.run_scraping_cycle()
    elif args.mode == 'training':
        result = pipeline.run_training_cycle()
    elif args.mode == 'prediction':
        result = pipeline.run_prediction_cycle()
    elif args.mode == 'full':
        result = pipeline.run_full_pipeline()
    elif args.mode == 'scheduled':
        pipeline.start_scheduled_pipeline()
        return
    
    print(f"Pipeline result: {result}")

if __name__ == "__main__":
    main()