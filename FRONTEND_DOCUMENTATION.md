# BlokDeprem Frontend Projesi Dökümantasyonu

## Proje Genel Bakış

**BlokDeprem**, deprem sonrası yardım süreçlerini blockchain ve yapay zeka teknolojileri ile şeffaf, hızlı ve verimli hale getiren bir takip sistemidir. Frontend kısmı React 18 + TypeScript + Vite kullanılarak geliştirilmiştir.

## Teknoloji Yığını

- **Framework**: React 18
- **Build Tool**: Vite
- **Dil**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Zustand
- **Form Validation**: React Hook Form + Zod
- **UI Components**: Headless UI
- **HTTP Client**: Axios
- **Icons**: Heroicons

## Proje Yapısı

```
frontend/
├── public/                 # Statik dosyalar
├── src/
│   ├── components/         # Bileşenler
│   │   ├── ui/            # Temel UI bileşenleri
│   │   ├── forms/         # Form bileşenleri
│   │   └── layout/        # Layout bileşenleri
│   ├── pages/             # Sayfa bileşenleri
│   │   ├── public/        # Halka açık sayfalar
│   │   ├── official/      # Görevli sayfaları
│   │   └── admin/         # Yönetici sayfaları
│   ├── hooks/             # Özel React hook'leri
│   ├── services/          # API servisleri
│   ├── store/             # State management
│   ├── types/             # TypeScript tipleri
│   ├── utils/             # Yardımcı fonksiyonlar
│   ├── App.tsx            # Ana uygulama bileşeni
│   ├── main.tsx           # Uygulama giriş noktası
│   └── index.css          # Global stiller
├── dist/                  # Derlenmiş dosyalar
├── package.json           # Bağımlılıklar
├── tailwind.config.js     # Tailwind yapılandırması
├── postcss.config.js      # PostCSS yapılandırması
└── vite.config.ts         # Vite yapılandırması
```

## Sayfalar ve Bileşenler

### 1. **Public Pages (Halka Açık Sayfalar)**

#### LoginPage (/login)
- Görevli giriş sayfası
- Cüzdan adresi ile kimlik doğrulama
- Form validasyonu ve hata yönetimi

#### RegisterPage (/register)
- Görevli kayıt sayfası
- Ad, cüzdan adresi ve lokasyon bilgileri
- Form validasyonu ve hata yönetimi

#### NeedsPage (/needs)
- İhtiyaç listesi görüntüleme sayfası
- Lokasyon bazlı filtreleme
- İhtiyaç durumu görselleştirmesi
- Responsive tasarım

#### TrackPage (/track)
- Sevkiyat takip sayfası
- Barkod ile arama
- Detaylı takip zaman çizelgesi
- Sevkiyat durumu görselleştirmesi

### 2. **Official Pages (Görevli Sayfaları)**

#### OfficialDashboard (/)
- Görevli ana paneli
- İstatistik kartları
- Hızlı işlem butonları
- Son aktiviteler ve sevkiyatlar

#### ShipmentManagement (/shipments)
- Sevkiyat yönetimi sayfası
- Arama ve filtreleme
- Durum güncelleme
- Modal form ile yeni sevkiyat oluşturma

### 3. **Admin Pages (Yönetici Sayfaları)**

#### AdminDashboard (/admin)
- Yönetici paneli
- Sistem geneli istatistikler
- Görsel grafikler ve raporlar
- Aktivite takibi

## UI Bileşenleri

### 1. **Temel Bileşenler**

#### Button (/src/components/ui/Button.tsx)
- Çeşitli stiller (primary, secondary, success, danger, outline, ghost)
- Boyut seçenekleri (sm, md, lg)
- Full width desteği
- Tailwind CSS ile class-variance-authority

#### Input (/src/components/ui/Input.tsx)
- Label, error ve helper text desteği
- Form validasyonu entegrasyonu
- Responsive tasarım

#### Select (/src/components/ui/Select.tsx)
- Headless UI Listbox ile erişilebilir dropdown
- Arama ve klavye navigasyonu
- Multiple select desteği

#### Modal (/src/components/ui/Modal.tsx)
- Headless UI Dialog ile erişilebilir modal
- Boyut seçenekleri (sm, md, lg, xl)
- Smooth geçiş animasyonları

### 2. **Form Bileşenleri**

#### ShipmentForm (/src/components/forms/ShipmentForm.tsx)
- Dinamik ürün ekleme/çıkarma
- React Hook Form + Zod validasyonu
- Hata yönetimi ve loading durumları

## State Management

### AuthStore (/src/store/authStore.ts)
- Kullanıcı kimlik doğrulama durumu
- JWT token yönetimi
- LocalStorage ile persistenz
- Login, logout ve register fonksiyonları

## API Servisleri

### ApiService (/src/services/api.ts)
- Axios tabanlı HTTP client
- Request/Response interceptor'lar
- Token yönetimi
- Hata yönetimi
- Tüm backend endpoint'leri için fonksiyonlar

## TypeScript Tipleri

### Types (/src/types/index.ts)
- Kullanıcı, lokasyon, ihtiyaç, sevkiyat tipleri
- API request/response tipleri
- Form verisi tipleri

## Routing

### Router Yapısı
- React Router v6 ile yönlendirme
- Protected routes (kimlik doğrulama gerektiren)
- Public routes (herkese açık)
- Role-based routing (görevli/yönetici)

## Form Validasyon

### useFormValidation Hook (/src/hooks/useFormValidation.ts)
- React Hook Form + Zod entegrasyonu
- Type-safe form handling
- Real-time validasyon
- Hata yönetimi

## Responsive Tasarım

### Mobile-First Yaklaşım
- Tailwind CSS ile responsive tasarım
- Breakpoint'ler: sm (640px), md (768px), lg (1024px), xl (1280px)
- Mobil menü ve navigasyon
- Touch-friendly arayüz

## Özellikler

✅ **Tamamlanan:**
- React 18 + TypeScript + Vite altyapısı
- Tailwind CSS ile modern, responsive tasarım
- React Router v6 ile yönlendirme
- Zustand ile state management
- Headless UI ile erişilebilir bileşenler
- React Hook Form + Zod ile form validasyonu
- Axios ile API entegrasyonu
- JWT tabanlı kimlik doğrulama
- Protected routes ve role-based access
- Mobil uyumlu responsive tasarım

🔄 **Geliştirme Aşamasında:**
- Barkod tarama özelliği
- Real-time güncellemeler (WebSockets)
- Offline desteği
- PWA (Progressive Web App)

## Çalıştırma

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme modunda çalıştır
npm run dev

# Production build
npm run build
npm run preview
```

## Test Bilgileri

### Test Kullanıcısı
- **Cüzdan Adresi**: `0x1234567890abcdef1234567890abcdef12345678`
- **Ad**: `Test Görevli`
- **Lokasyon ID**: `1`

### Test Sevkiyatı
- **Barkod**: `BD123456789`

## Geliştirme Notları

- **Environment Variables**: Production ortamında API URL'i ve diğer ayarlar environment variable olarak tanımlanmalı
- **Error Handling**: Global error boundary ve error handling mekanizmaları eklenebilir
- **Performance**: Code splitting ve lazy loading ile performans optimizasyonu yapılabilir
- **Accessibility**: ARIA standartları ve WCAG yönergelerine uyumluluk artırılabilir
- **SEO**: Meta tag'ler ve OpenGraph özellikleri eklenebilir

Bu frontend sistemi, deprem yardım süreçlerini kullanıcı dostu bir arayüz ile yönetmek için gerekli tüm bileşenleri ve özellikleri sağlamaktadır.