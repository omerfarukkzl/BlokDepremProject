# **6 Şubat 2023 Kahramanmaraş Depremleri Sonrası İnsani Yardım Dağıtım Verilerinin Analizi ve Makine Öğrenmesi Tabanlı Lojistik Modelleme Stratejileri**

6 Şubat 2023 tarihinde Türkiye'nin güneydoğusunda meydana gelen Pazarcık ($M\_w: 7.7$) ve Elbistan ($M\_w: 7.6$) merkezli depremler, sadece sismolojik birer olay değil, aynı zamanda modern tarihin en büyük ve en karmaşık afet lojistiği operasyonlarından birini tetikleyen katalizörler olmuştur. Yaklaşık 108.812 kilometrekarelik bir alanı ve 14 milyona yakın bir nüfusu doğrudan etkileyen bu afet süreci, 11 ilde (Kahramanmaraş, Hatay, Gaziantep, Malatya, Diyarbakır, Kilis, Şanlıurfa, Adıyaman, Osmaniye, Adana ve Elazığ) devasa bir yıkıma yol açmıştır.1 Afet sonrası müdahale aşamasında toplanan veriler, insani yardım malzemelerinin dağıtımı, nakdi desteklerin yönetimi ve barınma çözümlerinin koordinasyonu açısından makine öğrenmesi modelleri için eşsiz birer girdi parametresidir. Bu rapor, söz konusu deprem verilerini teknik bir bakış açısıyla analiz ederek, malzeme yardımının illere göre dağılımını makine öğrenmesi perspektifinden modellenebilir bir yapıya kavuşturmayı amaçlamaktadır.

## **Sismik Karakterizasyon ve Hasar Tahmini Verilerinin Lojistik Korelasyonu**

Makine öğrenmesi modellerinde "ihtiyaç tahmini" yapabilmek için öncelikle tetikleyici faktör olan sismik verilerin hasar verileriyle olan doğrusal olmayan ilişkisini kurmak gerekmektedir. 6 Şubat depremleri sırasında Pazarcık (4614) ve Narlı (4615) gibi istasyonlardan alınan ivme kayıtları, Spektral İvme (PSA) ve Spektral Hız (PSV) değerleri üzerinden binaların yapısal tepkisini belirlemiştir.1 Bu sismik parametreler, lojistik modellerde "bağımsız değişkenler" olarak tanımlanabilir; çünkü bir bölgedeki sismik ivme ne kadar yüksekse, yıkılan bağımsız bölüm sayısı ve dolayısıyla acil yardım (gıda, su, hijyen kitleri) ihtiyacı o ölçüde artmaktadır.  
Depremin ilk anından itibaren 37.984 binanın yıkıldığı raporlanmış, ilerleyen süreçte bu sayı ağır hasarlı yapılarla birlikte 311.000 binaya ve 872.000 bağımsız bölüme ulaşmıştır.1 Makine öğrenmesi algoritmaları için bu veriler, "target variable" (hedef değişken) olan malzeme miktarı ile doğrudan ilişkilidir. Örneğin, Hatay'da 12.920 binanın yıkılmış olması, bu ilin lojistik ağda en yüksek öncelikli düğüm (node) olarak atanmasına neden olmuştur.2

### **İl Bazlı Bina Hasarı ve Enkaz Yönetimi İstatistikleri**

Afet lojistiğinde malzemenin nereye sevk edileceğini belirleyen en kritik veri seti, Çevre, Şehircilik ve İklim Değişikliği Bakanlığı tarafından paylaşılan hasar tespit tablolarıdır. Bu tablolar, makine öğrenmesinde sınıflandırma (classification) ve regresyon (regression) problemleri için temel teşkil eder.

