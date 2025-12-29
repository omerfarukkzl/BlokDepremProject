import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { LoadingSpinner } from '../../components/ui';
import type { DashboardStats, ReportFilters } from '../../types/reports';
import aiService from '../../services/aiService';
import AccuracyChart from '../../components/features/predictions/AccuracyChart';
import RecentAccuracyTable from '../../components/features/predictions/RecentAccuracyTable';
import ReportsFilterBar from '../../components/features/predictions/ReportsFilterBar';

const AdminReportsPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Extract filters from URL (single source of truth - AC 3)
    const filters: ReportFilters = useMemo(() => ({
        startDate: searchParams.get('from') || undefined,
        endDate: searchParams.get('to') || undefined,
        regionId: searchParams.get('region') || undefined,
        category: (searchParams.get('category') as ReportFilters['category']) || undefined,
    }), [searchParams]);

    // Update URL when filters change
    const handleFiltersChange = (newFilters: ReportFilters) => {
        const params = new URLSearchParams();
        if (newFilters.startDate) params.set('from', newFilters.startDate);
        if (newFilters.endDate) params.set('to', newFilters.endDate);
        if (newFilters.regionId) params.set('region', newFilters.regionId);
        if (newFilters.category) params.set('category', newFilters.category);
        setSearchParams(params);
    };

    // Clear all filters (AC 2)
    const handleClearFilters = () => {
        setSearchParams({});
    };

    // Fetch data with current filters - refetches when URL params change
    const { data, isLoading, error, refetch } = useQuery<DashboardStats | undefined>({
        queryKey: ['dashboard-stats', filters.startDate, filters.endDate, filters.regionId, filters.category],
        queryFn: () => aiService.getReportsStats(filters),
    });

    if (isLoading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <LoadingSpinner size="xl" label="Loading dashboard data" showLabel />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">Unable to load dashboard data</p>
                <button
                    onClick={() => refetch()}
                    className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    // Check for empty data state (AC: 4)
    const hasCompletedPredictions = (data?.completedPredictions ?? 0) > 0;

    // Check if any filters are active - for contextual messaging
    const hasActiveFilters = Boolean(filters.startDate || filters.endDate || filters.regionId || filters.category);

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Admin Dashboard
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    View prediction accuracy analytics and reports
                </p>
            </div>

            {/* Filter Bar (Task 4 & 5) */}
            <ReportsFilterBar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
            />

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Predictions Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Total Predictions
                    </h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                        {data?.totalPredictions ?? 0}
                    </p>
                </div>

                {/* Completed Predictions Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Completed Predictions
                        {hasActiveFilters && <span className="text-xs text-primary-500 ml-2">(filtered)</span>}
                    </h3>
                    <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                        {data?.completedPredictions ?? 0}
                    </p>
                </div>

                {/* Average Accuracy Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Overall Accuracy
                        {hasActiveFilters && <span className="text-xs text-primary-500 ml-2">(filtered)</span>}
                    </h3>
                    <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {hasCompletedPredictions
                            ? `${data?.averageAccuracy?.toFixed(1) ?? 0}%`
                            : '—'
                        }
                    </p>
                </div>
            </div>

            {/* No matching records message (AC: 4) */}
            {!hasCompletedPredictions && hasActiveFilters && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
                    <div className="flex items-center">
                        <svg
                            className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <div>
                            <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200">
                                No Matching Records Found
                            </h3>
                            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                                Try adjusting your filters or{' '}
                                <button
                                    onClick={handleClearFilters}
                                    className="underline hover:text-blue-600 dark:hover:text-blue-200"
                                >
                                    clear all filters
                                </button>{' '}
                                to see all data.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Insufficient Data State (no filters, no data) */}
            {!hasCompletedPredictions && !hasActiveFilters && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-8">
                    <div className="flex items-center">
                        <svg
                            className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <div>
                            <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
                                Insufficient Data
                            </h3>
                            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                                No completed shipments with actual quantities recorded yet.
                                Accuracy metrics will appear once shipments are delivered and actual quantities are entered.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Predicted vs Actual Chart Section */}
            {hasCompletedPredictions && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Predicted vs Actual by Category
                        {filters.category && (
                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                                (Showing: {filters.category.replace('_', ' ')})
                            </span>
                        )}
                    </h2>
                    <AccuracyChart data={data?.predictedVsActual || []} />
                </div>
            )}

            {/* Recent Predictions Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Recent Completed Predictions
                </h2>
                {hasCompletedPredictions ? (
                    <RecentAccuracyTable predictions={data?.recentPredictions || []} />
                ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p>No completed predictions to display</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminReportsPage;
