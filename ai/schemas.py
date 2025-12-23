from pydantic import BaseModel, Field
from typing import Dict, Optional

class PredictRequest(BaseModel):
    region_id: str = Field(..., description="Unique identifier for the region")
    collapsed_buildings: int = Field(0, description="Number of collapsed buildings (yikik_bina)")
    urgent_demolition: int = Field(0, description="Buildings needing urgent demolition (acil_yikilacak)")
    severely_damaged: int = Field(0, description="Severely damaged buildings (agir_hasarli)")
    moderately_damaged: int = Field(0, description="Moderately damaged buildings (orta_hasarli)")
    population: int = Field(..., description="Current population (nufus_2023)")
    population_change: int = Field(0, description="Population migration/change (nufus_degisimi)")
    max_magnitude: float = Field(0.0, description="Maximum earthquake magnitude recorded")
    earthquake_count: int = Field(0, description="Number of earthquakes recorded")
    damage_ratio: float = Field(0.0, description="Calculated damage ratio")

class PredictionData(BaseModel):
    predictions: Dict[str, int] = Field(..., description="Predicted aid quantities (tent, container, etc.)")
    confidence: float = Field(..., description="Confidence score between 0.0 and 1.0")
    prediction_hash: str = Field(..., description="SHA-256 hash of the prediction data")
    region_id: str

class PredictResponse(BaseModel):
    success: bool = True
    data: PredictionData
    timestamp: str
