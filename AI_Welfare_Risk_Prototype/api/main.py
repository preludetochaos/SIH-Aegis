from pathlib import Path
import sys
from typing import Any

import pandas as pd

# Allow running: uvicorn api.main:app --reload
ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "personnel_data.csv"
TREND_COLUMNS = [f"risk_week_{week}" for week in range(1, 6)]
sys.path.insert(0, str(ROOT))

from fastapi import FastAPI, HTTPException, status
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

class PredictWithHistory(PredictionRequest):
    history: list[float] | None = Field(default=None, min_length=3, max_length=12)


class PersonnelIdRequest(BaseModel):
    personnel_id: str = Field(min_length=1, max_length=100)


def _get_personnel_record(personnel_id: str) -> tuple[dict[str, Any], list[float]]:
    """Load one CSV record and its stored weekly history for model inference."""
    if not DATA_PATH.exists():
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Personnel data file is unavailable.",
        )

    try:
        data = pd.read_csv(DATA_PATH, dtype={"personnel_id": str})
    except (OSError, pd.errors.ParserError) as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Personnel data could not be read.",
        ) from error

    required_columns = {"personnel_id", *FEATURES, *TREND_COLUMNS}
    if required_columns.difference(data.columns):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Personnel data is missing required columns.",
        )

    normalized_id = personnel_id.strip()
    matches = data[data["personnel_id"].str.strip() == normalized_id]
    if matches.empty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Personnel ID '{normalized_id}' was not found.",
        )
    if len(matches) > 1:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Personnel ID '{normalized_id}' is not unique in the personnel data.",
        )

    record = matches.iloc[0]
    payload = {feature: record[feature] for feature in FEATURES}
    payload["personnel_id"] = record["personnel_id"]
    history = [float(record[column]) for column in TREND_COLUMNS]
    return payload, history


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


@app.post("/predict-by-personnel-id")
def predict_by_personnel_id(request: PersonnelIdRequest) -> dict[str, Any]:
    """Look up a CSV record by personnel ID and return its AI risk prediction."""
    payload, history = _get_personnel_record(request.personnel_id)
    return predict(payload, history=history)


@app.post("/predict-with-trend")
def predict_risk_with_trend(request: PredictWithHistory) -> dict[str, Any]:
    payload = request.model_dump()
    history = payload.pop("history", None)
    return predict(payload, history=history)
