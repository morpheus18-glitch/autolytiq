"""
Main entry point for the vehicle pricing intelligence system
"""

import os
import sys
import argparse
import logging
from pathlib import Path

# Add current directory to path
sys.path.append(str(Path(__file__).parent))

from pipeline.run_pipeline import VehiclePricingPipeline
from pipeline.retrain import ModelRetrainer

def setup_logging(log_level='INFO'):
    """Setup logging configuration"""
    logging.basicConfig(
        level=getattr(logging, log_level),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('vehicle_pricing.log'),
            logging.StreamHandler()
        ]
    )

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='Vehicle Pricing Intelligence System')
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Pipeline commands
    pipeline_parser = subparsers.add_parser('pipeline', help='Pipeline operations')
    pipeline_parser.add_argument('--mode', choices=['scraping', 'training', 'prediction', 'full', 'scheduled'], 
                                default='full', help='Pipeline mode to run')
    pipeline_parser.add_argument('--config', type=str, help='Path to config file')
    
    # Retraining commands
    retrain_parser = subparsers.add_parser('retrain', help='Model retraining operations')
    retrain_parser.add_argument('--action', choices=['check', 'retrain', 'schedule'], 
                               default='check', help='Retraining action')
    retrain_parser.add_argument('--force', action='store_true', help='Force retraining')
    
    # Dashboard commands
    dashboard_parser = subparsers.add_parser('dashboard', help='Start dashboard')
    dashboard_parser.add_argument('--port', type=int, default=8501, help='Dashboard port')
    
    # API commands
    api_parser = subparsers.add_parser('api', help='Start API server')
    api_parser.add_argument('--port', type=int, default=5001, help='API port')
    api_parser.add_argument('--host', type=str, default='0.0.0.0', help='API host')
    
    # Scraper commands
    scraper_parser = subparsers.add_parser('scraper', help='Run individual scraper')
    scraper_parser.add_argument('--name', choices=['cargurus', 'autotrader'], 
                               required=True, help='Scraper name')
    scraper_parser.add_argument('--zip', type=str, default='90210', help='ZIP code')
    scraper_parser.add_argument('--radius', type=int, default=50, help='Search radius')
    scraper_parser.add_argument('--pages', type=int, default=5, help='Max pages to scrape')
    
    # Prediction commands
    predict_parser = subparsers.add_parser('predict', help='Get price prediction')
    predict_parser.add_argument('--make', type=str, required=True, help='Vehicle make')
    predict_parser.add_argument('--model', type=str, required=True, help='Vehicle model')
    predict_parser.add_argument('--year', type=int, required=True, help='Vehicle year')
    predict_parser.add_argument('--mileage', type=int, default=50000, help='Vehicle mileage')
    predict_parser.add_argument('--body-type', type=str, default='Sedan', help='Body type')
    
    # Global arguments
    parser.add_argument('--log-level', choices=['DEBUG', 'INFO', 'WARNING', 'ERROR'], 
                       default='INFO', help='Logging level')
    parser.add_argument('--verbose', action='store_true', help='Verbose output')
    
    args = parser.parse_args()
    
    # Setup logging
    setup_logging(args.log_level)
    logger = logging.getLogger(__name__)
    
    try:
        if args.command == 'pipeline':
            logger.info(f"Starting pipeline in {args.mode} mode")
            pipeline = VehiclePricingPipeline()
            
            if args.mode == 'scraping':
                result = pipeline.run_scraping_cycle()
            elif args.mode == 'training':
                result = pipeline.run_training_cycle()
            elif args.mode == 'prediction':
                result = pipeline.run_prediction_cycle()
            elif args.mode == 'full':
                result = pipeline.run_full_pipeline()
            elif args.mode == 'scheduled':
                logger.info("Starting scheduled pipeline")
                pipeline.start_scheduled_pipeline()
                return
            
            logger.info(f"Pipeline result: {result}")
            
        elif args.command == 'retrain':
            logger.info(f"Starting retraining action: {args.action}")
            retrainer = ModelRetrainer()
            
            if args.action == 'check':
                result = retrainer.should_retrain()
                logger.info(f"Retraining check: {result}")
                
            elif args.action == 'retrain':
                result = retrainer.retrain_model(force=args.force)
                logger.info(f"Retraining result: {result}")
                
            elif args.action == 'schedule':
                logger.info("Starting scheduled retraining")
                retrainer.schedule_retraining()
                
        elif args.command == 'dashboard':
            logger.info(f"Starting dashboard on port {args.port}")
            os.system(f"streamlit run ui/dashboard.py --server.port {args.port}")
            
        elif args.command == 'api':
            logger.info(f"Starting API server on {args.host}:{args.port}")
            from ui.flask_api import app
            app.run(host=args.host, port=args.port, debug=args.verbose)
            
        elif args.command == 'scraper':
            logger.info(f"Running {args.name} scraper")
            pipeline = VehiclePricingPipeline()
            scraper = pipeline.scrapers.get(args.name)
            
            if not scraper:
                logger.error(f"Scraper {args.name} not found")
                return
            
            search_params = {
                'zip_code': args.zip,
                'radius': args.radius,
                'max_pages': args.pages
            }
            
            listings = scraper.scrape_listings(search_params)
            logger.info(f"Scraped {len(listings)} listings")
            
            # Store results
            stored_count = pipeline.data_storage.store_raw_listings(listings, args.name)
            logger.info(f"Stored {stored_count} listings")
            
        elif args.command == 'predict':
            logger.info("Getting price prediction")
            pipeline = VehiclePricingPipeline()
            
            vehicle_data = {
                'make': args.make,
                'model': args.model,
                'year': args.year,
                'mileage': args.mileage,
                'body_type': args.body_type
            }
            
            prediction = pipeline.get_real_time_prediction(vehicle_data)
            
            if 'error' in prediction:
                logger.error(f"Prediction error: {prediction['error']}")
            else:
                predicted_price = prediction.get('predicted_price', 0)
                confidence = prediction.get('confidence_interval', {})
                
                print(f"\n🚗 Vehicle: {args.year} {args.make} {args.model}")
                print(f"💰 Predicted Price: ${predicted_price:,.0f}")
                print(f"📊 Confidence Range: ${confidence.get('lower_bound', 0):,.0f} - ${confidence.get('upper_bound', 0):,.0f}")
                
                insights = prediction.get('market_insights', {})
                recommendations = insights.get('recommendations', [])
                if recommendations:
                    print("\n💡 Recommendations:")
                    for rec in recommendations:
                        print(f"  • {rec}")
        
        else:
            parser.print_help()
            
    except KeyboardInterrupt:
        logger.info("Operation interrupted by user")
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        if args.verbose:
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    main()