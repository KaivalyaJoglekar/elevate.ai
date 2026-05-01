import unittest

from career_mapper import adapt_jsearch_to_career_path


class CareerMapperTests(unittest.TestCase):
    def test_mapper_is_deterministic_and_india_aware(self) -> None:
        jobs = [
            {
                "job_title": "Backend Engineer",
                "employer_name": "Acme",
                "job_description": "Build Python APIs, FastAPI services, and SQL-backed backend systems.",
                "job_location": "Bengaluru, Karnataka, India",
                "job_city": "Bengaluru",
                "job_state": "Karnataka",
                "job_country": "India",
                "job_is_remote": False,
                "job_employment_type": "FULLTIME",
                "job_posted_at_datetime_utc": "2026-04-29T10:00:00+00:00",
                "job_apply_link": "https://example.com/backend",
            }
        ]

        first = adapt_jsearch_to_career_path(jobs, "full-time", ["Backend", "Python", "FastAPI", "India"])
        second = adapt_jsearch_to_career_path(jobs, "full-time", ["Backend", "Python", "FastAPI", "India"])

        self.assertEqual(first, second)
        self.assertEqual(first[0]["market_region"], "India")
        self.assertGreaterEqual(first[0]["matchPercentage"], 60)
        self.assertIn("India", first[0]["matchRationale"])


if __name__ == "__main__":
    unittest.main()
