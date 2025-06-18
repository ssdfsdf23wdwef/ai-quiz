import React from 'react';
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
  const handleLogout = async () => {
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
    }
  };

  if (!currentUser) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-0 text-gray-800 dark:text-gray-200">
            <p>Kullanıcı bilgileri yüklenemedi veya oturum açılmamış.</p>
            {onBack && <button onClick={onBack} className="mt-4 px-4 py-2 bg-primary-500 text-white rounded">Ana Sayfaya Dön</button>}
        </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-0 text-gray-800 dark:text-gray-200">
      <div className="mb-6 px-1 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Profilim</h1>
          <p className="text-gray-500 dark:text-gray-400">Hesap bilgilerinizi görüntüleyin ve yönetin.</p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-200 dark:bg-secondary-700 hover:bg-gray-300 dark:hover:bg-secondary-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors flex items-center"
            aria-label="Ana Sayfaya Dön"
          >
            <i className="fas fa-arrow-left mr-2"></i> Ana Sayfa
          </button>
        )}
      </div>

      <div className="flex-grow overflow-y-auto bg-white dark:bg-secondary-800 rounded-lg shadow-xl ring-1 ring-gray-200 dark:ring-secondary-700/50 p-6 md:p-8 space-y-6">
        <section className="bg-gray-50 dark:bg-secondary-700/40 p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Kullanıcı Bilgileri</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Görünen Ad</p>
              <p className="text-lg text-gray-800 dark:text-gray-100">{currentUser.displayName || 'Belirtilmemiş'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">E-posta</p>
              <p className="text-lg text-gray-800 dark:text-gray-100">{currentUser.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Kullanıcı ID</p>
              <p className="text-xs text-gray-700 dark:text-gray-300 break-all">{currentUser.uid}</p>
            </div>
          </div>
        </section>

        {/* Future sections like "Change Password", "Update Profile" can be added here */}

        <div className="pt-6 mt-4 border-t border-gray-300 dark:border-secondary-700/50">
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto px-6 py-3 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-lg font-semibold shadow-lg text-base flex items-center justify-center"
            aria-label="Oturumu Kapat"
          >
            <i className="fas fa-sign-out-alt mr-2"></i> Oturumu Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
