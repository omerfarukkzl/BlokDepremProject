import React from 'react';
import { usePredictionStore } from '../../../stores/predictionStore';

const PredictionResult: React.FC = () => {
    const { prediction, isLoading, error } = usePredictionStore();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8 bg-white shadow rounded-lg">
                <div className="text-indigo-600 font-semibold">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
            </div>
        );
    }

    if (!prediction) {
        return null;
    }

    return (
        <div className="mt-6 bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Predicted Aid Requirements</h3>

            <div className="mb-4 flex items-center">
                <span className="text-sm text-gray-500 mr-2">Confidence Score:</span>
                <span className={`text-sm font-bold ${prediction.confidence > 0.8 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {(prediction.confidence * 100).toFixed(0)}%
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {Object.entries(prediction.predictions).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-4 rounded-md">
                        <dt className="text-sm font-medium text-gray-500 capitalize">{key}</dt>
                        <dd className="mt-1 text-2xl font-semibold text-gray-900">{value}</dd>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PredictionResult;
