import apiClient from './apiClient';

export interface PredictionResponse {
    predictions: Record<string, number>;
    confidence: number;
    prediction_hash: string;
    region_id: string;
}

const aiService = {
    getPrediction: async (regionId: string): Promise<PredictionResponse | undefined> => {
        // Send region_id as expected by backend DTO
        const response = await apiClient.post<PredictionResponse>('/ai/predict', { region_id: regionId });
        return response.data;
    }
};

export default aiService;
