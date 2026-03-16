import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import JobSearchRequest, ResumeRequest
from service_clients import get_gateway_health, route_job_search, route_resume_analysis


app = FastAPI(title='Elevate-AI API Gateway', version='2.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.post('/analyze-resume-dual/')
async def analyze_resume_dual_endpoint(request: ResumeRequest):
    """
    Gateway endpoint for resume analysis.
    Routes to distributed analysis service if configured, otherwise local fallback.
    """
    try:
        return await route_resume_analysis(request.file_content)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Gateway error during analysis: {exc}') from exc


@app.post('/fetch-jobs/')
async def fetch_jobs_endpoint(request: JobSearchRequest):
    """
    Gateway endpoint for jobs retrieval.
    Routes to distributed jobs service if configured, otherwise local fallback.
    """
    try:
        return await route_job_search(request.query, request.job_type)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Gateway error during job fetch: {exc}') from exc


@app.get('/health')
async def health_endpoint():
    return await get_gateway_health()


@app.get('/')
def read_root():
    return {
        'status': 'ok',
        'message': 'Elevate-AI API Gateway is running',
        'health_endpoint': '/health',
    }


if __name__ == '__main__':
    uvicorn.run('main:app', host='0.0.0.0', port=8000, reload=True)