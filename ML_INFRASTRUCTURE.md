# AutolytiQ ML Infrastructure Overview

## Current ML Architecture

### Database Hierarchy & Storage

#### Primary Database: PostgreSQL
- **Tables**: vehicles, customers, leads, sales, competitive_pricing, pricing_insights
- **Data Flow**: Express.js → Drizzle ORM → PostgreSQL
- **Real-time Integration**: Vehicle data, customer interactions, sales transactions

#### ML-Specific Database: SQLite (ML Backend)
- **Location**: `ml_backend/data/vehicle_listings.db`
- **Tables**: 
  - `vehicle_listings`: Scraped vehicle data with pricing
  - `model_metrics`: Training performance tracking
  - `feature_importance`: Model feature weights
  - `retraining_history`: Model version history

### Machine Learning Algorithms

#### Primary Model: XGBoost Regressor
```python
# Current Configuration
xgb_params = {
    'objective': 'reg:squarederror',
    'n_estimators': 1000,
    'max_depth': 8,
    'learning_rate': 0.1,
    'subsample': 0.8,
    'colsample_bytree': 0.8,
    'random_state': 42,
    'early_stopping_rounds': 50,
    'eval_metric': 'mae'
}
```

#### Feature Engineering Pipeline
- Vehicle depreciation curves
- Market trend analysis
- Geographic pricing variations
- Seasonal adjustments
- Condition/mileage impact

#### Model Performance Metrics
- Mean Absolute Error (MAE)
- Root Mean Square Error (RMSE)
- R² Score
- Cross-validation scores
- Prediction confidence intervals

### Data Scraping Infrastructure

#### Web Scrapers (Selenium + Undetected Chrome)
1. **CarGurus Scraper** (`ml_backend/scraper/cargurus.py`)
   - Bypass bot detection
   - Extract: price, mileage, year, make, model, location
   - Rate limiting: 2-3 second delays

2. **AutoTrader Scraper** (`ml_backend/scraper/autotrader.py`)
   - Advanced filtering capabilities
   - Dealer vs private party distinction
   - Comprehensive vehicle details

#### Data Processing Pipeline
```
Raw Scrape → Deduplication → Validation → Feature Engineering → Storage
```

#### Deduplication Strategy
- VIN-based primary matching
- Fuzzy matching on make/model/year/mileage
- Price similarity clustering
- Time-based duplicate removal

### Continuous Training Infrastructure

#### Real-time Retraining System
- **Trigger**: New data threshold (1000+ samples)
- **Schedule**: Daily performance checks
- **Validation**: Holdout test set evaluation
- **Rollback**: Automatic if performance degrades

#### Model Versioning
- **Storage**: Joblib serialization
- **Backup**: Previous 5 model versions
- **A/B Testing**: Gradual rollout of new models

#### Live Parameter Updates
- Learning rate adjustment
- Feature weight modifications
- Hyperparameter tuning via API
- Real-time pipeline control

### Dashboard & Monitoring Stack

#### Current Implementation
1. **Streamlit Dashboard** (`ml_backend/ui/dashboard.py`)
   - Real-time metrics visualization
   - Model performance tracking
   - Data quality monitoring
   - Training job management

2. **Flask API** (`ml_backend/ui/flask_api.py`)
   - RESTful endpoints for predictions
   - Model health checks
   - Training job triggers
   - Metrics reporting

3. **Express.js Integration** (`server/continuous-ml.ts`)
   - Pipeline orchestration
   - Status monitoring
   - Parameter updates
   - Health assessments

#### Missing Infrastructure (Recommended)

##### Grafana + Prometheus Stack
```yaml
# Proposed Architecture
monitoring:
  - prometheus: # Metrics collection
    - model_accuracy_gauge
    - prediction_latency_histogram
    - scraping_success_rate
    - data_quality_score
  
  - grafana: # Visualization
    - ML Performance Dashboard
    - Data Pipeline Health
    - Resource Usage Monitoring
    - Alert Management
```

