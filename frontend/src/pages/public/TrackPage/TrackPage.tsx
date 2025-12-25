import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  QrCodeIcon,
  MagnifyingGlassIcon,
  TruckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  LoadingSpinner,
  EmptyState,
  Alert,
  Badge,
  SkeletonLoader,
} from '../../../components';
import { Container } from '../../../components/layout';
import { useNotification } from '../../../components';
import { BlockchainVerificationLink } from '../../../components/features/tracking';
import trackingService from '../../../services/trackingService';
import { cn } from '../../../utils/cn';


const TrackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { showError, showSuccess } = useNotification();

  const [barcode, setBarcode] = useState(searchParams.get('barcode') || '');
  const [loading, setLoading] = useState(false);
  const [shipmentData, setShipmentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Get status info
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'registered':
        return {
          label: 'Kaydedildi',
          color: 'text-blue-600 bg-blue-100',
          icon: <ClockIcon className="h-5 w-5" />
        };
      case 'in_transit':
        return {
          label: 'Yolda',
          color: 'text-yellow-600 bg-yellow-100',
          icon: <TruckIcon className="h-5 w-5" />
        };
      case 'delivered':
        return {
          label: 'Teslim Edildi',
          color: 'text-green-600 bg-green-100',
          icon: <CheckCircleIcon className="h-5 w-5" />
        };
      case 'cancelled':
        return {
          label: 'İptal Edildi',
          color: 'text-red-600 bg-red-100',
          icon: <ExclamationTriangleIcon className="h-5 w-5" />
        };
      default:
        return {
          label: status,
          color: 'text-gray-600 bg-gray-100',
          icon: <ClockIcon className="h-5 w-5" />
        };
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!barcode.trim()) {
      setError('Lütfen bir kargo barkodu girin');
      return;
    }

    // Validate barcode format
    const validation = trackingService.validateBarcode(barcode);
    if (!validation.isValid) {
      setError(validation.error || 'Geçersiz barkod formatı');
      return;
    }

    setLoading(true);
    setError(null);
    setShipmentData(null);

    try {
      // Use trackingService to get tracking history with proper API client integration
      const trackingHistory = await trackingService.getTrackingHistory(barcode);

      // Transform the API response to match the frontend interface
      const transformedData = {
        id: trackingHistory.shipment.id,
        barcode: trackingHistory.shipment.barcode,
        origin: `${trackingHistory.shipment.originLocation?.name || 'Bilinmeyen'} ${trackingHistory.shipment.originLocation?.address || ''}`.trim(),
        destination: `${trackingHistory.shipment.destinationLocation?.name || 'Bilinmeyen'} ${trackingHistory.shipment.destinationLocation?.address || ''}`.trim(),
        status: trackingHistory.shipment.status.toLowerCase(),
        description: `Gönderi #${trackingHistory.shipment.barcode}`,
        items: trackingHistory.shipment.items?.map((item) => ({
          name: item.aidItem.name,
          quantity: item.quantity,
          unit: item.aidItem.unit,
        })) || [],
        trackingLogs: trackingHistory.events.map((event) => ({
          id: event.id,
          status: event.status.toLowerCase(),
          location: event.location || `${event.status} - Kayıt`,
          timestamp: event.timestamp,
          notes: event.notes || `Durum güncellendi: ${event.status}`,
          isOnBlockchain: event.isOnBlockchain || false,
          blockchainTxHash: event.blockchainTxHash,
        })),
        createdAt: trackingHistory.shipment.createdAt,
        estimatedDelivery: trackingHistory.shipment.estimatedDeliveryDate || (() => {
          // If no estimated delivery date, calculate 24 hours from creation
          try {
            const createdDate = new Date(trackingHistory.shipment.createdAt);
            if (!isNaN(createdDate.getTime())) {
              const estimated = new Date(createdDate);
              estimated.setHours(estimated.getHours() + 24);
              return estimated.toISOString();
            }
          } catch {
            // Invalid date, fall through to fallback
          }
          // Fallback to current date + 24 hours
          const fallback = new Date();
          fallback.setHours(fallback.getHours() + 24);
          return fallback.toISOString();
        })(),
        actualDelivery: trackingHistory.shipment.actualDeliveryDate || null,
      };

      setShipmentData(transformedData);
      showSuccess('Kargo bulundu', `${barcode} numaralı kargo detayları yüklendi.`);
    } catch (error: any) {
      console.error('Error tracking shipment:', error);

      // Handle specific error cases
      if (error.message?.includes('not found') || error.message?.includes('404')) {
        setError('Bu barkoda ait kargo bulunamadı. Lütfen barkodu kontrol edip tekrar deneyin.');
      } else {
        setError(error.message || 'Kargo takibi sırasında hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Container>
      <div className="py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Kargo Takip</h1>
          <p className="mt-2 text-gray-600">
            Barkod numaranız ile kargonuzun durumunu takip edin
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <QrCodeIcon className="h-6 w-6 mr-2" />
              Kargo Barkodu
            </CardTitle>
            <CardDescription>
              Takip etmek istediğiniz kargonun barkodunu girin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-3">
              <div className="flex-1">
                <Input
                  placeholder="Örn: BK-2024-001"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value.toUpperCase())}
                  onKeyPress={handleKeyPress}
                  leftIcon={<QrCodeIcon className="h-4 w-4 text-gray-400" />}
                  disabled={loading}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading || !barcode.trim()}
                loading={loading}
                leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
              >
                Takip Et
              </Button>
            </div>

            {error && (
              <Alert variant="error" className="mt-4">
                {error}
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="p-6">
              <SkeletonLoader lines={5} />
            </CardContent>
          </Card>
        )}

        {/* Shipment Details */}
        {shipmentData && !loading && (
          <>
            {/* Shipment Info */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      {getStatusInfo(shipmentData.status).icon}
                      <span className="ml-2">{shipmentData.barcode}</span>
                    </CardTitle>
                    <CardDescription>{shipmentData.description}</CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={getStatusInfo(shipmentData.status).color}
                  >
                    {getStatusInfo(shipmentData.status).label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Rota Bilgileri</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Kalkış:</span>
                        <span className="font-medium">{shipmentData.origin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Varış:</span>
                        <span className="font-medium">{shipmentData.destination}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Zaman Bilgileri</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Oluşturulma:</span>
                        <span className="font-medium">{formatDate(shipmentData.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tahmini Teslimat:</span>
                        <span className="font-medium">
                          {formatDate(shipmentData.estimatedDelivery)}
                        </span>
                      </div>
                      {shipmentData.actualDelivery && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Gerçek Teslimat:</span>
                          <span className="font-medium text-green-600">
                            {formatDate(shipmentData.actualDelivery)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Barcode Section */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Barkod</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL}/shipments/${shipmentData.id}/barcode`}
                        alt={`Barkod: ${shipmentData.barcode}`}
                        className="h-16 bg-white p-2 rounded border"
                        onError={(e) => {
                          // Hide image on error
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div>
                        <span className="font-mono text-lg font-semibold text-gray-900">
                          {shipmentData.barcode}
                        </span>
                        <p className="text-sm text-gray-500">Takip barkodu</p>
                      </div>
                    </div>
                    <a
                      href={`${import.meta.env.VITE_API_BASE_URL}/shipments/${shipmentData.id}/barcode`}
                      download={`barcode-${shipmentData.barcode}.png`}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      <QrCodeIcon className="h-4 w-4 mr-2" />
                      Barkodu İndir
                    </a>
                  </div>
                </div>

                {/* Items */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Gönderi İçeriği</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {shipmentData.items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900">{item.name}</span>
                        <span className="text-sm text-gray-600">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tracking Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Takip Geçmişi</CardTitle>
                <CardDescription>
                  Kargonuzun yolculuğu boyunca kaydedilen tüm durumlar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                  {/* Timeline Items */}
                  <div className="space-y-6">
                    {shipmentData.trackingLogs.map((log: any, index: number) => (
                      <div key={log.id} className="relative flex items-start">
                        {/* Timeline Dot */}
                        <div className={cn(
                          'relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2',
                          log.status === 'delivered'
                            ? 'bg-green-100 border-green-500'
                            : log.status === 'in_transit'
                              ? 'bg-yellow-100 border-yellow-500'
                              : 'bg-blue-100 border-blue-500'
                        )}>
                          {getStatusInfo(log.status).icon}
                        </div>

                        {/* Content */}
                        <div className="ml-6 flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900 flex items-center">
                                {getStatusInfo(log.status).label}
                                {log.isOnBlockchain && (
                                  <ShieldCheckIcon
                                    className="w-4 h-4 ml-2 text-green-500"
                                    aria-label="Blockchain ile doğrulandı"
                                    title="Bu kayıt blockchain üzerinde doğrulandı"
                                  />
                                )}
                              </h4>
                              <p className="text-sm text-gray-600">{log.location}</p>
                              <p className="text-sm text-gray-500 mt-1">{log.notes}</p>
                              {/* Blockchain Verification Link */}
                              {log.isOnBlockchain && log.blockchainTxHash && (
                                <div className="mt-2">
                                  <BlockchainVerificationLink txHash={log.blockchainTxHash} />
                                </div>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatDate(log.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Empty State */}
        {!loading && !shipmentData && !error && !barcode && (
          <EmptyState
            icon="search"
            title="Kargo takip için barkod girin"
            description="Kargonuzun barkodunu yukarıdaki alana girerek durumunu takip edebilirsiniz."
          />
        )}
      </div>
    </Container>
  );
};

export default TrackPage;