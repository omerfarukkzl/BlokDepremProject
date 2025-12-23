import { create } from 'zustand';
import aiService, { type PredictionResponse } from '../services/aiService';

export interface PredictionState {
    prediction: PredictionResponse | null;
    isLoading: boolean;
    error: string | null;
    fetchPrediction: (regionId: string) => Promise<void>;
    reset: () => void; // Good practice to have reset
}

export const usePredictionStore = create<PredictionState>((set) => ({
    prediction: null,
    isLoading: false,
    error: null,

    fetchPrediction: async (regionId: string) => {
        set({ isLoading: true, error: null });
        try {
            const prediction = await aiService.getPrediction(regionId);
            if (prediction) {
                set({ prediction, isLoading: false });
            } else {
                // Handle case where undefined is returned (fallback logic if service handles errors differently)
                set({ prediction: null, isLoading: false, error: 'No data returned' });
            }
        } catch (error: any) {
            set({
                prediction: null,
                isLoading: false,
                error: error.message || 'Failed to fetch prediction'
            });
        }
    },

    reset: () => {
        set({ prediction: null, isLoading: false, error: null });
    }
}));
