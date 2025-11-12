# Configuration Guide

IODD Manager uses environment variables for configuration, allowing flexible deployment across different environments.

## Configuration File

All configuration is managed through the `.env` file in the project root.

### Initial Setup

```bash
# Copy the example configuration
cp .env.example .env

# Edit with your preferred settings
nano .env  # or vim, code, etc.
```

## Configuration Categories

### Application Settings

```bash
# Application identity
APP_NAME=IODD Manager
APP_VERSION=2.0.0
ENVIRONMENT=development  # development, production, testing

# Enable debug mode (verbose logging, auto-reload)
DEBUG=true
```

**Options:**

- `ENVIRONMENT`: Controls behavior across the application
  - `development`: Auto-reload, verbose logging, debug mode
  - `production`: Optimized, error logging only, no auto-reload
  - `testing`: Test database, mock services
- `DEBUG`: Enable/disable debug features (`true` or `false`)

### API Server Settings

```bash
# API server configuration
API_HOST=0.0.0.0  # Listen on all interfaces
API_PORT=8000     # API server port
API_RELOAD=true   # Auto-reload on code changes (dev only)
API_WORKERS=4     # Number of worker processes (production)
```

**Production Recommendations:**

```bash
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=false
API_WORKERS=4  # Adjust based on CPU cores
```

**Development Recommendations:**

```bash
API_HOST=127.0.0.1  # Localhost only
API_PORT=8000
API_RELOAD=true
API_WORKERS=1
```

### Frontend Settings

```bash
# Frontend development server
FRONTEND_PORT=3000
VITE_API_BASE_URL=http://localhost:8000/api

# Browser auto-open
AUTO_OPEN_BROWSER=true
```

**Options:**

- `FRONTEND_PORT`: Port for Vite dev server (default: 3000)
- `VITE_API_BASE_URL`: API endpoint for frontend requests
- `AUTO_OPEN_BROWSER`: Automatically open browser on startup

### Database Configuration

```bash
# SQLite database location
IODD_DATABASE_URL=sqlite:///./iodd_manager.db

# PostgreSQL example (future support)
# IODD_DATABASE_URL=postgresql://user:pass@localhost/iodd_manager

# Database pool settings
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10
DB_POOL_TIMEOUT=30
```

**Database URL Formats:**

```bash
# SQLite (relative path)
sqlite:///./iodd_manager.db

# SQLite (absolute path)
sqlite:////data/iodd_manager.db

# PostgreSQL (when supported)
postgresql://username:password@host:port/database

# MySQL (when supported)
mysql://username:password@host:port/database
```

### Storage Settings

```bash
# File storage directories
IODD_STORAGE_DIR=./iodd_storage
GENERATED_OUTPUT_DIR=./generated

# Storage limits
MAX_UPLOAD_SIZE=10485760  # 10MB in bytes
```

**Directory Structure:**

```
iodd_storage/          # Uploaded IODD files
├── vendor_12345/
│   └── device_67890.xml
generated/             # Generated adapters
├── nodered_12345_67890.json
└── custom_12345_67890.py
```

**Size Limits:**

```bash
MAX_UPLOAD_SIZE=10485760   # 10MB (default)
MAX_UPLOAD_SIZE=52428800   # 50MB
MAX_UPLOAD_SIZE=104857600  # 100MB
```

### Security Settings

```bash
# CORS configuration
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE
CORS_HEADERS=*

# API documentation access
ENABLE_DOCS=true
```

**Production CORS:**

```bash
# Specific origins only
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE
CORS_HEADERS=Content-Type,Authorization
```

**Development CORS:**

```bash
# Localhost + common dev ports
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000
```

### Logging Settings

```bash
# Logging configuration
LOG_LEVEL=INFO          # DEBUG, INFO, WARNING, ERROR, CRITICAL
LOG_TO_FILE=false       # Write logs to file
LOG_FILE_PATH=./logs/app.log
LOG_MAX_BYTES=10485760  # 10MB
LOG_BACKUP_COUNT=5      # Keep 5 backup files
LOG_FORMAT=json         # json or text
```