| İl | Yıkık Bina Sayısı | Acil Yıkılacak Bina | Ağır Hasarlı Bina | Orta Hasarlı Bina | Az Hasarlı / Hasarsız | Kaldırılan Enkaz (Adet) |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Hatay** | 13.889 | 9.041 | 56.214 | 13.006 | 257.403 | 51.974 |
| **Kahramanmaraş** | 7.490 | 4.436 | 35.721 | 6.040 | 181.459 | 29.326 |
| **Adıyaman** | 6.187 | 2.327 | 21.027 | 4.715 | 82.775 | 17.068 |
| **Malatya** | 5.651 | 1.841 | 36.369 | 2.520 | 119.157 | 27.979 |
| **Gaziantep** | 4.126 | 1.988 | 14.304 | 5.513 | 265.262 | 11.109 |
| **Osmaniye** | 702 | 531 | 9.167 | 1.074 | 122.840 | 8.009 |
| **Şanlıurfa** | 719 | 732 | 8.351 | 2.818 | 324.921 | 7.244 |
| **Kilis** | 457 | 151 | 1.926 | 488 | 32.335 | 1.769 |
| **Diyarbakır** | 44 | 59 | 5.491 | 2.783 | 183.712 | 4.120 |
| **Elazığ** | 58 | 44 | 10.671 | 300 | 23.646 | 9.074 |
| **Adana** | 38 | 41 | 3.330 | 4.087 | 358.645 | 517 |
| **Toplam** | **39.361** | **21.191** | **202.571** | **43.344** | **1.952.155** | **168.189** |

(Kaynak: Strateji ve Bütçe Başkanlığı (SBB) ve AFAD Verileri) 3  
Yukarıdaki veriler, bir makine öğrenmesi modelinde "label encoding" veya "normalization" işlemleri için girdi olarak kullanılabilir. Özellikle Hatay ve Kahramanmaraş'taki yıkım oranları arasındaki varyans, lojistik kaynakların bu iki ile neden asimetrik olarak dağıtıldığını açıklayan temel faktördür. Regresyon modellerinde yıkılan bina sayısı ile gönderilen çadır sayısı arasındaki korelasyonun $R^2$ değeri, yardımın ne kadar veri odaklı dağıtıldığını ölçmek için bir performans metriği olarak kullanılabilir.

## **İnsani Yardım Malzemelerinin Dağıtımı ve Lojistik Kapasite**

Deprem sonrası insani yardım faaliyetleri, temel olarak barınma (çadır, konteyner), beslenme (gıda kolileri, sıcak yemek) ve hijyen malzemelerinden oluşmaktadır. AFAD ve Kızılay'ın resmi raporlarına göre, ilk aşamada yaklaşık 450.000 çadırın kurulumu gerçekleştirilmiştir.5 Bu sayı, makine öğrenmesi modellerinde "supply" (arz) tarafını temsil eder.

### **Barınma ve Teknik Malzeme Yardımı Dağılımı**

Barınma yardımları zamanla çadırdan konteyner kentlere evrilmiştir. Bu geçiş, makine öğrenmesinde zaman serisi analizi (time series analysis) ile incelenebilir. 209 noktada kurulan konteyner kentler ve 26.071 konteynerde yaşayan 90.939 depremzedeye dair veriler, lojistik ağ optimizasyonunun başarısını göstermektedir.4

| Yardım Kalemi | Birim / Adet | Kapsam | Dağıtım Kaynağı |
| :---- | :---- | :---- | :---- |
| **Çadır** | 450.000 | 11 İl Genelinde | AFAD / Kızılay |
| **Konteyner** | 20.000+ (İlk Aşama) | 209 Nokta | AFAD / TOKİ |
| **Esen Kart** | 69.289 | Konteyner Kentler | AFAD / Kızılay |
| **Hane Başı Destek** | 1.979.000 Hane | 10.000 TL / Hane | AFAD |
| **Taşınma Yardımı** | 557.000 Hane | 15.000 TL / Hane | AFAD |

(Kaynak: SBB ve AFAD Durum Raporları) 5  
Bu veriler, makine öğrenmesinde "resource allocation" (kaynak tahsisi) problemlerini çözmek için kullanılabilir. Örneğin, bir ildeki hasar seviyesi ($D\_i$) ve nüfus ($P\_i$) verildiğinde, gereken çadır sayısı ($T\_i$) şu formülle tahmin edilebilir:

