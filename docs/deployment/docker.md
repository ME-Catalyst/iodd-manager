# Docker Deployment

This page provides production-specific Docker deployment information.

For basic Docker usage and quick start, see **[Getting Started - Docker](../user/getting-started/docker.md)**.

## Production Docker Setup

### Docker Compose Production Configuration

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  greenstack:
    image: greenstack:2.0.0
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
        - VCS_REF=$(git rev-parse --short HEAD)
    container_name: greenstack
    restart: always
    ports:
      - "127.0.0.1:8000:8000"  # Only listen on localhost
    volumes:
      - iodd-data:/data
      - ./config/production.env:/app/.env:ro
    environment:
      - ENVIRONMENT=production
      - DEBUG=false
      - AUTO_MIGRATE=true
    healthcheck:
      test: ["CMD", "python", "-c", "import requests; requests.get('http://localhost:8000/api/health')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - iodd-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    labels:
      - "com.greenstack.version=2.0.0"
      - "com.greenstack.environment=production"

  nginx:
    image: nginx:alpine
    container_name: greenstack-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./frontend/dist:/usr/share/nginx/html:ro
    depends_on:
      - greenstack
    networks:
      - iodd-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

volumes:
  iodd-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /opt/greenstack/data

networks:
  iodd-network:
    driver: bridge
```

### Production Dockerfile Optimizations

Enhance the Dockerfile for production:

```dockerfile
# Multi-stage Dockerfile for production
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production --no-audit
COPY frontend/ ./
RUN npm run build

# Production stage
FROM python:3.10-slim

# Labels
LABEL maintainer="your-email@example.com" \
      version="2.0.0" \
      description="Greenstack - IO-Link Device Description Manager"

# Install only required system packages
RUN apt-get update && apt-get install -y \
    --no-install-recommends \
    gcc \
    libxml2-dev \
    libxslt-dev \
    && rm -rf /var/lib/apt/lists/*

# Security: Create non-root user
RUN useradd -m -u 1000 -s /bin/bash iodd && \
    mkdir -p /app /data/storage /data/generated /data/logs && \
    chown -R iodd:iodd /app /data

WORKDIR /app

# Install Python dependencies
COPY --chown=iodd:iodd requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY --chown=iodd:iodd api.py greenstack.py start.py config.py ./
COPY --chown=iodd:iodd alembic.ini ./
COPY --chown=iodd:iodd alembic/ ./alembic/

# Copy built frontend
COPY --from=frontend-builder --chown=iodd:iodd /app/frontend/dist ./frontend/dist

# Switch to non-root user
USER iodd

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/api/health')" || exit 1

# Start application
CMD ["sh", "-c", "alembic upgrade head && python api.py"]
```

### Build and Deploy

```bash
# Build production image
docker build -t greenstack:2.0.0 -f Dockerfile .

# Tag for registry
docker tag greenstack:2.0.0 yourdomain.com/greenstack:2.0.0
docker tag greenstack:2.0.0 yourdomain.com/greenstack:latest

# Push to registry
docker push yourdomain.com/greenstack:2.0.0
docker push yourdomain.com/greenstack:latest

# Deploy on production server
docker-compose -f docker-compose.prod.yml up -d
```

## Container Orchestration

### Docker Swarm

Deploy as Docker Swarm stack:

```yaml
# docker-stack.yml
version: '3.8'

services:
  greenstack:
    image: yourdomain.com/greenstack:2.0.0
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
        failure_action: rollback
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    volumes:
      - iodd-data:/data
    networks:
      - iodd-network

  nginx:
    image: nginx:alpine
    deploy:
      replicas: 2
      placement:
        constraints:
          - node.role == manager
    ports:
      - "80:80"
      - "443:443"
    networks:
      - iodd-network

volumes:
  iodd-data:
    driver: local

networks:
  iodd-network:
    driver: overlay
```

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-stack.yml iodd-stack

# Check services
docker stack services iodd-stack

# Scale services
docker service scale iodd-stack_greenstack=5

# Update service
docker service update --image yourdomain.com/greenstack:2.0.1 iodd-stack_greenstack
```

### Kubernetes

Deploy to Kubernetes:

```yaml
# k8s-deployment.yml
apiVersion: v1
kind: Namespace
metadata:
  name: greenstack
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: greenstack-config
  namespace: greenstack
data:
  ENVIRONMENT: "production"
  DEBUG: "false"
  API_HOST: "0.0.0.0"
  API_PORT: "8000"
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: greenstack-pvc
  namespace: greenstack
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: greenstack
  namespace: greenstack
spec:
  replicas: 3
  selector:
    matchLabels:
      app: greenstack
  template:
    metadata:
      labels:
        app: greenstack
    spec:
      containers:
      - name: greenstack
        image: yourdomain.com/greenstack:2.0.0
        ports:
        - containerPort: 8000
        envFrom:
        - configMapRef:
            name: greenstack-config
        volumeMounts:
        - name: data
          mountPath: /data
        livenessProbe:
          httpGet:
            path: /api/health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "2"
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: greenstack-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: greenstack-service
  namespace: greenstack
spec:
  selector:
    app: greenstack
  ports:
  - protocol: TCP
    port: 8000
    targetPort: 8000
  type: LoadBalancer
```

```bash
# Apply configuration
kubectl apply -f k8s-deployment.yml

# Check deployment
kubectl get pods -n greenstack
kubectl get services -n greenstack

# Scale deployment
kubectl scale deployment greenstack --replicas=5 -n greenstack

# Update image
kubectl set image deployment/greenstack greenstack=yourdomain.com/greenstack:2.0.1 -n greenstack

# View logs
kubectl logs -f deployment/greenstack -n greenstack
```

## Container Security

### Security Best Practices

1. **Use non-root user** (already implemented)
2. **Scan for vulnerabilities**:

```bash
# Scan with Trivy
trivy image greenstack:2.0.0

# Scan with Snyk
snyk container test greenstack:2.0.0
```

3. **Use minimal base images**:

```dockerfile
FROM python:3.10-slim  # Not 'python:3.10' (much larger)
```

4. **Read-only filesystem**:

```yaml
services:
  greenstack:
    read_only: true
    tmpfs:
      - /tmp
    volumes:
      - iodd-data:/data:rw
```

5. **Drop capabilities**:

```yaml
services:
  greenstack:
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

## Monitoring in Docker

### Container Metrics

```bash
# Real-time stats
docker stats greenstack

# Inspect resource usage
docker inspect greenstack | jq '.[0].HostConfig.Memory'
```

### Logging

```bash
# View logs
docker logs greenstack -f --tail=100

# Export logs
docker logs greenstack > greenstack.log 2>&1
```

### Health Checks

```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' greenstack

# View health check history
docker inspect --format='{{json .State.Health}}' greenstack | jq
```

## Backup in Docker

```bash
#!/bin/bash
# backup-docker.sh

# Backup data volume
docker run --rm \
  -v iodd-data:/data \
  -v $(pwd)/backups:/backup \
  alpine \
  tar czf /backup/iodd-data-$(date +%Y%m%d).tar.gz /data

# Backup database only
docker exec greenstack \
  sh -c 'tar czf - /data/greenstack.db' > backup-$(date +%Y%m%d).tar.gz
```

## Performance Tuning

### Resource Limits

```yaml
services:
  greenstack:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Network Optimization

```yaml
services:
  greenstack:
    sysctls:
      - net.core.somaxconn=1024
      - net.ipv4.tcp_tw_reuse=1
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs greenstack

# Check if port is available
sudo lsof -i :8000

# Inspect container
docker inspect greenstack
```

### Permission Issues

```bash
# Check volume permissions
docker exec greenstack ls -la /data

# Fix permissions
docker exec -u root greenstack chown -R iodd:iodd /data
```

### Network Issues

```bash
# Check network
docker network inspect iodd-network

# Test connectivity
docker exec greenstack ping nginx
```

## Next Steps

- **[Production Deployment](production.md)** - Manual production deployment
- **[Environment Configuration](environment.md)** - Configuration management
- **[Monitoring](monitoring.md)** - Production monitoring
- **[Getting Started - Docker](../user/getting-started/docker.md)** - Docker basics
