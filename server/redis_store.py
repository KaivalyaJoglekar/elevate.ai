from __future__ import annotations

import json
import time
from collections import OrderedDict
from threading import Lock
from typing import Any

try:
    from redis import Redis
    from redis.asyncio import Redis as AsyncRedis
except ImportError:  # pragma: no cover - local mode can run without redis installed
    Redis = Any  # type: ignore[assignment]
    AsyncRedis = Any  # type: ignore[assignment]

from config import get_settings


_sync_client: Redis | None = None
_async_client: AsyncRedis | None = None
_memory_store: OrderedDict[str, tuple[str, float | None]] = OrderedDict()
_memory_lock = Lock()
_using_local_store = False


class StorageUnavailableError(RuntimeError):
    """Raised when the configured state store cannot be reached safely."""


class LocalRedis:
    @staticmethod
    def _estimate_entry_size(key: str, value: str) -> int:
        return len(key.encode('utf-8')) + len(value.encode('utf-8'))

    def _purge_if_expired(self, key: str) -> None:
        entry = _memory_store.get(key)
        if not entry:
            return
        _, expires_at = entry
        if expires_at is not None and expires_at <= time.time():
            _memory_store.pop(key, None)

    def _enforce_limits(self) -> None:
        settings = get_settings()
        max_keys = settings.local_memory_store_max_keys
        max_bytes = settings.local_memory_store_max_bytes
        current_bytes = sum(self._estimate_entry_size(key, value) for key, (value, _) in _memory_store.items())

        while _memory_store and (
            len(_memory_store) > max_keys
            or (current_bytes > max_bytes and len(_memory_store) > 1)
        ):
            oldest_key, (oldest_value, _) = _memory_store.popitem(last=False)
            current_bytes -= self._estimate_entry_size(oldest_key, oldest_value)

    def _sweep(self) -> None:
        now = time.time()
        to_delete = [k for k, v in _memory_store.items() if v[1] is not None and v[1] <= now]
        for k in to_delete:
            _memory_store.pop(k, None)
        self._enforce_limits()

    def get(self, key: str) -> str | None:
        with _memory_lock:
            self._purge_if_expired(key)
            entry = _memory_store.get(key)
            if entry:
                _memory_store.move_to_end(key)
            return entry[0] if entry else None

    def set(self, key: str, value: str, ex: int | None = None) -> bool:
        expires_at = time.time() + ex if ex else None
        with _memory_lock:
            _memory_store[key] = (value, expires_at)
            _memory_store.move_to_end(key)
            self._sweep()
        return True

    def delete(self, key: str) -> int:
        with _memory_lock:
            existed = key in _memory_store
            _memory_store.pop(key, None)
        return int(existed)

    def incr(self, key: str) -> int:
        with _memory_lock:
            self._purge_if_expired(key)
            current = _memory_store.get(key)
            current_value = int(current[0]) if current else 0
            new_value = current_value + 1
            expires_at = current[1] if current else None
            _memory_store[key] = (str(new_value), expires_at)
            _memory_store.move_to_end(key)
            self._sweep()
            return new_value

    def expire(self, key: str, seconds: int) -> bool:
        with _memory_lock:
            self._purge_if_expired(key)
            entry = _memory_store.get(key)
            if not entry:
                return False
            _memory_store[key] = (entry[0], time.time() + seconds)
        return True

    def ping(self) -> bool:
        return True


class LocalAsyncRedis:
    def __init__(self, sync_client: LocalRedis):
        self._sync_client = sync_client

    async def get(self, key: str) -> str | None:
        return self._sync_client.get(key)


_local_sync_client = LocalRedis()
_local_async_client = LocalAsyncRedis(_local_sync_client)


def using_local_memory_store() -> bool:
    return _using_local_store or not get_settings().has_redis_config()


def _bounded_ttl(ttl_seconds: int) -> int:
    if not using_local_memory_store():
        return ttl_seconds
    return min(ttl_seconds, get_settings().local_memory_store_max_ttl_seconds)


