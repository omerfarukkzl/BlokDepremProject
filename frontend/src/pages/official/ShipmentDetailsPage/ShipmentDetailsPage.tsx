import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import shipmentService from '../../../services/shipmentService';
import type { ShipmentResponse } from '../../../services/shipmentService';

const ShipmentDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [shipment, setShipment] = useState<ShipmentResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState<boolean>(false);

    useEffect(() => {
        const fetchShipment = async () => {
            if (!id) return;
            try {
                const data = await shipmentService.getShipmentById(Number(id));
                setShipment(data);
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
                                    onClick={() => handleStatusUpdate('Delivered')}
                                    disabled={updating}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                                >
                                    {updating ? 'Updating...' : 'Mark as Delivered'}
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
        </div>
    );
};

export default ShipmentDetailsPage;
