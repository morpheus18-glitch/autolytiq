"""
Flask API for vehicle pricing pipeline
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import sys
from pathlib import Path
import logging

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from pipeline.run_pipeline import VehiclePricingPipeline
from utils.data_storage import DataStorage

app = Flask(__name__)
CORS(app)

# Initialize pipeline
pipeline = VehiclePricingPipeline()
data_storage = DataStorage()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'vehicle-pricing-api',
        'version': '1.0.0'
    })

@app.route('/api/predict', methods=['POST'])
def predict_price():
    """Get price prediction for a vehicle"""
    try:
        vehicle_data = request.get_json()
        
        if not vehicle_data:
            return jsonify({'error': 'No vehicle data provided'}), 400
        
        # Validate required fields
        required_fields = ['make', 'model', 'year']
        missing_fields = [field for field in required_fields if field not in vehicle_data]
        
        if missing_fields:
            return jsonify({
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Get prediction
        prediction = pipeline.get_real_time_prediction(vehicle_data)
        
        return jsonify(prediction)
    
    except Exception as e:
        logger.error(f"Error in predict_price: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/predict/batch', methods=['POST'])
def predict_batch():
    """Get price predictions for multiple vehicles"""
    try:
        data = request.get_json()
        vehicles = data.get('vehicles', [])
        
        if not vehicles:
            return jsonify({'error': 'No vehicles provided'}), 400
        
        # Generate predictions
        predictions = pipeline.price_model.predict_batch(vehicles)
        
        return jsonify({
            'predictions': predictions,
            'count': len(predictions)
        })
    
    except Exception as e:
        logger.error(f"Error in predict_batch: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/market-analysis', methods=['GET'])
def get_market_analysis():
    """Get market analysis with optional filters"""
    try:
        # Get filters from query parameters
        filters = {}
        
        if request.args.get('make'):
            filters['make'] = request.args.get('make')
        if request.args.get('year_min'):
            filters['year_min'] = int(request.args.get('year_min'))
        if request.args.get('year_max'):
            filters['year_max'] = int(request.args.get('year_max'))
        if request.args.get('price_min'):
            filters['price_min'] = float(request.args.get('price_min'))
        if request.args.get('price_max'):
            filters['price_max'] = float(request.args.get('price_max'))
        
        # Get analysis
        analysis = pipeline.get_market_analysis(filters)
        
        return jsonify(analysis)
    
    except Exception as e:
        logger.error(f"Error in get_market_analysis: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/pipeline/status', methods=['GET'])
def get_pipeline_status():
    """Get current pipeline status"""
    try:
        status = pipeline.get_pipeline_status()
        return jsonify(status)
    
    except Exception as e:
        logger.error(f"Error in get_pipeline_status: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/pipeline/run', methods=['POST'])
def run_pipeline():
    """Run pipeline cycle"""
    try:
        data = request.get_json() or {}
        cycle_type = data.get('type', 'full')
        
        if cycle_type == 'scraping':
            result = pipeline.run_scraping_cycle()
        elif cycle_type == 'training':
            result = pipeline.run_training_cycle()
        elif cycle_type == 'prediction':
            result = pipeline.run_prediction_cycle()
        elif cycle_type == 'full':
            result = pipeline.run_full_pipeline()
        else:
            return jsonify({'error': 'Invalid cycle type'}), 400
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Error in run_pipeline: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/data/listings', methods=['GET'])
def get_listings():
    """Get vehicle listings with optional filters"""
    try:
        # Get pagination parameters
        page = int(request.args.get('page', 1))
        per_page = min(int(request.args.get('per_page', 20)), 100)
        
        # Get filters
        filters = {}
        if request.args.get('make'):
            filters['make'] = request.args.get('make')
        if request.args.get('model'):
            filters['model'] = request.args.get('model')
        if request.args.get('year_min'):
            filters['year_min'] = int(request.args.get('year_min'))
        if request.args.get('year_max'):
            filters['year_max'] = int(request.args.get('year_max'))
        
        # Get listings from database
        listings = data_storage.get_listings_paginated(page, per_page, filters)
        
        return jsonify(listings)
    
    except Exception as e:
        logger.error(f"Error in get_listings: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/data/stats', methods=['GET'])
def get_data_stats():
    """Get database statistics"""
    try:
        stats = data_storage.get_database_stats()
        return jsonify(stats)
    
    except Exception as e:
        logger.error(f"Error in get_data_stats: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/model/metrics', methods=['GET'])
def get_model_metrics():
    """Get model performance metrics"""
    try:
        # Get recent metrics
        recent_metrics = data_storage.get_recent_metrics()
        
        # Get training history
        training_history = data_storage.get_retraining_history(limit=10)
        
        return jsonify({
            'recent_metrics': recent_metrics,
            'training_history': training_history
        })
    
    except Exception as e:
        logger.error(f"Error in get_model_metrics: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/model/feature-importance', methods=['GET'])
def get_feature_importance():
    """Get model feature importance"""
    try:
        # Load model if not already loaded
        if not pipeline.price_model.model:
            pipeline.price_model.load_model()
        
        # Get feature importance
        importance_df = pipeline.price_model.get_feature_importance()
        
        return jsonify({
            'features': importance_df.to_dict('records') if not importance_df.empty else []
        })
    
    except Exception as e:
        logger.error(f"Error in get_feature_importance: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/scrapers/status', methods=['GET'])
def get_scrapers_status():
    """Get status of all scrapers"""
    try:
        status = {}
        
        for scraper_name in ['cargurus', 'autotrader']:
            last_success = data_storage.get_last_scraper_success(scraper_name)
            last_error = data_storage.get_last_scraper_error(scraper_name)
            
            status[scraper_name] = {
                'last_success': last_success.isoformat() if last_success else None,
                'last_error': last_error.isoformat() if last_error else None,
                'status': 'healthy' if last_success and (not last_error or last_success > last_error) else 'error'
            }
        
        return jsonify(status)
    
    except Exception as e:
        logger.error(f"Error in get_scrapers_status: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/scrapers/run', methods=['POST'])
def run_scraper():
    """Run a specific scraper"""
    try:
        data = request.get_json() or {}
        scraper_name = data.get('scraper')
        
        if not scraper_name:
            return jsonify({'error': 'Scraper name required'}), 400
        
        if scraper_name not in ['cargurus', 'autotrader']:
            return jsonify({'error': 'Invalid scraper name'}), 400
        
        # Get search parameters
        search_params = data.get('search_params', {})
        
        # Run specific scraper
        scraper = pipeline.scrapers.get(scraper_name)
        if not scraper:
            return jsonify({'error': f'Scraper {scraper_name} not found'}), 404
        
        # Default search params
        default_params = {
            'zip_code': '90210',
            'radius': 50,
            'year_min': 2015,
            'year_max': 2024,
            'max_pages': 5
        }
        default_params.update(search_params)
        
        # Run scraper
        listings = scraper.scrape_listings(default_params)
        
        # Store results
        stored_count = data_storage.store_raw_listings(listings, scraper_name)
        
        return jsonify({
            'scraper': scraper_name,
            'listings_scraped': len(listings),
            'listings_stored': stored_count,
            'status': 'success'
        })
    
    except Exception as e:
        logger.error(f"Error in run_scraper: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/data/cleanup', methods=['POST'])
def cleanup_data():
    """Clean up old data"""
    try:
        data = request.get_json() or {}
        days = data.get('days', 90)
        
        result = data_storage.cleanup_old_data(days)
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Error in cleanup_data: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/retrain', methods=['POST'])
def retrain_model():
    """Trigger model retraining"""
    try:
        data = request.get_json() or {}
        force = data.get('force', False)
        
        # Import retrainer
        from pipeline.retrain import ModelRetrainer
        
        retrainer = ModelRetrainer()
        result = retrainer.retrain_model(force=force)
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Error in retrain_model: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/retrain/check', methods=['GET'])
def check_retrain_needed():
    """Check if model retraining is needed"""
    try:
        from pipeline.retrain import ModelRetrainer
        
        retrainer = ModelRetrainer()
        result = retrainer.should_retrain()
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Error in check_retrain_needed: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)