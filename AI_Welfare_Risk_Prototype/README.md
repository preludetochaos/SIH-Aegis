# AI Personnel Stress & Welfare Monitoring Prototype

## What this prototype demonstrates

This is a **2-day hackathon prototype** for the AI part of the project.

It demonstrates:

1. Synthetic/anonymized-looking personnel records.
2. Feature engineering through structured HR/workload/wellness variables.
3. A Random Forest classification model.
4. A 0–100 elevated-risk probability score.
5. LOW / MODERATE / HIGH risk categories.
6. Simple transparent contributing-factor explanations.
7. A simple trend detector over previous risk scores.
8. A FastAPI endpoint that the frontend can call.

### Important limitation

The training target is **synthetic/demo data**. This is not clinically validated and does not diagnose stress, burnout, depression, PTSD, or any other medical condition.

The system should be presented as a **welfare/stress risk indicator** for voluntary support, not as a disciplinary, promotion, deployment, or medical decision-maker.

---

# 1. Folder structure

```text
stress_ai_prototype/
│
├── data/
│   ├── generate_dataset.py
│   └── personnel_data.csv          # created by generator
│
├── model/
│   └── stress_model.pkl            # created by training script
│
├── api/
│   ├── __init__.py
│   └── main.py
│
├── predictor.py
├── train.py
├── requirements.txt
└── README.md
```

---

# 2. Setup on Windows

Open PowerShell / Command Prompt in this folder.

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

If `python` is not recognized, try `py`.

---

# 3. Generate the synthetic dataset

```bash
python data/generate_dataset.py
```

Expected result:

```text
Created 1500 synthetic records ...
```

This creates:

```text
data/personnel_data.csv
```

---

# 4. Train the AI model

```bash
python train.py
```

The script:

- loads the CSV
- selects the 13 model features
- splits data into train/test
- trains a Random Forest classifier
- prints accuracy, ROC-AUC, precision, recall and feature importance
- saves the trained model

Output:

```text
model/stress_model.pkl
```

DO NOT put a made-up accuracy number into the presentation. Use the number printed by this script.

---

# 5. Start the API

Run from the project root:

```bash
uvicorn api.main:app --reload
```

The API should be available at:

```text
http://127.0.0.1:8000
```

Interactive documentation:

```text
http://127.0.0.1:8000/docs
```

The `/docs` page lets you test the AI without building the frontend first.

---

# 6. Main API endpoints

## GET /health

Checks whether the service is running.

Response:

```json
{
  "status": "ok",
  "service": "welfare-risk-ai"
}
```

## GET /features

Returns the feature names expected by the model.

## POST /predict

Takes one personnel record and returns risk.

Example:

```json
{
  "personnel_id": "P1042",
  "service_years": 6,
  "deployment_days": 64,
  "working_hours_week": 61,
  "night_shifts": 11,
  "consecutive_duty_days": 8,
  "leave_days": 2,
  "transfers_last_year": 1,
  "training_hours": 12,
  "workload_score": 84,
  "sleep_score": 43,
  "wellness_stress": 72,
  "mood_score": 48,
  "social_support": 52
}
```

The response will contain:

```json
{
  "risk_score": 81,
  "risk_level": "HIGH",
  "trend": "INSUFFICIENT_DATA",
  "contributing_factors": [
    "High workload",
    "Extended deployment",
    "Frequent night shifts",
    "Long consecutive duty period",
    "Elevated self-reported stress"
  ],
  "recommendation": "Consider a voluntary welfare check-in and workload review."
}
```

The exact score will depend on the trained model.

---

# 7. Trend endpoint

Use:

```text
POST /predict-with-trend
```

Add:

```json
"history": [42, 48, 55, 63, 71]
```

Possible response:

```text
trend = INCREASING
```

The trend logic is intentionally simple because this is a hackathon prototype.

---

# 8. What each file does

## data/generate_dataset.py

Acts as the **demo data generator**.

It creates fields such as:

- deployment days
- working hours
- night shifts
- consecutive duty
- leave
- workload
- sleep/wellness
- self-reported stress
- mood
- social support

It then creates a synthetic `stress_risk` label using a weighted risk tendency plus noise.

This gives the model a learnable demonstration pattern.

## train.py

Acts as the **AI training pipeline**.

It:

```text
CSV
 ↓
Select features
 ↓
Train/test split
 ↓
Random Forest
 ↓
Evaluate
 ↓
Save model
```

