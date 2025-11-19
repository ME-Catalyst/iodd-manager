#!/bin/bash
# Start Celery worker for GreenStack background tasks

echo "Starting Celery worker..."

# Set environment
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Start Celery worker with:
# - Loglevel: info
# - Concurrency: 4 workers
# - Queue: default (can be changed)
# - Autoscale: min 2, max 8 workers
celery -A src.celery_app worker \
    --loglevel=info \
    --concurrency=4 \
    --autoscale=8,2 \
    --max-tasks-per-child=1000 \
    --time-limit=600 \
    --soft-time-limit=300 \
    --queues=default,celery_dlq

# Alternative: Start with beat scheduler for periodic tasks
# celery -A src.celery_app worker --beat --loglevel=info
