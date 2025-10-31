Proje Adı: BlokDeprem: Blockchain ve Yapay Zekâ Destekli Deprem Yardımı Takip Sistemi 1


1. Proje Özeti ve Amacı

Bu projenin temel amacı, deprem sonrası yardım süreçlerini teknoloji kullanarak daha şeffaf, hızlı ve verimli hale getirmektir22. Proje; blockchain ile yardım malzemelerinin takibinde güvenilirlik ve şeffaflık 33, yapay zekâ ile ihtiyaç belirleme ve dağıtım optimizasyonu 44, web ve mobil platformlar üzerinden ise kullanıcı dostu bir arayüz sunmayı hedeflemektedir5555.


2. Sistem Aktörleri ve Kullanıcı Senaryoları

Görevli (Yetkili Personel/Gönüllü):
Senaryo 1: Sisteme Giriş: Kripto cüzdan adresi ile sisteme güvenli bir şekilde giriş yapar6. Eğer cüzdan kayıtlı değilse, sisteme kaydolur7.


Senaryo 2: Yardım Kabulü: Yardım merkezine gelen malzemeleri teslim alır, içeriğini (tür, miktar) sisteme girer ve her bir yardım kolisi için benzersiz bir barkod oluşturur8.


Senaryo 3: Sevkiyat Başlatma: Malzemelerin yola çıkışını, oluşturulan barkodu okutarak sisteme kaydeder9.


Senaryo 4: Yardım Teslimatı: Hedef yardım merkezine ulaşan malzemeleri barkod okutarak teslim alır ve işlemi tamamlar10.


Yardımsever (Bağışçı):
Senaryo 1: İhtiyaç Görüntüleme: Sisteme kayıt olmadan, anlık olarak lokasyon bazlı ihtiyaç listelerini görüntüler11.


Senaryo 2: Yardım Takibi: Kendisine "Görevli" tarafından verilen barkod numarası ile yaptığı yardımın hangi aşamada (teslim alındı, yolda, ulaştı vb.) olduğunu şeffaf bir şekilde takip eder12.


Sistem Yöneticisi (Admin):
Senaryo 1: Raporlama: Sisteme düşen tüm yardım hareketleri, lokasyon bazlı ihtiyaç ve teslimat durumları hakkında raporlar ve analizler alır13.



3. Sistem Mimarisi ve Akış Şeması

Uygulama, 4 ana bileşenden oluşacaktır:
Frontend (İstemci): Kullanıcıların (Görevli, Yardımsever) etkileşime girdiği web ve mobil uyumlu arayüz.
Backend (Sunucu - NestJS): İş mantığının, API'lerin ve veritabanı iletişiminin yönetildiği merkezi sistem14.


Veritabanı (PostgreSQL): Kullanıcı bilgileri, yardım malzemeleri, lokasyonlar gibi operasyonel verilerin tutulduğu ilişkisel veritabanı15.


Blockchain (Ethereum): Yardım malzemelerinin kritik statü değişikliklerinin (teslim alındı, yola çıktı, ulaştı) değiştirilemez ve şeffaf bir şekilde kaydedildiği dağıtık defter teknolojisi16.


Yapay Zekâ Modülü (Python): İhtiyaçları optimize etmek ve dağıtım önerileri sunmak için veritabanındaki verileri analiz eden modül171717.


Akış:
Frontend ↔️ Backend (REST API): Tüm veri alışverişi bu kanaldan yapılır.
Backend ↔️ PostgreSQL DB: Backend, tüm operasyonel verileri okur ve yazar.
Backend → Ethereum Smart Contract: Backend, bir yardımın durumu değiştiğinde (örn: yola çıktığında), bu işlemi Ethereum ağındaki akıllı kontrata kaydederek bir "transaction" oluşturur.
Backend ↔️ AI Module: Backend, analiz için verileri AI modülüne gönderir ve optimizasyon sonuçlarını alır.

4.
Teknoloji Yığını (Tech Stack) 18

Backend: NestJS Framework
Frontend: HTML, CSS, JavaScript, Bootstrap, JQuery (Mevcut) → React 18 + Vite + Tailwind CSS (Planlanan)
Veritabanı: PostgreSQL
API Mimarisi: RESTful API
Blockchain: Ethereum
Akıllı Kontrat Dili: Solidity
Yapay Zekâ & Veri Analizi: Python
AI Kütüphaneleri: Numpy, Pandas, Scikit-learn
Geliştirme Araçları: Visual Studio Code, Remix IDE (Solidity için), Anaconda Spyder
Test Veri Kaynağı: Kaggle

4.1. Frontend Modernizasyon Planı (React Tabanlı):
- Framework: React 18 + TypeScript
- Build Tool: Vite
- Styling: Tailwind CSS
- State Management: Zustand (basit) veya Redux Toolkit
- Routing: React Router v6
- Forms: React Hook Form + Zod
- HTTP Client: Axios veya Fetch API
- UI Components: Headless UI + Tailwind
- Icons: Heroicons
- Charts: Chart.js veya Recharts

5. Veritabanı Tasarımı (PostgreSQL Şeması)