**Log Levels:**

- `DEBUG`: Detailed information for diagnosing problems
- `INFO`: Confirmation that things are working as expected
- `WARNING`: Something unexpected happened, but still working
- `ERROR`: Serious problem, some functionality not working
- `CRITICAL`: Critical error, application may not be able to continue

**Production Logging:**

```bash
LOG_LEVEL=INFO
LOG_TO_FILE=true
LOG_FILE_PATH=/var/log/iodd-manager/app.log
LOG_FORMAT=json
```

**Development Logging:**

```bash
LOG_LEVEL=DEBUG
LOG_TO_FILE=false
LOG_FORMAT=text
```

### Performance Settings

```bash
# Performance tuning
ENABLE_COMPRESSION=true
COMPRESSION_LEVEL=6
CACHE_ENABLED=true
CACHE_TTL=3600  # 1 hour in seconds
```

**Options:**

- `ENABLE_COMPRESSION`: Gzip compression for API responses
- `COMPRESSION_LEVEL`: 1-9, higher = better compression but slower
- `CACHE_ENABLED`: Enable in-memory caching
- `CACHE_TTL`: Cache time-to-live in seconds

### Feature Flags

```bash
# Feature toggles
ENABLE_3D_VISUALIZATION=true
ENABLE_ADAPTER_GENERATION=true
ENABLE_BATCH_IMPORT=true
ENABLE_EXPORT=true
```

## Environment-Specific Configurations

### Development Environment

Complete `.env` for local development:

```bash
# Application
ENVIRONMENT=development
DEBUG=true

# API
API_HOST=127.0.0.1
API_PORT=8000
API_RELOAD=true

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

# Security
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
ENABLE_DOCS=true
```

### Production Environment

Complete `.env` for production deployment:

```bash
# Application
ENVIRONMENT=production
DEBUG=false

# API
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=false
API_WORKERS=4

# Database
IODD_DATABASE_URL=sqlite:////data/iodd_manager.db

# Storage
IODD_STORAGE_DIR=/data/storage
GENERATED_OUTPUT_DIR=/data/generated

# Logging
LOG_LEVEL=INFO
LOG_TO_FILE=true
LOG_FILE_PATH=/data/logs/app.log
LOG_FORMAT=json

# Security
CORS_ORIGINS=https://yourdomain.com
ENABLE_DOCS=false

# Performance
ENABLE_COMPRESSION=true
CACHE_ENABLED=true
```

### Docker Environment

Configuration for Docker deployment:

```bash
# Application
ENVIRONMENT=production
DEBUG=false

# API (bind to all interfaces in container)
API_HOST=0.0.0.0
API_PORT=8000

# Database (use volume mount)
IODD_DATABASE_URL=sqlite:////data/iodd_manager.db

# Storage (use volume mounts)
IODD_STORAGE_DIR=/data/storage
GENERATED_OUTPUT_DIR=/data/generated

# Logging
LOG_LEVEL=INFO
LOG_TO_FILE=true
LOG_FILE_PATH=/data/logs/app.log

# Auto-migrate database on startup
AUTO_MIGRATE=true
```

### Testing Environment

Configuration for running tests:

```bash
# Application
ENVIRONMENT=testing
DEBUG=true

# Database (use test database)
IODD_DATABASE_URL=sqlite:///./test_iodd_manager.db

# Storage (use test directories)
IODD_STORAGE_DIR=./test_storage
GENERATED_OUTPUT_DIR=./test_generated

# Logging (minimal for tests)
LOG_LEVEL=WARNING
LOG_TO_FILE=false

# Disable features not needed in tests
AUTO_OPEN_BROWSER=false
ENABLE_DOCS=false
```

