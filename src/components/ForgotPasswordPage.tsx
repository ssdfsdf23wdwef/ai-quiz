import React, { useState } from 'react';
import { sendPasswordReset } from '../services/authService';
import { getThemeClasses } from '../utils/themeUtils';

interface ForgotPasswordPageProps {
  navigateTo: (state: 'login') => void;
  setAuthLoading: (loading: boolean) => void;
  setAuthMessage: (message: {type: 'success' | 'error', text:string} | null) => void;
  theme?: string;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ navigateTo, setAuthLoading, setAuthMessage, theme }) => {
  const [email, setEmail] = useState('');

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMessage(null);
    try {
      await sendPasswordReset(email);
      setAuthMessage({type: 'success', text:"Şifre sıfırlama e-postası gönderildi. Lütfen gelen kutunuzu kontrol edin."});
    } catch (error: any) {
      console.error("Password reset failed:", error);
       let friendlyMessage = "Şifre sıfırlama e-postası gönderilemedi.";
      if (error.code === 'auth/user-not-found') {
        friendlyMessage = "Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı.";
      } else if (error.code === 'auth/invalid-email') {
        friendlyMessage = "Geçersiz e-posta formatı.";
      }
      setAuthMessage({type: 'error', text: friendlyMessage});
    } finally {
      setAuthLoading(false);
    }
  };

  const themeClasses = getThemeClasses(theme);

  return (
    <div className={`min-h-screen flex items-center justify-center px-3 py-8 ${themeClasses.bg.tertiary}`}>
      <div className="w-full max-w-sm">
        {/* Logo ve Başlık */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-1`}>
            Şifremi Unuttum
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Şifrenizi sıfırlamak için e-posta adresinizi girin
          </p>
        </div>

        {/* Şifre Sıfırlama Formu */}
        <div className={`${themeClasses.bg.card} rounded-2xl shadow-xl border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} p-6`}>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            {/* E-posta Input */}
            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                E-posta Adresi
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Kayıtlı e-posta adresiniz"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Sıfırlama Butonu */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Sıfırlama Bağlantısı Gönder
            </button>
          </form>
        </div>

        {/* Geri Dön Bağlantısı */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigateTo('login')}
            className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors duration-200 text-sm"
          >
            ← Giriş sayfasına dön
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
