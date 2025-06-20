# Bölüm 1: Giriş ve Kapsam

## 1.1. Platform Vizyonu

AI Quiz, her seviyeden öğrencinin ve profesyonelin bilgi düzeylerini ölçmelerine, eksiklerini tespit etmelerine ve öğrenme süreçlerini kişiye özel bir deneyimle optimize etmelerine olanak tanıyan, yapay zeka destekli, yenilikçi ve kullanıcı dostu bir eğitim teknolojisi çözümüdür. Platform, geleneksel sınav ve değerlendirme yöntemlerinin ötesine geçerek, öğrenmeyi daha etkileşimli, motive edici ve verimli hale getirmeyi amaçlar. Temel vizyonumuz, herkesin kendi öğrenme hızına ve tarzına uygun, esnek ve etkili bir değerlendirme aracına erişimini sağlayarak, yaşam boyu öğrenmeyi desteklemek ve bilgiye dayalı bir toplumun gelişimine katkıda bulunmaktır. Platform, kullanıcıların sadece mevcut bilgilerini test etmelerini değil, aynı zamanda yeni bilgiler edinmelerini ve öğrenme hedeflerine ulaşmalarını sağlayacak bir ekosistem sunar. Bu sürüm, tüm verileri kullanıcının tarayıcısında yerel olarak saklamaktadır.

## 1.2. Temel Çalışma Prensibi

Platform, iki ana sınav türü etrafında şekillenen bir çalışma prensibine sahiptir: Hızlı Sınav ve Kişiselleştirilmiş Sınav. Tüm veriler (dersler, sınav sonuçları, öğrenme hedefleri) kullanıcının tarayıcısındaki IndexedDB'de yerel olarak saklanır.

**Hızlı Sınav:** Kullanıcıların seçtikleri bir PDF dosyasından hızlıca bilgi seviyelerini test etmelerine olanak tanır. Kullanıcı PDF dosyasını yükler, isteğe bağlı olarak yapay zeka tarafından belirlenen alt konulardan seçim yapar ve sınav tercihlerini (soru sayısı, zorluk) belirleyerek sınava başlar. Bu modül, anlık merak giderme veya hızlı bir tekrar yapma ihtiyacını karşılar. Hızlı Sınav sonuçları, kullanıcının isteğiyle yerel veritabanına (IndexedDB) kaydedilebilir.

