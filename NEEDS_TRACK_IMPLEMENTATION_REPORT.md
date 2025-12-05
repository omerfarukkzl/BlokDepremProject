# Needs ve Track Sayfaları - Teknik Implementasyon Raporu

## 1. Özet

Bu rapor, BlokDeprem projesi kapsamında geliştirilen **İhtiyaç Listesi (Needs)** ve **Kargo Takip (Track)** sayfalarının teknik implementasyon detaylarını içermektedir. Her iki sayfa da deprem yardım operasyonlarında şeffaflık ve takip sağlamak amacıyla geliştirilmiştir.

### 1.1. Proje Kapsamı

- **Needs Sayfası**: Deprem bölgelerindeki güncel ihtiyaçları görüntüleme, filtreleme ve takip etme
- **Track Sayfası**: Kargo barkod numarası ile gönderi durumunu takip etme

### 1.2. Teknoloji Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, React Query (TanStack Query)
- **Backend**: NestJS, TypeORM, PostgreSQL
- **State Management**: React Query (Server State), React Hooks (Local State)
- **Routing**: React Router v6

---

## 2. Needs Sayfası (İhtiyaç Listesi)

### 2.1. Özellikler

- ✅ Gerçek zamanlı ihtiyaç listesi görüntüleme
- ✅ Lokasyon bazlı gruplama
- ✅ Aciliyet seviyesine göre filtreleme (Kritik, Yüksek, Orta, Düşük)
- ✅ Lokasyon arama özelliği
- ✅ Otomatik veri yenileme (30 saniyede bir)
- ✅ İlerleme çubukları ile karşılanma oranı görselleştirme
- ✅ Kritik ihtiyaçlar için özel uyarılar
- ✅ İstatistik özeti (Aktif lokasyon, Kritik ihtiyaç, Beklenen ihtiyaç, Genel karşılanma)

### 2.2. Frontend Implementasyonu

#### 2.2.1. Komponent Yapısı

**Dosya**: `frontend/src/pages/public/NeedsPage/NeedsPage.tsx`

```typescript
const NeedsPage: React.FC = () => {
  const { showSuccess } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  
  // React Query ile veri çekme
  const {
    data: needsResponse,
    isLoading,
    refetch,
    error,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['needs', queryParams],
    queryFn: () => needsService.getNeeds(queryParams),
    refetchInterval: 30000, // 30 saniyede bir otomatik yenileme
  });
```

#### 2.2.2. Veri İşleme ve Gruplama

Sayfa, backend'den gelen ihtiyaç verilerini lokasyon bazında gruplar:

```typescript
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
  return acc;
}, {} as Record<string, {...}>);
```

#### 2.2.3. Filtreleme ve Sıralama

- **Arama**: Lokasyon adı ve adres üzerinde arama
- **Aciliyet Filtresi**: Kritik, Yüksek, Orta, Düşük veya Tümü
- **Sıralama**: Aciliyet seviyesine göre azalan sıralama (varsayılan)

#### 2.2.4. UI Bileşenleri

- **Card**: Her lokasyon için kart görünümü
- **Badge**: Aciliyet seviyesi göstergesi (renk kodlu)
- **Progress Bar**: Karşılanma oranı görselleştirme
- **Alert**: Kritik ihtiyaçlar için uyarı mesajları
- **EmptyState**: Veri bulunamadığında gösterilen boş durum
- **LoadingSpinner**: Yükleme durumu göstergesi

### 2.3. Backend Implementasyonu

#### 2.3.1. Controller

**Dosya**: `backend/src/modules/needs/needs.controller.ts`

```typescript
@Controller('needs')
export class NeedsController {
  @Get()
  async findAll() {
    const data = await this.needsService.findAll();
    return {
      success: true,
      data,
      pagination: {
        page: 1,
        limit: data.length,
        total: data.length,
        totalPages: 1
      }
    };
  }
}
```

#### 2.3.2. Service

**Dosya**: `backend/src/modules/needs/needs.service.ts`

```typescript
@Injectable()
export class NeedsService {
  async findAll(): Promise<Need[]> {
    return this.needRepository.find({
      relations: ['location', 'item'],
    });
  }
}
```

#### 2.3.3. Entity Model

**Dosya**: `backend/src/entities/need.entity.ts`

