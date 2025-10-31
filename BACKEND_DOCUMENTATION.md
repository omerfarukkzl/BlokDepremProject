# BlokDeprem Backend Projesi Dökümantasyonu

## Proje Genel Bakış

**BlokDeprem**, deprem sonrası yardım süreçlerini blockchain ve yapay zeka teknolojileri ile şeffaf, hızlı ve verimli hale getiren bir takip sistemidir. Backend kısmı NestJS framework'ü kullanılarak geliştirilmiştir.

## Teknoloji Yığını

- **Framework**: NestJS (Node.js)
- **Veritabanı**: PostgreSQL
- **ORM**: TypeORM
- **Kimlik Doğrulama**: JWT (JSON Web Token)
- **Blockchain**: Ethereum (Solidity)
- **Dil**: TypeScript

## Veritabanı Şeması

### 1. **locations** (Lokasyonlar)
```sql
- id: SERIAL PRIMARY KEY
- name: VARCHAR(255) NOT NULL
- latitude: DECIMAL
- longitude: DECIMAL
- created_at: TIMESTAMP
```

### 2. **officials** (Yetkili Personel)
```sql
- id: SERIAL PRIMARY KEY
- wallet_address: VARCHAR(255) UNIQUE NOT NULL
- name: VARCHAR(255)
- location_id: INTEGER (FK to locations.id)
- created_at: TIMESTAMP
```

### 3. **aid_items** (Yardım Malzemeleri)
```sql
- id: SERIAL PRIMARY KEY
- name: VARCHAR(255) UNIQUE NOT NULL
- category: VARCHAR(255)
```

### 4. **needs** (İhtiyaçlar)
```sql
- id: SERIAL PRIMARY KEY
- location_id: INTEGER (FK to locations.id)
- item_id: INTEGER (FK to aid_items.id)
- needed_quantity: INTEGER
- supplied_quantity: INTEGER DEFAULT 0
- priority: INTEGER
- updated_at: TIMESTAMP
```

### 5. **shipments** (Sevkiyatlar)
```sql
- id: SERIAL PRIMARY KEY
- barcode: VARCHAR(255) UNIQUE NOT NULL
- source_location_id: INTEGER (FK to locations.id)
- destination_location_id: INTEGER (FK to locations.id)
- created_by_official_id: INTEGER (FK to officials.id)
- status: VARCHAR(50) ('Registered', 'InTransit', 'Delivered')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 6. **shipment_details** (Sevkiyat Detayları)
```sql
- id: SERIAL PRIMARY KEY
- shipment_id: INTEGER (FK to shipments.id)
- item_id: INTEGER (FK to aid_items.id)
- quantity: INTEGER
```

### 7. **tracking_logs** (Takip Kayıtları)
```sql
- id: SERIAL PRIMARY KEY
- shipment_id: INTEGER (FK to shipments.id)
- status: VARCHAR(255)
- transaction_hash: VARCHAR(255) NOT NULL
- timestamp: TIMESTAMP
```

## API Endpoints

### 🔐 **Auth (Kimlik Doğrulama)**
- `POST /auth/register` - Yetkili personel kaydı
- `POST /auth/login` - Giriş yapma (JWT token döner)

### 📍 **Locations (Lokasyonlar)**
- `GET /locations` - Tüm lokasyonları listele
- `POST /locations` - Yeni lokasyon ekle

### 🎒 **Aid Items (Yardım Malzemeleri)**
- `GET /aid-items` - Tüm yardım malzemelerini listele
- `POST /aid-items` - Yeni yardım malzemesi ekle

### 📋 **Needs (İhtiyaçlar)**
- `GET /needs` - Tüm ihtiyaçları listele
- `GET /needs/:location_id` - Belirli lokasyonun ihtiyaçlarını listele
- `POST /needs` - Yeni ihtiyaç ekle (Auth gerekli)

### 📦 **Shipments (Sevkiyatlar)**
- `POST /shipments/create` - Yeni sevkiyat oluştur (Auth gerekli)
- `PUT /shipments/update-status` - Sevkiyat durumunu güncelle (Auth gerekli)

### 🔍 **Tracking (Takip)**
- `GET /track/:barcode` - Barkod ile sevkiyat takibi

### 🤖 **AI (Yapay Zeka)**
- `GET /ai/distribution-suggestions` - Dağıtım önerileri (Auth gerekli)

## Modül Yapısı

### 1. **Auth Module**
- JWT tabanlı kimlik doğrulama
- Wallet address ile giriş
- Yetkili personel kaydı

### 2. **Needs Module**
- Lokasyon bazlı ihtiyaç yönetimi
- Öncelik seviyesi belirleme
- Tedarik durumu takibi

### 3. **Shipments Module**
- Sevkiyat oluşturma ve yönetimi
- Barkod sistemi
- Durum güncellemeleri

### 4. **Tracking Module**
- Blockchain entegrasyonu
- Şeffaf takip sistemi
- Transaction hash kayıtları

### 5. **AI Module**
- Dağıtım optimizasyonu
- İhtiyaç analizi
- Öncelik belirleme

### 6. **Locations Module**
- Lokasyon yönetimi
- Koordinat sistemi

### 7. **Aid Items Module**
- Yardım malzemesi kategorileri
- Stok yönetimi

## Blockchain Entegrasyonu

### Smart Contract: BlokDepremTracker
```solidity
- addShipmentLog(): Sevkiyat durumu ekleme
- getShipmentHistory(): Takip geçmişi sorgulama
- onlyBackend modifier: Güvenlik kontrolü
```

## Güvenlik Özellikleri

- JWT token tabanlı kimlik doğrulama
- Wallet address ile güvenli giriş
- Backend-only blockchain işlemleri
- Input validation (class-validator)

## Veritabanı Bağlantısı

```typescript
TypeORM PostgreSQL Configuration:
- Host: localhost
- Port: 5432
- Database: blokdeprem
- Username: user
- Password: password
- Synchronize: true (development)
```

## Proje Yapısı

```
backend/
├── src/
│   ├── entities/          # Veritabanı modelleri
│   ├── modules/           # İş mantığı modülleri
│   │   ├── auth/         # Kimlik doğrulama
│   │   ├── needs/        # İhtiyaç yönetimi
│   │   ├── shipments/    # Sevkiyat yönetimi
│   │   ├── tracking/     # Takip sistemi
│   │   ├── ai/           # Yapay zeka
│   │   ├── locations/    # Lokasyon yönetimi
│   │   └── aid-items/    # Yardım malzemeleri
│   ├── app.module.ts     # Ana modül
│   └── main.ts           # Uygulama giriş noktası
├── dist/                 # Derlenmiş dosyalar
└── package.json          # Bağımlılıklar
```

## Özellikler

✅ **Tamamlanan:**
- NestJS backend altyapısı
- PostgreSQL veritabanı entegrasyonu
- JWT kimlik doğrulama sistemi
- RESTful API endpoints
- TypeORM entity modelleri
- Input validation
- Modüler yapı.

🔄 **Geliştirme Aşamasında:**
- Blockchain entegrasyonu
- AI modülü optimizasyonu
- Frontend entegrasyonu

## Çalıştırma

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme modunda çalıştır
npm run start:dev

# Production build
npm run build
npm run start:prod
```

