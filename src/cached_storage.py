"""
Cached Storage Layer
Wraps StorageManager with Redis caching for frequently accessed queries
"""
import inspect
import logging
import os
from typing import Any, Dict, List, Optional

from src.cache_manager import get_cache_manager

logger = logging.getLogger(__name__)


class CachedStorageManager:
    """
    Wrapper around StorageManager with Redis caching

    Automatically caches and invalidates:
    - Device lists
    - Device details
    - Parameters
    - EDS file lists
    - Asset lists
    """

    def __init__(self, storage_manager, redis_url: Optional[str] = None):
        """
        Initialize cached storage

        Args:
            storage_manager: Underlying StorageManager instance
            redis_url: Redis connection URL (defaults to env var or localhost)
        """
        self.storage = storage_manager

        # Get Redis URL from environment or use default
        redis_url = redis_url or os.getenv('REDIS_URL', 'redis://localhost:6379/0')
        self.cache = get_cache_manager(redis_url)

        logger.info(f"Cached storage initialized (cache enabled: {self.cache.is_available()})")

    # ========================================================================
    # Device Operations with Caching
    # ========================================================================

    def list_devices(self) -> List[Dict[str, Any]]:
        """List all devices with caching"""
        cache_key = "all_devices"

        # Try cache first
        cached = self.cache.get("devices", cache_key)
        if cached is not None:
            return cached

        # Fetch from database
        devices = self.storage.list_devices()

        # Cache for 5 minutes
        self.cache.set(
            "devices",
            cache_key,
            devices,
            ttl=300,
            tags=["all_devices"]
        )

        return devices

    def get_device(self, device_id: int) -> Optional[Dict[str, Any]]:
        """Get device details with caching"""
        cache_key = f"device:{device_id}"

        # Try cache first
        cached = self.cache.get("devices", cache_key)
        if cached is not None:
            return cached

        # Fetch from database
        device = self.storage.get_device(device_id)

        if device:
            # Cache for 10 minutes
            self.cache.set(
                "devices",
                cache_key,
                device,
                ttl=600,
                tags=["all_devices", f"device:{device_id}"]
            )

        return device

    def save_device(self, device_data: Dict[str, Any], device_id: Optional[int] = None) -> int:
        """Save device and invalidate caches"""
        save_method = getattr(self.storage, "save_device")
        params = list(inspect.signature(save_method).parameters.values())

        if len(params) == 1:
            saved_id = save_method(device_data)
        else:
            saved_id = save_method(device_data, device_id)

        # Invalidate caches
        self.cache.invalidate_by_tag("all_devices")
        if device_id:
            self.cache.invalidate_by_tag(f"device:{device_id}")

        logger.info(f"Device {saved_id} saved, caches invalidated")

        return saved_id

    def delete_device(self, device_id: int):
        """Delete device and invalidate caches"""
        # Delete from database
        self.storage.delete_device(device_id)

        # Invalidate caches
        self.cache.invalidate_by_tag("all_devices")
        self.cache.invalidate_by_tag(f"device:{device_id}")

        logger.info(f"Device {device_id} deleted, caches invalidated")

    # ========================================================================
    # EDS File Operations with Caching
    # ========================================================================

    def list_eds_files(self) -> List[Dict[str, Any]]:
        """List all EDS files with caching"""
        cache_key = "all_eds_files"

        # Try cache first
        cached = self.cache.get("eds", cache_key)
        if cached is not None:
            return cached

        # Fetch from database
        eds_files = self.storage.list_eds_files()

        # Cache for 5 minutes
        self.cache.set(
            "eds",
            cache_key,
            eds_files,
            ttl=300,
            tags=["all_eds"]
        )

        return eds_files

    def get_eds_file(self, eds_id: int) -> Optional[Dict[str, Any]]:
        """Get EDS file details with caching"""
        cache_key = f"eds:{eds_id}"

        # Try cache first
        cached = self.cache.get("eds", cache_key)
        if cached is not None:
            return cached

        # Fetch from database
        eds_file = self.storage.get_eds_file(eds_id)

        if eds_file:
            # Cache for 10 minutes
            self.cache.set(
                "eds",
                cache_key,
                eds_file,
                ttl=600,
                tags=["all_eds", f"eds:{eds_id}"]
            )

        return eds_file

    def save_eds_file(self, eds_data: Dict[str, Any], eds_id: Optional[int] = None) -> int:
        """Save EDS file and invalidate caches"""
        # Save to database
        saved_id = self.storage.save_eds_file(eds_data, eds_id)

        # Invalidate caches
        self.cache.invalidate_by_tag("all_eds")
        if eds_id:
            self.cache.invalidate_by_tag(f"eds:{eds_id}")

        return saved_id

    def delete_eds_file(self, eds_id: int):
        """Delete EDS file and invalidate caches"""
        # Delete from database
        self.storage.delete_eds_file(eds_id)

        # Invalidate caches
        self.cache.invalidate_by_tag("all_eds")
        self.cache.invalidate_by_tag(f"eds:{eds_id}")

    # ========================================================================
    # Asset Operations with Caching
    # ========================================================================

    def get_device_assets(self, device_id: int) -> List[Dict[str, Any]]:
        """Get device assets with caching"""
        cache_key = f"assets:device:{device_id}"

        # Try cache first
        cached = self.cache.get("assets", cache_key)
        if cached is not None:
            return cached

        # Fetch from database
        assets = self.storage.get_device_assets(device_id)

        # Cache for 15 minutes (assets change less frequently)
        self.cache.set(
            "assets",
            cache_key,
            assets,
            ttl=900,
            tags=[f"device:{device_id}_assets"]
        )

        return assets

    # ========================================================================
    # Search Operations (No caching - results vary too much)
    # ========================================================================

    def search_devices(self, **criteria) -> List[Dict[str, Any]]:
        """Search devices (not cached due to varied criteria)"""
        return self.storage.search_devices(**criteria)

    # ========================================================================
    # Statistics (Short-term caching)
    # ========================================================================

    def get_statistics(self) -> Dict[str, Any]:
        """Get database statistics with short caching"""
        cache_key = "db_statistics"

        # Try cache first
        cached = self.cache.get("stats", cache_key)
        if cached is not None:
            return cached

        # Fetch from database
        stats = self.storage.get_statistics()

        # Cache for 1 minute only (stats change frequently)
        self.cache.set("stats", cache_key, stats, ttl=60)

        return stats

    # ========================================================================
    # Cache Management
    # ========================================================================

    def clear_cache(self, scope: Optional[str] = None):
        """
        Clear cache

        Args:
            scope: Optional scope to clear ('devices', 'eds', 'assets', or None for all)
        """
        if scope:
            self.cache.invalidate_namespace(scope)
            logger.info(f"Cache cleared for scope: {scope}")
        else:
            self.cache.clear_all()
            logger.info("All caches cleared")

    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        return self.cache.get_stats()

    # ========================================================================
    # Passthrough Methods (delegated to underlying storage)
    # ========================================================================

    def __getattr__(self, name):
        """
        Delegate any unknown methods to underlying storage manager
        This allows CachedStorageManager to be a drop-in replacement
        """
        return getattr(self.storage, name)


def create_cached_storage(storage_manager, redis_url: Optional[str] = None) -> CachedStorageManager:
    """
    Factory function to create cached storage

    Args:
        storage_manager: Underlying StorageManager instance
        redis_url: Optional Redis URL

    Returns:
        CachedStorageManager instance
    """
    return CachedStorageManager(storage_manager, redis_url)
