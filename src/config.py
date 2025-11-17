"""
Configuration management for Greenstack.

Loads configuration from environment variables with sensible defaults.
Uses python-dotenv to load from .env file if present.
"""

import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Load .env file if it exists
env_path = Path(__file__).parent / '.env'
if env_path.exists():
    load_dotenv(env_path)

# ============================================================================
# Application Settings
# ============================================================================

ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')
APP_NAME = os.getenv('APP_NAME', 'Greenstack')
APP_VERSION = os.getenv('APP_VERSION', '2.0.0')
DEBUG = os.getenv('DEBUG', 'true').lower() == 'true'

# ============================================================================
# API Server Settings
# ============================================================================

API_HOST = os.getenv('API_HOST', '0.0.0.0')
API_PORT = int(os.getenv('API_PORT', '8000'))
API_RELOAD = os.getenv('API_RELOAD', 'true').lower() == 'true'
API_WORKERS = int(os.getenv('API_WORKERS', '1'))

# ============================================================================
# Frontend Settings
# ============================================================================

FRONTEND_HOST = os.getenv('FRONTEND_HOST', '0.0.0.0')
FRONTEND_PORT = int(os.getenv('FRONTEND_PORT', '3000'))
AUTO_OPEN_BROWSER = os.getenv('AUTO_OPEN_BROWSER', 'true').lower() == 'true'

# ============================================================================
# Database Settings
# ============================================================================

DATABASE_URL = os.getenv('IODD_DATABASE_URL', 'sqlite:///greenstack.db')
AUTO_MIGRATE = os.getenv('AUTO_MIGRATE', 'false').lower() == 'true'

# ============================================================================
# Storage Settings
# ============================================================================

IODD_STORAGE_DIR = Path(os.getenv('IODD_STORAGE_DIR', './iodd_storage'))
GENERATED_OUTPUT_DIR = Path(os.getenv('GENERATED_OUTPUT_DIR', './generated'))
MAX_UPLOAD_SIZE = int(os.getenv('MAX_UPLOAD_SIZE', '10485760'))  # 10MB

# Ensure directories exist
IODD_STORAGE_DIR.mkdir(parents=True, exist_ok=True)
GENERATED_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ============================================================================
# Security Settings
# ============================================================================

CORS_ORIGINS_STR = os.getenv(
    'CORS_ORIGINS',
    'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173'
)
CORS_ORIGINS: List[str] = [origin.strip() for origin in CORS_ORIGINS_STR.split(',')]

CORS_METHODS_STR = os.getenv('CORS_METHODS', 'GET,POST,DELETE,OPTIONS')
CORS_METHODS: List[str] = [method.strip() for method in CORS_METHODS_STR.split(',')]

CORS_CREDENTIALS = os.getenv('CORS_CREDENTIALS', 'true').lower() == 'true'

SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
JWT_EXPIRATION = int(os.getenv('JWT_EXPIRATION', '60'))  # minutes
ENABLE_AUTH = os.getenv('ENABLE_AUTH', 'false').lower() == 'true'

# ============================================================================
# Logging Settings
# ============================================================================

LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO').upper()
LOG_FORMAT = os.getenv('LOG_FORMAT', 'text').lower()
LOG_TO_FILE = os.getenv('LOG_TO_FILE', 'false').lower() == 'true'
LOG_FILE_PATH = Path(os.getenv('LOG_FILE_PATH', './logs/greenstack.log'))
LOG_MAX_BYTES = int(os.getenv('LOG_MAX_BYTES', '10485760'))  # 10MB
LOG_BACKUP_COUNT = int(os.getenv('LOG_BACKUP_COUNT', '5'))

# Ensure log directory exists
if LOG_TO_FILE:
    LOG_FILE_PATH.parent.mkdir(parents=True, exist_ok=True)

# ============================================================================
# Adapter Generation Settings
# ============================================================================

DEFAULT_PLATFORM = os.getenv('DEFAULT_PLATFORM', 'node-red')
TEMPLATE_DIR = Path(os.getenv('TEMPLATE_DIR', './templates'))

# ============================================================================
# External Services (Optional)
# ============================================================================

REDIS_URL = os.getenv('REDIS_URL', None)
CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', None)
SENTRY_DSN = os.getenv('SENTRY_DSN', None)

# ============================================================================
# Development Settings
# ============================================================================

ENABLE_DOCS = os.getenv('ENABLE_DOCS', 'true').lower() == 'true'
SHOW_ERROR_DETAILS = os.getenv('SHOW_ERROR_DETAILS', 'true').lower() == 'true'
LOG_SQL_QUERIES = os.getenv('LOG_SQL_QUERIES', 'false').lower() == 'true'

# ============================================================================
# Performance Settings
# ============================================================================

REQUEST_TIMEOUT = int(os.getenv('REQUEST_TIMEOUT', '30'))
MAX_CONNECTIONS = int(os.getenv('MAX_CONNECTIONS', '100'))
ENABLE_COMPRESSION = os.getenv('ENABLE_COMPRESSION', 'true').lower() == 'true'

# ============================================================================
# Feature Flags
# ============================================================================

ENABLE_SIMULATION = os.getenv('ENABLE_SIMULATION', 'false').lower() == 'true'
ENABLE_ANALYTICS = os.getenv('ENABLE_ANALYTICS', 'true').lower() == 'true'
ENABLE_EXPORT = os.getenv('ENABLE_EXPORT', 'false').lower() == 'true'

# ============================================================================
# Testing Configuration
# ============================================================================

TEST_DATABASE_URL = os.getenv('TEST_DATABASE_URL', 'sqlite:///:memory:')
SKIP_SLOW_TESTS = os.getenv('SKIP_SLOW_TESTS', 'false').lower() == 'true'

# ============================================================================
# Configuration Summary
# ============================================================================

def get_config_summary() -> dict:
    """Return a summary of current configuration (safe for logging)."""
    return {
        'environment': ENVIRONMENT,
        'app_name': APP_NAME,
        'app_version': APP_VERSION,
        'debug': DEBUG,
        'api_host': API_HOST,
        'api_port': API_PORT,
        'frontend_port': FRONTEND_PORT,
        'database_url': DATABASE_URL.replace(os.path.expanduser('~'), '~'),  # Hide full path
        'cors_origins': CORS_ORIGINS,
        'log_level': LOG_LEVEL,
        'enable_docs': ENABLE_DOCS,
    }


def print_config():
    """Print configuration summary (for debugging)."""
    print("\n" + "=" * 60)
    print(f"  {APP_NAME} Configuration")
    print("=" * 60)
    config = get_config_summary()
    for key, value in config.items():
        print(f"  {key:20s}: {value}")
    print("=" * 60 + "\n")


# Validate configuration on import
if __name__ == '__main__':
    print_config()
