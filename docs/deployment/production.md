# Production Deployment

Deploy Greenstack to production environments.

## Deployment Options

### 1. Docker Deployment (Recommended)

See [Docker Guide](docker.md) for containerized deployment.

**Pros:**
- Easy setup and updates
- Consistent environment
- Resource isolation
- Simple scaling

### 2. Manual Deployment

Deploy directly on server without Docker.

**Pros:**
- Full control over environment
- No Docker overhead
- Direct access to all components

### 3. Cloud Platforms

Deploy to cloud providers (AWS, Azure, GCP, etc.).

**Pros:**
- Managed infrastructure
- Auto-scaling
- High availability
- Backup and monitoring

## Prerequisites

- **Server**: Linux server (Ubuntu 22.04+ recommended)
- **Python**: 3.10 or higher
- **Node.js**: 18 or higher (for building frontend)
- **Storage**: 10GB minimum (more for large IODD collections)
- **Memory**: 2GB RAM minimum, 4GB recommended
- **Network**: Static IP or domain name

## Manual Production Deployment

### Step 1: Prepare Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3.10 python3-pip python3-venv nodejs npm git

# Install nginx (reverse proxy)
sudo apt install -y nginx

# Install certbot (SSL certificates)
sudo apt install -y certbot python3-certbot-nginx
```

### Step 2: Create Application User

```bash
# Create user without login shell
sudo useradd -r -s /bin/false greenstack

# Create application directory
sudo mkdir -p /opt/greenstack
sudo chown greenstack:greenstack /opt/greenstack
```

### Step 3: Deploy Application

```bash
# Switch to application directory
cd /opt/greenstack

# Clone repository
sudo -u greenstack git clone https://github.com/ME-Catalyst/greenstack.git .

# Create virtual environment
sudo -u greenstack python3 -m venv venv

# Install Python dependencies
sudo -u greenstack venv/bin/pip install -r requirements.txt

# Build frontend
cd frontend
sudo -u greenstack npm install
sudo -u greenstack npm run build
cd ..
```

### Step 4: Configure Application

```bash
# Create production configuration
sudo -u greenstack nano .env
```

**Production `.env`:**

```bash
# Application
ENVIRONMENT=production
DEBUG=false
APP_NAME=Greenstack
APP_VERSION=2.0.0

# API Server
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=false
API_WORKERS=4

# Database (use absolute path)
IODD_DATABASE_URL=sqlite:////opt/greenstack/data/greenstack.db

# Storage (use absolute paths)
IODD_STORAGE_DIR=/opt/greenstack/data/storage
GENERATED_OUTPUT_DIR=/opt/greenstack/data/generated

# Logging
LOG_LEVEL=INFO
LOG_TO_FILE=true
LOG_FILE_PATH=/opt/greenstack/data/logs/app.log
LOG_FORMAT=json

# Security
CORS_ORIGINS=https://yourdomain.com
ENABLE_DOCS=false

# Performance
ENABLE_COMPRESSION=true
COMPRESSION_LEVEL=6
CACHE_ENABLED=true
```

```bash
# Create data directories
sudo -u greenstack mkdir -p data/storage data/generated data/logs

# Set permissions
sudo chmod 755 data
sudo chmod 755 data/storage data/generated data/logs
```

### Step 5: Initialize Database

```bash
# Run migrations
sudo -u greenstack venv/bin/alembic upgrade head

# Verify database
sudo -u greenstack ls -lh data/greenstack.db
```

### Step 6: Create Systemd Service

```bash
sudo nano /etc/systemd/system/greenstack.service
```

**Service file:**

```ini
[Unit]
Description=Greenstack API Server
After=network.target

[Service]
Type=simple
User=greenstack
Group=greenstack
WorkingDirectory=/opt/greenstack
Environment="PATH=/opt/greenstack/venv/bin"
ExecStart=/opt/greenstack/venv/bin/python api.py

# Restart on failure
Restart=always
RestartSec=5

# Security hardening
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/greenstack/data

[Install]
WantedBy=multi-user.target
```

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable greenstack

# Start service
sudo systemctl start greenstack

# Check status
sudo systemctl status greenstack
```

### Step 7: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/greenstack
```

**Nginx configuration:**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL certificates (configured by certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Logging
    access_log /var/log/nginx/greenstack-access.log;
    error_log /var/log/nginx/greenstack-error.log;

    # Serve frontend static files
    location / {
        root /opt/greenstack/frontend/dist;
        try_files $uri $uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Proxy API requests
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Increase timeouts for large uploads
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    # API documentation (disable in production if needed)
    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
        proxy_set_header Host $host;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Max upload size
    client_max_body_size 10M;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/greenstack /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### Step 8: Obtain SSL Certificate

```bash
# Get Let's Encrypt certificate
sudo certbot --nginx -d yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Step 9: Configure Firewall

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### Step 10: Test Deployment

