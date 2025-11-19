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
APP_VERSION = os.getenv('APP_VERSION', '2.0.1')
DEBUG = os.getenv('DEBUG', 'true').lower() == 'true'

# ============================================================================
# API Server Settings
# ============================================================================

API_HOST = os.getenv('API_HOST', '0.0.0.0')
API_PORT = int(os.getenv('API_PORT', '8000'))
API_RELOAD = os.getenv('API_RELOAD', 'true').lower() == 'true'
API_WORKERS = int(os.getenv('API_WORKERS', '4'))  # Enable parallel processing

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

DEFAULT_CORS_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
]

_raw_cors_origins = os.getenv('CORS_ORIGINS', '').strip()
if not _raw_cors_origins:
    CORS_ORIGINS: List[str] = DEFAULT_CORS_ORIGINS
else:
    CORS_ORIGINS = [origin.strip() for origin in _raw_cors_origins.split(',') if origin.strip()]
    if not CORS_ORIGINS:
        CORS_ORIGINS = DEFAULT_CORS_ORIGINS

_cors_allow_all_default = 'false' if ENVIRONMENT.lower() == 'production' else 'true'
CORS_ALLOW_ALL = os.getenv('CORS_ALLOW_ALL', _cors_allow_all_default).lower() == 'true'

CORS_METHODS_STR = os.getenv('CORS_METHODS', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
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


# ============================================================================
# Security Validation
# ============================================================================

WEAK_PASSWORDS = [
    'changeme123',
    'postgres123',
    'redis123',
    'mqtt123',
    'admin123changeme',
    'my-super-secret-auth-token',
    'change-this-secret',
    'dev-secret-key-change-in-production',
    '',  # Empty passwords
]

def validate_production_security():
    """
    Validate that production environment has strong passwords configured.
    Raises SystemExit if weak/missing passwords detected in production.
    """
    if ENVIRONMENT.lower() != 'production':
        # Only enforce in production
        return

    print("\n" + "=" * 60)
    print("  🔒 PRODUCTION SECURITY VALIDATION")
    print("=" * 60)

    errors = []

    # Check SECRET_KEY
    secret_key = os.getenv('SECRET_KEY', '')
    if not secret_key or secret_key in WEAK_PASSWORDS or len(secret_key) < 32:
        errors.append("❌ SECRET_KEY is weak or missing! Generate with: openssl rand -hex 32")

    # Check PostgreSQL password
    postgres_pass = os.getenv('POSTGRES_PASSWORD', '')
    if postgres_pass in WEAK_PASSWORDS:
        errors.append("❌ POSTGRES_PASSWORD is weak or missing! Generate with: openssl rand -base64 32")

    # Check Redis password
    redis_pass = os.getenv('REDIS_PASSWORD', '')
    if redis_pass in WEAK_PASSWORDS:
        errors.append("❌ REDIS_PASSWORD is weak or missing! Generate with: openssl rand -base64 32")

    # Check MQTT password
    mqtt_pass = os.getenv('MQTT_PASSWORD', '')
    if mqtt_pass in WEAK_PASSWORDS:
        errors.append("❌ MQTT_PASSWORD is weak or missing! Generate with: openssl rand -base64 32")

    # Check InfluxDB token
    influx_token = os.getenv('INFLUXDB_TOKEN', '')
    if influx_token in WEAK_PASSWORDS:
        errors.append("❌ INFLUXDB_TOKEN is weak or missing! Generate with: openssl rand -base64 32")

    # Check Grafana password
    grafana_pass = os.getenv('GRAFANA_ADMIN_PASSWORD', '')
    if grafana_pass in WEAK_PASSWORDS:
        errors.append("❌ GRAFANA_ADMIN_PASSWORD is weak or missing! Generate with: openssl rand -base64 32")

    # Check Node-RED secret
    nodered_secret = os.getenv('NODERED_CREDENTIAL_SECRET', '')
    if nodered_secret in WEAK_PASSWORDS:
        errors.append("❌ NODERED_CREDENTIAL_SECRET is weak or missing! Generate with: openssl rand -hex 32")

    if errors:
        print("\n🚨 CRITICAL SECURITY ISSUES DETECTED:\n")
        for error in errors:
            print(f"  {error}")
        print("\n💡 SOLUTION:")
        print("  1. Run: ./scripts/generate-secrets.sh > .env.production")
        print("  2. Set: chmod 600 .env.production")
        print("  3. Update docker-compose to use .env.production")
        print("\n⛔ APPLICATION STARTUP BLOCKED FOR SECURITY")
        print("=" * 60 + "\n")
        raise SystemExit(1)

    print("  ✅ All security credentials validated")
    print("=" * 60 + "\n")


# Validate configuration on import
if __name__ == '__main__':
    print_config()
