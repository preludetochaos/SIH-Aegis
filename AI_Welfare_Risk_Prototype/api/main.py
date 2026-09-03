from pathlib import Path
import sys
from typing import Any

# Allow running: uvicorn api.main:app --reload
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from predictor import predict, FEATURES


class PredictionRequest(BaseModel):
    personnel_id: str = "anonymous"
    service_years: int = Field(ge=0, le=50)
    deployment_days: int = Field(ge=0, le=365)
    working_hours_week: int = Field(ge=0, le=120)
    night_shifts: int = Field(ge=0, le=40)
    consecutive_duty_days: int = Field(ge=0, le=60)
    leave_days: int = Field(ge=0, le=60)
    transfers_last_year: int = Field(ge=0, le=20)
    training_hours: int = Field(ge=0, le=200)
    workload_score: float = Field(ge=0, le=100)
    sleep_score: float = Field(ge=0, le=100)
    wellness_stress: float = Field(ge=0, le=100)
    mood_score: float = Field(ge=0, le=100)
    social_support: float = Field(ge=0, le=100)

class PredictWithHistory(PredictionRequest):
    history: list[float] | None = Field(default=None, min_length=3, max_length=12)


app = FastAPI(
    title="AI Personnel Welfare Risk Prototype",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Prototype only; restrict in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "welfare-risk-ai"}


@app.get("/features")
def features() -> dict[str, Any]:
    return {
        "features": FEATURES,
        "count": len(FEATURES),
    }


@app.post("/predict")
def predict_risk(request: PredictionRequest) -> dict[str, Any]:
    return predict(request.model_dump())


@app.post("/predict-with-trend")
def predict_risk_with_trend(request: PredictWithHistory) -> dict[str, Any]:
    payload = request.model_dump()
    history = payload.pop("history", None)
    return predict(payload, history=history)
