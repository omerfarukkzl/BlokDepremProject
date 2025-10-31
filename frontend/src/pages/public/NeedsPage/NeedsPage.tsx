import React, { useState, useEffect } from 'react';
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

// Mock data - should come from API
const mockNeeds = [
  {
    id: '1',
    locationName: 'İstanbul - Kadıköy',
    address: 'Kadıköy, İstanbul',
    aidItems: [
      { name: 'Su', quantity: 500, unit: 'litre', urgency: 'critical' as const },
      { name: 'Gıda', quantity: 200, unit: 'kg', urgency: 'high' as const },
      { name: 'İlaç', quantity: 100, unit: 'kutu', urgency: 'medium' as const },
    ],
    totalNeeds: 800,
    fulfilledNeeds: 300,
    lastUpdated: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    locationName: 'Ankara - Çankaya',
    address: 'Çankaya, Ankara',
    aidItems: [
      { name: 'Battaniye', quantity: 300, unit: 'adet', urgency: 'high' as const },
      { name: 'Tent', quantity: 50, unit: 'adet', urgency: 'critical' as const },
    ],
    totalNeeds: 350,
    fulfilledNeeds: 100,
    lastUpdated: '2024-01-15T09:45:00Z',
  },
  {
    id: '3',
    locationName: 'İzmir - Konak',
    address: 'Konak, İzmir',
    aidItems: [
      { name: 'Su', quantity: 1000, unit: 'litre', urgency: 'critical' as const },
      { name: 'Gıda', quantity: 500, unit: 'kg', urgency: 'high' as const },
      { name: 'Kıyafet', quantity: 400, unit: 'adet', urgency: 'medium' as const },
    ],
    totalNeeds: 1900,
    fulfilledNeeds: 800,
    lastUpdated: '2024-01-15T11:00:00Z',
  },
];

const NeedsPage: React.FC = () => {
  const { showSuccess } = useNotification();
  const [loading, setLoading] = useState(false);
  const [needs, setNeeds] = useState(mockNeeds);
  const [filteredNeeds, setFilteredNeeds] = useState(mockNeeds);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Filter logic
  useEffect(() => {
    let filtered = needs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(need =>
        need.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        need.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Urgency filter
    if (selectedUrgency !== 'all') {
      filtered = filtered.filter(need =>
        need.aidItems.some(item => item.urgency === selectedUrgency)
      );
    }

    setFilteredNeeds(filtered);
  }, [needs, searchTerm, selectedUrgency]);

  // Refresh data
  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastRefresh(new Date());
      showSuccess('Veriler güncellendi', 'İhtiyaç listesi yenilendi.');
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'Kritik';
      case 'high': return 'Yüksek';
      case 'medium': return 'Orta';
      case 'low': return 'Düşük';
      default: return urgency;
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
              <span className="text-sm text-gray-500">
                Son güncelleme: {lastRefresh.toLocaleTimeString('tr-TR')}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                leftIcon={<ArrowPathIcon className="h-4 w-4" />}
              >
                {loading ? 'Yenileniyor...' : 'Yenile'}
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
                    placeholder="Lokasyon ara..."
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
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" showLabel label="İhtiyaçlar yükleniyor..." />
            </div>
          ) : filteredNeeds.length === 0 ? (
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
            filteredNeeds.map((need) => (
              <Card key={need.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <CardTitle className="text-lg">{need.locationName}</CardTitle>
                        <CardDescription>{need.address}</CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        Karşılanma: {need.fulfilledNeeds}/{need.totalNeeds}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {Math.round((need.fulfilledNeeds / need.totalNeeds) * 100)}%
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getProgressBarColor((need.fulfilledNeeds / need.totalNeeds) * 100)}`}
                        style={{ width: `${(need.fulfilledNeeds / need.totalNeeds) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">İhtiyaç Listesi:</h4>
                    <div className="grid gap-3">
                      {need.aidItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Badge
                              variant="outline"
                              className={getUrgencyColor(item.urgency)}
                            >
                              {getUrgencyLabel(item.urgency)}
                            </Badge>
                            <div>
                              <span className="font-medium text-gray-900">{item.name}</span>
                              <span className="text-gray-500 ml-2">
                                {item.quantity} {item.unit}
                              </span>
                            </div>
                          </div>
                          {item.urgency === 'critical' && (
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Critical Needs Alert */}
                    {need.aidItems.some(item => item.urgency === 'critical') && (
                      <Alert variant="warning" size="sm" className="mt-4">
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
                        Son güncelleme: {new Date(need.lastUpdated).toLocaleString('tr-TR')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Stats Summary */}
        {!loading && filteredNeeds.length > 0 && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Özet</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {filteredNeeds.length}
                  </div>
                  <div className="text-sm text-gray-500">Aktif Lokasyon</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {filteredNeeds.reduce((acc, need) =>
                      acc + need.aidItems.filter(item => item.urgency === 'critical').length, 0
                    )}
                  </div>
                  <div className="text-sm text-gray-500">Kritik İhtiyaç</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {filteredNeeds.reduce((acc, need) =>
                      acc + need.totalNeeds - need.fulfilledNeeds, 0
                    )}
                  </div>
                  <div className="text-sm text-gray-500">Beklenen İhtiyaç</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(
                      filteredNeeds.reduce((acc, need) =>
                        acc + (need.fulfilledNeeds / need.totalNeeds), 0
                      ) / filteredNeeds.length * 100
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