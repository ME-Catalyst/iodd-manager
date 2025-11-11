# IODD Manager Configuration Guide

This guide explains how to configure IODD Manager using environment variables.

## Overview

IODD Manager uses environment variables for configuration, making it easy to:

- Deploy to different environments (development, staging, production)
- Keep secrets out of version control
- Override default settings without changing code
- Configure for different deployment scenarios

## Configuration Methods

### 1. Environment Variables

Set environment variables in your shell:

```bash
export API_PORT=9000
export DEBUG=false
python start.py
```

### 2. .env File (Recommended)

Create a `.env` file in the project root:

```bash
# Copy the example file
cp .env.example .env

# Edit with your settings
nano .env
```

The `.env` file is automatically loaded by `config.py` and ignored by git.

### 3. Command-Line Arguments (Limited)

Some settings can be overridden via command-line arguments:

```bash
python start.py --api-port 9000 --frontend-port 4000
```

## Configuration Reference

### Application Settings

#### ENVIRONMENT
- **Description**: Application environment
- **Values**: `development`, `production`, `testing`
- **Default**: `development`
- **Example**: `ENVIRONMENT=production`

#### APP_NAME
- **Description**: Application name
- **Default**: `IODD Manager`

#### DEBUG
- **Description**: Enable debug mode with detailed error messages
- **Values**: `true`, `false`
- **Default**: `true`
- **Example**: `DEBUG=false`

### API Server Settings

#### API_HOST
- **Description**: API server host
- **Values**: `0.0.0.0` (all interfaces), `127.0.0.1` (localhost only)
- **Default**: `0.0.0.0`
- **Production**: Set to `127.0.0.1` if behind a reverse proxy

#### API_PORT
- **Description**: API server port
- **Default**: `8000`
- **Example**: `API_PORT=9000`

#### API_RELOAD
- **Description**: Auto-reload on code changes (development only)
- **Values**: `true`, `false`
- **Default**: `true`
- **Production**: Set to `false`

#### API_WORKERS
- **Description**: Number of worker processes (production)
- **Default**: `1`
- **Production**: Set to number of CPU cores: `API_WORKERS=4`

### Frontend Settings

#### FRONTEND_HOST
- **Description**: Frontend server host
- **Default**: `0.0.0.0`

#### FRONTEND_PORT
- **Description**: Frontend server port
- **Default**: `3000`
- **Example**: `FRONTEND_PORT=4000`

#### AUTO_OPEN_BROWSER
- **Description**: Automatically open browser on startup
- **Values**: `true`, `false`
- **Default**: `true`
- **Headless**: Set to `false` for server deployments

### Database Settings

#### IODD_DATABASE_URL
- **Description**: Database connection URL
- **Format**: `sqlite:///path/to/database.db`
- **Default**: `sqlite:///iodd_manager.db`
- **Examples**:
  ```bash
  # Relative path
  IODD_DATABASE_URL=sqlite:///./data/iodd.db

  # Absolute path
  IODD_DATABASE_URL=sqlite:////var/lib/iodd-manager/database.db

  # In-memory (testing)
  IODD_DATABASE_URL=sqlite:///:memory:
  ```

#### AUTO_MIGRATE
- **Description**: Run database migrations on startup
- **Values**: `true`, `false`
- **Default**: `false`
- **Example**: `AUTO_MIGRATE=true`

### Storage Settings

#### IODD_STORAGE_DIR
- **Description**: Directory for storing uploaded IODD files
- **Default**: `./iodd_storage`
- **Example**: `IODD_STORAGE_DIR=/var/lib/iodd-manager/storage`

#### GENERATED_OUTPUT_DIR
- **Description**: Directory for generated adapter files
- **Default**: `./generated`
- **Example**: `GENERATED_OUTPUT_DIR=/var/lib/iodd-manager/output`

#### MAX_UPLOAD_SIZE
- **Description**: Maximum file upload size in bytes
- **Default**: `10485760` (10MB)
- **Example**: `MAX_UPLOAD_SIZE=52428800` (50MB)

### Security Settings

#### CORS_ORIGINS
- **Description**: Allowed CORS origins (comma-separated)
- **Default**: `http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173`
- **Production**: Specify your domain:
  ```bash
  CORS_ORIGINS=https://iodd.example.com,https://www.iodd.example.com
  ```

