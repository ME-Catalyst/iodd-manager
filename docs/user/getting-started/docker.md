# Docker Deployment Guide

Run IODD Manager in Docker containers for easy deployment and isolation.

## Prerequisites

- **Docker**: [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose**: [Install Docker Compose](https://docs.docker.com/compose/install/)

Verify installation:

```bash
docker --version
# Docker version 24.0.0+

docker-compose --version
# Docker Compose version 2.20.0+
```

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/ME-Catalyst/iodd-manager.git
cd iodd-manager
```

### 2. Start with Docker Compose

```bash
# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f iodd-manager
```

### 3. Access Application

- **Web Interface**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **API Base URL**: http://localhost:8000/api

### 4. Stop Services

```bash
# Stop containers
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

## Docker Architecture

### Multi-Stage Build

The Dockerfile uses a two-stage build for optimization:

```dockerfile
# Stage 1: Frontend Build
FROM node:18-alpine AS frontend-builder
# Builds React frontend with Vite

# Stage 2: Python Runtime
FROM python:3.10-slim
# Runs FastAPI backend, serves frontend
```

**Benefits:**

- Smaller final image (no Node.js in production)
- Faster builds (cached layers)
- Security (minimal attack surface)

### Image Structure

```
iodd-manager:latest
├── /app                    # Application code
│   ├── api.py             # FastAPI application
│   ├── iodd_manager.py    # Core parser
│   ├── config.py          # Configuration
│   ├── alembic/           # Database migrations
│   └── frontend/dist/     # Built React app
├── /data                   # Persistent data (volume)
│   ├── iodd_manager.db    # SQLite database
│   ├── storage/           # Uploaded IODD files
│   ├── generated/         # Generated adapters
│   └── logs/              # Application logs
└── /home/iodd             # Non-root user home
```

## Configuration

### Environment Variables

Configure via `docker-compose.yml`:

```yaml
services:
  iodd-manager:
    environment:
      - ENVIRONMENT=production
      - DEBUG=false
      - API_HOST=0.0.0.0
      - API_PORT=8000
      - IODD_DATABASE_URL=sqlite:////data/iodd_manager.db
      - IODD_STORAGE_DIR=/data/storage
      - GENERATED_OUTPUT_DIR=/data/generated
      - LOG_TO_FILE=true
      - LOG_FILE_PATH=/data/logs/app.log
      - LOG_LEVEL=INFO
      - ENABLE_DOCS=true
      - AUTO_MIGRATE=true
```

### Custom .env File

Mount a custom `.env` file:

```yaml
services:
  iodd-manager:
    volumes:
      - ./.env:/app/.env:ro  # Read-only
```

Then start:

```bash
docker-compose up -d
```

## Data Persistence

### Volume Configuration

Data is persisted using Docker volumes:

```yaml
volumes:
  iodd-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ./data  # Maps to ./data on host
```

### Directory Structure

```
data/
├── iodd_manager.db         # Database
├── storage/                # IODD files
│   └── vendor_12345/
│       └── device_67890.xml
├── generated/              # Adapters
│   └── nodered_12345_67890.json
└── logs/                   # Logs
    └── app.log
```

### Backup Data

```bash
# Stop container
docker-compose down

# Backup data directory
tar -czf iodd-manager-backup-$(date +%Y%m%d).tar.gz data/

# Restart container
docker-compose up -d
```

### Restore Data

```bash
# Stop container
docker-compose down

# Restore from backup
tar -xzf iodd-manager-backup-20250111.tar.gz

# Restart container
docker-compose up -d
```

## Building Custom Images

### Build from Source

```bash
# Build image
docker build -t iodd-manager:custom .

# Run container
docker run -d \
  --name iodd-manager \
  -p 8000:8000 \
  -v $(pwd)/data:/data \
  iodd-manager:custom
```

### Build Arguments

```bash
# Custom Python version
docker build \
  --build-arg PYTHON_VERSION=3.11 \
  -t iodd-manager:py311 .

# Custom Node version
docker build \
  --build-arg NODE_VERSION=20 \
  -t iodd-manager:node20 .
```

### Multi-Platform Builds

```bash
# Build for multiple architectures
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t iodd-manager:multi \
  --push .
```

## Production Deployment

### With Nginx Reverse Proxy

Uncomment the nginx service in `docker-compose.yml`:

```yaml
services:
  nginx:
    image: nginx:alpine
    container_name: iodd-manager-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - iodd-manager
    networks:
      - iodd-network
```

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream iodd_backend {
        server iodd-manager:8000;
    }

    server {
        listen 80;
        server_name your-domain.com;

        location / {
            proxy_pass http://iodd_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

Start with nginx:

```bash
docker-compose up -d nginx
```

### SSL/TLS with Let's Encrypt

Add certbot service:

```yaml
services:
  certbot:
    image: certbot/certbot
    volumes:
      - ./ssl/certbot/conf:/etc/letsencrypt
      - ./ssl/certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
```

Obtain certificate:

```bash
docker-compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  -d your-domain.com \
  --email your-email@example.com \
  --agree-tos
```

Update nginx to use SSL:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/certbot/conf/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/certbot/conf/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://iodd_backend;
        # ... proxy headers
    }
}
```

## Health Checks

### Container Health Check

Built-in health check in Dockerfile:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/api/health')" || exit 1
```

Check health status:

```bash
docker ps
# STATUS shows "healthy" or "unhealthy"

docker inspect --format='{{.State.Health.Status}}' iodd-manager
```

### Docker Compose Health Check

```yaml
healthcheck:
  test: ["CMD", "python", "-c", "import requests; requests.get('http://localhost:8000/api/health')"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## Monitoring

### View Logs

```bash
# Follow logs
docker-compose logs -f iodd-manager

# Last 100 lines
docker-compose logs --tail=100 iodd-manager

# Since specific time
docker-compose logs --since 2025-01-11T10:00:00 iodd-manager
```

### Container Stats

```bash
# Real-time stats
docker stats iodd-manager

# Output:
# CONTAINER ID   NAME           CPU %     MEM USAGE / LIMIT     MEM %
# abc123         iodd-manager   2.5%      150MiB / 2GiB         7.5%
```

### Execute Commands in Container

```bash
# Open shell
docker exec -it iodd-manager sh

# Run Python command
docker exec iodd-manager python -c "from config import print_config; print_config()"

# Check database
docker exec iodd-manager ls -lh /data/iodd_manager.db
```

## Troubleshooting

### Container Won't Start

Check logs:

```bash
docker-compose logs iodd-manager
```

Common issues:

**Port already in use:**

```bash
# Change port in docker-compose.yml
ports:
  - "9000:8000"  # Host:Container
```

**Permission denied:**

```bash
# Fix data directory permissions
chmod 755 data/
chown -R 1000:1000 data/
```

**Database locked:**

```bash
# Stop all containers
docker-compose down

# Remove database lock file
rm data/iodd_manager.db-shm
rm data/iodd_manager.db-wal

# Restart
docker-compose up -d
```

### Container Keeps Restarting

Check health:

```bash
docker inspect --format='{{json .State.Health}}' iodd-manager | jq
```

Disable health check temporarily:

```yaml
services:
  iodd-manager:
    healthcheck:
      disable: true
```

### High Memory Usage

Limit memory:

```yaml
services:
  iodd-manager:
    deploy:
      resources:
        limits:
          memory: 512M
```

### Slow Performance

Increase workers:

```yaml
environment:
  - API_WORKERS=4  # Match CPU cores
```

## Advanced Topics

### Custom Dockerfile

Extend the base image:

```dockerfile
FROM iodd-manager:latest

# Install additional packages
USER root
RUN apt-get update && apt-get install -y postgresql-client
USER iodd

# Copy custom scripts
COPY --chown=iodd:iodd scripts/ /app/scripts/

# Override entrypoint
CMD ["python", "custom_start.py"]
```

Build:

```bash
docker build -f Dockerfile.custom -t iodd-manager:custom .
```

### Docker Swarm Deployment

Create stack file `docker-stack.yml`:

```yaml
version: '3.8'

services:
  iodd-manager:
    image: iodd-manager:latest
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
    networks:
      - iodd-network

networks:
  iodd-network:
    driver: overlay
```

Deploy:

```bash
docker stack deploy -c docker-stack.yml iodd-stack
```

### Kubernetes Deployment

Create `k8s-deployment.yml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: iodd-manager
spec:
  replicas: 3
  selector:
    matchLabels:
      app: iodd-manager
  template:
    metadata:
      labels:
        app: iodd-manager
    spec:
      containers:
      - name: iodd-manager
        image: iodd-manager:latest
        ports:
        - containerPort: 8000
        env:
        - name: ENVIRONMENT
          value: "production"
        volumeMounts:
        - name: data
          mountPath: /data
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: iodd-manager-pvc
```

Deploy:

```bash
kubectl apply -f k8s-deployment.yml
```

## Best Practices

### Security

- [ ] Run as non-root user (already configured)
- [ ] Use read-only filesystems where possible
- [ ] Scan images for vulnerabilities
- [ ] Keep base images updated
- [ ] Use secrets for sensitive data

### Performance

- [ ] Use multi-stage builds (already configured)
- [ ] Optimize layer caching
- [ ] Use `.dockerignore` (already configured)
- [ ] Enable compression
- [ ] Configure appropriate resource limits

### Reliability

- [ ] Use health checks (already configured)
- [ ] Configure restart policies
- [ ] Implement logging
- [ ] Use persistent volumes
- [ ] Regular backups

## Next Steps

- **[Production Deployment](../../deployment/production.md)** - Deploy to production servers
- **[Monitoring](../../deployment/monitoring.md)** - Set up monitoring and alerts
- **[Environment Configuration](../../deployment/environment.md)** - Advanced environment setup
- **[API Documentation](../../developer/api/overview.md)** - Explore API capabilities
