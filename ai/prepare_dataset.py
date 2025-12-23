# BlokDeprem ML Dataset Preparation
# This script merges earthquake data with aid distribution data

import pandas as pd
import numpy as np
from pathlib import Path

# Data directory
DATA_DIR = Path("data")

def load_earthquake_data():
    """Load and process earthquake data from Kaggle"""
    df = pd.read_csv(DATA_DIR / "Earthquakes.csv")
    
    # Extract province from Location column
    # Format: "İlçe (İl)" -> we want "İl"
    df['il'] = df['Location'].str.extract(r'\(([^)]+)\)')[0]
    
    # Clean province names (standardize Turkish characters)
    province_mapping = {
        'Kahramanmaraş': 'Kahramanmaras',
        'Şanlıurfa': 'Sanliurfa',
        'Diyarbakır': 'Diyarbakir',
        'Elazığ': 'Elazig'
    }
    df['il'] = df['il'].replace(province_mapping)
    
    # Aggregate by province
    province_stats = df.groupby('il').agg({
        'Magnitude': ['max', 'mean', 'count'],
        'Depth': 'mean',
        'Latitude': 'mean',
        'Longitude': 'mean'
    }).round(2)
    
    # Flatten column names
    province_stats.columns = ['max_magnitude', 'avg_magnitude', 'earthquake_count', 
                              'avg_depth', 'lat', 'lon']
    province_stats = province_stats.reset_index()
    
    return province_stats

def load_aid_data():
    """Load aid distribution data"""
    df = pd.read_csv(DATA_DIR / "aid_distribution_2023.csv")
    return df

def create_ml_dataset():
    """Create merged ML-ready dataset"""
    
    # Load data
    earthquakes = load_earthquake_data()
    aid = load_aid_data()
    
    # Merge on province
    merged = aid.merge(earthquakes, on='il', how='left')
    
    # Fill missing earthquake data with 0 (some provinces may not have earthquakes in dataset)
    merged = merged.fillna(0)
    
    # Create derived features
    merged['hasar_orani'] = (merged['yikik_bina'] + merged['acil_yikilacak'] + merged['agir_hasarli']) / (
        merged['yikik_bina'] + merged['acil_yikilacak'] + merged['agir_hasarli'] + 
        merged['orta_hasarli'] + merged['az_hasarli'] + 1)  # +1 to avoid division by zero
    
    merged['nufus_yogunlugu_etkisi'] = merged['nufus_degisimi'] / merged['nufus_2022']
    
    # Calculate needs per capita
    merged['cadir_per_1000'] = merged['cadir_ihtiyac'] / (merged['nufus_2023'] / 1000)
    merged['gida_per_1000'] = merged['gida_kolisi_ihtiyac'] / (merged['nufus_2023'] / 1000)
    
    return merged

def save_training_data(df, filename="training_dataset_2023.csv"):
    """Save processed dataset"""
    df.to_csv(DATA_DIR / filename, index=False)
    print(f"Saved {len(df)} records to {DATA_DIR / filename}")
    
    # Print dataset info
    print("\nDataset Columns:")
    for col in df.columns:
        print(f"  - {col}: {df[col].dtype}")
    
    print(f"\nFeatures (X): {[c for c in df.columns if c not in ['cadir_ihtiyac', 'konteyner_ihtiyac', 'gida_kolisi_ihtiyac', 'battaniye_ihtiyac', 'kaynak', 'il']]}")
    print(f"Targets (y): ['cadir_ihtiyac', 'konteyner_ihtiyac', 'gida_kolisi_ihtiyac', 'battaniye_ihtiyac']")

if __name__ == "__main__":
    # Create and save ML dataset
    df = create_ml_dataset()
    save_training_data(df)
    
    # Display sample
    print("\nSample Data:")
    print(df[['il', 'yikik_bina', 'max_magnitude', 'cadir_ihtiyac', 'hasar_orani']].head())
