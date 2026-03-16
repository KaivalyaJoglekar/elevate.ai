import os

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import ResumeRequest
from service_logic import run_dual_resume_analysis


app = FastAPI(title='Elevate-AI Analysis Service', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.post('/v1/analyze')
async def analyze_resume(request: ResumeRequest):
    try:
        return await run_dual_resume_analysis(request.file_content)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Analysis service error: {exc}') from exc


@app.get('/health')
async def health_check():
    return {'status': 'ok', 'service': 'analysis-service'}


if __name__ == '__main__':
    port = int(os.getenv('ANALYSIS_SERVICE_PORT', '8010'))
    uvicorn.run('services.analysis_service:app', host='0.0.0.0', port=port, reload=True)
