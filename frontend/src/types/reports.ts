// Report type definitions for Admin Dashboard

export interface PredictedVsActual {
    category: string;
    predicted: number;
    actual: number;
}

export interface ReportFilters {
    startDate?: string;
    endDate?: string;
    regionId?: string;
    category?: 'tent' | 'container' | 'food_package' | 'blanket';
}

export const AID_CATEGORY_OPTIONS = [
    { value: 'tent', label: 'Tent' },
    { value: 'container', label: 'Container' },
    { value: 'food_package', label: 'Food Package' },
    { value: 'blanket', label: 'Blanket' },
] as const;

export interface DashboardStats {
    totalPredictions: number;
    completedPredictions: number;
    averageAccuracy: number;
    accuracyByCategory: Record<string, number>;
    predictedVsActual: PredictedVsActual[];
    recentPredictions: Array<{
        id: string;
        regionName: string;
        accuracy: number;
        createdAt: string;
    }>;
}

// Mock data for placeholder chart (kept for fallback/testing)
export const MOCK_DASHBOARD_STATS: DashboardStats = {
    totalPredictions: 42,
    completedPredictions: 35,
    averageAccuracy: 87.5,
    accuracyByCategory: {
        tent: 92.5,
        container: 88.0,
        food_package: 85.5,
        blanket: 90.2,
    },
    predictedVsActual: [
        { category: 'Tent', predicted: 1500, actual: 1400 },
        { category: 'Container', predicted: 500, actual: 480 },
        { category: 'Food Package', predicted: 10000, actual: 9500 },
        { category: 'Blanket', predicted: 5000, actual: 4800 },
    ],
    recentPredictions: [
        { id: '1', regionName: 'Istanbul', accuracy: 92, createdAt: '2025-12-28' },
        { id: '2', regionName: 'Ankara', accuracy: 85, createdAt: '2025-12-27' },
        { id: '3', regionName: 'Izmir', accuracy: 88, createdAt: '2025-12-26' },
    ],
};