```bash
# Check API
curl https://yourdomain.com/api/health

# Check frontend
curl -I https://yourdomain.com

# Check service status
sudo systemctl status greenstack
sudo systemctl status nginx
```

## Production Checklist

Before going live:

- [ ] Environment set to production (`ENVIRONMENT=production`)
- [ ] Debug mode disabled (`DEBUG=false`)
- [ ] CORS restricted to specific domains
- [ ] API documentation disabled or restricted
- [ ] SSL/TLS certificate installed and valid
- [ ] Firewall configured
- [ ] Database backed up
- [ ] Logging configured
- [ ] Monitoring enabled
- [ ] Health checks working
- [ ] Error pages customized
- [ ] Capacity planning completed
- [ ] Backup strategy implemented
- [ ] Update procedures documented

## Maintenance

### Update Application

```bash
# Stop service
sudo systemctl stop greenstack

# Backup database
sudo -u greenstack cp /opt/greenstack/data/greenstack.db \
    /opt/greenstack/data/backups/greenstack.db.$(date +%Y%m%d%H%M%S)

# Pull latest code
cd /opt/greenstack
sudo -u greenstack git pull origin main

# Update dependencies
sudo -u greenstack venv/bin/pip install -r requirements.txt --upgrade

# Rebuild frontend
cd frontend
sudo -u greenstack npm install
sudo -u greenstack npm run build
cd ..

# Run migrations
sudo -u greenstack venv/bin/alembic upgrade head

# Restart service
sudo systemctl start greenstack

# Check status
sudo systemctl status greenstack
```

### View Logs

```bash
# Application logs
sudo journalctl -u greenstack -f

# Nginx access logs
sudo tail -f /var/log/nginx/greenstack-access.log

# Nginx error logs
sudo tail -f /var/log/nginx/greenstack-error.log

# Application log file
sudo tail -f /opt/greenstack/data/logs/app.log
```

### Restart Services

```bash
# Restart application
sudo systemctl restart greenstack

# Restart nginx
sudo systemctl restart nginx

# Restart both
sudo systemctl restart greenstack nginx
```

## Backup Strategy

### Automated Backup Script

```bash
#!/bin/bash
# /opt/greenstack/scripts/backup.sh

BACKUP_DIR="/opt/greenstack/data/backups"
DATE=$(date +%Y%m%d%H%M%S)

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup database
cp /opt/greenstack/data/greenstack.db "$BACKUP_DIR/greenstack.db.$DATE"

# Backup IODD files
tar -czf "$BACKUP_DIR/storage.$DATE.tar.gz" /opt/greenstack/data/storage

# Keep only last 7 days
find "$BACKUP_DIR" -name "*.db.*" -mtime +7 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
chmod +x /opt/greenstack/scripts/backup.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
# Add line:
0 2 * * * /opt/greenstack/scripts/backup.sh >> /var/log/greenstack-backup.log 2>&1
```

## Monitoring

See [Monitoring Guide](monitoring.md) for detailed monitoring setup.

## Scaling

### Vertical Scaling

Increase server resources:

```bash
# Increase API workers based on CPU cores
API_WORKERS=8

# Restart service
sudo systemctl restart greenstack
```

### Horizontal Scaling

Run multiple instances behind load balancer:

```
Load Balancer (nginx)
    ├─▶ Greenstack Instance 1
    ├─▶ Greenstack Instance 2
    └─▶ Greenstack Instance 3

Shared:
    ├─▶ Database (PostgreSQL cluster)
    └─▶ File Storage (NFS/S3)
```

## Security Best Practices

- Keep system and dependencies updated
- Use strong firewall rules
- Implement rate limiting
- Enable HTTPS only
- Restrict API access
- Regular security audits
- Monitor logs for suspicious activity
- Use fail2ban for brute-force protection

## Troubleshooting

### Service Won't Start

```bash
# Check logs
sudo journalctl -u greenstack -n 50

# Check permissions
ls -la /opt/greenstack/data

# Check configuration
sudo -u greenstack /opt/greenstack/venv/bin/python -c "from config import print_config; print_config()"
```

### High Memory Usage

```bash
# Check process
ps aux | grep python

# Reduce workers
# Edit .env: API_WORKERS=2
sudo systemctl restart greenstack
```

### Database Locked

```bash
# Check for stale locks
sudo -u greenstack rm /opt/greenstack/data/greenstack.db-shm
sudo -u greenstack rm /opt/greenstack/data/greenstack.db-wal
sudo systemctl restart greenstack
```

## Next Steps

- **[Docker Deployment](docker.md)** - Containerized deployment
- **[Environment Configuration](environment.md)** - Configuration management
- **[Monitoring](monitoring.md)** - Production monitoring
