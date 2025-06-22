import React, { useState } from 'react';
import { User } from '../types'; 
import { signOutUser } from '../services/authService';

interface ProfilePageProps {
  currentUser: User | null;
  onLogout: () => void; // Callback to handle navigation/state changes after logout
  onBack?: () => void; // Optional back navigation
  setAuthLoading: (loading: boolean) => void;
  setAuthError: (error: string | null) => void;
  theme?: string;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser, onLogout, onBack, setAuthLoading, setAuthError, theme }) => {
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
      <div className="min-h-full flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
            theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'
          }`}>
            <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
          </div>
          <h2 className={`text-lg sm:text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Kullanıcı Bulunamadı</h2>
          <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Kullanıcı bilgileri yüklenemedi veya oturum açılmamış.</p>
          {onBack && (
            <button
              onClick={onBack}
              className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors touch-target"
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
    <div className="min-h-full max-w-4xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-grow">
          <h1 className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Profilim</h1>
          <p className={`mt-1 text-sm sm:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Hesap bilgilerinizi görüntüleyin ve yönetin</p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className={`inline-flex items-center px-3 sm:px-4 py-2 transition-colors self-start sm:self-auto text-sm sm:text-base touch-target ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <i className="fas fa-arrow-left mr-1 sm:mr-2"></i>
            Geri
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className={`rounded-2xl shadow-xl border overflow-hidden ${theme === 'dark' ? 'bg-secondary-800 border-secondary-700' : 'bg-white border-gray-200'}`}>
        {/* Profile Header with Avatar */}
        <div className="bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 px-4 sm:px-8 py-8 sm:py-12 text-center">
          <div className="relative inline-block">
            <div className="w-20 sm:w-24 h-20 sm:h-24 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg">
              {getInitials(currentUser.displayName, currentUser.email)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 sm:w-6 h-5 sm:h-6 bg-green-400 border-2 sm:border-3 border-white rounded-full"></div>
          </div>
          <h2 className="mt-3 sm:mt-4 text-xl sm:text-2xl font-bold text-white">
            {currentUser.displayName || 'Kullanıcı'}
          </h2>
          <p className="text-white/80 text-xs sm:text-sm mt-1">Aktif</p>
        </div>

        {/* Profile Content */}
        <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <i className="fas fa-user mr-2 text-primary-500"></i>
              Kişisel Bilgiler
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5 sm:space-y-1">
                <label className={`text-xs sm:text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Görünen Ad</label>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-secondary-700' : 'bg-gray-50'}`}>
                  <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {currentUser.displayName || 'Belirtilmemiş'}
                  </p>
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-1">
                <label className={`text-xs sm:text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>E-posta Adresi</label>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-secondary-700' : 'bg-gray-50'}`}>
                  <p className={`text-sm sm:text-base break-all ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {currentUser.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className={`pt-4 sm:pt-6 border-t ${
            theme === 'dark' ? 'border-secondary-700' : 'border-gray-200'
          }`}>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                disabled
                className={`flex-1 inline-flex items-center justify-center px-4 sm:px-6 py-3 rounded-lg font-medium cursor-not-allowed text-sm sm:text-base touch-target ${
                  theme === 'dark' 
                    ? 'bg-secondary-700 text-gray-500' 
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <i className="fas fa-edit mr-2"></i>
                <span className="hidden sm:inline">Profili Düzenle (Yakında)</span>
                <span className="sm:hidden">Düzenle (Yakında)</span>
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`inline-flex items-center justify-center px-4 sm:px-6 py-3 font-medium rounded-lg transition-all duration-200 text-sm sm:text-base touch-target ${
                  isLoggingOut
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 hover:shadow-lg'
                } text-white`}
              >
                {isLoggingOut ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    <span className="hidden sm:inline">Çıkış Yapılıyor...</span>
                    <span className="sm:hidden">Çıkış...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    <span className="hidden sm:inline">Oturumu Kapat</span>
                    <span className="sm:hidden">Çıkış</span>
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