```typescript
@Entity('needs')
export class Need {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  location_id: number;

  @Column()
  item_id: number;

  @Column()
  needed_quantity: number;

  @Column({ default: 0 })
  supplied_quantity: number;

  @Column({ type: 'varchar', nullable: true })
  priority: string; // 'critical', 'high', 'medium', 'low'

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @ManyToOne(() => AidItem)
  @JoinColumn({ name: 'item_id' })
  item: AidItem;
}
```

### 2.4. API Endpoint

**Endpoint**: `GET /needs`

**Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "location_id": 1,
      "location": {
        "id": 1,
        "name": "Hatay Merkez",
        "address": "...",
        "city": "Hatay"
      },
      "item_id": 1,
      "item": {
        "id": 1,
        "name": "Su",
        "category": "water",
        "unit": "litre"
      },
      "needed_quantity": 1000,
      "supplied_quantity": 500,
      "priority": "critical",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 50,
    "totalPages": 1
  }
}
```

### 2.5. Servis Katmanı (Frontend)

**Dosya**: `frontend/src/services/needsService.ts`

Servis katmanı, backend API'si ile frontend arasında köprü görevi görür:

- **Veri Adaptasyonu**: Backend'den gelen snake_case formatını frontend'in camelCase formatına dönüştürür
- **Hata Yönetimi**: API hatalarını yakalar ve kullanıcı dostu mesajlara dönüştürür
- **Type Safety**: TypeScript interface'leri ile tip güvenliği sağlar

```typescript
const adaptNeed = (raw: RawNeed): Need => ({
  id: raw.id.toString(),
  locationId: raw.location_id.toString(),
  location: raw.location,
  aidItemId: raw.item_id.toString(),
  aidItem: {
    id: raw.item.id.toString(),
    name: raw.item.name,
    category: raw.item.category,
    unit: raw.item.unit || 'adet',
  },
  quantityNeeded: raw.needed_quantity,
  quantityFulfilled: raw.supplied_quantity,
  urgencyLevel: raw.priority as 'critical' | 'high' | 'medium' | 'low' | null,
  status: raw.supplied_quantity >= raw.needed_quantity ? 'fulfilled' : 'active',
  createdAt: raw.updated_at,
  updatedAt: raw.updated_at
});
```

---

## 3. Track Sayfası (Kargo Takip)

### 3.1. Özellikler

- ✅ Barkod numarası ile kargo takibi
- ✅ URL parametresinden barkod okuma (`/track?barcode=BK-2024-001`)
- ✅ Detaylı gönderi bilgileri (Kalkış, Varış, İçerik)
- ✅ Zaman bilgileri (Oluşturulma, Tahmini Teslimat, Gerçek Teslimat)
- ✅ Takip geçmişi timeline görünümü
- ✅ Durum bazlı renk kodlaması (Kaydedildi, Yolda, Teslim Edildi, İptal Edildi)
- ✅ Barkod format validasyonu
- ✅ Hata yönetimi ve kullanıcı bildirimleri

### 3.2. Frontend Implementasyonu

#### 3.2.1. Komponent Yapısı

**Dosya**: `frontend/src/pages/public/TrackPage/TrackPage.tsx`

```typescript
const TrackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { showError, showSuccess } = useNotification();
  
  const [barcode, setBarcode] = useState(searchParams.get('barcode') || '');
  const [loading, setLoading] = useState(false);
  const [shipmentData, setShipmentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
```

#### 3.2.2. Barkod Validasyonu

```typescript
const validation = trackingService.validateBarcode(barcode);
if (!validation.isValid) {
  setError(validation.error || 'Geçersiz barkod formatı');
  return;
}
```

**Validasyon Kuralları**:
- Minimum 8, maksimum 50 karakter
- Sadece alfanumerik karakterler, tire (-) ve alt çizgi (_) kabul edilir

#### 3.2.3. Veri Dönüşümü

Backend'den gelen veriler frontend formatına dönüştürülür:

```typescript
const transformedData = {
  id: trackingHistory.shipment.id,
  barcode: trackingHistory.shipment.barcode,
  origin: `${trackingHistory.shipment.originLocation?.name || 'Bilinmeyen'} ${trackingHistory.shipment.originLocation?.address || ''}`.trim(),
  destination: `${trackingHistory.shipment.destinationLocation?.name || 'Bilinmeyen'} ${trackingHistory.shipment.destinationLocation?.address || ''}`.trim(),
  status: trackingHistory.shipment.status.toLowerCase(),
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
    notes: event.notes || `Durum güncellendi: ${event.status}`
  })),
};
```

#### 3.2.4. Timeline Görünümü

Takip geçmişi, zaman çizelgesi (timeline) formatında gösterilir:

- Her durum değişikliği için bir nokta
- Durum bazlı renk kodlaması:
  - **Kaydedildi**: Mavi
  - **Yolda**: Sarı
  - **Teslim Edildi**: Yeşil
  - **İptal Edildi**: Kırmızı

### 3.3. Backend Implementasyonu

#### 3.3.1. Controller

**Dosya**: `backend/src/modules/tracking/tracking.controller.ts`

```typescript
@Controller('track')
export class TrackingController {
  @Get(':barcode')
  async trackByBarcode(@Param('barcode') barcode: string) {
    return this.trackingService.trackByBarcode(barcode);
  }
}
```

#### 3.3.2. Service

**Dosya**: `backend/src/modules/tracking/tracking.service.ts`

```typescript
@Injectable()
export class TrackingService {
  async trackByBarcode(barcode: string): Promise<{ shipment: Shipment; history: TrackingLog[] }> {
    const shipment = await this.shipmentRepository.findOne({
      where: { barcode },
      relations: ['sourceLocation', 'destinationLocation', 'official'],
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with barcode ${barcode} not found`);
    }

    const history = await this.trackingLogRepository.find({ 
      where: { shipment_id: shipment.id } 
    });

    return { shipment, history };
  }
}
```

#### 3.3.3. Entity Modelleri

**Shipment Entity** (`backend/src/entities/shipment.entity.ts`):
```typescript
@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  barcode: string;

  @Column({ nullable: true })
  source_location_id: number;

  @Column()
  destination_location_id: number;

  @Column()
  created_by_official_id: number;

  @Column()
  status: string; // 'Registered', 'InTransit', 'Delivered', 'Cancelled'

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'source_location_id' })
  sourceLocation: Location;

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'destination_location_id' })
  destinationLocation: Location;
}
```

**TrackingLog Entity** (`backend/src/entities/tracking-log.entity.ts`):
```typescript
@Entity('tracking_logs')
export class TrackingLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  shipment_id: number;

  @Column()
  status: string;

  @Column()
  transaction_hash: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @ManyToOne(() => Shipment)
  @JoinColumn({ name: 'shipment_id' })
  shipment: Shipment;
}
```

### 3.4. API Endpoint

**Endpoint**: `GET /track/:barcode`

**Response Format**:
```json
{
  "shipment": {
    "id": 1,
    "barcode": "BK-2024-001",
    "source_location_id": 1,
    "sourceLocation": {
      "id": 1,
      "name": "İstanbul Depo",
      "address": "...",
      "city": "İstanbul"
    },
    "destination_location_id": 2,
    "destinationLocation": {
      "id": 2,
      "name": "Hatay Merkez",
      "address": "...",
      "city": "Hatay"
    },
    "status": "InTransit",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T12:00:00Z"
  },
  "history": [
    {
      "id": 1,
      "shipment_id": 1,
      "status": "Registered",
      "transaction_hash": "0x...",
      "timestamp": "2024-01-15T10:00:00Z"
    },
    {
      "id": 2,
      "shipment_id": 1,
      "status": "InTransit",
      "transaction_hash": "0x...",
      "timestamp": "2024-01-15T11:00:00Z"
    }
  ]
}
```

### 3.5. Servis Katmanı (Frontend)

**Dosya**: `frontend/src/services/trackingService.ts`

Servis katmanı aşağıdaki işlevleri sağlar:

- **Barkod Validasyonu**: Format kontrolü
- **Veri Dönüşümü**: Backend formatından frontend formatına dönüşüm
- **Hata Yönetimi**: API hatalarını yakalama ve kullanıcı dostu mesajlara dönüştürme
- **URL Oluşturma**: Paylaşım için tracking URL'i oluşturma

```typescript
validateBarcode(barcode: string): { isValid: boolean; error?: string } {
  if (!barcode) {
    return { isValid: false, error: 'Barcode is required' };
  }
  if (barcode.length < 8 || barcode.length > 50) {
    return { isValid: false, error: 'Barcode must be between 8 and 50 characters' };
  }
  if (!/^[A-Za-z0-9\-_]+$/.test(barcode)) {
    return { isValid: false, error: 'Barcode contains invalid characters' };
  }
  return { isValid: true };
}
```

---

## 4. Teknik Detaylar

### 4.1. State Management

#### React Query (TanStack Query)

Her iki sayfa da server state yönetimi için React Query kullanır:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 dakika
    },
  },
});
```

**Needs Sayfası**:
- Otomatik yenileme: 30 saniyede bir
- Cache yönetimi: Query key'e göre cache'leme
- Optimistic updates: Manuel yenileme butonu ile

**Track Sayfası**:
- On-demand fetching: Sadece kullanıcı arama yaptığında
- Error handling: Hata durumlarında kullanıcı bildirimi

### 4.2. Routing

**Dosya**: `frontend/src/App.tsx`

```typescript
<Route path={ROUTES.NEEDS} element={<NeedsPage />} />
<Route path={ROUTES.TRACK} element={<TrackPage />} />
```

**Route Tanımları** (`frontend/src/constants/index.ts`):
```typescript
export const ROUTES = {
  NEEDS: '/needs',
  TRACK: '/track',
};
```

### 4.3. API Client

**Dosya**: `frontend/src/services/apiClient.ts`

Merkezi API istemcisi:
- Axios tabanlı
- Token yönetimi
- Hata yakalama ve dönüştürme
- Response format standardizasyonu

### 4.4. Type Safety

TypeScript ile tip güvenliği sağlanmıştır:

- **Interface'ler**: Tüm veri modelleri için interface tanımları
- **Type Guards**: Runtime tip kontrolü
- **Generic Types**: Servis metodlarında generic kullanımı

### 4.5. UI/UX Özellikleri

#### Needs Sayfası:
- Responsive tasarım (mobil uyumlu)
- Loading states (skeleton loader)
- Empty states (veri yoksa bilgilendirme)
- Error states (hata durumunda yeniden deneme)
- Progress indicators (karşılanma oranı)
- Color coding (aciliyet seviyesi)

#### Track Sayfası:
- Timeline görünümü
- Status badges (durum rozetleri)
- Date formatting (Türkçe tarih formatı)
- Keyboard support (Enter tuşu ile arama)
- URL parameter support (barkod URL'den okunabilir)

---

## 5. Veri Akışı

### 5.1. Needs Sayfası Veri Akışı

```
1. Kullanıcı sayfayı açar
   ↓
