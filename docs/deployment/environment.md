# Environment Configuration

Managing environment-specific configuration for different deployment scenarios.

## Configuration Overview

IODD Manager uses environment variables for configuration. See the complete **[Configuration Guide](../getting-started/configuration.md)** for all available options.

## Environment Profiles

### Development

**File**: `.env.development`

```bash
# Application
ENVIRONMENT=development
DEBUG=true

# API
API_HOST=127.0.0.1
API_PORT=8000
API_RELOAD=true
API_WORKERS=1

# Frontend
FRONTEND_PORT=3000
AUTO_OPEN_BROWSER=true

# Database
IODD_DATABASE_URL=sqlite:///./iodd_manager.db

# Storage
IODD_STORAGE_DIR=./iodd_storage
GENERATED_OUTPUT_DIR=./generated

# Logging
LOG_LEVEL=DEBUG
LOG_TO_FILE=false

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000

# Features
ENABLE_DOCS=true
ENABLE_3D_VISUALIZATION=true
```

### Production

**File**: `.env.production`

```bash
# Application
ENVIRONMENT=production
DEBUG=false

# API
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=false
API_WORKERS=4

# Database (absolute path)
IODD_DATABASE_URL=sqlite:////opt/iodd-manager/data/iodd_manager.db

# Storage (absolute paths)
IODD_STORAGE_DIR=/opt/iodd-manager/data/storage
GENERATED_OUTPUT_DIR=/opt/iodd-manager/data/generated

# Logging
LOG_LEVEL=INFO
LOG_TO_FILE=true
LOG_FILE_PATH=/opt/iodd-manager/data/logs/app.log
LOG_FORMAT=json
LOG_MAX_BYTES=10485760
LOG_BACKUP_COUNT=5

# Security
CORS_ORIGINS=https://yourdomain.com,https://api.yourdomain.com
ENABLE_DOCS=false

# Performance
ENABLE_COMPRESSION=true
COMPRESSION_LEVEL=6
CACHE_ENABLED=true
CACHE_TTL=3600

# Features
ENABLE_3D_VISUALIZATION=false  # Reduce client load
```

### Docker

**File**: `.env.docker`

```bash
# Application
ENVIRONMENT=production
DEBUG=false

# API (bind to all interfaces in container)
API_HOST=0.0.0.0
API_PORT=8000

# Database (container path)
IODD_DATABASE_URL=sqlite:////data/iodd_manager.db

# Storage (container paths)
IODD_STORAGE_DIR=/data/storage
GENERATED_OUTPUT_DIR=/data/generated

# Logging
LOG_LEVEL=INFO
LOG_TO_FILE=true
LOG_FILE_PATH=/data/logs/app.log
LOG_FORMAT=json

# Database migrations
AUTO_MIGRATE=true
```

### Testing/CI

**File**: `.env.test`

```bash
# Application
ENVIRONMENT=testing
DEBUG=false

# Database (separate test database)
IODD_DATABASE_URL=sqlite:///./test_iodd_manager.db

# Storage (test directories)
IODD_STORAGE_DIR=./test_storage
GENERATED_OUTPUT_DIR=./test_generated

# Logging (minimal for tests)
LOG_LEVEL=WARNING
LOG_TO_FILE=false

# Features (disable browser opening)
AUTO_OPEN_BROWSER=false
ENABLE_DOCS=false
```

## Environment Selection

### Method 1: .env File

```bash
# Copy appropriate template
cp .env.production .env

# Start application (uses .env)
python api.py
```

### Method 2: Environment-Specific Files

```bash
# Use specific environment file
export ENV_FILE=.env.production
python -c "from dotenv import load_dotenv; load_dotenv('${ENV_FILE}'); import api"
```

### Method 3: Environment Variables

```bash
# Set variables directly
export ENVIRONMENT=production
export DEBUG=false
export API_PORT=8000

# Start application
python api.py
```

### Method 4: Docker Environment

```yaml
# docker-compose.yml
services:
  iodd-manager:
    environment:
      - ENVIRONMENT=production
      - DEBUG=false
      - API_PORT=8000
```

Or use env file:

```yaml
services:
  iodd-manager:
    env_file:
      - .env.production
```

## Secrets Management

### Never Commit Secrets

```bash
# .gitignore includes:
.env
.env.local
.env.*.local
*.key
*.pem
secrets/
```

### Production Secrets

**Option 1: Environment Variables (Recommended)**

```bash
# Set via systemd service
[Service]
Environment="DB_PASSWORD=secret123"
Environment="API_KEY=key123"
```

**Option 2: Docker Secrets**

```yaml
# docker-compose.yml
services:
  iodd-manager:
    secrets:
      - db_password
      - api_key

secrets:
  db_password:
    file: ./secrets/db_password.txt
  api_key:
    file: ./secrets/api_key.txt
```