## Veritabanı Sorgu Örnekleri

### Temel Sorgular
```sql
-- Tüm lokasyonları görme
SELECT * FROM locations;

-- İhtiyaçları lokasyon ile birlikte görme
SELECT l.name as location_name, ai.name as item_name, n.needed_quantity, n.supplied_quantity
FROM needs n
JOIN locations l ON n.location_id = l.id
JOIN aid_items ai ON n.item_id = ai.id;

-- Sevkiyat durumlarını görme
SELECT s.barcode, sl.name as source, dl.name as destination, s.status, s.created_at
FROM shipments s
JOIN locations sl ON s.source_location_id = sl.id
JOIN locations dl ON s.destination_location_id = dl.id;
```

### İstatistik Sorguları
```sql
-- Lokasyon bazlı ihtiyaç özeti
SELECT 
    l.name as location,
    COUNT(n.id) as total_needs,
    SUM(n.needed_quantity) as total_needed,
    SUM(n.supplied_quantity) as total_supplied
FROM locations l
LEFT JOIN needs n ON l.id = n.location_id
GROUP BY l.id, l.name;

-- Sevkiyat durum istatistikleri
SELECT 
    status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM shipments
GROUP BY status;
```

## Test Senaryoları

### 1. Yetkili Personel Kaydı
```bash
POST /auth/register
{
  "wallet_address": "0x1234567890abcdef",
  "name": "Ahmet Yılmaz",
  "location_id": 1
}
```

### 2. İhtiyaç Ekleme
```bash
POST /needs
Authorization: Bearer <jwt_token>
{
  "location_id": 1,
  "item_id": 1,
  "needed_quantity": 100,
  "priority": 1
}
```

### 3. Sevkiyat Oluşturma
```bash
POST /shipments/create
Authorization: Bearer <jwt_token>
{
  "source_location_id": 1,
  "destination_location_id": 2,
  "items": [
    {"item_id": 1, "quantity": 50},
    {"item_id": 2, "quantity": 25}
  ]
}
```

## Geliştirme Notları

- **Environment Variables**: Production ortamında veritabanı bilgileri environment variable olarak tanımlanmalı
- **Error Handling**: Global exception filter eklenebilir
- **Logging**: Winston veya benzeri logging kütüphanesi entegre edilebilir
- **Rate Limiting**: API rate limiting eklenebilir
- **CORS**: Frontend entegrasyonu için CORS ayarları yapılmalı

Bu backend sistemi, deprem yardım süreçlerini şeffaf ve verimli bir şekilde yönetmek için gerekli tüm API'leri ve veritabanı yapısını sağlamaktadır.
