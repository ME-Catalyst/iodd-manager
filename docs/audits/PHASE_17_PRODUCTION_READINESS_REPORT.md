# PHASE 17: PRODUCTION READINESS AUDIT REPORT

## Executive Summary

**Assessment Date:** November 18, 2025
**GreenStack Version:** 2.0.1
**Audit Phase:** 17 of 18
**Overall Production Readiness Score:** 52/100

### Status Overview

The GreenStack IODD Manager is **NOT production-ready** in its current state. While the application has **solid core functionality** and a well-designed architecture, critical gaps exist in **deployment automation, security hardening, disaster recovery, monitoring, and operational procedures**. The system requires **substantial hardening and documentation** before it can safely handle production workloads.

### Score Breakdown

| Category | Score | Status |
|----------|-------|--------|
| Deployment Automation | 45/100 | ❌ Manual processes, no runbook |
| Configuration Management | 65/100 | ⚠️ Good .env setup, weak defaults |
| Security Hardening | 38/100 | ❌ Critical vulnerabilities remain |
| Backup & Disaster Recovery | 20/100 | ❌ No procedures exist |
| Monitoring & Alerting | 25/100 | ❌ Minimal observability |
| Load Testing & Capacity | 10/100 | ❌ Not performed |
| Documentation | 60/100 | ⚠️ Good user docs, no ops docs |
| Database Operations | 70/100 | ⚠️ Migrations work, no rollback plan |
| SSL/TLS Configuration | 30/100 | ❌ Development certificates only |
| High Availability | 15/100 | ❌ Single point of failure |
| Troubleshooting Support | 40/100 | ❌ No runbook or playbooks |

### Critical Blockers for Production

**SHOWSTOPPER ISSUES:**
1. ❌ **No SSL/TLS certificates for production** - HTTP only
2. ❌ **No backup procedures** - Data loss guaranteed on failure
3. ❌ **Weak default credentials** hardcoded throughout
4. ❌ **No monitoring or alerting** - Blind operation
5. ❌ **No disaster recovery plan** - No recovery procedures
6. ❌ **No load testing** - Unknown capacity limits
7. ❌ **No deployment runbook** - Manual, error-prone deployment
8. ❌ **No health monitoring dashboard** - Can't see system status

**HIGH PRIORITY GAPS:**
9. ⚠️ No rate limiting on public endpoints
10. ⚠️ No CDN for static assets
11. ⚠️ No graceful shutdown handling
12. ⚠️ No rolling deployment strategy
13. ⚠️ No database connection pooling limits
14. ⚠️ No request timeout configuration
15. ⚠️ No CORS policy review for production

---

## 1. Deployment Checklist & Runbook

### 1.1 Pre-Deployment Requirements

