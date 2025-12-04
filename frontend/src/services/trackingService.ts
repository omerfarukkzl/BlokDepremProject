import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants';

export interface TrackingEvent {
  id: string;
  shipmentId: string;
  status: 'registered' | 'in_transit' | 'delivered' | 'cancelled';
  location?: string;
  timestamp: string;
  notes?: string;
  recordedBy: string;
  isOnBlockchain: boolean;
  blockchainTxHash?: string;
}

export interface ShipmentItem {
  id: string;
  shipmentId: string;
  aidItemId: string;
  aidItem: {
    id: string;
    name: string;
    category: string;
    unit: string;
  };
  quantity: number;
}

export interface Shipment {
  id: string;
  barcode: string;
  originLocationId: string;
  originLocation: {
    id: string;
    name: string;
    address: string;
    city: string;
    region: string;
  };
  destinationLocationId: string;
  destinationLocation: {
    id: string;
    name: string;
    address: string;
    city: string;
    region: string;
  };
  status: 'registered' | 'in_transit' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  notes?: string;
  createdById: string;
  createdBy: {
    id: string;
    name: string;
    walletAddress: string;
  };
  createdAt: string;
  updatedAt: string;
  trackingEvents: TrackingEvent[];
  items: ShipmentItem[];
}

export interface TrackingHistory {
  shipment: Shipment;
  events: TrackingEvent[];
  blockchainTransactions: Array<{
    txHash: string;
    timestamp: string;
    blockNumber: number;
    status: string;
  }>;
}

class TrackingService {
  /**
   * Track shipment by barcode
   */
  async trackShipment(barcode: string): Promise<Shipment> {
    const response = await apiClient.get<Shipment>(API_ENDPOINTS.PUBLIC.TRACK(barcode));

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Shipment not found');
  }

  /**
   * Get complete tracking history for a shipment
   */
  async getTrackingHistory(barcode: string): Promise<TrackingHistory> {
    const response = await apiClient.get<TrackingHistory>(`${API_ENDPOINTS.PUBLIC.TRACK(barcode)}/history`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Tracking history not found');
  }

  /**
   * Validate barcode format
   */
  validateBarcode(barcode: string): { isValid: boolean; error?: string } {
    if (!barcode) {
      return { isValid: false, error: 'Barcode is required' };
    }

    if (barcode.length < 8 || barcode.length > 50) {
      return { isValid: false, error: 'Barcode must be between 8 and 50 characters' };
    }

    // Allow alphanumeric characters and some special characters
    if (!/^[A-Za-z0-9\-_]+$/.test(barcode)) {
      return { isValid: false, error: 'Barcode contains invalid characters' };
    }

    return { isValid: true };
  }

  /**
   * Generate tracking URL for sharing
   */
  generateTrackingUrl(barcode: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/track/${encodeURIComponent(barcode)}`;
  }

  /**
   * Get shipment status display information
   */
  getShipmentStatusInfo(status: string) {
    const statusMap = {
      registered: {
        label: 'Registered',
        color: 'blue',
        description: 'Shipment has been registered in the system',
        icon: 'document-text',
      },
      in_transit: {
        label: 'In Transit',
        color: 'yellow',
        description: 'Shipment is currently being transported',
        icon: 'truck',
      },
      delivered: {
        label: 'Delivered',
        color: 'green',
        description: 'Shipment has been successfully delivered',
        icon: 'check-circle',
      },
      cancelled: {
        label: 'Cancelled',
        color: 'red',
        description: 'Shipment has been cancelled',
        icon: 'x-circle',
      },
    };

    return statusMap[status as keyof typeof statusMap] || {
      label: status,
      color: 'gray',
      description: 'Unknown status',
      icon: 'question-mark-circle',
    };
  }

  /**
   * Get priority display information
   */
  getPriorityInfo(priority: string) {
    const priorityMap = {
      low: {
        label: 'Low',
        color: 'gray',
        description: 'Low priority shipment',
      },
      medium: {
        label: 'Medium',
        color: 'blue',
        description: 'Medium priority shipment',
      },
      high: {
        label: 'High',
        color: 'orange',
        description: 'High priority shipment',
      },
      critical: {
        label: 'Critical',
        color: 'red',
        description: 'Critical priority shipment',
      },
    };

    return priorityMap[priority as keyof typeof priorityMap] || {
      label: priority,
      color: 'gray',
      description: 'Unknown priority',
    };
  }

  /**
   * Format tracking timeline for display
   */
  formatTrackingTimeline(events: TrackingEvent[]): Array<{
    id: string;
    status: string;
    location?: string;
    timestamp: string;
    notes?: string;
    isBlockchain: boolean;
    txHash?: string;
  }> {
    return events
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .map(event => ({
        id: event.id,
        status: event.status,
        location: event.location,
        timestamp: event.timestamp,
        notes: event.notes,
        isBlockchain: event.isOnBlockchain,
        txHash: event.blockchainTxHash,
      }));
  }

  /**
   * Calculate estimated delivery time based on distance and priority
   */
  calculateEstimatedDelivery(
    originCity: string,
    destinationCity: string,
    priority: string
  ): Date | null {
    // Simple estimation logic - in real app, this would use Google Maps API or similar
    const baseHours = 24; // Base delivery time
    const priorityMultiplier = {
      low: 2,
      medium: 1.5,
      high: 1,
      critical: 0.5,
    };

    const multiplier = priorityMultiplier[priority as keyof typeof priorityMultiplier] || 1;
    const estimatedHours = baseHours * multiplier;

    const deliveryDate = new Date();
    deliveryDate.setHours(deliveryDate.getHours() + estimatedHours);

    return deliveryDate;
  }

  /**
   * Check if shipment is delayed
   */
  isShipmentDelayed(shipment: Shipment): boolean {
    if (shipment.status === 'delivered' || shipment.status === 'cancelled') {
      return false;
    }

    if (!shipment.estimatedDeliveryDate) {
      return false;
    }

    return new Date() > new Date(shipment.estimatedDeliveryDate);
  }

  /**
   * Get shipment progress percentage
   */
  getShipmentProgress(shipment: Shipment): number {
    const progressMap = {
      registered: 10,
      in_transit: 50,
      delivered: 100,
      cancelled: 0,
    };

    return progressMap[shipment.status] || 0;
  }
}

// Create singleton instance
const trackingService = new TrackingService();

export default trackingService;