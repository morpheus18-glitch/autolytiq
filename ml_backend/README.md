# Vehicle Pricing Intelligence System

A comprehensive Python-based system for autonomous vehicle price analysis using machine learning, web scraping, and real-time predictions.

## 🚀 Features

### Core Capabilities
- **Autonomous Web Scraping**: Headless browser scraping with bot detection bypass
- **Machine Learning**: XGBoost-based price prediction with feature engineering
- **Real-time Predictions**: Fast price estimates with confidence intervals
- **Market Analysis**: Comprehensive market trend analysis and insights
- **Data Deduplication**: Intelligent duplicate detection and removal
- **Periodic Retraining**: Automated model updates with performance monitoring

### Scrapers
- **CarGurus**: Advanced scraper with pagination and detail extraction
- **AutoTrader**: Full-featured scraper with comprehensive data collection
- **Extensible**: Easy to add new sources (Cars.com, Edmunds, etc.)

### ML Pipeline
- **Feature Engineering**: 50+ engineered features including age, brand tier, seasonal factors
- **XGBoost Model**: Optimized hyperparameters with cross-validation
- **Outlier Detection**: Automatic data cleaning and quality checks
- **Performance Monitoring**: Continuous model performance tracking

### Interfaces
- **Streamlit Dashboard**: Interactive web interface for analysis and control
- **Flask API**: RESTful API for integration with other systems
- **Command Line**: Direct pipeline control and automation

## 📁 Project Structure

```
ml_backend/
├── scraper/                    # Web scraping modules
│   ├── base_scraper.py        # Base scraper with anti-detection
│   ├── cargurus.py            # CarGurus scraper
│   ├── autotrader.py          # AutoTrader scraper
│   └── __init__.py
├── models/                     # ML models and feature engineering
│   ├── price_model.py         # XGBoost price prediction model
│   ├── feature_engineering.py # Feature engineering pipeline
│   └── __init__.py
├── pipeline/                   # Pipeline orchestration
│   ├── run_pipeline.py        # Main pipeline controller
│   ├── retrain.py             # Model retraining logic
│   └── __init__.py
├── utils/                      # Utility modules
│   ├── data_storage.py        # Database operations
│   ├── deduplication.py       # Duplicate detection
│   └── __init__.py
├── ui/                         # User interfaces
│   ├── dashboard.py           # Streamlit dashboard
│   └── flask_api.py           # Flask REST API
├── data/                       # Data storage
│   └── snapshots/             # Data snapshots
├── models/                     # Trained models
│   └── backups/               # Model backups
├── requirements.txt           # Python dependencies
└── README.md                  # This file
```

## 🛠️ Installation

### Prerequisites
- Python 3.8+
- Chrome browser (for scraping)
- 4GB+ RAM recommended

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Setup Chrome Driver
The system uses undetected-chromedriver which automatically manages Chrome driver installation.

## 🚀 Quick Start

### 1. Run Complete Pipeline
```bash
python pipeline/run_pipeline.py --mode full
```

### 2. Start Streamlit Dashboard
```bash
streamlit run ui/dashboard.py
```

### 3. Start Flask API
```bash
python ui/flask_api.py
```

### 4. Individual Components
```bash
# Scraping only
python pipeline/run_pipeline.py --mode scraping

# Training only
python pipeline/run_pipeline.py --mode training

# Predictions only
python pipeline/run_pipeline.py --mode prediction

# Scheduled mode (runs continuously)
python pipeline/run_pipeline.py --mode scheduled
```

## 🔧 Configuration

### Pipeline Configuration
```python
config = {
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
        'price_max': 100000
    }
}
```

### Search Parameters
- `zip_code`: Center location for search
- `radius`: Search radius in miles
- `year_min/max`: Vehicle year range
- `price_min/max`: Price range filter
- `mileage_max`: Maximum mileage
- `make/model`: Specific vehicle filters

## 📊 Dashboard Features

### Overview
- Real-time metrics and KPIs
- Recent scraping activity
- Model performance trends
- System health indicators

### Real-time Pricing
- Interactive price prediction form
- Confidence intervals
- Market insights and recommendations
- Comparable vehicle analysis

### Market Analysis
- Price trends by make/model/year
- Popular vehicle analysis
- Market segment insights
- Geographic price variations

### Pipeline Status
- Scraper health monitoring
- Model performance metrics
- Data freshness indicators
- Error tracking and alerts

## 🔌 API Endpoints

### Price Predictions
```bash
# Single prediction
POST /api/predict
{
    "make": "Toyota",
    "model": "Camry",
    "year": 2020,
    "mileage": 50000,
    "body_type": "Sedan"
}

# Batch predictions
POST /api/predict/batch
{
    "vehicles": [...]
}
```

### Market Analysis
```bash
# Get market analysis
GET /api/market-analysis?make=Toyota&year_min=2015&year_max=2024
```