**Infrastructure Prerequisites:**
- [ ] Linux server with Docker 24.0+ and Docker Compose 2.20+
- [ ] Minimum 4 CPU cores, 8GB RAM, 50GB SSD
- [ ] PostgreSQL 16 (can use Docker or external)
- [ ] Valid domain name with DNS configured
- [ ] SSL/TLS certificates (Let's Encrypt or commercial)
- [ ] Firewall configured (ports 80, 443 only exposed)
- [ ] Non-root user for running services
- [ ] SSH access with key-based authentication
- [ ] Backup storage (S3, Azure Blob, or NFS)

**Security Prerequisites:**
- [ ] Strong passwords generated for all services
- [ ] Secrets stored in environment files (.env with 600 permissions)
- [ ] API keys generated and documented
- [ ] Database user created with minimal permissions
- [ ] Application firewall rules configured
- [ ] Intrusion detection system configured (optional)
- [ ] Log aggregation service configured
- [ ] Security scanning completed

**Monitoring Prerequisites:**
- [ ] Monitoring service configured (Prometheus/Grafana or cloud)
- [ ] Alerting channels configured (email, Slack, PagerDuty)
- [ ] Log storage configured (30+ days retention)
- [ ] Uptime monitoring configured (external)
- [ ] Error tracking service configured (Sentry or similar)

### 1.2 Initial Deployment Runbook

**MISSING: This runbook does not currently exist in the codebase.**

**Recommended Deployment Steps:**

**Step 1: Prepare Production Server**
```bash
# 1. Create application user
sudo useradd -m -s /bin/bash greenstack
sudo usermod -aG docker greenstack

# 2. Clone repository
sudo -u greenstack git clone https://github.com/your-org/greenstack.git /opt/greenstack
cd /opt/greenstack

# 3. Checkout stable version
sudo -u greenstack git checkout v2.0.1

# 4. Set proper permissions
sudo chown -R greenstack:greenstack /opt/greenstack
```

**Step 2: Configure Environment**
```bash
# 1. Copy and configure environment file
sudo -u greenstack cp .env.example .env.production
sudo -u greenstack nano .env.production

# 2. Set file permissions (CRITICAL)
sudo chmod 600 .env.production

# 3. Validate configuration
# ❌ NO VALIDATION SCRIPT EXISTS - MANUAL REVIEW REQUIRED
```

**Required .env.production Changes:**
```bash
# Application
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO

# Security (MUST CHANGE FROM DEFAULTS)
SECRET_KEY=<generate with: openssl rand -hex 32>
JWT_SECRET_KEY=<generate with: openssl rand -hex 32>
ADMIN_PASSWORD=<strong unique password>

# Database
POSTGRES_USER=greenstack_prod
POSTGRES_PASSWORD=<strong unique password>
POSTGRES_DB=greenstack_production
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}

# MQTT (if using IoT features)
MQTT_PASSWORD=<strong unique password>
MQTT_TLS_ENABLED=true

# Redis
REDIS_PASSWORD=<strong unique password>

# InfluxDB
INFLUXDB_TOKEN=<generate strong token>
INFLUXDB_ADMIN_PASSWORD=<strong unique password>

# Grafana
GRAFANA_ADMIN_PASSWORD=<strong unique password>

# Node-RED
NODERED_CREDENTIAL_SECRET=<generate with: openssl rand -hex 32>

# External URLs
FRONTEND_URL=https://greenstack.yourdomain.com
API_URL=https://greenstack.yourdomain.com/api

# Email (for notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=notifications@yourdomain.com
SMTP_PASSWORD=<email password>
SMTP_FROM=GreenStack <noreply@yourdomain.com>

# Backups
BACKUP_ENABLED=true
BACKUP_S3_BUCKET=greenstack-backups
AWS_ACCESS_KEY_ID=<backup access key>
AWS_SECRET_ACCESS_KEY=<backup secret>
```

**Step 3: SSL/TLS Certificates**
```bash
# Option A: Let's Encrypt (recommended)
sudo apt install certbot
sudo certbot certonly --standalone -d greenstack.yourdomain.com

# Copy certificates to application directory
sudo cp /etc/letsencrypt/live/greenstack.yourdomain.com/fullchain.pem \
  /opt/greenstack/certs/cert.pem
sudo cp /etc/letsencrypt/live/greenstack.yourdomain.com/privkey.pem \
  /opt/greenstack/certs/key.pem
sudo chown greenstack:greenstack /opt/greenstack/certs/*

# Option B: Commercial certificate (existing)
# ❌ NO DOCUMENTATION EXISTS FOR CERTIFICATE INSTALLATION
```

**Step 4: Initialize Database**
```bash
# 1. Start database only
sudo -u greenstack docker-compose -f docker-compose.yml up -d postgres

# 2. Wait for database to be ready
sleep 10

# 3. Run migrations
sudo -u greenstack docker-compose exec -T greenstack \
  alembic upgrade head

# 4. Create initial admin user
# ❌ NO SEED SCRIPT EXISTS - MUST CREATE VIA API AFTER STARTUP
```

**Step 5: Start Application**
```bash
# 1. Pull/build Docker images
sudo -u greenstack docker-compose -f docker-compose.yml pull
sudo -u greenstack docker-compose -f docker-compose.yml build

# 2. Start core services
sudo -u greenstack docker-compose -f docker-compose.yml up -d \
  postgres redis greenstack frontend

# 3. Verify health checks
sudo -u greenstack docker-compose ps
# All services should show "healthy" status

# 4. Test application access
curl -f http://localhost:8000/health || echo "Health check failed"
curl -f http://localhost:3000 || echo "Frontend failed"

# 5. Check logs for errors
sudo -u greenstack docker-compose logs --tail=50

# 6. (Optional) Start IoT services
sudo -u greenstack docker-compose -f docker-compose.iot.yml up -d
```

**Step 6: Configure Reverse Proxy**
```bash
# Nginx configuration (recommended)
# ❌ NO NGINX CONFIG FILE EXISTS IN REPOSITORY

# Should create: /etc/nginx/sites-available/greenstack
```

**Recommended Nginx Configuration:**
```nginx
# File: /etc/nginx/sites-available/greenstack

upstream greenstack_backend {
    server localhost:8000;
    keepalive 32;
}

upstream greenstack_frontend {
    server localhost:3000;
    keepalive 32;
}

# HTTP -> HTTPS redirect
server {
    listen 80;
    server_name greenstack.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name greenstack.yourdomain.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/greenstack.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/greenstack.yourdomain.com/privkey.pem;

    # SSL configuration (modern)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # File upload size limit
    client_max_body_size 100M;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;

    # API backend
    location /api {
        proxy_pass http://greenstack_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Health check
    location /health {
        proxy_pass http://greenstack_backend/health;
        access_log off;
    }

    # WebSocket (if needed)
    location /ws {
        proxy_pass http://greenstack_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400;
    }

    # Frontend
    location / {
        proxy_pass http://greenstack_frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files (if served separately)
    location /static {
        alias /opt/greenstack/frontend/build/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Grafana (if using IoT features)
server {
    listen 443 ssl http2;
    server_name grafana.greenstack.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/greenstack.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/greenstack.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Node-RED (if using IoT features)
server {
    listen 443 ssl http2;
    server_name nodered.greenstack.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/greenstack.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/greenstack.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:1880;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Step 7: Post-Deployment Verification**
```bash
# 1. Test HTTPS access
curl -f https://greenstack.yourdomain.com || echo "HTTPS failed"
curl -f https://greenstack.yourdomain.com/api/health || echo "API failed"

# 2. Test API authentication
# ❌ NO SMOKE TEST SCRIPT EXISTS

# 3. Verify database connectivity
sudo -u greenstack docker-compose exec greenstack \
  python -c "from sqlalchemy import create_engine; \
    engine = create_engine('$DATABASE_URL'); \
    engine.connect(); print('DB OK')"

# 4. Check all service health
sudo -u greenstack docker-compose ps | grep -q "(healthy)" || echo "Services unhealthy"

# 5. Review logs for errors
sudo -u greenstack docker-compose logs --since=10m | grep -i error

# 6. Test file upload (IODD import)
# ❌ NO AUTOMATED TEST EXISTS

# 7. Create test device
# ❌ NO SMOKE TEST EXISTS
```

**Step 8: Enable Monitoring**
```bash
# ❌ NO MONITORING SETUP SCRIPT EXISTS
# Manual setup required for:
# - Prometheus scraping
# - Grafana dashboard import
# - Alert rule configuration
# - External uptime monitoring
```

### 1.3 Current Gaps in Deployment Process

**CRITICAL MISSING COMPONENTS:**
1. ❌ No automated deployment script
2. ❌ No environment validation script
3. ❌ No smoke test suite
4. ❌ No rollback procedure
5. ❌ No blue-green deployment support
6. ❌ No zero-downtime deployment strategy
7. ❌ No deployment monitoring dashboard
8. ❌ No deployment notification system

**Deployment Risk:** HIGH - Manual deployment prone to errors, no automated verification

---

## 2. Production Configuration Hardening

### 2.1 Current Configuration Review

**File: `.env.example` (409 lines)**

**Strengths:**
- ✅ Comprehensive configuration coverage
- ✅ Clear documentation of each variable
- ✅ Grouped by service
- ✅ Feature flags for optional services
- ✅ Production checklist included

**Critical Security Issues:**

1. **Weak Default Credentials** (CRITICAL)
```bash
# Line 40-42
ADMIN_PASSWORD=admin123  # ❌ MUST CHANGE FOR PRODUCTION

# Line 88-89
POSTGRES_PASSWORD=postgres123  # ❌ WEAK DEFAULT

# Line 127
JWT_SECRET_KEY=your-secret-key-here-change-in-production-min-32-chars

# Line 263
MQTT_PASSWORD=mqtt123  # ❌ PREDICTABLE

# Line 287
REDIS_PASSWORD=redis123  # ❌ SIMPLE PASSWORD

# Line 313
INFLUXDB_TOKEN=my-super-secret-auth-token  # ❌ IN GIT HISTORY

# Line 342
GRAFANA_ADMIN_PASSWORD=admin123changeme  # ❌ WEAK

# Line 362
NODERED_CREDENTIAL_SECRET=change-this-secret  # ❌ NOT RANDOM
```

**Recommendation:** All defaults should cause application to FAIL startup with clear error message in production mode.

2. **Debug Mode Enabled by Default**
```bash
# Line 19
DEBUG=true  # ❌ Should default to false
LOG_LEVEL=DEBUG  # ❌ Should default to INFO
```

3. **No Secret Rotation Policy**
```bash
# ❌ No documentation on:
# - How often to rotate secrets
# - How to rotate secrets without downtime
# - Secret versioning
```

4. **CORS Too Permissive**
```bash
# Line 162-164
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
# ❌ No production domain guidance
# ❌ No wildcard warning
```

### 2.2 Docker Compose Configuration

**File: `docker-compose.yml` (216 lines)**

**Production Hardening Needed:**

1. **No Resource Limits**
```yaml
# Missing for ALL services:
services:
  greenstack:
    # ❌ No memory limits
    # ❌ No CPU limits
    # ❌ Could exhaust host resources

# Should add:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
```

2. **Exposed Database Port** (SECURITY RISK)
```yaml
# Line 28
ports:
  - "5432:5432"  # ❌ PostgreSQL exposed to host network
# Should only be accessible via Docker network
```

3. **No Health Check Timeouts**
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready"]
  interval: 10s
  timeout: 5s
  retries: 5
  # ✅ Present but could be tuned for production
```

4. **No Restart Policies for All Services**
```yaml
# Some services missing:
restart: unless-stopped
# Should be on ALL production services
```

5. **No Log Rotation**
```yaml
# Missing for ALL services:
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
# ❌ Logs will fill disk indefinitely
```

6. **No Production Docker Compose File**
```yaml
# ❌ docker-compose.production.yml does NOT exist
# Should have separate file with:
# - Resource limits
# - Production-specific configuration
# - Secrets from Docker secrets (not env vars)
# - Proper networking
```

### 2.3 Application Configuration

**File: `src/greenstack.py`**

**Security Issues:**

1. **CORS Configuration**
```python
# Line 70-74: CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # From CORS_ORIGINS env var
    allow_credentials=True,
    allow_methods=["*"],  # ❌ Too permissive
    allow_headers=["*"],  # ❌ Too permissive
)

# Should be:
allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
```

2. **No Rate Limiting**
```python
# ❌ No rate limiting middleware configured
# Should add:
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

# Then on routes:
@limiter.limit("5/minute")
async def upload_iodd_file(...):
```

3. **No Request Timeout**
```python
# ❌ No global timeout configuration
# Uvicorn should be started with:
# --timeout-keep-alive 5
# --timeout-graceful-shutdown 30
```

4. **File Upload Size Not Limited**
```python
# ❌ No file size validation in upload handlers
# Should add to routes:
if file.size > 10 * 1024 * 1024:  # 10MB limit
    raise HTTPException(413, "File too large")
```

### 2.4 Frontend Configuration

**File: `frontend/src/config/api.js`**

**Issues:**

1. **API URL Configuration**
```javascript
// Lines 1-2
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
// ❌ Defaults to http (not https)
// ❌ Should fail in production if not set
```

2. **No Request Timeout**
```javascript
// ❌ No axios timeout configuration
// Should add global config:
axios.defaults.timeout = 30000; // 30 seconds
```

3. **No Retry Logic**
```javascript
// ❌ No automatic retry on network failures
// Should add axios-retry
```

### 2.5 Recommended Production Configuration

**Create: `docker-compose.production.yml`**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./backups:/backups
    # ✅ No ports exposed (internal only)
    networks:
      - backend
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD} --maxmemory 512mb --maxmemory-policy allkeys-lru
    volumes:
      - redis-data:/data
    networks:
      - backend
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.25'
          memory: 256M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  greenstack:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - BUILD_DATE=${BUILD_DATE}
        - VERSION=${VERSION}
    restart: always
    environment:
      - ENVIRONMENT=production
      - DEBUG=false
      - LOG_LEVEL=INFO
      - DATABASE_URL=${DATABASE_URL}
      - SECRET_KEY=${SECRET_KEY}
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - REDIS_URL=${REDIS_URL}
      - CORS_ORIGINS=${CORS_ORIGINS}
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    ports:
      - "127.0.0.1:8000:8000"  # ✅ Bind to localhost only
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - frontend
      - backend
    deploy:
      resources:
        limits:
          cpus: '4.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 1G
    logging:
      driver: "json-file"
      options:
        max-size: "50m"
        max-file: "5"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - VITE_API_URL=${API_URL}
    restart: always
    ports:
      - "127.0.0.1:3000:3000"  # ✅ Bind to localhost only
    depends_on:
      - greenstack
    networks:
      - frontend
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 128M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # ✅ Backend network isolated from external access

