import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import type { PredictedVsActual } from '../../../types/reports';

interface AccuracyChartProps {
    data: PredictedVsActual[];
}

/**
 * Grouped bar chart showing Predicted vs Actual quantities by Aid Category.
 * Uses Recharts BarChart with grouped bars for visual comparison.
 */
const AccuracyChart: React.FC<AccuracyChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                <p>No data available for chart</p>
            </div>
        );
    }

    // Custom tooltip to show exact numbers and percentage difference
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length >= 2) {
            const predicted = payload[0]?.value || 0;
            const actual = payload[1]?.value || 0;
            const diff = predicted > 0
                ? ((actual - predicted) / predicted * 100).toFixed(1)
                : '0';
            const diffColor = Number(diff) >= 0 ? 'text-green-600' : 'text-red-600';

            return (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
                    <p className="text-blue-600 dark:text-blue-400">
                        Predicted: {predicted.toLocaleString()}
                    </p>
                    <p className="text-emerald-600 dark:text-emerald-400">
                        Actual: {actual.toLocaleString()}
                    </p>
                    <p className={`text-sm mt-1 ${diffColor}`}>
                        Difference: {diff}%
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                    dataKey="category"
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    axisLine={{ stroke: '#D1D5DB' }}
                />
                <YAxis
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    axisLine={{ stroke: '#D1D5DB' }}
                    tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    wrapperStyle={{ paddingTop: '10px' }}
                    iconType="rect"
                />
                <Bar
                    dataKey="predicted"
                    name="Predicted"
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                />
                <Bar
                    dataKey="actual"
                    name="Actual"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default AccuracyChart;
