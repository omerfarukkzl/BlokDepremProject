# Story 2.1: FastAPI Prediction Service Setup

Status: done

## Story

As a **Developer**,
I want a FastAPI service exposing the 4 trained Random Forest models,
So that the NestJS backend can request predictions via HTTP.

## Acceptance Criteria

1. **Given** the AI service is running on port 5000
   **When** POST `/predict` is called with region data
   **Then** predictions for tent, container, food_package, and blanket are returned
   **And** the response includes a confidence score and prediction hash

2. **Given** the AI service is running on port 5000
   **When** GET `/health` is called
   **Then** a 200 OK response is returned when models are loaded
   **Or** a 503 Service Unavailable when models failed to load

3. **Given** the AI service receives invalid input
   **When** mandatory fields are missing or malformed
   **Then** a 422 Unprocessable Entity response is returned with validation errors

## Tasks / Subtasks

### Task 1: Create FastAPI Application Structure (AC: #2)

- [x] 1.1 Create `ai/requirements.txt` with dependencies
- [x] 1.2 Create `ai/main.py` with FastAPI app + CORS middleware
- [x] 1.3 Implement `GET /health` with model load status check

### Task 2: Create Model Loader Service (AC: #1, #2)

- [x] 2.1 Create `ai/model_loader.py` - load all 4 `.pkl` models on startup
- [x] 2.2 Add startup validation - log errors if models fail to load
- [x] 2.3 Create `ai/schemas.py` - Pydantic request/response models

### Task 3: Create Prediction Service (AC: #1)

- [x] 3.1 Create `ai/prediction_service.py` with prediction logic
- [x] 3.2 Implement feature mapping (English → Turkish)
- [x] 3.3 Calculate confidence score
- [x] 3.4 Generate SHA-256 prediction hash

### Task 4: Implement Prediction Endpoint (AC: #1, #3)

- [x] 4.1 Implement `POST /predict` endpoint
- [x] 4.2 Add Pydantic validation
- [x] 4.3 Return standardized response with hash

### Task 5: Docker Integration (AC: #1, #2)

- [x] 5.1 Create `ai/Dockerfile`
- [x] 5.2 Update `docker-compose.yaml` to add `ai-service`

### Task 6: Testing (AC: #1, #2, #3)

- [x] 6.1 Start service: `uvicorn main:app --reload --port 5000`
- [x] 6.2 Test `GET /health` → 200 with `{ "status": "healthy" }`
- [x] 6.3 Test `POST /predict` with valid input → predictions returned
- [x] 6.4 Test `POST /predict` with missing fields → 422 error

## Dev Notes

### API Contract Design Decision

> [!IMPORTANT]
> Accept **raw features** (not simplified inputs). The NestJS layer (Story 2.2) will handle any mapping from region data to these features.

### Request Schema

```python
class PredictRequest(BaseModel):
    region_id: str                    # Required identifier
    collapsed_buildings: int = 0      # yikik_bina
    urgent_demolition: int = 0        # acil_yikilacak
    severely_damaged: int = 0         # agir_hasarli
    moderately_damaged: int = 0       # orta_hasarli
    population: int                   # nufus_2023
    population_change: int = 0        # nufus_degisimi
    max_magnitude: float = 0.0        # max_magnitude
    earthquake_count: int = 0         # earthquake_count
    damage_ratio: float = 0.0         # hasar_orani
```

### Response Schema

```python
class PredictResponse(BaseModel):
    success: bool = True
    data: PredictionData
    timestamp: str  # ISO format

class PredictionData(BaseModel):
    predictions: dict  # { "tent": int, "container": int, ... }
    confidence: float  # 0.50 - 0.95
    prediction_hash: str  # SHA-256 hex
    region_id: str
```

### Feature Mapping (English → Turkish)

| Request Field | Model Feature | Description |
|---------------|---------------|-------------|
| `collapsed_buildings` | `yikik_bina` | Collapsed buildings |
| `urgent_demolition` | `acil_yikilacak` | Urgent demolitions |
| `severely_damaged` | `agir_hasarli` | Severely damaged |
| `moderately_damaged` | `orta_hasarli` | Moderately damaged |
| `population` | `nufus_2023` | Population |
| `population_change` | `nufus_degisimi` | Migration delta |
| `max_magnitude` | `max_magnitude` | Max earthquake magnitude |
| `earthquake_count` | `earthquake_count` | Aftershock count |
| `damage_ratio` | `hasar_orani` | Damage ratio |

