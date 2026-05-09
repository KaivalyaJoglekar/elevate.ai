import unittest

from resume_pipeline import _extract_reference_keywords


class ResumePipelineKeywordTests(unittest.TestCase):
    def test_reference_keywords_do_not_use_generic_fallback_copy(self) -> None:
        keywords = _extract_reference_keywords("AI-ML", "")

        self.assertIn("ai-ml", keywords)
        self.assertNotIn("evaluate", keywords)
        self.assertNotIn("alignment", keywords)
        self.assertNotIn("communication", keywords)
        self.assertNotIn("production", keywords)

    def test_reference_keywords_filter_generic_job_description_words(self) -> None:
        keywords = _extract_reference_keywords(
            "Backend Engineer",
            "Looking for a backend engineer with Python, FastAPI, SQL, Docker, communication, and delivery skills.",
        )

        self.assertIn("backend", keywords)
        self.assertIn("python", keywords)
        self.assertIn("fastapi", keywords)
        self.assertIn("sql", keywords)
        self.assertIn("docker", keywords)
        self.assertNotIn("communication", keywords)
        self.assertNotIn("delivery", keywords)
        self.assertNotIn("engineer", keywords)


if __name__ == "__main__":
    unittest.main()
