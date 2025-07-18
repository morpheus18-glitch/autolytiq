"""
Configuration settings for the vehicle pricing system
"""

import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / 'data'
MODELS_DIR = BASE_DIR / 'models'
LOGS_DIR = BASE_DIR / 'logs'

# Create directories if they don't exist
for directory in [DATA_DIR, MODELS_DIR, LOGS_DIR]:
    directory.mkdir(exist_ok=True)

# Database configuration
DATABASE_CONFIG = {
    'path': str(DATA_DIR / 'vehicle_listings.db'),
    'backup_path': str(DATA_DIR / 'backups'),
    'max_connections': 10,
    'timeout': 30
}

# Model configuration
MODEL_CONFIG = {
    'path': str(MODELS_DIR / 'vehicle_price_model.pkl'),
    'backup_path': str(MODELS_DIR / 'backups'),
    'feature_importance_path': str(MODELS_DIR / 'feature_importance.json'),
    'hyperparameter_tuning': True,
    'cross_validation_folds': 5,
    'test_size': 0.2,
    'random_state': 42
}

# XGBoost parameters
XGBOOST_PARAMS = {
    'objective': 'reg:squarederror',
    'n_estimators': 1000,
    'max_depth': 8,
    'learning_rate': 0.1,
    'subsample': 0.8,
    'colsample_bytree': 0.8,
    'random_state': 42,
    'n_jobs': -1,
    'early_stopping_rounds': 50,
    'eval_metric': 'mae'
}

# Scraping configuration
SCRAPING_CONFIG = {
    'user_agents': [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36'
    ],
    'request_delay': (2, 5),  # Random delay between requests
    'page_delay': (5, 10),    # Random delay between pages
    'max_retries': 3,
    'timeout': 30,
    'headless': True,
    'use_undetected_chrome': True
}

# Pipeline configuration
PIPELINE_CONFIG = {
    'scraping_interval_hours': 6,
    'retraining_interval_days': 7,
    'prediction_interval_minutes': 60,
    'max_pages_per_scraper': 10,
    'min_training_samples': 1000,
    'model_performance_threshold': 0.1,  # 10% degradation threshold
    'data_freshness_days': 30,
    'concurrent_scrapers': 2
}

# Search parameters
DEFAULT_SEARCH_PARAMS = {
    'zip_code': '90210',
    'radius': 50,
    'year_min': 2015,
    'year_max': 2024,
    'price_min': 5000,
    'price_max': 100000,
    'mileage_max': 150000
}

# Feature engineering configuration
FEATURE_CONFIG = {
    'luxury_brands': [
        'BMW', 'Mercedes-Benz', 'Audi', 'Lexus', 'Acura', 'Infiniti',
        'Cadillac', 'Lincoln', 'Volvo', 'Jaguar', 'Land Rover', 'Porsche',
        'Maserati', 'Bentley', 'Rolls-Royce', 'Ferrari', 'Lamborghini'
    ],
    'mainstream_brands': [
        'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'Hyundai',
        'Kia', 'Mazda', 'Subaru', 'Volkswagen', 'Jeep', 'Ram', 'GMC',
        'Buick', 'Chrysler', 'Dodge', 'Mitsubishi'
    ],
    'body_type_mapping': {
        'suv': ['suv', 'crossover', 'utility', 'sport utility'],
        'sedan': ['sedan', 'saloon', '4-door'],
        'truck': ['truck', 'pickup', 'crew cab', 'regular cab'],
        'coupe': ['coupe', '2-door', 'convertible', 'cabriolet'],
        'hatchback': ['hatchback', 'hatch', '5-door'],
        'wagon': ['wagon', 'estate', 'touring'],
        'van': ['van', 'minivan', 'cargo van'],
        'other': ['other', 'unknown']
    },
    'fuel_efficiency_scores': {
        'electric': 1.0,
        'hybrid': 0.8,
        'plug-in hybrid': 0.85,
        'diesel': 0.7,
        'gasoline': 0.5,
        'gas': 0.5,
        'flex fuel': 0.4,
        'other': 0.3
    }
}

# Logging configuration
LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'standard': {
            'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        },
        'detailed': {
            'format': '%(asctime)s - %(name)s - %(levelname)s - %(module)s - %(funcName)s - %(message)s'
        }
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'standard',
            'level': 'INFO'
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': str(LOGS_DIR / 'vehicle_pricing.log'),
            'formatter': 'detailed',
            'level': 'DEBUG'
        }
    },
    'loggers': {
        '': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False
        }
    }
}

# API configuration
API_CONFIG = {
    'host': '0.0.0.0',
    'port': 5001,
    'debug': False,
    'cors_origins': ['*'],
    'rate_limit': {
        'requests_per_minute': 60,
        'requests_per_hour': 1000
    }
}

# Dashboard configuration
DASHBOARD_CONFIG = {
    'port': 8501,
    'host': '0.0.0.0',
    'theme': 'light',
    'max_width': 1200,
    'cache_ttl': 300  # 5 minutes
}

# Data validation rules
VALIDATION_RULES = {
    'price': {
        'min': 1000,
        'max': 500000
    },
    'year': {
        'min': 1980,
        'max': 2025
    },
    'mileage': {
        'min': 0,
        'max': 999999
    },
    'vin': {
        'length': 17,
        'pattern': r'^[A-HJ-NPR-Z0-9]{17}$'
    }
}

# Integration configuration (for future use)
INTEGRATION_CONFIG = {
    'kbb_api': {
        'enabled': False,
        'base_url': 'https://api.kbb.com',
        'timeout': 10
    },
    'mmr_api': {
        'enabled': False,
        'base_url': 'https://api.mmr.com',
        'timeout': 10
    },
    'edmunds_api': {
        'enabled': False,
        'base_url': 'https://api.edmunds.com',
        'timeout': 10
    }
}

# Environment-specific overrides
if os.getenv('ENVIRONMENT') == 'development':
    PIPELINE_CONFIG['scraping_interval_hours'] = 1
    PIPELINE_CONFIG['max_pages_per_scraper'] = 2
    API_CONFIG['debug'] = True
    LOGGING_CONFIG['loggers']['']['level'] = 'DEBUG'

elif os.getenv('ENVIRONMENT') == 'production':
    SCRAPING_CONFIG['headless'] = True
    API_CONFIG['debug'] = False
    LOGGING_CONFIG['loggers']['']['level'] = 'INFO'

# Export configuration as a single dict for easy access
CONFIG = {
    'database': DATABASE_CONFIG,
    'model': MODEL_CONFIG,
    'xgboost': XGBOOST_PARAMS,
    'scraping': SCRAPING_CONFIG,
    'pipeline': PIPELINE_CONFIG,
    'search': DEFAULT_SEARCH_PARAMS,
    'features': FEATURE_CONFIG,
    'logging': LOGGING_CONFIG,
    'api': API_CONFIG,
    'dashboard': DASHBOARD_CONFIG,
    'validation': VALIDATION_RULES,
    'integration': INTEGRATION_CONFIG
}