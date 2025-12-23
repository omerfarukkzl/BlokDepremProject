import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePredictionStore } from './predictionStore';
import aiService from '../services/aiService';

// Mock aiService
vi.mock('../services/aiService', () => ({
    default: {
        getPrediction: vi.fn(),
    },
}));

describe('predictionStore', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        usePredictionStore.setState({
            prediction: null,
            isLoading: false,
            error: null
        });
    });

    it('should have initial state', () => {
        const state = usePredictionStore.getState();
        expect(state.prediction).toBeNull();
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
    });

    it('fetchPrediction should update state on success', async () => {
        const mockPrediction = {
            predictions: { tent: 10 },
            confidence: 0.9,
            prediction_hash: 'abc',
            region_id: '1'
        };
        (aiService.getPrediction as any).mockResolvedValue(mockPrediction);

        await usePredictionStore.getState().fetchPrediction('1');

        const state = usePredictionStore.getState();
        expect(state.prediction).toEqual(mockPrediction);
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
    });

    it('fetchPrediction should update state on error', async () => {
        const errorMsg = 'Failed';
        (aiService.getPrediction as any).mockRejectedValue(new Error(errorMsg));

        await usePredictionStore.getState().fetchPrediction('1');

        const state = usePredictionStore.getState();
        expect(state.prediction).toBeNull();
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe(errorMsg);
    });
});
