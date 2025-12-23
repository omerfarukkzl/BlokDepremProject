# BlokDeprem - Random Forest Aid Prediction Model
# Train a model to predict aid needs based on earthquake damage data

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score
import pickle
from pathlib import Path

DATA_DIR = Path("data")
MODEL_DIR = Path("ai/models")
MODEL_DIR.mkdir(parents=True, exist_ok=True)

# Features to use for prediction
FEATURES = [
    'yikik_bina',           # Collapsed buildings
    'acil_yikilacak',       # Urgent demolition needed
    'agir_hasarli',         # Severely damaged
    'orta_hasarli',         # Moderately damaged
    'nufus_2023',           # Current population
    'nufus_degisimi',       # Population change (migration)
    'max_magnitude',        # Maximum earthquake magnitude
    'earthquake_count',     # Number of earthquakes
    'hasar_orani',          # Damage ratio (derived)
]

# Targets to predict
TARGETS = ['cadir_ihtiyac', 'konteyner_ihtiyac', 'gida_kolisi_ihtiyac', 'battaniye_ihtiyac']

def load_data():
    """Load training dataset"""
    df = pd.read_csv(DATA_DIR / "training_dataset_2023.csv")
    return df

def train_model(target_name='cadir_ihtiyac'):
    """Train Random Forest model for a specific target"""
    
    print(f"\n{'='*50}")
    print(f"Training model for: {target_name}")
    print(f"{'='*50}")
    
    # Load data
    df = load_data()
    
    # Prepare features and target
    X = df[FEATURES].fillna(0)
    y = df[target_name]
    
    # Note: With only 11 samples, we use Leave-One-Out cross-validation
    # In production, you'd need more data
    
    # Train model on all data (for demonstration)
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=5,
        min_samples_split=2,
        random_state=42
    )
    
    # Cross-validation with limited data
    scores = cross_val_score(model, X, y, cv=min(5, len(df)), scoring='neg_mean_absolute_error')
    
    # Fit on all data
    model.fit(X, y)
    
    # Feature importance
    importances = pd.DataFrame({
        'feature': FEATURES,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\nFeature Importance:")
    for _, row in importances.iterrows():
        print(f"  {row['feature']}: {row['importance']:.3f}")
    
    print(f"\nCross-validation MAE: {-scores.mean():.0f} (+/- {scores.std():.0f})")
    
    # Save model
    model_path = MODEL_DIR / f"{target_name}_model.pkl"
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    print(f"Model saved to: {model_path}")
    
    return model, importances

def predict_needs(model, input_data):
    """Make prediction for new earthquake scenario"""
    X = pd.DataFrame([input_data])[FEATURES].fillna(0)
    prediction = model.predict(X)[0]
    return int(prediction)

def main():
    """Train models for all targets"""
    
    print("BlokDeprem AI - Aid Prediction Model Training")
    print("=" * 50)
    
    models = {}
    for target in TARGETS:
        model, _ = train_model(target)
        models[target] = model
    
    # Example prediction
    print("\n" + "=" * 50)
    print("EXAMPLE PREDICTION")
    print("=" * 50)
    
    # Simulate a new earthquake scenario
    example_input = {
        'yikik_bina': 5000,          # 5000 collapsed buildings
        'acil_yikilacak': 2000,      # 2000 urgent demolitions
        'agir_hasarli': 15000,       # 15000 severely damaged
        'orta_hasarli': 5000,        # 5000 moderately damaged
        'nufus_2023': 800000,        # 800k population
        'nufus_degisimi': -50000,    # 50k migration out
        'max_magnitude': 7.2,        # 7.2 magnitude
        'earthquake_count': 500,     # 500 aftershocks
        'hasar_orani': 0.25,         # 25% damage ratio
    }
    
    print("\nInput Scenario:")
    for key, value in example_input.items():
        print(f"  {key}: {value}")
    
    print("\nPredicted Aid Needs:")
    for target in TARGETS:
        prediction = predict_needs(models[target], example_input)
        print(f"  {target}: {prediction:,}")
    
    print("\n✅ Model training complete!")
    print(f"   Models saved to: {MODEL_DIR}/")

if __name__ == "__main__":
    main()
