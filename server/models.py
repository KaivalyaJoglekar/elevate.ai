from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class ResumeRequest(BaseModel):
    file_content: str


class JobSearchRequest(BaseModel):
    query: str
    job_type: Literal['full-time', 'internship']


class RetargetRequest(BaseModel):
    target_role: str
    experience_level: str
    job_description: str = ''


class AnalysisTaskResponse(BaseModel):
    success: bool = True
    task_id: str
    status: str
    cached: bool = False
    websocket_url: str
    remaining_requests: int | None = None


class AnalysisStatusPayload(BaseModel):
    success: bool = True
    task_id: str
    status: str
    progress: int = Field(default=0, ge=0, le=100)
    current_step: str
    cached: bool = False
    result: dict[str, Any] | None = None
    error: str | None = None