def get_sync_redis() -> Redis | LocalRedis:
    global _sync_client, _using_local_store
    if using_local_memory_store():
        _using_local_store = True
        return _local_sync_client
    if _sync_client is None:
        settings = get_settings()
        try:
            _sync_client = Redis.from_url(
                settings.redis_url(),
                decode_responses=True,
                socket_timeout=settings.redis_socket_timeout_seconds,
                socket_connect_timeout=settings.redis_connect_timeout_seconds,
                retry_on_timeout=False,
            )
            _sync_client.ping()
        except Exception as exc:
            if not settings.redis_fallback_to_memory_enabled:
                raise StorageUnavailableError(
                    'Redis is configured but unavailable. '
                    'Restore Redis connectivity or set REDIS_FALLBACK_TO_MEMORY_ENABLED=true.'
                ) from exc
            _using_local_store = True
            _sync_client = None
            return _local_sync_client
    return _sync_client


def get_async_redis() -> AsyncRedis | LocalAsyncRedis:
    global _async_client, _using_local_store
    if using_local_memory_store():
        _using_local_store = True
        return _local_async_client
    if _async_client is None:
        settings = get_settings()
        try:
            _async_client = AsyncRedis.from_url(
                settings.redis_url(),
                decode_responses=True,
                socket_timeout=settings.redis_socket_timeout_seconds,
                socket_connect_timeout=settings.redis_connect_timeout_seconds,
                retry_on_timeout=False,
            )
        except Exception as exc:
            if not settings.redis_fallback_to_memory_enabled:
                raise StorageUnavailableError(
                    'Redis is configured but unavailable. '
                    'Restore Redis connectivity or set REDIS_FALLBACK_TO_MEMORY_ENABLED=true.'
                ) from exc
            _using_local_store = True
            _async_client = None
            return _local_async_client
    return _async_client


def task_status_key(task_id: str) -> str:
    return f'analysis:task:{task_id}'


def analysis_cache_key(cache_hash: str) -> str:
    return f'analysis:cache:{cache_hash}'


def upload_blob_key(task_id: str) -> str:
    return f'analysis:upload:{task_id}'


def resume_text_key(task_id: str) -> str:
    return f'analysis:resume-text:{task_id}'


def rate_limit_key(identifier: str, day_bucket: str) -> str:
    return f'analysis:ratelimit:{identifier}:{day_bucket}'


def set_task_status(task_id: str, payload: dict[str, Any], ttl_seconds: int | None = None) -> None:
    settings = get_settings()
    default_ttl = settings.result_ttl_seconds
    if payload.get('status') in {'completed', 'failed'}:
        default_ttl = max(settings.result_ttl_seconds, settings.cache_ttl_seconds)
    ttl = _bounded_ttl(ttl_seconds or default_ttl)
    get_sync_redis().set(task_status_key(task_id), json.dumps(payload), ex=ttl)


def get_cached_analysis(cache_hash: str) -> dict[str, Any] | None:
    if using_local_memory_store():
        return None
    raw = get_sync_redis().get(analysis_cache_key(cache_hash))
    return json.loads(raw) if raw else None


def set_cached_analysis(cache_hash: str, payload: dict[str, Any]) -> None:
    if using_local_memory_store():
        return
    get_sync_redis().set(
        analysis_cache_key(cache_hash),
        json.dumps(payload),
        ex=_bounded_ttl(get_settings().cache_ttl_seconds),
    )


def set_upload_blob(task_id: str, encoded_payload: str) -> None:
    get_sync_redis().set(
        upload_blob_key(task_id),
        encoded_payload,
        ex=_bounded_ttl(get_settings().upload_blob_ttl_seconds),
    )


def get_upload_blob(task_id: str) -> str | None:
    return get_sync_redis().get(upload_blob_key(task_id))


def delete_upload_blob(task_id: str) -> None:
    get_sync_redis().delete(upload_blob_key(task_id))


def set_resume_text(task_id: str, resume_text: str) -> None:
    get_sync_redis().set(
        resume_text_key(task_id),
        resume_text,
        ex=_bounded_ttl(get_settings().result_ttl_seconds),
    )


def get_resume_text(task_id: str) -> str | None:
    return get_sync_redis().get(resume_text_key(task_id))


async def get_task_status(task_id: str) -> dict[str, Any] | None:
    raw = await get_async_redis().get(task_status_key(task_id))
    return json.loads(raw) if raw else None
