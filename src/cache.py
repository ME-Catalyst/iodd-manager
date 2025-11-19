"""
Redis caching layer for GreenStack.

This module provides caching functionality with:
- Decorator-based caching for functions
- TTL (Time To Live) management
- Cache invalidation strategies
- Performance monitoring
"""

import os
import json
import logging
import hashlib
import functools
from typing import Any, Callable, Optional, Union
from datetime import timedelta

import redis
from redis import Redis
from redis.exceptions import RedisError

logger = logging.getLogger(__name__)

# Redis connection configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
CACHE_ENABLED = os.getenv("CACHE_ENABLED", "true").lower() == "true"

# Default TTL values (in seconds)
DEFAULT_TTL = 300  # 5 minutes
DEVICE_LIST_TTL = 600  # 10 minutes
DEVICE_DETAIL_TTL = 1800  # 30 minutes
PARAMETER_LIST_TTL = 900  # 15 minutes
SEARCH_RESULTS_TTL = 300  # 5 minutes


class CacheManager:
    """
    Manages Redis cache connections and operations.
    """

    def __init__(self, redis_url: str = REDIS_URL):
        """
        Initialize cache manager with Redis connection.

        Args:
            redis_url: Redis connection URL
        """
        self.redis_url = redis_url
        self._client: Optional[Redis] = None
        self._connect()

    def _connect(self):
        """Establish connection to Redis."""
        try:
            self._client = redis.from_url(
                self.redis_url,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True,
            )
            # Test connection
            self._client.ping()
            logger.info(f"Successfully connected to Redis at {self.redis_url}")
        except RedisError as e:
            logger.warning(f"Failed to connect to Redis: {e}. Caching will be disabled.")
            self._client = None

    @property
    def client(self) -> Optional[Redis]:
        """Get Redis client, reconnecting if necessary."""
        if self._client is None:
            self._connect()
        return self._client

    @property
    def is_available(self) -> bool:
        """Check if Redis is available."""
        if not CACHE_ENABLED:
            return False
        try:
            return self.client is not None and self.client.ping()
        except RedisError:
            return False

    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache.

        Args:
            key: Cache key

        Returns:
            Cached value or None if not found
        """
        if not self.is_available:
            return None

        try:
            value = self.client.get(key)
            if value:
                logger.debug(f"Cache HIT: {key}")
                return json.loads(value)
            logger.debug(f"Cache MISS: {key}")
            return None
        except (RedisError, json.JSONDecodeError) as e:
            logger.error(f"Error getting cache key {key}: {e}")
            return None

    def set(self, key: str, value: Any, ttl: int = DEFAULT_TTL) -> bool:
        """
        Set value in cache with TTL.

        Args:
            key: Cache key
            value: Value to cache (must be JSON serializable)
            ttl: Time to live in seconds

        Returns:
            True if successful, False otherwise
        """
        if not self.is_available:
            return False

        try:
            serialized = json.dumps(value, default=str)
            self.client.setex(key, ttl, serialized)
            logger.debug(f"Cache SET: {key} (TTL: {ttl}s)")
            return True
        except (RedisError, TypeError) as e:
            logger.error(f"Error setting cache key {key}: {e}")
            return False

    def delete(self, key: str) -> bool:
        """
        Delete value from cache.

        Args:
            key: Cache key

        Returns:
            True if successful, False otherwise
        """
        if not self.is_available:
            return False

        try:
            self.client.delete(key)
            logger.debug(f"Cache DELETE: {key}")
            return True
        except RedisError as e:
            logger.error(f"Error deleting cache key {key}: {e}")
            return False

    def delete_pattern(self, pattern: str) -> int:
        """
        Delete all keys matching a pattern.

        Args:
            pattern: Key pattern (e.g., "device:*")

        Returns:
            Number of keys deleted
        """
        if not self.is_available:
            return 0

        try:
            keys = self.client.keys(pattern)
            if keys:
                deleted = self.client.delete(*keys)
                logger.debug(f"Cache DELETE pattern {pattern}: {deleted} keys")
                return deleted
            return 0
        except RedisError as e:
            logger.error(f"Error deleting cache pattern {pattern}: {e}")
            return 0

    def clear(self) -> bool:
        """
        Clear all cache entries.

        Returns:
            True if successful, False otherwise
        """
        if not self.is_available:
            return False

        try:
            self.client.flushdb()
            logger.info("Cache CLEARED")
            return True
        except RedisError as e:
            logger.error(f"Error clearing cache: {e}")
            return False

    def get_stats(self) -> dict:
        """
        Get cache statistics.

        Returns:
            Dictionary with cache stats
        """
        if not self.is_available:
            return {"available": False}

        try:
            info = self.client.info("stats")
            return {
                "available": True,
                "hits": info.get("keyspace_hits", 0),
                "misses": info.get("keyspace_misses", 0),
                "hit_rate": self._calculate_hit_rate(info),
                "total_keys": self.client.dbsize(),
            }
        except RedisError as e:
            logger.error(f"Error getting cache stats: {e}")
            return {"available": False, "error": str(e)}

    @staticmethod
    def _calculate_hit_rate(info: dict) -> float:
        """Calculate cache hit rate percentage."""
        hits = info.get("keyspace_hits", 0)
        misses = info.get("keyspace_misses", 0)
        total = hits + misses
        return (hits / total * 100) if total > 0 else 0.0


# Global cache manager instance
cache_manager = CacheManager()


def cache_key(*args, **kwargs) -> str:
    """
    Generate a cache key from function arguments.

    Args:
        *args: Positional arguments
        **kwargs: Keyword arguments

    Returns:
        MD5 hash of arguments as cache key
    """
    # Create a stable string representation
    key_parts = [str(arg) for arg in args]
    key_parts.extend(f"{k}={v}" for k, v in sorted(kwargs.items()))
    key_string = ":".join(key_parts)

    # Generate MD5 hash
    return hashlib.md5(key_string.encode()).hexdigest()


def cached(
    ttl: int = DEFAULT_TTL,
    key_prefix: Optional[str] = None,
    key_builder: Optional[Callable] = None
):
    """
    Decorator to cache function results in Redis.

    Args:
        ttl: Time to live in seconds
        key_prefix: Prefix for cache key (defaults to function name)
        key_builder: Custom function to build cache key from args/kwargs

    Returns:
        Decorated function with caching

    Example:
        @cached(ttl=600, key_prefix="device")
        def get_device(device_id: int):
            # Expensive operation
            return device_data
    """

    def decorator(func: Callable) -> Callable:
        prefix = key_prefix or func.__name__

        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Build cache key
            if key_builder:
                key = f"{prefix}:{key_builder(*args, **kwargs)}"
            else:
                key = f"{prefix}:{cache_key(*args, **kwargs)}"

            # Try to get from cache
            cached_result = cache_manager.get(key)
            if cached_result is not None:
                return cached_result

            # Execute function and cache result
            result = func(*args, **kwargs)
            cache_manager.set(key, result, ttl)

            return result

        # Add cache invalidation method
        def invalidate(*args, **kwargs):
            """Invalidate cache for specific arguments."""
            if key_builder:
                key = f"{prefix}:{key_builder(*args, **kwargs)}"
            else:
                key = f"{prefix}:{cache_key(*args, **kwargs)}"
            cache_manager.delete(key)

        def invalidate_all():
            """Invalidate all cache entries for this function."""
            cache_manager.delete_pattern(f"{prefix}:*")

        wrapper.invalidate = invalidate
        wrapper.invalidate_all = invalidate_all

        return wrapper

    return decorator


# Convenience invalidation functions
def invalidate_device_cache(device_id: int):
    """Invalidate all cache entries related to a device."""
    cache_manager.delete_pattern(f"*device*{device_id}*")


def invalidate_search_cache():
    """Invalidate all search result caches."""
    cache_manager.delete_pattern("search:*")


def invalidate_all_caches():
    """Invalidate all cache entries."""
    cache_manager.clear()
