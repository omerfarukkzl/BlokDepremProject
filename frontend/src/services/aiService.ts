import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants';
import type { DashboardStats, ReportFilters } from '../types/reports';

export interface PredictionResponse {
    predictions: Record<string, number>;
    confidence: number;
    prediction_hash: string;
    region_id: string;
    predictionId: number;
}

const aiService = {
    getPrediction: async (regionId: string): Promise<PredictionResponse | undefined> => {
        // Define internal response type including the mixed-in predictionId
        type RawPredictionResponse = {
            success: boolean;
            data: Omit<PredictionResponse, 'predictionId'>;
            predictionId: number;
        };

        const response = await apiClient.post<RawPredictionResponse>('/ai/predict', { region_id: regionId });

        // apiClient.post returns the parsed body directly in our setup (usually), 
        // but if it returns an AxiosResponse-like structure, we access .data. 
        // Assuming apiClient returns the body based on usage in other files.
        // Checking usage: apiClient.get<DashboardStats> returns 'response.data'.
        // Wait, typical axios usage: axios.post returns { data: T, ... }. 
        // Existing code did: `response.data` which implies `response` is the Axios response object.

        if (response.data && response.data.success) {
            return {
                ...response.data.data,
                predictionId: response.data.predictionId
            };
        }
        return undefined;
    },

    getReportsStats: async (filters?: ReportFilters): Promise<DashboardStats | undefined> => {
        // Build query string from filters
        const params = new URLSearchParams();
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.regionId) params.append('regionId', filters.regionId);
        if (filters?.category) params.append('category', filters.category);

        const queryString = params.toString();
        const url = queryString
            ? `${API_ENDPOINTS.REPORTS.DASHBOARD_STATS}?${queryString}`
            : API_ENDPOINTS.REPORTS.DASHBOARD_STATS;

        const response = await apiClient.get<DashboardStats>(url);
        return response.data;
    }
};

export default aiService;