**Kişiselleştirilmiş Sınav:** Kullanıcıların yerel olarak saklanan verilerle (dersler, öğrenme hedefleri, geçmiş sınav sonuçları) çalıştığı modüldür. Kullanıcılar kendi derslerini oluşturabilir, bu derslere PDF içerikleri ekleyebilir (veya dersin zayıf öğrenme hedeflerinden doğrudan sınav oluşturabilir) ve öğrenme geçmişleri, performansları ve hedefleri doğrultusunda kendilerine özel sınavlar oluşturabilirler. Bu modül, yapay zeka algoritmaları kullanarak (yüklenen PDF'e veya seçilen konulara göre) sorular sunar ve öğrenme hedeflerinin durumunu (başarı/başarısızlık) güncelleyerek öğrenme sürecini yönlendirir. Kişiselleştirilmiş Sınav, sürekli öğrenmeyi ve derinlemesine bilgi edinmeyi hedefler.

Platformun temel çalışma prensibi, kullanıcıya esneklik sunarken, öğrenme verimliliğini en üst düzeye çıkarmak üzerine kuruludur. PDF içerik analizi, alt konu belirleme ve öğrenme hedefi takibi gibi özellikler, bu prensibi destekleyen temel yapı taşlarıdır.

## 1.3. Hedef Kullanıcı Kitlesi

AI Quiz, geniş bir kullanıcı yelpazesine hitap etmeyi amaçlamaktadır. Başlıca hedef kullanıcı kitleleri şunlardır:

- **Öğrenciler (K-12, Üniversite ve Lisansüstü):** Derslerine yardımcı olmak, sınavlara hazırlanmak, bilgi seviyelerini ölçmek ve eksiklerini gidermek isteyen her seviyeden öğrenciler.
- **Profesyoneller ve Yaşam Boyu Öğrenenler:** Mesleki gelişimlerini sürdürmek, yeni beceriler kazanmak veya ilgi duydukları alanlarda bilgilerini tazelemek isteyen yetişkinler.
- **Bireysel Çalışanlar:** Kendi öğrenme materyallerinden (PDF) özel sınavlar oluşturarak kendini test etmek ve geliştirmek isteyen herkes.

Platform, farklı öğrenme ihtiyaçlarına ve hedeflerine sahip tüm bu kullanıcı gruplarına değer katmayı ve onların öğrenme yolculuklarında güvenilir bir ortak olmayı hedefler.

# Bölüm 2: Temel Kavramlar ve Terminoloji

Bu bölümde, AI Quiz Platformu içerisinde sıkça kullanılacak olan temel kavramlar ve bu kavramlara atfedilen anlamlar detaylı bir şekilde açıklanmaktadır.

- **Kullanıcı (User):**
  - **Tanım:** Platforma erişen ve platformun sunduğu hizmetlerden (Hızlı Sınav, Kişiselleştirilmiş Sınav, ders oluşturma vb.) faydalanan bireydir.
  - **Detaylar:** Platform şu anda çok kullanıcılı bir sistemi veya sunucu tabanlı hesapları desteklememektedir. Tüm veriler (sınavlar, dersler, öğrenme hedefleri, ayarlar) kullanıcının tarayıcısında yerel olarak IndexedDB ve localStorage aracılığıyla saklanır. 'Kullanıcı' terimi, bu yerel deneyimi kullanan bireyi ifade eder.

- **Ders (Course / Çalışma Alanı):**
  - **Tanım:** Belirli bir konu veya öğrenme alanını organize etmek için kullanıcı tarafından oluşturulan bir yapıdır. Kişiselleştirilmiş sınavlar ve öğrenme hedefleri derslerle ilişkilendirilebilir.
  - **Detaylar:** Her dersin benzersiz bir kimliği (`id`), bir adı (`name`) ve oluşturulma tarihi (`createdAt`) vardır. Dersler, kullanıcının kişiselleştirilmiş öğrenme deneyimini yapılandırmasına yardımcı olur. Dersler yerel IndexedDB'de saklanır.

- **İçerik Öğesi (Content Item):**
  - **Tanım:** Platformda birincil içerik öğesi, kullanıcı tarafından yüklenen PDF dosyalarından çıkarılan metindir.
  - **Detaylar:** Bu metin, yapay zeka tarafından alt konuların belirlenmesi ve sınav sorularının üretilmesi için temel kaynak olarak kullanılır.

- **Konu/Alt Konu (Topic/Sub-topic):**
  - **Tanım:** Yapay zeka (Gemini API) tarafından, yüklenen PDF metinlerinden veya bir ders bağlamındaki zayıf öğrenme alanlarından belirlenen öğrenme birimleridir.
  - **Detaylar:** Sınav soruları (`QuizQuestion`) bir `subtopic` (alt konu adı) alanı içerebilir. Öğrenme Hedefleri (`LearningObjective`) de bu alt konu isimleriyle eşleşir. Bu, kullanıcının belirli alt konulardaki performansını izlemesine olanak tanır.

- **Öğrenme Hedefi (Learning Objective):**
  - **Tanım:** Bir kullanıcının belirli bir alt konu hakkındaki anlayışını ve başarısını temsil eden birimdir.
  - **Detaylar:** Kişiselleştirilmiş sınavlardaki alt konulara dayalı olarak otomatik olarak oluşturulur veya güncellenir. Her öğrenme hedefinin bir kimliği (`id`), adı (`name` - genellikle alt konu adı), durumu (`status`: `pending`, `success`, `failure`, `intermediate`), kaynak PDF adı (`sourcePdfName`), oluşturulma ve güncellenme zaman damgaları (`createdAt`, `updatedAt`) ve ilişkili olduğu ders bilgileri (`courseId`, `courseName`) bulunur. Öğrenme hedefleri, kullanıcının belirli konulardaki ilerlemesini izlemek için kullanılır ve yerel IndexedDB'de saklanır.

- **Sınav (Quiz):**
  - **Tanım:** Kullanıcının belirli bir PDF metni veya seçili konular hakkındaki bilgi düzeyini ölçmek amacıyla tasarlanmış bir dizi sorudan oluşan değerlendirme aracıdır.
  - **Detaylar:** Sınavlar, "Hızlı Sınav" veya "Kişiselleştirilmiş Sınav" modlarında oluşturulabilir. Sorular (`QuizQuestion`) çoktan seçmelidir. Tamamlanan sınavlar, sonuçlarıyla birlikte (`SavedQuizData` olarak) yerel IndexedDB'de saklanabilir. `SavedQuizData` içinde sorular, kullanıcı cevapları, skor, kaynak PDF adı, sınav türü, ders bilgisi ve zorluk gibi detaylar bulunur.

# Bölüm 3: Genel Kullanıcı Akışı ve Deneyimi

Bu bölüm, AI Quiz Platformu'ndaki temel kullanıcı etkileşimlerini ve bu etkileşimler sırasında yaşanacak deneyimleri ana hatlarıyla açıklamaktadır.

## 3.1. Ana Sayfa Erişimi ve Sınav Türü Seçimi

**Kullanıcı Akışı:**

1.  **Platforma Erişim:** Kullanıcı, web tarayıcısı aracılığıyla platforma erişir.
2.  **Karşılama Ekranı (Dashboard):** Kullanıcıyı, platformun genel tanıtımını yapan (`DashboardPage.tsx`) ve iki ana sınav türünü (Hızlı Sınav ve Kişiselleştirilmiş Sınav) butonlar aracılığıyla sunan bir ana sayfa karşılar.
3.  **Sınav Türü Seçimi:** Kullanıcı, ana sayfada sunulan iki seçenekten birini tercih eder:
    - **Hızlı Sınav:** "Hızlı Sınav Oluştur" butonuna tıklar.
    - **Kişiselleştirilmiş Sınav:** "Kişiselleştirilmiş Sınav Oluştur" butonuna tıklar.

**Kullanıcı Deneyimi Beklentileri:**

- **Netlik ve Basitlik:** Ana sayfa, anlaşılır ve kullanıcıyı yormayan bir tasarıma sahiptir.
- **Hızlı Erişim:** Kullanıcılar, istedikleri sınav türüne kolayca ulaşabilmelidir.

## 3.2. Hızlı Sınav Akışı

**Kullanıcı Akışı:**

1.  **Sınav Türü Seçimi:** Kullanıcı ana sayfadan (Dashboard) "Hızlı Sınav Oluştur" seçeneğini seçer. Uygulama `initial` durumuna geçer.
2.  **PDF Yükleme:** Kullanıcıdan bir PDF dosyası yüklemesi istenir (`PdfUploader.tsx`). PDF işlenirken `parsing_pdf` durumu gösterilir.
3.  **Alt Konu Analizi (Otomatik):** PDF metni çıkarıldıktan sonra, yapay zeka (Gemini API) metinden alt konuları belirler (`identifying_subtopics` durumu).
4.  **(Opsiyonel) Alt Konu Seçimi:** Eğer PDF'ten alt konular çıkarılırsa, kullanıcıya bu konuları seçme/kaldırma ekranı sunulur (`SubtopicSelector.tsx` / `selecting_subtopics` durumu). Kullanıcı seçim yapmadan da devam edebilir (tüm metinden sınav).
5.  **Sınav Tercihleri:** Kullanıcıya soru sayısı, zorluk seviyesi ve zamanlayıcı gibi sınav ayarlarını yapabileceği bir ekran sunulur (`QuizPreferences.tsx` / `preferences_setup` durumu).
6.  **Sınav Oluşturma (AI):** Kullanıcı tercihleri onayladıktan sonra, yapay zeka seçilen metin/konulara ve tercihlere göre sınav sorularını üretir (`generating_quiz` durumu).
7.  **Sınav Arayüzü:** Üretilen sorular kullanıcıya sunulur (`QuizView.tsx` / `quiz_active` durumu). Kullanıcı cevaplarını işaretler.
8.  **Sınavı Tamamlama/Bitirme:** Kullanıcı sınavı bitirir.
9.  **Sonuç Ekranı:** Kullanıcıya anında sınav sonucu (doğru/yanlış sayısı, başarı yüzdesi), her sorunun doğru cevabı ve kullanıcının verdiği cevap gösterilir (`QuizResult.tsx` / `quiz_completed` durumu).
10. **Sonuçları Kaydetme Seçeneği:** Kullanıcıya, sınav sonucunu yerel veritabanına (IndexedDB) kaydetme seçeneği sunulur.
11. **Tekrar Deneme veya Ana Sayfaya Dönüş:** Kullanıcı yeni bir sınav oluşturabilir veya ana sayfaya dönebilir.

**Kullanıcı Deneyimi Beklentileri:**

- **Hız:** Hızlıca PDF yükleyip sınava başlama.
- **Anında Geri Bildirim:** Sınav sonuçlarının hemen gösterilmesi.
- **Kullanıcı Dostu Arayüz:** Sınav ve sonuç arayüzlerinin net olması.

## 3.3. Kişiselleştirilmiş Sınav Akışı

**Kullanıcı Akışı:**

1.  **Sınav Türü Seçimi:** Kullanıcı ana sayfadan (Dashboard) "Kişiselleştirilmiş Sınav Oluştur" seçeneğini seçer.
2.  **Ders Seçimi/Oluşturma:** Kullanıcıdan mevcut bir dersi seçmesi veya yeni bir ders oluşturması istenir (`CourseSelectionForQuizStep.tsx` / `selecting_course_for_quiz` durumu).
3.  **Kişiselleştirilmiş Sınav Türü Seçimi:** Kullanıcı, seçilen ders için sınavın türünü belirler (`PersonalizedQuizTypeSelector.tsx` / `selecting_personalized_quiz_type` durumu):
    -   **Kapsamlı Sınav (Comprehensive):** Hem kullanıcının zayıf olduğu konuları hem de yeni eklenecek PDF'teki konuları hedefler. PDF yükleme gereklidir.
    -   **Yeni Konular Sınavı (New Topics):** Yüklenecek PDF'ten yeni konular öğrenilmesini ve test edilmesini sağlar. PDF yükleme gereklidir.
    -   **Zayıf Konular Sınavı (Weak Topics):** Seçilen dersin mevcut "başarısız", "orta seviye" veya "beklemede" durumundaki öğrenme hedeflerine odaklanır. PDF yükleme gerektirmez (eğer zayıf konu varsa).
4.  **İçerik Sağlama ve Alt Konu Belirleme:**
    -   Eğer "Kapsamlı" veya "Yeni Konular" seçildiyse, kullanıcı PDF yükler (`initial` durumu). PDF işlenir (`parsing_pdf`), alt konular belirlenir (`identifying_subtopics`). Belirlenen yeni alt konular, seçilen ders için otomatik olarak öğrenme hedeflerine (`LearningObjective`) dönüştürülür ve "pending" statüsüyle kaydedilir.
    -   Eğer "Zayıf Konular" seçildiyse ve dersin uygun öğrenme hedefleri varsa, bu hedefler alt konu olarak kullanılır.
    -   Kullanıcıya alt konuları seçme/kaldırma ekranı sunulabilir (`selecting_subtopics` durumu).
5.  **Sınav Tercihleri:** Kullanıcı soru sayısı, zorluk seviyesi ve zamanlayıcı ayarlarını yapar (`QuizPreferences.tsx` / `preferences_setup` durumu).
6.  **Sınav Oluşturma (AI):** Yapay zeka, seçilen ders, sınav türü, içerik/konular ve tercihlere göre sınav sorularını üretir (`generating_quiz` durumu).
7.  **Sınav Arayüzü:** Sorular sunulur (`QuizView.tsx` / `quiz_active` durumu).
8.  **Sınavı Tamamlama/Bitirme:** Kullanıcı sınavı bitirir.
9.  **Detaylı Sonuç ve Analiz Ekranı:** Sonuçlar gösterilir (`QuizResult.tsx` / `quiz_completed` durumu). Bu aşamada, sınavdaki alt konulara göre ilgili öğrenme hedeflerinin (`LearningObjective`) durumu (örn: `success`, `failure`, `intermediate`) güncellenir.
10. **İlerleme Takibi:** Sınav sonuçları otomatik olarak yerel veritabanına (IndexedDB) kaydedilir (`SavedQuizData`). Güncellenen öğrenme hedefleri de kaydedilir.
11. **Panel'e (Dashboard) Dönüş veya Yeni Aktivite:** Kullanıcı ana sayfaya dönebilir veya diğer özelliklere (Performans Analizi, Öğrenme Hedeflerim vb.) geçebilir.

**Kullanıcı Deneyimi Beklentileri:**

- **Kişiselleştirme:** Sınavların kullanıcının seçtiği ders, sınav türü ve performansına göre şekillenmesi.
- **Anlamlı Geri Bildirim:** Öğrenme hedeflerinin güncellenmesi yoluyla dolaylı geri bildirim.
- **İlerleme Takibi:** Kaydedilen sınavlar ve öğrenme hedefleri üzerinden ilerlemenin izlenebilmesi.

# Bölüm 4: Platform Yetenekleri ve Özellikler

Bu bölüm, AI Quiz Platformu'nun sunduğu temel yetenekleri ve bu yetenekleri destekleyen özellikleri detaylandırmaktadır.

## 4.1. Kullanıcı Yönetimi ve Erişim Kontrolü (Yerel)

- **Profil/Ayarlar Yönetimi (Yerel):**
  - **Özellik:** Kullanıcıların uygulama ayarlarını (tema, varsayılan zamanlayıcı ayarları vb.) değiştirebilmesi.
  - **Detay:** Bu ayarlar, tarayıcının yerel depolamasında (localStorage) `LOCAL_STORAGE_KEY_APP_SETTINGS` anahtarı altında `AppSettings` tipinde saklanır. `SettingsPage.tsx` bileşeni bu ayarları yönetir. Şu anda sunucu tabanlı kullanıcı kaydı veya profil yönetimi bulunmamaktadır.

## 4.2. Ana Sayfa ve Sınav Türleri

- **Dinamik Ana Sayfa (Dashboard):**
  - **Özellik:** Platforma giriş yapıldığında kullanıcıyı karşılayan ana sayfa (`DashboardPage.tsx`). Hızlı Sınav ve Kişiselleştirilmiş Sınav başlatma seçeneklerini sunar.
- **Hızlı Sınav Modülü Erişimi:**
  - **Özellik:** Ana sayfadan "Hızlı Sınav Oluştur" butonu ile doğrudan Hızlı Sınav akışını başlatma.
- **Kişiselleştirilmiş Sınav Modülü Erişimi:**
  - **Özellik:** Ana sayfadan "Kişiselleştirilmiş Sınav Oluştur" butonu ile Kişiselleştirilmiş Sınav akışını başlatma.

## 4.3. Hızlı Sınav Özellikleri

- **PDF Yükleme ile Sınav:**
  - **Özellik:** Kullanıcıların bir PDF dosyası yükleyerek bu dosyanın içeriğinden sınav oluşturabilmesi.
- **(Opsiyonel) Alt Konu Seçimi:**
  - **Özellik:** Yüklenen PDF'ten yapay zeka tarafından belirlenen alt konulardan istediklerini seçerek sınava odaklanabilme (`SubtopicSelector.tsx`).
- **Anında Sınav Oluşturma:**
  - **Özellik:** Seçilen PDF içeriği/alt konular ve kullanıcının tercihleri (soru sayısı, zorluk) doğrultusunda yapay zeka (Gemini API) tarafından anında sınav oluşturulması.
- **Kullanıcı Dostu Sınav Arayüzü:**
  - **Özellik:** Net, anlaşılır sınav ekranı (`QuizView.tsx`). Sorular, seçenekler, ilerleme çubuğu ve (etkinse) zamanlayıcıyı içerir.
- **Anında Sonuç ve Geri Bildirim:**
  - **Özellik:** Sınav biter bitmez doğru/yanlış sayısı, başarı yüzdesi ve her sorunun doğru cevabının gösterilmesi (`QuizResult.tsx`).
- **Sınav Sonuçlarının Kaydedilmesi (İsteğe Bağlı):**
  - **Özellik:** Kullanıcının, Hızlı Sınav sonuçlarını (`SavedQuizData`) yerel veritabanına (IndexedDB) kaydetme seçeneği.
- **Tekrar Deneme ve Farklı Konu Seçme:**
  - **Özellik:** Sınav sonucundan sonra yeni bir sınav başlatma veya ana sayfaya dönme.

## 4.4. Kişiselleştirilmiş Sınav Özellikleri

- **Ders Tabanlı Sınavlar:**
  - **Özellik:** Sınavların belirli bir dersle (`Course`) ilişkilendirilmesi. Kullanıcılar ders seçer veya yeni ders oluşturur (`CourseSelectionForQuizStep.tsx`).
- **Kişiselleştirilmiş Kullanıcı Paneli (Dashboard) ve Navigasyon:**
  - **Özellik:** Ana sayfa ve kenar çubuğu (`Sidebar.tsx`) aracılığıyla derslere, geçmiş sınavlara, öğrenme hedeflerine, performans analizine ve başarılara kolay erişim.
- **Yapay Zeka Destekli Sınav Oluşturma (Seçime Göre):**
  - **Özellik:** Seçilen ders, kişiselleştirilmiş sınav türü (`PersonalizedQuizTypeSelector.tsx` - Kapsamlı, Yeni Konular, Zayıf Konular), (gerekirse) yüklenen PDF içeriği ve seçilen alt konulara göre dinamik sınavlar oluşturulması.
- **Detaylı Performans Analizi ve Raporlama:**
  - **Özellik:** Kaydedilmiş sınavlar üzerinden genel performans, sınav türlerine göre başarı gibi istatistiklerin sunulduğu sayfa (`PerformanceAnalysisPage.tsx`).
- **Öğrenme Hedefleri ile İlerleme Takibi:**
  - **Özellik:** Sınavdaki alt konulara göre öğrenme hedeflerinin (`LearningObjective`) durumunun (pending, success, failure, intermediate) güncellenmesi ve bu hedeflerin `LearningObjectivesPage.tsx`'de takip edilebilmesi.
- **Başarılar (Gamification - Örnek Düzeyde):**
  - **Özellik:** Kullanıcının platformdaki aktivitelerine göre örnek başarıların (`Achievement`) listelendiği sayfa (`AchievementsPage.tsx`).

## 4.5. Ders (Çalışma Alanı) Yönetimi

- **Ders Oluşturma ve Listeleme:**
  - **Özellik:** Kullanıcıların kendi özel derslerini (`Course`) oluşturabilmesi ve listeleyebilmesi (`CoursesPage.tsx`). Dersler yerel IndexedDB'de saklanır.
  - **Detay:** Her dersin bir adı (`name`) ve oluşturulma tarihi (`createdAt`) bulunur.
- **Ders Silme:**
  - **Özellik:** Oluşturulan derslerin silinebilmesi. Silme işleminde, o dersle ilişkili sınavların ve öğrenme hedeflerinin ders bağlantısı kaldırılır.
- **Derslere Ait Öğrenme Hedeflerini Görüntüleme:**
  - **Özellik:** Belirli bir derse ait öğrenme hedeflerinin filtrelenerek `LearningObjectivesPage.tsx`'de görüntülenebilmesi.

## 4.6. İçerik Yönetimi ve İşleme (PDF Odaklı)

- **PDF Yükleme ve Metin Çıkarma:**
  - **Özellik:** Kullanıcıların PDF dosyalarını yükleyebilmesi (`PdfUploader.tsx`). `pdfjs-dist` kütüphanesi ile PDF'ten metin içeriği çıkarılır. Maksimum metin uzunluğu `appConfig.maxPdfTextLength` ile sınırlıdır.
- **Alt Konu Analizi ve Seçimi (AI Destekli):**
  - **Özellik:** Yüklenen PDF metninden, `geminiService.identifySubtopicsFromText` fonksiyonu aracılığıyla (Gemini API kullanarak) potansiyel alt konuların çıkarılması. `prompts/identify_conceptual_subtopics_prompt.txt` şablonu kullanılır.
  - **Detay:** Kullanıcıya, çıkarılan bu alt konulardan sınav için istediklerini seçme imkanı sunulur (`SubtopicSelector.tsx`). "Zayıf Konular" sınav türünde ise konular, dersin mevcut öğrenme hedeflerinden gelir.
- **Otomatik Öğrenme Hedefi Oluşturma (Kişiselleştirilmiş Sınavlarda):**
  - **Özellik:** "Yeni Konular" veya "Kapsamlı" kişiselleştirilmiş sınav türlerinde, PDF'ten belirlenen ve sınavda işlenen alt konular, ilgili ders için otomatik olarak "pending" (beklemede) statüsünde öğrenme hedeflerine (`LearningObjective`) dönüştürülür.

## 4.7. Yapay Zeka Destekli İçerik Üretimi (Gemini API)

- **Metinden/Konulardan Soru Üretme:**
  - **Özellik:** `geminiService.generateQuizFromText` fonksiyonu, sağlanan metin (PDF içeriği) veya seçilen alt konular, soru sayısı, seçenek sayısı ve zorluk seviyesi gibi parametreleri kullanarak Gemini API aracılığıyla çoktan seçmeli sınav soruları (`QuizQuestion`) üretir. `prompts/generate_quiz_prompt_template.txt` şablonu kullanılır.
  - **Detay:** Üretilen sorular JSON formatında alınır ve `QuizQuestion` tipine uygun olarak işlenir. Her sorunun bir `subtopic` alanı olabilir.

## 4.8. Öğrenme Hedefleri ve Takibi

- **Öğrenme Hedefi Oluşturma ve Güncelleme:**
  - **Özellik:** Kişiselleştirilmiş sınavlarda, sınavda yer alan alt konulara dayalı olarak öğrenme hedefleri (`LearningObjective`) oluşturulur veya mevcutlar güncellenir.
  - **Detay:** Bir alt konu ilk kez işlendiğinde yeni bir LO ("pending") oluşturulabilir. Sınav performansı (alt konudaki doğruluk oranı) LO'nun `status` alanını (`pending`, `success`, `failure`, `intermediate`) günceller. Tüm LO'lar IndexedDB'de saklanır.
- **Öğrenme Hedeflerini Listeleme ve Filtreleme:**
  - **Özellik:** Kullanıcılar tüm öğrenme hedeflerini veya belirli bir derse ait hedefleri `LearningObjectivesPage.tsx` üzerinden görüntüleyebilir.
- **"Zayıf Konular" Sınavı ile Hedefli Çalışma:**
  - **Özellik:** Kullanıcılar, "başarısız", "orta seviye" veya "beklemede" durumundaki öğrenme hedeflerine odaklanan "Zayıf Konular" türünde kişiselleştirilmiş sınavlar oluşturabilir.

## 4.9. Sınav Sistemi Detayları

- **Çoktan Seçmeli Soru Tipi Desteği:**
  - **Özellik:** Şu anda platform, yapay zeka tarafından üretilen tek doğru cevaplı çoktan seçmeli soruları desteklemektedir (`QuizQuestion` tipi). Seçenek sayısı `AppSettings` üzerinden yapılandırılabilir (varsayılan: 4).
- **Zamanlı Sınav Seçeneği:**
  - **Özellik:** Sınavlar için zamanlayıcı etkinleştirilebilir (`QuizView.tsx`). Soru başına süre `AppSettings` üzerinden yapılandırılabilir (varsayılan: 90 saniye).
- **Sınav İlerleme Göstergesi:**
  - **Özellik:** Sınav sırasında cevaplanan soru sayısı ve toplam soru sayısı gösterilir, bir ilerleme çubuğu ile görselleştirilir.
- **Sınav Sonuçlarını PDF Olarak İndirme:**
  - **Özellik:** `QuizView.tsx` içindeki "PDF İndir" butonu ile mevcut sınav soruları (cevaplar olmadan) bir PDF dosyası olarak indirilebilir. `jsPDF` kütüphanesi kullanılır. Türkçe karakterler için `NotoSans-Regular.ttf` fontu gömülmeye çalışılır, başarısız olursa Helvetica kullanılır.

## 4.10. Performans Değerlendirme ve Geri Bildirim

- **Otomatik Puanlama:**
  - **Özellik:** Çoktan seçmeli sorular anında ve otomatik olarak puanlanır.
- **Detaylı Sonuç Raporları:**
  - **Özellik:** Her sınav sonunda (`QuizResult.tsx`) kullanıcının verdiği cevaplar, doğru cevaplar ve genel başarı yüzdesi gösterilir.
  - **Özellik:** `PerformanceAnalysisPage.tsx`'de genel sınav istatistikleri, sınav türüne göre performans ve öğrenme hedefleri dağılımı gibi veriler sunulur.
- **Görselleştirilmiş Veriler:**
  - **Özellik:** `PerformanceAnalysisPage.tsx`'de sınav skorları zaman çizelgesi ve öğrenme hedefi durumları için pasta grafik benzeri bir gösterim bulunur.
- **Güçlü/Zayıf Yön Analizi (Öğrenme Hedefleri Üzerinden):**
  - **Özellik:** Öğrenme hedeflerinin (`LearningObjective`) `status` alanı (success, failure, intermediate), kullanıcının hangi konularda güçlü veya zayıf olduğunu yansıtır.

# Bölüm 5: Kullanıcı Deneyimi (UX/UI) ve Tasarım

AI Quiz Platformu, kullanıcıların öğrenme süreçlerini keyifli ve etkili bir şekilde yönetebilmeleri için kullanıcı odaklı bir deneyim sunar.

**Genel Tasarım İlkeleri:**

- **Kullanıcı Odaklılık:** Tasarım, hedef kullanıcıların ihtiyaçlarına göre şekillendirilmiştir.
- **Basitlik ve Anlaşılırlık:** Arayüzler net ve sezgiseldir.
- **Tutarlılık:** Platform genelinde tasarım öğeleri (renkler, tipografi, ikonlar) tutarlıdır. TailwindCSS ile stilize edilmiştir.
- **Erişilebilirlik (Accessibility):** Temel erişilebilirlik prensiplerine (örn: ARIA etiketleri, klavye navigasyonu) dikkat edilmiştir.
- **Görsel Çekicilik ve Modernlik:** Arayüz, modern ve profesyonel bir görünüme sahiptir.
- **Performans ve Hız:** İstemci tarafı performansına özen gösterilmiştir.
- **Mobil Uyumluluk (Responsive Design):** TailwindCSS sayesinde farklı ekran boyutlarına uyum sağlar.

**Kullanıcı Arayüzü (UI) Detayları:**

- **Renk Paleti ve Tipografi:** TailwindCSS yapılandırmasında (`tailwind.config`) tanımlanan `primary`, `secondary` ve diğer renk paletleri kullanılır. Okunabilir fontlar tercih edilir.
- **İkonografi:** Font Awesome ikonları kullanılır.
- **Navigasyon:** Ana gezinme `Sidebar.tsx` bileşeni ile sağlanır. Uygulama içi yönlendirme `useAppRouter.ts` hook'u ile state tabanlıdır.
- **Formlar ve Giriş Alanları:** Temiz ve kullanıcı dostu form elemanları kullanılır.
- **Butonlar ve Çağrı-Eylem (CTA) Öğeleri:** Belirgin ve eyleme yönlendirici butonlar kullanılır.
- **Bildirimler ve Uyarılar:** Hata mesajları (`ErrorMessage.tsx`) ve başarı bildirimleri (örn: Ayarlar kaydedildi) kullanılır.
- **Yükleme Durumları:** `LoadingSpinner.tsx` bileşeni ile yükleme durumları belirtilir.
- **Karanlık Mod (Dark Mode) Desteği:** `useAppSettings.ts` hook'u ile yönetilen ve `<html>` elementine `dark` sınıfı eklenerek TailwindCSS tarafından desteklenen açık/koyu tema seçeneği (`SettingsPage.tsx` üzerinden ayarlanabilir).
- **Hata Yönetimi:** `index.html` dosyasında genel JavaScript hata yakalayıcı ve React bileşenleri için `ErrorBoundary.tsx` bileşeni bulunur. Bu mekanizmalar, kullanıcılara kritik hatalar hakkında bilgi verir ve yeniden deneme/sayfa yenileme seçenekleri sunar.

**Ana Arayüz Bileşenleri:**

Platformun ana arayüzünü oluşturan temel React bileşenleri şunlardır:
`App.tsx`, `Sidebar.tsx`, `DashboardPage.tsx`, `QuizCreationLayout.tsx`, `PdfUploader.tsx`, `SubtopicSelector.tsx`, `QuizPreferences.tsx`, `CourseSelectionForQuizStep.tsx`, `PersonalizedQuizTypeSelector.tsx`, `QuizView.tsx`, `QuizResult.tsx`, `QuizListPage.tsx`, `CoursesPage.tsx`, `LearningObjectivesPage.tsx`, `PerformanceAnalysisPage.tsx`, `AchievementsPage.tsx`, `SettingsPage.tsx`, `EmptyState.tsx`, `LoadingSpinner.tsx`, `ErrorMessage.tsx`.

**State Yönetimi:**

Uygulama genelinde state yönetimi, React'in yerleşik `useState` ve `useEffect` hook'ları ile birlikte özel olarak geliştirilmiş hook'lar (`useAppRouter.ts`, `useAppSettings.ts`, `usePersistentData.ts`, `useQuizWorkflow.ts`) aracılığıyla sağlanır. Bu hook'lar, uygulamanın farklı bölümlerinin state'lerini ve iş mantığını modüler bir şekilde yönetir.

# Bölüm 6: Teknik Mimari ve Teknoloji Seçimleri

## 6.1. Genel Mimari Yaklaşımı

Platform, tamamen istemci tarafında (client-side) çalışan bir Tek Sayfa Uygulamasıdır (SPA). Ayrı bir backend sunucusu bulunmamaktadır.

**Temel Katmanlar (İstemci Tarafında):**

1.  **Sunum Katmanı (Frontend - UI/UX):** Kullanıcı arayüzünü ve kullanıcı deneyimini yönetir. React ve TypeScript ile geliştirilmiştir. TailwindCSS ile stilize edilmiştir.
2.  **Uygulama Mantığı Katmanı (Frontend - Business Logic):** İş mantığını, state yönetimini, yapay zeka API (Gemini) etkileşimlerini ve diğer temel platform fonksiyonlarını barındırır. Bu katman, özel React hook'ları (`useAppRouter`, `useQuizWorkflow`, `useAppSettings`, `usePersistentData`) ve servisler (`geminiService`, `dbService`, `configService`) aracılığıyla organize edilmiştir.
3.  **Veri Katmanı (Frontend - Local Storage):**
    -   **Kalıcı Veriler:** Kullanıcı tarafından oluşturulan dersler (`Course`), kaydedilen sınav sonuçları (`SavedQuizData`) ve öğrenme hedefleri (`LearningObjective`) tarayıcının IndexedDB veritabanında saklanır. Bu etkileşimler `dbService.ts` tarafından yönetilir.
    -   **Uygulama Ayarları:** Tema tercihleri, varsayılan zamanlayıcı ayarları gibi uygulama genelindeki ayarlar (`AppSettings`) tarayıcının localStorage'ında saklanır.
4.  **Yapay Zeka ve İşleme Katmanı (Harici Servis):** Google Gemini API (`@google/genai` kütüphanesi aracılığıyla) içerik analizi (alt konu belirleme) ve soru üretimi için kullanılır.

**İletişim Akışı:**

-   Kullanıcı, React bileşenlerinden oluşan arayüz ile etkileşime girer.
-   Etkileşimler, state hook'ları ve iş mantığı servisleri tarafından işlenir.
-   Veri depolama işlemleri (okuma/yazma) `dbService.ts` (IndexedDB için) veya localStorage (ayarlar için) üzerinden yapılır.
-   Yapay zeka gerektiren işlemler (alt konu belirleme, sınav üretme) `geminiService.ts` aracılığıyla Google Gemini API'ye istek gönderilerek gerçekleştirilir.

## 6.2. Kullanılan Teknoloji Yığını

-   **Temel Kütüphane:** React 19 (ESM modülleri aracılığıyla `esm.sh` üzerinden)
-   **Programlama Dili:** TypeScript
-   **Stil Kütüphanesi:** TailwindCSS 3 (CDN üzerinden)
-   **PDF İşleme:** `pdfjs-dist` (PDF metin çıkarma için, `esm.sh` üzerinden)
-   **PDF Oluşturma (Sınav İndirme):** `jspdf` (Sınav sorularını PDF olarak indirmek için, `esm.sh` üzerinden)
-   **Yapay Zeka:** `@google/genai` (Google Gemini API ile etkileşim için, `esm.sh` üzerinden)
-   **Yapılandırma Dosyası İşleme:** `js-yaml` (`appconfig.yaml` dosyasını okumak için, `esm.sh` üzerinden)
-   **İkonlar:** Font Awesome (CDN üzerinden)
-   **Veritabanı (Yerel):** Tarayıcı IndexedDB
-   **Ayarlar Depolama (Yerel):** Tarayıcı localStorage
-   **Geliştirme Ortamı:** Proje, `index.html` dosyası ve `index.tsx` (ES6 modülü) üzerine kuruludur. Bağımlılıklar `index.html` içindeki `importmap` ile yönetilir.

## 6.3. Frontend Mimarisi

-   **Ana Giriş Noktası:** `index.tsx`, `App.tsx` bileşenini DOM'a render eder.
-   **Ana Bileşen:** `App.tsx`, uygulamanın genel düzenini, state yönetimini (özel hook'lar aracılığıyla) ve bileşenler arası koordinasyonu sağlar.
-   **Dizin Yapısı:**
    -   `/components`: Yeniden kullanılabilir UI bileşenleri (örn: `PdfUploader.tsx`, `QuizView.tsx`, `Sidebar.tsx`).
        -   `/components/icons`: SVG ikon bileşenleri.
    -   `/hooks`: Özel React hook'ları (`useAppRouter.ts`, `useAppSettings.ts`, `usePersistentData.ts`, `useQuizWorkflow.ts`) uygulama state'ini ve karmaşık işlevselliği yönetir.
    -   `/services`: Harici servislerle (Gemini API, IndexedDB, yapılandırma) etkileşimi yöneten modüller (`geminiService.ts`, `dbService.ts`, `configService.ts`).
    -   `/types.ts`: Uygulama genelinde kullanılan TypeScript tip tanımlamaları.
    -   `/constants.ts`: Sabit değerler (örn: localStorage anahtarları).
    -   `/prompts`: Gemini API için kullanılan prompt şablonlarını içeren metin dosyaları.
-   **State Yönetimi:**
    -   React'in yerel state (`useState`, `useEffect`) ve context (kullanılıyorsa) mekanizmaları.
    -   Uygulama genelindeki karmaşık state ve iş akışları, özel hook'lar (`useAppRouter`, `useAppSettings`, `usePersistentData`, `useQuizWorkflow`) ile yönetilir. Bu hook'lar, ilgili state'leri kapsüller ve bu state'leri değiştiren fonksiyonları dışa aktarır.
-   **Yönlendirme (Routing):**
    -   Geleneksel URL tabanlı yönlendirme yerine, `useAppRouter.ts` hook'u içinde yönetilen bir `appState` (uygulama durumu) değişkeni ile state tabanlı bir yönlendirme mekanizması kullanılır. `navigateTo` fonksiyonu ile farklı uygulama görünümleri arasında geçiş yapılır.
-   **Hata Yönetimi:**
    -   `index.html` içinde tanımlanmış genel JavaScript hata yakalayıcı (`window.onerror`, `window.onunhandledrejection`).
    -   React bileşen ağacındaki hatalar için `ErrorBoundary.tsx` bileşeni.
    -   `useAppRouter` hook'u, uygulama genelinde hata durumunu yönetir ve `ErrorMessage.tsx` bileşeni ile gösterir.

## 6.4. Backend Mimarisi

Uygulama tamamen istemci tarafında çalıştığı için ayrı bir backend mimarisi bulunmamaktadır. Tüm iş mantığı ve veri depolama (IndexedDB, localStorage) kullanıcının tarayıcısında gerçekleşir. Yapay zeka yetenekleri için Google Gemini API gibi harici servislere doğrudan istemciden istek yapılır.

## 6.5. Veritabanı ve Veri Yönetimi (Yerel)

-   **Ana Veri Depolama:** Tarayıcının IndexedDB veritabanı, kalıcı verilerin (dersler, sınav sonuçları, öğrenme hedefleri) saklanması için kullanılır. `dbService.ts` modülü, IndexedDB ile etkileşimleri (veritabanı açma, veri ekleme, okuma, silme) yönetir.
    -   **Nesne Depoları (Object Stores):**
        -   `quizzes`: `SavedQuizData` tipindeki sınav sonuçlarını saklar. `id` alanı anahtar olarak kullanılır. `quizType` ve `courseId` alanları için indeksler bulunur.
        -   `learningObjectives`: `LearningObjective` tipindeki öğrenme hedeflerini saklar. `id` alanı anahtar olarak kullanılır. `status`, `sourcePdfName` ve `courseId` alanları için indeksler bulunur.
        -   `courses`: `Course` tipindeki dersleri saklar. `id` alanı anahtar olarak kullanılır. `name` alanı için bir indeks bulunur.
-   **Uygulama Ayarları Depolama:** Tarayıcının localStorage'ı, uygulama genelindeki ayarları (`AppSettings` - tema, varsayılan zamanlayıcı vb.) saklamak için kullanılır. Bu ayarlar `LOCAL_STORAGE_KEY_APP_SETTINGS` anahtarı altında JSON string olarak saklanır ve `useAppSettings.ts` hook'u tarafından yönetilir.
-   **Veri Bütünlüğü ve İlişkiler:** Veri bütünlüğü ve ilişkiler (örn: bir dersin silinmesi durumunda ilişkili sınavlardaki `courseId` alanının güncellenmesi) uygulama mantığı içinde (`usePersistentData.ts` gibi hook'larda) yönetilir. IndexedDB doğrudan ilişkisel özellikler sunmadığı için bu tür işlemler kodla gerçekleştirilir.

## 6.6. API İletişimi

-   **Yapay Zeka API:** Google Gemini API (`@google/genai` kütüphanesi).
    -   **Protokol:** HTTPS
    -   **Format:** JSON (API'ye gönderilen istekler ve alınan yanıtlar için).
    -   **Kimlik Doğrulama:** Gemini API, `process.env.API_KEY` ortam değişkeninden alınan bir API anahtarı ile kullanılır. Bu anahtarın kullanıcı tarafından sağlanması veya yönetilmesi beklenmez; uygulamanın çalıştığı ortamda önceden yapılandırılmış olduğu varsayılır.
    -   **Kullanılan Modeller:** `appconfig.yaml` dosyasında belirtilen Gemini modelleri kullanılır (örn: `gemini-2.5-flash-preview-04-17`).

## 6.7. Alt Konu Normalizasyonu

Yüklenen PDF metinlerinden alt konular, `geminiService.ts` içindeki `identifySubtopicsFromText` fonksiyonu ve `prompts/identify_conceptual_subtopics_prompt.txt` şablonu kullanılarak Gemini API tarafından çıkarılır. Çıkarılan bu alt konu dizeleri doğrudan kullanılır. Şu anda platform içinde gelişmiş bir alt konu normalizasyonu (farklı ifadelerin aynı kavrama eşlenmesi) veya kullanıcı tarafından yönetilen bir taksonomi/kontrollü vokabüler sistemi bulunmamaktadır.

## 6.8. Performans, Ölçeklenebilirlik ve Maliyet

-   **Performans İyileştirmeleri:**
    -   React bileşenlerinde `React.memo` kullanımı.
    -   Gereksiz render'ları önlemek için `useCallback` ve `useMemo` hook'larının kullanımı.
    -   PDF işleme ve yapay zeka API çağrıları gibi uzun sürebilecek işlemler için yükleme göstergeleri (`LoadingSpinner.tsx`).
    -   IndexedDB sorgularının verimli olması için `dbService.ts` içinde uygun indekslerin kullanımı.
-   **Ölçeklenebilirlik (İstemci Tarafı):**
    -   Uygulama tamamen istemci tarafında çalıştığı için ölçeklenebilirlik, kullanıcının tarayıcısının performansına ve IndexedDB'nin depolama limitlerine (genellikle oldukça geniştir ancak tarayıcıya göre değişir) bağlıdır.
    -   Çok büyük sayıda sınav sonucu veya öğrenme hedefi birikmesi durumunda IndexedDB performansında yavaşlamalar gözlenebilir.
-   **Maliyet:**
    -   Platformun kendisi için bir barındırma maliyeti (statik dosyalar için) düşüktür.
    -   Temel maliyet kalemi, Google Gemini API kullanımıdır. API çağrı sayısı ve karmaşıklığına göre maliyetler değişebilir. API anahtarının güvenli bir şekilde yönetilmesi ve istemci tarafında ifşa edilmemesi önemlidir (bu uygulama yapısında `process.env.API_KEY` kullanıldığı için, bu anahtarın derleme/dağıtım sırasında güvenli bir şekilde enjekte edilmesi gerekir).

# Bölüm 7: Veri Modelleri (Yerel Depolama)

Bu bölüm, AI Quiz Platformu'nda kullanılan ana veri yapılarının ve bu yapıların tarayıcının yerel depolama mekanizmalarında (IndexedDB ve localStorage) nasıl saklandığını detaylandırmaktadır.

## 7.1. Temel Veri Tipleri (`types.ts`)

Aşağıda, uygulamanın temel veri yapılarını tanımlayan ana TypeScript arayüzleri listelenmiştir:

-   **`Course`**: Bir dersi temsil eder.
    ```typescript
    interface Course {
      id: string; // Benzersiz ders kimliği
      name: string; // Dersin adı
      createdAt: number; // Oluşturulma zaman damgası
    }
    ```
-   **`QuizQuestion`**: Bir sınav sorusunu ve seçeneklerini tanımlar.
    ```typescript
    interface QuizQuestion {
      id: string; // Benzersiz soru kimliği
      question: string; // Soru metni
      options: string[]; // Seçeneklerin dizisi
      correctAnswerIndex: number; // Doğru cevabın indeksi
      userAnswerIndex?: number; // Kullanıcının verdiği cevabın indeksi (sınav çözüldükten sonra)
      subtopic?: string; // Sorunun kaynaklandığı alt konu adı (isteğe bağlı)
    }
    ```
-   **`LearningObjectiveStatus`**: Bir öğrenme hedefinin durumunu belirtir.
    ```typescript
    type LearningObjectiveStatus = 'pending' | 'success' | 'failure' | 'intermediate';
    ```
-   **`LearningObjective`**: Bir öğrenme hedefini temsil eder.
    ```typescript
    interface LearningObjective {
      id: string; // Benzersiz hedef kimliği (örn: pdfName::subtopicName::courseId)
      name: string; // Hedefin adı (genellikle alt konu adı)
      status: LearningObjectiveStatus; // Hedefin durumu
      sourcePdfName: string; // Kaynak PDF dosyasının adı
      createdAt: number; // Oluşturulma zaman damgası
      updatedAt: number; // Son güncellenme zaman damgası
      courseId?: string; // İlişkili dersin kimliği (isteğe bağlı)
      courseName?: string; // İlişkili dersin adı (denormalize edilmiş, isteğe bağlı)
    }
    ```
-   **`QuizDifficulty`**: Sınav zorluk seviyelerini belirtir.
    ```typescript
    type QuizDifficulty = 'Kolay' | 'Orta' | 'Zor';
    ```
-   **`PersonalizedQuizType`**: Kişiselleştirilmiş sınav türlerini belirtir.
    ```typescript
    type PersonalizedQuizType = 'comprehensive' | 'new_topics' | 'weak_topics';
    ```
-   **`SavedQuizData`**: Kaydedilmiş bir sınavın tüm verilerini içerir.
    ```typescript
    interface SavedQuizData {
      id: string; // Benzersiz sınav kaydı kimliği
      questions: QuizQuestion[]; // Sınavdaki sorular
      userAnswers: Record<string, number>; // Kullanıcının cevapları (question.id -> userAnswerIndex)
      score: number; // Doğru cevap sayısı
      totalQuestions: number; // Toplam soru sayısı
      pdfName?: string; // Sınavın oluşturulduğu PDF dosyasının adı (isteğe bağlı)
      savedAt: number; // Kaydedilme zaman damgası
      quizType?: string; // "Hızlı Sınav" veya "Kişiselleştirilmiş Sınav"
      courseId?: string; // İlişkili dersin kimliği (isteğe bağlı)
      courseName?: string; // İlişkili dersin adı (denormalize edilmiş, isteğe bağlı)
      difficulty?: QuizDifficulty; // Seçilen zorluk seviyesi (isteğe bağlı)
      isTimerEnabled?: boolean; // Zamanlayıcının etkin olup olmadığı
      totalTimeAllocated?: number; // Sınav için ayrılan toplam süre (saniye)
      personalizedQuizType?: PersonalizedQuizType; // Kişiselleştirilmiş sınavın özel türü
    }
    ```
-   **`Achievement`**: Bir başarıyı (gamification öğesi) temsil eder.
    ```typescript
    interface Achievement {
      id: string;
      title: string;
      description: string;
      icon: string; // FontAwesome ikon sınıfı
      isUnlocked: boolean; // Kilidin açık olup olmadığı
      unlockedDate?: number; // Kilidin açıldığı zaman damgası
      progress?: { current: number; target: number }; // İlerleme gerektiren başarılar için
      category?: string; // Başarı kategorisi (örn: "Sınavlar", "Öğrenme")
    }
    ```
-   **`AppSettings`**: Uygulama genelindeki ayarları tanımlar.
    ```typescript
    interface AppSettings {
      defaultTimerEnabled: boolean; // Zamanlayıcı varsayılan olarak etkin mi?
      secondsPerQuestion: number; // Soru başına varsayılan süre (saniye)
      numOptionsPerQuestion: number; // Soru başına varsayılan seçenek sayısı
      theme: 'light' | 'dark'; // Uygulama teması
    }
    ```
-   **`AppState`**: Uygulamanın farklı gezinme durumlarını/görünümlerini tanımlar. `useAppRouter.ts` tarafından kullanılır. (Detayları `types.ts` dosyasında bulunabilir.)

## 7.2. IndexedDB Veri Depolama (`dbService.ts`)

Kalıcı veriler (dersler, sınav sonuçları, öğrenme hedefleri) tarayıcının IndexedDB veritabanında, `QuizMasterDB` adlı bir veritabanı içinde saklanır.

-   **`courses` Nesne Deposu:**
    -   **Amaç:** `Course` tipindeki ders kayıtlarını saklar.
    -   **Anahtar Yolu (Key Path):** `id` (dersin benzersiz kimliği).
    -   **İndeksler:** `name` (ders adına göre arama/sıralama için).
-   **`quizzes` Nesne Deposu:**
    -   **Amaç:** `SavedQuizData` tipindeki kaydedilmiş sınav sonuçlarını saklar.
    -   **Anahtar Yolu (Key Path):** `id` (sınav kaydının benzersiz kimliği).
    -   **İndeksler:** `quizType` (sınav türüne göre filtreleme için), `courseId` (derse göre filtreleme için), `savedAt` (tarihe göre sıralama için).
-   **`learningObjectives` Nesne Deposu:**
    -   **Amaç:** `LearningObjective` tipindeki öğrenme hedeflerini saklar.
    -   **Anahtar Yolu (Key Path):** `id` (öğrenme hedefinin benzersiz kimliği).
    -   **İndeksler:** `status` (duruma göre filtreleme), `sourcePdfName` (kaynak PDF'e göre filtreleme), `courseId` (derse göre filtreleme), `updatedAt` (son güncellenme tarihine göre sıralama).

## 7.3. localStorage Veri Depolama (`useAppSettings.ts`)

Uygulama genelindeki kullanıcı tercihleri ve ayarları (`AppSettings` tipinde) tarayıcının localStorage'ında saklanır.

-   **Anahtar:** `LOCAL_STORAGE_KEY_APP_SETTINGS` (değeri: `aiQuizAppSettings`).
-   **Değer:** `AppSettings` nesnesinin JSON string'e çevrilmiş hali.
-   **Yönetim:** `useAppSettings.ts` hook'u, bu ayarların yüklenmesinden ve güncellenmesinden sorumludur.

## 7.4. Veri İlişkileri ve Denormalizasyon (Yerel)

-   **Dersler ve Sınavlar/Öğrenme Hedefleri:** `SavedQuizData` ve `LearningObjective` nesneleri, isteğe bağlı olarak bir `courseId` alanı içererek ilgili dersle ilişkilendirilir. Okuma kolaylığı için `courseName` alanı da bu nesnelerde denormalize edilerek tutulabilir.
-   **Sınavlar ve Sorular:** `SavedQuizData` içindeki `questions` dizisi, o sınava ait `QuizQuestion` nesnelerini doğrudan içerir (gömülü veri).
-   **Sorular ve Alt Konular:** `QuizQuestion` içindeki `subtopic` alanı (string), bir `LearningObjective` nesnesinin `name` alanıyla (string) mantıksal olarak eşleşir. Bu eşleşme, sınav performansına göre öğrenme hedeflerinin durumunu güncellemek için kullanılır.

Bu yerel depolama yaklaşımı, uygulamanın sunucu bağlantısı olmadan çevrimdışı çalışabilmesine ve kullanıcı verilerinin gizliliğinin korunmasına olanak tanır. Ancak, veriler yalnızca kullanıcının mevcut tarayıcısında saklandığından, farklı cihazlar arasında senkronizasyon veya tarayıcı verilerinin silinmesi durumunda veri kaybı gibi kısıtlamaları vardır.
