import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from './apiClient';
import aiService from './aiService';

// Mock apiClient
vi.mock('./apiClient', () => ({
    default: {
        post: vi.fn(),
    },
}));

describe('aiService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getPrediction', () => {
        it('should call backend with correct payload', async () => {
            const regionId = 'test-region-id';
            const mockResponse = {
                success: true,
                data: {
                    predictions: { tent: 100, container: 50, food: 200, blanket: 500 },
                    confidence: 0.85,
                    prediction_hash: 'hash123',
                    region_id: regionId
                }
            };

            (apiClient.post as any).mockResolvedValue(mockResponse);

            const result = await aiService.getPrediction(regionId);

            expect(apiClient.post).toHaveBeenCalledWith('/ai/predict', { regionId });
            expect(result).toEqual(mockResponse.data);
        });

        it('should throw error when api fails', async () => {
            const regionId = 'test-region-id';
            const errorMessage = 'AI Service Unavailable';

            (apiClient.post as any).mockRejectedValue(new Error(errorMessage));

            await expect(aiService.getPrediction(regionId)).rejects.toThrow(errorMessage);
        });
    });
});