#### CORS_METHODS
- **Description**: Allowed HTTP methods (comma-separated)
- **Default**: `GET,POST,DELETE,OPTIONS`

#### CORS_CREDENTIALS
- **Description**: Allow credentials in CORS requests
- **Values**: `true`, `false`
- **Default**: `true`

#### SECRET_KEY
- **Description**: Secret key for JWT tokens (future use)
- **Generate**: `openssl rand -hex 32`
- **Example**: `SECRET_KEY=a1b2c3d4e5f6...`

### Logging Settings

#### LOG_LEVEL
- **Description**: Minimum log level to display
- **Values**: `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`
- **Default**: `INFO`
- **Development**: `LOG_LEVEL=DEBUG`
- **Production**: `LOG_LEVEL=WARNING`

#### LOG_FORMAT
- **Description**: Log output format
- **Values**: `text`, `json`
- **Default**: `text`
- **Production**: `json` for better parsing

#### LOG_TO_FILE
- **Description**: Write logs to file
- **Values**: `true`, `false`
- **Default**: `false`
- **Example**: `LOG_TO_FILE=true`

#### LOG_FILE_PATH
- **Description**: Path to log file (when LOG_TO_FILE=true)
- **Default**: `./logs/iodd_manager.log`
- **Example**: `LOG_FILE_PATH=/var/log/iodd-manager/app.log`

#### LOG_MAX_BYTES
- **Description**: Maximum log file size before rotation
- **Default**: `10485760` (10MB)

#### LOG_BACKUP_COUNT
- **Description**: Number of rotated log files to keep
- **Default**: `5`

### Development Settings

#### ENABLE_DOCS
- **Description**: Enable API documentation endpoints (/docs, /redoc)
- **Values**: `true`, `false`
- **Default**: `true`
- **Production**: Set to `false` to disable public API docs

#### SHOW_ERROR_DETAILS
- **Description**: Show detailed error messages in API responses
- **Values**: `true`, `false`
- **Default**: `true`
- **Production**: Set to `false` to hide stack traces

#### LOG_SQL_QUERIES
- **Description**: Log all SQL queries (development/debugging)
- **Values**: `true`, `false`
- **Default**: `false`

## Configuration Examples

### Development Environment

```bash
# .env for development
ENVIRONMENT=development
DEBUG=true
API_RELOAD=true
LOG_LEVEL=DEBUG
ENABLE_DOCS=true
SHOW_ERROR_DETAILS=true
AUTO_OPEN_BROWSER=true
```

### Production Environment

```bash
# .env for production
ENVIRONMENT=production
DEBUG=false
API_RELOAD=false
API_WORKERS=4
LOG_LEVEL=WARNING
LOG_TO_FILE=true
LOG_FILE_PATH=/var/log/iodd-manager/app.log
ENABLE_DOCS=false
SHOW_ERROR_DETAILS=false
AUTO_OPEN_BROWSER=false

# Use absolute paths
IODD_DATABASE_URL=sqlite:////var/lib/iodd-manager/database.db
IODD_STORAGE_DIR=/var/lib/iodd-manager/storage
GENERATED_OUTPUT_DIR=/var/lib/iodd-manager/output

# Security
CORS_ORIGINS=https://iodd.example.com
SECRET_KEY=your-production-secret-key-here
```

### Docker Environment

```bash
# .env for Docker
ENVIRONMENT=production
DEBUG=false
API_HOST=0.0.0.0
API_PORT=8000
FRONTEND_HOST=0.0.0.0
FRONTEND_PORT=3000

# Use container paths
IODD_DATABASE_URL=sqlite:////data/iodd_manager.db
IODD_STORAGE_DIR=/data/storage
GENERATED_OUTPUT_DIR=/data/generated

# Logging
LOG_TO_FILE=true
LOG_FILE_PATH=/data/logs/app.log
LOG_FORMAT=json
```

### Testing Environment

