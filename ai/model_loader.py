import pickle
from pathlib import Path
import sys

# Global state
MODELS = {}
MODELS_LOADED = False

def load_models():
    """
    Loads all trained models from the 'models' directory.
    Updates the global MODELS dictionary and MODELS_LOADED flag.
    """
    global MODELS, MODELS_LOADED
    
    # Reset state
    MODELS = {}
    MODELS_LOADED = False
    
    # Path to models directory (sibling to this file)
    model_dir = Path(__file__).parent / "models"
    
    model_files = {
        "tent": "cadir_ihtiyac_model.pkl",
        "container": "konteyner_ihtiyac_model.pkl", 
        "food_package": "gida_kolisi_ihtiyac_model.pkl",
        "blanket": "battaniye_ihtiyac_model.pkl"
    }
    
    print(f"Loading models from: {model_dir}")
    
    try:
        # Check if dir exists
        if not model_dir.exists():
            print(f"CRITICAL: Models directory not found at {model_dir}")
            return

        for key, filename in model_files.items():
            file_path = model_dir / filename
            if not file_path.exists():
                print(f"ERROR: Model file not found: {filename}")
                continue
                
            print(f"Loading model: {key} from {filename}")
            with open(file_path, "rb") as f:
                MODELS[key] = pickle.load(f)
        
        # Verify all models loaded
        if len(MODELS) == len(model_files):
            MODELS_LOADED = True
            print("SUCCESS: All models loaded successfully.")
        else:
            print(f"WARNING: Only {len(MODELS)}/{len(model_files)} models loaded.")
            
    except Exception as e:
        print(f"CRITICAL: Failed to load models: {e}")
        MODELS_LOADED = False
