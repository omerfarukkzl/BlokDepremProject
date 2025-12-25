import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePredictionStore, useActiveQuantities } from '../../../stores/predictionStore';
import ConfidenceIndicator from './ConfidenceIndicator';
import QuantityAdjuster from './QuantityAdjuster';
import shipmentService from '../../../services/shipmentService';
import locationService from '../../../services/locationService';
import type { Location } from '../../../services/locationService';

const PredictionResult: React.FC = () => {
    const { prediction, isLoading, error, adjustedQuantities, setAdjustedQuantity, resetToOriginal } = usePredictionStore();
    const activeQuantities = useActiveQuantities();
    const navigate = useNavigate();

    const [isCreatingShipment, setIsCreatingShipment] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [locations, setLocations] = useState<Location[]>([]);
    const [sourceLocationId, setSourceLocationId] = useState<number | null>(null);
    const [shipmentError, setShipmentError] = useState<string | null>(null);
    const [shipmentSuccess, setShipmentSuccess] = useState<string | null>(null);

    useEffect(() => {
        // Load locations when modal opens
        if (showModal) {
            locationService.fetchRegions().then(setLocations).catch(console.error);
        }
    }, [showModal]);

    const handleCreateShipment = async () => {
        if (!prediction || !sourceLocationId) return;

        setIsCreatingShipment(true);
        setShipmentError(null);

        try {
            // Destination is the prediction region (need to find location by name or use a mapping)
            // For now, use the region_id as destination (assuming it maps to a location)
            const destinationLocation = locations.find(l => l.name.toLowerCase().includes(prediction.region_id.toLowerCase()));
            const destinationLocationId = destinationLocation?.id || sourceLocationId;

            const shipment = await shipmentService.createFromPrediction({
                prediction_id: prediction.predictionId,
                source_location_id: sourceLocationId,
                destination_location_id: destinationLocationId,
                adjusted_quantities: adjustedQuantities || undefined,
            });

            setShipmentSuccess(`Shipment created successfully! Barcode: ${shipment.barcode}`);
            setShowModal(false);

            // Reset after success and redirect
            setTimeout(() => {
                setShipmentSuccess(null);
                navigate(`/track/${shipment.barcode}`);
            }, 2000);
        } catch (err: any) {
            setShipmentError(err.message || 'Failed to create shipment');
        } finally {
            setIsCreatingShipment(false);
        }
    };

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
    const alreadyShipped = false; // TODO: Check if prediction already has a shipment

    return (
        <div className="mt-6 bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Predicted Aid Requirements</h3>

            {/* Success Message */}
            {shipmentSuccess && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                    {shipmentSuccess}
                </div>
            )}

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

            {/* Create Shipment Button */}
            {activeQuantities && !alreadyShipped && (
                <button
                    onClick={() => setShowModal(true)}
                    disabled={isCreatingShipment}
                    className="mt-6 w-full py-2 px-4 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
                >
                    {isCreatingShipment ? 'Creating...' : 'Create Shipment'}
                </button>
            )}

            {/* Modal for Source Location Selection */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Create Shipment</h4>

                        {shipmentError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                                {shipmentError}
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Source Location (Warehouse)
                            </label>
                            <select
                                value={sourceLocationId || ''}
                                onChange={(e) => setSourceLocationId(parseInt(e.target.value) || null)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">Select a location</option>
                                {locations.map((loc) => (
                                    <option key={loc.id} value={loc.id}>
                                        {loc.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Destination Region
                            </label>
                            <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-700">
                                {prediction.region_id}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setShipmentError(null);
                                }}
                                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateShipment}
                                disabled={!sourceLocationId || isCreatingShipment}
                                className="flex-1 py-2 px-4 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
                            >
                                {isCreatingShipment ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PredictionResult;