## Configuration Validation

### Verify Configuration

Use the built-in configuration validator:

```python
# Run configuration check
python -c "from config import print_config; print_config()"
```

**Output:**

```
=== IODD Manager Configuration ===
Environment: development
Debug Mode: True
API Host: 127.0.0.1
API Port: 8000
Database: sqlite:///./iodd_manager.db
Storage Directory: ./iodd_storage
Generated Output Directory: ./generated
Log Level: DEBUG
CORS Origins: ['http://localhost:3000', 'http://localhost:5173']
===================================
```

### Common Configuration Issues

**Issue: API not accessible from other machines**

```bash
# Change from localhost to all interfaces
API_HOST=0.0.0.0  # Not 127.0.0.1
```

**Issue: CORS errors in browser console**

```bash
# Add your frontend URL to CORS origins
CORS_ORIGINS=http://localhost:3000,http://your-frontend-url.com
```

**Issue: Database file not found**

```bash
# Use absolute path
IODD_DATABASE_URL=sqlite:////full/path/to/iodd_manager.db

# Or ensure relative path is correct
IODD_DATABASE_URL=sqlite:///./iodd_manager.db
```

**Issue: File upload fails**

```bash
# Increase upload size limit
MAX_UPLOAD_SIZE=52428800  # 50MB

# Check storage directory exists and is writable
mkdir -p iodd_storage generated
chmod 755 iodd_storage generated
```

## Advanced Configuration

### Custom Logging Format

Create `logging.conf`:

```ini
[loggers]
keys=root,iodd

[handlers]
keys=console,file

[formatters]
keys=detailed

[logger_root]
level=INFO
handlers=console

[logger_iodd]
level=DEBUG
handlers=console,file
qualname=iodd
propagate=0

[handler_console]
class=StreamHandler
level=DEBUG
formatter=detailed
args=(sys.stdout,)

[handler_file]
class=handlers.RotatingFileHandler
level=INFO
formatter=detailed
args=('logs/app.log', 'a', 10485760, 5)

[formatter_detailed]
format=%(asctime)s - %(name)s - %(levelname)s - %(message)s
datefmt=%Y-%m-%d %H:%M:%S
```

Use in `.env`:

```bash
LOGGING_CONFIG=./logging.conf
```

### Environment Variable Priority

Configuration sources in order of priority (highest to lowest):

1. **Environment variables** (set in shell)
2. **`.env` file** (project root)
3. **Default values** (in `config.py`)

Example:

```bash
# Set in shell (highest priority)
export API_PORT=9000

# Set in .env file (medium priority)
echo "API_PORT=8000" >> .env

# Default in config.py (lowest priority)
API_PORT = int(os.getenv('API_PORT', '7000'))

# Result: API will run on port 9000
```

## Security Best Practices

### Sensitive Configuration

Never commit sensitive data to `.env`:

```bash
# ❌ Bad - committed to git
.env

# ✅ Good - in .gitignore
.env
.env.local
.env.*.local
```

### Production Checklist

Before deploying to production:

- [ ] Set `ENVIRONMENT=production`
- [ ] Set `DEBUG=false`
- [ ] Restrict `CORS_ORIGINS` to specific domains
- [ ] Set `ENABLE_DOCS=false` (or restrict access)
- [ ] Use absolute paths for database and storage
- [ ] Configure proper logging with rotation
- [ ] Set appropriate `API_WORKERS` for your hardware
- [ ] Enable compression: `ENABLE_COMPRESSION=true`
- [ ] Review and adjust `MAX_UPLOAD_SIZE`

## Next Steps

- **[Docker Deployment](docker.md)** - Deploy with Docker
- **[Production Deployment](../deployment/production.md)** - Deploy to production
- **[Environment Variables](../deployment/environment.md)** - Advanced environment configuration
- **[Monitoring](../deployment/monitoring.md)** - Monitor your deployment
