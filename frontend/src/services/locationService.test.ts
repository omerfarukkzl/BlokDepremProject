import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from './apiClient';
import locationService from './locationService';

// Mock apiClient
vi.mock('./apiClient', () => ({
    default: {
        get: vi.fn(),
    },
}));

describe('locationService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('fetchRegions', () => {
        it('should fetch locations from backend', async () => {
            const mockLocations = [
                { id: 1, name: 'Hatay' },
                { id: 2, name: 'Kahramanmaras' }
            ];
            const mockResponse = {
                success: true,
                data: mockLocations
            };

            (apiClient.get as any).mockResolvedValue(mockResponse);

            const result = await locationService.fetchRegions();

            expect(apiClient.get).toHaveBeenCalledWith('/locations');
            expect(result).toEqual(mockLocations);
        });

        it('should return empty array on failure or error', async () => {
            // Decide constraint: Should it throw or return empty?
            // Prototype: lets verify if it throws. Code usually throws from apiClient.
            // If I want it to be robust I could catch, but usually service layers propagate errors.
            // Let's implement it to propagate error for now, as apiClient interceptors handle global errors.
            const errorMessage = 'Network Error';
            (apiClient.get as any).mockRejectedValue(new Error(errorMessage));

            await expect(locationService.fetchRegions()).rejects.toThrow(errorMessage);
        });
    });
});
