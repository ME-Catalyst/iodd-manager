"""
Base classes for storage operations

Provides abstract base class for all storage savers with common functionality
for database operations, error handling, and logging.
"""

from abc import ABC, abstractmethod
from typing import Any, Optional
import logging

logger = logging.getLogger(__name__)


class BaseSaver(ABC):
    """
    Abstract base class for all storage savers

    Provides common functionality for database operations including:
    - Query execution with error handling
    - Logging
    - Transaction management helpers
    """

    def __init__(self, cursor):
        """
        Initialize saver with database cursor

        Args:
            cursor: Database cursor (sqlite3 or psycopg2)
        """
        self.cursor = cursor

    @abstractmethod
    def save(self, device_id: int, data: Any) -> Optional[int]:
        """
        Save data to database

        Args:
            device_id: The device ID to associate data with
            data: The data to save (type varies by implementation)

        Returns:
            Optional[int]: ID of saved record if applicable, None otherwise
        """
        pass

    def _execute(self, query: str, params: tuple = ()):
        """
        Execute query with error handling and logging

        Args:
            query: SQL query string
            params: Query parameters tuple

        Raises:
            Exception: If database error occurs
        """
        try:
            self.cursor.execute(query, params)
        except Exception as e:
            logger.error(f"Database error in {self.__class__.__name__}: {e}")
            logger.error(f"Query: {query}")
            logger.error(f"Params: {params}")
            raise

    def _execute_many(self, query: str, params_list: list):
        """
        Execute query multiple times with different parameters

        Args:
            query: SQL query string
            params_list: List of parameter tuples

        Raises:
            Exception: If database error occurs
        """
        try:
            self.cursor.executemany(query, params_list)
        except Exception as e:
            logger.error(f"Database error in {self.__class__.__name__}: {e}")
            logger.error(f"Query: {query}")
            logger.error(f"Params count: {len(params_list)}")
            raise

    def _fetch_one(self):
        """Fetch one result from cursor"""
        return self.cursor.fetchone()

    def _fetch_all(self):
        """Fetch all results from cursor"""
        return self.cursor.fetchall()

    def _get_lastrowid(self):
        """Get the last inserted row ID"""
        return self.cursor.lastrowid

    def _delete_existing(self, table: str, device_id: int):
        """
        Delete existing records for a device

        Args:
            table: Table name to delete from
            device_id: Device ID to delete records for
        """
        query = f"DELETE FROM {table} WHERE device_id = ?"
        self._execute(query, (device_id,))
        logger.debug(f"Deleted existing {table} records for device {device_id}")
