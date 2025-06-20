# Sistem Mimarisi

Aşağıda projenin mevcut ve gelecekteki sistem mimarisini gösteren bir Mermaid grafiği bulunmaktadır.

```mermaid
graph TD
    subgraph "Kullanıcı"
        User[Kullanıcı]
    end

    subgraph "Frontend (React + Vite)"
        direction LR
        subgraph "UI Components"
            direction TB
            Auth[LoginPage, SignupPage]
            Core[QuizView, QuizResult]
            Creation[QuizCreationLayout, PdfUploader]
            Analysis[PerformanceAnalysisPage]
            Layout[Sidebar, DashboardPage]
        end
        
        subgraph "State Management"
            Zustand[Zustand]
        end

        subgraph "Services"
            AuthService[authService.ts]
            FirestoreService[firestoreService.ts]
            GeminiService[geminiService.ts]
        end
        
        UI_Components -- "State Yönetimi" --> Zustand
        UI_Components -- "API Çağrıları" --> Services
    end

    subgraph "Backend (Firebase)"
        Firestore[Firestore Veritabanı]
        AuthFirebase[Firebase Authentication]
        Functions[Cloud Functions (Gemini API)]
    end
    
    subgraph "Gelecek Mimarisi (Planlanan)"
        direction TB
        NestJS[NestJS Backend]
        PostgreSQL[PostgreSQL DB]
        AI_Engine[Adaptif AI Motoru]
        
        NestJS -- "Veri Erişimi" --> PostgreSQL
        NestJS -- "Yönetir" --> AI_Engine
    end

    User -- "Etkileşimde Bulunur" --> Frontend
    
    AuthService -- "İletişim Kurar" --> AuthFirebase
    FirestoreService -- "İletişim Kurar" --> Firestore
    GeminiService -- "İletişim Kurar" --> Functions
    
    Firestore -- "Gelecekte Yerini Alacak" --> NestJS
    AuthFirebase -- "Gelecekte Yerini Alacak" --> NestJS
    Functions -- "Gelecekte Yerini Alacak" --> NestJS

    style User fill:#f9f,stroke:#333,stroke-width:2px
    style Frontend fill:#bbf,stroke:#333,stroke-width:2px
    style Backend fill:#9f9,stroke:#333,stroke-width:2px
    style Gelecek_Mimarisi fill:#ff9,stroke:#333,stroke-width:2px
```

### Mimarinin Açıklaması:

1.  **Kullanıcı:** Sistemi kullanan son kullanıcıdır.
2.  **Frontend (React + Vite):**
    *   **UI Components:** `sunum.md` dosyasında belirtilen tüm React bileşenlerini içerir. Bu bileşenler kullanıcı arayüzünü oluşturur.
    *   **State Management (Zustand):** Uygulama genelindeki state'i (durumu) yönetir. Bileşenler arası veri paylaşımını ve durum tutarlılığını sağlar.
    *   **Services:** Backend ile iletişimi yöneten katmandır. Firebase Authentication, Firestore ve Gemini API'si gibi dış servislerle olan tüm etkileşimler burada merkezileştirilmiştir.
3.  **Backend (Firebase):**
    *   **Firebase Authentication:** Kullanıcı kimlik doğrulama (giriş, kayıt) işlemlerini yönetir.
    *   **Firestore Veritabanı:** Quiz verileri, kullanıcı performans analizleri gibi uygulama verilerini saklayan NoSQL veritabanıdır.
    *   **Cloud Functions:** Özellikle Gemini gibi sunucu tarafı API anahtarı gerektiren işlemleri güvenli bir şekilde yürütmek için kullanılır.
4.  **Gelecek Mimarisi (Planlanan):**
    *   **NestJS Backend:** Projenin gelecekteki fazlarında Firebase servislerinin yerini alması planlanan daha ölçeklenebilir ve güçlü backend yapısı.
    *   **PostgreSQL DB:** Yapılandırılmış veriler için ilişkisel bir veritabanı.
    *   **Adaptif AI Motoru:** Kullanıcı performans verilerini analiz ederek kişiselleştirilmiş öğrenme deneyimi sunacak olan yapay zeka motoru.
