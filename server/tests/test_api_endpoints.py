import asyncio
import unittest
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from main import app


def _analysis_result(target_role: str) -> dict:
    return {
        "candidate_name": "Test Candidate",
        "target_role": target_role,
        "experience_level": "Entry Level",
        "resume_text_raw": "Python FastAPI SQL resume text",
        "job_description_raw": "Backend role",
        "job_description_excerpt": "Backend role",
        "resume_excerpt": "Python FastAPI SQL",
        "parsing_method": "pdfplumber",
        "full_time_query": f"{target_role} India",
        "internship_query": f"{target_role} internship India",
        "job_market_status": "Live job feed available",
        "job_market_live": True,
        "full_time_job_count": 7,
        "internship_job_count": 5,
        "market_context": {
            "country_code": "in",
            "region_name": "India",
            "timezone": "Asia/Kolkata",
            "currency": "INR",
            "job_source": "JSearch",
        },
        "analysis_metadata": {
            "backend_version": "3.0.0",
            "generated_at_utc": "2026-05-01T00:00:00+00:00",
            "timings_ms": {
                "llm_analysis": 100,
                "market_enrichment": 80,
                "total": 220,
            },
        },
        "quality_signals": {
            "resume_word_count": 120,
            "job_description_present": True,
            "job_feed_mode": "live",
            "market_region": "India",
        },
        "full_time_analysis": {
            "name": "Test Candidate",
            "summary": "Strong backend profile.",
            "atsScore": {
                "score": 84,
                "feedback": "Good fit.",
                "breakdown": [],
                "matchedKeywords": [],
                "missingKeywords": [],
                "topIssues": [],
            },
            "extractedSkills": [{"name": "Python"}, {"name": "FastAPI"}],
            "experienceSummary": ["Built APIs"],
            "educationSummary": ["B.Tech"],
            "careerPaths": [
                {
                    "role": target_role,
                    "employer_name": "Acme",
                    "description": "Role description",
                    "matchPercentage": 82,
                    "relevantSkills": ["Python", "FastAPI"],
                    "skillsToDevelop": ["System Design"],
                    "skillProficiencyAnalysis": [],
                }
            ],
            "generalResumeImprovements": ["Add more metrics."],
            "generalUpskillingSuggestions": ["Learn system design."],
        },
        "internship_analysis": {
            "name": "Test Candidate",
            "summary": "Intern-ready backend profile.",
            "atsScore": {
                "score": 81,
                "feedback": "Good fit.",
                "breakdown": [],
                "matchedKeywords": [],
                "missingKeywords": [],
                "topIssues": [],
            },
            "extractedSkills": [{"name": "Python"}, {"name": "SQL"}],
            "experienceSummary": ["Built student projects"],
            "educationSummary": ["B.Tech"],
            "careerPaths": [
                {
                    "role": f"{target_role} Intern",
                    "employer_name": "Acme",
                    "description": "Intern role description",
                    "matchPercentage": 79,
                    "relevantSkills": ["Python", "SQL"],
                    "skillsToDevelop": ["Statistics"],
                    "skillProficiencyAnalysis": [],
                }
            ],
            "generalResumeImprovements": ["Clarify project ownership."],
            "generalUpskillingSuggestions": ["Practice analytics workflows."],
        },
    }


def _task_payload(
    task_id: str,
    *,
    status: str,
    progress: int,
    current_step: str,
    result: dict | None = None,
    cached: bool = False,
    error: str | None = None,
) -> dict:
    return {
        "success": True,
        "task_id": task_id,
        "status": status,
        "progress": progress,
        "current_step": current_step,
        "cached": cached,
        "result": result,
        "error": error,
    }


class _RedisStub:
    def ping(self) -> bool:
        return True