2. React Query otomatik olarak needsService.getNeeds() çağırır
   ↓
3. apiClient.get('/needs') → Backend API
   ↓
4. Backend: NeedsController.findAll() → NeedsService.findAll()
   ↓
5. TypeORM: needRepository.find() → PostgreSQL
   ↓
6. Response: RawNeed[] formatında döner
   ↓
7. needsService: adaptNeed() ile Need formatına dönüştürür
   ↓
8. NeedsPage: Verileri lokasyon bazında gruplar
   ↓
9. UI: Gruplanmış verileri kartlar halinde gösterir
```

### 5.2. Track Sayfası Veri Akışı

```
1. Kullanıcı barkod girer ve "Takip Et" butonuna tıklar
   ↓
2. handleSearch() → trackingService.validateBarcode()
   ↓
3. Validasyon başarılı → trackingService.getTrackingHistory(barcode)
   ↓
4. apiClient.get('/track/:barcode') → Backend API
   ↓
5. Backend: TrackingController.trackByBarcode() → TrackingService.trackByBarcode()
   ↓
6. TypeORM: 
   - shipmentRepository.findOne({ barcode })
   - trackingLogRepository.find({ shipment_id })
   ↓
7. Response: { shipment, history } formatında döner
   ↓
8. trackingService: Backend formatını frontend formatına dönüştürür
   ↓
