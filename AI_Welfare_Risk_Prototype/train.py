"""
Train the prototype Random Forest model and save it to model/stress_model.pkl.
"""

from pathlib import Path
import joblib
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score
from sklearn.model_selection import train_test_split

ROOT = Path(__file__).resolve().parent
DATA_PATH = ROOT / "data" / "personnel_data.csv"
MODEL_DIR = ROOT / "model"
MODEL_PATH = MODEL_DIR / "stress_model.pkl"

FEATURES = [
    "service_years",
    "deployment_days",
    "working_hours_week",
    "night_shifts",
    "consecutive_duty_days",
    "leave_days",
    "transfers_last_year",
    "training_hours",
    "workload_score",
    "sleep_score",
    "wellness_stress",
    "mood_score",
    "social_support",
]

df = pd.read_csv(DATA_PATH)

X = df[FEATURES]
y = df["stress_risk"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)

model = RandomForestClassifier(
    n_estimators=250,
    max_depth=10,
    min_samples_leaf=3,
    random_state=42,
    class_weight="balanced",
    n_jobs=-1,
)

model.fit(X_train, y_train)

pred = model.predict(X_test)
prob = model.predict_proba(X_test)[:, 1]

print("\n=== MODEL EVALUATION (DEMO DATA) ===")
print(f"Accuracy: {accuracy_score(y_test, pred):.3f}")
print(f"ROC-AUC:  {roc_auc_score(y_test, prob):.3f}")
print("\nClassification report:")
print(classification_report(y_test, pred, digits=3))

print("\n=== FEATURE IMPORTANCE ===")
for name, importance in sorted(
    zip(FEATURES, model.feature_importances_),
    key=lambda x: x[1],
    reverse=True,
):
    print(f"{name:24s} {importance:.3f}")

MODEL_DIR.mkdir(exist_ok=True)
joblib.dump(
    {
        "model": model,
        "features": FEATURES,
        "model_version": "prototype-v1",
    },
    MODEL_PATH,
)

print(f"\nSaved model to: {MODEL_PATH}")
