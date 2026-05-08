import unittest
from unittest.mock import patch

import gemini_client


class _MissingModelClient:
    class models:  # noqa: N801
        @staticmethod
        def generate_content(*args, **kwargs):  # noqa: ARG004
            raise RuntimeError(
                "404 NOT_FOUND. {'error': {'code': 404, 'message': "
                "'models/gemini-1.5-flash is not found for API version v1beta, "
                "or is not supported for generateContent.', 'status': 'NOT_FOUND'}}"
            )


class GeminiClientTests(unittest.TestCase):
    def test_candidate_models_normalize_legacy_aliases(self) -> None:
        with (
            patch.object(gemini_client.settings, 'gemini_model', 'gemini-2.0-flash'),
            patch.object(
                gemini_client.settings,
                'gemini_fallback_models',
                ['gemini-1.5-flash', 'gemini-2.5-flash-lite'],
            ),
        ):
            self.assertEqual(
                gemini_client._candidate_models(),
                ['gemini-2.5-flash', 'gemini-2.5-flash-lite'],
            )

    def test_generate_json_raises_clear_error_when_models_are_invalid(self) -> None:
        with (
            patch.object(gemini_client, 'client', _MissingModelClient()),
            patch.object(gemini_client.settings, 'gemini_model', 'gemini-2.0-flash'),
            patch.object(gemini_client.settings, 'gemini_fallback_models', ['gemini-1.5-flash']),
        ):
            with self.assertRaisesRegex(RuntimeError, 'Current Gemini model configuration is invalid or deprecated'):
                gemini_client._generate_json('return json')


if __name__ == '__main__':
    unittest.main()
