import React, { useState } from 'react';
import { signUpUser } from '../services/authService';
import { useAppRouter } from '../hooks/useAppRouter';

interface SignupPageProps {
  onSignupSuccess: () => void;
  navigateTo: (state: 'login' | 'dashboard_main') => void;
  setAuthLoading: (loading: boolean) => void;
  setAuthError: (error: string | null) => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSignupSuccess, navigateTo, setAuthLoading, setAuthError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');


  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setAuthError("Şifreler eşleşmiyor.");
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signUpUser(email, password, displayName);
      onSignupSuccess();
    } catch (error: any) {
      console.error("Signup failed:", error);
      let friendlyMessage = "Kayıt başarısız oldu. Lütfen tekrar deneyin.";
      if (error.code === 'auth/email-already-in-use') {
        friendlyMessage = "Bu e-posta adresi zaten kullanımda.";
      } else if (error.code === 'auth/invalid-email') {
        friendlyMessage = "Geçersiz e-posta formatı.";
      } else if (error.code === 'auth/weak-password') {
        friendlyMessage = "Şifre çok zayıf. Lütfen en az 6 karakter kullanın.";
      }
      setAuthError(friendlyMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-secondary-900 px-4 py-12">
      <div className="w-full max-w-md p-8 bg-white dark:bg-secondary-800 rounded-xl shadow-2xl space-y-8">
        <div>
          <div className="flex justify-center mb-4">
             <div className="p-3 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-lg">
                <i className="fas fa-brain text-4xl text-white"></i>
            </div>
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Yeni Hesap Oluşturun
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Zaten hesabınız var mı?{' '}
            <button onClick={() => navigateTo('login')} className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
              Giriş Yapın
            </button>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="displayName" className="sr-only">Görünen Ad (İsteğe Bağlı)</label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                autoComplete="name"
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-secondary-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-secondary-700 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 focus:z-10 sm:text-sm"
                placeholder="Görünen Ad (İsteğe Bağlı)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-address-signup" className="sr-only">E-posta Adresi</label>
              <input
                id="email-address-signup"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-secondary-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-secondary-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 focus:z-10 sm:text-sm"
                placeholder="E-posta Adresi"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password-signup" className="sr-only">Şifre</label>
              <input
                id="password-signup"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-secondary-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-secondary-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 focus:z-10 sm:text-sm"
                placeholder="Şifre (en az 6 karakter)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password-signup" className="sr-only">Şifreyi Onayla</label>
              <input
                id="confirm-password-signup"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-secondary-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-secondary-700 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 focus:z-10 sm:text-sm"
                placeholder="Şifreyi Onayla"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-secondary-800"
            >
              Kayıt Ol
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