volumes:
  postgres-data:
  redis-data:
```

**Create: `.env.production.template`**
```bash
###########################################
# GreenStack Production Configuration
# Last Updated: 2025-11-18
###########################################

# CRITICAL: This file contains sensitive data
# - Never commit to git
# - Set permissions: chmod 600 .env.production
# - Rotate secrets regularly

###########################################
# Application
###########################################
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO
VERSION=2.0.1

###########################################
# Security (REQUIRED - NO DEFAULTS)
###########################################
# Generate with: openssl rand -hex 32
SECRET_KEY=
JWT_SECRET_KEY=
ADMIN_PASSWORD=

###########################################
# Database (REQUIRED)
###########################################
POSTGRES_USER=greenstack_prod
POSTGRES_PASSWORD=
POSTGRES_DB=greenstack_production
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}

###########################################
# Redis Cache (REQUIRED)
###########################################
REDIS_PASSWORD=
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0

###########################################
# External URLs (REQUIRED)
###########################################
FRONTEND_URL=https://greenstack.example.com
API_URL=https://greenstack.example.com/api
CORS_ORIGINS=https://greenstack.example.com

###########################################
# Email Notifications (OPTIONAL)
###########################################
SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_FROM=GreenStack <noreply@example.com>

###########################################
# IoT Services (OPTIONAL)
###########################################
ENABLE_MQTT=false
ENABLE_INFLUXDB=false
ENABLE_GRAFANA=false
ENABLE_NODERED=false

# If enabling IoT services, configure:
MQTT_PASSWORD=
INFLUXDB_TOKEN=
GRAFANA_ADMIN_PASSWORD=
NODERED_CREDENTIAL_SECRET=

###########################################
# Backups (RECOMMENDED)
###########################################
BACKUP_ENABLED=true
BACKUP_SCHEDULE="0 2 * * *"  # Daily at 2 AM
BACKUP_RETENTION_DAYS=30
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
BACKUP_S3_BUCKET=

###########################################
# Monitoring (RECOMMENDED)
###########################################
SENTRY_DSN=
SENTRY_ENVIRONMENT=production
PROMETHEUS_ENABLED=true
```

---

## 3. Backup & Disaster Recovery

### 3.1 Current Backup Status

**CRITICAL: NO BACKUP PROCEDURES EXIST**

**Missing Components:**
- ❌ No automated backup scripts
- ❌ No backup testing procedures
- ❌ No restore procedures documented
- ❌ No backup monitoring
- ❌ No backup retention policies
- ❌ No offsite backup storage
- ❌ No disaster recovery plan
- ❌ No RTO/RPO defined

**Data Loss Risk:** CRITICAL - Guaranteed data loss on failure

### 3.2 Recommended Backup Strategy

**Backup Components:**
1. PostgreSQL database (primary data)
2. Redis data (cache, can be rebuilt)
3. Uploaded IODD files (critical)
4. Application configuration files
5. SSL certificates
6. Docker volumes

**Create: `scripts/backup.sh`**
```bash
#!/bin/bash
# GreenStack Backup Script
# Version: 1.0
# Description: Automated backup of all critical data

set -euo pipefail

# Configuration
BACKUP_DIR="/opt/greenstack/backups"
S3_BUCKET="${BACKUP_S3_BUCKET:-}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="greenstack_backup_${TIMESTAMP}"
TEMP_DIR="${BACKUP_DIR}/temp/${BACKUP_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check prerequisites
command -v docker >/dev/null 2>&1 || { error "Docker is required but not installed"; exit 1; }
command -v aws >/dev/null 2>&1 || warn "AWS CLI not found, S3 upload will be skipped"

# Create backup directory
mkdir -p "${TEMP_DIR}"
cd "${TEMP_DIR}"

log "Starting GreenStack backup to ${BACKUP_NAME}"

# 1. Backup PostgreSQL
log "Backing up PostgreSQL database..."
docker exec greenstack_postgres_1 pg_dump \
    -U "${POSTGRES_USER}" \
    -d "${POSTGRES_DB}" \
    --format=custom \
    --compress=9 \
    > postgres_backup.dump

if [ $? -eq 0 ]; then
    log "PostgreSQL backup completed: $(du -h postgres_backup.dump | cut -f1)"
else
    error "PostgreSQL backup failed"
    exit 1
fi

# 2. Backup Redis (optional, can be skipped if cache only)
log "Backing up Redis data..."
docker exec greenstack_redis_1 redis-cli --rdb /data/dump.rdb SAVE
docker cp greenstack_redis_1:/data/dump.rdb redis_backup.rdb
log "Redis backup completed: $(du -h redis_backup.rdb | cut -f1)"

# 3. Backup uploaded IODD files
log "Backing up uploaded files..."
if [ -d "/opt/greenstack/uploads" ]; then
    tar -czf uploads_backup.tar.gz -C /opt/greenstack uploads/
    log "Uploads backup completed: $(du -h uploads_backup.tar.gz | cut -f1)"
else
    warn "Uploads directory not found, skipping"
fi

# 4. Backup configuration
log "Backing up configuration files..."
cp /opt/greenstack/.env.production env_backup.txt
cp /opt/greenstack/docker-compose.production.yml docker-compose_backup.yml
tar -czf config_backup.tar.gz *.txt *.yml
rm *.txt *.yml  # Remove uncompressed copies
log "Configuration backup completed"

# 5. Create manifest
log "Creating backup manifest..."
cat > manifest.json <<EOF
{
  "backup_name": "${BACKUP_NAME}",
  "timestamp": "${TIMESTAMP}",
  "version": "2.0.1",
  "components": {
    "postgres": "postgres_backup.dump",
    "redis": "redis_backup.rdb",
    "uploads": "uploads_backup.tar.gz",
    "config": "config_backup.tar.gz"
  },
  "sizes": {
    "postgres": "$(stat -f%z postgres_backup.dump 2>/dev/null || stat -c%s postgres_backup.dump)",
    "redis": "$(stat -f%z redis_backup.rdb 2>/dev/null || stat -c%s redis_backup.rdb)",
    "uploads": "$(stat -f%z uploads_backup.tar.gz 2>/dev/null || stat -c%s uploads_backup.tar.gz || echo 0)",
    "config": "$(stat -f%z config_backup.tar.gz 2>/dev/null || stat -c%s config_backup.tar.gz)"
  },
  "checksums": {
    "postgres": "$(sha256sum postgres_backup.dump | cut -d' ' -f1)",
    "redis": "$(sha256sum redis_backup.rdb | cut -d' ' -f1)",
    "config": "$(sha256sum config_backup.tar.gz | cut -d' ' -f1)"
  }
}
EOF

# 6. Create final archive
log "Creating final backup archive..."
cd "${BACKUP_DIR}/temp"
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}/"
BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" | cut -f1)
log "Backup archive created: ${BACKUP_SIZE}"

# 7. Upload to S3 (if configured)
if [ -n "${S3_BUCKET}" ] && command -v aws >/dev/null 2>&1; then
    log "Uploading to S3: s3://${S3_BUCKET}/backups/${BACKUP_NAME}.tar.gz"
    aws s3 cp "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" \
        "s3://${S3_BUCKET}/backups/${BACKUP_NAME}.tar.gz" \
        --storage-class STANDARD_IA

    if [ $? -eq 0 ]; then
        log "S3 upload completed successfully"
    else
        error "S3 upload failed, but local backup is available"
    fi
else
    warn "S3 upload skipped (not configured or AWS CLI missing)"
fi

