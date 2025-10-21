from __future__ import annotations

from celery.schedules import crontab

# Centralised Celery beat schedule configuration to keep celery_app lean
BEAT_SCHEDULE = {
    'retrain-price-model': {
        'task': 'workers.tasks.retrain_price_model',
        'schedule': crontab(hour=2, minute=0),
        'options': {'queue': 'ml_jobs'},
    },
    'optimize-inventory': {
        'task': 'workers.tasks.optimize_inventory',
        'schedule': crontab(hour=3, minute=0),
        'options': {'queue': 'ml_jobs'},
    },
    'generate-daily-reports': {
        'task': 'workers.tasks.generate_daily_reports',
        'schedule': crontab(hour=4, minute=0),
        'options': {'queue': 'low_priority'},
    },
    'backup-database': {
        'task': 'workers.tasks.backup_database',
        'schedule': crontab(hour=5, minute=0),
        'options': {'queue': 'high_priority'},
    },
    'send-morning-digest': {
        'task': 'workers.tasks.send_morning_digest',
        'schedule': crontab(hour=6, minute=0),
        'options': {'queue': 'high_priority'},
    },
    'update-lead-scores': {
        'task': 'workers.tasks.update_lead_scores',
        'schedule': crontab(minute=0),
        'options': {'queue': 'default'},
    },
    'analyze-customer-behavior': {
        'task': 'workers.tasks.analyze_customer_behavior',
        'schedule': crontab(minute='*/15'),
        'options': {'queue': 'default'},
    },
    'process-notifications': {
        'task': 'workers.tasks.process_notification_queue',
        'schedule': crontab(minute='*/15'),
        'options': {'queue': 'high_priority'},
    },
    'sync-integrations': {
        'task': 'workers.tasks.sync_integrations',
        'schedule': crontab(minute=30),
        'options': {'queue': 'default'},
    },
    'cleanup-sessions': {
        'task': 'workers.tasks.cleanup_expired_sessions',
        'schedule': crontab(hour=1, minute=0),
        'options': {'queue': 'low_priority'},
    },
    'update-dashboard-cache': {
        'task': 'workers.tasks.update_dashboard_cache',
        'schedule': crontab(hour=0, minute=0),
        'options': {'queue': 'default'},
    },
}

__all__ = ['BEAT_SCHEDULE']
