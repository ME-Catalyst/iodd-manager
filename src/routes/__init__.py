"""
Greenstack API Routes

FastAPI route handlers for all API endpoints.
"""

from .admin_routes import router as admin_router
from .config_export_routes import router as config_export_router
from .eds_routes import router as eds_router
from .mqtt_routes import router as mqtt_router
from .search_routes import router as search_router
from .service_routes import router as service_router
from .theme_routes import router as theme_router
from .ticket_routes import router as ticket_router

__all__ = [
    "admin_router",
    "config_export_router",
    "eds_router",
    "mqtt_router",
    "search_router",
    "service_router",
    "theme_router",
    "ticket_router",
]
