import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import shipmentService from '../../../services/shipmentService';
import type { ShipmentResponse } from '../../../services/shipmentService';

interface ActualQuantities {
    [key: string]: number;
    tent: number;
    container: number;
    food_package: number;
    blanket: number;
}

// Accuracy display thresholds
const ACCURACY_HIGH = 90;
const ACCURACY_MEDIUM = 70;

// Helper function to calculate per-item accuracy on-the-fly
const calculateItemAccuracy = (predicted: number, actual: number): number => {
    if (predicted === 0) {
        return actual === 0 ? 100 : 0;
    }
    return Math.max(0, 100 - (Math.abs(actual - predicted) / predicted) * 100);
};

// Helper function to get accuracy color class
const getAccuracyColorClass = (accuracy: number): string => {
    if (accuracy >= ACCURACY_HIGH) return 'text-green-600 bg-green-100';
    if (accuracy >= ACCURACY_MEDIUM) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
};

const ShipmentDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [shipment, setShipment] = useState<ShipmentResponse | null>(null);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState<boolean>(false);

    // Delivery confirmation modal state
    const [showDeliveryModal, setShowDeliveryModal] = useState<boolean>(false);
    const [actualQuantities, setActualQuantities] = useState<ActualQuantities>({
        tent: 0,
        container: 0,
        food_package: 0,
        blanket: 0,
    });
    const [quantityError, setQuantityError] = useState<string | null>(null);

    useEffect(() => {
        const fetchShipment = async () => {
            if (!id) return;
            try {
                const [data, itemsData] = await Promise.all([
                    shipmentService.getShipmentById(Number(id)),
                    shipmentService.getShipmentItems(Number(id))
                ]);
                setShipment(data);
                setItems(itemsData);
            } catch (err: any) {
                setError(err.message || 'Failed to load shipment details');
            } finally {
                setLoading(false);
            }
        };

        fetchShipment();
    }, [id]);

    const handleStatusUpdate = async (newStatus: string) => {
        if (!shipment) return;
        setUpdating(true);
        setError(null);
        try {
            const updatedShipment = await shipmentService.updateStatus(shipment.barcode, newStatus);
            setShipment(updatedShipment);
        } catch (err: any) {
            setError(err.message || 'Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const handleQuantityChange = (field: keyof ActualQuantities, value: string) => {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 0) {
            setQuantityError('Quantities must be non-negative integers');
            return;
        }
        setQuantityError(null);
        setActualQuantities(prev => ({ ...prev, [field]: numValue }));
    };

    const handleConfirmDelivery = async () => {
        if (!shipment || !id) return;
        setUpdating(true);
        setError(null);
        setQuantityError(null);

        try {
            const updatedShipment = await shipmentService.confirmDelivery(Number(id), actualQuantities);
            setShipment(updatedShipment);
            setShowDeliveryModal(false);
        } catch (err: any) {
            setQuantityError(err.message || 'Failed to confirm delivery');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading shipment details...</div>;
    if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;
    if (!shipment) return <div className="p-8 text-center">Shipment not found</div>;

    // Status transition logic
    const canDepart = shipment.status === 'Created' || shipment.status === 'Registered';
    const canArrive = shipment.status === 'Departed';
    const canDeliver = shipment.status === 'Arrived';

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-blue-600 px-6 py-4">
                    <h1 className="text-2xl font-bold text-white">Shipment Details</h1>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <h2 className="text-gray-500 text-sm uppercase tracking-wider font-semibold">Barcode</h2>
                            <p className="text-xl font-mono font-medium text-gray-900 mt-1">{shipment.barcode}</p>
                        </div>
                        <div>
                            <h2 className="text-gray-500 text-sm uppercase tracking-wider font-semibold">Current Status</h2>
                            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-bold 
                                ${shipment.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                    shipment.status === 'Created' ? 'bg-gray-100 text-gray-800' :
                                        'bg-blue-100 text-blue-800'}`}>
                                {shipment.status}
                            </span>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipment Manifest</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {items.map((detail) => (
                                        <tr key={detail.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{detail.item?.name || 'Unknown Item'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{detail.quantity}</td>
                                        </tr>
                                    ))}
                                    {items.length === 0 && (
                                        <tr>
                                            <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">No items found in this shipment.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* AI Prediction Accuracy Section - shown when Delivered and has prediction */}
                    {shipment.status === 'Delivered' && shipment.prediction && shipment.prediction.accuracy !== null && (
                        <div className="border-t border-gray-200 pt-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Prediction Accuracy</h3>

                            {/* Overall Accuracy Badge */}
                            <div className="mb-4">
                                <span className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Overall Accuracy</span>
                                <div className="mt-2">
                                    <span className={`inline-block px-4 py-2 rounded-full text-lg font-bold ${getAccuracyColorClass(shipment.prediction.accuracy)}`}>
                                        {shipment.prediction.accuracy.toFixed(2)}%
                                    </span>
                                    <span className="ml-3 text-sm text-gray-500">
                                        {shipment.prediction.accuracy >= ACCURACY_HIGH ? '✓ High Accuracy' :
                                            shipment.prediction.accuracy >= ACCURACY_MEDIUM ? '⚠ Moderate Accuracy' :
                                                '⚠ Low Accuracy'}
                                    </span>
                                </div>
                            </div>

                            {/* Per-Item Accuracy Breakdown */}
                            {shipment.prediction.actual_quantities && (
                                <div>
                                    <span className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Per-Item Breakdown</span>
                                    <div className="mt-2 overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Predicted</th>
                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actual</th>
                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Accuracy</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {Object.entries(shipment.prediction.predicted_quantities).map(([key, predicted]) => {
                                                    const actual = shipment.prediction?.actual_quantities?.[key.toLowerCase()] ?? 0;
                                                    const itemAccuracy = calculateItemAccuracy(predicted, actual);
                                                    return (
                                                        <tr key={key}>
                                                            <td className="px-4 py-2 text-sm font-medium text-gray-900 capitalize">{key.replace('_', ' ')}</td>
                                                            <td className="px-4 py-2 text-sm text-gray-600">{predicted}</td>
                                                            <td className="px-4 py-2 text-sm text-gray-600">{actual}</td>
                                                            <td className="px-4 py-2">
                                                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getAccuracyColorClass(itemAccuracy)}`}>
                                                                    {itemAccuracy.toFixed(1)}%
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Status</h3>

                        <div className="flex flex-wrap gap-4">
                            {canDepart && (
                                <button
                                    onClick={() => handleStatusUpdate('Departed')}
                                    disabled={updating}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                                >
                                    {updating ? 'Updating...' : 'Mark as Departed'}
                                </button>
                            )}

                            {canArrive && (
                                <button
                                    onClick={() => handleStatusUpdate('Arrived')}
                                    disabled={updating}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                                >
                                    {updating ? 'Updating...' : 'Mark as Arrived'}
                                </button>
                            )}

                            {canDeliver && (
                                <button
                                    onClick={() => setShowDeliveryModal(true)}
                                    disabled={updating}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                                >
                                    Confirm Delivery
                                </button>
                            )}

                            {!canDepart && !canArrive && !canDeliver && shipment.status !== 'Delivered' && (
                                <p className="text-gray-500 italic">No actions available for current status.</p>
                            )}

                            {shipment.status === 'Delivered' && (
                                <p className="text-green-600 font-medium">Shipment completed.</p>
                            )}
                        </div>

                        {shipment.status !== 'Created' && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-md">
                                <p className="text-sm text-gray-600">
                                    <span className="font-semibold">Note:</span> Status updates are recorded on the Ethereum blockchain.
                                    Transactions may take a few moments to confirm.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={() => navigate('/official/predictions')}
                            className="text-gray-600 hover:text-gray-900 font-medium"
                        >
                            &larr; Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>

            {/* Delivery Confirmation Modal */}
            {showDeliveryModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                        <div className="bg-green-600 px-6 py-4 rounded-t-lg">
                            <h2 className="text-xl font-bold text-white">Confirm Delivery</h2>
                        </div>

                        <div className="p-6">
                            <p className="text-gray-600 mb-4">
                                Enter the actual quantities received for each aid type:
                            </p>

                            {quantityError && (
                                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                                    {quantityError}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tents</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={actualQuantities.tent}
                                        onChange={(e) => handleQuantityChange('tent', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Containers</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={actualQuantities.container}
                                        onChange={(e) => handleQuantityChange('container', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Food Packages</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={actualQuantities.food_package}
                                        onChange={(e) => handleQuantityChange('food_package', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Blankets</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={actualQuantities.blanket}
                                        onChange={(e) => handleQuantityChange('blanket', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowDeliveryModal(false)}
                                    disabled={updating}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDelivery}
                                    disabled={updating}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                                >
                                    {updating ? 'Confirming...' : 'Confirm Delivery'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShipmentDetailsPage;
