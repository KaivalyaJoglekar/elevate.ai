from __future__ import annotations

import os
from functools import lru_cache

from dotenv import load_dotenv


load_dotenv()


class Settings:
    app_name = 'Elevate.ai Async ATS API'
    app_version = '3.0.0'

    gemini_api_key = os.getenv('GEMINI_API_KEY', '').strip()
    gemini_model = os.getenv('GEMINI_MODEL', 'gemini-2.5-flash').strip() or 'gemini-2.5-flash'
    gemini_fallback_models = [
        model.strip()
        for model in os.getenv('GEMINI_FALLBACK_MODELS', 'gemini-2.5-flash-lite').split(',')
        if model.strip()
    ]
    gemini_max_retries = int(os.getenv('GEMINI_MAX_RETRIES', '3'))
    gemini_retry_backoff_seconds = float(os.getenv('GEMINI_RETRY_BACKOFF_SECONDS', '1.5'))
    sentry_dsn = os.getenv('SENTRY_DSN', '').strip()
    upstash_redis_url = os.getenv('UPSTASH_REDIS_URL', '').strip()
    upstash_redis_host = os.getenv('UPSTASH_REDIS_HOST', '').strip()
    upstash_redis_port = os.getenv('UPSTASH_REDIS_PORT', '').strip()
    upstash_redis_password = os.getenv('UPSTASH_REDIS_PASSWORD', '').strip()
    public_backend_url = os.getenv('PUBLIC_BACKEND_URL', 'https://elevate-ai-p0pn.onrender.com').rstrip('/')

    result_ttl_seconds = int(os.getenv('RESULT_TTL_SECONDS', str(7 * 24 * 60 * 60)))
    cache_ttl_seconds = int(os.getenv('CACHE_TTL_SECONDS', str(7 * 24 * 60 * 60)))
    upload_blob_ttl_seconds = int(os.getenv('UPLOAD_BLOB_TTL_SECONDS', str(60 * 60)))
    redis_socket_timeout_seconds = float(os.getenv('REDIS_SOCKET_TIMEOUT_SECONDS', '5'))
    redis_connect_timeout_seconds = float(os.getenv('REDIS_CONNECT_TIMEOUT_SECONDS', '5'))
    task_submit_timeout_seconds = float(os.getenv('TASK_SUBMIT_TIMEOUT_SECONDS', '10'))
    rate_limit_enabled = os.getenv('RATE_LIMIT_ENABLED', 'true').lower() in {'1', 'true', 'yes'}
    rate_limit_per_day = int(os.getenv('RATE_LIMIT_PER_DAY', '5'))
    max_upload_size_bytes = int(os.getenv('MAX_UPLOAD_SIZE_BYTES', str(5 * 1024 * 1024)))
    minimum_resume_words = int(os.getenv('MINIMUM_RESUME_WORDS', '60'))
    sentence_model_name = os.getenv('SENTENCE_MODEL_NAME', 'sentence-transformers/all-MiniLM-L6-v2')
    job_search_timeout_seconds = float(os.getenv('JOB_SEARCH_TIMEOUT_SECONDS', '8'))
    job_search_max_candidates = int(os.getenv('JOB_SEARCH_MAX_CANDIDATES', '3'))
    market_enrichment_timeout_seconds = float(os.getenv('MARKET_ENRICHMENT_TIMEOUT_SECONDS', '12'))
    market_country_code = os.getenv('MARKET_COUNTRY_CODE', os.getenv('JSEARCH_COUNTRY', 'in')).strip().lower() or 'in'
    market_region_name = os.getenv('MARKET_REGION_NAME', 'India').strip() or 'India'
    market_timezone = os.getenv('MARKET_TIMEZONE', 'Asia/Kolkata').strip() or 'Asia/Kolkata'
    market_currency = os.getenv('MARKET_CURRENCY', 'INR').strip().upper() or 'INR'

    generated_resume_dir = os.getenv('GENERATED_RESUME_DIR', '/tmp/elevate-generated')

    def has_redis_config(self) -> bool:
        return bool(
            self.upstash_redis_url
            or (self.upstash_redis_host and self.upstash_redis_port and self.upstash_redis_password)
        )

    def redis_url(self) -> str:
        if self.upstash_redis_url:
            return self.upstash_redis_url
        if self.upstash_redis_host and self.upstash_redis_port and self.upstash_redis_password:
            return f'rediss://:{self.upstash_redis_password}@{self.upstash_redis_host}:{self.upstash_redis_port}?ssl_cert_reqs=required'
        raise RuntimeError('Upstash Redis configuration is missing. Set UPSTASH_REDIS_URL or host/port/password vars.')


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
