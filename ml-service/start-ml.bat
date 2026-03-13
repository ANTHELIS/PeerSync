@echo off
echo ============================================================
echo   PeerSync ML Service Starting...
echo   URL: http://localhost:8000
echo   Docs: http://localhost:8000/docs
echo ============================================================
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
