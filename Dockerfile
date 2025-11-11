# Multi-stage Dockerfile for IODD Manager
# Optimized for production deployment

# ============================================================================
# Stage 1: Frontend Build
# ============================================================================
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy frontend source
COPY frontend/ ./

# Build frontend
RUN npm run build

# ============================================================================
# Stage 2: Python Runtime
# ============================================================================
FROM python:3.10-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    --no-install-recommends \
    gcc \
    libxml2-dev \
    libxslt-dev \
    && rm -rf /var/lib/apt/lists/*

# Create app user for security
RUN useradd -m -u 1000 iodd && \
    mkdir -p /app /data/storage /data/generated /data/logs && \
    chown -R iodd:iodd /app /data

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY --chown=iodd:iodd requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY --chown=iodd:iodd api.py iodd_manager.py start.py config.py ./
COPY --chown=iodd:iodd alembic.ini ./
COPY --chown=iodd:iodd alembic/ ./alembic/
COPY --chown=iodd:iodd .env.example ./.env.example

# Copy built frontend from previous stage
COPY --from=frontend-builder --chown=iodd:iodd /app/frontend/dist ./frontend/dist

# Create .env file with production defaults if not provided
RUN if [ ! -f .env ]; then \
    echo "ENVIRONMENT=production" > .env && \
    echo "DEBUG=false" >> .env && \
    echo "API_HOST=0.0.0.0" >> .env && \
    echo "API_PORT=8000" >> .env && \
    echo "IODD_DATABASE_URL=sqlite:////data/iodd_manager.db" >> .env && \
    echo "IODD_STORAGE_DIR=/data/storage" >> .env && \
    echo "GENERATED_OUTPUT_DIR=/data/generated" >> .env && \
    echo "LOG_TO_FILE=true" >> .env && \
    echo "LOG_FILE_PATH=/data/logs/app.log" >> .env; \
    fi

# Switch to non-root user
USER iodd

# Expose ports
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/api/health')" || exit 1

# Run database migrations and start application
CMD ["sh", "-c", "alembic upgrade head && python api.py"]
