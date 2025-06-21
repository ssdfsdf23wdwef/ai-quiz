# AI Quiz App

An intelligent quiz application built with React, TypeScript, and Google Gemini AI. This app allows users to create personalized quizzes from PDF documents, track their learning progress, and analyze performance.

## Features

- 📄 **PDF Upload**: Upload PDF documents to generate quizzes
- 🤖 **AI-Powered**: Uses Google Gemini AI for intelligent quiz generation
- 📊 **Performance Analytics**: Track your learning progress and performance
- 🎯 **Personalized Learning**: Customizable quiz preferences and difficulty levels
- 🔥 **Firebase Integration**: User authentication and data storage
- 📱 **Responsive Design**: Modern UI built with Tailwind CSS

## Technologies Used

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **AI**: Google Gemini AI (@google/genai)
- **Backend**: Firebase (Authentication, Firestore)
- **PDF Processing**: PDF.js
- **Build Tool**: Vite
- **Deployment**: GitHub Pages with GitHub Actions

## Live Demo

🌐 **[View Live Demo](https://ssdfsdf23wdwef.github.io/ai-quiz/)**

## Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- Google Gemini API key
- Firebase project configuration

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/ai-quiz-app.git
   cd ai-quiz-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add your API keys:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
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