### Pipeline Control
```bash
# Run pipeline cycle
POST /api/pipeline/run
{
    "type": "scraping"  # or "training", "prediction", "full"
}

# Get pipeline status
GET /api/pipeline/status
```

### Data Management
```bash
# Get listings
GET /api/data/listings?page=1&per_page=20&make=Toyota

# Database statistics
GET /api/data/stats

# Clean old data
POST /api/data/cleanup
{
    "days": 90
}
```

## 🤖 Machine Learning Details

### Feature Engineering
- **Vehicle Age**: Current year minus model year
- **Mileage per Year**: Annual mileage calculation
- **Brand Tier**: Luxury, mainstream, economy classification
- **Body Type Categories**: SUV, sedan, truck, etc.
- **Fuel Efficiency Score**: Ranking by fuel type
- **Seasonal Factors**: Market timing adjustments
- **Location Factors**: Urban vs suburban vs rural
- **Dealer Type**: Franchise vs independent

### Model Architecture
- **Algorithm**: XGBoost Regressor
- **Hyperparameters**: Auto-tuned with GridSearchCV
- **Cross-validation**: 5-fold validation
- **Metrics**: MAE, RMSE, R², MAPE
- **Feature Selection**: Importance-based selection

### Performance Monitoring
- **Drift Detection**: Model performance degradation alerts
- **Retraining Triggers**: Performance threshold and time-based
- **A/B Testing**: Model comparison and rollback capabilities
- **Explainability**: Feature importance and SHAP values

## 🗄️ Data Management

### Database Schema
- **Raw Listings**: Unprocessed scraped data
- **Vehicle Listings**: Cleaned and normalized data
- **Price Predictions**: Model outputs with metadata
- **Training Metrics**: Model performance history
- **Scraping Logs**: Operational monitoring

### Data Quality
- **Deduplication**: VIN-based and similarity-based
- **Validation**: Format and range checks
- **Cleaning**: Outlier detection and removal
- **Normalization**: Consistent data formats

## 🔍 Advanced Features

### Bot Detection Bypass
- **Undetected Chrome**: Stealth browser automation
- **User Agent Rotation**: Dynamic header management
- **Request Throttling**: Human-like timing patterns
- **IP Rotation**: Proxy support (configurable)

### Scalability
- **Async Processing**: Multi-threaded scraping
- **Database Optimization**: Indexed queries
- **Memory Management**: Efficient data processing
- **Error Recovery**: Robust error handling

### Integration Ready
- **API-First Design**: RESTful endpoints
- **Webhook Support**: Event notifications
- **Export Formats**: JSON, CSV, Parquet
- **Third-party APIs**: Ready for KBB, MMR, etc.

## 🔮 Future Enhancements

### Planned Features
- **Additional Scrapers**: Cars.com, Edmunds, CarMax
- **Advanced ML**: Deep learning models, ensemble methods
- **Real-time Updates**: WebSocket support
- **Geographic Analysis**: Local market insights
- **Auction Data**: Wholesale price integration

### Integration Targets
- **KBB API**: Kelley Blue Book integration
- **Manheim Market Report**: Wholesale data
- **J.D. Power**: Quality and reliability data
- **Black Book**: Professional valuations

## 🐛 Troubleshooting

### Common Issues
1. **Chrome Driver**: Ensure Chrome is installed and updated
2. **Memory Usage**: Reduce max_pages_per_scraper for large datasets
3. **Rate Limiting**: Increase delays between requests
4. **Database Locks**: Check for concurrent access issues

### Logging
- **Pipeline Logs**: `pipeline.log`
- **Scraper Logs**: Individual scraper logging
- **Model Logs**: Training and prediction logs
- **API Logs**: Request/response logging

## 📈 Performance Optimization

### Scraping Optimization
- **Parallel Processing**: Multi-threaded scraping
- **Caching**: Response caching for repeated requests
- **Incremental Updates**: Only scrape new/changed listings
- **Smart Scheduling**: Off-peak scraping times

### Model Optimization
- **Feature Selection**: Remove low-importance features
- **Hyperparameter Tuning**: Automated optimization
- **Model Compression**: Reduce model size
- **Prediction Caching**: Cache frequent predictions

## 🔒 Security Considerations

### Data Protection
- **Sensitive Data**: Secure handling of personal information
- **Rate Limiting**: Prevent abuse of APIs
- **Authentication**: Secure API access
- **Data Retention**: Configurable data lifecycle

### Compliance
- **Robots.txt**: Respect website scraping policies
- **Terms of Service**: Comply with source website terms
- **Data Privacy**: Handle personal data responsibly
- **Legal Compliance**: Follow applicable regulations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **XGBoost**: Machine learning framework
- **Selenium**: Web automation
- **Streamlit**: Dashboard framework
- **Flask**: API framework
- **Scikit-learn**: ML utilities