# 8. Cleanup old backups
log "Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "greenstack_backup_*.tar.gz" -mtime +${RETENTION_DAYS} -delete
REMAINING=$(find "${BACKUP_DIR}" -name "greenstack_backup_*.tar.gz" | wc -l)
log "Local backups remaining: ${REMAINING}"

# Cleanup temp directory
rm -rf "${TEMP_DIR}"

log "Backup completed successfully: ${BACKUP_NAME}.tar.gz (${BACKUP_SIZE})"
log "Backup location: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"

# Send notification (if configured)
if [ -n "${BACKUP_NOTIFICATION_WEBHOOK:-}" ]; then
    curl -X POST "${BACKUP_NOTIFICATION_WEBHOOK}" \
        -H "Content-Type: application/json" \
        -d "{\"text\": \"GreenStack backup completed: ${BACKUP_NAME} (${BACKUP_SIZE})\"}" \
        >/dev/null 2>&1
fi

exit 0
```

**Create: `scripts/restore.sh`**
```bash
#!/bin/bash
# GreenStack Restore Script
# Version: 1.0
# Description: Restore from backup

set -euo pipefail

# Configuration
BACKUP_DIR="/opt/greenstack/backups"
BACKUP_FILE="${1:-}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Validate backup file
if [ -z "${BACKUP_FILE}" ]; then
    error "Usage: $0 <backup_file.tar.gz>"
    echo ""
    echo "Available backups:"
    ls -lh "${BACKUP_DIR}"/greenstack_backup_*.tar.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

if [ ! -f "${BACKUP_FILE}" ]; then
    error "Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

# Confirmation prompt
warn "This will restore GreenStack from backup and OVERWRITE current data!"
warn "Backup file: ${BACKUP_FILE}"
read -p "Are you sure you want to continue? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    log "Restore cancelled"
    exit 0
fi

# Extract backup
TEMP_DIR="${BACKUP_DIR}/restore_temp"
rm -rf "${TEMP_DIR}"
mkdir -p "${TEMP_DIR}"
log "Extracting backup..."
tar -xzf "${BACKUP_FILE}" -C "${TEMP_DIR}"

# Find backup directory (should be only one)
BACKUP_EXTRACT_DIR=$(find "${TEMP_DIR}" -mindepth 1 -maxdepth 1 -type d)
cd "${BACKUP_EXTRACT_DIR}"

# Verify manifest
if [ ! -f "manifest.json" ]; then
    error "Invalid backup: manifest.json not found"
    exit 1
fi

log "Backup manifest:"
cat manifest.json

# Stop services
log "Stopping GreenStack services..."
cd /opt/greenstack
docker-compose -f docker-compose.production.yml down

# Restore PostgreSQL
log "Restoring PostgreSQL database..."
docker-compose -f docker-compose.production.yml up -d postgres
sleep 5  # Wait for PostgreSQL to start

docker exec -i greenstack_postgres_1 dropdb -U "${POSTGRES_USER}" "${POSTGRES_DB}" --if-exists
docker exec -i greenstack_postgres_1 createdb -U "${POSTGRES_USER}" "${POSTGRES_DB}"
docker exec -i greenstack_postgres_1 pg_restore \
    -U "${POSTGRES_USER}" \
    -d "${POSTGRES_DB}" \
    --verbose \
    < "${BACKUP_EXTRACT_DIR}/postgres_backup.dump"

log "PostgreSQL restore completed"

# Restore Redis
if [ -f "${BACKUP_EXTRACT_DIR}/redis_backup.rdb" ]; then
    log "Restoring Redis data..."
    docker cp "${BACKUP_EXTRACT_DIR}/redis_backup.rdb" greenstack_redis_1:/data/dump.rdb
    docker-compose -f docker-compose.production.yml restart redis
    log "Redis restore completed"
fi

# Restore uploads
if [ -f "${BACKUP_EXTRACT_DIR}/uploads_backup.tar.gz" ]; then
    log "Restoring uploaded files..."
    rm -rf /opt/greenstack/uploads
    tar -xzf "${BACKUP_EXTRACT_DIR}/uploads_backup.tar.gz" -C /opt/greenstack/
    log "Uploads restore completed"
fi

# Restore configuration (with confirmation)
if [ -f "${BACKUP_EXTRACT_DIR}/config_backup.tar.gz" ]; then
    read -p "Restore configuration files? (yes/no): " -r
    if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log "Restoring configuration..."
        tar -xzf "${BACKUP_EXTRACT_DIR}/config_backup.tar.gz" -C /tmp/
        # Don't overwrite .env.production automatically
        warn "Configuration extracted to /tmp/ - review before overwriting current config"
    fi
fi

# Start all services
log "Starting all services..."
docker-compose -f docker-compose.production.yml up -d

# Wait for health checks
log "Waiting for services to be healthy..."
sleep 10
docker-compose -f docker-compose.production.yml ps

# Cleanup
rm -rf "${TEMP_DIR}"

log "Restore completed successfully"
log "Please verify application functionality"

exit 0
```

**Create Backup Cron Job:**
```bash
# Add to crontab for greenstack user:
# Daily backup at 2 AM
0 2 * * * /opt/greenstack/scripts/backup.sh >> /opt/greenstack/logs/backup.log 2>&1

# Weekly backup verification (Sundays at 3 AM)
0 3 * * 0 /opt/greenstack/scripts/verify-backup.sh >> /opt/greenstack/logs/backup-verify.log 2>&1
```

### 3.3 Disaster Recovery Plan

**Recovery Time Objective (RTO):** 4 hours
**Recovery Point Objective (RPO):** 24 hours (daily backups)

**Disaster Scenarios:**

**Scenario 1: Database Corruption**
1. Stop application services
2. Restore PostgreSQL from latest backup
3. Run database migrations if needed
4. Start application services
5. Verify functionality
6. **Estimated Recovery Time:** 30 minutes

**Scenario 2: Server Failure**
1. Provision new server with same specifications
2. Install Docker and dependencies
3. Clone GreenStack repository
4. Download latest backup from S3
5. Run restore script
6. Update DNS to point to new server
7. Verify functionality
8. **Estimated Recovery Time:** 2-4 hours

**Scenario 3: Data Center Outage**
1. Activate backup infrastructure in different region
2. Restore from S3 backup
3. Update DNS records
4. Verify functionality
5. **Estimated Recovery Time:** 3-4 hours

**Scenario 4: Ransomware Attack**
1. Isolate affected systems immediately
2. Provision clean infrastructure
3. Restore from known-good backup (prior to infection)
4. Update all credentials
5. Apply security patches
6. Verify no backdoors exist
7. **Estimated Recovery Time:** 4-8 hours

**Create: `docs/operations/DISASTER_RECOVERY.md`**
```markdown
# GreenStack Disaster Recovery Procedures

## Emergency Contacts
- Primary Admin: [Name] - [Phone] - [Email]
- Secondary Admin: [Name] - [Phone] - [Email]
- Hosting Provider Support: [Phone/URL]
- On-Call Rotation: [PagerDuty/Ops url]

## Recovery Procedures
[Detailed step-by-step procedures for each scenario]

## Last Tested: [Date]
## Next Test: [Date]
```

**❌ THIS DOCUMENT DOES NOT EXIST**

### 3.4 Backup Monitoring

**Create: `scripts/verify-backup.sh`**
```bash
#!/bin/bash
# Verify latest backup integrity

LATEST_BACKUP=$(ls -t /opt/greenstack/backups/greenstack_backup_*.tar.gz | head -1)

if [ -z "${LATEST_BACKUP}" ]; then
    echo "ERROR: No backups found"
    exit 1
fi

# Check backup age
BACKUP_AGE=$(find "${LATEST_BACKUP}" -mtime +2)
if [ -n "${BACKUP_AGE}" ]; then
    echo "WARNING: Latest backup is older than 2 days"
fi

# Verify archive integrity
if tar -tzf "${LATEST_BACKUP}" >/dev/null 2>&1; then
    echo "SUCCESS: Backup archive is valid"
else
    echo "ERROR: Backup archive is corrupted"
    exit 1
fi

# Verify S3 upload
if [ -n "${BACKUP_S3_BUCKET}" ]; then
    BACKUP_NAME=$(basename "${LATEST_BACKUP}")
    if aws s3 ls "s3://${BACKUP_S3_BUCKET}/backups/${BACKUP_NAME}" >/dev/null 2>&1; then
        echo "SUCCESS: S3 backup exists"
    else
        echo "WARNING: S3 backup not found"
    fi
