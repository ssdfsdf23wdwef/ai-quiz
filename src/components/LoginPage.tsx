import React, { useState } from 'react';
import { signInUser } from '../services/authService'; 
import { useAppRouter } from '../hooks/useAppRouter'; // Assuming navigateTo is part of useAppRouter
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
  
  const themeClasses = getThemeClasses(theme);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInUser(email, password);
      onLoginSuccess(); // This will trigger App.tsx to update currentUser and navigate
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
    <div className={`min-h-screen flex items-center justify-center px-4 py-12 ${themeClasses.bg.tertiary}`}>
      <div className={`w-full max-w-md p-8 rounded-xl shadow-2xl space-y-8 ${themeClasses.bg.card}`}>
        <div>
          <div className="flex justify-center mb-4">
             <div className="p-3 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-lg">
                <i className="fas fa-brain text-4xl text-white"></i>
            </div>
          </div>
          <h2 className={`text-center text-2xl sm:text-3xl font-extrabold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            QuizMaster'a Giriş Yapın
          </h2>
          <p className={`mt-2 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Hesabınız yok mu?{' '}
            <button onClick={() => navigateTo('signup')} className={`font-medium ${theme === 'dark' ? 'text-primary-400 hover:text-primary-300' : 'text-primary-600 hover:text-primary-500'}`}>
              Kayıt Olun
            </button>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">E-posta Adresi</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-3 border rounded-t-md focus:outline-none focus:z-10 sm:text-sm ${theme === 'dark' ? 'border-secondary-600 placeholder-gray-400 text-white bg-secondary-700 focus:ring-primary-400 focus:border-primary-400' : 'border-gray-300 placeholder-gray-500 text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500'}`}
                placeholder="E-posta Adresi"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Şifre</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-3 border rounded-b-md focus:outline-none focus:z-10 sm:text-sm ${theme === 'dark' ? 'border-secondary-600 placeholder-gray-400 text-white bg-secondary-700 focus:ring-primary-400 focus:border-primary-400' : 'border-gray-300 placeholder-gray-500 text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500'}`}
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <button onClick={() => navigateTo('forgot_password')} type="button" className={`font-medium ${theme === 'dark' ? 'text-primary-400 hover:text-primary-300' : 'text-primary-600 hover:text-primary-500'}`}>
                Şifrenizi mi unuttunuz?
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme === 'dark' ? 'bg-primary-500 hover:bg-primary-600 focus:ring-primary-500 focus:ring-offset-secondary-800' : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'}`}
            >
              Giriş Yap
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
