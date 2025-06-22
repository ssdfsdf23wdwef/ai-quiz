import React, { useState } from 'react';
import { signInUser } from '../services/authService'; 
import { useAppRouter } from '../hooks/useAppRouter';
import { getThemeClasses } from '../utils/themeUtils';

interface LoginPageProps {
  onLoginSuccess: () => void;
  navigateTo: (state: 'signup' | 'forgot_password' | 'dashboard_main') => void;
  setAuthLoading: (loading: boolean) => void;
  setAuthError: (error: string | null) => void;
  theme?: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, navigateTo, setAuthLoading, setAuthError, theme }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const themeClasses = getThemeClasses(theme);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInUser(email, password);
      onLoginSuccess();
    } catch (error: any) {
      console.error("Login failed:", error);
      let friendlyMessage = "Giriş başarısız oldu. Lütfen bilgilerinizi kontrol edin.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        friendlyMessage = "E-posta veya şifre hatalı.";
      } else if (error.code === 'auth/invalid-email') {
        friendlyMessage = "Geçersiz e-posta formatı.";
      } else if (error.code === 'auth/too-many-requests') {
        friendlyMessage = "Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.";
      }
      setAuthError(friendlyMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-3 py-8 ${themeClasses.bg.tertiary}`}>
      <div className="w-full max-w-sm">
        {/* Logo ve Başlık */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-1`}>
            Hoş Geldiniz
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Hesabınıza giriş yapın
          </p>
        </div>

        {/* Giriş Formu */}
        <div className={`${themeClasses.bg.card} rounded-2xl shadow-xl border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} p-6`}>
          <form onSubmit={handleLogin} className="space-y-4">
            {/* E-posta Input */}
            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                E-posta
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
                  placeholder="ornek@email.com"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Şifre Input */}
            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Şifre
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 pr-12 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L7.05 7.05M13.878 14.878l3.536 3.536M13.878 14.878L7.05 7.05" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Şifremi Unuttum */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => navigateTo('forgot_password')}
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium transition-colors duration-200"
              >
                Şifremi unuttum
              </button>
            </div>

            {/* Giriş Butonu */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Giriş Yap
            </button>
          </form>
        </div>

        {/* Kayıt Ol Bağlantısı */}
        <div className="text-center mt-6">
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Hesabınız yok mu?{' '}
            <button
              onClick={() => navigateTo('signup')}
              className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors duration-200"
            >
              Kayıt olun
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