```bash
# .env.test for testing
ENVIRONMENT=testing
DEBUG=true
API_PORT=8001
FRONTEND_PORT=3001

# Use in-memory database for tests
IODD_DATABASE_URL=sqlite:///:memory:
TEST_DATABASE_URL=sqlite:///:memory:

# Skip slow tests
SKIP_SLOW_TESTS=true
```

## Configuration Validation

Check your configuration with:

```bash
python -c "import config; config.print_config()"
```

Output:
```
============================================================
  IODD Manager Configuration
============================================================
  environment         : development
  app_name            : IODD Manager
  app_version         : 2.0.0
  debug               : True
  api_host            : 0.0.0.0
  api_port            : 8000
  frontend_port       : 3000
  database_url        : sqlite:///iodd_manager.db
  cors_origins        : ['http://localhost:3000', ...]
  log_level           : INFO
  enable_docs         : True
============================================================
```

## Security Best Practices

### 1. Never Commit .env Files

The `.env` file should NEVER be committed to version control:

```bash
# .gitignore already includes this
.env
.env.local
.env.*.local
```

### 2. Use Strong Secret Keys

Generate secure random keys:

```bash
# Generate SECRET_KEY
openssl rand -hex 32

# Or use Python
python -c "import secrets; print(secrets.token_hex(32))"
```

### 3. Restrict CORS in Production

Don't use wildcards in production:

```bash
# Bad
CORS_ORIGINS=*

# Good
CORS_ORIGINS=https://iodd.example.com,https://www.iodd.example.com
```

### 4. Disable Debug Mode in Production

```bash
DEBUG=false
SHOW_ERROR_DETAILS=false
```

### 5. Use HTTPS in Production

```bash
CORS_ORIGINS=https://iodd.example.com  # Note: https, not http
```

## Troubleshooting

### Configuration Not Loading

**Problem**: Changes to .env file not taking effect

**Solutions**:
1. Restart the application
2. Check .env file location (must be in project root)
3. Verify no syntax errors in .env file
4. Check file permissions: `chmod 600 .env`

### Port Already in Use

**Problem**: `Address already in use` error

**Solutions**:
1. Change ports in .env:
   ```bash
   API_PORT=9000
   FRONTEND_PORT=4000
   ```
2. Kill existing processes:
   ```bash
   lsof -ti:8000 | xargs kill -9
   ```

### Database Permission Errors

**Problem**: Cannot write to database file

**Solutions**:
1. Check directory permissions
2. Use absolute path: `IODD_DATABASE_URL=sqlite:////var/lib/iodd-manager/db.sqlite`
3. Ensure parent directory exists

### CORS Errors

**Problem**: CORS errors in browser console

**Solutions**:
1. Add your frontend URL to CORS_ORIGINS:
   ```bash
   CORS_ORIGINS=http://localhost:3000,http://localhost:5173
   ```
2. Verify origin format (include protocol and port)
3. Check API is accessible from frontend

## Environment Variables Priority

Configuration is loaded in this order (last wins):

1. **Default values** (in `config.py`)
2. **System environment variables**
3. **.env file** (if present)
4. **Command-line arguments** (if supported)

Example:

```bash
# Default
API_PORT=8000

# .env file
API_PORT=9000  # Overrides default

# Environment variable
export API_PORT=10000  # Overrides .env

# Command line
python start.py --api-port 11000  # Overrides all
```

## Migration from Hardcoded Config

If upgrading from a version without .env support:

1. **Create .env file**:
   ```bash
   cp .env.example .env
   ```

2. **Transfer your settings**:
   - Port changes → `API_PORT`, `FRONTEND_PORT`
   - CORS settings → `CORS_ORIGINS`
   - Debug settings → `DEBUG`

3. **Test configuration**:
   ```bash
   python -c "import config; config.print_config()"
   ```

4. **Start application**:
   ```bash
   python start.py
   ```

## Further Reading

- [Python-dotenv Documentation](https://github.com/theskumar/python-dotenv)
- [12-Factor App Configuration](https://12factor.net/config)
- [FastAPI Settings Management](https://fastapi.tiangolo.com/advanced/settings/)

## Support

For configuration issues:

1. Check this documentation
2. Validate configuration: `python -c "import config; config.print_config()"`
3. Check logs for error messages
4. Open an issue on GitHub with configuration details (redact secrets!)