fi

echo "Backup verification completed"
```

---

## 4. Monitoring & Alerting Strategy

### 4.1 Current Monitoring Status

**CRITICAL: Minimal Monitoring Exists**

**What Exists:**
- ✅ Docker health checks
- ✅ Application logs
- ⚠️ Basic health endpoint (`/health`)

**What's Missing:**
- ❌ Prometheus metrics
- ❌ Grafana dashboards (except IoT-specific)
- ❌ Alert rules
- ❌ Log aggregation
- ❌ Error tracking (Sentry)
- ❌ Uptime monitoring
- ❌ Performance monitoring (APM)
- ❌ User analytics
- ❌ Business metrics

### 4.2 Recommended Monitoring Stack

**Tier 1: Essential Monitoring (MUST HAVE)**

1. **Uptime Monitoring** (External)
   - Service: UptimeRobot, Pingdom, or StatusCake
   - Check frequency: 1 minute
   - Endpoints to monitor:
     - `https://greenstack.example.com` (200 OK)
     - `https://greenstack.example.com/api/health` (200 OK)
   - Alert channels: Email, SMS, Slack
   - **Cost:** $7-20/month
   - **Setup Time:** 15 minutes

2. **Error Tracking** (Sentry)
   ```python
   # Add to src/greenstack.py
   import sentry_sdk
   from sentry_sdk.integrations.fastapi import FastApiIntegration

   if os.getenv("SENTRY_DSN"):
       sentry_sdk.init(
           dsn=os.getenv("SENTRY_DSN"),
           integrations=[FastApiIntegration()],
           environment=os.getenv("ENVIRONMENT", "development"),
           traces_sample_rate=0.1,  # 10% of transactions
           profiles_sample_rate=0.1,
       )
   ```
   - **Cost:** Free tier (5k events/month) or $26/month
   - **Setup Time:** 30 minutes

3. **Log Management** (Basic)
   ```yaml
   # Add to docker-compose.production.yml
   logging:
     driver: "json-file"
     options:
       max-size: "50m"
       max-file: "10"
       labels: "service,environment"
   ```
   - Centralized with Loki (free) or CloudWatch
   - **Setup Time:** 1-2 hours

**Tier 2: Operational Monitoring (SHOULD HAVE)**

4. **Prometheus + Grafana**
   ```yaml
   # Add to docker-compose.production.yml
   prometheus:
     image: prom/prometheus:latest
     volumes:
       - ./config/prometheus.yml:/etc/prometheus/prometheus.yml
       - prometheus-data:/prometheus
     command:
       - '--config.file=/etc/prometheus/prometheus.yml'
       - '--storage.tsdb.retention.time=30d'
     networks:
       - monitoring
     deploy:
       resources:
         limits:
           memory: 1G

   grafana:
     image: grafana/grafana:latest
     environment:
       - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
       - GF_INSTALL_PLUGINS=grafana-clock-panel,grafana-piechart-panel
     volumes:
       - grafana-data:/var/lib/grafana
       - ./config/grafana/dashboards:/etc/grafana/provisioning/dashboards
     ports:
       - "127.0.0.1:3001:3000"
     networks:
       - monitoring
     deploy:
       resources:
         limits:
           memory: 512M
   ```

5. **Application Metrics**
   ```python
   # Add to requirements.txt
   prometheus-client==0.19.0
   prometheus-fastapi-instrumentator==6.1.0

   # Add to src/greenstack.py
   from prometheus_fastapi_instrumentator import Instrumentator

   instrumentator = Instrumentator()
   instrumentator.instrument(app).expose(app, endpoint="/metrics")
   ```

   **Metrics to Track:**
   - Request rate (requests/second)
   - Request duration (latency)
   - Error rate (errors/second)
   - Active connections
   - Database connection pool usage
   - IODD parse duration
   - File upload size/duration
   - User sessions
   - Device count
   - Parameter count

6. **Database Monitoring**
   ```yaml
   # Add postgres_exporter to docker-compose
   postgres-exporter:
     image: prometheuscommunity/postgres-exporter
     environment:
       DATA_SOURCE_NAME: "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?sslmode=disable"
     networks:
       - backend
       - monitoring
     deploy:
       resources:
         limits:
           memory: 128M
   ```

**Tier 3: Advanced Monitoring (NICE TO HAVE)**

7. **Application Performance Monitoring (APM)**
   - New Relic, DataDog, or Elastic APM
   - Distributed tracing
   - Transaction profiling
   - **Cost:** $100-500/month

8. **Business Metrics Dashboard**
   - User registration rate
   - IODD uploads per day
   - Device catalog growth
   - API usage patterns
   - Feature adoption rates

### 4.3 Alert Rules

**Create: `config/prometheus/alerts.yml`**
```yaml
groups:
  - name: greenstack_alerts
    interval: 30s
    rules:
      # High Priority Alerts
      - alert: ServiceDown
        expr: up{job="greenstack"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "GreenStack service is down"
          description: "{{ $labels.instance }} has been down for more than 1 minute"

      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors/sec"

      - alert: DatabaseDown
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "PostgreSQL is down"
          description: "Database has been unreachable for 1 minute"

      # Medium Priority Alerts
      - alert: HighLatency
        expr: http_request_duration_seconds{quantile="0.95"} > 5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High API latency"
          description: "95th percentile latency is {{ $value }}s"

      - alert: HighMemoryUsage
        expr: container_memory_usage_bytes{name="greenstack"} / container_spec_memory_limit_bytes{name="greenstack"} > 0.85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value | humanizePercentage }}"

      - alert: DiskSpaceLow
        expr: node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"} < 0.15
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Low disk space"
          description: "Only {{ $value | humanizePercentage }} disk space remaining"

      # Low Priority Alerts
      - alert: BackupOld
        expr: time() - file_mtime{path="/opt/greenstack/backups/latest"} > 172800  # 48 hours
        for: 1h
        labels:
          severity: info
        annotations:
          summary: "Backup is outdated"
          description: "Last backup is {{ $value | humanizeDuration }} old"

      - alert: HighCPUUsage
        expr: rate(container_cpu_usage_seconds_total{name="greenstack"}[5m]) > 0.8
        for: 15m
        labels:
          severity: info
        annotations:
          summary: "Sustained high CPU usage"
          description: "CPU usage has been above 80% for 15 minutes"
```

**Create: `config/prometheus/prometheus.yml`**
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'greenstack-production'
    environment: 'production'

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

rule_files:
  - '/etc/prometheus/alerts.yml'

scrape_configs:
  - job_name: 'greenstack'
    static_configs:
      - targets: ['greenstack:8000']
    metrics_path: '/metrics'

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
```

### 4.4 Grafana Dashboards

**Create: `config/grafana/dashboards/application-overview.json`**

**Recommended Panels:**
1. **System Health**
   - Service uptime
   - Response time (p50, p95, p99)
   - Error rate
   - Request rate

2. **Database Performance**
   - Active connections
   - Query duration
   - Cache hit rate
   - Database size growth

3. **Resource Usage**
   - CPU usage (per container)
   - Memory usage (per container)
   - Disk I/O
   - Network I/O

4. **Business Metrics**
   - Active users (last 24h)
   - IODD uploads (last 24h)
   - Devices in catalog
   - API calls by endpoint

5. **Alerts**
   - Active alerts
   - Alert history
   - Alert resolution time

**❌ THESE DASHBOARDS DO NOT EXIST**

### 4.5 Alerting Channels

**Email Alerts:**
```yaml
# config/alertmanager/config.yml
route:
  receiver: 'email-critical'
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  group_by: [alertname, cluster]

  routes:
    - match:
        severity: critical
      receiver: 'email-critical'
      continue: true

    - match:
        severity: critical
      receiver: 'slack-critical'

    - match:
        severity: warning
      receiver: 'slack-warnings'

receivers:
  - name: 'email-critical'
    email_configs:
      - to: 'ops@example.com'
        from: 'alerts@greenstack.example.com'
        smarthost: 'smtp.example.com:587'
        auth_username: 'alerts@greenstack.example.com'
        auth_password: '${SMTP_PASSWORD}'
        headers:
          Subject: '[CRITICAL] GreenStack Alert: {{ .GroupLabels.alertname }}'

  - name: 'slack-critical'
    slack_configs:
      - api_url: '${SLACK_WEBHOOK_URL}'
        channel: '#greenstack-alerts'
        title: 'GreenStack Critical Alert'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}\n{{ end }}'
        send_resolved: true

  - name: 'slack-warnings'
    slack_configs:
      - api_url: '${SLACK_WEBHOOK_URL}'
        channel: '#greenstack-monitoring'
        title: 'GreenStack Warning'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}\n{{ end }}'
