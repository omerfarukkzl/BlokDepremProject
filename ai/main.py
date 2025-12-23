from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import model_loader
import prediction_service
from schemas import PredictRequest, PredictResponse

app = FastAPI(title="BlokDeprem AI Service")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # WARNING: "allow all" is for PROTOTYPE ONLY. Restrict in production.
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    model_loader.load_models()

@app.get("/health")
def health_check():
    """
    Health check endpoint that verifies model loading status.
    Returns 200 if models are loaded, 503 if not.
    """
    try:
        if not model_loader.MODELS_LOADED:
            raise HTTPException(status_code=503, detail="Models not loaded")
        return {"status": "healthy", "service": "blokdeprem-ai"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=503, detail=str(e))

@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    """
    Generate aid predictions for a given region.
    """
    try:
        data = prediction_service.generate_predictions(request, request.region_id)
        return PredictResponse(
            success=True,
            data=data,
            timestamp=datetime.utcnow().isoformat() + "Z"
        )
    except ValueError as e:
        # Expected error (e.g., models not loaded)
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        print(f"Prediction Error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")