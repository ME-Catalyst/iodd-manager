#!/bin/bash
# Start Flower monitoring dashboard for Celery tasks

echo "Starting Flower monitoring dashboard..."

# Set environment
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Start Flower with:
# - Port: 5555
# - Broker: Redis
# - Basic authentication (optional)
# - URL prefix (for reverse proxy)
celery -A src.celery_app flower \
    --port=5555 \
    --broker="${REDIS_URL:-redis://localhost:6379/0}" \
    --basic_auth="${FLOWER_USER:-admin}:${FLOWER_PASSWORD:-admin}" \
    --url_prefix=/flower \
    --max_tasks=10000 \
    --persistent=True \
    --db=/tmp/flower.db

# Access Flower at: http://localhost:5555
echo ""
echo "Flower dashboard available at: http://localhost:5555"
echo "Default credentials: admin / admin"
echo ""
