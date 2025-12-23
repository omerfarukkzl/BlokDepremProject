import apiClient from './apiClient';

export interface PredictionResponse {
    predictions: Record<string, number>;
    confidence: number;
    prediction_hash: string;
    region_id: string;
}

const aiService = {
    getPrediction: async (regionId: string): Promise<PredictionResponse | undefined> => {
        const response = await apiClient.post<PredictionResponse>('/ai/predict', { regionId });
        return response.data;
    }
};

export default aiService;