```

**❌ THIS CONFIGURATION DOES NOT EXIST**

---

## 5. Load Testing & Capacity Planning

### 5.1 Current Load Testing Status

**CRITICAL: NO LOAD TESTING PERFORMED**

**Missing:**
- ❌ No load testing scripts
- ❌ No performance benchmarks
- ❌ No capacity limits known
- ❌ No bottleneck analysis
- ❌ No scalability plan

### 5.2 Load Testing Plan

**Tool:** Locust or k6

**Create: `tests/load/locustfile.py`**
```python
from locust import HttpUser, task, between
import random

class GreenStackUser(HttpUser):
    wait_time = between(1, 5)

    def on_start(self):
        """Login before starting tests"""
        response = self.client.post("/api/auth/login", json={
            "username": "test_user",
            "password": "test_password"
        })
        if response.status_code == 200:
            self.token = response.json()["access_token"]
        else:
            raise Exception("Login failed")

    @task(3)
    def view_devices(self):
        """Most common operation - viewing device list"""
        self.client.get(
            "/api/devices",
            headers={"Authorization": f"Bearer {self.token}"}
        )

    @task(2)
    def search_devices(self):
        """Search in device catalog"""
        search_terms = ["valve", "sensor", "actuator", "IO-Link"]
        term = random.choice(search_terms)
        self.client.get(
            f"/api/devices/search?q={term}",
            headers={"Authorization": f"Bearer {self.token}"}
        )

    @task(1)
    def view_device_details(self):
        """View specific device details"""
        device_id = random.randint(1, 100)  # Adjust based on test data
        self.client.get(
            f"/api/devices/{device_id}",
            headers={"Authorization": f"Bearer {self.token}"}
        )

    @task(1)
    def get_health(self):
        """Health check endpoint"""
        self.client.get("/health")

class IODDUploadUser(HttpUser):
    """Separate user class for heavy upload operations"""
    wait_time = between(10, 30)

    def on_start(self):
        response = self.client.post("/api/auth/login", json={
            "username": "admin",
            "password": "admin_password"
        })
        self.token = response.json()["access_token"]

    @task
    def upload_iodd(self):
        """Upload IODD file (heavy operation)"""
        # Use small test IODD file
        with open("tests/fixtures/sample.iodd", "rb") as f:
            self.client.post(
                "/api/iodd/upload",
                files={"file": f},
                headers={"Authorization": f"Bearer {self.token}"}
            )
```

**Run Load Tests:**
```bash
# Install Locust
pip install locust

# Run with different load profiles

# 1. Baseline: 10 concurrent users
locust -f tests/load/locustfile.py --host=https://greenstack.example.com \
  --users=10 --spawn-rate=1 --run-time=5m --html=reports/baseline.html

# 2. Normal load: 50 concurrent users
locust -f tests/load/locustfile.py --host=https://greenstack.example.com \
  --users=50 --spawn-rate=5 --run-time=10m --html=reports/normal.html

# 3. Peak load: 100 concurrent users
locust -f tests/load/locustfile.py --host=https://greenstack.example.com \
  --users=100 --spawn-rate=10 --run-time=10m --html=reports/peak.html

# 4. Stress test: 200 concurrent users
locust -f tests/load/locustfile.py --host=https://greenstack.example.com \
  --users=200 --spawn-rate=20 --run-time=15m --html=reports/stress.html

# 5. Spike test: sudden spike from 10 to 100
locust -f tests/load/locustfile.py --host=https://greenstack.example.com \
  --users=100 --spawn-rate=50 --run-time=5m --html=reports/spike.html
```

### 5.3 Performance Benchmarks

**Expected Performance Targets:**

| Metric | Target | Acceptable | Unacceptable |
|--------|--------|------------|--------------|
| Homepage load | < 1s | < 2s | > 3s |
| API response (simple) | < 100ms | < 300ms | > 500ms |
| API response (complex) | < 500ms | < 1s | > 2s |
| IODD file parse | < 5s | < 10s | > 15s |
| Device search | < 200ms | < 500ms | > 1s |
| Database query | < 50ms | < 200ms | > 500ms |
| File upload (10MB) | < 10s | < 30s | > 60s |
| Concurrent users | 100+ | 50+ | < 25 |

### 5.4 Capacity Planning

**Current Architecture Capacity (Estimated):**

**Hardware Specs:**
- 4 CPU cores
- 8GB RAM
- PostgreSQL, Redis, FastAPI, React (all on one server)

**Estimated Capacity:**
- **Concurrent Users:** 50-75 (with current single-server setup)
- **Requests per Second:** 100-150 RPS
- **Database Size:** 10GB comfortably, 50GB maximum
- **File Storage:** 100GB (limited by disk)

**Bottlenecks:**
1. **IODD File Parsing** - CPU intensive, blocks request
2. **Database Queries** - Some complex queries on large datasets
3. **Single Server** - No horizontal scaling

**Scaling Strategy:**

**Phase 1: Vertical Scaling (Quick Win)**
- Upgrade to 8 CPU cores, 16GB RAM
- **Estimated Capacity:** 150-200 concurrent users
- **Cost:** $50-100/month additional
- **Implementation Time:** 1 hour (requires downtime)

**Phase 2: Database Optimization**
- Add read replica for reporting queries
- Implement connection pooling (PgBouncer)
- Add Redis caching for frequent queries
- **Estimated Improvement:** 50% latency reduction
- **Implementation Time:** 8 hours

**Phase 3: Horizontal Scaling**
- Multiple API server instances behind load balancer
- Separate job queue for IODD parsing (Celery + RabbitMQ)
- CDN for static assets
- **Estimated Capacity:** 500+ concurrent users
- **Implementation Time:** 40 hours

**Create: `docs/operations/SCALING_GUIDE.md`**
```markdown
# GreenStack Scaling Guide

## Current Capacity
- Single server: 4 CPU, 8GB RAM
- Estimated capacity: 50-75 concurrent users

## Monitoring Capacity
Watch these metrics to know when to scale:
- CPU usage sustained > 70%
- Memory usage > 85%
- Request latency p95 > 1s
- Database connections > 80% of pool
- Disk usage > 85%

## Scaling Procedures
[Step-by-step procedures for each scaling phase]

## Cost Analysis
[Cost projections for different scaling tiers]
```

**❌ THIS DOCUMENT DOES NOT EXIST**

---

## 6. Troubleshooting Guide

### 6.1 Common Issues & Solutions

**Create: `docs/operations/TROUBLESHOOTING.md`**

```markdown
# GreenStack Troubleshooting Guide

## Application Won't Start

### Symptom
```bash
docker-compose up -d
# Services exit immediately or restart loop
```

### Diagnosis
```bash
# Check logs
docker-compose logs --tail=50 greenstack

# Check service status
docker-compose ps
```

### Common Causes

**1. Database Connection Failed**
```
ERROR: could not connect to database
FATAL: password authentication failed for user "iodd_user"
```

**Solution:**
```bash
# Verify DATABASE_URL in .env.production
grep DATABASE_URL .env.production

# Test database connectivity
docker-compose exec postgres psql -U iodd_user -d greenstack_production

# Reset database password
docker-compose exec postgres psql -U postgres -c "ALTER USER iodd_user WITH PASSWORD 'new_password';"
# Update .env.production with new password
```

**2. Port Already in Use**
```
ERROR: bind: address already in use
```

**Solution:**
```bash
# Find process using port 8000
sudo netstat -tulpn | grep 8000
# or
sudo lsof -i :8000

# Kill the process
sudo kill -9 <PID>

# Or change port in docker-compose.yml
```

**3. Missing Environment Variables**
```
KeyError: 'SECRET_KEY'
```

**Solution:**
```bash
# Verify .env.production exists and is loaded
ls -la .env.production

# Check if compose is using the right env file
docker-compose --env-file .env.production config | grep SECRET_KEY
```

## Slow Performance

### Symptom
- Pages load slowly
- API requests timeout
- High latency

