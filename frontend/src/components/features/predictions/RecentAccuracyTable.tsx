import React from 'react';

interface RecentPrediction {
    id: string;
    regionName: string;
    accuracy: number;
    createdAt: string;
}

interface RecentAccuracyTableProps {
    predictions: RecentPrediction[];
}

/**
 * Table component displaying recent completed predictions with their accuracy scores.
 * Shows Region, Date, Accuracy %, and a View Link for each prediction.
 */
const RecentAccuracyTable: React.FC<RecentAccuracyTableProps> = ({ predictions }) => {
    if (!predictions || predictions.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No recent predictions available</p>
            </div>
        );
    }



    // Get badge class based on accuracy
    const getAccuracyBadge = (accuracy: number): string => {
        if (accuracy >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        if (accuracy >= 75) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                            Region
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                            Date
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                            Accuracy
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                            Action
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {predictions.map((prediction) => (
                        <tr
                            key={prediction.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {prediction.regionName}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {prediction.createdAt}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAccuracyBadge(prediction.accuracy ?? 0)}`}>
                                    {prediction.accuracy != null ? prediction.accuracy.toFixed(1) : '—'}%
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                                    onClick={() => {
                                        // Future: Navigate to prediction detail view
                                    }}
                                >
                                    View
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RecentAccuracyTable;
