import apiClient from './apiClient';

export interface Location {
    id: number;
    name: string;
    latitude?: number;
    longitude?: number;
}

const locationService = {
    fetchRegions: async (): Promise<Location[]> => {
        const response = await apiClient.get<Location[]>('/locations');
        return response.data || [];
    }
};

export default locationService;