### Diagnosis
```bash
# Check resource usage
docker stats

# Check database queries
docker-compose exec postgres psql -U iodd_user -d greenstack_production -c "SELECT pid, now() - pg_stat_activity.query_start AS duration, query FROM pg_stat_activity WHERE state = 'active' ORDER BY duration DESC;"

# Check logs for slow queries
docker-compose logs greenstack | grep "slow query"
```

### Solutions

**1. High CPU Usage**
```bash
# Identify heavy processes
docker stats --no-stream

# Scale vertically (add more CPU)
# Or add more application instances (horizontal scaling)
```

**2. High Memory Usage**
```bash
# Check memory
free -h
docker stats --no-stream

# Restart services to clear memory leaks
docker-compose restart greenstack

# Add swap if needed (temporary solution)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

**3. Database Performance Issues**
```bash
# Analyze slow queries
docker-compose exec postgres psql -U iodd_user -d greenstack_production

# Enable slow query logging
ALTER SYSTEM SET log_min_duration_statement = 1000;  -- Log queries > 1s
SELECT pg_reload_conf();

# Run VACUUM ANALYZE
VACUUM ANALYZE;

# Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexrelname NOT LIKE 'pg_toast%';
```

## Database Migration Failed

### Symptom
```
alembic.util.exc.CommandError: Can't locate revision identified by 'xxxxx'
```

### Solution
```bash
# Check current revision
docker-compose exec greenstack alembic current

# Check migration history
docker-compose exec greenstack alembic history

# Force to specific revision (DANGEROUS - backup first!)
docker-compose exec greenstack alembic stamp head

# Rollback migration
docker-compose exec greenstack alembic downgrade -1

# Retry upgrade
docker-compose exec greenstack alembic upgrade head
```

## File Upload Fails

### Symptom
```
413 Request Entity Too Large
```

### Solution
```bash
# Check Nginx client_max_body_size
sudo nano /etc/nginx/sites-available/greenstack
# Add: client_max_body_size 100M;

sudo nginx -t
sudo systemctl reload nginx

# Check FastAPI body size limit (if custom)
# In greenstack.py, verify no custom limits
```

## Redis Connection Issues

### Symptom
```
ERROR: Error connecting to Redis: Connection refused
```

### Solution
```bash
# Check Redis is running
docker-compose ps redis

# Test Redis connection
docker-compose exec redis redis-cli ping
# Should return: PONG

# Check password
docker-compose exec redis redis-cli -a ${REDIS_PASSWORD} ping

# Restart Redis
docker-compose restart redis
```

## IODD Parsing Errors

### Symptom
```
ERROR: Failed to parse IODD file: XML parse error
```

### Diagnosis
```bash
# Check the IODD file is valid XML
xmllint --noout /path/to/file.iodd

# Check IODD schema version
grep "version" /path/to/file.iodd
```

### Solution
```bash
# Check parser logs
docker-compose logs greenstack | grep "iodd"

# Validate IODD schema (if implemented)
# Most issues are due to:
# 1. Invalid XML syntax
# 2. Unsupported IODD version
# 3. Missing required elements
# 4. Incorrect namespace

# Report issue with sample file (redacted if needed)
```

## Out of Disk Space

### Symptom
```
ERROR: No space left on device
```

### Diagnosis
```bash
# Check disk usage
df -h

# Find large directories
du -h --max-depth=1 /opt/greenstack | sort -hr | head -10

# Check Docker disk usage
docker system df
```

### Solution
```bash
# Clean up Docker
docker system prune -a --volumes
# WARNING: This removes unused images, containers, volumes

# Clean old logs
find /var/log -name "*.log" -mtime +30 -delete

# Clean old backups (if local)
find /opt/greenstack/backups -name "*.tar.gz" -mtime +30 -delete

# Compress old logs
find /opt/greenstack/logs -name "*.log" -mtime +7 -exec gzip {} \;
```

## SSL Certificate Expired

### Symptom
```
ERR_CERT_DATE_INVALID
Your connection is not private
```

### Solution
```bash
# Check certificate expiration
openssl x509 -enddate -noout -in /etc/letsencrypt/live/greenstack.example.com/cert.pem

# Renew Let's Encrypt certificate
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run

# Reload Nginx
sudo systemctl reload nginx
```

## Health Check Failing

### Symptom
```
docker-compose ps
# Shows: (unhealthy)
```

### Diagnosis
```bash
# Check health check command manually
docker-compose exec greenstack curl -f http://localhost:8000/health

# Check application logs
docker-compose logs --tail=100 greenstack
```

### Solution
```bash
# Most common: Application crashed
# Check logs for Python errors

# Restart service
docker-compose restart greenstack

# If persists, check dependencies
docker-compose exec greenstack python -c "import sys; print(sys.path)"
```

## IoT Services Not Receiving Data

### Symptom
- Grafana shows no data
- InfluxDB queries return empty

### Diagnosis
```bash
# Check MQTT broker
docker-compose logs mosquitto

# Test MQTT publish/subscribe
docker-compose exec mosquitto mosquitto_sub -t '#' -v

# Check InfluxDB
docker-compose exec influxdb influx query 'from(bucket:"iodd_telemetry") |> range(start: -1h) |> limit(n:10)'
```

### Solution
```bash
# Verify MQTT bridge is running
docker-compose logs mqtt-bridge

# Check InfluxDB ingestion service
docker-compose logs influx-ingestion

# Test end-to-end flow
docker-compose exec mosquitto mosquitto_pub -t 'devices/test/telemetry' -m '{"parameter": "temp", "value": 25}'

# Check if data appears in InfluxDB (wait 5 seconds)
```

## Emergency Recovery

### Full System Restore from Backup
```bash
# 1. Stop all services
cd /opt/greenstack
docker-compose down

# 2. Run restore script
sudo -u greenstack ./scripts/restore.sh /opt/greenstack/backups/greenstack_backup_YYYYMMDD_HHMMSS.tar.gz

# 3. Verify services
docker-compose ps
docker-compose logs --tail=50

# 4. Test application access
curl https://greenstack.example.com/health
```

## Getting Help

### Information to Collect
```bash
# System info
uname -a
docker --version
docker-compose --version

# Service status
docker-compose ps

# Recent logs (last 100 lines all services)
docker-compose logs --tail=100 > /tmp/greenstack-logs.txt

# Configuration (redact passwords!)
docker-compose config > /tmp/greenstack-config.yml

# Resource usage
docker stats --no-stream > /tmp/greenstack-stats.txt
```

### Support Channels
- GitHub Issues: https://github.com/your-org/greenstack/issues
- Documentation: https://greenstack.example.com/docs
- Emergency: [On-call contact]
```

**❌ THIS DOCUMENT DOES NOT EXIST**

---

## Critical Production Readiness Gaps

### Security Vulnerabilities

| ID | Severity | Component | Issue | Impact |
|----|----------|-----------|-------|--------|
| PROD-SEC-01 | CRITICAL | SSL/TLS | No production certificates | Unencrypted HTTP traffic |
| PROD-SEC-02 | CRITICAL | Credentials | Weak defaults hardcoded | Easy compromise |
| PROD-SEC-03 | HIGH | Database | Port exposed to host | Attack surface |
| PROD-SEC-04 | HIGH | Configuration | No secrets rotation | Long-term credential exposure |
| PROD-SEC-05 | MEDIUM | CORS | Overly permissive | XSS vulnerability |
| PROD-SEC-06 | MEDIUM | Rate Limiting | Not implemented | DoS vulnerability |

### Operational Vulnerabilities

| ID | Severity | Component | Issue | Impact |
|----|----------|-----------|-------|--------|
| PROD-OPS-01 | CRITICAL | Backups | No backup procedures | Guaranteed data loss |
| PROD-OPS-02 | CRITICAL | Monitoring | No alerting system | Blind operation |
| PROD-OPS-03 | CRITICAL | Disaster Recovery | No recovery plan | Extended downtime |
| PROD-OPS-04 | HIGH | Deployment | No automated deployment | Error-prone manual process |
| PROD-OPS-05 | HIGH | Load Testing | Not performed | Unknown capacity |
| PROD-OPS-06 | HIGH | Documentation | No runbook exists | Operational knowledge gap |
| PROD-OPS-07 | MEDIUM | Log Management | No centralization | Difficult debugging |
| PROD-OPS-08 | MEDIUM | Resource Limits | Not configured | Resource exhaustion risk |

### Functional Gaps

