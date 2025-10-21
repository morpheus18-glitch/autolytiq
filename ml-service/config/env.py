"""Compatibility wrapper to expose ML config under dash-cased path."""
from ml_service.config.env import ENV, Settings  # noqa: F401

__all__ = ['ENV', 'Settings']
