"""
Data storage and management utilities
"""

import sqlite3
import pandas as pd
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from pathlib import Path

class DataStorage:
    """Manages data storage for the vehicle pricing pipeline"""
    
    def __init__(self, db_path: str = 'data/vehicle_listings.db'):
        self.db_path = db_path
        self.logger = logging.getLogger(__name__)
        self._ensure_database_exists()
        self._create_tables()
    
    def _ensure_database_exists(self):
        """Ensure database directory exists"""
        db_dir = Path(self.db_path).parent
        db_dir.mkdir(parents=True, exist_ok=True)
    
    def _create_tables(self):
        """Create necessary database tables"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Raw listings table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS raw_listings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    source TEXT NOT NULL,
                    listing_data TEXT NOT NULL,
                    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    processed BOOLEAN DEFAULT FALSE
                )
            ''')
            
            # Clean listings table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS vehicle_listings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    vin TEXT UNIQUE,
                    make TEXT,
                    model TEXT,
                    year INTEGER,
                    price REAL,
                    mileage INTEGER,
                    body_type TEXT,
                    fuel_type TEXT,
                    transmission TEXT,
                    drivetrain TEXT,
                    exterior_color TEXT,
                    interior_color TEXT,
                    engine TEXT,
                    features TEXT,
                    location TEXT,
                    dealer_name TEXT,
                    listing_url TEXT,
                    image_urls TEXT,
                    source TEXT,
                    scraped_at TIMESTAMP,
                    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Predictions table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS price_predictions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    listing_id INTEGER,
                    predicted_price REAL,
                    confidence_lower REAL,
                    confidence_upper REAL,
                    market_insights TEXT,
                    model_version TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (listing_id) REFERENCES vehicle_listings (id)
                )
            ''')
            
            # Training metrics table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS training_metrics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    mae REAL,
                    rmse REAL,
                    r2 REAL,
                    mape REAL,
                    model_version TEXT,
                    training_samples INTEGER,
                    training_time REAL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Scraping logs table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS scraping_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    source TEXT,
                    status TEXT,
                    listings_scraped INTEGER,
                    listings_stored INTEGER,
                    error_message TEXT,
                    execution_time REAL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Market analysis cache table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS market_analysis_cache (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    filters_hash TEXT UNIQUE,
                    analysis_data TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP
                )
            ''')
            
            conn.commit()
    
    def store_raw_listings(self, listings: List[Dict[str, Any]], source: str) -> int:
        """Store raw scraped listings"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            stored_count = 0
            for listing in listings:
                try:
                    listing_json = json.dumps(listing)
                    cursor.execute('''
                        INSERT INTO raw_listings (source, listing_data, scraped_at)
                        VALUES (?, ?, ?)
                    ''', (source, listing_json, datetime.now()))
                    stored_count += 1
                except Exception as e:
                    self.logger.error(f"Error storing raw listing: {str(e)}")
            
            conn.commit()
            return stored_count
    
    def store_cleaned_listings(self, listings: List[Dict[str, Any]]) -> int:
        """Store cleaned and deduplicated listings"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            stored_count = 0
            for listing in listings:
                try:
                    cursor.execute('''
                        INSERT OR REPLACE INTO vehicle_listings (
                            vin, make, model, year, price, mileage, body_type,
                            fuel_type, transmission, drivetrain, exterior_color,
                            interior_color, engine, features, location, dealer_name,
                            listing_url, image_urls, source, scraped_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        listing.get('vin'),
                        listing.get('make'),
                        listing.get('model'),
                        listing.get('year'),
                        listing.get('price'),
                        listing.get('mileage'),
                        listing.get('body_type'),
                        listing.get('fuel_type'),
                        listing.get('transmission'),
                        listing.get('drivetrain'),
                        listing.get('exterior_color'),
                        listing.get('interior_color'),
                        listing.get('engine'),
                        json.dumps(listing.get('features', [])),
                        listing.get('location'),
                        listing.get('dealer_name'),
                        listing.get('listing_url'),
                        json.dumps(listing.get('image_urls', [])),
                        listing.get('source'),
                        datetime.fromtimestamp(listing.get('scraped_at', datetime.now().timestamp()))
                    ))
                    stored_count += 1
                except Exception as e:
                    self.logger.error(f"Error storing cleaned listing: {str(e)}")
            
            conn.commit()
            return stored_count
    
    def store_predictions(self, predictions: List[Dict[str, Any]]) -> int:
        """Store price predictions"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            stored_count = 0
            for prediction in predictions:
                try:
                    cursor.execute('''
                        INSERT INTO price_predictions (
                            listing_id, predicted_price, confidence_lower, confidence_upper,
                            market_insights, model_version
                        ) VALUES (?, ?, ?, ?, ?, ?)
                    ''', (
                        prediction.get('listing_id'),
                        prediction.get('predicted_price'),
                        prediction.get('confidence_interval', {}).get('lower_bound'),
                        prediction.get('confidence_interval', {}).get('upper_bound'),
                        json.dumps(prediction.get('market_insights', {})),
                        prediction.get('model_version')
                    ))
                    stored_count += 1
                except Exception as e:
                    self.logger.error(f"Error storing prediction: {str(e)}")
            
            conn.commit()
            return stored_count
    
    def store_training_metrics(self, metrics: Dict[str, Any]) -> None:
        """Store training metrics"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO training_metrics (
                    mae, rmse, r2, mape, model_version, training_samples, training_time
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                metrics.get('mae'),
                metrics.get('rmse'),
                metrics.get('r2'),
                metrics.get('mape'),
                metrics.get('model_version', 'unknown'),
                metrics.get('training_samples'),
                metrics.get('training_time')
            ))
            
            conn.commit()
    
    def store_single_prediction(self, vehicle_data: Dict[str, Any], prediction: Dict[str, Any]) -> None:
        """Store a single prediction for tracking"""
        # This could be used for real-time predictions
        pass
    
    def get_unpredicted_listings(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get listings that don't have predictions yet"""
        with sqlite3.connect(self.db_path) as conn:
            query = '''
                SELECT vl.* FROM vehicle_listings vl
                LEFT JOIN price_predictions pp ON vl.id = pp.listing_id
                WHERE pp.id IS NULL
                ORDER BY vl.processed_at DESC
                LIMIT ?
            '''
            
            df = pd.read_sql_query(query, conn, params=(limit,))
            return df.to_dict('records')
    
    def get_recent_metrics(self, days: int = 7) -> Optional[Dict[str, float]]:
        """Get recent model performance metrics"""
        with sqlite3.connect(self.db_path) as conn:
            query = '''
                SELECT * FROM training_metrics
                WHERE created_at > datetime('now', '-{} days')
                ORDER BY created_at DESC
                LIMIT 1
            '''.format(days)
            
            cursor = conn.cursor()
            cursor.execute(query)
            result = cursor.fetchone()
            
            if result:
                columns = [desc[0] for desc in cursor.description]
                return dict(zip(columns, result))
            return None
    
    def get_baseline_metrics(self) -> Optional[Dict[str, float]]:
        """Get baseline model metrics (first successful training)"""
        with sqlite3.connect(self.db_path) as conn:
            query = '''
                SELECT * FROM training_metrics
                WHERE mae IS NOT NULL
                ORDER BY created_at ASC
                LIMIT 1
            '''
            
            cursor = conn.cursor()
            cursor.execute(query)
            result = cursor.fetchone()
            
            if result:
                columns = [desc[0] for desc in cursor.description]
                return dict(zip(columns, result))
            return None
    
    def get_last_training_time(self) -> Optional[datetime]:
        """Get timestamp of last training"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT MAX(created_at) FROM training_metrics')
            result = cursor.fetchone()[0]
            
            if result:
                return datetime.fromisoformat(result.replace('Z', '+00:00'))
            return None
    
    def get_last_scraping_time(self) -> Optional[datetime]:
        """Get timestamp of last scraping"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT MAX(created_at) FROM scraping_logs')
            result = cursor.fetchone()[0]
            
            if result:
                return datetime.fromisoformat(result.replace('Z', '+00:00'))
            return None
    
    def get_last_prediction_time(self) -> Optional[datetime]:
        """Get timestamp of last prediction"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT MAX(created_at) FROM price_predictions')
            result = cursor.fetchone()[0]
            
            if result:
                return datetime.fromisoformat(result.replace('Z', '+00:00'))
            return None
    
    def get_total_listings_count(self) -> int:
        """Get total number of listings"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT COUNT(*) FROM vehicle_listings')
            return cursor.fetchone()[0]
    
    def get_latest_data_time(self) -> Optional[datetime]:
        """Get timestamp of latest scraped data"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT MAX(scraped_at) FROM vehicle_listings')
            result = cursor.fetchone()[0]
            
            if result:
                return datetime.fromisoformat(result.replace('Z', '+00:00'))
            return None
    
    def get_training_data_volume(self) -> int:
        """Get volume of available training data"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT COUNT(*) FROM vehicle_listings
                WHERE price IS NOT NULL AND price > 1000 AND price < 200000
            ''')
            return cursor.fetchone()[0]
    
    def get_recent_prediction_metrics(self) -> Optional[Dict[str, float]]:
        """Get recent prediction accuracy metrics"""
        # This would require actual vs predicted price comparisons
        # For now, return None - implement when you have actual validation data
        return None
    
    def get_last_scraper_success(self, scraper_name: str) -> Optional[datetime]:
        """Get last successful scraping time for a specific scraper"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT MAX(created_at) FROM scraping_logs
                WHERE source = ? AND status = 'success'
            ''', (scraper_name,))
            result = cursor.fetchone()[0]
            
            if result:
                return datetime.fromisoformat(result.replace('Z', '+00:00'))
            return None
    
    def get_last_scraper_error(self, scraper_name: str) -> Optional[datetime]:
        """Get last error time for a specific scraper"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT MAX(created_at) FROM scraping_logs
                WHERE source = ? AND status = 'error'
            ''', (scraper_name,))
            result = cursor.fetchone()[0]
            
            if result:
                return datetime.fromisoformat(result.replace('Z', '+00:00'))
            return None
    
    def get_market_analysis(self, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get market analysis based on filters"""
        with sqlite3.connect(self.db_path) as conn:
            # Build query based on filters
            base_query = '''
                SELECT 
                    COUNT(*) as total_listings,
                    AVG(price) as avg_price,
                    MIN(price) as min_price,
                    MAX(price) as max_price,
                    AVG(mileage) as avg_mileage,
                    make,
                    model,
                    year
                FROM vehicle_listings
                WHERE price IS NOT NULL
            '''
            
            params = []
            if filters:
                if 'make' in filters:
                    base_query += ' AND make = ?'
                    params.append(filters['make'])
                if 'year_min' in filters:
                    base_query += ' AND year >= ?'
                    params.append(filters['year_min'])
                if 'year_max' in filters:
                    base_query += ' AND year <= ?'
                    params.append(filters['year_max'])
            
            base_query += ' GROUP BY make, model, year ORDER BY total_listings DESC'
            
            df = pd.read_sql_query(base_query, conn, params=params)
            
            # Calculate additional metrics
            analysis = {
                'total_vehicles': int(df['total_listings'].sum()),
                'average_price': float(df['avg_price'].mean()),
                'price_range': {
                    'min': float(df['min_price'].min()),
                    'max': float(df['max_price'].max())
                },
                'popular_makes': df.groupby('make')['total_listings'].sum().sort_values(ascending=False).head(10).to_dict(),
                'by_year': df.groupby('year')['avg_price'].mean().sort_index().to_dict(),
                'generated_at': datetime.now().isoformat()
            }
            
            return analysis
    
    def get_retraining_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get history of model retraining events"""
        with sqlite3.connect(self.db_path) as conn:
            query = '''
                SELECT * FROM training_metrics
                ORDER BY created_at DESC
                LIMIT ?
            '''
            
            df = pd.read_sql_query(query, conn, params=(limit,))
            return df.to_dict('records')
    
    def cleanup_old_data(self, days: int = 90) -> Dict[str, int]:
        """Clean up old data beyond specified days"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Clean old raw listings
            cursor.execute('''
                DELETE FROM raw_listings
                WHERE scraped_at < datetime('now', '-{} days')
            '''.format(days))
            raw_deleted = cursor.rowcount
            
            # Clean old market analysis cache
            cursor.execute('DELETE FROM market_analysis_cache WHERE expires_at < datetime("now")')
            cache_deleted = cursor.rowcount
            
            conn.commit()
            
            return {
                'raw_listings_deleted': raw_deleted,
                'cache_entries_deleted': cache_deleted
            }
    
    def get_database_stats(self) -> Dict[str, Any]:
        """Get database statistics"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            stats = {}
            
            # Table sizes
            tables = ['raw_listings', 'vehicle_listings', 'price_predictions', 'training_metrics', 'scraping_logs']
            for table in tables:
                cursor.execute(f'SELECT COUNT(*) FROM {table}')
                stats[f'{table}_count'] = cursor.fetchone()[0]
            
            # Database size
            cursor.execute("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()")
            stats['database_size_bytes'] = cursor.fetchone()[0]
            
            # Date ranges
            cursor.execute('SELECT MIN(scraped_at), MAX(scraped_at) FROM vehicle_listings')
            min_date, max_date = cursor.fetchone()
            stats['data_date_range'] = {
                'earliest': min_date,
                'latest': max_date
            }
            
            return stats