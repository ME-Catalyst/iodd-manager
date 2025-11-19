"""
Background tasks package for GreenStack.

This package contains Celery tasks for asynchronous processing of:
- IODD file parsing and processing
- Code and flow generation (Node-RED, PDF)
- Configuration exports and documentation generation
"""

from src.celery_app import celery_app

__all__ = ["celery_app"]
