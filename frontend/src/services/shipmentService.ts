import apiClient from './apiClient';

export interface PredictionData {
    id: number;
    region_id: string;
    predicted_quantities: Record<string, number>;
    actual_quantities: Record<string, number> | null;
    accuracy: number | null;
    confidence: number;
}

export interface ShipmentResponse {
    id: number;
    barcode: string;
    source_location_id: number;
    destination_location_id: number;
    created_by_official_id: number;
    status: string;
    prediction_id: number | null;
    prediction?: PredictionData | null;
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
        const response = await apiClient.post<any>('/shipments/from-prediction', data) as any;

        // Handle wrapped response (standard)
        if (response.success && response.data) {
            return response.data;
        }

        // Handle direct response (unwrapped entity return)
        if (response.id && response.barcode) {
            return response as any as ShipmentResponse;
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

    async getShipmentItems(id: number): Promise<any[]> {
        const response = await apiClient.get<any[]>(`/shipments/${id}/items`);
        if (response.success && response.data) {
            return response.data;
        }
        throw new Error(response.error || 'Failed to get shipment items');
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

    async confirmDelivery(shipmentId: number, actualQuantities: Record<string, number>): Promise<ShipmentResponse> {
        const response = await apiClient.post<ShipmentResponse>(`/shipments/${shipmentId}/delivery`, {
            actual_quantities: actualQuantities,
        });
        if (response.success && response.data) {
            return response.data;
        }
        throw new Error(response.error || 'Failed to confirm delivery');
    }
}

const shipmentService = new ShipmentService();
export default shipmentService;
