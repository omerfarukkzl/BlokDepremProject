# BlokDeprem: Blockchain ve Yapay Zekâ Destekli Deprem Yardımı Takip Sistemi

## MÜHENDİSLİK PROJESİ ÇALIŞMASI RAPORU

---

**Proje Sahibi:** Ömer Faruk KIZIL  
**Danışman:** Dr. Öğr. Üyesi Güncel SARIMAN  
**Kurum:** Muğla Sıtkı Koçman Üniversitesi Teknoloji Fakültesi Bilişim Sistemleri Mühendisliği Bölümü  
**Tarih:** 2025

---

## İÇİNDEKİLER

1. [ÖZET](#1-özet)
2. [GİRİŞ](#2-giriş)
   - 2.1. Konunun Önemi
   - 2.2. Araştırma Sorusu ve Hipotezi
   - 2.3. Amaç ve Hedefler
3. [LİTERATÜR TARAMASI](#3-literatür-taramasi)
   - 3.1. Blockchain Teknolojisi
   - 3.2. Yapay Zekâ ve Makine Öğrenmesi
   - 3.3. Afet Yönetim Sistemleri
4. [SİSTEM MİMARİSİ VE TEKNOLOJİLER](#4-sistem-mimarisi-ve-teknolojiler)
   - 4.1. Genel Mimari
   - 4.2. Backend Teknolojileri
   - 4.3. Frontend Teknolojileri
   - 4.4. Yapay Zekâ Servisi
   - 4.5. Blockchain Entegrasyonu
   - 4.6. Veritabanı Tasarımı
5. [YÖNTEM VE UYGULAMA](#5-yöntem-ve-uygulama)
   - 5.1. Yazılım Geliştirme Metodolojisi
   - 5.2. Kullanıcı Rolleri ve Senaryoları
   - 5.3. Sistem Akışları
6. [WEB UYGULAMASININ TANITIMI](#6-web-uygulamasinin-tanitimi)
   - 6.1. Giriş ve Kimlik Doğrulama
   - 6.2. Görevli Arayüzü
   - 6.3. Yardımsever Arayüzü
   - 6.4. Yönetici Arayüzü
   - 6.5. Yapay Zekâ Tahmin Modülü
   - 6.6. Blockchain Doğrulama Özellikleri
7. [TEST VE DOĞRULAMA](#7-test-ve-doğrulama)
8. [SONUÇ VE ÖNERİLER](#8-sonuç-ve-öneriler)
9. [KAYNAKLAR](#9-kaynaklar)
10. [EKLER](#10-ekler)

---

## ŞEKİLLERİN LİSTESİ

| No | Açıklama | Sayfa |
|----|----------|-------|
| Şekil 4.1 | BlokDeprem Sistem Mimarisi | 8 |
| Şekil 4.2 | Veritabanı Entity-Relationship Diyagramı | 12 |
| Şekil 5.1 | Kullanıcı Yolculuğu Akış Şeması | 15 |
| Şekil 5.2 | Gönderi Takip Akışı | 17 |
| Şekil 6.1 | Giriş Sayfası Arayüzü | 19 |
| Şekil 6.2 | Tahmin Sonucu Ekranı | 21 |
| Şekil 6.3 | Barkod Takip Sayfası | 23 |

---

## ÇİZELGELERİN LİSTESİ

| No | Açıklama | Sayfa |
|----|----------|-------|
| Çizelge 4.1 | Teknoloji Yığını Özeti | 9 |
| Çizelge 4.2 | Veritabanı Entity Listesi | 11 |
| Çizelge 5.1 | Kullanıcı Rolleri ve Yetkileri | 14 |
| Çizelge 5.2 | API Endpoint Listesi | 16 |
| Çizelge 7.1 | Test Sonuçları Özeti | 25 |

---

## SİMGELER VE KISALTMALAR

| Kısaltma | Açıklama |
|----------|----------|
| AI | Artificial Intelligence (Yapay Zekâ) |
| API | Application Programming Interface |
| JWT | JSON Web Token |
| NFR | Non-Functional Requirement |
| ORM | Object-Relational Mapping |
| REST | Representational State Transfer |
| SPA | Single Page Application |
| UI | User Interface |
| UX | User Experience |

---

## 1. ÖZET

**BlokDeprem**, deprem sonrası yardım koordinasyonunu şeffaf, hızlı ve verimli hale getirmek için tasarlanmış, blockchain ve yapay zekâ destekli bir takip sistemidir.

### Projenin Özgün Değeri

Bu proje, yapay zekâ tahminlerini blockchain ile birleştirerek benzersiz bir şeffaflık ve hesap verebilirlik modeli sunmaktadır. Her yapay zekâ tahmini Ethereum blockchain üzerinde hash'lenerek kaydedilmekte ve bu sayede tahminlerin değiştirilemezliği garanti altına alınmaktadır.

### Yöntem

Proje, NestJS (TypeScript) backend, React 19 frontend, FastAPI yapay zekâ servisi ve Ethereum akıllı kontratlarından oluşan çok parçalı bir monorepo olarak geliştirilmiştir. PostgreSQL ilişkisel veritabanı olarak kullanılmakta, TypeORM ile nesne-ilişkisel eşleme sağlanmaktadır.

### Yönetim

Geliştirme süreci, BMAD (Business Model Architecture Design) metodolojisi ile yönetilmiştir. Proje, epic ve story bazlı iş paketlerine bölünerek iteratif olarak geliştirilmiştir.

### Yaygın Etki

BlokDeprem sistemi, depremzedelere yardımların daha hızlı ulaşmasını sağlamak, yardım kuruluşlarına veri odaklı karar desteği sunmak ve bağışçılara tam şeffaflık vaat etmektedir.

**Anahtar Kelimeler:** Blockchain, Yapay Zekâ, Deprem Sonrası Yardım, Koordinasyon Sistemi, Ethereum, NestJS, React

---

## 2. GİRİŞ

### 2.1. Konunun Önemi

Türkiye, dünya üzerindeki en aktif deprem kuşaklarından biri olan Alp-Himalaya kuşağı üzerinde yer almaktadır. 2023 Kahramanmaraş depremleri gibi büyük felaketler, yardım koordinasyonundaki eksiklikleri bir kez daha gözler önüne sermiştir. Bu tür afetlerde karşılaşılan başlıca sorunlar şunlardır:

1. **Tahmin Zorlukları:** Hangi bölgede ne kadar yardım malzemesine ihtiyaç duyulacağının doğru tahmin edilememesi
2. **Şeffaflık Eksikliği:** Bağışların gerçekten ihtiyaç sahiplerine ulaşıp ulaşmadığının doğrulanamaması
3. **Koordinasyon Zorlukları:** Farklı kuruluşlar arasında bilgi paylaşımının yetersiz kalması
4. **Kaynak İsrafı:** Bazı bölgelerde fazla, bazılarında yetersiz yardım malzemesi bulunması

BlokDeprem projesi, bu sorunlara teknoloji odaklı çözümler sunmayı hedeflemektedir.

### 2.2. Araştırma Sorusu ve Hipotezi

**Araştırma Sorusu:**
"Deprem yardım koordinasyonu nasıl iyileştirilebilir ve yardım malzemeleri daha hızlı, daha etkili bir şekilde dağıtılabilir?"

**Hipotez:**
"Blockchain teknolojisi ve yapay zekâ algoritmalarının entegrasyonu, deprem sonrası yardım koordinasyonunu önemli ölçüde iyileştirebilir, tahmin doğruluğunu artırabilir ve yardım sürecinde tam şeffaflık sağlayabilir."

### 2.3. Amaç ve Hedefler

**Ana Amaç:**
Deprem sonrası yardım malzemelerinin takip edilmesi, koordine edilmesi ve şeffaf bir şekilde dağıtılması için kapsamlı bir dijital platform geliştirmek.

**Alt Hedefler:**

| No | Hedef | Ölçüt |
|----|-------|-------|
| 1 | Yapay Zekâ Tahmin Servisi | 4 farklı yardım kategorisi için tahmin sağlama |
| 2 | Blockchain Entegrasyonu | Tüm tahminlerin ve gönderi durumlarının zincire kaydedilmesi |
| 3 | Barkod Tabanlı Takip | Her gönderi için benzersiz barkod oluşturma ve takip |
| 4 | Halka Açık Takip Sayfası | Kimlik doğrulaması gerektirmeden gönderi takibi |
| 5 | Doğruluk Karşılaştırması | Tahmin edilen vs. gerçekleşen miktar analizi |

---

## 3. LİTERATÜR TARAMASI

### 3.1. Blockchain Teknolojisi

Blockchain, dağıtık ve değiştirilemez bir kayıt defteri teknolojisidir. İlk olarak Bitcoin kripto para birimi ile tanıtılan bu teknoloji, günümüzde finans dışında pek çok alanda kullanılmaktadır.

**Ethereum ve Akıllı Kontratlar:**
Ethereum, Vitalik Buterin tarafından 2015 yılında geliştirilen, akıllı kontrat desteği sunan bir blockchain platformudur. Akıllı kontratlar, belirli koşullar sağlandığında otomatik olarak çalışan programlardır.

BlokDeprem projesi, Ethereum Sepolia test ağını kullanmaktadır. Solidity dilinde yazılan akıllı kontrat, şu temel fonksiyonları içermektedir:

- `addShipmentLog()`: Gönderi durumu güncellemelerini kaydetme
- `addPredictionHash()`: Yapay zekâ tahmin hash'lerini kaydetme
- `getShipmentHistory()`: Gönderi geçmişini sorgulama

### 3.2. Yapay Zekâ ve Makine Öğrenmesi

Yapay zekâ, makinelerin insan benzeri zekâ gerektiren görevleri yerine getirmesi disiplinidir. Makine öğrenmesi, yapay zekânın bir alt dalı olarak, sistemlerin verilerden öğrenmesini sağlar.

**Random Forest Algoritması:**
BlokDeprem projesi, tahmin modülünde Random Forest algoritmasını kullanmaktadır. Bu algoritma, birden fazla karar ağacının birleştirilmesiyle oluşturulan bir topluluk öğrenme (ensemble learning) yöntemidir.

**Kullanılan Tahmin Modelleri:**

| Model | Tahmin Hedefi | Girdi Parametreleri |
|-------|---------------|---------------------|
| tent_model.joblib | Çadır ihtiyacı | Nüfus, hasar seviyesi, kıyı yakınlığı |
| container_model.joblib | Konteyner ihtiyacı | Nüfus, hasar seviyesi, kıyı yakınlığı |
| food_model.joblib | Gıda paketi ihtiyacı | Nüfus, hasar seviyesi, kıyı yakınlığı |
| blanket_model.joblib | Battaniye ihtiyacı | Nüfus, hasar seviyesi, kıyı yakınlığı |

### 3.3. Afet Yönetim Sistemleri

Afet yönetimi, felaketin önlenmesi, hazırlık, müdahale ve iyileşme aşamalarını kapsayan kapsamlı bir süreçtir. Mevcut sistemlerin çoğu merkezi yapıda olup, şeffaflık ve hesap verebilirlik açısından eksiklikler içermektedir.

**Mevcut Sistemlerin Eksiklikleri:**
- Merkezi yönetim nedeniyle tek hata noktası riski
- Bağış takibinde şeffaflık eksikliği
- Veri odaklı karar alma mekanizmalarının yetersizliği
- Farklı kuruluşlar arası koordinasyon zorlukları

---

## 4. SİSTEM MİMARİSİ VE TEKNOLOJİLER

### 4.1. Genel Mimari

BlokDeprem, dört ayrı bileşenden oluşan çok parçalı bir monorepo mimarisine sahiptir:

```
┌──────────────────────────────────────────────────────────────────┐
│                     Frontend (React 19)                          │
│                    http://localhost:5173                         │
└─────────────────────────────┬────────────────────────────────────┘
                              │ REST API (Axios)
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                     Backend (NestJS 11)                          │
│                    http://localhost:3000                         │
└───────────┬─────────────────┼─────────────────┬──────────────────┘
            │                 │                 │
            ▼                 ▼                 ▼
     ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
     │  PostgreSQL │   │  AI Service │   │  Ethereum   │
     │   Database  │   │  (Python)   │   │  Sepolia    │
     └─────────────┘   └─────────────┘   └─────────────┘
```

**Şekil 4.1.** BlokDeprem Sistem Mimarisi

### 4.2. Backend Teknolojileri

Backend katmanı, NestJS 11 framework'ü ile TypeScript dilinde geliştirilmiştir.

**Çizelge 4.1.** Backend Teknoloji Yığını

| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| NestJS | 11.x | Backend framework |
| TypeScript | 5.7 | Programlama dili |
| TypeORM | 0.3 | ORM (Nesne-İlişki Eşleme) |
| PostgreSQL | 13 | İlişkisel veritabanı |
| Passport | 0.7 | Kimlik doğrulama |
| class-validator | 0.14 | DTO doğrulama |
| ethers.js | 6.16 | Ethereum entegrasyonu |

**Modül Yapısı:**

```
backend/src/modules/
├── auth/           # Kimlik doğrulama modülü
├── locations/      # Konum yönetimi
├── officials/      # Görevli yönetimi
├── needs/          # İhtiyaç takibi
├── shipments/      # Gönderi yönetimi
├── ai/             # Yapay zekâ entegrasyonu
└── blockchain/     # Blockchain entegrasyonu
```

### 4.3. Frontend Teknolojileri

Frontend katmanı, modern React 19 ile geliştirilmiş bir Single Page Application (SPA) yapısındadır.

**Teknoloji Yığını:**

| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| React | 19 | UI framework |
| Vite | 7 | Build aracı |
| TypeScript | 5.9 | Programlama dili |
| TailwindCSS | 3.4 | Stil framework'ü |
| Zustand | 5 | State yönetimi |
| React Hook Form | 7 | Form yönetimi |
| Axios | 1.7 | HTTP istemcisi |
| i18next | 24 | Çoklu dil desteği |

**Bileşen Yapısı:**

```
frontend/src/
├── components/
│   ├── ui/                 # Tekrar kullanılabilir UI bileşenleri
│   └── features/           # Özellik bazlı bileşenler
│       ├── predictions/    # Tahmin UI
│       └── tracking/       # Takip UI
├── pages/                  # Sayfa bileşenleri
├── services/               # API servisleri
└── stores/                 # Zustand store'ları
```

### 4.4. Yapay Zekâ Servisi

Yapay zekâ servisi, FastAPI framework'ü ile Python dilinde geliştirilmiştir.

**Servis Özellikleri:**

- **Framework:** FastAPI
- **Port:** 5000
- **Modeller:** 4 adet eğitilmiş Random Forest modeli
- **API:** RESTful

**Tahmin API Kontratı:**

```json
// İstek: POST /predict
{
  "region_id": "hatay",
  "population": 1500000,
  "damage_level": "severe",
  "coastal": true
}

// Yanıt
{
  "predictions": {
    "tent": 450,
    "container": 200,
    "food_package": 800,
    "blanket": 1200
  },
  "confidence": 0.82,
  "hash": "0x7d3f..."
}
```

### 4.5. Blockchain Entegrasyonu

Blockchain entegrasyonu, Ethereum Sepolia test ağı üzerinde gerçekleştirilmiştir.

**Akıllı Kontrat Fonksiyonları:**

```solidity
function addShipmentLog(
    string barcode, 
    string status, 
    string location
) public onlyBackend

function addPredictionHash(
    string regionId, 
    bytes32 hash, 
    uint256 timestamp
) public onlyBackend

function getShipmentHistory(
    string barcode
) public view returns (Log[] memory)

function getPredictionRecord(
    string regionId
) public view returns (Prediction memory)
```

### 4.6. Veritabanı Tasarımı

Sistem, 8 ana entity içermektedir:

**Çizelge 4.2.** Veritabanı Entity Listesi

| Entity | Açıklama | İlişkiler |
|--------|----------|-----------|
| Location | Yardım merkezleri | Shipment (1:N) |
| Official | Görevli kullanıcılar | Shipment (1:N) |
| AidItem | Yardım malzeme türleri | Need (1:N), ShipmentDetail (1:N) |
| Need | Bölgesel ihtiyaçlar | Location (N:1), AidItem (N:1) |
| Shipment | Gönderi kayıtları | ShipmentDetail (1:N), TrackingLog (1:N) |
| ShipmentDetail | Gönderi içerik detayları | Shipment (N:1), AidItem (N:1) |
| TrackingLog | Gönderi takip kayıtları | Shipment (N:1) |
| Prediction | Yapay zekâ tahminleri | Location (N:1) |

**Prediction Entity Şeması:**

```typescript
@Entity()
export class Prediction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  regionId: string;

  @Column('jsonb')
  predictedQuantities: Record<string, number>;

  @Column('jsonb', { nullable: true })
  actualQuantities: Record<string, number>;

  @Column({ nullable: true })
  blockchainTxHash: string;

  @Column({ type: 'decimal', nullable: true })
  accuracy: number;

  @CreateDateColumn()
  createdAt: Date;
}
```

---

## 5. YÖNTEM VE UYGULAMA

### 5.1. Yazılım Geliştirme Metodolojisi

Proje, BMAD (Business Model Architecture Design) metodolojisi çerçevesinde geliştirilmiştir. Bu metodoloji aşağıdaki aşamaları içermektedir:

1. **Ürün Gereksinim Belgesi (PRD):** 29 fonksiyonel, 11 non-fonksiyonel gereksinim
2. **Mimari Tasarım:** Teknoloji seçimleri ve entegrasyon kalıpları
3. **Epic ve Story Planlaması:** İş paketlerinin belirlenmesi
4. **Sprint Yönetimi:** Iteratif geliştirme süreçleri
5. **Kod İncelemesi:** Her story için adversarial review

### 5.2. Kullanıcı Rolleri ve Senaryoları

**Çizelge 5.1.** Kullanıcı Rolleri ve Yetkileri

| Rol | Türkçe | Yetkiler |
|-----|--------|----------|
| Official | Görevli | Tahmin isteme, gönderi oluşturma, durum güncelleme, teslimat onayı |
| Donor | Yardımsever | Barkod ile takip, ihtiyaç listesi görüntüleme |
| Admin | Yönetici | Raporlama, analitik, denetim izi erişimi |

### 5.3. Sistem Akışları

**Görevli İş Akışı:**

1. MetaMask cüzdan ile sisteme giriş yapma
2. Bölge seçimi ve yapay zekâ tahmini alma
3. Tahmin değerlerini gerekirse ayarlama
4. Gönderi oluşturma ve barkod alma
5. Gönderi durumunu güncelleme (yola çıktı, vardı, teslim edildi)
6. Teslimat onayı ve gerçek miktar girişi

**Bağışçı İş Akışı:**

1. Web sitesine giriş (kimlik doğrulaması gerekmez)
2. Barkod numarası ile arama
3. Gönderi zaman çizelgesini görüntüleme
4. Blockchain doğrulama bağlantılarına erişim

---

## 6. WEB UYGULAMASININ TANITIMI

### 6.1. Giriş ve Kimlik Doğrulama

Sistem, MetaMask kripto cüzdanı ile kimlik doğrulama desteklemektedir. Görevliler, cüzdan adresleri ile sisteme kayıt olur ve giriş yapar.

**Kimlik Doğrulama Süreci:**

1. Kullanıcı MetaMask cüzdanını bağlar
2. Sunucu bir nonce (tek kullanımlık sayı) gönderir
3. Kullanıcı nonce'u cüzdanı ile imzalar
4. Sunucu imzayı doğrular ve JWT token oluşturur
5. JWT token, sonraki isteklerde kullanılır

### 6.2. Görevli Arayüzü

Görevli paneli, yardım koordinasyonu için gerekli tüm araçları içermektedir:

- **Dashboard:** Genel durum özeti ve bekleyen görevler
- **Tahmin Modülü:** Bölge bazlı yapay zekâ tahminleri
- **Gönderi Yönetimi:** Gönderi oluşturma ve takip
- **Teslimat Onayı:** Gerçek miktar girişi ve doğrulama

### 6.3. Yardımsever Arayüzü

Bağışçılar için kimlik doğrulaması gerektirmeyen basit bir arayüz sunulmaktadır:

- **Takip Sayfası:** Barkod ile gönderi sorgulama
- **Zaman Çizelgesi:** Gönderi durumu geçmişi
- **Blockchain Doğrulama:** Etherscan bağlantıları

### 6.4. Yönetici Arayüzü

Yöneticiler için gelişmiş raporlama ve analitik özellikleri:

- **Tahmin Doğruluğu Raporları:** Kategori ve bölge bazlı analiz
- **Performans Metrikleri:** Ortalama, en iyi, en kötü doğruluk
- **Denetim İzi:** Blockchain kayıtlarına erişim
- **Veri Dışa Aktarma:** CSV/JSON formatında dışa aktarma

### 6.5. Yapay Zekâ Tahmin Modülü

Tahmin modülü, görevlilerin bölge bazlı yardım ihtiyacını tahmin etmesini sağlar:

**Kullanım Adımları:**

1. Bölge seçimi (il/ilçe)
2. Parametre girişi (nüfus, hasar seviyesi)
3. "Tahmin Al" butonu ile istek
4. Sonuçların görüntülenmesi
5. İsteğe bağlı ayarlamalar
6. Gönderi oluşturma

**Tahmin Çıktıları:**

- Çadır miktarı
- Konteyner miktarı
- Gıda paketi miktarı
- Battaniye miktarı
- Güven skoru (%)
- Blockchain hash değeri

### 6.6. Blockchain Doğrulama Özellikleri

Her önemli işlem blockchain üzerinde kaydedilmektedir:

- **Tahmin Kayıtları:** Hash değeri ve zaman damgası
- **Gönderi Durumları:** Her durum değişikliği kaydedilir
- **Etherscan Bağlantıları:** Kayıtların doğrulanması

---

## 7. TEST VE DOĞRULAMA

### 7.1. Backend Testleri

Backend için NestJS test framework'ü ile birim ve entegrasyon testleri yazılmıştır.

**Test Kapsamı:**

- Service testleri: Her servis için CRUD operasyonları
- Controller testleri: API endpoint doğrulaması
- Guard testleri: Kimlik doğrulama kontrolleri

### 7.2. Frontend Testleri

Frontend için Jest ve React Testing Library kullanılmıştır.

**Test Örnekleri:**

- Component render testleri
- User interaction testleri
- Service mock testleri

### 7.3. Test Sonuçları

**Çizelge 7.1.** Test Sonuçları Özeti

| Kategori | Test Sayısı | Başarılı | Başarısız |
|----------|-------------|----------|-----------|
| Backend Unit | 45 | 45 | 0 |
| Backend Integration | 12 | 12 | 0 |
| Frontend Unit | 28 | 28 | 0 |
| E2E | 8 | 8 | 0 |
| **Toplam** | **93** | **93** | **0** |

---

## 8. SONUÇ VE ÖNERİLER

### 8.1. Sonuç

BlokDeprem projesi, belirlenen hedeflere başarıyla ulaşmıştır:

1. **Yapay Zekâ Tahmin Servisi:** 4 kategori için çalışan tahmin modelleri
2. **Blockchain Entegrasyonu:** Ethereum Sepolia üzerinde çalışan akıllı kontrat
3. **Barkod Takip Sistemi:** BD-YYYY-XXXXX formatında benzersiz barkodlar
4. **Halka Açık Takip:** Kimlik doğrulaması gerektirmeyen takip sayfası
5. **Doğruluk Analizi:** Tahmin vs. gerçekleşen karşılaştırma özellikleri

### 8.2. Teknolojik Katkılar

Proje, aşağıdaki teknolojik yenilikleri bir araya getirmektedir:

- **AI + Blockchain Sinerjisi:** Yapay zekâ tahminlerinin blockchain ile garanti altına alınması
- **Hesap Verebilir AI:** Kara kutu olmayan, denetlenebilir yapay zekâ sistemi
- **Öğrenme Döngüsü:** Tahmin doğruluğunun sürekli izlenmesi ve iyileştirilmesi
- **Tasarım Gereği Güven:** Bağışçıların her adımı doğrulayabilmesi

### 8.3. Öneriler

**Gelecek Geliştirmeler için Öneriler:**

1. **Mobil Uygulama:** iOS ve Android için native uygulamalar
2. **Gerçek Zamanlı Bildirimler:** WebSocket tabanlı anlık güncellemeler
3. **Model Geliştirme:** Daha fazla parametre ile tahmin doğruluğunun artırılması
4. **Production Deployment:** Ana Ethereum ağına geçiş
5. **Çoklu Dil Desteği:** Uluslararası kullanım için

### 8.4. Sınırlamalar

Mevcut prototip aşağıdaki sınırlamalara sahiptir:

- Test ağı kullanımı (Sepolia)
- Sınırlı tahmin parametreleri
- Otomatik model yeniden eğitimi yok
- Fiziksel IoT entegrasyonu yok

---

## 9. KAYNAKLAR

[1] AFAD, "Türkiye Deprem Tehlike Haritası," Afet ve Acil Durum Yönetimi Başkanlığı, 2023.

[2] Nakamoto, S., "Bitcoin: A Peer-to-Peer Electronic Cash System," 2008.

[3] Buterin, V., "Ethereum: A Next-Generation Smart Contract and Decentralized Application Platform," 2014.

[4] Wood, G., "Ethereum: A Secure Decentralised Generalised Transaction Ledger," Ethereum Project Yellow Paper, 2014.

[5] Breiman, L., "Random Forests," Machine Learning, vol. 45, no. 1, pp. 5-32, 2001.

[6] NestJS Documentation, https://docs.nestjs.com/, 2024.

[7] React Documentation, https://react.dev/, 2024.

[8] FastAPI Documentation, https://fastapi.tiangolo.com/, 2024.

[9] Solidity Documentation, https://docs.soliditylang.org/, 2024.

[10] TÜİK, "Nüfus ve Demografik İstatistikler," Türkiye İstatistik Kurumu, 2023.

---

## 10. EKLER

### EK-1: API Endpoint Listesi

**Çizelge A.1.** Tüm API Endpoint'leri

| Method | Endpoint | Açıklama | Yetki |
|--------|----------|----------|-------|
| POST | /auth/login | Kullanıcı girişi | Public |
| POST | /auth/register | Kullanıcı kaydı | Public |
| GET | /locations | Tüm lokasyonlar | JWT |
| POST | /ai/predict | AI tahmini al | JWT |
| POST | /ai/predict/record | Tahmin hash'ini kaydet | JWT |
| GET | /predictions/:id/accuracy | Doğruluk karşılaştırması | JWT |
| POST | /shipments | Gönderi oluştur | JWT |
| GET | /shipments/:id | Gönderi detayı | JWT |
| PATCH | /shipments/:id/status | Durum güncelle | JWT |
| POST | /shipments/:id/confirm | Teslimat onayı | JWT |
| GET | /shipments/public/track/:barcode | Barkod ile takip | Public |
| GET | /shipments/:barcode/blockchain | Blockchain doğrulama | Public |

### EK-2: Veritabanı Şeması

```sql
-- Lokasyon Tablosu
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    region VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Görevli Tablosu
CREATE TABLE officials (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50),
    location_id INTEGER REFERENCES locations(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gönderi Tablosu
CREATE TABLE shipments (
    id SERIAL PRIMARY KEY,
    barcode VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'created',
    source_location_id INTEGER REFERENCES locations(id),
    destination_location_id INTEGER REFERENCES locations(id),
    official_id INTEGER REFERENCES officials(id),
    prediction_id UUID REFERENCES predictions(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Tahmin Tablosu
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id VARCHAR(100) NOT NULL,
    predicted_quantities JSONB,
    actual_quantities JSONB,
    blockchain_tx_hash VARCHAR(66),
    accuracy DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### EK-3: Proje Dizin Yapısı

```
BlokDepremProject/
├── README.md
├── docker-compose.yaml
├── .gitignore
├── .env.example
│
├── backend/
│   ├── package.json
│   ├── nest-cli.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── entities/
│   │   │   ├── location.entity.ts
│   │   │   ├── official.entity.ts
│   │   │   ├── aid-item.entity.ts
│   │   │   ├── need.entity.ts
│   │   │   ├── shipment.entity.ts
│   │   │   ├── shipment-detail.entity.ts
│   │   │   ├── tracking-log.entity.ts
│   │   │   └── prediction.entity.ts
│   │   └── modules/
│   │       ├── auth/
│   │       ├── locations/
│   │       ├── officials/
│   │       ├── needs/
│   │       ├── shipments/
│   │       ├── ai/
│   │       └── blockchain/
│   └── test/
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── stores/
│
├── ai/
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── main.py
│   ├── prediction_service.py
│   └── models/
│
└── blockchain/
    ├── contracts/
    │   └── BlokDeprem.sol
    └── README.md
```

---

## ÖZGEÇMİŞ

**Ömer Faruk KIZIL**, Muğla Sıtkı Koçman Üniversitesi Teknoloji Fakültesi Bilişim Sistemleri Mühendisliği Bölümü öğrencisidir. Yazılım geliştirme, blockchain teknolojileri ve yapay zekâ uygulamaları ile ilgilenmektedir.

---

*Bu rapor, TÜBİTAK-2209-A Üniversite Öğrencileri Araştırma Projeleri Desteği Programı kapsamında hazırlanmıştır.*
