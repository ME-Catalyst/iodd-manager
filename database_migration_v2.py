"""
Database migration script to add enhanced IODD fields
Run this once to upgrade existing database schema
"""

import sqlite3
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate_database(db_path='iodd_manager.db'):
    """Add new columns and tables for enhanced IODD support"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    logger.info("Starting database migration...")

    # Add new columns to parameters table
    parameters_columns = [
        ("dynamic", "INTEGER DEFAULT 0"),
        ("excluded_from_data_storage", "INTEGER DEFAULT 0"),
        ("modifies_other_variables", "INTEGER DEFAULT 0"),
        ("unit_code", "TEXT"),
        ("value_range_name", "TEXT"),
    ]

    for col_name, col_type in parameters_columns:
        try:
            cursor.execute(f"ALTER TABLE parameters ADD COLUMN {col_name} {col_type}")
            logger.info(f"Added column {col_name} to parameters table")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                logger.info(f"Column {col_name} already exists in parameters table")
            else:
                raise

    # Add event_type column to events table
    try:
        cursor.execute("ALTER TABLE events ADD COLUMN event_type TEXT")
        logger.info("Added event_type column to events table")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            logger.info("Column event_type already exists in events table")
        else:
            raise

    # Create parameter_single_values table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS parameter_single_values (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            parameter_id INTEGER,
            value TEXT,
            name TEXT,
            description TEXT,
            FOREIGN KEY (parameter_id) REFERENCES parameters (id)
        )
    """)
    logger.info("Created parameter_single_values table")

    # Create process_data_single_values table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS process_data_single_values (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            record_item_id INTEGER,
            value TEXT,
            name TEXT,
            description TEXT,
            FOREIGN KEY (record_item_id) REFERENCES process_data_record_items (id)
        )
    """)
    logger.info("Created process_data_single_values table")

    # Create document_info table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS document_info (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            device_id INTEGER UNIQUE,
            copyright TEXT,
            release_date TEXT,
            version TEXT,
            FOREIGN KEY (device_id) REFERENCES devices (id)
        )
    """)
    logger.info("Created document_info table")

    # Create device_features table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS device_features (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            device_id INTEGER UNIQUE,
            block_parameter INTEGER DEFAULT 0,
            data_storage INTEGER DEFAULT 0,
            profile_characteristic TEXT,
            access_locks_data_storage INTEGER DEFAULT 0,
            access_locks_local_parameterization INTEGER DEFAULT 0,
            access_locks_local_user_interface INTEGER DEFAULT 0,
            access_locks_parameter INTEGER DEFAULT 0,
            FOREIGN KEY (device_id) REFERENCES devices (id)
        )
    """)
    logger.info("Created device_features table")

    # Create communication_profile table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS communication_profile (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            device_id INTEGER UNIQUE,
            iolink_revision TEXT,
            compatible_with TEXT,
            bitrate TEXT,
            min_cycle_time INTEGER,
            msequence_capability INTEGER,
            sio_supported INTEGER DEFAULT 0,
            connection_type TEXT,
            wire_config TEXT,
            FOREIGN KEY (device_id) REFERENCES devices (id)
        )
    """)
    logger.info("Created communication_profile table")

    # Create ui_menus table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ui_menus (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            device_id INTEGER,
            menu_id TEXT,
            name TEXT,
            FOREIGN KEY (device_id) REFERENCES devices (id)
        )
    """)
    logger.info("Created ui_menus table")

    # Create ui_menu_items table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ui_menu_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            menu_id INTEGER,
            variable_id TEXT,
            record_item_ref TEXT,
            subindex INTEGER,
            access_right_restriction TEXT,
            display_format TEXT,
            unit_code TEXT,
            button_value TEXT,
            menu_ref TEXT,
            item_order INTEGER,
            FOREIGN KEY (menu_id) REFERENCES ui_menus (id)
        )
    """)
    logger.info("Created ui_menu_items table")

    # Create ui_menu_roles table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ui_menu_roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            device_id INTEGER,
            role_type TEXT,
            menu_type TEXT,
            menu_id TEXT,
            FOREIGN KEY (device_id) REFERENCES devices (id)
        )
    """)
    logger.info("Created ui_menu_roles table")

    conn.commit()
    conn.close()

    logger.info("Database migration completed successfully!")

if __name__ == "__main__":
    migrate_database()
