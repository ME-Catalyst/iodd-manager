"""
Celery application configuration for GreenStack background tasks.

This module configures Celery for asynchronous task processing with:
- Automatic retries with exponential backoff
- Task timeout handling
- Dead letter queue for failed tasks
- Redis as message broker and result backend
"""

import os
from celery import Celery
from kombu import Exchange, Queue

# Get Redis URL from environment or use default
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Create Celery application
celery_app = Celery(
    "greenstack",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["src.tasks.iodd_tasks", "src.tasks.generation_tasks", "src.tasks.export_tasks"]
)

# Celery Configuration
celery_app.conf.update(
    # Task result settings
    result_expires=3600,  # Results expire after 1 hour
    result_backend_transport_options={'master_name': 'mymaster'},

    # Task execution settings
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,

    # Task timeout settings
    task_soft_time_limit=300,  # Soft timeout: 5 minutes
    task_time_limit=600,  # Hard timeout: 10 minutes

    # Task acknowledgment settings
    task_acks_late=True,  # Acknowledge task after completion
    task_reject_on_worker_lost=True,  # Reject tasks if worker dies

    # Retry settings
    task_default_retry_delay=60,  # Default retry delay: 1 minute
    task_max_retries=3,  # Maximum retry attempts

    # Dead Letter Queue configuration
    task_default_queue="default",
    task_queues=(
        Queue("default", Exchange("default"), routing_key="default"),
        Queue("celery_dlq", Exchange("celery_dlq"), routing_key="celery_dlq"),
    ),

    # Worker settings
    worker_prefetch_multiplier=4,  # Number of tasks to prefetch
    worker_max_tasks_per_child=1000,  # Restart worker after N tasks
    worker_disable_rate_limits=False,

    # Monitoring
    worker_send_task_events=True,  # Enable task events for Flower
    task_send_sent_event=True,

    # Task routing
    task_routes={
        "src.tasks.iodd_tasks.*": {"queue": "default"},
        "src.tasks.generation_tasks.*": {"queue": "default"},
        "src.tasks.export_tasks.*": {"queue": "default"},
    },
)

# Auto-retry configuration with exponential backoff
celery_app.conf.task_autoretry_for = (Exception,)
celery_app.conf.task_retry_kwargs = {
    'max_retries': 3,
    'countdown': 60,  # Initial retry delay
}
celery_app.conf.task_retry_backoff = True  # Enable exponential backoff
celery_app.conf.task_retry_backoff_max = 600  # Max retry delay: 10 minutes
celery_app.conf.task_retry_jitter = True  # Add jitter to prevent thundering herd


def send_to_dlq(task_id: str, task_name: str, args: tuple, kwargs: dict, exception: Exception):
    """
    Send failed task to Dead Letter Queue.

    Args:
        task_id: Celery task ID
        task_name: Name of the failed task
        args: Task positional arguments
        kwargs: Task keyword arguments
        exception: Exception that caused the failure
    """
    from datetime import datetime

    dlq_message = {
        "task_id": task_id,
        "task_name": task_name,
        "args": args,
        "kwargs": kwargs,
        "exception": str(exception),
        "exception_type": type(exception).__name__,
        "failed_at": datetime.utcnow().isoformat(),
    }

    # Send to dead letter queue
    celery_app.send_task(
        "src.tasks.dlq_handler.process_dlq_message",
        args=[dlq_message],
        queue="celery_dlq",
    )


@celery_app.task(name="src.tasks.celery_app.health_check")
def health_check():
    """
    Health check task for monitoring Celery worker status.

    Returns:
        dict: Health status information
    """
    return {
        "status": "healthy",
        "worker": "running",
        "broker": REDIS_URL,
    }


if __name__ == "__main__":
    celery_app.start()