## predictor.py

Acts as the **AI inference layer**.

The backend sends a personnel record here.

It:

```text
Personnel data
 ↓
Random Forest
 ↓
Probability
 ↓
0–100 score
 ↓
Risk level
```

It also produces the transparent “contributing factors” and trend.

## api/main.py

Acts as the **bridge between AI and frontend**.

The frontend does not need to know Python/ML internals.

It simply calls:

```text
POST /predict
```

and receives JSON.

---

# 9. Presentation: explain your AI in one slide

Use this diagram:

```text
HR / Deployment / Workload / Wellness Data
                    ↓
              Data Processing
                    ↓
            Feature Engineering
                    ↓
          Random Forest Classifier
                    ↓
             Risk Probability
                    ↓
         0–100 Welfare Risk Score
                    ↓
       ┌────────────┴────────────┐
       ↓                         ↓
 Risk Level                  Trend
LOW / MODERATE / HIGH       Increasing/Stable
       │                         │
       └────────────┬────────────┘
                    ↓
        Contributing Indicators
                    ↓
        Welfare Support Suggestion
```

---

# 10. Presentation: what to say

### “What is our AI doing?”

> Our prototype uses structured personnel data such as workload, deployment, duty hours, night shifts, leave utilization and voluntary wellness indicators. These are converted into numerical features and passed to a Random Forest classifier that estimates an elevated welfare-risk probability.

### “Why Random Forest?”

> Because our prototype data is structured tabular data. Random Forest is fast to train, easy to integrate, handles nonlinear relationships, and is suitable for a working prototype without requiring a large deep-learning infrastructure.

### “What does the score mean?”

> It is a prototype welfare-risk indicator, not a medical diagnosis. We convert the model probability into a 0–100 score and classify it as low, moderate or high.

### “How do you explain the result?”

> Alongside the prediction, the prototype checks transparent indicator thresholds such as high workload, extended deployment, frequent night shifts and low sleep/wellness scores, so the dashboard can explain the main factors associated with the result.

### “How do you detect increasing stress?”

> We maintain previous risk scores and calculate a simple trend. A sustained increase across recent observations is flagged as increasing risk.

### “Where is AI in this?”

> The predictive component is the trained Random Forest model. The trend and explanation layers are lightweight supporting logic around that model.

### “Can this be deployed with real personnel data?”

> The architecture is designed for that, but the prototype itself uses synthetic/demo data. Real deployment would require ethically sourced, anonymized and institutionally validated data, plus fairness, privacy and model-validation processes.

---

# 11. What the frontend team should do

They only need to send the JSON request to:

```text
POST http://127.0.0.1:8000/predict
```

Then display:

```text
Risk Score
81 / 100

HIGH

Main indicators:
• High workload
• Extended deployment
• Frequent night shifts

Recommendation:
Consider a voluntary welfare check-in and workload review.
```

They can also show the `history` values as a line chart.

---

# 12. Recommended demo flow for the judges

Use one fictional personnel record.

### Screen 1

```text
Personnel: P1042
```

### Screen 2

Show:

```text
Deployment: 64 days
Duty: 61 hrs/week
Night shifts: 11
Workload: 84
Sleep: 43
Stress survey: 72
```

### Screen 3

Click:

```text
ANALYZE
```

### Screen 4

Show:

```text
81 / 100
HIGH RISK

↑ Increasing

Why?
High workload
Extended deployment
Frequent night shifts
Low sleep/wellness score
```

### Screen 5

Show recommendation:

```text
Voluntary welfare check-in
Workload review
```

That is your complete AI story.

---

# 13. What NOT to claim

Do not say:

- “diagnoses mental illness”
- “predicts suicide”
- “detects depression”
- “100% accurate”
- “automatically identifies unfit personnel”
- “automatically recommends transfer/removal”

Say:

- “early welfare-risk indicator”
- “prototype prediction”
- “supportive early-warning signal”
- “requires human review”
- “uses anonymized/synthetic demonstration data”

---

# 14. Fastest way to integrate with the rest of the team

One teammate can run:

```bash
uvicorn api.main:app --reload
```

and give the frontend team:

```text
POST http://<laptop-ip>:8000/predict
```

If they are running the frontend on the same laptop, use:

```text
http://127.0.0.1:8000/predict
```

The frontend only needs the request/response contract; they do not need the Python model itself.
