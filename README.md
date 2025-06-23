# AI Quiz - Yapay Zeka Quiz Platformu

**AI Quiz** - Yapay zeka destekli kişiselleştirilmiş quiz platformu ile öğrenme deneyiminizi geliştirin! Google Gemini AI teknolojisi ile PDF belgelerinizden akıllı sınavlar oluşturun ve performansınızı analiz edin.

## 🎯 Ana Özellikler

- 🤖 **AI Destekli Quiz Üretimi**: Google Gemini yapay zeka ile akıllı soru üretimi
- � **PDF Desteği**: PDF belgelerinizden otomatik quiz oluşturma
- 🎯 **Kişiselleştirilmiş Öğrenme**: Bilgi seviyenize göre optimize edilmiş sorular
- 📊 **Performans Analizi**: Detaylı raporlar ve gelişim takibi
- 🔥 **Firebase Entegrasyonu**: Güvenli kullanıcı kimlik doğrulama ve veri saklama
- 📱 **Mobil Uyumlu**: Modern ve responsive tasarım
- 🚀 **Hızlı ve Ücretsiz**: Anında kullanıma hazır, kayıt gerektirmez

## 🔧 Teknoloji Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **AI**: Google Gemini AI (@google/genai)
- **Backend**: Firebase (Authentication, Firestore)
- **PDF İşleme**: PDF.js (pdfjs-dist)
- **Build**: Vite
- **Deployment**: GitHub Pages

## 🌐 Canlı Demo

� **[AI Quiz Platformunu Deneyin](https://ssdfsdf23wdwef.github.io/ai-quiz/)**

## 💻 Kurulum ve Geliştirme

### Gereksinimler
- Node.js (18+ sürüm)
- npm veya yarn
- Google Gemini API anahtarı
- Firebase proje konfigürasyonu

### Adım Adım Kurulum

1. **Projeyi klonlayın:**
   ```bash
   git clone https://github.com/ssdfsdf23wdwef/ai-quiz.git
   cd ai-quiz
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Ortam değişkenlerini ayarlayın:**
   Kök dizinde `.env.local` dosyası oluşturun:
   ```env
   VITE_GEMINI_API_KEY=gemini_api_anahtariniz
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Builds the app for production
- `npm run preview` - Preview the production build locally

## Project Structure

```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── services/           # API services and configurations
├── types.ts            # TypeScript type definitions
├── constants.ts        # Application constants
└── App.tsx            # Main application component
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or run into issues, please open an issue on GitHub.
