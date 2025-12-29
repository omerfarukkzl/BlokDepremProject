import React from 'react';
import type { ReportFilters } from '../../../types/reports';
import { AID_CATEGORY_OPTIONS } from '../../../types/reports';

interface ReportsFilterBarProps {
    filters: ReportFilters;
    onFiltersChange: (filters: ReportFilters) => void;
    onClearFilters: () => void;
}

// Hardcoded region options for prototype (in production, fetch from API)
const REGION_OPTIONS = [
    { value: 'istanbul', label: 'Istanbul' },
    { value: 'ankara', label: 'Ankara' },
    { value: 'izmir', label: 'Izmir' },
    { value: 'hatay', label: 'Hatay' },
    { value: 'kahramanmaras', label: 'Kahramanmaras' },
    { value: 'gaziantep', label: 'Gaziantep' },
    { value: 'adana', label: 'Adana' },
    { value: 'malatya', label: 'Malatya' },
] as const;

const ReportsFilterBar: React.FC<ReportsFilterBarProps> = ({
    filters,
    onFiltersChange,
    onClearFilters,
}) => {
    const handleFilterChange = (key: keyof ReportFilters, value: string) => {
        onFiltersChange({
            ...filters,
            [key]: value || undefined, // Convert empty strings to undefined
        });
    };

    const hasActiveFilters = Boolean(
        filters.startDate || filters.endDate || filters.regionId || filters.category
    );

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
            <div className="flex flex-wrap items-end gap-4">
                {/* Date Range */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Start Date
                    </label>
                    <input
                        type="date"
                        value={filters.startDate || ''}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        End Date
                    </label>
                    <input
                        type="date"
                        value={filters.endDate || ''}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>

                {/* Region Select */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Region
                    </label>
                    <select
                        value={filters.regionId || ''}
                        onChange={(e) => handleFilterChange('regionId', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="">All Regions</option>
                        {REGION_OPTIONS.map((region) => (
                            <option key={region.value} value={region.value}>
                                {region.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Category Select */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Aid Category
                    </label>
                    <select
                        value={filters.category || ''}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="">All Categories</option>
                        {AID_CATEGORY_OPTIONS.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                                {cat.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                    <button
                        onClick={onClearFilters}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Clear Filters
                    </button>
                )}
            </div>
        </div>
    );
};

export default ReportsFilterBar;
