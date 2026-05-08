import asyncio
import unittest
from unittest.mock import AsyncMock, patch

from service_logic import build_job_search_query, enrich_resume_review_market


class ServiceLogicTests(unittest.TestCase):
    def test_job_search_query_appends_market_region_once(self) -> None:
        query = build_job_search_query(
            "Backend Engineer",
            [{"name": "Python"}, {"name": "FastAPI"}, {"name": "SQL"}],
            "Looking for backend engineer roles in product companies",
            market_region="India",
        )

        self.assertIn("India", query)
        self.assertEqual(query.count("India"), 1)
        self.assertIn("Python", query)
        self.assertIn("FastAPI", query)

    def test_job_search_query_filters_soft_skills(self) -> None:
        query = build_job_search_query(
            "Backend Engineer",
            [
                {"name": "Communication"},
                {"name": "Leadership"},
                {"name": "Python"},
                {"name": "FastAPI"},
            ],
            "Build APIs with SQL and cloud services",
            market_region="India",
        )

        self.assertIn("Python", query)
        self.assertIn("FastAPI", query)
        self.assertNotIn("Communication", query)
        self.assertNotIn("Leadership", query)

    def test_market_enrichment_completes_with_async_job_search(self) -> None:
        base_result = {
            "target_role": "Backend Engineer",
            "market_context": {"region_name": "India"},
            "full_time_query": "Backend Engineer India",
            "internship_query": "Backend Engineer internship India",
            "full_time_analysis": {"careerPaths": []},
            "internship_analysis": {"careerPaths": []},
            "quality_signals": {"job_feed_mode": "pending"},
            "analysis_metadata": {"timings_ms": {"total": 120}},
        }

        async def fake_safe_job_search(query: str, job_type: str, *, fallback_queries=None):  # noqa: ANN001,ARG001
            if job_type == "full-time":
                return ([{"role": query, "matchPercentage": 88}], None)
            return ([{"role": query, "matchPercentage": 84}], None)

        with patch("service_logic._safe_job_search", new=AsyncMock(side_effect=fake_safe_job_search)):
            enriched = asyncio.run(enrich_resume_review_market(base_result))

        self.assertFalse(enriched["job_market_pending"])
        self.assertTrue(enriched["job_market_live"])
        self.assertEqual(enriched["full_time_job_count"], 1)
        self.assertEqual(enriched["internship_job_count"], 1)
        self.assertEqual(enriched["quality_signals"]["job_feed_mode"], "live")


if __name__ == "__main__":
    unittest.main()