class ApiEndpointTests(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def tearDown(self) -> None:
        self.client.close()

    def test_analyze_endpoint_processes_pdf_and_preserves_target_role(self) -> None:
        update_calls: list[dict] = []
        scheduled_tasks = []

        def fake_update_task(task_id: str, **kwargs) -> dict:
            update_calls.append({"task_id": task_id, **kwargs})
            return _task_payload(task_id, **kwargs)

        def capture_task(coroutine) -> None:
            scheduled_tasks.append(coroutine)

        analysis_mock = AsyncMock(return_value=_analysis_result("Backend Engineer"))

        with (
            patch("main.enforce_daily_rate_limit", return_value=(True, 5)),
            patch("main.initialize_task_state"),
            patch("main.maybe_return_cached", return_value=None),
            patch("main.extract_text_with_fallback", return_value=("Python FastAPI SQL resume text", "pdfplumber")),
            patch("main.validate_resume_text_quality", return_value=120),
            patch("main.persist_cached_result"),
            patch("main.update_task", side_effect=fake_update_task),
            patch("main.run_resume_review", new=analysis_mock),
            patch("main._schedule_background_task", side_effect=capture_task),
        ):
            response = self.client.post(
                "/api/analyze",
                files={"file": ("resume.pdf", b"%PDF-1.4 test pdf", "application/pdf")},
                data={
                    "target_role": "Backend Engineer",
                    "experience_level": "Entry Level",
                    "job_description": "Looking for Python and FastAPI skills.",
                },
            )
            self.assertEqual(len(scheduled_tasks), 1)
            asyncio.run(scheduled_tasks[0])

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["status"], "queued")
        self.assertIsNone(payload["result"])
        self.assertEqual(analysis_mock.await_args.kwargs["target_role"], "Backend Engineer")
        self.assertEqual(analysis_mock.await_args.kwargs["experience_level"], "Entry Level")
        self.assertEqual(update_calls[-1]["current_step"], "Dashboard ready")
        self.assertEqual(update_calls[-1]["result"]["target_role"], "Backend Engineer")
        response.close()

    def test_retarget_endpoint_reuses_existing_resume_text(self) -> None:
        update_calls: list[dict] = []
        scheduled_tasks = []

        def fake_update_task(task_id: str, **kwargs) -> dict:
            update_calls.append({"task_id": task_id, **kwargs})
            return _task_payload(task_id, **kwargs)

        def capture_task(coroutine) -> None:
            scheduled_tasks.append(coroutine)

        analysis_mock = AsyncMock(return_value=_analysis_result("Data Analyst"))
        existing_payload = {
            "result": {
                "resume_text_raw": "Original parsed resume text",
                "target_role": "Backend Engineer",
                "experience_level": "Entry Level",
                "parsing_method": "pdfplumber",
            }
        }

        with (
            patch("main.get_task_status", new=AsyncMock(return_value=existing_payload)),
            patch("main.initialize_task_state"),
            patch("main.update_task", side_effect=fake_update_task),
            patch("main.run_resume_review", new=analysis_mock),
            patch("main._schedule_background_task", side_effect=capture_task),
        ):
            response = self.client.post(
                "/api/re-target/original-task",
                json={
                    "target_role": "Data Analyst",
                    "experience_level": "Entry Level",
                    "job_description": "Looking for SQL and analytics experience.",
                },
            )
            self.assertEqual(len(scheduled_tasks), 1)
            asyncio.run(scheduled_tasks[0])

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertNotEqual(payload["task_id"], "original-task")
        self.assertEqual(payload["status"], "queued")
        self.assertIsNone(payload["result"])
        self.assertEqual(analysis_mock.await_args.kwargs["resume_text"], "Original parsed resume text")
        self.assertEqual(analysis_mock.await_args.kwargs["target_role"], "Data Analyst")
        self.assertEqual(update_calls[-1]["current_step"], "Dashboard ready")
        self.assertEqual(update_calls[-1]["result"]["target_role"], "Data Analyst")
        response.close()

    def test_job_search_aliases_delegate_to_backend_search(self) -> None:
        jobs = [
            {
                "role": "Product Analyst",
                "employer_name": "Acme",
                "description": "Role description",
                "matchPercentage": 80,
                "relevantSkills": ["SQL"],
                "skillsToDevelop": ["Analytics"],
                "skillProficiencyAnalysis": [],
            }
        ]
        search_mock = AsyncMock(return_value=jobs)

        with patch("main.route_job_search", new=search_mock):
            api_response = self.client.post(
                "/api/jobs/search",
                json={"query": "Product Analyst India", "job_type": "full-time"},
            )
            legacy_response = self.client.post(
                "/fetch-jobs/",
                json={"query": "Product Analyst India", "job_type": "full-time"},
            )

        self.assertEqual(api_response.status_code, 200)
        self.assertEqual(legacy_response.status_code, 200)
        self.assertEqual(api_response.json()[0]["role"], "Product Analyst")
        self.assertEqual(legacy_response.json()[0]["role"], "Product Analyst")
        self.assertEqual(search_mock.await_count, 2)
        api_response.close()
        legacy_response.close()

    def test_health_endpoint_reports_market_context(self) -> None:
        with (
            patch(
                "main.get_gateway_health",
                new=AsyncMock(
                    return_value={
                        "status": "ok",
                        "mode": "local-fallback",
                        "local_fallback_enabled": True,
                        "services": [],
                    }
                ),
            ),
            patch("main.get_sync_redis", return_value=_RedisStub()),
            patch("main.using_local_memory_store", return_value=True),
        ):
            response = self.client.get("/api/health")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["market_context"]["region_name"], "India")
        self.assertEqual(payload["redis"], "memory-local")
        self.assertEqual(payload["queue"], "direct")
        response.close()

    def test_render_health_endpoint_is_lightweight(self) -> None:
        with patch("main.get_gateway_health", new=AsyncMock(side_effect=AssertionError("should not be called"))):
            response = self.client.get("/health")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["status"], "ok")
        self.assertEqual(payload["market_context"]["region_name"], "India")
        response.close()

    def test_root_and_health_support_head_requests(self) -> None:
        root_response = self.client.head("/")
        health_response = self.client.head("/health")
        api_health_response = self.client.head("/api/health")

        self.assertEqual(root_response.status_code, 200)
        self.assertEqual(health_response.status_code, 200)
        self.assertEqual(api_health_response.status_code, 200)
        root_response.close()
        health_response.close()
        api_health_response.close()


if __name__ == "__main__":
    unittest.main()
