"""
CarGurus scraper implementation
"""

import re
import json
from typing import Dict, List, Any, Optional
from urllib.parse import urlencode, urlparse
from bs4 import BeautifulSoup
from .base_scraper import BaseScraper

class CarGurusScraper(BaseScraper):
    """CarGurus vehicle listing scraper"""
    
    BASE_URL = "https://www.cargurus.com"
    SEARCH_URL = f"{BASE_URL}/Cars/inventorylisting/viewDetailsFilterViewInventoryListing.action"
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.results_per_page = 20
        
    def scrape_listings(self, search_params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Scrape CarGurus listings based on search parameters
        
        Args:
            search_params: Dict with keys like 'make', 'model', 'year_min', 'year_max', 
                          'price_min', 'price_max', 'mileage_max', 'zip_code', 'radius'
        """
        listings = []
        page = 1
        max_pages = search_params.get('max_pages', 10)
        
        while page <= max_pages:
            self.logger.info(f"Scraping CarGurus page {page}")
            
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
        
        self.logger.info(f"Total CarGurus listings scraped: {len(listings)}")
        return listings
    
    def _build_search_url(self, search_params: Dict[str, Any], page: int) -> str:
        """Build CarGurus search URL with parameters"""
        params = {
            'sourceContext': 'carGurusHomePageModel',
            'entitySelectingHelper.selectedEntity': 'c6',
            'zip': search_params.get('zip_code', '90210'),
            'distance': search_params.get('radius', 50),
            'startYear': search_params.get('year_min', 2010),
            'endYear': search_params.get('year_max', 2024),
            'minPrice': search_params.get('price_min', 0),
            'maxPrice': search_params.get('price_max', 100000),
            'maxMileage': search_params.get('mileage_max', 150000),
            'offset': (page - 1) * self.results_per_page,
            'maxResults': self.results_per_page,
            'sortBy': 'DISTANCE_ASC'
        }
        
        # Add make/model filters
        if 'make' in search_params:
            params['selectedMake'] = search_params['make']
        if 'model' in search_params:
            params['selectedModel'] = search_params['model']
        
        return f"{self.SEARCH_URL}?{urlencode(params)}"
    
    def _parse_search_results(self, page_source: str) -> List[Dict[str, Any]]:
        """Parse search results page"""
        soup = BeautifulSoup(page_source, 'html.parser')
        listings = []
        
        # Find listing containers
        listing_containers = soup.find_all('div', class_='cg-dealFinder-result-wrap')
        
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
            # Basic vehicle info
            title_elem = container.find('a', class_='cg-dealFinder-result-title')
            if not title_elem:
                return None
            
            title = title_elem.get_text(strip=True)
            listing_url = self.BASE_URL + title_elem.get('href', '')
            
            # Parse title for year, make, model
            year_match = re.search(r'(\d{4})', title)
            year = int(year_match.group(1)) if year_match else None
            
            # Make and model extraction
            title_parts = title.split()
            make = title_parts[1] if len(title_parts) > 1 else ''
            model = ' '.join(title_parts[2:4]) if len(title_parts) > 2 else ''
            
            # Price
            price_elem = container.find('span', class_='cg-dealFinder-result-price')
            price_text = price_elem.get_text(strip=True) if price_elem else ''
            price = self._parse_price(price_text)
            
            # Mileage
            mileage_elem = container.find('div', class_='cg-dealFinder-result-mileage')
            mileage_text = mileage_elem.get_text(strip=True) if mileage_elem else ''
            mileage = self._parse_mileage(mileage_text)
            
            # Location
            location_elem = container.find('div', class_='cg-dealFinder-result-distance')
            location = location_elem.get_text(strip=True) if location_elem else ''
            
            # Dealer info
            dealer_elem = container.find('div', class_='cg-dealFinder-result-dealer')
            dealer_name = dealer_elem.get_text(strip=True) if dealer_elem else ''
            
            # Image URL
            img_elem = container.find('img', class_='cg-dealFinder-result-image')
            image_url = img_elem.get('src', '') if img_elem else ''
            
            # Features/description
            features_elem = container.find('div', class_='cg-dealFinder-result-features')
            features = features_elem.get_text(strip=True).split('•') if features_elem else []
            features = [f.strip() for f in features if f.strip()]
            
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
        vin_elem = soup.find('span', string=re.compile(r'VIN:'))
        if vin_elem:
            details['vin'] = vin_elem.find_next('span').get_text(strip=True)
        
        # Engine
        engine_elem = soup.find('span', string=re.compile(r'Engine:'))
        if engine_elem:
            details['engine'] = engine_elem.find_next('span').get_text(strip=True)
        
        # Transmission
        transmission_elem = soup.find('span', string=re.compile(r'Transmission:'))
        if transmission_elem:
            details['transmission'] = transmission_elem.find_next('span').get_text(strip=True)
        
        # Fuel type
        fuel_elem = soup.find('span', string=re.compile(r'Fuel Type:'))
        if fuel_elem:
            details['fuel_type'] = fuel_elem.find_next('span').get_text(strip=True)
        
        # Body type
        body_elem = soup.find('span', string=re.compile(r'Body Type:'))
        if body_elem:
            details['body_type'] = body_elem.find_next('span').get_text(strip=True)
        
        # Colors
        exterior_color_elem = soup.find('span', string=re.compile(r'Exterior Color:'))
        if exterior_color_elem:
            details['exterior_color'] = exterior_color_elem.find_next('span').get_text(strip=True)
        
        interior_color_elem = soup.find('span', string=re.compile(r'Interior Color:'))
        if interior_color_elem:
            details['interior_color'] = interior_color_elem.find_next('span').get_text(strip=True)
        
        # Drivetrain
        drivetrain_elem = soup.find('span', string=re.compile(r'Drivetrain:'))
        if drivetrain_elem:
            details['drivetrain'] = drivetrain_elem.find_next('span').get_text(strip=True)
        
        return details
    
    def get_detailed_listing(self, listing_url: str) -> Optional[Dict[str, Any]]:
        """Get detailed information for a specific listing"""
        page_source = self.get_page_source(listing_url, use_selenium=True)
        if not page_source:
            return None
        
        return self.parse_listing(page_source)