Aşağıdaki tablolar ve ilişkiler oluşturulacaktır:
locations
id (SERIAL, PRIMARY KEY)
name (VARCHAR, NOT NULL) - Örn: "Hatay Antakya"
latitude (DECIMAL)
longitude (DECIMAL)
created_at (TIMESTAMP)
officials (Görevliler)
id (SERIAL, PRIMARY KEY)
wallet_address (VARCHAR, UNIQUE, NOT NULL)
name (VARCHAR)
location_id (INTEGER, FOREIGN KEY to locations.id)
created_at (TIMESTAMP)
aid_items (Yardım Malzemesi Türleri)
id (SERIAL, PRIMARY KEY)
name (VARCHAR, UNIQUE, NOT NULL) - Örn: "Bebek Bezi", "Su", "Battaniye"
category (VARCHAR)
needs (İhtiyaç Listeleri)
id (SERIAL, PRIMARY KEY)
location_id (INTEGER, FOREIGN KEY to locations.id)
item_id (INTEGER, FOREIGN KEY to aid_items.id)
needed_quantity (INTEGER)
supplied_quantity (INTEGER, DEFAULT 0)
priority (INTEGER) - AI tarafından belirlenebilir
updated_at (TIMESTAMP)
shipments (Sevkiyatlar)
id (SERIAL, PRIMARY KEY)
barcode (VARCHAR, UNIQUE, NOT NULL)
source_location_id (INTEGER, FOREIGN KEY to locations.id)
destination_location_id (INTEGER, FOREIGN KEY to locations.id)
created_by_official_id (INTEGER, FOREIGN KEY to officials.id)
status (VARCHAR) - Enum: 'Registered', 'InTransit', 'Delivered'
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
shipment_details (Sevkiyat İçerikleri)
id (SERIAL, PRIMARY KEY)
shipment_id (INTEGER, FOREIGN KEY to shipments.id)
item_id (INTEGER, FOREIGN KEY to aid_items.id)
quantity (INTEGER)
tracking_logs (Blockchain Kayıtları)
id (SERIAL, PRIMARY KEY)
shipment_id (INTEGER, FOREIGN KEY to shipments.id)
status (VARCHAR)
transaction_hash (VARCHAR, NOT NULL)
timestamp (TIMESTAMP)

6. API Uç Noktaları (Endpoints) - NestJS

Auth (Kimlik Doğrulama)
POST /api/auth/register (Body: { wallet_address, name, location_id })
POST /api/auth/login (Body: { wallet_address }) -> JWT Token döner.
Needs (İhtiyaçlar)
GET /api/needs -> Tüm ihtiyaçları listeler.
GET /api/needs/:location_id -> Belirli bir lokasyonun ihtiyaçlarını listeler.
POST /api/needs (Auth Gerekli) -> Yeni ihtiyaç ekler.
Shipments (Sevkiyatlar)
POST /api/shipments/create (Auth Gerekli, Body: { source_location_id, destination_location_id, items: [{item_id, quantity}] }) -> Yeni sevkiyat oluşturur, barkod ve blockchain transaction'ı başlatır.
PUT /api/shipments/update-status (Auth Gerekli, Body: { barcode, status }) -> Sevkiyat durumunu günceller (InTransit, Delivered), blockchain'e yeni log ekler.
Tracking (Takip)
GET /api/track/:barcode -> Barkod ile sevkiyatın tüm geçmişini (veritabanı ve blockchain logları) döner.
AI (Yapay Zekâ)
GET /api/ai/distribution-suggestions (Auth Gerekli) -> En uygun yardım dağıtım rotalarını ve önceliklerini döner.

7. Blockchain Akıllı Kontrat Tasarımı (Solidity)

Kontrat Adı: BlokDepremTracker
State Değişkenleri:
address public owner;
struct Log { string status; uint256 timestamp; string location; }
mapping(string => Log[]) public shipmentHistory; // barkod -> Log dizisi
Fonksiyonlar:
constructor(): Kontratı deploy eden kişiyi owner olarak atar.
function addShipmentLog(string memory _barcode, string memory _status, string memory _location) public onlyBackend: Sadece backend servisinin çağırabileceği, bir sevkiyata yeni bir durum (log) ekleyen fonksiyon.
function getShipmentHistory(string memory _barcode) public view returns (Log[] memory): Verilen barkodun tüm geçmişini döner.

8. Geliştirme Yol Haritası (Adım Adım)

Kurulum: PostgreSQL veritabanı ve tabloları oluştur. Gerekli geliştirme ortamlarını (Node.js, Python, Solidity/Remix) kur.
Backend (API) Geliştirme: NestJS projesini başlat. Veritabanı modellerini (entities) ve API endpoint'lerini (controllers, services) oluştur.
Blockchain Geliştirme: Solidity ile BlokDepremTracker akıllı kontratını yaz ve bir Ethereum test ağına (örn: Sepolia) deploy et.
Backend-Blockchain Entegrasyonu: Backend servisinden, yazılan akıllı kontrat fonksiyonlarını çağıran (ethers.js veya web3.js kütüphaneleriyle) entegrasyonu yap.
Frontend Geliştirme: HTML/CSS/JS kullanarak arayüz örneklerinde 19 belirtilen ekranları (İhtiyaç Listesi, Görevli Giriş, Takip Ekranı) geliştir.


Frontend-Backend Entegrasyonu: Geliştirilen arayüzleri, backend API'lerine bağla.
Yapay Zekâ Modülü: Python ve Scikit-learn kullanarak, veritabanından veri çeken ve dağıtım önerileri sunan bir script/modül geliştir. Bu modül için bir API endpoint'i oluştur.
Test ve Dağıtım: Uçtan uca testleri gerçekleştir ve projeyi bir sunucuya deploy et.
Bu dökümantasyon, AI agent'ların projenin her bir katmanını anlamasını ve geliştirmesini sağlayacak net bir yol haritası sunmaktadır.