$$T\_i \= f(D\_i, P\_i) \= \\alpha D\_i \+ \\beta P\_i \+ \\gamma$$  
Burada $\\alpha$ ve $\\beta$ katsayıları, geçmiş deprem verilerinden (1999 Kocaeli veya 2011 Van depremleri) öğrenilen ağırlıklardır.7

## **Nakdi Yardımlar ve Dijitalleşen Yardım Takibi**

6 Şubat depremleri, yardımın sadece fiziksel malzeme değil, aynı zamanda dijital finansal araçlarla da dağıtıldığı bir dönüm noktasıdır. AFAD ve Kızılay iş birliğiyle dağıtılan "ESEN KART" uygulaması, 69.289 kullanıcıya ulaşmış ve toplamda 1 milyar 8 milyon TL'lik bir hacim yaratmıştır.6 Makine öğrenmesi modelleri için bu dijital işlem verileri, tüketim alışkanlıklarını analiz ederek bir sonraki ay hangi malzemenin (gıda mı, hijyen mi) daha çok talep edileceğini tahmin etmek (demand forecasting) için kullanılabilir.  
Ayrıca hane başı yapılan 10.000 TL'lik destek ödemeleri, 1 milyon 979 bin haneyi kapsayarak piyasaya ciddi bir likidite sağlamıştır.6 Bu veriler, makine öğrenmesinde "kentsel iyileşme indeksi" (urban recovery index) oluşturmak için birer özellik (feature) olarak sisteme dahil edilebilir.

## **Uluslararası Yardımlar ve OCHA Finansal İzleme**

Dünya çapında yapılan yardımların Türkiye'ye akışı, Birleşmiş Milletler OCHA (Office for the Coordination of Humanitarian Affairs) ve FTS (Financial Tracking Service) üzerinden takip edilmiştir. 2023 Türkiye Depremi Flaş Çağrısı kapsamında 2,16 milyar dolarlık bir fon girişi gerçekleşmiştir.8

### **Sektörel Yardım Dağılımı ve Finansal Akışlar**

Finansal veriler, hangi sektörün ne kadar "malzeme" desteği aldığını dolaylı olarak göstermektedir. Makine öğrenmesinde bu veriler, çok etiketli sınıflandırma (multi-label classification) problemlerinde kullanılabilir.

| Sektör | Alınan Fon (USD) | Temel Malzeme Grupları |
| :---- | :---- | :---- |
| **Gıda Güvenliği** | 44.430.750 | Gıda Kolileri, Bebek Maması |
| **Barınma ve NFI** | 36.804.548 | Konteyner, Yatak, Battaniye |
| **Sağlık** | 12.595.672 | İlaç, Tıbbi Cihaz, Sahra Hastanesi |
| **Eğitim** | 14.772.000 | Okul Gereçleri, Prefabrik Sınıflar |
| **Lojistik** | 24.120.000 | Yakıt, Depolama, Nakliye Araçları |

(Kaynak: OCHA FTS 2023\) 8  
Bu fonların illere dağılımı, genellikle sahadaki "Humanitarian Snapshot" raporları ile eşleştirilir. OCHA'nın Hatay, Adıyaman, Kahramanmaraş ve Malatya için hazırladığı anlık durum raporları, yardımın zaman içindeki değişimini (dynamic help distribution) analiz etmek için zaman damgalı (timestamped) veriler sunmaktadır.9

## **Demografik Veriler ve Nüfus Hareketliliğinin Lojistik Etkisi**

Bir ile ne kadar malzeme yardımı yapılacağını belirleyen en önemli parametrelerden biri, deprem sonrası o ilde kalan nüfustur. TÜİK'in 2023 yılı Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) sonuçları, deprem bölgesinde ciddi bir nüfus kaybı ve göç hareketliliği olduğunu göstermektedir.10

### **İl Bazlı Nüfus Azalışı ve Kaba Ölüm Hızları**

