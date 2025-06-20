import React, { useState } from 'react';
import { User } from '../types'; 
import { signOutUser } from '../services/authService';

interface ProfilePageProps {
  currentUser: User | null;
  onLogout: () => void; // Callback to handle navigation/state changes after logout
  onBack?: () => void; // Optional back navigation
  setAuthLoading: (loading: boolean) => void;
  setAuthError: (error: string | null) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser, onLogout, onBack, setAuthLoading, setAuthError }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signOutUser();
      onLogout();
    } catch (error) {
      console.error("Logout failed:", error);
      setAuthError("Çıkış yapılamadı. Lütfen tekrar deneyin.");
    } finally {
      setAuthLoading(false);
      setIsLoggingOut(false);
    }
  };

  const getInitials = (name?: string | null, email?: string | null): string => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  if (!currentUser) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
            <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Kullanıcı Bulunamadı</h2>
          <p className="text-gray-600 dark:text-gray-400">Kullanıcı bilgileri yüklenemedi veya oturum açılmamış.</p>
          {onBack && (
            <button
              onClick={onBack}
              className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Ana Sayfaya Dön
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profilim</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Hesap bilgilerinizi görüntüleyin ve yönetin</p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Geri
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-xl border border-gray-200 dark:border-secondary-700 overflow-hidden">
        {/* Profile Header with Avatar */}
        <div className="bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 px-8 py-12 text-center">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {getInitials(currentUser.displayName, currentUser.email)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 border-3 border-white rounded-full"></div>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white">
            {currentUser.displayName || 'Kullanıcı'}
          </h2>
          <p className="text-white/80 text-sm mt-1">Aktif</p>
        </div>

        {/* Profile Content */}
        <div className="p-8 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <i className="fas fa-user mr-2 text-primary-500"></i>
              Kişisel Bilgiler
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Görünen Ad</label>
                <div className="p-3 bg-gray-50 dark:bg-secondary-700 rounded-lg">
                  <p className="text-gray-900 dark:text-white">
                    {currentUser.displayName || 'Belirtilmemiş'}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">E-posta Adresi</label>
                <div className="p-3 bg-gray-50 dark:bg-secondary-700 rounded-lg">
                  <p className="text-gray-900 dark:text-white">
                    {currentUser.email}
                  </p>
                </div>
              </div>
            </div>
          </div>


    

          {/* Actions */}
          <div className="pt-6 border-t border-gray-200 dark:border-secondary-700">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                disabled
                className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gray-100 dark:bg-secondary-700 text-gray-400 dark:text-gray-500 rounded-lg font-medium cursor-not-allowed"
              >
                <i className="fas fa-edit mr-2"></i>
                Profili Düzenle (Yakında)
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`inline-flex items-center justify-center px-6 py-3 font-medium rounded-lg transition-all duration-200 ${
                  isLoggingOut
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 hover:shadow-lg'
                } text-white`}
              >
                {isLoggingOut ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Çıkış Yapılıyor...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    Oturumu Kapat
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