### Model Files (Turkish Names)

| English | Model File |
|---------|-----------|
| `tent` | `cadir_ihtiyac_model.pkl` |
| `container` | `konteyner_ihtiyac_model.pkl` |
| `food_package` | `gida_kolisi_ihtiyac_model.pkl` |
| `blanket` | `battaniye_ihtiyac_model.pkl` |

### Critical Implementation: Model Loader

```python
# ai/model_loader.py
import pickle
from pathlib import Path

MODELS = {}
MODELS_LOADED = False

def load_models():
    global MODELS, MODELS_LOADED
    model_dir = Path(__file__).parent / "models"
    model_files = {
        "tent": "cadir_ihtiyac_model.pkl",
        "container": "konteyner_ihtiyac_model.pkl", 
        "food_package": "gida_kolisi_ihtiyac_model.pkl",
        "blanket": "battaniye_ihtiyac_model.pkl"
    }
    try:
        for key, filename in model_files.items():
            with open(model_dir / filename, "rb") as f:
                MODELS[key] = pickle.load(f)
        MODELS_LOADED = True
    except Exception as e:
        print(f"CRITICAL: Failed to load models: {e}")
        MODELS_LOADED = False
```

### Critical Implementation: CORS Middleware

```python
# ai/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="BlokDeprem AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # NestJS at localhost:3000
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Critical Implementation: Health Check

```python
@app.get("/health")
def health_check():
    if not model_loader.MODELS_LOADED:
        raise HTTPException(status_code=503, detail="Models not loaded")
    return {"status": "healthy", "service": "blokdeprem-ai"}
```

### Critical Implementation: Prediction Hash

```python
import hashlib
import json

def generate_hash(predictions: dict, region_id: str) -> str:
    data = {"predictions": predictions, "region_id": region_id}
    return hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()
```

### Dependencies (requirements.txt)

```
fastapi>=0.115.0
uvicorn>=0.32.0
pandas>=2.0.0
scikit-learn>=1.3.0
pydantic>=2.0.0
```

> [!IMPORTANT]
> Models use `pickle` format. Must use compatible scikit-learn version (>=1.3.0).

### Project Structure

```
ai/
├── requirements.txt        # Dependencies
├── main.py                 # FastAPI app with CORS + endpoints
├── model_loader.py         # Load .pkl models + health state
├── prediction_service.py   # Prediction logic + hash generation
├── schemas.py              # Pydantic models
├── Dockerfile              # Container config
└── models/                 # Existing trained models
    ├── cadir_ihtiyac_model.pkl
    ├── konteyner_ihtiyac_model.pkl
    ├── gida_kolisi_ihtiyac_model.pkl
    └── battaniye_ihtiyac_model.pkl
```

### References

- [architecture.md#AI-Service] - Port 5000, snake_case Python conventions
- [ai/train_model.py#L18-28] - Original feature names
- [prd.md#L346-366] - API contract reference

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Completion Notes List

- Implemented full FastAPI prediction service stack (`main.py`, `model_loader.py`, `prediction_service.py`, `schemas.py`)
- Created Docker integration (`Dockerfile`, updated `docker-compose.yml`)
- Implemented robust error handling: 503 for failed model loads, 422 for bad input
- Implemented tree-variance based confidence scoring for Random Forest models
- Verified all endpoints manually with curl: Health check, Valid prediction, Invalid input handling
- **Code Review Fixes:**
    - Added comprehensive test suite `ai/tests/test_api.py` covering health check, prediction success/failure, and validation.
    - Improved `prediction_service.py` error handling to log critical errors instead of silent failure.
    - Documented CORS wildcard usage as specific to PROTOTYPE in `ai/main.py`.

### File List

- `ai/requirements.txt` (New)
- `ai/main.py` (Modified - implemented service)
- `ai/model_loader.py` (New)
- `ai/schemas.py` (New)
- `ai/prediction_service.py` (New)
- `ai/tests/test_api.py` (New)
- `ai/Dockerfile` (New)
- `docker-compose.yml` (Modified - added ai-service)

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-23 | Story created | SM Agent |
| 2025-12-23 | Quality review: added CORS, health error handling, prediction hash, consolidated feature mapping | Validator |