| İl | 2022 Nüfusu | 2023 Nüfusu | Nüfus Değişimi | Kaba Ölüm Hızı (Binde) |
| :---- | :---- | :---- | :---- | :---- |
| **Hatay** | 1.686.043 | 1.544.640 | \-141.403 | 17,1 |
| **Kahramanmaraş** | 1.177.436 | 1.116.618 | \-60.818 | 14,8 |
| **Malatya** | 812.580 | 742.725 | \-69.855 | \- |
| **Adıyaman** | 635.169 | 604.978 | \-30.191 | 18,0 |
| **Osmaniye** | 559.403 | 557.664 | \-1.739 | \- |

(Kaynak: TÜİK 2023 Verileri) 10  
Nüfusun azalması, malzeme yardımı modellerinde bir "düzeltme katsayısı" (correction factor) işlevi görür. Eğer bir ilde hasar çok yüksekse ancak nüfusun %10'u başka illere göç etmişse, gıda yardımı ihtiyacı bu oranda azalırken, lojistik maliyetler göç edilen illere (Mersin, Ankara, Antalya vb.) kaymaktadır. Makine öğrenmesi modellerinde "internal migration flow" (iç göç akışı) verisi, yardımın dinamik olarak yeniden yönlendirilmesi (rerouting) için kullanılmalıdır.

## **Makine Öğrenmesi Uygulamaları İçin Veri Mühendisliği Stratejileri**

Kullanıcının talep ettiği "yardım dağıtım veri seti"nin oluşturulması için birkaç farklı kaynaktan veri entegrasyonu yapılması gerekmektedir. Bu süreç, makine öğrenmesi boru hattının (pipeline) en kritik aşamasıdır.

### **Veri Toplama ve Temizleme (Scraping & Cleaning)**

Resmi verilerin bir kısmı PDF raporlarda (AFAD, SBB), bir kısmı ise interaktif dashboard'larda (OCHA, İBB) bulunmaktadır. GitHub üzerindeki earthquake-scraper gibi projeler, AFAD'ın olay kataloğunu çekmek için etkili araçlardır.13 Ancak malzeme yardımı verileri için "tabular data extraction" yöntemleri kullanılmalıdır.

1. **Öznitelik Seçimi (Feature Selection):** Modelin başarısı için $PSA$, yıkılan bina sayısı, nüfus yoğunluğu, yol çatlak skoru ve hane başı gelir gibi değişkenler bir araya getirilmelidir.1  
2. **Veri Normalizasyonu:** Farklı illerden gelen veriler (örneğin Hatay'daki yıkım ile Kilis'teki yıkım) arasındaki ölçek farkını gidermek için MinMaxScaler veya StandardScaler kullanılmalıdır.  
3. **Eksik Veri Tamamlama (Imputation):** Bazı illerdeki malzeme dağıtım rakamları eksik olabilir. Bu durumda, hasar benzerliği olan diğer illerden KNN (K-Nearest Neighbors) yöntemiyle veri tamamlama yapılabilir.16

### **Makine Öğrenmesi Algoritmalarının Uygulanması**

Malzeme yardımı tahmininde şu algoritmalar öne çıkmaktadır:

* **Random Forest & XGBoost:** Hasar seviyesi ve nüfus gibi yapılandırılmış veriler üzerinden "gereken gıda kolisi" veya "çadır sayısı" tahmini için en yüksek doğruluğu sağlayan modellerdir.  
* **DBSCAN Clustering:** Deprem bölgelerini hasar ve yardım ihtiyacı yoğunluğuna göre kümelemek (clustering) için kullanılır. Dogu ilmak'ın çalışması bu yöntemin AFAD ve Kandilli verileri üzerinde uygulanabilirliğini göstermiştir.17  
* **Convolutional Neural Networks (CNN):** Kaggle'da yer alan uydu görüntüleri ve drone fotoğrafları üzerinden otomatik hasar tespiti yaparak lojistik ihtiyacı önceden belirlemek için idealdir.15

## **Altyapı Hasarları ve Lojistik Darboğaz Analizi**

