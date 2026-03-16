import os

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import JobSearchRequest
from service_logic import run_jobs_search


app = FastAPI(title='Elevate-AI Jobs Service', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.post('/v1/jobs/search')
async def fetch_jobs(request: JobSearchRequest):
    try:
        return await run_jobs_search(request.query, request.job_type)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Jobs service error: {exc}') from exc


@app.get('/health')
async def health_check():
    return {'status': 'ok', 'service': 'jobs-service'}


if __name__ == '__main__':
    port = int(os.getenv('JOBS_SERVICE_PORT', '8020'))
    uvicorn.run('services.jobs_service:app', host='0.0.0.0', port=port, reload=True)
