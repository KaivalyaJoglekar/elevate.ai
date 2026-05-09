import asyncio
import json
import unittest
from unittest.mock import patch

from redis_store import StorageUnavailableError, get_task_status


class _SyncRedisStub:
    def __init__(self, value: str | None) -> None:
        self.value = value
        self.keys: list[str] = []

    def get(self, key: str) -> str | None:
        self.keys.append(key)
        return self.value


class _BrokenSyncRedisStub:
    def get(self, _: str) -> str | None:
        raise RuntimeError('boom')


class RedisStoreTests(unittest.TestCase):
    def test_get_task_status_reads_from_sync_store(self) -> None:
        stub = _SyncRedisStub(json.dumps({"task_id": "task-123", "status": "queued"}))

        with patch("redis_store.get_sync_redis", return_value=stub):
            payload = asyncio.run(get_task_status("task-123"))

        self.assertEqual(stub.keys, ["analysis:task:task-123"])
        self.assertEqual(payload, {"task_id": "task-123", "status": "queued"})

    def test_get_task_status_wraps_runtime_store_errors(self) -> None:
        with patch("redis_store.get_sync_redis", return_value=_BrokenSyncRedisStub()):
            with self.assertRaises(StorageUnavailableError):
                asyncio.run(get_task_status("task-123"))