**Option 3: Kubernetes Secrets**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: iodd-manager-secrets
type: Opaque
data:
  db_password: c2VjcmV0MTIz  # base64 encoded
  api_key: a2V5MTIz
---
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      containers:
      - name: iodd-manager
        envFrom:
        - secretRef:
            name: iodd-manager-secrets
```

**Option 4: HashiCorp Vault**

```python
# config.py
import hvac

client = hvac.Client(url='https://vault.example.com')
secrets = client.secrets.kv.v2.read_secret_version(path='iodd-manager')
DB_PASSWORD = secrets['data']['data']['db_password']
```

## Configuration Validation

### Startup Validation

```python
# config.py
def validate_config():
    """Validate configuration at startup"""
    errors = []

    # Check required settings
    if not IODD_DATABASE_URL:
        errors.append("IODD_DATABASE_URL is required")

    if ENVIRONMENT == 'production':
        if DEBUG:
            errors.append("DEBUG must be false in production")
        if '*' in CORS_ORIGINS:
            errors.append("CORS_ORIGINS must not include '*' in production")
        if ENABLE_DOCS:
            errors.append("Consider disabling ENABLE_DOCS in production")

    # Check paths exist
    for path in [IODD_STORAGE_DIR, GENERATED_OUTPUT_DIR]:
        if not os.path.exists(path):
            errors.append(f"Path does not exist: {path}")

    if errors:
        for error in errors:
            logging.error(f"Configuration error: {error}")
        sys.exit(1)

# Run validation at startup
validate_config()
```

### Health Check Endpoint

```python
# api.py
@app.get("/api/health")
def health_check():
    """Health check with configuration status"""
    return {
        "status": "healthy",
        "version": config.APP_VERSION,
        "environment": config.ENVIRONMENT,
        "database": "connected" if check_db() else "disconnected",
        "config": {
            "debug": config.DEBUG,
            "docs_enabled": config.ENABLE_DOCS,
            "cors_origins": len(config.CORS_ORIGINS)
        }
    }
```

## Environment-Specific Behavior

### Conditional Features

```python
# Enable features based on environment
if config.ENVIRONMENT == 'development':
    # Enable debug toolbar
    app.add_middleware(DebugToolbarMiddleware)

if config.ENABLE_DOCS and config.ENVIRONMENT != 'production':
    # Only enable docs in non-production
    app.openapi_url = "/openapi.json"
else:
    app.openapi_url = None
```

### Logging Configuration

```python
import logging

# Configure based on environment
if config.ENVIRONMENT == 'production':
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(config.LOG_FILE_PATH),
            logging.StreamHandler()
        ]
    )
elif config.ENVIRONMENT == 'development':
    logging.basicConfig(
        level=logging.DEBUG,
        format='%(levelname)s - %(message)s'
    )
```

## Configuration Templates

### Template Generation Script

```python
#!/usr/bin/env python3
"""Generate environment configuration templates"""

def generate_env_template(environment: str):
    """Generate .env template for specific environment"""
    templates = {
        'development': {
            'ENVIRONMENT': 'development',
            'DEBUG': 'true',
            'API_PORT': '8000',
            'LOG_LEVEL': 'DEBUG',
        },
        'production': {
            'ENVIRONMENT': 'production',
            'DEBUG': 'false',
            'API_PORT': '8000',
            'LOG_LEVEL': 'INFO',
        }
    }

    config = templates.get(environment)
    if not config:
        raise ValueError(f"Unknown environment: {environment}")

    with open(f".env.{environment}", 'w') as f:
        for key, value in config.items():
            f.write(f"{key}={value}\n")

    print(f"Generated .env.{environment}")

if __name__ == "__main__":
    import sys
    generate_env_template(sys.argv[1] if len(sys.argv) > 1 else 'development')
```

## Best Practices

1. **Never commit `.env` files** containing secrets
2. **Use environment-specific files** (.env.production, .env.development)
3. **Validate configuration** at startup
4. **Document all variables** in .env.example
5. **Use strong defaults** for development
6. **Require explicit configuration** for production
7. **Fail fast** on invalid configuration
8. **Log configuration** (safely, without secrets)

## Troubleshooting

### Configuration Not Loading

```python
# Debug configuration loading
from dotenv import load_dotenv
import os

print("Loading .env from:", os.path.join(os.getcwd(), '.env'))
load_dotenv(verbose=True)
print("ENVIRONMENT =", os.getenv('ENVIRONMENT'))
```

### Wrong Environment

```bash
# Check which environment is active
python -c "from config import ENVIRONMENT; print(ENVIRONMENT)"

# Check all loaded config
python -c "from config import print_config; print_config()"
```

### Missing Variables

```bash
# Check if variable is set
echo $API_PORT

# Set temporarily
export API_PORT=9000
python api.py
```

## Next Steps

- **[Configuration Guide](../getting-started/configuration.md)** - Complete configuration reference
- **[Production Deployment](production.md)** - Production deployment guide
- **[Docker Deployment](docker.md)** - Container configuration
