"""
Vehicle scraper module
"""

from .base_scraper import BaseScraper
from .cargurus import CarGurusScraper
from .autotrader import AutoTraderScraper

__all__ = ['BaseScraper', 'CarGurusScraper', 'AutoTraderScraper']