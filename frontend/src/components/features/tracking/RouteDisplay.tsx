import React from 'react';

interface Location {
    id: string;
    name: string;
    city: string;
    region: string;
    latitude?: number;
    longitude?: number;
}

// Combined status type: frontend-expected + backend-actual statuses
type ShipmentStatus = 'registered' | 'in_transit' | 'delivered' | 'cancelled' | 'created' | 'departed' | 'arrived';

interface RouteDisplayProps {
    origin: Location;
    destination: Location;
    status: ShipmentStatus;
    estimatedDuration?: string;
    className?: string;
}

export const RouteDisplay: React.FC<RouteDisplayProps> = ({
    origin,
    destination,
    status,
    estimatedDuration,
    className = '',
}) => {
    // Determine progress based on status
    // Backend statuses: created, registered, departed, arrived, delivered
    // Frontend might receive: registered, in_transit, delivered, cancelled
    const getProgress = () => {
        const normalizedStatus = status.toLowerCase();
        switch (normalizedStatus) {
            case 'delivered':
                return 100;
            case 'arrived':
                return 85;
            case 'departed':
            case 'in_transit':
                return 50;
            case 'created':
            case 'registered':
            default:
                return 5;
        }
    };

    const progress = getProgress();

    return (
        <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-1.447-.894L15 7m0 13V7m0 0L9.5 3.5" />
                </svg>
                Güzergah Bilgisi
            </h3>

            <div className="relative flex items-center justify-between">
                {/* Progress Bar Background */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-0 rounded transform -translate-y-1/2" />

                {/* Active Progress Bar */}
                <div
                    className="absolute top-1/2 left-0 h-1 bg-blue-600 -z-0 rounded transition-all duration-1000 ease-out transform -translate-y-1/2"
                    style={{ width: `${progress}%` }}
                />

                {/* Origin Point */}
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-blue-600 flex items-center justify-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-gray-900">{origin.city || 'Belirtilmedi'}</p>
                        <p className="text-sm text-gray-500">{origin.name}</p>
                        {origin.latitude && origin.longitude && (
                            <p className="text-xs text-gray-400 mt-1 font-mono">
                                {origin.latitude.toFixed(4)}, {origin.longitude.toFixed(4)}
                            </p>
                        )}
                    </div>
                </div>

                {/* Truck/Status Icon on Line */}
                <div
                    className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-1000 ease-out"
                    style={{ left: `${progress}%` }}
                >
                    <div className="w-10 h-10 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center shadow-md">
                        {status === 'delivered' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 10-4 0 2 2 0 004 0zm10 0a2 2 0 10-4 0 2 2 0 004 0z" />
                            </svg>
                        )}
                    </div>
                    {estimatedDuration && status === 'in_transit' && (
                        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-xs px-2 py-1 rounded">
                            {estimatedDuration}
                        </div>
                    )}
                </div>

                {/* Destination Point */}
                <div className="relative z-10 flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mb-2 ${status === 'delivered'
                        ? 'bg-green-100 border-green-600'
                        : 'bg-gray-100 border-gray-300'
                        }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${status === 'delivered' ? 'text-green-600' : 'text-gray-400'
                            }`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 4.4A1 1 0 0116 14h-6a1 1 0 010-2h5.11l-1.7-2.93a1 1 0 010-1.07L15.11 5H6a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V9a1 1 0 10-2 0v5H6V6z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-gray-900">{destination.city || 'Belirtilmedi'}</p>
                        <p className="text-sm text-gray-500">{destination.name}</p>
                        {destination.latitude && destination.longitude && (
                            <p className="text-xs text-gray-400 mt-1 font-mono">
                                {destination.latitude.toFixed(4)}, {destination.longitude.toFixed(4)}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
