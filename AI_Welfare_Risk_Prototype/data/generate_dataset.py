"""
Generate synthetic/anonymized personnel wellness data for the prototype.

Purpose:
- Creates realistic-looking numeric HR / workload / wellness variables.
- Creates a DEMO target (stress_risk) for training.
- This is NOT clinical data and NOT a validated mental-health model.
"""

from pathlib import Path
import numpy as np
import pandas as pd

SEED = 42
N = 1500
OUT = Path(__file__).resolve().parent / "personnel_data.csv"

rng = np.random.default_rng(SEED)

df = pd.DataFrame({
    "personnel_id": [f"P{n:04d}" for n in range(1, N + 1)],
    "service_years": rng.integers(1, 26, N),
    "deployment_days": np.clip(rng.normal(38, 24, N), 0, 120).round().astype(int),
    "working_hours_week": np.clip(rng.normal(50, 9, N), 30, 75).round().astype(int),
    "night_shifts": np.clip(rng.normal(6, 4, N), 0, 18).round().astype(int),
    "consecutive_duty_days": np.clip(rng.normal(5, 2.5, N), 1, 14).round().astype(int),
    "leave_days": np.clip(rng.normal(7, 4, N), 0, 20).round().astype(int),
    "transfers_last_year": np.clip(rng.poisson(0.8, N), 0, 4).astype(int),
    "training_hours": np.clip(rng.normal(12, 7, N), 0, 35).round().astype(int),
    "workload_score": np.clip(rng.normal(58, 18, N), 0, 100).round().astype(int),
    "sleep_score": np.clip(rng.normal(68, 15, N), 20, 100).round().astype(int),
    "wellness_stress": np.clip(rng.normal(48, 20, N), 0, 100).round().astype(int),
    "mood_score": np.clip(rng.normal(68, 16, N), 0, 100).round().astype(int),
    "social_support": np.clip(rng.normal(67, 17, N), 0, 100).round().astype(int),
})

# Create a DEMONSTRATION risk tendency.
# Higher workload/deployment/night duty/stress and lower sleep/mood/support increase risk.
raw = (
    0.24 * df["workload_score"]
    + 0.13 * (df["deployment_days"] / 1.2)
    + 0.09 * df["working_hours_week"]
    + 0.10 * (df["night_shifts"] / 0.18)
    + 0.10 * (df["consecutive_duty_days"] / 0.14)
    + 0.19 * df["wellness_stress"]
    + 0.08 * (100 - df["sleep_score"])
    + 0.05 * (100 - df["mood_score"])
    + 0.05 * (100 - df["social_support"])
    + rng.normal(0, 8, N)
)

# Convert to roughly 25–35% elevated-risk examples.
threshold = np.quantile(raw, 0.68)
df["stress_risk"] = (raw >= threshold).astype(int)

# Simulated weekly risk score history for trend demos.
# It is deliberately separate from the ML target.
trend_slopes = rng.normal(0, 4, N)
base = np.clip(35 + (raw - raw.mean()) * 0.12 + rng.normal(0, 5, N), 10, 90)
for week in range(1, 6):
    df[f"risk_week_{week}"] = np.clip(
        base + trend_slopes * (week - 1) + rng.normal(0, 4, N),
        0, 100
    ).round(0).astype(int)

df.to_csv(OUT, index=False)
print(f"Created {len(df)} synthetic records at: {OUT}")
print(df["stress_risk"].value_counts(normalize=True).rename("proportion"))
