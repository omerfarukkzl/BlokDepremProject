import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePredictionStore, useActiveQuantities } from './predictionStore';
import aiService from '../services/aiService';
import { renderHook } from '@testing-library/react';

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
            adjustedQuantities: null,
            isLoading: false,
            error: null
        });
    });

    describe('initial state', () => {
        it('should have initial state', () => {
            const state = usePredictionStore.getState();
            expect(state.prediction).toBeNull();
            expect(state.adjustedQuantities).toBeNull();
            expect(state.isLoading).toBe(false);
            expect(state.error).toBeNull();
        });
    });

    describe('fetchPrediction', () => {
        it('should update state on success', async () => {
            const mockPrediction = {
                predictions: { tent: 10, container: 5 },
                confidence: 0.9,
                prediction_hash: 'abc',
                region_id: '1'
            };
            (aiService.getPrediction as any).mockResolvedValue(mockPrediction);

            await usePredictionStore.getState().fetchPrediction('1');

            const state = usePredictionStore.getState();
            expect(state.prediction).toEqual(mockPrediction);
            expect(state.adjustedQuantities).toBeNull();
            expect(state.isLoading).toBe(false);
            expect(state.error).toBeNull();
        });

        it('should update state on error', async () => {
            const errorMsg = 'Failed';
            (aiService.getPrediction as any).mockRejectedValue(new Error(errorMsg));

            await usePredictionStore.getState().fetchPrediction('1');

            const state = usePredictionStore.getState();
            expect(state.prediction).toBeNull();
            expect(state.adjustedQuantities).toBeNull();
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe(errorMsg);
        });

        it('should clear adjustedQuantities when fetching new prediction', async () => {
            // Set up existing adjusted quantities
            usePredictionStore.setState({
                prediction: { predictions: { tent: 10 }, confidence: 0.8, prediction_hash: 'old', region_id: '1' },
                adjustedQuantities: { tent: 15 },
                isLoading: false,
                error: null
            });

            const mockPrediction = {
                predictions: { tent: 20 },
                confidence: 0.9,
                prediction_hash: 'new',
                region_id: '2'
            };
            (aiService.getPrediction as any).mockResolvedValue(mockPrediction);

            await usePredictionStore.getState().fetchPrediction('2');

            const state = usePredictionStore.getState();
            expect(state.adjustedQuantities).toBeNull();
        });
    });

    describe('setAdjustedQuantity', () => {
        it('should create adjustedQuantities from original predictions', () => {
            usePredictionStore.setState({
                prediction: { predictions: { tent: 10, container: 5 }, confidence: 0.8, prediction_hash: 'abc', region_id: '1' },
                adjustedQuantities: null,
                isLoading: false,
                error: null
            });

            usePredictionStore.getState().setAdjustedQuantity('tent', 15);

            const state = usePredictionStore.getState();
            expect(state.adjustedQuantities).toEqual({ tent: 15, container: 5 });
        });

        it('should update existing adjustedQuantities', () => {
            usePredictionStore.setState({
                prediction: { predictions: { tent: 10, container: 5 }, confidence: 0.8, prediction_hash: 'abc', region_id: '1' },
                adjustedQuantities: { tent: 15, container: 5 },
                isLoading: false,
                error: null
            });

            usePredictionStore.getState().setAdjustedQuantity('container', 8);

            const state = usePredictionStore.getState();
            expect(state.adjustedQuantities).toEqual({ tent: 15, container: 8 });
        });
    });

    describe('resetToOriginal', () => {
        it('should clear adjustedQuantities to null', () => {
            usePredictionStore.setState({
                prediction: { predictions: { tent: 10 }, confidence: 0.8, prediction_hash: 'abc', region_id: '1' },
                adjustedQuantities: { tent: 15 },
                isLoading: false,
                error: null
            });

            usePredictionStore.getState().resetToOriginal();

            const state = usePredictionStore.getState();
            expect(state.adjustedQuantities).toBeNull();
            expect(state.prediction).not.toBeNull(); // prediction should remain
        });
    });

    describe('reset', () => {
        it('should clear all state including adjustedQuantities', () => {
            usePredictionStore.setState({
                prediction: { predictions: { tent: 10 }, confidence: 0.8, prediction_hash: 'abc', region_id: '1' },
                adjustedQuantities: { tent: 15 },
                isLoading: true,
                error: 'Some error'
            });

            usePredictionStore.getState().reset();

            const state = usePredictionStore.getState();
            expect(state.prediction).toBeNull();
            expect(state.adjustedQuantities).toBeNull();
            expect(state.isLoading).toBe(false);
            expect(state.error).toBeNull();
        });
    });
});

describe('useActiveQuantities', () => {
    beforeEach(() => {
        usePredictionStore.setState({
            prediction: null,
            adjustedQuantities: null,
            isLoading: false,
            error: null
        });
    });

    it('should return null when no prediction', () => {
        const { result } = renderHook(() => useActiveQuantities());
        expect(result.current).toBeNull();
    });

    it('should return original predictions when no adjustments', () => {
        usePredictionStore.setState({
            prediction: { predictions: { tent: 10, container: 5 }, confidence: 0.8, prediction_hash: 'abc', region_id: '1' },
            adjustedQuantities: null,
            isLoading: false,
            error: null
        });

        const { result } = renderHook(() => useActiveQuantities());
        expect(result.current).toEqual({ tent: 10, container: 5 });
    });

    it('should return adjusted quantities when adjustments exist', () => {
        usePredictionStore.setState({
            prediction: { predictions: { tent: 10, container: 5 }, confidence: 0.8, prediction_hash: 'abc', region_id: '1' },
            adjustedQuantities: { tent: 15, container: 5 },
            isLoading: false,
            error: null
        });

        const { result } = renderHook(() => useActiveQuantities());
        expect(result.current).toEqual({ tent: 15, container: 5 });
    });
});
