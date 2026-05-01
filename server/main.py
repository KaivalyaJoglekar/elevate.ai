from __future__ import annotations

import asyncio
import base64
from datetime import datetime, timezone
from pathlib import Path
from collections.abc import Coroutine
from uuid import uuid4

import uvicorn
from fastapi import FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.responses import FileResponse
from fastapi.responses import Response

from config import get_settings
from models import AnalysisStatusPayload, JobSearchRequest, ResumeRequest, RetargetRequest
from redis_store import get_sync_redis, get_task_status, using_local_memory_store
from resume_pipeline import (
    compute_payload_hash,
    enforce_daily_rate_limit,
    extract_text_with_fallback,
    initialize_task_state,
    maybe_return_cached,
    persist_cached_result,
    update_task,
    validate_resume_text_quality,
)
from service_clients import get_gateway_health, route_job_search
from service_logic import build_resume_review_core, enrich_resume_review_market, run_resume_review


settings = get_settings()

if settings.sentry_dsn:
    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration

        sentry_sdk.init(
            dsn=settings.sentry_dsn,
            traces_sample_rate=1.0,
            integrations=[FastApiIntegration()],
        )
    except ImportError:
        pass

app = FastAPI(title=settings.app_name, version=settings.app_version)
_background_tasks: set[asyncio.Task[None]] = set()



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _market_context() -> dict[str, str]:
    return {
        'country_code': settings.market_country_code,
        'region_name': settings.market_region_name,
        'timezone': settings.market_timezone,
        'currency': settings.market_currency,
    }


def _basic_health_payload() -> dict[str, str]:
    return {
        'status': 'ok',
        'app_name': settings.app_name,
        'version': settings.app_version,
        'timestamp_utc': datetime.now(timezone.utc).isoformat(),
        'market_context': _market_context(),
    }


def _get_client_ip(request: Request) -> str:
    forwarded_for = request.headers.get('x-forwarded-for', '')
    if forwarded_for:
        return forwarded_for.split(',')[0].strip()
    if request.client and request.client.host:
        return request.client.host
    return 'unknown'


def _schedule_background_task(coroutine: Coroutine[object, object, None]) -> None:
    task = asyncio.create_task(coroutine)
    _background_tasks.add(task)
    task.add_done_callback(_background_tasks.discard)


def _skip_market_enrichment(result: dict[str, object]) -> dict[str, object]:
    skipped_result = dict(result)
    skipped_result['job_market_pending'] = False
    skipped_result['job_market_live'] = False
    skipped_result['job_market_status'] = 'Auto-loading of live market roles is disabled. Use JSearch Explorer to fetch roles on demand.'
    quality_signals = dict(skipped_result.get('quality_signals', {}) or {})
    quality_signals['job_feed_mode'] = 'manual'
    skipped_result['quality_signals'] = quality_signals
    return skipped_result


async def _run_analysis_task(
    *,
    task_id: str,
    contents: bytes,
    filename: str,
    target_role: str,
    experience_level: str,
    job_description: str,
    cache_hash: str,
) -> None:
    try:
        update_task(task_id, status='processing', progress=14, current_step='Parsing resume')
        resume_text, parsing_method = await asyncio.to_thread(
            extract_text_with_fallback,
            contents,
            filename,
        )
        await asyncio.to_thread(validate_resume_text_quality, resume_text)

        update_task(task_id, status='processing', progress=52, current_step='Running Gemini analysis')
        result = await build_resume_review_core(
            resume_text=resume_text,
            target_role=target_role,
            experience_level=experience_level,
            job_description=job_description,
            parsing_method=parsing_method,
        )
        should_auto_enrich_market = settings.auto_market_enrichment_enabled
        result_to_store = result if should_auto_enrich_market else _skip_market_enrichment(result)
        if not should_auto_enrich_market:
            persist_cached_result(cache_hash, result_to_store)

        update_task(
            task_id,
            status='completed',
            progress=100,
            current_step='Dashboard ready',
            result=result_to_store,
        )
        if should_auto_enrich_market:
            _schedule_background_task(
                _run_market_enrichment_task(
                    task_id=task_id,
                    result=result,
                    cache_hash=cache_hash,
                )
            )
    except Exception as exc:
        update_task(task_id, status='failed', progress=100, current_step='Analysis failed', error=str(exc))


