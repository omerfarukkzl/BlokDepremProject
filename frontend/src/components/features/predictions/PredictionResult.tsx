import React from 'react';
import { usePredictionStore, useActiveQuantities } from '../../../stores/predictionStore';
import ConfidenceIndicator from './ConfidenceIndicator';
import QuantityAdjuster from './QuantityAdjuster';

const PredictionResult: React.FC = () => {
    const { prediction, isLoading, error, adjustedQuantities, setAdjustedQuantity, resetToOriginal } = usePredictionStore();
    const activeQuantities = useActiveQuantities();

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

    const hasAdjustments = adjustedQuantities !== null;

    return (
        <div className="mt-6 bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Predicted Aid Requirements</h3>

            {/* Confidence Score Display with Visual Indicator */}
            <div className="mb-6">
                <ConfidenceIndicator confidence={prediction.confidence} size="md" />
            </div>

            {/* Editable Quantity Grid */}
            <div className="grid grid-cols-2 gap-4">
                {Object.entries(prediction.predictions).map(([key, originalValue]) => (
                    <QuantityAdjuster
                        key={key}
                        aidType={key}
                        originalValue={originalValue}
                        adjustedValue={adjustedQuantities?.[key]}
                        onChange={(value) => setAdjustedQuantity(key, value)}
                    />
                ))}
            </div>

            {/* Reset to Original Button */}
            {hasAdjustments && (
                <button
                    onClick={resetToOriginal}
                    className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 underline"
                >
                    Reset to Original Predictions
                </button>
            )}

            {/* Create Shipment Button (Story 4.1 Prep) */}
            {activeQuantities && (
                <button
                    disabled
                    className="mt-6 w-full py-2 px-4 rounded-md text-white bg-gray-400 cursor-not-allowed"
                    title="Coming in Story 4.1"
                >
                    Create Shipment (Coming Soon)
                </button>
            )}
        </div>
    );
};

export default PredictionResult;
