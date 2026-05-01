import asyncio
import os
import time
from typing import Any

import httpx
from fastapi import HTTPException

from service_logic import run_jobs_search


ANALYSIS_SERVICE_URL = os.getenv('ANALYSIS_SERVICE_URL', '').rstrip('/')
JOBS_SERVICE_URL = os.getenv('JOBS_SERVICE_URL', '').rstrip('/')
ALLOW_LOCAL_FALLBACK = os.getenv('ALLOW_LOCAL_FALLBACK', 'true').lower() in {'1', 'true', 'yes'}
SERVICE_TIMEOUT_SECONDS = float(os.getenv('SERVICE_TIMEOUT_SECONDS', '45'))


def _extract_error_detail(response: httpx.Response) -> str:
    try:
        payload = response.json()
        if isinstance(payload, dict):
            return str(payload.get('detail', payload))
        return str(payload)
    except Exception:
        return response.text or f"HTTP {response.status_code}"


async def _post_json(base_url: str, path: str, payload: dict[str, Any], service_name: str) -> Any:
    target_url = f"{base_url}{path}"
    try:
        async with httpx.AsyncClient(timeout=SERVICE_TIMEOUT_SECONDS) as client:
            response = await client.post(target_url, json=payload)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as exc:
        detail = _extract_error_detail(exc.response)
        raise HTTPException(status_code=exc.response.status_code, detail=f"{service_name} error: {detail}") from exc
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail=f"{service_name} unavailable: {exc}") from exc


async def route_resume_analysis(file_content: str) -> dict:
    if ANALYSIS_SERVICE_URL:
        try:
            return await _post_json(
                ANALYSIS_SERVICE_URL,
                '/v1/analyze',
                {'file_content': file_content},
                'analysis-service',
            )
        except HTTPException:
            if not ALLOW_LOCAL_FALLBACK:
                raise

    if not ALLOW_LOCAL_FALLBACK and not ANALYSIS_SERVICE_URL:
        raise HTTPException(status_code=503, detail='Analysis service URL is not configured.')

    from service_logic import run_dual_resume_analysis

    return await run_dual_resume_analysis(file_content)


async def route_job_search(query: str, job_type: str) -> list:
    if JOBS_SERVICE_URL:
        try:
            return await _post_json(
                JOBS_SERVICE_URL,
                '/v1/jobs/search',
                {'query': query, 'job_type': job_type},
                'jobs-service',
            )
        except HTTPException:
            if not ALLOW_LOCAL_FALLBACK:
                raise

    if not ALLOW_LOCAL_FALLBACK and not JOBS_SERVICE_URL:
        raise HTTPException(status_code=503, detail='Jobs service URL is not configured.')

    return await run_jobs_search(query, job_type)


async def _probe_service(name: str, base_url: str, path: str) -> dict:
    if not base_url:
        return {
            'service': name,
            'status': 'local-fallback',
            'configured': False,
            'latency_ms': None,
        }

    started_at = time.perf_counter()
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            response = await client.get(f"{base_url}{path}")
            response.raise_for_status()
            latency_ms = round((time.perf_counter() - started_at) * 1000, 2)
            return {
                'service': name,
                'status': 'ok',
                'configured': True,
                'latency_ms': latency_ms,
            }
    except Exception as exc:
        latency_ms = round((time.perf_counter() - started_at) * 1000, 2)
        return {
            'service': name,
            'status': 'unreachable',
            'configured': True,
            'latency_ms': latency_ms,
            'detail': str(exc),
        }


async def get_gateway_health() -> dict:
    checks = await asyncio.gather(
        _probe_service('analysis-service', ANALYSIS_SERVICE_URL, '/health'),
        _probe_service('jobs-service', JOBS_SERVICE_URL, '/health'),
    )

    return {
        'status': 'ok',
        'mode': 'distributed' if ANALYSIS_SERVICE_URL or JOBS_SERVICE_URL else 'local-fallback',
        'local_fallback_enabled': ALLOW_LOCAL_FALLBACK,
        'services': checks,
    }
