import { create } from 'zustand';
import aiService, { type PredictionResponse } from '../services/aiService';

export interface PredictionState {
    prediction: PredictionResponse | null;
    adjustedQuantities: Record<string, number> | null;
    isLoading: boolean;
    error: string | null;
    fetchPrediction: (regionId: string) => Promise<void>;
    reset: () => void;
    setAdjustedQuantity: (key: string, value: number) => void;
    resetToOriginal: () => void;
}

export const usePredictionStore = create<PredictionState>((set) => ({
    prediction: null,
    adjustedQuantities: null,
    isLoading: false,
    error: null,

    fetchPrediction: async (regionId: string) => {
        set({ isLoading: true, error: null });
        try {
            const prediction = await aiService.getPrediction(regionId);
            if (prediction) {
                // Clear adjustedQuantities when fetching new prediction
                set({ prediction, isLoading: false, adjustedQuantities: null });
            } else {
                set({ prediction: null, isLoading: false, error: 'No data returned', adjustedQuantities: null });
            }
        } catch (error: any) {
            set({
                prediction: null,
                isLoading: false,
                error: error.message || 'Failed to fetch prediction',
                adjustedQuantities: null
            });
        }
    },

    // CRITICAL: Also clears adjustedQuantities
    reset: () => {
        set({ prediction: null, adjustedQuantities: null, isLoading: false, error: null });
    },

    setAdjustedQuantity: (key, value) => set((state) => ({
        adjustedQuantities: {
            ...(state.adjustedQuantities ?? state.prediction?.predictions ?? {}),
            [key]: value
        }
    })),

    resetToOriginal: () => set({ adjustedQuantities: null }),
}));

// Selector hook - use this in components
export const useActiveQuantities = () => {
    const { prediction, adjustedQuantities } = usePredictionStore();
    return adjustedQuantities ?? prediction?.predictions ?? null;
};
