"""Endpoint tests for the prototype API."""

import unittest

from fastapi.testclient import TestClient

from api.main import app


class PersonnelIdPredictionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.client = TestClient(app)

    def test_predicts_matching_csv_record(self) -> None:
        response = self.client.post(
            "/predict-by-personnel-id", json={"personnel_id": "P0001"}
        )

        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertEqual(result["personnel_id"], "P0001")
        self.assertIsInstance(result["risk_score"], int)
        self.assertIn(result["risk_level"], {"LOW", "MODERATE", "HIGH"})
        self.assertNotEqual(result["trend"], "INSUFFICIENT_DATA")

    def test_returns_404_for_unknown_personnel_id(self) -> None:
        response = self.client.post(
            "/predict-by-personnel-id", json={"personnel_id": "P9999"}
        )

        self.assertEqual(response.status_code, 404)
        self.assertIn("not found", response.json()["detail"])


if __name__ == "__main__":
    unittest.main()
