"""Celery application configuration for Autolytiq background workers."""
from __future__ import annotations

import os

from celery import Celery

from .schedules import BEAT_SCHEDULE


def _redis_url() -> str:
    password = os.getenv('REDIS_PASSWORD')
    url = os.getenv('REDIS_URL')
    if url:
        return url
    if password:
        return f"redis://:{password}@localhost:6379/0"
    return 'redis://localhost:6379/0'


celery_app = Celery(
    'dms_workers',
    broker=_redis_url(),
    backend=_redis_url(),
    include=['workers.tasks'],
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,
    task_soft_time_limit=3300,
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_default_queue='default',
    task_default_priority=5,
    task_routes={
        'workers.tasks.send_email': {'queue': 'high_priority'},
        'workers.tasks.send_sms': {'queue': 'high_priority'},
        'workers.tasks.retrain_price_model': {'queue': 'ml_jobs'},
        'workers.tasks.optimize_inventory': {'queue': 'ml_jobs'},
        'workers.tasks.update_lead_scores': {'queue': 'default'},
        'workers.tasks.generate_daily_reports': {'queue': 'low_priority'},
        'workers.tasks.backup_database': {'queue': 'high_priority'},
    },
    beat_schedule=BEAT_SCHEDULE,
)


if __name__ == '__main__':
    celery_app.start()
