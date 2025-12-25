import apiClient from './apiClient';

export interface PredictionResponse {
    predictions: Record<string, number>;
    confidence: number;
    prediction_hash: string;
    region_id: string;
    predictionId: number;
}

const aiService = {
    getPrediction: async (regionId: string): Promise<PredictionResponse | undefined> => {
        // Send region_id as expected by backend DTO
        // Cast as any to access custom root properties like predictionId
        const response = await apiClient.post<any>('/ai/predict', { region_id: regionId }) as any;

        if (response.data) {
            return {
                ...response.data,
                predictionId: response.predictionId
            };
        }
        return undefined;
    }
};

export default aiService;

