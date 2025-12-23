import pandas as pd
import numpy as np
import model_loader
import hashlib
import json
from schemas import PredictRequest, PredictionData
from typing import Dict, List

# Feature keys in the exact order expected by the models (from train_model.py)
FEATURE_COLUMNS = [
    'yikik_bina',           # collapsed_buildings
    'acil_yikilacak',       # urgent_demolition
    'agir_hasarli',         # severely_damaged
    'orta_hasarli',         # moderately_damaged
    'nufus_2023',           # population
    'nufus_degisimi',       # population_change
    'max_magnitude',        # max_magnitude
    'earthquake_count',     # earthquake_count
    'hasar_orani',          # damage_ratio
]

def generate_predictions(request: PredictRequest, region_id: str) -> PredictionData:
    """
    Generates predictions for all aid types using loaded models.
    """
    if not model_loader.MODELS_LOADED:
        raise ValueError("Models are not loaded. Cannot generate predictions.")

    # 1. Feature Mapping (English -> Turkish) and DataFrame creation
    features_dict = {
        "yikik_bina": request.collapsed_buildings,
        "acil_yikilacak": request.urgent_demolition,
        "agir_hasarli": request.severely_damaged,
        "orta_hasarli": request.moderately_damaged,
        "nufus_2023": request.population,
        "nufus_degisimi": request.population_change,
        "max_magnitude": request.max_magnitude,
        "earthquake_count": request.earthquake_count,
        "hasar_orani": request.damage_ratio
    }
    
    # Create DataFrame with single row and correct column order
    input_df = pd.DataFrame([features_dict])[FEATURE_COLUMNS]
    
    predictions: Dict[str, int] = {}
    total_confidence = 0.0
    model_count = 0
    
    # 2. Generate Predictions
    for aid_type, model in model_loader.MODELS.items():
        try:
            # Predict
            pred_value = model.predict(input_df)[0]
            # Ensure non-negative and integer
            pred_value = max(0, int(round(pred_value)))
            predictions[aid_type] = pred_value
            
            # 3. Calculate Confidence (Variance of Trees approach)
            # Access underlying estimators (trees) if available
            if hasattr(model, "estimators_"):
                # Get prediction from each tree
                # Note: estimators_ expects raw numpy array usually
                tree_preds = [tree.predict(input_df.values) for tree in model.estimators_]
                tree_preds = np.array(tree_preds)
                
                # Calculate coefficient of variation (std_dev / mean)
                mean_pred = np.mean(tree_preds)
                std_dev = np.std(tree_preds)
                
                if mean_pred > 0:
                    cov = std_dev / mean_pred
                    # Confidence decreases as CoV increases
                    # Heuristic: 1 - CoV, clipped to [0.5, 0.95]
                    conf = max(0.5, min(0.95, 1.0 - cov))
                else:
                    conf = 0.5 # Conservative fallback for 0 prediction
            else:
                conf = 0.8 # Fallback if not a forest/ensemble
                
            total_confidence += conf
            model_count += 1
            
        except Exception as e:
            # FIX: Do not silently swallow errors. 
            print(f"CRITICAL ERROR predicting {aid_type}: {e}")
            # For this prototype, we will return 0 but logged loudly.
            # In production, we might want to fail the whole request or mark this prediction as failed.
            predictions[aid_type] = 0 

            
    avg_confidence = total_confidence / model_count if model_count > 0 else 0.0
    
    # 4. Generate Hash
    prediction_hash = generate_hash(predictions, region_id)
    
    return PredictionData(
        predictions=predictions,
        confidence=round(avg_confidence, 2),
        prediction_hash=prediction_hash,
        region_id=region_id
    )

def generate_hash(predictions: Dict[str, int], region_id: str) -> str:
    """
    Generates a deterministic SHA-256 hash of the prediction data.
    """
    data = {"predictions": predictions, "region_id": region_id}
    # Sort keys to ensure deterministic JSON
    json_str = json.dumps(data, sort_keys=True)
    return hashlib.sha256(json_str.encode()).hexdigest()
