from __future__ import annotations

from celery import states

from analysis_runner import run_resume_analysis_task
from celery_app import celery_app
from resume_pipeline import update_task


@celery_app.task(bind=True, name='elevate.process_resume_analysis')
def process_resume_analysis(
    self,
    *,
    task_id: str,
    filename: str,
    target_role: str,
    experience_level: str,
    job_description: str,
    cache_hash: str,
) -> dict:
    try:
        return run_resume_analysis_task(
            task_id=task_id,
            filename=filename,
            target_role=target_role,
            experience_level=experience_level,
            job_description=job_description,
            cache_hash=cache_hash,
        )
    except Exception as exc:
        update_task(task_id, status='failed', progress=100, current_step='Analysis failed', error=str(exc))
        self.update_state(state=states.FAILURE, meta={'error': str(exc)})
        raise
