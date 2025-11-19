"""
Database Configuration and Connection Management
Centralized database access for GreenStack application
"""

import logging
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

# Default database path
DEFAULT_DB_PATH = "greenstack.db"

# Global database path configuration
_db_path: Optional[str] = None


def set_db_path(path: str) -> None:
    """
    Set the global database path

    Args:
        path: Path to the SQLite database file
    """
    global _db_path
    _db_path = path
    logger.info("Database path set to: %s", path)


def get_db_path() -> str:
    """
    Get the configured database path

    Returns:
        Path to the SQLite database file
    """
    return _db_path if _db_path is not None else DEFAULT_DB_PATH


def get_connection(enable_foreign_keys: bool = True) -> sqlite3.Connection:
    """
    Get a database connection with recommended settings

    Args:
        enable_foreign_keys: Enable foreign key constraints (default: True)

    Returns:
        sqlite3.Connection object
    """
    db_path = get_db_path()
    conn = sqlite3.connect(db_path)

    # Enable foreign keys if requested
    if enable_foreign_keys:
        conn.execute("PRAGMA foreign_keys = ON")

    # Set row factory for dict-like access
    conn.row_factory = sqlite3.Row

    return conn


@contextmanager
def get_db_connection(enable_foreign_keys: bool = True):
    """
    Context manager for database connections

    Automatically handles connection cleanup and commit/rollback

    Usage:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM devices")
            ...

    Args:
        enable_foreign_keys: Enable foreign key constraints (default: True)

    Yields:
        sqlite3.Connection object
    """
    conn = get_connection(enable_foreign_keys)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def initialize_database(db_path: Optional[str] = None) -> None:
    """
    Initialize database connection settings

    Args:
        db_path: Optional custom database path
    """
    if db_path:
        set_db_path(db_path)

    # Verify database exists or can be created
    path = Path(get_db_path())
    if not path.exists():
        logger.warning("Database file does not exist: %s", path)
        logger.info("Database will be created on first connection")
    else:
        logger.info("Using existing database: %s", path)


# ============================================================================
# PostgreSQL Read/Write Split Support (Production)
# ============================================================================

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool, QueuePool

# Database URLs from environment
PRIMARY_DATABASE_URL = os.getenv("PRIMARY_DATABASE_URL", "sqlite:///./greenstack.db")
REPLICA_DATABASE_URL = os.getenv("REPLICA_DATABASE_URL", PRIMARY_DATABASE_URL)

# Enable read/write split
ENABLE_READ_REPLICA = os.getenv("ENABLE_READ_REPLICA", "false").lower() == "true"


class DatabaseManager:
    """
    Manages database connections with primary/replica split for production.
    Supports both SQLite (development) and PostgreSQL (production).
    """

    def __init__(self):
        self.primary_engine = None
        self.replica_engine = None
        self.PrimarySession = None
        self.ReplicaSession = None
        self._setup_connections()

    def _setup_connections(self):
        """Set up primary and replica database connections."""
        logger.info(f"Connecting to primary database")

        if "sqlite" in PRIMARY_DATABASE_URL:
            self.primary_engine = create_engine(
                PRIMARY_DATABASE_URL,
                connect_args={"check_same_thread": False},
                poolclass=NullPool
            )
        else:
            self.primary_engine = create_engine(
                PRIMARY_DATABASE_URL,
                poolclass=QueuePool,
                pool_size=10,
                max_overflow=20,
                pool_pre_ping=True
            )

        self.PrimarySession = sessionmaker(autocommit=False, autoflush=False, bind=self.primary_engine)

        # Replica setup
        if ENABLE_READ_REPLICA and REPLICA_DATABASE_URL != PRIMARY_DATABASE_URL:
            logger.info("Read/write split enabled")
            if "sqlite" in REPLICA_DATABASE_URL:
                self.replica_engine = create_engine(REPLICA_DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=NullPool)
            else:
                self.replica_engine = create_engine(REPLICA_DATABASE_URL, poolclass=QueuePool, pool_size=20, max_overflow=40, pool_pre_ping=True)
            self.ReplicaSession = sessionmaker(autocommit=False, autoflush=False, bind=self.replica_engine)
        else:
            self.replica_engine = self.primary_engine
            self.ReplicaSession = self.PrimarySession

    def get_write_session(self) -> Session:
        """Get session for write operations (primary database)."""
        return self.PrimarySession()

    def get_read_session(self) -> Session:
        """Get session for read operations (replica or primary)."""
        try:
            return self.ReplicaSession()
        except Exception as e:
            logger.warning(f"Replica unavailable, using primary: {e}")
            return self.PrimarySession()


# Global database manager
db_manager = DatabaseManager()


def get_db_write():
    """FastAPI dependency for write operations."""
    session = db_manager.get_write_session()
    try:
        yield session
    finally:
        session.close()


def get_db_read():
    """FastAPI dependency for read operations."""
    session = db_manager.get_read_session()
    try:
        yield session
    finally:
        session.close()
