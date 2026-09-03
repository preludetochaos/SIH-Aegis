"""
Prediction and explanation layer for the prototype.

The ML model predicts the probability of the DEMO elevated-risk class.
The explanation layer uses transparent thresholds to describe likely
contributing indicators. It does not diagnose a mental-health condition.
"""

from pathlib import Path
from typing import Any
import joblib
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent
MODEL_PATH = ROOT / "model" / "stress_model.pkl"

bundle = joblib.load(MODEL_PATH)
MODEL = bundle["model"]
FEATURES = bundle["features"]
MODEL_VERSION = bundle["model_version"]


def _risk_level(score: int) -> str:
    if score < 40:
        return "LOW"
    if score < 70:
        return "MODERATE"
    return "HIGH"


def _trend(history: list[float] | None) -> str:
    if not history or len(history) < 3:
        return "INSUFFICIENT_DATA"

    recent = np.array(history[-3:], dtype=float)
    change = recent[-1] - recent[0]

    if change >= 12:
        return "RAPIDLY_INCREASING"
    if change > 3:
        return "INCREASING"
    if change <= -12:
        return "RAPIDLY_DECREASING"
    if change < -3:
        return "DECREASING"
    return "STABLE"


def _factors(d: dict[str, Any]) -> list[str]:
    factors: list[str] = []

    if d["workload_score"] >= 75:
        factors.append("High workload")
    if d["deployment_days"] >= 60:
        factors.append("Extended deployment")
    if d["night_shifts"] >= 9:
        factors.append("Frequent night shifts")
    if d["consecutive_duty_days"] >= 8:
        factors.append("Long consecutive duty period")
    if d["working_hours_week"] >= 60:
        factors.append("High weekly duty hours")
    if d["wellness_stress"] >= 70:
        factors.append("Elevated self-reported stress")
    if d["sleep_score"] <= 45:
        factors.append("Low sleep/wellness score")
    if d["leave_days"] <= 2:
        factors.append("Low recent leave utilization")
    if d["social_support"] <= 40:
        factors.append("Lower reported social support")

    return factors[:5]


def predict(data: dict[str, Any], history: list[float] | None = None) -> dict[str, Any]:
    row = pd.DataFrame([{feature: data[feature] for feature in FEATURES}])
    probability = float(MODEL.predict_proba(row)[0, 1])
    score = int(round(probability * 100))

    factors = _factors(data)
    if not factors:
        factors = ["No major threshold-based indicator detected"]

    return {
        "personnel_id": data.get("personnel_id", "anonymous"),
        "risk_score": score,
        "risk_level": _risk_level(score),
        "elevated_risk_probability": round(probability, 3),
        "trend": _trend(history),
        "contributing_factors": factors,
        "recommendation": (
            "Consider a voluntary welfare check-in and workload review."
            if score >= 70
            else "Continue routine monitoring and voluntary wellness support."
        ),
        "model_version": MODEL_VERSION,
        "disclaimer": (
            "Prototype welfare-risk indicator; not a clinical diagnosis "
            "and not intended for automated personnel decisions."
        ),
    }
