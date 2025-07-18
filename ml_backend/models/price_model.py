"""
XGBoost-based vehicle pricing model
"""

import pandas as pd
import numpy as np
import joblib
import logging
from typing import Dict, List, Any, Optional, Tuple
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor
import sqlite3
from datetime import datetime, timedelta
from .feature_engineering import VehicleFeatureEngineer

class VehiclePriceModel:
    """XGBoost-based vehicle pricing model with real-time predictions"""
    
    def __init__(self, model_path: str = 'models/vehicle_price_model.pkl'):
        self.model = None
        self.feature_engineer = VehicleFeatureEngineer()
        self.model_path = model_path
        self.model_metrics = {}
        self.logger = logging.getLogger(self.__class__.__name__)
        
        # XGBoost parameters
        self.xgb_params = {
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
    
    def load_training_data(self, data_source: str = 'data/vehicle_listings.db') -> pd.DataFrame:
        """Load training data from database"""
        try:
            conn = sqlite3.connect(data_source)
            
            query = """
            SELECT * FROM vehicle_listings 
            WHERE price IS NOT NULL 
            AND price > 1000 
            AND price < 200000
            AND scraped_at > datetime('now', '-30 days')
            """
            
            df = pd.read_sql_query(query, conn)
            conn.close()
            
            self.logger.info(f"Loaded {len(df)} training samples")
            return df
            
        except Exception as e:
            self.logger.error(f"Error loading training data: {str(e)}")
            return pd.DataFrame()
    
    def prepare_data(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare data for training"""
        # Remove duplicates based on VIN
        df_clean = df.drop_duplicates(subset=['vin'], keep='last')
        
        # Handle missing values
        df_clean = self._handle_missing_values(df_clean)
        
        # Remove outliers
        df_clean = self._remove_outliers(df_clean)
        
        # Feature engineering
        X = self.feature_engineer.fit_transform(df_clean)
        y = df_clean['price'].values
        
        self.logger.info(f"Data prepared. Features: {X.shape[1]}, Samples: {X.shape[0]}")
        return X, y
    
    def train(self, X: np.ndarray, y: np.ndarray, optimize_params: bool = True) -> Dict[str, float]:
        """Train the XGBoost model"""
        self.logger.info("Starting model training...")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Optimize hyperparameters if requested
        if optimize_params:
            self.model = self._optimize_hyperparameters(X_train, y_train)
        else:
            self.model = XGBRegressor(**self.xgb_params)
        
        # Train the model
        self.model.fit(
            X_train, y_train,
            eval_set=[(X_test, y_test)],
            verbose=False
        )
        
        # Evaluate model
        metrics = self._evaluate_model(X_test, y_test)
        self.model_metrics = metrics
        
        self.logger.info(f"Model training complete. MAE: {metrics['mae']:.2f}, R2: {metrics['r2']:.3f}")
        return metrics
    
    def _optimize_hyperparameters(self, X_train: np.ndarray, y_train: np.ndarray) -> XGBRegressor:
        """Optimize hyperparameters using GridSearchCV"""
        self.logger.info("Optimizing hyperparameters...")
        
        param_grid = {
            'max_depth': [6, 8, 10],
            'learning_rate': [0.05, 0.1, 0.15],
            'n_estimators': [800, 1000, 1200],
            'subsample': [0.7, 0.8, 0.9],
            'colsample_bytree': [0.7, 0.8, 0.9]
        }
        
        base_model = XGBRegressor(
            objective='reg:squarederror',
            random_state=42,
            n_jobs=-1
        )
        
        grid_search = GridSearchCV(
            base_model,
            param_grid,
            cv=5,
            scoring='neg_mean_absolute_error',
            n_jobs=-1,
            verbose=1
        )
        
        grid_search.fit(X_train, y_train)
        
        self.logger.info(f"Best parameters: {grid_search.best_params_}")
        return grid_search.best_estimator_
    
    def _evaluate_model(self, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, float]:
        """Evaluate model performance"""
        y_pred = self.model.predict(X_test)
        
        metrics = {
            'mae': mean_absolute_error(y_test, y_pred),
            'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
            'r2': r2_score(y_test, y_pred),
            'mape': np.mean(np.abs((y_test - y_pred) / y_test)) * 100
        }
        
        return metrics
    
    def predict(self, vehicle_data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict vehicle price"""
        if not self.model:
            raise ValueError("Model not trained. Call train() first.")
        
        # Convert to DataFrame
        df = pd.DataFrame([vehicle_data])
        
        # Handle missing values
        df = self._handle_missing_values(df)
        
        # Feature engineering
        X = self.feature_engineer.transform(df)
        
        # Make prediction
        predicted_price = self.model.predict(X)[0]
        
        # Calculate confidence interval
        confidence_interval = self._calculate_confidence_interval(X, predicted_price)
        
        # Market insights
        market_insights = self._generate_market_insights(vehicle_data, predicted_price)
        
        return {
            'predicted_price': float(predicted_price),
            'confidence_interval': confidence_interval,
            'market_insights': market_insights,
            'model_version': self._get_model_version(),
            'prediction_timestamp': datetime.now().isoformat()
        }
    
    def predict_batch(self, vehicle_data_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Predict prices for multiple vehicles"""
        results = []
        
        for vehicle_data in vehicle_data_list:
            try:
                prediction = self.predict(vehicle_data)
                results.append(prediction)
            except Exception as e:
                self.logger.error(f"Error predicting for vehicle {vehicle_data.get('vin', 'unknown')}: {str(e)}")
                results.append(None)
        
        return results
    
    def _calculate_confidence_interval(self, X: np.ndarray, predicted_price: float) -> Dict[str, float]:
        """Calculate confidence interval for prediction"""
        # Simplified confidence interval calculation
        # In production, you might use quantile regression or bootstrap methods
        
        mae = self.model_metrics.get('mae', 0)
        
        return {
            'lower_bound': max(0, predicted_price - 1.96 * mae),
            'upper_bound': predicted_price + 1.96 * mae,
            'confidence_level': 0.95
        }
    
    def _generate_market_insights(self, vehicle_data: Dict[str, Any], predicted_price: float) -> Dict[str, Any]:
        """Generate market insights for the prediction"""
        insights = {
            'price_category': self._categorize_price(predicted_price),
            'market_position': 'average',  # Simplified
            'depreciation_rate': self._estimate_depreciation_rate(vehicle_data),
            'demand_score': self._estimate_demand_score(vehicle_data),
            'recommendations': self._generate_recommendations(vehicle_data, predicted_price)
        }
        
        return insights
    
    def _categorize_price(self, price: float) -> str:
        """Categorize price into segments"""
        if price < 15000:
            return 'budget'
        elif price < 30000:
            return 'mid-range'
        elif price < 50000:
            return 'premium'
        else:
            return 'luxury'
    
    def _estimate_depreciation_rate(self, vehicle_data: Dict[str, Any]) -> float:
        """Estimate annual depreciation rate"""
        # Simplified depreciation calculation
        age = 2024 - vehicle_data.get('year', 2024)
        if age <= 0:
            return 0.15  # New car depreciation
        elif age <= 3:
            return 0.12
        elif age <= 7:
            return 0.10
        else:
            return 0.08
    
    def _estimate_demand_score(self, vehicle_data: Dict[str, Any]) -> float:
        """Estimate demand score (0-1)"""
        # Simplified demand scoring
        make = vehicle_data.get('make', '').lower()
        body_type = vehicle_data.get('body_type', '').lower()
        
        base_score = 0.5
        
        # Popular makes
        if make in ['toyota', 'honda', 'ford', 'chevrolet']:
            base_score += 0.2
        
        # Popular body types
        if 'suv' in body_type or 'truck' in body_type:
            base_score += 0.2
        
        return min(1.0, base_score)
    
    def _generate_recommendations(self, vehicle_data: Dict[str, Any], predicted_price: float) -> List[str]:
        """Generate pricing recommendations"""
        recommendations = []
        
        current_price = vehicle_data.get('price', 0)
        if current_price > 0:
            price_diff = (current_price - predicted_price) / predicted_price
            
            if price_diff > 0.15:
                recommendations.append("Consider reducing price - currently overpriced")
            elif price_diff < -0.15:
                recommendations.append("Great deal - priced below market value")
            else:
                recommendations.append("Fairly priced according to market")
        
        # Add feature-based recommendations
        age = 2024 - vehicle_data.get('year', 2024)
        if age > 10:
            recommendations.append("Consider highlighting reliability and maintenance records")
        
        mileage = vehicle_data.get('mileage', 0)
        if mileage > 100000:
            recommendations.append("Emphasize recent maintenance and remaining warranty")
        
        return recommendations
    
    def save_model(self, path: str = None) -> None:
        """Save the trained model"""
        if not self.model:
            raise ValueError("No model to save")
        
        save_path = path or self.model_path
        
        model_data = {
            'model': self.model,
            'feature_engineer': self.feature_engineer,
            'metrics': self.model_metrics,
            'version': self._get_model_version(),
            'timestamp': datetime.now().isoformat()
        }
        
        joblib.dump(model_data, save_path)
        self.logger.info(f"Model saved to {save_path}")
    
    def load_model(self, path: str = None) -> None:
        """Load a trained model"""
        load_path = path or self.model_path
        
        try:
            model_data = joblib.load(load_path)
            self.model = model_data['model']
            self.feature_engineer = model_data['feature_engineer']
            self.model_metrics = model_data.get('metrics', {})
            
            self.logger.info(f"Model loaded from {load_path}")
            
        except Exception as e:
            self.logger.error(f"Error loading model: {str(e)}")
            raise
    
    def _handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """Handle missing values in the data"""
        # Fill missing values with appropriate defaults
        df = df.copy()
        
        # Numerical columns
        numerical_cols = ['year', 'mileage', 'price']
        for col in numerical_cols:
            if col in df.columns:
                df[col] = df[col].fillna(df[col].median())
        
        # Categorical columns
        categorical_cols = ['make', 'model', 'body_type', 'fuel_type', 'transmission', 'drivetrain']
        for col in categorical_cols:
            if col in df.columns:
                df[col] = df[col].fillna('unknown')
        
        return df
    
    def _remove_outliers(self, df: pd.DataFrame) -> pd.DataFrame:
        """Remove price outliers using IQR method"""
        Q1 = df['price'].quantile(0.25)
        Q3 = df['price'].quantile(0.75)
        IQR = Q3 - Q1
        
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        
        df_clean = df[(df['price'] >= lower_bound) & (df['price'] <= upper_bound)]
        
        self.logger.info(f"Removed {len(df) - len(df_clean)} outliers")
        return df_clean
    
    def _get_model_version(self) -> str:
        """Get model version string"""
        return f"v1.0_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    def get_feature_importance(self, top_n: int = 20) -> pd.DataFrame:
        """Get feature importance from the model"""
        if not self.model:
            raise ValueError("Model not trained")
        
        return self.feature_engineer.get_feature_importance_df(self.model, top_n)
    
    def cross_validate(self, X: np.ndarray, y: np.ndarray, cv: int = 5) -> Dict[str, float]:
        """Perform cross-validation"""
        if not self.model:
            self.model = XGBRegressor(**self.xgb_params)
        
        cv_scores = cross_val_score(
            self.model, X, y, 
            cv=cv, 
            scoring='neg_mean_absolute_error',
            n_jobs=-1
        )
        
        return {
            'cv_mae_mean': -cv_scores.mean(),
            'cv_mae_std': cv_scores.std(),
            'cv_scores': -cv_scores
        }