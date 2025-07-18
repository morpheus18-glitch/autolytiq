"""
AutoTrader scraper implementation
"""

import re
import json
from typing import Dict, List, Any, Optional
from urllib.parse import urlencode, urlparse
from bs4 import BeautifulSoup
from .base_scraper import BaseScraper

class AutoTraderScraper(BaseScraper):
    """AutoTrader vehicle listing scraper"""
    
    BASE_URL = "https://www.autotrader.com"
    SEARCH_URL = f"{BASE_URL}/cars-for-sale/all-cars"
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.results_per_page = 25
        
    def scrape_listings(self, search_params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Scrape AutoTrader listings based on search parameters
        
        Args:
            search_params: Dict with keys like 'make', 'model', 'year_min', 'year_max', 
                          'price_min', 'price_max', 'mileage_max', 'zip_code', 'radius'
        """
        listings = []
        page = 1
        max_pages = search_params.get('max_pages', 10)
        
        while page <= max_pages:
            self.logger.info(f"Scraping AutoTrader page {page}")
            
            # Build search URL
            search_url = self._build_search_url(search_params, page)
            
            # Get page content
            page_source = self.get_page_source(search_url, use_selenium=True)
            if not page_source:
                self.logger.warning(f"Failed to get page source for page {page}")
                break
            
            # Parse listings from page
            page_listings = self._parse_search_results(page_source)
            if not page_listings:
                self.logger.info(f"No listings found on page {page}, stopping")
                break
            
            listings.extend(page_listings)
            self.logger.info(f"Found {len(page_listings)} listings on page {page}")
            
            # Random delay between pages
            self._random_delay(3, 8)
            page += 1
        
        self.logger.info(f"Total AutoTrader listings scraped: {len(listings)}")
        return listings
    
    def _build_search_url(self, search_params: Dict[str, Any], page: int) -> str:
        """Build AutoTrader search URL with parameters"""
        params = {
            'zip': search_params.get('zip_code', '90210'),
            'searchRadius': search_params.get('radius', 50),
            'yearCodeMin': search_params.get('year_min', 2010),
            'yearCodeMax': search_params.get('year_max', 2024),
            'priceRange': f"{search_params.get('price_min', 0)},{search_params.get('price_max', 100000)}",
            'mileageRange': f"0,{search_params.get('mileage_max', 150000)}",
            'firstRecord': (page - 1) * self.results_per_page + 1,
            'numRecords': self.results_per_page,
            'sortBy': 'distanceASC'
        }
        
        # Add make/model filters
        if 'make' in search_params:
            params['makeCodeList'] = search_params['make'].upper()
        if 'model' in search_params:
            params['modelCodeList'] = search_params['model'].upper()
        
        return f"{self.SEARCH_URL}?{urlencode(params)}"
    
    def _parse_search_results(self, page_source: str) -> List[Dict[str, Any]]:
        """Parse search results page"""
        soup = BeautifulSoup(page_source, 'html.parser')
        listings = []
        
        # Find listing containers
        listing_containers = soup.find_all('div', {'data-cmp': 'inventoryListing'})
        
        for container in listing_containers:
            try:
                listing_data = self._extract_listing_data(container)
                if listing_data:
                    listings.append(self.normalize_vehicle_data(listing_data))
            except Exception as e:
                self.logger.error(f"Error parsing listing: {str(e)}")
                continue
        
        return listings
    
    def _extract_listing_data(self, container) -> Optional[Dict[str, Any]]:
        """Extract data from a single listing container"""
        try:
            # Basic vehicle info from title
            title_elem = container.find('h3', class_='heading-3')
            if not title_elem:
                return None
            
            title_link = title_elem.find('a')
            if not title_link:
                return None
            
            title = title_link.get_text(strip=True)
            listing_url = self.BASE_URL + title_link.get('href', '')
            
            # Parse title for year, make, model
            title_parts = title.split()
            year = None
            make = ''
            model = ''
            
            if title_parts:
                year_match = re.search(r'(\d{4})', title_parts[0])
                if year_match:
                    year = int(year_match.group(1))
                    if len(title_parts) > 1:
                        make = title_parts[1]
                        model = ' '.join(title_parts[2:4]) if len(title_parts) > 2 else ''
            
            # Price
            price_elem = container.find('span', class_='first-price')
            price_text = price_elem.get_text(strip=True) if price_elem else ''
            price = self._parse_price(price_text)
            
            # Mileage
            mileage_elem = container.find('div', class_='item-card-vehicle-mileage')
            mileage_text = mileage_elem.get_text(strip=True) if mileage_elem else ''
            mileage = self._parse_mileage(mileage_text)
            
            # Location
            location_elem = container.find('div', class_='item-card-seller-location')
            location = location_elem.get_text(strip=True) if location_elem else ''
            
            # Dealer info
            dealer_elem = container.find('div', class_='item-card-seller-name')
            dealer_name = dealer_elem.get_text(strip=True) if dealer_elem else ''
            
            # Image URL
            img_elem = container.find('img', class_='item-card-image')
            image_url = img_elem.get('src', '') if img_elem else ''
            
            # Basic features
            features_elem = container.find('div', class_='item-card-basic-info')
            features = []
            if features_elem:
                feature_items = features_elem.find_all('span')
                features = [item.get_text(strip=True) for item in feature_items]
            
            # Engine info
            engine_elem = container.find('div', class_='item-card-engine-info')
            engine = engine_elem.get_text(strip=True) if engine_elem else ''
            
            # Transmission
            transmission_elem = container.find('div', class_='item-card-transmission')
            transmission = transmission_elem.get_text(strip=True) if transmission_elem else ''
            
            # Fuel type
            fuel_elem = container.find('div', class_='item-card-fuel-type')
            fuel_type = fuel_elem.get_text(strip=True) if fuel_elem else ''
            
            return {
                'make': make,
                'model': model,
                'year': year,
                'price': price,
                'mileage': mileage,
                'location': location,
                'dealer_name': dealer_name,
                'listing_url': listing_url,
                'image_urls': [image_url] if image_url else [],
                'features': features,
                'engine': engine,
                'transmission': transmission,
                'fuel_type': fuel_type,
                'title': title
            }
            
        except Exception as e:
            self.logger.error(f"Error extracting listing data: {str(e)}")
            return None
    
    def parse_listing(self, listing_html: str) -> Dict[str, Any]:
        """Parse detailed listing page"""
        soup = BeautifulSoup(listing_html, 'html.parser')
        
        # Extract detailed information from listing page
        details = {}
        
        # VIN
        vin_elem = soup.find('span', string=re.compile(r'VIN'))
        if vin_elem:
            vin_container = vin_elem.find_parent()
            if vin_container:
                details['vin'] = vin_container.get_text(strip=True).replace('VIN:', '').strip()
        
        # Vehicle details section
        details_section = soup.find('section', class_='vehicle-details')
        if details_section:
            detail_items = details_section.find_all('div', class_='detail-item')
            for item in detail_items:
                label_elem = item.find('span', class_='label')
                value_elem = item.find('span', class_='value')
                
                if label_elem and value_elem:
                    label = label_elem.get_text(strip=True).lower()
                    value = value_elem.get_text(strip=True)
                    
                    if 'engine' in label:
                        details['engine'] = value
                    elif 'transmission' in label:
                        details['transmission'] = value
                    elif 'fuel' in label:
                        details['fuel_type'] = value
                    elif 'body' in label:
                        details['body_type'] = value
                    elif 'exterior' in label:
                        details['exterior_color'] = value
                    elif 'interior' in label:
                        details['interior_color'] = value
                    elif 'drivetrain' in label or 'drive' in label:
                        details['drivetrain'] = value
        
        # Features
        features_section = soup.find('section', class_='vehicle-features')
        if features_section:
            feature_items = features_section.find_all('li')
            details['features'] = [item.get_text(strip=True) for item in feature_items]
        
        return details
    
    def get_detailed_listing(self, listing_url: str) -> Optional[Dict[str, Any]]:
        """Get detailed information for a specific listing"""
        page_source = self.get_page_source(listing_url, use_selenium=True)
        if not page_source:
            return None
        
        return self.parse_listing(page_source)