9. TrackPage: Verileri timeline formatında gösterir
```

---

## 6. Güvenlik ve Performans

### 6.1. Güvenlik

- **Public Endpoints**: Her iki sayfa da public endpoint'ler kullanır (authentication gerekmez)
- **Input Validation**: Barkod format validasyonu
- **Error Handling**: Hassas bilgilerin hata mesajlarında gösterilmemesi
- **SQL Injection**: TypeORM ile parametreli sorgular

### 6.2. Performans

- **React Query Caching**: Veriler cache'lenir, gereksiz API çağrıları önlenir
- **Lazy Loading**: Track sayfası sadece arama yapıldığında veri çeker
- **Pagination**: Needs sayfası için pagination desteği (gelecekte kullanılabilir)
- **Debouncing**: Arama için debounce kullanılabilir (şu an implement edilmemiş)

---

## 7. Test Senaryoları

### 7.1. Needs Sayfası

- ✅ Tüm ihtiyaçların listelenmesi
- ✅ Aciliyet filtresinin çalışması
- ✅ Arama fonksiyonunun çalışması
- ✅ Otomatik yenileme (30 saniye)
- ✅ Manuel yenileme butonu
- ✅ Boş durum gösterimi
- ✅ Hata durumu yönetimi

### 7.2. Track Sayfası

- ✅ Geçerli barkod ile arama
- ✅ Geçersiz barkod formatı validasyonu
- ✅ Bulunamayan barkod için hata mesajı
- ✅ Timeline görünümü
- ✅ URL parametresinden barkod okuma
- ✅ Enter tuşu ile arama

---

## 8. Gelecek Geliştirmeler

### 8.1. Needs Sayfası

- [ ] Pagination implementasyonu
- [ ] Gelişmiş filtreleme (tarih aralığı, kategori)
- [ ] Export özelliği (PDF, Excel)
- [ ] Harita görünümü (lokasyonların haritada gösterilmesi)
- [ ] Bildirim sistemi (kritik ihtiyaçlar için)

### 8.2. Track Sayfası

- [ ] QR kod okuma desteği
- [ ] Blockchain transaction hash görüntüleme
- [ ] Paylaşım özelliği (sosyal medya)
- [ ] E-posta/SMS bildirimleri
- [ ] Tahmini teslimat süresi hesaplama

---

## 9. Sonuç

Needs ve Track sayfaları, BlokDeprem projesinin kritik bileşenleridir. Her iki sayfa da:

- ✅ Modern web teknolojileri kullanılarak geliştirilmiştir
- ✅ Type-safe kod yapısı ile güvenli ve bakımı kolaydır
- ✅ Kullanıcı dostu arayüz ile erişilebilirdir
- ✅ Responsive tasarım ile tüm cihazlarda çalışır
- ✅ Gerçek zamanlı veri güncellemeleri destekler

Bu sayfalar, deprem yardım operasyonlarında şeffaflık ve takip sağlayarak, yardım süreçlerinin daha etkili yönetilmesine katkıda bulunmaktadır.

---

## 10. Ekler

### 10.1. Dosya Yapısı

```
frontend/src/
├── pages/
│   └── public/
│       ├── NeedsPage/
│       │   ├── NeedsPage.tsx
│       │   └── index.ts
│       └── TrackPage/
│           ├── TrackPage.tsx
│           └── index.ts
├── services/
│   ├── needsService.ts
│   └── trackingService.ts
└── constants/
    └── index.ts

backend/src/
├── modules/
│   ├── needs/
│   │   ├── needs.controller.ts
│   │   ├── needs.service.ts
│   │   └── needs.module.ts
│   └── tracking/
│       ├── tracking.controller.ts
│       ├── tracking.service.ts
│       └── tracking.module.ts
└── entities/
    ├── need.entity.ts
    ├── shipment.entity.ts
    └── tracking-log.entity.ts
```

### 10.2. Bağımlılıklar

**Frontend**:
- `react`: ^18.0.0
- `react-router-dom`: ^6.0.0
- `@tanstack/react-query`: ^5.0.0
- `axios`: ^1.0.0
- `tailwindcss`: ^3.0.0

**Backend**:
- `@nestjs/core`: ^10.0.0
- `@nestjs/typeorm`: ^10.0.0
- `typeorm`: ^0.3.0
- `pg`: ^8.0.0

---

**Rapor Tarihi**: 2024  
**Hazırlayan**: BlokDeprem Geliştirme Ekibi  
**Versiyon**: 1.0

