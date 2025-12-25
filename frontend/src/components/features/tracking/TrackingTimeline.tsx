
import {
    TruckIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    ArrowRightIcon,
    MapPinIcon,
} from '@heroicons/react/24/outline';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';
import BlockchainVerificationLink from './BlockchainVerificationLink';
import { cn } from '../../../utils/cn';

export interface TrackingEvent {
    id: string | number;
    status: string;
    location?: string;
    timestamp: string;
    notes?: string;
    isOnBlockchain?: boolean;
    blockchainTxHash?: string | null;
}

export interface TrackingTimelineProps {
    /** Array of tracking events to display */
    events: TrackingEvent[];
    /** Additional CSS classes for the container */
    className?: string;
}

/**
 * Get status display information including label, color, and icon
 */
const getStatusInfo = (status: string) => {
    const normalizedStatus = status.toLowerCase().replace(/[_\s]/g, '_');

    switch (normalizedStatus) {
        case 'registered':
        case 'created':
            return {
                label: 'Kaydedildi',
                bgColor: 'bg-blue-100',
                borderColor: 'border-blue-500',
                textColor: 'text-blue-600',
                icon: <ClockIcon className="h-4 w-4" />,
            };
        case 'departed':
            return {
                label: 'Çıkış Yapıldı',
                bgColor: 'bg-purple-100',
                borderColor: 'border-purple-500',
                textColor: 'text-purple-600',
                icon: <ArrowRightIcon className="h-4 w-4" />,
            };
        case 'in_transit':
            return {
                label: 'Yolda',
                bgColor: 'bg-yellow-100',
                borderColor: 'border-yellow-500',
                textColor: 'text-yellow-600',
                icon: <TruckIcon className="h-4 w-4" />,
            };
        case 'arrived':
            return {
                label: 'Varış Noktasına Ulaştı',
                bgColor: 'bg-indigo-100',
                borderColor: 'border-indigo-500',
                textColor: 'text-indigo-600',
                icon: <MapPinIcon className="h-4 w-4" />,
            };
        case 'delivered':
            return {
                label: 'Teslim Edildi',
                bgColor: 'bg-green-100',
                borderColor: 'border-green-500',
                textColor: 'text-green-600',
                icon: <CheckCircleIcon className="h-4 w-4" />,
            };
        case 'cancelled':
            return {
                label: 'İptal Edildi',
                bgColor: 'bg-red-100',
                borderColor: 'border-red-500',
                textColor: 'text-red-600',
                icon: <ExclamationTriangleIcon className="h-4 w-4" />,
            };
        default:
            return {
                label: status,
                bgColor: 'bg-gray-100',
                borderColor: 'border-gray-500',
                textColor: 'text-gray-600',
                icon: <ClockIcon className="h-4 w-4" />,
            };
    }
};

/**
 * Format date for display in Turkish locale
 */
const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Geçersiz tarih';
        }
        return date.toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return 'Geçersiz tarih';
    }
};

/**
 * TrackingTimeline - Displays a vertical timeline of shipment tracking events
 * 
 * Features:
 * - Vertical timeline layout with status icons
 * - Each event shows status name, timestamp, and location (if available)
 * - Blockchain verification links for on-chain transactions
 * - Responsive design with mobile-friendly layout
 * - Status-specific colors and icons using lucide-react (via @heroicons)
 */
export default function TrackingTimeline({ events, className = '' }: TrackingTimelineProps) {
    // Sort events by timestamp ascending (oldest first) for chronological display
    const sortedEvents = [...events].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    if (events.length === 0) {
        return (
            <div className={cn('text-center py-8 text-gray-500', className)}>
                <ClockIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Henüz takip kaydı bulunmuyor</p>
            </div>
        );
    }

    return (
        <div className={cn('relative', className)}>
            {/* Timeline Line */}
            <div
                className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"
                aria-hidden="true"
            />

            {/* Timeline Items */}
            <div className="space-y-6" role="list" aria-label="Takip geçmişi">
                {sortedEvents.map((event, index) => {
                    const statusInfo = getStatusInfo(event.status);
                    const isLast = index === sortedEvents.length - 1;

                    return (
                        <div
                            key={event.id}
                            className="relative flex items-start"
                            role="listitem"
                        >
                            {/* Timeline Dot */}
                            <div
                                className={cn(
                                    'relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2',
                                    statusInfo.bgColor,
                                    statusInfo.borderColor,
                                    isLast && 'ring-4 ring-opacity-30',
                                    isLast && statusInfo.bgColor.replace('100', '200')
                                )}
                                aria-hidden="true"
                            >
                                <span className={statusInfo.textColor}>
                                    {statusInfo.icon}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="ml-6 flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-900 flex items-center flex-wrap gap-2">
                                            <span>{statusInfo.label}</span>
                                            {event.isOnBlockchain && (
                                                <ShieldCheckIcon
                                                    className="w-4 h-4 text-green-500 flex-shrink-0"
                                                    aria-label="Blockchain ile doğrulandı"
                                                    title="Bu kayıt blockchain üzerinde doğrulandı"
                                                />
                                            )}
                                        </h4>

                                        {/* Location */}
                                        {event.location && (
                                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
                                                <MapPinIcon className="h-3.5 w-3.5 flex-shrink-0" />
                                                <span>{event.location}</span>
                                            </p>
                                        )}

                                        {/* Notes */}
                                        {event.notes && (
                                            <p className="text-sm text-gray-500 mt-1">{event.notes}</p>
                                        )}

                                        {/* Blockchain Verification Link */}
                                        {event.isOnBlockchain && event.blockchainTxHash && (
                                            <div className="mt-2">
                                                <BlockchainVerificationLink txHash={event.blockchainTxHash} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Timestamp */}
                                    <span className="text-sm text-gray-500 whitespace-nowrap flex-shrink-0">
                                        {formatDate(event.timestamp)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/**
 * Named export for conditional import scenarios
 */
export { TrackingTimeline };
