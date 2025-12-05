import React, { useState } from 'react';
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Input,
  LoadingSpinner,
  EmptyState,
  Alert,
} from '../../../components';
import { Container } from '../../../components/layout';
import { useNotification } from '../../../components';
import { needsService, type Need, type NeedsParams } from '../../../services';
import { useQuery } from '@tanstack/react-query';

const NeedsPage: React.FC = () => {
  const { showSuccess } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');

  // Build API query parameters
  const queryParams: NeedsParams = {
    status: 'active',
    sortBy: 'urgencyLevel',
    sortOrder: 'desc',
  };

  if (selectedUrgency !== 'all') {
    queryParams.urgencyLevel = selectedUrgency;
  }

  if (searchTerm) {
    queryParams.search = searchTerm;
  }

  // Fetch needs from API
  const {
    data: needsResponse,
    isLoading,
    refetch,
    error,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['needs', queryParams],
    queryFn: () => needsService.getNeeds(queryParams),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const needs = needsResponse?.data || [];
  const lastRefresh = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  // Group needs by location for display
  const groupedNeeds = needs.reduce((acc, need) => {
    const locationKey = need.locationId;
    if (!acc[locationKey]) {
      acc[locationKey] = {
        location: need.location,
        needs: [],
        totalNeeds: 0,
        fulfilledNeeds: 0,
        lastUpdated: need.createdAt,
      };
    }
    acc[locationKey].needs.push(need);
    acc[locationKey].totalNeeds += need.quantityNeeded;
    acc[locationKey].fulfilledNeeds += need.quantityFulfilled;
    acc[locationKey].lastUpdated = new Date(acc[locationKey].lastUpdated) > new Date(need.createdAt)
      ? acc[locationKey].lastUpdated
      : need.createdAt;
    return acc;
  }, {} as Record<string, {
    location: Need['location'];
    needs: Need[];
    totalNeeds: number;
    fulfilledNeeds: number;
    lastUpdated: string;
  }>);

  const locationData = Object.values(groupedNeeds);

  // Refresh data
  const handleRefresh = async () => {
    try {
      await refetch();
      showSuccess('Veriler güncellendi', 'İhtiyaç listesi yenilendi.');
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const getUrgencyColor = (urgency: string | null) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUrgencyLabel = (urgency: string | null) => {
    switch (urgency) {
      case 'critical': return 'Kritik';
      case 'high': return 'Yüksek';
      case 'medium': return 'Orta';
      case 'low': return 'Düşük';
      default: return urgency || 'Belirtilmemiş';
    }
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Container>
      <div className="py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">İhtiyaç Listesi</h1>
              <p className="mt-2 text-gray-600">
                Deprem bölgesindeki güncel ihtiyaçları görüntüleyin
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {lastRefresh && (
                <span className="text-sm text-gray-500">
                  Son güncelleme: {lastRefresh.toLocaleTimeString('tr-TR')}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                leftIcon={<ArrowPathIcon className="h-4 w-4" />}
              >
                {isLoading ? 'Yenileniyor...' : 'Yenile'}
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    placeholder="Lokasyon veya ihtiyaç ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Urgency Filter */}
              <div className="sm:w-48">
                <select
                  value={selectedUrgency}
                  onChange={(e) => setSelectedUrgency(e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">Tüm Aciliyetler</option>
                  <option value="critical">Kritik</option>
                  <option value="high">Yüksek</option>
                  <option value="medium">Orta</option>
                  <option value="low">Düşük</option>
                </select>
              </div>

              {/* Filter Button */}
              <Button
                variant="outline"
                leftIcon={<FunnelIcon className="h-4 w-4" />}
                onClick={() => {
                  setSearchTerm('');
                  setSelectedUrgency('all');
                }}
              >
                Filtreleri Temizle
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Alert */}
        <Alert variant="info" className="mb-8">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Gerçek zamanlı veriler
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Bu ihtiyaç listesi görevliler tarafından güncellenmektedir. Kritik ihtiyaçlar öncelikli olarak karşılanmaktadır.
                </p>
              </div>
            </div>
          </div>
        </Alert>

        {/* Results */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" showLabel label="İhtiyaçlar yükleniyor..." />
            </div>
          ) : error ? (
            <Alert variant="error" showIcon>
              <div className="mt-2">
                <p className="text-sm text-red-800">
                  İhtiyaçlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="mt-3"
                >
                  Tekrar Dene
                </Button>
              </div>
            </Alert>
          ) : locationData.length === 0 ? (
            <EmptyState
              icon="search"
              title="İhtiyaç bulunamadı"
              description="Arama kriterlerinize uygun ihtiyaç bulunamadı."
              action={{
                label: 'Filtreleri Temizle',
                onClick: () => {
                  setSearchTerm('');
                  setSelectedUrgency('all');
                },
                variant: 'outline'
              }}
            />
          ) : (
            locationData.map((locationData) => (
              <Card key={locationData.location.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <CardTitle className="text-lg">{locationData.location.name}</CardTitle>
                        <CardDescription>{locationData.location.address}, {locationData.location.city}</CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        Karşılanma: {locationData.fulfilledNeeds}/{locationData.totalNeeds}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {Math.round((locationData.fulfilledNeeds / locationData.totalNeeds) * 100)}%
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getProgressBarColor((locationData.fulfilledNeeds / locationData.totalNeeds) * 100)}`}
                        style={{ width: `${(locationData.fulfilledNeeds / locationData.totalNeeds) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">İhtiyaç Listesi:</h4>
                    <div className="grid gap-3">
                      {locationData.needs.map((need) => (
                        <div key={need.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Badge
                              variant="outline"
                              className={getUrgencyColor(need.urgencyLevel)}
                            >
                              {getUrgencyLabel(need.urgencyLevel)}
                            </Badge>
                            <div>
                              <span className="font-medium text-gray-900">{need.aidItem.name}</span>
                              <span className="text-gray-500 ml-2">
                                {need.quantityNeeded - need.quantityFulfilled}/{need.quantityNeeded} {need.aidItem.unit}
                              </span>
                            </div>
                          </div>
                          {need.urgencyLevel === 'critical' && (
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Critical Needs Alert */}
                    {locationData.needs.some(need => need.urgencyLevel === 'critical') && (
                      <Alert variant="warning" className="mt-4">
                        <div className="flex">
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                              Kritik ihtiyaçlar mevcut
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                              <p>
                                Bu lokasyonda acil ihtiyaçları bulunmaktadır. Lütfen öncelik veriniz.
                              </p>
                            </div>
                          </div>
                        </div>
                      </Alert>
                    )}

                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500">
                        Son güncelleme: {new Date(locationData.lastUpdated).toLocaleString('tr-TR')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Stats Summary */}
        {!isLoading && locationData.length > 0 && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Özet</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {locationData.length}
                  </div>
                  <div className="text-sm text-gray-500">Aktif Lokasyon</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {locationData.reduce((acc, location) =>
                      acc + location.needs.filter(need => need.urgencyLevel === 'critical').length, 0
                    )}
                  </div>
                  <div className="text-sm text-gray-500">Kritik İhtiyaç</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {locationData.reduce((acc, location) =>
                      acc + (location.totalNeeds - location.fulfilledNeeds), 0
                    )}
                  </div>
                  <div className="text-sm text-gray-500">Beklenen İhtiyaç</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(
                      locationData.reduce((acc, location) =>
                        acc + (location.fulfilledNeeds / location.totalNeeds), 0
                      ) / locationData.length * 100
                    )}%
                  </div>
                  <div className="text-sm text-gray-500">Genel Karşılanma</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Container>
  );
};

export default NeedsPage;