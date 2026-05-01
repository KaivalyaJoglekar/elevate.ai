import unittest

from service_logic import build_job_search_query


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


if __name__ == "__main__":
    unittest.main()
