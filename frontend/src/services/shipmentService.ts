import apiClient from './apiClient';

export interface ShipmentResponse {
    id: number;
    barcode: string;
    source_location_id: number;
    destination_location_id: number;
    created_by_official_id: number;
    status: string;
    prediction_id: number | null;
    created_at: string;
    updated_at: string;
}

export interface CreateShipmentFromPredictionRequest {
    prediction_id: number;
    source_location_id: number;
    destination_location_id: number;
    adjusted_quantities?: Record<string, number>;
}

class ShipmentService {
    async createFromPrediction(data: CreateShipmentFromPredictionRequest): Promise<ShipmentResponse> {
        const response = await apiClient.post<ShipmentResponse>('/shipments/from-prediction', data);
        if (response.success && response.data) {
            return response.data;
        }
        throw new Error(response.error || 'Failed to create shipment');
    }

    async getShipmentById(id: number): Promise<ShipmentResponse> {
        const response = await apiClient.get<ShipmentResponse>(`/shipments/${id}`);
        if (response.success && response.data) {
            return response.data;
        }
        throw new Error(response.error || 'Failed to get shipment');
    }

    async getRecentShipments(): Promise<ShipmentResponse[]> {
        const response = await apiClient.get<ShipmentResponse[]>('/shipments/recent');
        if (response.success && response.data) {
            return response.data;
        }
        throw new Error(response.error || 'Failed to get shipments');
    }

    async updateStatus(barcode: string, status: string): Promise<ShipmentResponse> {
        const response = await apiClient.put<ShipmentResponse>('/shipments/update-status', { barcode, status });
        if (response.success && response.data) {
            return response.data;
        }
        throw new Error(response.error || 'Failed to update status');
    }
}

const shipmentService = new ShipmentService();
export default shipmentService;
