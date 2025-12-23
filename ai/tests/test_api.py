from fastapi.testclient import TestClient
from main import app
import pytest
from unittest.mock import patch, MagicMock
from schemas import PredictRequest

client = TestClient(app)

def test_health_check_success():
    """
    Test that health check returns 200 and loaded status when logic works.
    We mock model_loader to ensure test stability regardless of actual files.
    """
    with patch("model_loader.MODELS_LOADED", True):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy", "service": "blokdeprem-ai"}

def test_health_check_failure():
    """
    Test that health check returns 503 if models are not loaded.
    """
    with patch("model_loader.MODELS_LOADED", False):
        response = client.get("/health")
        assert response.status_code == 503
        assert response.json()["detail"] == "Models not loaded"

def test_predict_success():
    """
    Test prediction endpoint with valid data.
    """
    # Mocking prediction logic to avoid dependency on actual .pkl files during CI/test
    mock_data = {
        "predictions": {"tent": 100},
        "confidence": 0.85,
        "prediction_hash": "mock_hash",
        "region_id": "test_region"
    }
    
    with patch("prediction_service.generate_predictions") as mock_pred:
        mock_pred.return_value = mock_data
        
        payload = {
            "region_id": "test_region",
            "population": 50000,
            "collapsed_buildings": 100
        }
        
        response = client.post("/predict", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["predictions"]["tent"] == 100
        assert "timestamp" in data

def test_predict_validation_error():
    """
    Test that missing required fields (population) returns 422.
    """
    payload = {
        "region_id": "test_region",
        "collapsed_buildings": 100
        # Missing population
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422
    assert "population" in response.text

def test_predict_service_error():
    """
    Test that internal logical errors in prediction service result in 503.
    """
    with patch("prediction_service.generate_predictions", side_effect=ValueError("Test Logic Error")):
        payload = {
            "region_id": "test_region",
            "population": 50000
        }
        response = client.post("/predict", json=payload)
        assert response.status_code == 503
        assert "Test Logic Error" in response.json()["detail"]