##### Advanced Logging
```python
# Enhanced Logging Strategy
loggers:
  - model_performance: MLflow integration
  - data_quality: Great Expectations validation
  - pipeline_health: Custom metrics
  - resource_usage: System monitoring
```

### Data Flow Architecture

#### Scraping → Training → Prediction Flow
```
1. Selenium Scrapers → Raw Vehicle Data
2. Data Validation → Clean Dataset
3. Feature Engineering → Training Features
4. XGBoost Training → Model Artifacts
5. Model Deployment → Prediction API
6. Real-time Predictions → Express.js Endpoints
```

#### Quality Assurance Pipeline
```
Data Validation:
- Price range validation (1K - 200K)
- VIN format checking
- Required field presence
- Outlier detection (IQR method)
- Duplicate detection (VIN + fuzzy matching)

Model Validation:
- Cross-validation scores
- Holdout test performance
- Prediction confidence intervals
- A/B testing against previous model
```

### Current Constraints & Testing Framework

#### Training Constraints
1. **Data Freshness**: Only data from last 30 days
2. **Price Range**: $1,000 - $200,000
3. **Minimum Samples**: 1000+ for retraining
4. **Geographic Scope**: US-based listings only

#### A/B Testing Framework
```python
# Model Authenticity Testing
def test_model_authenticity(new_model, baseline_model, test_data):
    """Test new model against baseline with multiple metrics"""
    
    metrics = {
        'mae_improvement': compare_mae(new_model, baseline_model, test_data),
        'prediction_stability': test_prediction_variance(new_model, test_data),
        'feature_importance_shift': compare_feature_weights(new_model, baseline_model),
        'edge_case_handling': test_outlier_predictions(new_model, edge_cases)
    }
    
    return validate_improvement_threshold(metrics, min_improvement=0.05)
```

#### Constraint Testing
- **Data Quality Gates**: 95% valid records threshold
- **Model Performance**: MAE < $2,500 on test set
- **Prediction Speed**: < 100ms response time
- **Resource Usage**: < 80% CPU during training

### API Endpoints & Integration

#### ML Control API Routes
```typescript
// Current Express.js Integration
/api/ml/start-pipeline     // Start continuous training
/api/ml/stop-pipeline      // Stop training pipeline
/api/ml/update-params      // Live parameter updates
/api/ml/health             // Pipeline health check
/api/ml/metrics           // Performance metrics
/api/ml/predict           // Real-time predictions
```

#### Python ML Backend API
```python
# Flask API Endpoints
/predict                  # Vehicle price prediction
/retrain                  # Trigger model retraining
/metrics                  # Model performance data
/health                   # System health check
/data-quality            # Data validation metrics
```

### Security & Compliance

#### Data Privacy
- No PII collection from scraped data
- VIN anonymization for training
- Secure API key management
- Rate limiting on scraping

#### Bot Detection Bypass
- Undetected Chrome browser
- User agent rotation
- Proxy rotation capability
- Human-like interaction patterns

### Performance Optimization

#### Current Optimizations
- Vectorized feature engineering
- Batch prediction capabilities
- Incremental learning support
- Memory-efficient data loading

#### Proposed Enhancements
- GPU acceleration for training
- Distributed scraping cluster
- Redis caching for predictions
- Apache Kafka for real-time streaming

## Recommended Next Steps

1. **Implement Grafana/Prometheus monitoring**
2. **Add MLflow for experiment tracking**
3. **Enhanced A/B testing framework**
4. **Distributed scraping architecture**
5. **GPU-accelerated training pipeline**
6. **Real-time streaming data ingestion**

## Current Status
- ✅ XGBoost model operational
- ✅ Selenium scrapers functional
- ✅ Real-time retraining system
- ✅ Express.js integration complete
- ⚠️ Missing: Grafana/Prometheus monitoring
- ⚠️ Missing: MLflow experiment tracking
- ⚠️ Missing: Advanced alerting system