Yardım malzemelerinin illere ulaştırılmasındaki en büyük engel, karayollarındaki çatlaklar ve çökmelerdir. Kaggle'daki "Earthquake Road Crack Detection" veri seti, otonom sürüş ve lojistik rota optimizasyonu için kritik bir kaynaktır.15 Yolların "unfiltered" ve "filtered" görüntüleri üzerinden geliştirilen modeller, yardım tırlarının en güvenli ve hızlı rotadan hedefe ulaşmasını sağlar.  
Lojistik bir makine öğrenmesi modelinde, yolun durumunu belirleyen $M\_i$ katsayısı, malzemenin "varış zamanı" (Lead Time) üzerinde doğrudan etkilidir. Örneğin, Hatay'ın Antakya ilçesine ulaşımın kısıtlı olması, oradaki malzeme ihtiyacının (demand) birikmesine ve krizin derinleşmesine yol açmıştır.19

## **Kurumsal Şeffaflık ve Veri Erişilebilirliği Sorunları**

Araştırma materyalleri, veri setlerinin oluşturulmasındaki en büyük zorluğun "kamuya açık ve standartlaştırılmış" yardım verilerinin eksikliği olduğunu vurgulamaktadır. ACAPS ve Şeffaflık Derneği, insani ihtiyaçların miktarını belirlemede veri kısıtlılığının büyük bir engel teşkil ettiğini belirtmektedir.6 Kızılay'ın çadır satışı gibi operasyonel skandalların veri setlerinde "aykırı değer" (outlier) veya "bias" (yanlılık) yaratabileceği göz önünde bulundurulmalıdır.2  
Bu durum, makine öğrenmesi modellerinde "robust statistics" (dayanıklı istatistikler) kullanımını zorunlu kılar. Veri setindeki gürültüyü (noise) azaltmak için sivil toplum kuruluşlarının (TMMOB, İHD, Ahbap) paylaştığı saha gözlem raporları, resmi verileri doğrulamak (cross-validation) için kullanılmalıdır.2

## **Sonuç ve Gelecek Projeksiyonu**

6 Şubat 2023 depremleri sonrası oluşan devasa veri yığını, makine öğrenmesi yöntemleriyle işlendiğinde, gelecekteki olası afetlerde (örneğin beklenen İstanbul depremi) "akıllı lojistik yönetimi" için bir yol haritası sunmaktadır. İBB Açık Veri Portalı ve Kandilli Rasathanesi'nin anlık veri akışları, bu modellerin "real-time" (eş zamanlı) çalışmasına olanak sağlamaktadır.21  
Makine öğrenmesi modelleri için ideal bir yardım dağıtım veri seti; sismik ivme kayıtlarını, detaylı bina hasar istatistiklerini, güncel nüfus hareketlerini ve sektörel finansal akışları içermelidir. Bu verilerin entegrasyonu ile geliştirilecek olan "Afet Lojistiği Karar Destek Sistemi", malzemenin doğru zamanda, doğru miktarda ve doğru konuma ulaştırılmasını sağlayarak can kayıplarının ve ekonomik zararın minimize edilmesinde hayati rol oynayacaktır.  
Afet sonrası rehabilitasyon sürecinde, özellikle Hatay ve Kahramanmaraş gibi yüksek hasarlı bölgelere yapılan yardımların etkinliği, bu veri odaklı yaklaşımların ne kadar kritik olduğunu bir kez daha kanıtlamıştır. Gelecekte, uydu görüntüleri ve yapay zeka tabanlı talep tahmin modelleri, insani yardım operasyonlarının ayrılmaz birer parçası haline gelecektir.

#### **Alıntılanan çalışmalar**

