// User and Authentication Types
export interface User {
  id: string;
  walletAddress: string;
  name: string;
  email?: string;
  role: UserRole;
  locationId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'official' | 'donor';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Location Types
export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  region: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Aid Item Types
export interface AidItem {
  id: string;
  name: string;
  description?: string;
  category: AidCategory;
  unit: string;
  isActive: boolean;
}

export type AidCategory = 'food' | 'water' | 'medical' | 'shelter' | 'clothing' | 'other';

// Needs Types
export interface Need {
  id: string;
  locationId: string;
  aidItemId: string;
  quantityNeeded: number;
  quantityFulfilled: number;
  urgencyLevel: UrgencyLevel;
  status: 'active' | 'fulfilled' | 'cancelled';
  description?: string;
  createdAt: string;
  updatedAt: string;
  aidItem?: AidItem;
  location?: Location;
}

export type UrgencyLevel = 'critical' | 'high' | 'medium' | 'low';

// Shipment Types
export interface Shipment {
  id: string;
  barcode: string;
  originLocationId: string;
  destinationLocationId: string;
  status: ShipmentStatus;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  originLocation?: Location;
  destinationLocation?: Location;
  details: ShipmentDetail[];
  trackingLogs: TrackingLog[];
}

export interface ShipmentDetail {
  id: string;
  shipmentId: string;
  aidItemId: string;
  quantity: number;
  aidItem?: AidItem;
}

export type ShipmentStatus = 'registered' | 'in_transit' | 'delivered' | 'cancelled';

export interface TrackingLog {
  id: string;
  shipmentId: string;
  status: ShipmentStatus;
  locationId: string;
  timestamp: string;
  notes?: string;
  location?: Location;
  transactionHash?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types
export interface LoginFormData {
  walletAddress: string;
  signature: string;
}

export interface RegisterFormData {
  walletAddress: string;
  name: string;
  email?: string;
  locationId?: string;
  signature: string;
}

export interface ShipmentFormData {
  originLocationId: string;
  destinationLocationId: string;
  description?: string;
  items: {
    aidItemId: string;
    quantity: number;
  }[];
}

export interface NeedFormData {
  locationId: string;
  aidItemId: string;
  quantityNeeded: number;
  urgency: UrgencyLevel;
  description?: string;
}

// UI State Types
export interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  isVisible: boolean;
}

export interface UIState {
  theme: 'light' | 'dark';
  language: 'tr' | 'en';
  sidebarOpen: boolean;
  notifications: NotificationState[];
}

// Filter and Search Types
export interface NeedsFilter {
  locationId?: string;
  aidCategoryId?: string;
  urgency?: UrgencyLevel;
  search?: string;
}

export interface ShipmentFilter {
  status?: ShipmentStatus;
  originLocationId?: string;
  destinationLocationId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// Chart and Analytics Types
export interface DashboardStats {
  totalShipments: number;
  activeShipments: number;
  deliveredShipments: number;
  totalLocations: number;
  activeOfficials: number;
  totalNeeds: number;
  fulfilledNeeds: number;
  criticalNeeds: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
  }[];
}