| ID | Severity | Component | Issue | Impact |
|----|----------|-----------|-------|--------|
| PROD-FUNC-01 | HIGH | Smoke Tests | No post-deployment tests | Broken deployments undetected |
| PROD-FUNC-02 | HIGH | Rollback | No rollback procedure | Can't recover from bad deploy |
| PROD-FUNC-03 | MEDIUM | Zero Downtime | No rolling deployment | Service interruption |
| PROD-FUNC-04 | MEDIUM | Health Checks | Basic only | Limited failure detection |

---

## Recommendations

### Priority 0 - Critical (Must Fix Before Production)

**P0-1: Implement Backup & Restore**
- **Effort:** 12 hours
- Create automated backup script
- Test restore procedure
- Configure S3 or equivalent offsite storage
- Set up backup monitoring
- Document disaster recovery procedures

**P0-2: Configure Production SSL/TLS**
- **Effort:** 4 hours
- Obtain production SSL certificates (Let's Encrypt)
- Configure Nginx reverse proxy
- Set up automatic certificate renewal
- Test HTTPS enforcement

**P0-3: Harden Production Configuration**
- **Effort:** 8 hours
- Remove all weak default passwords
- Fail fast if production credentials not set
- Close exposed database ports
- Add resource limits to all containers
- Configure log rotation

**P0-4: Set Up Monitoring & Alerting**
- **Effort:** 16 hours
- Deploy Prometheus + Grafana
- Configure alert rules
- Set up Sentry error tracking
- Configure uptime monitoring (UptimeRobot)
- Create application dashboard
- Set up notification channels (email, Slack)

**P0-5: Create Deployment Runbook**
- **Effort:** 8 hours
- Document step-by-step deployment procedure
- Create environment validation script
- Create smoke test suite
- Document rollback procedure
- Create troubleshooting guide

**P0-6: Implement Security Hardening**
- **Effort:** 6 hours
- Add rate limiting (slowapi)
- Restrict CORS to production domain
- Configure proper security headers
- Add request timeouts
- Implement file upload size limits

### Priority 1 - High (Fix Before Scale)

**P1-1: Perform Load Testing**
- **Effort:** 12 hours
- Create load testing scripts (Locust)
- Run baseline, normal, peak, stress tests
- Document performance benchmarks
- Identify bottlenecks
- Create capacity planning guide

**P1-2: Implement Log Aggregation**
- **Effort:** 8 hours
- Set up Loki or ELK stack
- Configure log shipping from containers
- Create log queries in Grafana
- Set up log-based alerts
- Configure retention policies

**P1-3: Create Production Docker Compose**
- **Effort:** 6 hours
- Create docker-compose.production.yml
- Add resource limits
- Configure logging
- Set up proper networking
- Remove exposed ports

**P1-4: Implement Database Backup**
- **Effort:** 8 hours
- Automated PostgreSQL dumps
- Backup uploaded files
- Test restore procedures
- Configure backup monitoring
- Set up backup retention

**P1-5: Add Application Metrics**
- **Effort:** 10 hours
- Implement Prometheus instrumentation
- Add custom business metrics
- Create performance dashboards
- Monitor database performance
- Track user behavior

### Priority 2 - Medium (Operational Excellence)

**P2-1: Implement CI/CD for Deployment**
- **Effort:** 16 hours
- GitHub Actions deployment workflow
- Automated smoke tests
- Blue-green deployment strategy
- Rollback automation
- Deployment notifications

**P2-2: Create Operational Documentation**
- **Effort:** 12 hours
- Runbook completion
- Troubleshooting guide
- Scaling guide
- Disaster recovery playbook
- On-call procedures

**P2-3: Implement Graceful Shutdown**
- **Effort:** 6 hours
- Handle SIGTERM properly
- Drain active connections
- Complete in-flight requests
- Update documentation

**P2-4: Add Health Check Dashboard**
- **Effort:** 4 hours
- Public status page
- Service health indicators
- Recent incident history
- Scheduled maintenance calendar

**P2-5: Implement Secrets Rotation**
- **Effort:** 8 hours
- Document rotation procedure
- Implement zero-downtime rotation
- Set rotation schedule
- Monitor expiration

---

## Implementation Roadmap

### Week 1: Critical Production Readiness (54 hours)
- **Days 1-2:** Implement backup & restore (P0-1: 12h) + SSL/TLS (P0-2: 4h)
- **Day 3:** Harden configuration (P0-3: 8h) + Deployment runbook (P0-5: 8h)
- **Days 4-5:** Set up monitoring & alerting (P0-4: 16h)
- **Day 6:** Security hardening (P0-6: 6h)
- **Day 7:** Testing and validation

### Week 2: Operational Preparedness (44 hours)
- **Days 1-2:** Load testing (P1-1: 12h) + Log aggregation (P1-2: 8h)
- **Day 3:** Production Docker Compose (P1-3: 6h) + Database backup (P1-4: 8h)
- **Days 4-5:** Application metrics (P1-5: 10h)
- **Day 6-7:** Documentation and training

### Week 3: Operational Excellence (38 hours)
- **Days 1-2:** CI/CD deployment (P2-1: 16h)
- **Days 3-4:** Operational documentation (P2-2: 12h)
- **Day 5:** Graceful shutdown (P2-3: 6h) + Health dashboard (P2-4: 4h)
- **Day 6-7:** Testing, validation, and go-live preparation

### Total Effort: 136 hours (~3.5 weeks with 2 engineers)

---

## Production Go-Live Checklist

### Pre-Launch (1 Week Before)

Infrastructure:
- [ ] Production server provisioned and secured
- [ ] SSL certificates obtained and configured
- [ ] DNS records configured
- [ ] Firewall rules configured
- [ ] Monitoring systems deployed and tested
- [ ] Backup systems configured and tested
- [ ] Alert channels tested (email, Slack)

Application:
- [ ] All production credentials generated and secured
- [ ] Environment configuration reviewed
- [ ] Database migrations tested
- [ ] Load testing completed and documented
- [ ] Security scan completed (no criticals)
- [ ] Performance benchmarks documented

Documentation:
- [ ] Deployment runbook completed
- [ ] Troubleshooting guide completed
- [ ] Disaster recovery plan documented
- [ ] On-call procedures defined

### Launch Day

**Phase 1: Deployment (Hour 0-2)**
- [ ] Maintenance window announced
- [ ] Final backup of staging environment
- [ ] Deploy to production following runbook
- [ ] Run smoke tests
- [ ] Verify all services healthy

**Phase 2: Verification (Hour 2-4)**
- [ ] Test user authentication
- [ ] Test IODD file upload and parsing
- [ ] Test device search
- [ ] Test all critical paths
- [ ] Monitor error rates in Sentry
- [ ] Monitor performance in Grafana

**Phase 3: Monitoring (Hour 4-24)**
- [ ] Monitor application logs
- [ ] Monitor system resources
- [ ] Monitor user reports
- [ ] Be ready for rollback if needed

### Post-Launch (First Week)

- [ ] Daily review of metrics and alerts
- [ ] Daily review of error logs
- [ ] User feedback collection
- [ ] Performance optimization based on real usage
- [ ] Documentation updates based on issues encountered
- [ ] Team retrospective on deployment

---

## Conclusion

GreenStack is **NOT production-ready** in its current state. Critical gaps exist in:

1. **Backup & Disaster Recovery** - No procedures, guaranteed data loss
2. **Monitoring & Alerting** - Blind operation, no incident detection
3. **Security Hardening** - Weak credentials, no TLS, exposed services
4. **Operational Documentation** - No runbooks, playbooks, or procedures
5. **Load Testing** - Unknown capacity and performance characteristics
6. **Deployment Automation** - Manual, error-prone processes

**Minimum Requirements for Production:**
- Complete all P0 tasks (54 hours of work)
- Test backup and restore procedures
- Perform load testing
- Document operational procedures
- Set up 24/7 monitoring and alerting

**Recommended Path:**
- Allocate 3 weeks for production hardening
- Follow the 3-week implementation roadmap
- Conduct thorough testing at each phase
- Perform a pilot deployment before full launch

**Risk Assessment:**
- **Current Risk Level:** CRITICAL - Do not deploy to production
- **After P0 Fixes:** MEDIUM - Suitable for controlled pilot
- **After All Fixes:** LOW - Ready for production deployment

**Estimated Time to Production Ready:** 3-4 weeks of focused effort

---

**Report Generated:** 2025-11-18
**Auditor:** Claude (Anthropic)
**Next Phase:** Phase 18 - Final Review
