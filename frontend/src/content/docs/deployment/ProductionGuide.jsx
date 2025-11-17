import React from 'react';
import { Rocket, Server, Lock, FileCheck, AlertCircle, Shield } from 'lucide-react';
import DocsPage from '../../../components/docs/DocsPage';
import DocsHero from '../../../components/docs/DocsHero';
import DocsSection from '../../../components/docs/DocsSection';
import DocsCallout from '../../../components/docs/DocsCallout';
import { DocsParagraph, DocsList, DocsLink } from '../../../components/docs/DocsText';
import DocsCodeBlock from '../../../components/docs/DocsCodeBlock';
import DocsSteps from '../../../components/docs/DocsSteps';
import DocsTabs from '../../../components/docs/DocsTabs';

export const metadata = {
  id: 'deployment/production-guide',
  title: 'Production Deployment',
  description: 'Complete guide to deploying Greenstack to production environments with best practices',
  category: 'deployment',
  order: 1,
  keywords: ['deployment', 'production', 'docker', 'nginx', 'ssl', 'systemd', 'server'],
  lastUpdated: '2025-01-17',
};

export default function ProductionGuide() {
  return (
    <DocsPage>
      <DocsHero
        title="Production Deployment"
        description="Deploy Greenstack to production environments with confidence"
        icon={<Rocket className="w-12 h-12 text-brand-green" />}
      />

      <DocsSection title="Deployment Options">
        <DocsParagraph>
          Greenstack offers flexible deployment options to suit different infrastructure requirements.
        </DocsParagraph>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          <div className="border border-border rounded-lg p-4">
            <div className="w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center mb-3">
              <Server className="w-6 h-6 text-brand-green" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">Docker (Recommended)</h4>
            <DocsList
              items={[
                'Easy setup and updates',
                'Consistent environment',
                'Resource isolation',
                'Simple scaling',
              ]}
              className="text-sm"
            />
          </div>

          <div className="border border-border rounded-lg p-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
              <Server className="w-6 h-6 text-blue-500" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">Manual Deployment</h4>
            <DocsList
              items={[
                'Full control over environment',
                'No Docker overhead',
                'Direct access to all components',
              ]}
              className="text-sm"
            />
          </div>

          <div className="border border-border rounded-lg p-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-3">
              <Server className="w-6 h-6 text-purple-500" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">Cloud Platforms</h4>
            <DocsList
              items={[
                'Managed infrastructure',
                'Auto-scaling capabilities',
                'High availability',
                'Built-in monitoring',
              ]}
              className="text-sm"
            />
          </div>
        </div>
      </DocsSection>

      <DocsSection title="Prerequisites">
        <DocsParagraph>
          Before deploying to production, ensure your server meets these requirements:
        </DocsParagraph>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="border border-border rounded-lg p-4">
            <h5 className="font-semibold text-foreground mb-2">Software Requirements</h5>
            <DocsList
              items={[
                'Linux server (Ubuntu 22.04+ recommended)',
                'Python 3.10 or higher',
                'Node.js 18 or higher',
                'Nginx (reverse proxy)',
                'Git for source control',
              ]}
              className="text-sm"
            />
          </div>

          <div className="border border-border rounded-lg p-4">
            <h5 className="font-semibold text-foreground mb-2">Hardware Requirements</h5>
            <DocsList
              items={[
                'Storage: 10GB minimum',
                'Memory: 2GB RAM minimum, 4GB recommended',
                'CPU: 2 cores minimum',
                'Network: Static IP or domain name',
              ]}
              className="text-sm"
            />
          </div>
        </div>
      </DocsSection>

      <DocsSection title="Manual Production Deployment">
        <DocsParagraph>
          Follow these steps to deploy Greenstack manually on a Linux server.
        </DocsParagraph>

        <DocsSteps
          steps={[
            {
              title: 'Prepare Server',
              description: 'Update system and install dependencies',
              content: (
                <DocsCodeBlock language="bash">
{`# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3.10 python3-pip python3-venv nodejs npm git nginx

# Install certbot for SSL
sudo apt install -y certbot python3-certbot-nginx`}
                </DocsCodeBlock>
              ),
            },
            {
              title: 'Create Application User',
              description: 'Create dedicated user for security',
              content: (
                <DocsCodeBlock language="bash">
{`# Create user without login shell
sudo useradd -r -s /bin/false greenstack

# Create application directory
sudo mkdir -p /opt/greenstack
sudo chown greenstack:greenstack /opt/greenstack`}
                </DocsCodeBlock>
              ),
            },
            {
              title: 'Deploy Application',
              description: 'Clone and build the application',
              content: (
                <DocsCodeBlock language="bash">
{`# Switch to application directory
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
cd ..`}
                </DocsCodeBlock>
              ),
            },
          ]}
          className="my-6"
        />

        <DocsCallout type="tip" title="For Docker Deployment">
          <DocsParagraph>
            If you prefer containerized deployment, skip the manual steps above and see the Docker deployment section below.
          </DocsParagraph>
        </DocsCallout>
      </DocsSection>

      <DocsSection title="Production Configuration">
        <DocsParagraph>
          Configure the application for production with security hardening and performance optimization.
        </DocsParagraph>

        <DocsTabs
          tabs={[
            {
              label: 'Environment',
              content: (
                <div className="space-y-3">
                  <DocsParagraph>
                    Create a production <code>.env</code> file with security best practices:
                  </DocsParagraph>
                  <DocsCodeBlock language="bash">
{`# Application
ENVIRONMENT=production
DEBUG=false
APP_NAME=Greenstack

# API Server
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=false
API_WORKERS=4

# Database (use absolute paths)
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
SHOW_ERROR_DETAILS=false

# Performance
CACHE_ENABLED=true
COMPRESSION_LEVEL=6`}
                  </DocsCodeBlock>
                </div>
              ),
            },
            {
              label: 'Systemd Service',
              content: (
                <div className="space-y-3">
                  <DocsParagraph>
                    Create a systemd service for automatic startup and management:
                  </DocsParagraph>
                  <DocsCodeBlock language="ini" title="/etc/systemd/system/greenstack.service">
{`[Unit]
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
WantedBy=multi-user.target`}
                  </DocsCodeBlock>
                  <DocsCodeBlock language="bash" title="Enable and start service">
{`# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable greenstack

# Start service
sudo systemctl start greenstack

# Check status
sudo systemctl status greenstack`}
                  </DocsCodeBlock>
                </div>
              ),
            },
            {
              label: 'Nginx',
              content: (
                <div className="space-y-3">
                  <DocsParagraph>
                    Configure Nginx as a reverse proxy with SSL termination:
                  </DocsParagraph>
                  <DocsCodeBlock language="nginx" title="/etc/nginx/sites-available/greenstack">
{`server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL certificates (configured by certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Serve frontend static files
    location / {
        root /opt/greenstack/frontend/dist;
        try_files $uri $uri/ /index.html;

        # Cache static assets
        location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Proxy API requests
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts for large uploads
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Max upload size
    client_max_body_size 10M;
}`}
                  </DocsCodeBlock>
                  <DocsCodeBlock language="bash" title="Enable site">
{`# Enable site
sudo ln -s /etc/nginx/sites-available/greenstack /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx`}
                  </DocsCodeBlock>
                </div>
              ),
            },
          ]}
          className="my-6"
        />
      </DocsSection>

      <DocsSection title="SSL Certificate">
        <DocsParagraph>
          Secure your deployment with free SSL certificates from Let's Encrypt.
        </DocsParagraph>

        <DocsCodeBlock language="bash" className="my-4">
{`# Get Let's Encrypt certificate
sudo certbot --nginx -d yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run`}
        </DocsCodeBlock>

        <DocsCallout type="success" title="Automatic Renewal">
          <DocsParagraph>
            Certbot automatically configures a systemd timer for certificate renewal. Certificates will be renewed
            automatically before expiration.
          </DocsParagraph>
        </DocsCallout>
      </DocsSection>

      <DocsSection title="Production Checklist">
        <DocsParagraph>
          Verify all security and performance settings before going live:
        </DocsParagraph>

        <div className="my-6 space-y-2">
          <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
            <FileCheck className="w-5 h-5 text-brand-green flex-shrink-0" />
            <span className="text-sm text-foreground">Environment set to production</span>
          </div>
          <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
            <Lock className="w-5 h-5 text-brand-green flex-shrink-0" />
            <span className="text-sm text-foreground">Debug mode disabled</span>
          </div>
          <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
            <Shield className="w-5 h-5 text-brand-green flex-shrink-0" />
            <span className="text-sm text-foreground">CORS restricted to specific domains</span>
          </div>
          <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
            <Lock className="w-5 h-5 text-brand-green flex-shrink-0" />
            <span className="text-sm text-foreground">SSL/TLS certificate installed and valid</span>
          </div>
          <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
            <Shield className="w-5 h-5 text-brand-green flex-shrink-0" />
            <span className="text-sm text-foreground">Firewall configured</span>
          </div>
          <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
            <FileCheck className="w-5 h-5 text-brand-green flex-shrink-0" />
            <span className="text-sm text-foreground">Database backed up</span>
          </div>
          <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
            <Server className="w-5 h-5 text-brand-green flex-shrink-0" />
            <span className="text-sm text-foreground">Monitoring enabled</span>
          </div>
        </div>
      </DocsSection>

      <DocsSection title="Maintenance">
        <DocsParagraph>
          Regular maintenance tasks to keep your deployment running smoothly.
        </DocsParagraph>

        <DocsTabs
          tabs={[
            {
              label: 'Updates',
              content: (
                <div className="space-y-3">
                  <DocsCodeBlock language="bash" title="Update Application">
{`# Stop service
sudo systemctl stop greenstack

# Backup database
sudo -u greenstack cp /opt/greenstack/data/greenstack.db \\
    /opt/greenstack/data/backups/greenstack.db.$(date +%Y%m%d%H%M%S)

# Pull latest code
cd /opt/greenstack
sudo -u greenstack git pull origin main

# Update dependencies
sudo -u greenstack venv/bin/pip install -r requirements.txt --upgrade

# Rebuild frontend
cd frontend && sudo -u greenstack npm install && sudo -u greenstack npm run build && cd ..

# Run migrations
sudo -u greenstack venv/bin/alembic upgrade head

# Restart service
sudo systemctl start greenstack`}
                  </DocsCodeBlock>
                </div>
              ),
            },
            {
              label: 'Logs',
              content: (
                <div className="space-y-3">
                  <DocsCodeBlock language="bash" title="View Logs">
{`# Application logs (systemd)
sudo journalctl -u greenstack -f

# Nginx access logs
sudo tail -f /var/log/nginx/greenstack-access.log

# Nginx error logs
sudo tail -f /var/log/nginx/greenstack-error.log

# Application log file
sudo tail -f /opt/greenstack/data/logs/app.log`}
                  </DocsCodeBlock>
                </div>
              ),
            },
            {
              label: 'Backups',
              content: (
                <div className="space-y-3">
                  <DocsParagraph>
                    Automated backup script to run daily via cron:
                  </DocsParagraph>
                  <DocsCodeBlock language="bash" title="/opt/greenstack/scripts/backup.sh">
{`#!/bin/bash
BACKUP_DIR="/opt/greenstack/data/backups"
DATE=$(date +%Y%m%d%H%M%S)

mkdir -p "$BACKUP_DIR"

# Backup database
cp /opt/greenstack/data/greenstack.db "$BACKUP_DIR/greenstack.db.$DATE"

# Backup IODD files
tar -czf "$BACKUP_DIR/storage.$DATE.tar.gz" /opt/greenstack/data/storage

# Keep only last 7 days
find "$BACKUP_DIR" -name "*.db.*" -mtime +7 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"`}
                  </DocsCodeBlock>
                  <DocsCodeBlock language="bash" title="Add to crontab">
{`# Make executable
chmod +x /opt/greenstack/scripts/backup.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
# Add line:
0 2 * * * /opt/greenstack/scripts/backup.sh >> /var/log/greenstack-backup.log 2>&1`}
                  </DocsCodeBlock>
                </div>
              ),
            },
          ]}
          className="my-6"
        />
      </DocsSection>

      <DocsSection title="Security Best Practices">
        <DocsParagraph>
          Follow these security best practices for production deployments:
        </DocsParagraph>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <DocsCallout type="warning" title="System Security">
            <DocsList
              items={[
                'Keep system and dependencies updated',
                'Use strong firewall rules (ufw/iptables)',
                'Enable HTTPS only, disable HTTP',
                'Use fail2ban for brute-force protection',
              ]}
              className="text-sm"
            />
          </DocsCallout>

          <DocsCallout type="warning" title="Application Security">
            <DocsList
              items={[
                'Restrict CORS to specific domains',
                'Disable API documentation in production',
                'Implement rate limiting',
                'Regular security audits',
              ]}
              className="text-sm"
            />
          </DocsCallout>
        </div>
      </DocsSection>

      <DocsSection title="Troubleshooting">
        <DocsCallout type="error" title="Service Won't Start">
          <DocsCodeBlock language="bash">
{`# Check logs
sudo journalctl -u greenstack -n 50

# Check permissions
ls -la /opt/greenstack/data

# Verify configuration
sudo -u greenstack /opt/greenstack/venv/bin/python -c "from config import print_config; print_config()"`}
          </DocsCodeBlock>
        </DocsCallout>
      </DocsSection>

      <DocsSection title="Next Steps">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-6">
          <DocsLink href="/docs/user-guide/configuration" external={false} className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">Configuration Guide</h5>
            <p className="text-sm text-muted-foreground">Environment variables and settings</p>
          </DocsLink>

          <DocsLink href="/docs/user-guide/troubleshooting" external={false} className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">Troubleshooting</h5>
            <p className="text-sm text-muted-foreground">Common issues and solutions</p>
          </DocsLink>

          <DocsLink href="/docs/architecture/overview" external={false} className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">Architecture</h5>
            <p className="text-sm text-muted-foreground">System architecture and design</p>
          </DocsLink>

          <DocsLink href="/docs/api/overview" external={false} className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">API Documentation</h5>
            <p className="text-sm text-muted-foreground">Complete REST API reference</p>
          </DocsLink>
        </div>
      </DocsSection>
    </DocsPage>
  );
}
