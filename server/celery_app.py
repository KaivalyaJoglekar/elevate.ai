from __future__ import annotations

from celery import Celery

from config import get_settings


settings = get_settings()

celery_app = Celery(
    'elevate_ai',
    broker=settings.redis_url(),
    backend=settings.redis_url(),
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone=settings.market_timezone,
    enable_utc=True,
    task_track_started=True,
    result_expires=settings.result_ttl_seconds,
    broker_connection_retry_on_startup=True,
    broker_transport_options={
        'socket_timeout': settings.redis_socket_timeout_seconds,
        'socket_connect_timeout': settings.redis_connect_timeout_seconds,
        'retry_on_timeout': False,
    },
)

celery_app.conf.imports = ('celery_worker',)
