import apiClient from './apiClient';
import type { PaginatedResponse } from './apiClient';
import { API_ENDPOINTS } from '../constants';

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  region: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AidItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Raw API response from backend
export interface RawNeed {
  id: number;
  location_id: number;
  location: Location;
  item_id: number;
  item: AidItem;
  needed_quantity: number;
  supplied_quantity: number;
  priority?: string;
  updated_at: string;
}

// Frontend format
export interface Need {
  id: string;
  locationId: string;
  location: Location;
  aidItemId: string;
  aidItem: AidItem;
  quantityNeeded: number;
  quantityFulfilled: number;
  urgencyLevel: 'critical' | 'high' | 'medium' | 'low' | null;
  status: 'active' | 'fulfilled' | 'cancelled';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Adapter function
const adaptNeed = (raw: RawNeed): Need => ({
  id: raw.id.toString(),
  locationId: raw.location_id.toString(),
  location: raw.location,
  aidItemId: raw.item_id.toString(),
  aidItem: {
    id: raw.item.id.toString(),
    name: raw.item.name,
    category: raw.item.category,
    unit: raw.item.unit || 'adet',
    description: raw.item.description,
    isActive: true,
    createdAt: '',
    updatedAt: ''
  },
  quantityNeeded: raw.needed_quantity,
  quantityFulfilled: raw.supplied_quantity,
  urgencyLevel: (raw.priority as 'critical' | 'high' | 'medium' | 'low' | null) || null,
  status: raw.supplied_quantity >= raw.needed_quantity ? 'fulfilled' : 'active',
  createdAt: raw.updated_at,
  updatedAt: raw.updated_at
});

export interface NeedsFilters {
  locationId?: string;
  aidItemId?: string;
  urgencyLevel?: string;
  status?: string;
  search?: string;
}

export interface NeedsParams extends NeedsFilters {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'quantityNeeded' | 'urgencyLevel';
  sortOrder?: 'asc' | 'desc';
}

class NeedsService {
  /**
   * Get all needs with optional filtering and pagination
   */
  async getNeeds(params?: NeedsParams): Promise<PaginatedResponse<Need>> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = queryParams.toString()
      ? `${API_ENDPOINTS.PUBLIC.NEEDS}?${queryParams.toString()}`
      : API_ENDPOINTS.PUBLIC.NEEDS;

    const response = await apiClient.get<PaginatedResponse<RawNeed>>(url);

    // Backend returns PaginatedResponse directly: { success: true, data: [...], pagination: {...} }
    // apiClient.get returns response.data from axios, which is the PaginatedResponse itself
    // So at runtime, response IS the PaginatedResponse, not wrapped in ApiResponse
    const paginatedData = response as unknown as PaginatedResponse<RawNeed>;

    if (!paginatedData.success) {
      throw new Error('Failed to fetch needs');
    }

    if (!paginatedData.data) {
      console.error('Empty response data:', paginatedData);
      throw new Error('No data received from server');
    }
    
    // Ensure data is an array
    if (!Array.isArray(paginatedData.data)) {
      console.error('Invalid response structure - data is not an array:', {
        response,
        paginatedData,
        dataType: typeof paginatedData.data,
        isArray: Array.isArray(paginatedData.data)
      });
      throw new Error(`Invalid response format: expected array but got ${typeof paginatedData.data}`);
    }
    
    // Adapt raw data to frontend format
    const adaptedData = paginatedData.data.map(adaptNeed);
    return {
      success: true,
      data: adaptedData,
      pagination: paginatedData.pagination || {
        page: 1,
        limit: adaptedData.length,
        total: adaptedData.length,
        totalPages: 1
      }
    };
  }

  /**
   * Get needs by location
   */
  async getNeedsByLocation(locationId: string): Promise<Need[]> {
    const response = await apiClient.get<Need[]>(`${API_ENDPOINTS.NEEDS}/${locationId}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch needs for location');
  }

  /**
   * Create a new need (authenticated only)
   */
  async createNeed(data: {
    locationId: string;
    aidItemId: string;
    quantityNeeded: number;
    urgencyLevel: string;
    description?: string;
  }): Promise<Need> {
    const response = await apiClient.post<Need>(API_ENDPOINTS.NEEDS, data);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to create need');
  }

  /**
   * Update an existing need (authenticated only)
   */
  async updateNeed(
    id: string,
    data: {
      quantityNeeded?: number;
      quantityFulfilled?: number;
      urgencyLevel?: string;
      status?: string;
      description?: string;
    }
  ): Promise<Need> {
    const response = await apiClient.put<Need>(`${API_ENDPOINTS.NEEDS}/${id}`, data);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to update need');
  }

  /**
   * Delete a need (authenticated only)
   */
  async deleteNeed(id: string): Promise<void> {
    const response = await apiClient.delete(`${API_ENDPOINTS.NEEDS}/${id}`);

    if (!response.success) {
      throw new Error(response.error || 'Failed to delete need');
    }
  }

  /**
   * Get locations list
   */
  async getLocations(): Promise<Location[]> {
    const response = await apiClient.get<Location[]>(API_ENDPOINTS.PUBLIC.LOCATIONS);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch locations');
  }

  /**
   * Get aid items list
   */
  async getAidItems(): Promise<AidItem[]> {
    const response = await apiClient.get<AidItem[]>(API_ENDPOINTS.PUBLIC.AID_ITEMS);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch aid items');
  }

  /**
   * Get critical needs (high priority)
   */
  async getCriticalNeeds(limit: number = 10): Promise<Need[]> {
    const response = await apiClient.get<Need[]>(
      `${API_ENDPOINTS.NEEDS}?urgencyLevel=critical&status=active&limit=${limit}&sortBy=urgencyLevel&sortOrder=desc`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch critical needs');
  }

  /**
   * Get needs statistics
   */
  async getNeedsStats(): Promise<{
    totalNeeds: number;
    criticalNeeds: number;
    fulfilledNeeds: number;
    activeNeeds: number;
  }> {
    const response = await apiClient.get<{
      totalNeeds: number;
      criticalNeeds: number;
      fulfilledNeeds: number;
      activeNeeds: number;
    }>(`${API_ENDPOINTS.NEEDS}/stats`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch needs statistics');
  }
}

// Create singleton instance
const needsService = new NeedsService();

export default needsService;