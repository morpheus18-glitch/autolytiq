"""
Vehicle listing deduplication utilities
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Set, Tuple
from difflib import SequenceMatcher
import re
import logging
from datetime import datetime

class VehicleDeduplicator:
    """Handles deduplication of vehicle listings"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Similarity thresholds
        self.vin_threshold = 0.9
        self.title_threshold = 0.8
        self.price_threshold = 0.1  # 10% price difference
        self.mileage_threshold = 0.1  # 10% mileage difference
        
        # Weights for similarity scoring
        self.similarity_weights = {
            'vin': 0.4,
            'title': 0.2,
            'price': 0.15,
            'mileage': 0.1,
            'dealer': 0.1,
            'location': 0.05
        }
    
    def deduplicate_listings(self, listings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate listings from a list"""
        if not listings:
            return []
        
        self.logger.info(f"Starting deduplication of {len(listings)} listings")
        
        # Convert to DataFrame for easier processing
        df = pd.DataFrame(listings)
        
        # Clean and normalize data
        df = self._normalize_data(df)
        
        # Find duplicates
        duplicates = self._find_duplicates(df)
        
        # Remove duplicates, keeping the best version
        unique_listings = self._remove_duplicates(df, duplicates)
        
        self.logger.info(f"Deduplication complete: {len(unique_listings)} unique listings")
        return unique_listings.to_dict('records')
    
    def _normalize_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Normalize data for better comparison"""
        df = df.copy()
        
        # Normalize VIN
        df['vin_normalized'] = df['vin'].fillna('').str.upper().str.replace(r'[^A-Z0-9]', '', regex=True)
        
        # Normalize make/model
        df['make_normalized'] = df['make'].fillna('').str.upper().str.strip()
        df['model_normalized'] = df['model'].fillna('').str.upper().str.strip()
        
        # Create normalized title
        df['title_normalized'] = (df['year'].astype(str) + ' ' + 
                                 df['make_normalized'] + ' ' + 
                                 df['model_normalized']).str.strip()
        
        # Normalize dealer names
        df['dealer_normalized'] = df['dealer_name'].fillna('').str.upper().str.strip()
        
        # Normalize location
        df['location_normalized'] = df['location'].fillna('').str.upper().str.strip()
        
        # Fill missing numerical values
        df['price'] = pd.to_numeric(df['price'], errors='coerce')
        df['mileage'] = pd.to_numeric(df['mileage'], errors='coerce')
        df['year'] = pd.to_numeric(df['year'], errors='coerce')
        
        return df
    
    def _find_duplicates(self, df: pd.DataFrame) -> List[List[int]]:
        """Find groups of duplicate listings"""
        duplicate_groups = []
        processed_indices = set()
        
        for i, row in df.iterrows():
            if i in processed_indices:
                continue
            
            # Find similar listings
            similar_indices = [i]
            
            for j, other_row in df.iterrows():
                if i >= j or j in processed_indices:
                    continue
                
                similarity = self._calculate_similarity(row, other_row)
                if similarity > 0.7:  # Similarity threshold
                    similar_indices.append(j)
            
            if len(similar_indices) > 1:
                duplicate_groups.append(similar_indices)
                processed_indices.update(similar_indices)
        
        return duplicate_groups
    
    def _calculate_similarity(self, row1: pd.Series, row2: pd.Series) -> float:
        """Calculate similarity score between two listings"""
        scores = {}
        
        # VIN similarity
        vin1 = row1.get('vin_normalized', '')
        vin2 = row2.get('vin_normalized', '')
        if vin1 and vin2:
            scores['vin'] = self._string_similarity(vin1, vin2)
        else:
            scores['vin'] = 0
        
        # Title similarity
        title1 = row1.get('title_normalized', '')
        title2 = row2.get('title_normalized', '')
        scores['title'] = self._string_similarity(title1, title2)
        
        # Price similarity
        price1 = row1.get('price', 0)
        price2 = row2.get('price', 0)
        if price1 and price2:
            scores['price'] = self._numeric_similarity(price1, price2, self.price_threshold)
        else:
            scores['price'] = 0
        
        # Mileage similarity
        mileage1 = row1.get('mileage', 0)
        mileage2 = row2.get('mileage', 0)
        if mileage1 and mileage2:
            scores['mileage'] = self._numeric_similarity(mileage1, mileage2, self.mileage_threshold)
        else:
            scores['mileage'] = 0
        
        # Dealer similarity
        dealer1 = row1.get('dealer_normalized', '')
        dealer2 = row2.get('dealer_normalized', '')
        scores['dealer'] = self._string_similarity(dealer1, dealer2)
        
        # Location similarity
        location1 = row1.get('location_normalized', '')
        location2 = row2.get('location_normalized', '')
        scores['location'] = self._string_similarity(location1, location2)
        
        # Calculate weighted score
        total_score = 0
        total_weight = 0
        
        for key, score in scores.items():
            if key in self.similarity_weights:
                weight = self.similarity_weights[key]
                total_score += score * weight
                total_weight += weight
        
        return total_score / total_weight if total_weight > 0 else 0
    
    def _string_similarity(self, s1: str, s2: str) -> float:
        """Calculate similarity between two strings"""
        if not s1 or not s2:
            return 0
        
        return SequenceMatcher(None, s1, s2).ratio()
    
    def _numeric_similarity(self, n1: float, n2: float, threshold: float) -> float:
        """Calculate similarity between two numeric values"""
        if n1 == 0 or n2 == 0:
            return 0
        
        diff = abs(n1 - n2) / max(n1, n2)
        return max(0, 1 - (diff / threshold))
    
    def _remove_duplicates(self, df: pd.DataFrame, duplicate_groups: List[List[int]]) -> pd.DataFrame:
        """Remove duplicates, keeping the best version from each group"""
        indices_to_keep = set(range(len(df)))
        
        for group in duplicate_groups:
            # Find the best listing in the group
            best_index = self._find_best_listing(df, group)
            
            # Remove all others from the group
            for index in group:
                if index != best_index:
                    indices_to_keep.discard(index)
        
        return df.iloc[list(indices_to_keep)]
    
    def _find_best_listing(self, df: pd.DataFrame, group: List[int]) -> int:
        """Find the best listing from a group of duplicates"""
        best_index = group[0]
        best_score = 0
        
        for index in group:
            row = df.iloc[index]
            score = self._calculate_listing_quality_score(row)
            
            if score > best_score:
                best_score = score
                best_index = index
        
        return best_index
    
    def _calculate_listing_quality_score(self, row: pd.Series) -> float:
        """Calculate quality score for a listing"""
        score = 0
        
        # Complete VIN gets high score
        vin = row.get('vin_normalized', '')
        if len(vin) == 17:  # Standard VIN length
            score += 3
        elif len(vin) > 10:
            score += 1
        
        # Complete price information
        price = row.get('price', 0)
        if price > 0:
            score += 2
        
        # Complete mileage information
        mileage = row.get('mileage', 0)
        if mileage > 0:
            score += 2
        
        # Number of features
        features = row.get('features', [])
        if isinstance(features, list):
            score += min(len(features) * 0.1, 1)
        
        # Image URLs
        image_urls = row.get('image_urls', [])
        if isinstance(image_urls, list):
            score += min(len(image_urls) * 0.2, 1)
        
        # Dealer information
        dealer = row.get('dealer_name', '')
        if dealer:
            score += 1
        
        # Location information
        location = row.get('location', '')
        if location:
            score += 1
        
        # Recent scraping gets slight preference
        scraped_at = row.get('scraped_at', 0)
        if scraped_at:
            # More recent gets higher score
            now = datetime.now().timestamp()
            age_hours = (now - scraped_at) / 3600
            if age_hours < 24:
                score += 0.5
        
        return score
    
    def find_potential_duplicates_in_db(self, new_listings: List[Dict[str, Any]], 
                                      existing_listings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Find potential duplicates between new and existing listings"""
        if not new_listings or not existing_listings:
            return []
        
        new_df = pd.DataFrame(new_listings)
        existing_df = pd.DataFrame(existing_listings)
        
        # Normalize both datasets
        new_df = self._normalize_data(new_df)
        existing_df = self._normalize_data(existing_df)
        
        potential_duplicates = []
        
        for i, new_row in new_df.iterrows():
            for j, existing_row in existing_df.iterrows():
                similarity = self._calculate_similarity(new_row, existing_row)
                
                if similarity > 0.7:
                    potential_duplicates.append({
                        'new_listing_index': i,
                        'existing_listing_index': j,
                        'similarity_score': similarity,
                        'new_listing': new_listings[i],
                        'existing_listing': existing_listings[j]
                    })
        
        return potential_duplicates
    
    def get_duplicate_statistics(self, listings: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Get statistics about duplicates in the dataset"""
        if not listings:
            return {'total_listings': 0, 'unique_listings': 0, 'duplicate_count': 0}
        
        df = pd.DataFrame(listings)
        df = self._normalize_data(df)
        
        duplicate_groups = self._find_duplicates(df)
        
        total_duplicates = sum(len(group) - 1 for group in duplicate_groups)
        unique_listings = len(listings) - total_duplicates
        
        # VIN-based duplicates
        vin_duplicates = df['vin_normalized'].value_counts()
        vin_duplicates = vin_duplicates[vin_duplicates > 1]
        
        # Title-based duplicates
        title_duplicates = df['title_normalized'].value_counts()
        title_duplicates = title_duplicates[title_duplicates > 1]
        
        return {
            'total_listings': len(listings),
            'unique_listings': unique_listings,
            'duplicate_count': total_duplicates,
            'duplicate_groups': len(duplicate_groups),
            'vin_duplicates': len(vin_duplicates),
            'title_duplicates': len(title_duplicates),
            'deduplication_rate': (total_duplicates / len(listings)) * 100 if listings else 0
        }
    
    def validate_vin(self, vin: str) -> Dict[str, Any]:
        """Validate VIN format and extract information"""
        if not vin:
            return {'valid': False, 'error': 'Empty VIN'}
        
        # Remove spaces and convert to uppercase
        vin = vin.replace(' ', '').upper()
        
        # Check length
        if len(vin) != 17:
            return {'valid': False, 'error': f'Invalid VIN length: {len(vin)} (should be 17)'}
        
        # Check for invalid characters
        invalid_chars = set(vin) - set('ABCDEFGHJKLMNPRSTUVWXYZ0123456789')
        if invalid_chars:
            return {'valid': False, 'error': f'Invalid characters: {invalid_chars}'}
        
        # Basic VIN structure validation
        try:
            # Extract basic information
            country = vin[0]
            manufacturer = vin[0:3]
            year_code = vin[9]
            
            # Year mapping (simplified)
            year_map = {
                'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014,
                'F': 2015, 'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019,
                'L': 2020, 'M': 2021, 'N': 2022, 'P': 2023, 'R': 2024
            }
            
            year = year_map.get(year_code, None)
            
            return {
                'valid': True,
                'vin': vin,
                'country_code': country,
                'manufacturer_code': manufacturer,
                'year': year,
                'year_code': year_code
            }
            
        except Exception as e:
            return {'valid': False, 'error': f'VIN validation error: {str(e)}'}
    
    def merge_duplicate_listings(self, listings: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Merge information from duplicate listings"""
        if len(listings) <= 1:
            return listings[0] if listings else {}
        
        # Start with the best quality listing
        df = pd.DataFrame(listings)
        df = self._normalize_data(df)
        
        best_index = self._find_best_listing(df, list(range(len(listings))))
        merged = listings[best_index].copy()
        
        # Merge additional information from other listings
        for i, listing in enumerate(listings):
            if i == best_index:
                continue
            
            # Merge features
            existing_features = set(merged.get('features', []))
            new_features = set(listing.get('features', []))
            merged['features'] = list(existing_features | new_features)
            
            # Merge image URLs
            existing_images = set(merged.get('image_urls', []))
            new_images = set(listing.get('image_urls', []))
            merged['image_urls'] = list(existing_images | new_images)
            
            # Use more complete information where available
            for field in ['vin', 'engine', 'transmission', 'drivetrain', 'fuel_type', 
                         'body_type', 'exterior_color', 'interior_color']:
                if not merged.get(field) and listing.get(field):
                    merged[field] = listing[field]
        
        # Add metadata about the merge
        merged['merged_from'] = len(listings)
        merged['merge_timestamp'] = datetime.now().isoformat()
        
        return merged