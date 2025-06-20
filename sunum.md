# Sunum: AI Quiz - Kişiselleştirilmiş Öğrenme Platformu

---

### **Slayt 1: Başlık**

* **Proje Adı:** AI Quiz: Yeni Nesil Kişiselleştirilmiş Öğrenme Platformu
* **Alt Başlık:** Veri Odaklı Analiz ve Akıllı Quiz Üretimi
* **Hazırlayan:** [Adın Soyadın]
* **Danışman:** [Danışman Adı]

---

### **Slayt 2: Vizyon: "Tek Beden Herkese Uymaz"**

* **Problem:** Geleneksel eğitim platformları, her kullanıcıya aynı içeriği sunar. Bu, öğrenme verimliliğini düşürür ve motivasyonu kırar.
* **Bizim Çözümümüz:** Her kullanıcı için **benzersiz** bir öğrenme patikası oluşturan, onların performansını analiz eden ve zayıf yönlerine odaklanan akıllı bir platform.

---

### **Slayt 3: Projenin Ana Sütunları**

1. **Akıllı Quiz Oluşturma:** Kullanıcıların kendi materyallerinden (PDF gibi) veya belirledikleri konulardan özel quiz'ler yaratması.
2. **Etkileşimli Deneyim:** Akıcı ve odaklanmış bir arayüzde quiz çözme.
3. **Derinlemesine Performans Analizi:** Sadece doğru/yanlış değil, konu bazlı başarıyı ve zaman içindeki gelişimi gösteren detaylı raporlar.
4. **Oyunlaştırma ve Motivasyon:** Başarılar ve hedeflerle öğrenmeyi teşvik etme.

---

### **Slayt 4: Teknik Mimari ve Teknoloji Yığını**

* **Geliştirme Ortamı:** Vite ile güçlendirilmiş hızlı ve modern bir geliştirme deneyimi.
* **Frontend:**
  * **React & TypeScript:** Ölçeklenebilir, tip-güvenli ve component tabanlı bir yapı.
  * **Tailwind CSS:** Hızlı, tutarlı ve özelleştirilebilir bir UI geliştirme süreci.
* **State Yönetimi:** Zustand (veya belirttiğiniz başka bir kütüphane) ile global state'in reaktif ve basit yönetimi.
* **Asenkron İşlemler:** `services` katmanı üzerinden API çağrılarının (şu an için mock) merkezi yönetimi.

---

### **Slayt 5: Component Mimarisi: Kodun Anatomisi**

* **Kullanıcı Akışı (`LoginPage`, `SignupPage`):** Güvenli ve sorunsuz bir başlangıç.
* **Çekirdek Deneyim (`QuizView`, `QuizResult`):** Quiz'in kalbi, maksimum odaklanma için tasarlandı.
* **İçerik Üretimi (`QuizCreationLayout`, `PdfUploader`, `SubtopicSelector`):** Kullanıcıyı pasif bir tüketiciden aktif bir içerik üreticisine dönüştüren güçlü araçlar.
* **Veri Görselleştirme (`PerformanceAnalysisPage`):** Karmaşık verileri anlaşılır grafiklere ve raporlara dönüştüren bileşen.
* **Genel Yerleşim (`Sidebar`, `DashboardPage`):** Uygulama içi navigasyonu ve kullanıcıya özel alanı yönetir.
* **Sağlamlık (`ErrorBoundary`, `ErrorMessage`):** Beklenmedik hataları yakalayıp kullanıcı deneyimini koruyan yapılar.

---

### **Slayt 6: Öne Çıkan Özellik 1: Akıllı Quiz Üretim Motoru**

* *(Bu slayta `QuizCreationLayout` ve `PdfUploader` ekran görüntülerini ekleyin)*
* **`PdfUploader.tsx`:** Kullanıcıların kendi ders notlarını veya dokümanlarını yüklemesine olanak tanır.
* **`CourseSelectionForQuizStep.tsx` & `SubtopicSelector.tsx`:** Kullanıcıların geniş bir konu havuzundan istedikleri alanlara odaklanmasını sağlar.
* **`QuizPreferences.tsx`:** Soru sayısı, zorluk seviyesi gibi ayarlar ile tamamen kişiselleştirilmiş bir deneyim sunar.

---

### **Slayt 7: Öne Çıkan Özellik 2: Derinlemesine Performans Analizi**

* *(Bu slayta `PerformanceAnalysisPage` ekran görüntüsünü ekleyin)*
* Bu sayfa, projenin en ayırt edici özelliğidir.
* Kullanıcının sadece genel skorunu değil, alt konu başlıklarındaki başarısını, en çok zorlandığı konuları ve zaman içindeki gelişimini görselleştirir.
* Bu veriler, gelecekteki AI motoru için temel oluşturur.

---

### **Slayt 8: Öne Çıkan Özellik 3: Oyunlaştırma ve Motivasyon**

* *(Bu slayta `AchievementsPage` ekran görüntüsünü ekleyin)*
* **`AchievementsPage.tsx`:** Belirli hedeflere (örn: "5 quizi %90 başarıyla tamamla") ulaşıldığında kazanılan rozetler ve ödüller.
* **`LearningObjectivesPage.tsx`:** Kullanıcıların kendilerine hedef belirlemesini ve bu hedeflere doğru ilerlemesini sağlar. Bu, öğrenme sürecini yapılandırır.

---

### **Slayt 9: Test ve Kalite Güvencesi**

* **Manuel Testler:** Tüm kritik kullanıcı akışları (kayıt, PDF yükleme, quiz çözme, analiz görüntüleme) detaylıca test edildi.
* **Hata Yönetimi:** `ErrorBoundary` component'i sayesinde, bir bileşende oluşan hata tüm uygulamanın çökmesini engeller. `ErrorMessage` ile kullanıcıya anlamlı geri bildirimler sunulur.
* **Kod Kalitesi:** TypeScript ve ESLint kuralları ile tutarlı ve okunabilir bir kod tabanı hedeflendi.

---

### **Slayt 10: Gelecek Vizyonu ve AI Entegrasyonu**

* **Faz 1: Backend Entegrasyonu (NestJS):** Mock verileri gerçek bir veritabanı (PostgreSQL) ve API ile değiştirmek.
* **Faz 2: Akıllı Soru Üretimi (AI):**
  * Yüklenen PDF'leri (`PdfUploader`) işleyip **otomatik olarak soru ve cevap üreten** bir NLP modeli entegrasyonu.
* **Faz 3: Adaptif Öğrenme Motoru (AI):**
  * `PerformanceAnalysisPage` verilerini kullanarak, kullanıcının zayıf olduğu konuları tespit edip **otomatik olarak o konulara yönelik yeni quiz'ler (`PersonalizedQuizTypeSelector`) öneren** bir sistem.

---

### **Slayt 11: Teşekkür & Sorular**

* Dinlediğiniz için teşekkür ederim.
* **GitHub:** [Link]
* **Sorularınız?**
