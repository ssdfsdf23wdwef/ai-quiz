import React, { useState } from 'react';
import { sendPasswordReset } from '../services/authService';

interface ForgotPasswordPageProps {
  navigateTo: (state: 'login') => void;
  setAuthLoading: (loading: boolean) => void;
  setAuthMessage: (message: {type: 'success' | 'error', text:string} | null) => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ navigateTo, setAuthLoading, setAuthMessage }) => {
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
            Şifrenizi mi Unuttunuz?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Şifrenizi sıfırlamak için kayıtlı e-posta adresinizi girin.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handlePasswordReset}>
          <div>
            <label htmlFor="email-address-reset" className="sr-only">E-posta Adresi</label>
            <input
              id="email-address-reset"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 dark:border-secondary-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-secondary-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 focus:z-10 sm:text-sm"
              placeholder="E-posta Adresi"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-secondary-800"
            >
              Sıfırlama Bağlantısı Gönder
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <button onClick={() => navigateTo('login')} className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
            Giriş sayfasına dön
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
