// API Constants
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    VERIFY: '/auth/verify',
  },

  // Public endpoints
  PUBLIC: {
    NEEDS: '/needs',
    TRACK: (barcode: string) => `/track/${barcode}`,
    LOCATIONS: '/locations',
    AID_ITEMS: '/aid-items',
  },

  // Protected endpoints
  NEEDS: '/needs',
  SHIPMENTS: '/shipments',
  LOCATIONS: '/locations',
  OFFICIALS: '/officials',
  AI: {
    DISTRIBUTION_SUGGESTIONS: '/ai/distribution-suggestions',
    PREDICT: '/ai/predict',
  },
} as const;

// Storage Constants
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth-token',
  USER_PREFERENCES: 'user-preferences',
  LANGUAGE: 'language',
  THEME: 'theme',
} as const;

// Routes Constants
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  NEEDS: '/needs',
  TRACK: '/track',

  // Official routes
  OFFICIAL: {
    DASHBOARD: '/official/dashboard',
    SHIPMENTS: '/official/shipments',
    NEEDS: '/official/needs',
    PROFILE: '/official/profile',
    PREDICTIONS: '/official/predictions',
  },

  // Admin routes
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    LOCATIONS: '/admin/locations',
    SHIPMENTS: '/admin/shipments',
    ANALYTICS: '/admin/analytics',
    SETTINGS: '/admin/settings',
  },
} as const;

// Status Constants
export const SHIPMENT_STATUS = {
  REGISTERED: 'registered',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const URGENCY_LEVEL = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  OFFICIAL: 'official',
  DONOR: 'donor',
} as const;

export const AID_CATEGORIES = {
  FOOD: 'food',
  WATER: 'water',
  MEDICAL: 'medical',
  SHELTER: 'shelter',
  CLOTHING: 'clothing',
  OTHER: 'other',
} as const;

// Validation Constants
export const VALIDATION = {
  WALLET_ADDRESS: {
    MIN_LENGTH: 42,
    MAX_LENGTH: 42,
    PATTERN: /^0x[a-fA-F0-9]{40}$/,
  },
  BARCODE: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 50,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
  },
} as const;

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// Theme Constants
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

// Language Constants
export const LANGUAGES = {
  TURKISH: 'tr',
  ENGLISH: 'en',
} as const;

// Notification Constants
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

export const NOTIFICATION_DURATIONS = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 10000,
  PERSISTENT: 0,
} as const;

// Blockchain Constants
export const BLOCKCHAIN = {
  NETWORKS: {
    MAINNET: 1,
    SEPOLIA: 11155111,
    LOCALHOST: 31337,
  },
  GAS_LIMITS: {
    SIMPLE: 21000,
    COMPLEX: 100000,
  },
} as const;

// Format Constants
export const FORMATS = {
  DATE: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  TIME: 'HH:mm:ss',
  CURRENCY: 'TRY',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  INVALID_CREDENTIALS: 'Invalid credentials provided.',
  WALLET_NOT_CONNECTED: 'Please connect your wallet first.',
  INVALID_BARCODE: 'Invalid barcode format.',
  SHIPMENT_NOT_FOUND: 'Shipment not found.',
  GENERIC_ERROR: 'An error occurred. Please try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logged out successfully!',
  SHIPMENT_CREATED: 'Shipment created successfully!',
  SHIPMENT_UPDATED: 'Shipment updated successfully!',
  NEED_CREATED: 'Need created successfully!',
  NEED_UPDATED: 'Need updated successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
} as const;