async def _run_retarget_task(
    *,
    task_id: str,
    resume_text: str,
    target_role: str,
    experience_level: str,
    job_description: str,
    parsing_method: str,
) -> None:
    try:
        update_task(task_id, status='processing', progress=24, current_step='Reframing target role')
        result = await build_resume_review_core(
            resume_text=resume_text,
            target_role=target_role,
            experience_level=experience_level,
            job_description=job_description,
            parsing_method=parsing_method,
        )
        should_auto_enrich_market = settings.auto_market_enrichment_enabled
        result_to_store = result if should_auto_enrich_market else _skip_market_enrichment(result)

        update_task(
            task_id,
            status='completed',
            progress=100,
            current_step='Dashboard ready',
            result=result_to_store,
        )
        if should_auto_enrich_market:
            _schedule_background_task(
                _run_market_enrichment_task(
                    task_id=task_id,
                    result=result,
                )
            )
    except Exception as exc:
        update_task(task_id, status='failed', progress=100, current_step='Analysis failed', error=str(exc))


async def _run_market_enrichment_task(
    *,
    task_id: str,
    result: dict[str, object],
    cache_hash: str | None = None,
) -> None:
    try:
        enriched_result = await enrich_resume_review_market(result)
    except Exception as exc:
        enriched_result = dict(result)
        enriched_result['job_market_pending'] = False
        enriched_result['job_market_live'] = False
        enriched_result['job_market_status'] = f'Live market feed unavailable: {exc}'
        quality_signals = dict(enriched_result.get('quality_signals', {}) or {})
        quality_signals['job_feed_mode'] = 'partial'
        enriched_result['quality_signals'] = quality_signals

    if cache_hash:
        persist_cached_result(cache_hash, enriched_result)

    update_task(
        task_id,
        status='completed',
        progress=100,
        current_step='Dashboard ready',
        result=enriched_result,
        error=None,
    )


@app.exception_handler(RequestValidationError)
async def request_validation_exception_handler(_: Request, exc: RequestValidationError):
    message = '; '.join(
        f"{'.'.join(str(part) for part in error['loc'])}: {error['msg']}"
        for error in exc.errors()
    )
    return JSONResponse(
        status_code=422,
        content={
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': message or 'Request validation failed.',
            },
        },
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            'success': False,
            'error': {
                'code': 'HTTP_ERROR',
                'message': str(exc.detail),
            },
        },
    )


@app.post('/api/analyze', response_model=AnalysisStatusPayload)
async def create_analysis_task(request: Request):
    client_ip = _get_client_ip(request)
    allowed, remaining = enforce_daily_rate_limit(client_ip)
    if not allowed:
        raise HTTPException(status_code=429, detail='Daily analysis limit reached for this IP address.')

    form = await request.form()
    file = form.get('file')
    if file is None or not hasattr(file, 'read') or not hasattr(file, 'filename'):
        raise HTTPException(status_code=422, detail='A resume PDF file is required.')

    job_description = str(form.get('job_description', '') or '')
    target_role = str(form.get('target_role', 'Software Engineer') or 'Software Engineer')
    experience_level = str(form.get('experience_level', 'Entry Level') or 'Entry Level')

    contents = await file.read()
    if len(contents) > settings.max_upload_size_bytes:
        raise HTTPException(status_code=413, detail='Resume exceeds the 5MB upload limit.')
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=415, detail='Only PDF resumes are currently supported.')

    job_description = job_description.strip()
    target_role = target_role.strip() or 'Software Engineer'
    experience_level = experience_level.strip() or 'Entry Level'

    task_id = str(uuid4())
    cache_hash = compute_payload_hash(contents, job_description, target_role, experience_level)
    initialize_task_state(task_id)
    cached_result = maybe_return_cached(cache_hash, task_id)
    if cached_result:
        return AnalysisStatusPayload(
            task_id=task_id,
            status='completed',
            progress=100,
            current_step='Cached analysis found',
            cached=True,
            result=cached_result,
            error=None,
        )

    payload = update_task(
        task_id,
        status='queued',
        progress=6,
        current_step='Resume received',
        error=None,
    )
    _schedule_background_task(
        _run_analysis_task(
            task_id=task_id,
            contents=contents,
            filename=file.filename,
            target_role=target_role,
            experience_level=experience_level,
            job_description=job_description,
            cache_hash=cache_hash,
        )
    )
    return AnalysisStatusPayload(**payload)


@app.get('/api/analysis/{task_id}', response_model=AnalysisStatusPayload)
async def fetch_analysis_status(task_id: str):
    payload = await get_task_status(task_id)
    if not payload:
        raise HTTPException(status_code=404, detail='Task not found.')
    return AnalysisStatusPayload(**payload)


