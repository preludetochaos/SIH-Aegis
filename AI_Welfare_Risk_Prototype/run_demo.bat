@echo off
echo ==========================================
echo Welfare Risk AI Prototype
echo ==========================================

python -m pip install -r requirements.txt
python data\generate_dataset.py
python train.py

echo.
echo Starting API...
echo Open http://127.0.0.1:8000/docs
echo.
python -m uvicorn api.main:app --reload
pause
