from pydantic import BaseModel
from typing import Literal


class ResumeRequest(BaseModel):
    file_content: str


class JobSearchRequest(BaseModel):
    query: str
    job_type: Literal['full-time', 'internship']