1. 06 ŞUBAT 2023 PAZARCIK-ELBİSTAN KAHRAMANMARAŞ ... \- AFAD, erişim tarihi Aralık 21, 2025, [https://deprem.afad.gov.tr/assets/pdf/Kahramanmara%C5%9F%20Depremi%20%20Raporu\_02.06.2023.pdf](https://deprem.afad.gov.tr/assets/pdf/Kahramanmara%C5%9F%20Depremi%20%20Raporu_02.06.2023.pdf)  
2. 6 ŞUBAT 2023 KAHRAMANMARAŞ DEPREMLERİ RAPORU \- TMMOB, erişim tarihi Aralık 21, 2025, [https://www.tmmob.org.tr/sites/default/files/tmmob\_deprem\_raporu-part-1.pdf](https://www.tmmob.org.tr/sites/default/files/tmmob_deprem_raporu-part-1.pdf)  
3. KAHRAMANMARAŞ VE HATAY DEPREMLERİ YENİDEN İMAR VE ..., erişim tarihi Aralık 21, 2025, [https://www.sbb.gov.tr/wp-content/uploads/2024/02/Kahramanmaras-ve-Hatay-Depremleri-Yeniden-Imar-ve-Gelisme-Raporu-1.pdf](https://www.sbb.gov.tr/wp-content/uploads/2024/02/Kahramanmaras-ve-Hatay-Depremleri-Yeniden-Imar-ve-Gelisme-Raporu-1.pdf)  
4. TMMOB 6 ŞUBAT DEPREMLERİ 8\. AY DEĞERLENDİRME RAPORU YAYIMLANDI, erişim tarihi Aralık 21, 2025, [http://www.tmmob.org.tr/icerik/tmmob-6-subat-depremleri-8-ay-degerlendirme-raporu-yayimlandi](http://www.tmmob.org.tr/icerik/tmmob-6-subat-depremleri-8-ay-degerlendirme-raporu-yayimlandi)  
5. KAHRAMANMARAŞ DEPREMLERİ ASRIN FELAKETİ \- İletişim Başkanlığı, erişim tarihi Aralık 21, 2025, [https://www.iletisim.gov.tr/images/uploads/dosyalar/Asrin-Felaketi-TR.pdf](https://www.iletisim.gov.tr/images/uploads/dosyalar/Asrin-Felaketi-TR.pdf)  
6. 6 Şubat Deprem Raporu: Kurumlar, Usulsüzlükler ve Şeffaflık, erişim tarihi Aralık 21, 2025, [https://seffaflik.org/wp-content/uploads/2024/02/6-Subat-Deprem-Raporu-Kurumlar-Usulsuzlukler-ve-Seffaflik-1.pdf](https://seffaflik.org/wp-content/uploads/2024/02/6-Subat-Deprem-Raporu-Kurumlar-Usulsuzlukler-ve-Seffaflik-1.pdf)  
7. Turkey 6 February Disaster and Related Datas \- Kaggle, erişim tarihi Aralık 21, 2025, [https://www.kaggle.com/datasets/ardaorcun/turkey-6-february-disaster-and-related-datas](https://www.kaggle.com/datasets/ardaorcun/turkey-6-february-disaster-and-related-datas)  
8. 2023 Earthquake responses in Türkiye and Syria \- Financial Tracking Service \- OCHA, erişim tarihi Aralık 21, 2025, [https://fts.unocha.org/emergencies/954/flows/2023?order=flow\_property\_simple\_2\&sort=desc](https://fts.unocha.org/emergencies/954/flows/2023?order=flow_property_simple_2&sort=desc)  
9. Türkiye | ReliefWeb Response, erişim tarihi Aralık 21, 2025, [https://response.reliefweb.int/turkiye](https://response.reliefweb.int/turkiye)  
10. Depremin yıkım yarattığı 2023'te nüfus sadece binde 1 arttı | Deprem bölgesindeki illerin ve İstanbul'un nüfusu azaldı \- Medyascope, erişim tarihi Aralık 21, 2025, [https://medyascope.tv/2024/02/06/depremin-yikim-yarattigi-2023te-nufus-sadece-binde-1-artti-deprem-bolgesindeki-illerin-ve-istanbulun-nufusu-azaldi/](https://medyascope.tv/2024/02/06/depremin-yikim-yarattigi-2023te-nufus-sadece-binde-1-artti-deprem-bolgesindeki-illerin-ve-istanbulun-nufusu-azaldi/)  
11. Kaba ölüm hızı binde 6,2 oldu \- TÜİK \- Veri Portalı, erişim tarihi Aralık 21, 2025, [https://data.tuik.gov.tr/Bulten/Index?p=Olum-ve-Olum-Nedeni-Istatistikleri-2023-53709](https://data.tuik.gov.tr/Bulten/Index?p=Olum-ve-Olum-Nedeni-Istatistikleri-2023-53709)  
12. 6 Şubat Depremlerinden Şehirlerin Nüfusu Nasıl Etkilendi? \- Doğruluk Payı, erişim tarihi Aralık 21, 2025, [https://www.dogrulukpayi.com/bulten/6-subat-depremlerinden-sehirlerin-nufusu-nasil-etkilendi](https://www.dogrulukpayi.com/bulten/6-subat-depremlerinden-sehirlerin-nufusu-nasil-etkilendi)  
13. anilyavas/earthquake-scraper: The Earthquake Data Scraper is a Node.js application that scrapes the latest earthquake data from the Turkish Disaster and Emergency Management Authority (AFAD) website. The application provides a simple API endpoint to access the scraped data in JSON format. \- GitHub, erişim tarihi Aralık 21, 2025, [https://github.com/anilyavas/earthquake-scraper](https://github.com/anilyavas/earthquake-scraper)  
14. html-parser · GitHub Topics, erişim tarihi Aralık 21, 2025, [https://github.com/topics/html-parser?l=typescript\&o=asc\&s=updated](https://github.com/topics/html-parser?l=typescript&o=asc&s=updated)  
15. Earthquake Road Crack Detection \- Kaggle, erişim tarihi Aralık 21, 2025, [https://www.kaggle.com/c/earthquake-road-crack-detection/data](https://www.kaggle.com/c/earthquake-road-crack-detection/data)  
16. Formal Academic Template \- CORE, erişim tarihi Aralık 21, 2025, [https://files.core.ac.uk/download/pdf/195277862.pdf](https://files.core.ac.uk/download/pdf/195277862.pdf)  
17. kandilli · GitHub Topics, erişim tarihi Aralık 21, 2025, [https://github.com/topics/kandilli](https://github.com/topics/kandilli)  
18. Turkiye\_Earthquake\_2023 \- Kaggle, erişim tarihi Aralık 21, 2025, [https://www.kaggle.com/datasets/buraktaci/turkiye-earthquake-2023](https://www.kaggle.com/datasets/buraktaci/turkiye-earthquake-2023)  
19. THE TÜRKİYE EARTHQUAKE SEQUENCE OF FEBRUARY 2023 A LONGITUDINAL STUDY REPORT BY EEFIT \- UCL Discovery \- University College London, erişim tarihi Aralık 21, 2025, [https://discovery.ucl.ac.uk/id/eprint/10186995/1/2023TurkiyeEQ\_EEFIT\_Report\_f.pdf](https://discovery.ucl.ac.uk/id/eprint/10186995/1/2023TurkiyeEQ_EEFIT_Report_f.pdf)  
20. MARAŞ MERKEZLİ 6 ŞUBAT 2023 DEPREMLERİ İLE İLGİLİ ÖN GÖZLEM, TESPİT VE ÖNERİ RAPORU 25 MART 2023 \- İnsan Hakları Derneği, erişim tarihi Aralık 21, 2025, [https://www.ihd.org.tr/wp-content/uploads/2023/03/%C4%B0HD\_Maras\_Depremleri\_On\_Raporu.pdf](https://www.ihd.org.tr/wp-content/uploads/2023/03/%C4%B0HD_Maras_Depremleri_On_Raporu.pdf)  
21. İBB Açık Veri Portalı ile Deprem Dashboard'u | by Adem Ok | Medium, erişim tarihi Aralık 21, 2025, [https://medium.com/@adem.ok624/i%CC%87bb-a%C3%A7%C4%B1k-veri-portal%C4%B1-ile-deprem-dashboardu-a4439a43808a](https://medium.com/@adem.ok624/i%CC%87bb-a%C3%A7%C4%B1k-veri-portal%C4%B1-ile-deprem-dashboardu-a4439a43808a)