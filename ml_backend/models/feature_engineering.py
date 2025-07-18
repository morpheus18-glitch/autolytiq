"""
Feature engineering for vehicle pricing model
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Tuple
from sklearn.preprocessing import StandardScaler, LabelEncoder, OneHotEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from textblob import TextBlob
import re
import logging

class VehicleFeatureEngineer:
    """Feature engineering for vehicle pricing data"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.one_hot_encoders = {}
        self.tfidf_vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
        self.feature_names = []
        self.logger = logging.getLogger(self.__class__.__name__)
        
    def fit_transform(self, df: pd.DataFrame) -> np.ndarray:
        """Fit transformers and transform data"""
        self.logger.info("Fitting feature transformers and transforming data")
        
        # Create feature dataframe
        feature_df = self._create_base_features(df)
        
        # Fit and transform
        X = self._fit_transform_features(feature_df)
        
        self.logger.info(f"Feature engineering complete. Shape: {X.shape}")
        return X
    
    def transform(self, df: pd.DataFrame) -> np.ndarray:
        """Transform data using fitted transformers"""
        self.logger.info("Transforming data using fitted transformers")
        
        # Create feature dataframe
        feature_df = self._create_base_features(df)
        
        # Transform
        X = self._transform_features(feature_df)
        
        self.logger.info(f"Data transformed. Shape: {X.shape}")
        return X
    
    def _create_base_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create base features from raw data"""
        feature_df = df.copy()
        
        # Age feature
        current_year = pd.Timestamp.now().year
        feature_df['age'] = current_year - feature_df['year']
        
        # Mileage per year
        feature_df['mileage_per_year'] = feature_df['mileage'] / (feature_df['age'] + 1)
        
        # Log transformations for skewed features
        feature_df['log_mileage'] = np.log1p(feature_df['mileage'].fillna(0))
        feature_df['log_price'] = np.log1p(feature_df['price'].fillna(0))
        
        # Brand tier (luxury, mainstream, economy)
        luxury_brands = ['BMW', 'Mercedes-Benz', 'Audi', 'Lexus', 'Acura', 'Infiniti', 
                        'Cadillac', 'Lincoln', 'Volvo', 'Jaguar', 'Land Rover', 'Porsche']
        mainstream_brands = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'Hyundai', 
                           'Kia', 'Mazda', 'Subaru', 'Volkswagen', 'Jeep', 'Ram', 'GMC']
        
        feature_df['brand_tier'] = feature_df['make'].apply(self._categorize_brand)
        
        # Body type categories
        feature_df['body_type_category'] = feature_df['body_type'].apply(self._categorize_body_type)
        
        # Fuel type efficiency score
        feature_df['fuel_efficiency_score'] = feature_df['fuel_type'].apply(self._fuel_efficiency_score)
        
        # Transmission type score
        feature_df['transmission_score'] = feature_df['transmission'].apply(self._transmission_score)
        
        # Drivetrain score
        feature_df['drivetrain_score'] = feature_df['drivetrain'].apply(self._drivetrain_score)
        
        # Feature count from text features
        feature_df['feature_count'] = feature_df['features'].apply(self._count_features)
        
        # Color popularity score
        feature_df['exterior_color_score'] = feature_df['exterior_color'].apply(self._color_popularity_score)
        
        # Location-based features
        feature_df = self._add_location_features(feature_df)
        
        # Dealer type (franchise vs independent)
        feature_df['dealer_type'] = feature_df['dealer_name'].apply(self._categorize_dealer)
        
        # Seasonal adjustment
        feature_df['seasonal_factor'] = self._get_seasonal_factor(feature_df)
        
        return feature_df
    
    def _fit_transform_features(self, feature_df: pd.DataFrame) -> np.ndarray:
        """Fit transformers and transform features"""
        X_parts = []
        
        # Numerical features
        numerical_features = ['age', 'mileage', 'mileage_per_year', 'log_mileage', 
                            'fuel_efficiency_score', 'transmission_score', 'drivetrain_score',
                            'feature_count', 'exterior_color_score', 'seasonal_factor']
        
        X_numerical = feature_df[numerical_features].fillna(0)
        X_numerical_scaled = self.scaler.fit_transform(X_numerical)
        X_parts.append(X_numerical_scaled)
        
        # Categorical features with one-hot encoding
        categorical_features = ['make', 'brand_tier', 'body_type_category', 'fuel_type', 
                               'transmission', 'drivetrain', 'dealer_type']
        
        for feature in categorical_features:
            if feature in feature_df.columns:
                encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
                X_cat = encoder.fit_transform(feature_df[[feature]].fillna('unknown'))
                self.one_hot_encoders[feature] = encoder
                X_parts.append(X_cat)
        
        # Text features (TF-IDF)
        if 'features' in feature_df.columns:
            features_text = feature_df['features'].fillna('').apply(lambda x: ' '.join(x) if isinstance(x, list) else str(x))
            X_text = self.tfidf_vectorizer.fit_transform(features_text)
            X_parts.append(X_text.toarray())
        
        # Combine all features
        X = np.hstack(X_parts)
        
        # Store feature names for interpretability
        self._create_feature_names(numerical_features, categorical_features)
        
        return X
    
    def _transform_features(self, feature_df: pd.DataFrame) -> np.ndarray:
        """Transform features using fitted transformers"""
        X_parts = []
        
        # Numerical features
        numerical_features = ['age', 'mileage', 'mileage_per_year', 'log_mileage', 
                            'fuel_efficiency_score', 'transmission_score', 'drivetrain_score',
                            'feature_count', 'exterior_color_score', 'seasonal_factor']
        
        X_numerical = feature_df[numerical_features].fillna(0)
        X_numerical_scaled = self.scaler.transform(X_numerical)
        X_parts.append(X_numerical_scaled)
        
        # Categorical features
        categorical_features = ['make', 'brand_tier', 'body_type_category', 'fuel_type', 
                               'transmission', 'drivetrain', 'dealer_type']
        
        for feature in categorical_features:
            if feature in self.one_hot_encoders:
                encoder = self.one_hot_encoders[feature]
                X_cat = encoder.transform(feature_df[[feature]].fillna('unknown'))
                X_parts.append(X_cat)
        
        # Text features
        if 'features' in feature_df.columns:
            features_text = feature_df['features'].fillna('').apply(lambda x: ' '.join(x) if isinstance(x, list) else str(x))
            X_text = self.tfidf_vectorizer.transform(features_text)
            X_parts.append(X_text.toarray())
        
        # Combine all features
        X = np.hstack(X_parts)
        
        return X
    
    def _categorize_brand(self, make: str) -> str:
        """Categorize brand into luxury, mainstream, or economy"""
        if pd.isna(make):
            return 'unknown'
        
        make = make.title()
        luxury_brands = ['BMW', 'Mercedes-Benz', 'Audi', 'Lexus', 'Acura', 'Infiniti', 
                        'Cadillac', 'Lincoln', 'Volvo', 'Jaguar', 'Land Rover', 'Porsche']
        mainstream_brands = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'Hyundai', 
                           'Kia', 'Mazda', 'Subaru', 'Volkswagen', 'Jeep', 'Ram', 'GMC']
        
        if make in luxury_brands:
            return 'luxury'
        elif make in mainstream_brands:
            return 'mainstream'
        else:
            return 'economy'
    
    def _categorize_body_type(self, body_type: str) -> str:
        """Categorize body type into major categories"""
        if pd.isna(body_type):
            return 'unknown'
        
        body_type = body_type.lower()
        if any(x in body_type for x in ['suv', 'crossover', 'utility']):
            return 'suv'
        elif any(x in body_type for x in ['sedan', 'saloon']):
            return 'sedan'
        elif any(x in body_type for x in ['truck', 'pickup']):
            return 'truck'
        elif any(x in body_type for x in ['hatchback', 'hatch']):
            return 'hatchback'
        elif any(x in body_type for x in ['coupe', 'convertible']):
            return 'coupe'
        elif any(x in body_type for x in ['wagon', 'estate']):
            return 'wagon'
        else:
            return 'other'
    
    def _fuel_efficiency_score(self, fuel_type: str) -> float:
        """Score fuel type by efficiency"""
        if pd.isna(fuel_type):
            return 0.5
        
        fuel_type = fuel_type.lower()
        if 'electric' in fuel_type:
            return 1.0
        elif 'hybrid' in fuel_type:
            return 0.8
        elif 'diesel' in fuel_type:
            return 0.7
        elif 'gasoline' in fuel_type or 'gas' in fuel_type:
            return 0.5
        else:
            return 0.3
    
    def _transmission_score(self, transmission: str) -> float:
        """Score transmission type"""
        if pd.isna(transmission):
            return 0.5
        
        transmission = transmission.lower()
        if 'automatic' in transmission or 'cvt' in transmission:
            return 1.0
        elif 'manual' in transmission:
            return 0.7
        else:
            return 0.5
    
    def _drivetrain_score(self, drivetrain: str) -> float:
        """Score drivetrain type"""
        if pd.isna(drivetrain):
            return 0.5
        
        drivetrain = drivetrain.lower()
        if 'awd' in drivetrain or 'all wheel' in drivetrain:
            return 1.0
        elif '4wd' in drivetrain or 'four wheel' in drivetrain:
            return 0.9
        elif 'fwd' in drivetrain or 'front wheel' in drivetrain:
            return 0.7
        elif 'rwd' in drivetrain or 'rear wheel' in drivetrain:
            return 0.8
        else:
            return 0.5
    
    def _count_features(self, features: Any) -> int:
        """Count number of features"""
        if isinstance(features, list):
            return len(features)
        elif isinstance(features, str):
            return len(features.split(','))
        else:
            return 0
    
    def _color_popularity_score(self, color: str) -> float:
        """Score color by popularity"""
        if pd.isna(color):
            return 0.5
        
        color = color.lower()
        popular_colors = ['white', 'black', 'silver', 'gray', 'grey']
        if any(c in color for c in popular_colors):
            return 1.0
        else:
            return 0.7
    
    def _add_location_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add location-based features"""
        # This is a simplified version - in production, you'd use geocoding
        df['location_tier'] = df['location'].apply(self._categorize_location)
        return df
    
    def _categorize_location(self, location: str) -> str:
        """Categorize location into tiers"""
        if pd.isna(location):
            return 'unknown'
        
        location = location.lower()
        major_cities = ['new york', 'los angeles', 'chicago', 'houston', 'phoenix', 
                       'philadelphia', 'san antonio', 'san diego', 'dallas', 'san jose',
                       'austin', 'jacksonville', 'fort worth', 'columbus', 'san francisco',
                       'charlotte', 'indianapolis', 'seattle', 'denver', 'washington']
        
        if any(city in location for city in major_cities):
            return 'major_city'
        elif any(x in location for x in ['county', 'suburb', 'township']):
            return 'suburban'
        else:
            return 'rural'
    
    def _categorize_dealer(self, dealer_name: str) -> str:
        """Categorize dealer type"""
        if pd.isna(dealer_name):
            return 'unknown'
        
        dealer_name = dealer_name.lower()
        franchise_keywords = ['ford', 'toyota', 'honda', 'chevrolet', 'nissan', 'bmw', 
                             'mercedes', 'audi', 'lexus', 'acura', 'infiniti', 'cadillac']
        
        if any(keyword in dealer_name for keyword in franchise_keywords):
            return 'franchise'
        else:
            return 'independent'
    
    def _get_seasonal_factor(self, df: pd.DataFrame) -> pd.Series:
        """Get seasonal adjustment factor"""
        # This is a simplified version - in production, you'd use historical data
        return pd.Series(1.0, index=df.index)
    
    def _create_feature_names(self, numerical_features: List[str], categorical_features: List[str]):
        """Create feature names for interpretability"""
        self.feature_names = numerical_features.copy()
        
        # Add categorical feature names
        for feature in categorical_features:
            if feature in self.one_hot_encoders:
                encoder = self.one_hot_encoders[feature]
                feature_names = [f"{feature}_{cat}" for cat in encoder.categories_[0]]
                self.feature_names.extend(feature_names)
        
        # Add TF-IDF feature names
        if hasattr(self.tfidf_vectorizer, 'feature_names_out'):
            tfidf_features = [f"tfidf_{name}" for name in self.tfidf_vectorizer.get_feature_names_out()]
            self.feature_names.extend(tfidf_features)
    
    def get_feature_names(self) -> List[str]:
        """Get list of feature names"""
        return self.feature_names
    
    def get_feature_importance_df(self, model, top_n: int = 20) -> pd.DataFrame:
        """Get feature importance dataframe"""
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
            feature_importance_df = pd.DataFrame({
                'feature': self.feature_names,
                'importance': importances
            }).sort_values('importance', ascending=False)
            
            return feature_importance_df.head(top_n)
        else:
            return pd.DataFrame()