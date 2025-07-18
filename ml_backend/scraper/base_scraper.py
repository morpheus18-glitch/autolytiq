"""
Base scraper class with anti-bot detection and headless browser capabilities
"""

import time
import random
import logging
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException
from fake_useragent import UserAgent
import undetected_chromedriver as uc
import requests
from bs4 import BeautifulSoup

class BaseScraper(ABC):
    """Base class for vehicle listing scrapers"""
    
    def __init__(self, headless: bool = True, use_undetected: bool = True):
        self.headless = headless
        self.use_undetected = use_undetected
        self.driver = None
        self.session = requests.Session()
        self.ua = UserAgent()
        self.logger = logging.getLogger(self.__class__.__name__)
        
        # Setup session with rotating headers
        self.session.headers.update({
            'User-Agent': self.ua.random,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
    
    def _setup_driver(self) -> webdriver.Chrome:
        """Setup Chrome driver with anti-detection measures"""
        if self.use_undetected:
            options = uc.ChromeOptions()
        else:
            options = Options()
        
        # Stealth options
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--disable-features=VizDisplayCompositor')
        options.add_argument('--disable-extensions')
        options.add_argument('--disable-plugins')
        options.add_argument('--disable-images')
        options.add_argument('--disable-javascript')
        options.add_argument('--disable-css')
        options.add_argument(f'--user-agent={self.ua.random}')
        
        if self.headless:
            options.add_argument('--headless')
        
        # Additional stealth measures
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        options.add_argument("--disable-blink-features=AutomationControlled")
        
        if self.use_undetected:
            driver = uc.Chrome(options=options)
        else:
            driver = webdriver.Chrome(options=options)
            
        # Execute stealth scripts
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        driver.execute_cdp_cmd('Network.setUserAgentOverride', {
            "userAgent": self.ua.random
        })
        
        return driver
    
    def _random_delay(self, min_seconds: float = 1.0, max_seconds: float = 3.0):
        """Add random delay to avoid detection"""
        time.sleep(random.uniform(min_seconds, max_seconds))
    
    def _rotate_headers(self):
        """Rotate user agent and headers"""
        self.session.headers.update({
            'User-Agent': self.ua.random
        })
    
    def get_page_source(self, url: str, use_selenium: bool = False) -> Optional[str]:
        """Get page source with fallback options"""
        try:
            if use_selenium:
                if not self.driver:
                    self.driver = self._setup_driver()
                
                self.driver.get(url)
                self._random_delay(2, 5)
                return self.driver.page_source
            else:
                self._rotate_headers()
                response = self.session.get(url, timeout=10)
                response.raise_for_status()
                return response.text
                
        except Exception as e:
            self.logger.error(f"Error fetching {url}: {str(e)}")
            return None
    
    def close(self):
        """Clean up resources"""
        if self.driver:
            self.driver.quit()
            self.driver = None
    
    @abstractmethod
    def scrape_listings(self, search_params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Scrape vehicle listings based on search parameters"""
        pass
    
    @abstractmethod
    def parse_listing(self, listing_html: str) -> Dict[str, Any]:
        """Parse individual listing HTML into structured data"""
        pass
    
    def normalize_vehicle_data(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize vehicle data to standard format"""
        normalized = {
            'make': raw_data.get('make', '').strip().title(),
            'model': raw_data.get('model', '').strip().title(),
            'year': self._parse_year(raw_data.get('year')),
            'mileage': self._parse_mileage(raw_data.get('mileage')),
            'price': self._parse_price(raw_data.get('price')),
            'location': raw_data.get('location', '').strip(),
            'vin': raw_data.get('vin', '').strip().upper(),
            'transmission': raw_data.get('transmission', '').strip().lower(),
            'fuel_type': raw_data.get('fuel_type', '').strip().lower(),
            'body_type': raw_data.get('body_type', '').strip().lower(),
            'exterior_color': raw_data.get('exterior_color', '').strip().lower(),
            'interior_color': raw_data.get('interior_color', '').strip().lower(),
            'engine': raw_data.get('engine', '').strip(),
            'drivetrain': raw_data.get('drivetrain', '').strip().lower(),
            'features': raw_data.get('features', []),
            'dealer_name': raw_data.get('dealer_name', '').strip(),
            'listing_url': raw_data.get('listing_url', ''),
            'image_urls': raw_data.get('image_urls', []),
            'scraped_at': time.time(),
            'source': self.__class__.__name__
        }
        
        return normalized
    
    def _parse_year(self, year_str: Any) -> Optional[int]:
        """Parse year from string"""
        if not year_str:
            return None
        try:
            year = int(str(year_str).strip())
            if 1900 <= year <= 2025:
                return year
        except (ValueError, TypeError):
            pass
        return None
    
    def _parse_mileage(self, mileage_str: Any) -> Optional[int]:
        """Parse mileage from string"""
        if not mileage_str:
            return None
        try:
            # Remove commas and extract numbers
            mileage = ''.join(filter(str.isdigit, str(mileage_str)))
            if mileage:
                return int(mileage)
        except (ValueError, TypeError):
            pass
        return None
    
    def _parse_price(self, price_str: Any) -> Optional[float]:
        """Parse price from string"""
        if not price_str:
            return None
        try:
            # Remove currency symbols and commas
            price = ''.join(filter(lambda x: x.isdigit() or x == '.', str(price_str)))
            if price:
                return float(price)
        except (ValueError, TypeError):
            pass
        return None