@app.post('/api/re-target/{task_id}', response_model=AnalysisStatusPayload)
async def retarget_analysis(task_id: str, request: RetargetRequest):
    existing_payload = await get_task_status(task_id)
    if not existing_payload or not existing_payload.get('result'):
        raise HTTPException(status_code=404, detail='Original analysis not found.')

    existing_result = existing_payload['result']
    resume_text = str(existing_result.get('resume_text_raw', '')).strip()
    if not resume_text:
        raise HTTPException(status_code=409, detail='The original parsed resume text is unavailable for retargeting.')

    target_role = request.target_role.strip() or str(existing_result.get('target_role', 'Software Engineer'))
    experience_level = request.experience_level.strip() or str(existing_result.get('experience_level', 'Entry Level'))
    job_description = request.job_description.strip()
    parsing_method = str(existing_result.get('parsing_method', 'pdfplumber'))

    new_task_id = str(uuid4())
    initialize_task_state(new_task_id)
    payload = update_task(
        new_task_id,
        status='queued',
        progress=8,
        current_step='Re-target request accepted',
        error=None,
    )
    _schedule_background_task(
        _run_retarget_task(
            task_id=new_task_id,
            resume_text=resume_text,
            target_role=target_role,
            experience_level=experience_level,
            job_description=job_description,
            parsing_method=parsing_method,
        )
    )
    return AnalysisStatusPayload(**payload)


@app.websocket('/ws/status/{task_id}')
async def task_status_socket(websocket: WebSocket, task_id: str):
    await websocket.accept()
    previous_payload = None
    try:
        while True:
            payload = await get_task_status(task_id)
            if payload and payload != previous_payload:
                await websocket.send_json(payload)
                previous_payload = payload
                if payload.get('status') in {'completed', 'failed'}:
                    break
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        return
    finally:
        try:
            await websocket.close()
        except RuntimeError:
            pass


@app.get('/api/download/{task_id}')
async def download_generated_resume(task_id: str):
    output_path = Path(settings.generated_resume_dir) / f'{task_id}.pdf'
    if not output_path.exists():
        raise HTTPException(status_code=404, detail='Generated resume not found.')
    return FileResponse(output_path, media_type='application/pdf', filename=f'elevate-tailored-{task_id}.pdf')


@app.post('/analyze-resume-dual/')
async def analyze_resume_dual_endpoint(request: ResumeRequest):
    try:
        padded_content = request.file_content
        missing_padding = len(padded_content) % 4
        if missing_padding:
            padded_content += '=' * (4 - missing_padding)

        contents = base64.b64decode(padded_content, validate=True)
        resume_text, parsing_method = await asyncio.to_thread(
            extract_text_with_fallback,
            contents,
            'resume.pdf',
        )
        await asyncio.to_thread(validate_resume_text_quality, resume_text)
        result = await run_resume_review(
            resume_text=resume_text,
            target_role='Software Engineer',
            experience_level='Entry Level',
            job_description='',
            parsing_method=parsing_method,
        )
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Legacy sync analysis failed: {exc}') from exc


@app.post('/fetch-jobs/')
@app.post('/api/jobs/search')
async def fetch_jobs_endpoint(request: JobSearchRequest):
    try:
        return await route_job_search(request.query, request.job_type)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Gateway error during job fetch: {exc}') from exc


@app.api_route('/health', methods=['GET', 'HEAD'])
async def render_health_endpoint(request: Request):
    if request.method == 'HEAD':
        return Response(status_code=200)
    return _basic_health_payload()


@app.api_route('/api/health', methods=['GET', 'HEAD'])
async def health_endpoint(request: Request):
    if request.method == 'HEAD':
        return Response(status_code=200)

    health = await get_gateway_health()
    try:
        redis_client = get_sync_redis()
        health['redis'] = 'memory-local' if using_local_memory_store() else ('ok' if redis_client.ping() else 'unreachable')
    except Exception as exc:
        health['redis'] = f'unreachable: {exc}'
    health['queue'] = 'direct'
    health['broker'] = 'memory-local' if using_local_memory_store() else 'upstash-redis'
    health.update(_basic_health_payload())
    return health


@app.api_route('/', methods=['GET', 'HEAD'])
def read_root(request: Request):
    if request.method == 'HEAD':
        return Response(status_code=200)

    return {
        'status': 'ok',
        'message': 'Elevate.ai resume analysis API is running',
        'health_endpoint': '/health',
        'api_health_endpoint': '/api/health',
        'jobs_endpoint': '/api/jobs/search',
        'market_context': _market_context(),
    }


if __name__ == '__main__':
    uvicorn.run('main:app', host='0.0.0.0', port=8000, reload=True)
