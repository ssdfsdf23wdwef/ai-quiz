import React from 'react';
import { Achievement } from '../types';
import EmptyState from './EmptyState';

interface AchievementsPageProps {
  achievements: Achievement[];
  onBack?: () => void;
  theme?: string;
}

const AchievementCard: React.FC<{ achievement: Achievement; theme?: string }> = React.memo(({ achievement, theme }) => {
  const { title, description, icon, isUnlocked, unlockedDate, progress, category } = achievement;
  const progressBarWidth = progress && isUnlocked ? (progress.current / progress.target) * 100 : (isUnlocked ? 100 : 0);

  return (
    <div className={`relative p-6 rounded-xl shadow-lg ring-1 flex flex-col transition-all duration-300 ease-in-out transform hover:scale-105
      ${isUnlocked 
        ? (theme === 'dark' ? 'bg-secondary-800 ring-secondary-700/50' : 'bg-white ring-gray-200')
        : (theme === 'dark' ? 'bg-secondary-800/60 ring-secondary-700/30 opacity-70' : 'bg-gray-100 ring-gray-200 opacity-70')}`}
    >
      {isUnlocked && category && (
        <span className={`absolute top-3 right-3 px-2 py-0.5 text-xs font-semibold rounded-full 
          ${category === 'Sınavlar' ? (theme === 'dark' ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700') : 
            category === 'Performans' ? (theme === 'dark' ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700') :
            category === 'Öğrenme' ? (theme === 'dark' ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700') :
            (theme === 'dark' ? 'bg-gray-500/20 text-gray-300' : 'bg-gray-100 text-gray-700')}`}>{category}</span>
      )}
      <div className="flex items-center mb-4">
        <div className={`p-3 rounded-lg mr-4 ${isUnlocked ? (theme === 'dark' ? 'bg-gradient-to-br from-yellow-500 to-amber-600' : 'bg-gradient-to-br from-yellow-400 to-amber-500') : (theme === 'dark' ? 'bg-secondary-700' : 'bg-gray-200')}`}>
          <i className={`${icon} text-3xl ${isUnlocked ? 'text-white' : (theme === 'dark' ? 'text-gray-500' : 'text-gray-400')}`}></i>
        </div>
        <div className="flex-grow">
          <h3 className={`text-xl font-semibold ${isUnlocked ? (theme === 'dark' ? 'text-white' : 'text-gray-900') : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}`}>{title}</h3>
        </div>
      </div>
      <p className={`text-sm mb-4 flex-grow ${isUnlocked ? (theme === 'dark' ? 'text-gray-300' : 'text-gray-600') : (theme === 'dark' ? 'text-gray-500' : 'text-gray-400')}`}>{description}</p>
      {progress && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className={isUnlocked ? (theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600') : (theme === 'dark' ? 'text-gray-500' : 'text-gray-400')}>İlerleme</span>
            <span className={isUnlocked ? (theme === 'dark' ? 'text-white' : 'text-gray-800') : (theme === 'dark' ? 'text-gray-500' : 'text-gray-400')}>{progress.current} / {progress.target}</span>
          </div>
          <div className={`w-full rounded-full h-2.5 ${theme === 'dark' ? 'bg-secondary-700' : 'bg-gray-200'}`}>
            <div 
              className={`h-2.5 rounded-full transition-all duration-500 ease-out ${isUnlocked ? (progressBarWidth === 100 ? 'bg-green-500' : 'bg-yellow-500') : (theme === 'dark' ? 'bg-secondary-600' : 'bg-gray-300')}`}
              style={{ width: `${progressBarWidth}%` }}
            ></div>
          </div>
        </div>
      )}
      <div className="mt-auto text-xs">
        {isUnlocked ? (
          <p className={theme === 'dark' ? 'text-green-400 flex items-center' : 'text-green-600 flex items-center'}>
            <i className="fas fa-check-circle mr-1.5"></i> Kilidi Açıldı
            {unlockedDate && ` - ${new Date(unlockedDate).toLocaleDateString('tr-TR')}`}
          </p>
        ) : (
          <p className={theme === 'dark' ? 'text-gray-500 flex items-center' : 'text-gray-400 flex items-center'}>
            <i className="fas fa-lock mr-1.5"></i> Kilitli
          </p>
        )}
      </div>
    </div>
  );
});

const AchievementsPage: React.FC<AchievementsPageProps> = ({ achievements, onBack, theme }) => {
  const unlockedAchievements = achievements.filter(a => a.isUnlocked);
  const lockedAchievements = achievements.filter(a => !a.isUnlocked);

  return (
    <div className={`w-full h-full flex flex-col p-0 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
      <div className="mb-6 px-1 flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Başarılarım</h1>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center ${theme === 'dark' ? 'bg-secondary-700 hover:bg-secondary-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
            aria-label="Ana Sayfaya Dön"
          >
            <i className="fas fa-arrow-left mr-2"></i> Ana Sayfa
          </button>
        )}
      </div>
      {achievements.length === 0 ? (
        <EmptyState
          iconClass="fas fa-trophy"
          title="Henüz Başarım Yok"
          message="Uygulamayı kullandıkça ve hedeflerinize ulaştıkça başarılarınız burada görünecektir. Yeni sınavlar oluşturarak ve öğrenme hedeflerinizi tamamlayarak başlayın!"
          theme={theme}
          actionButton={onBack ? {
            text: "Ana Sayfaya Dön",
            onClick: onBack,
            iconClass: "fas fa-home",
          } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {unlockedAchievements.map(a => <AchievementCard key={a.title} achievement={a} theme={theme} />)}
          {lockedAchievements.map(a => <AchievementCard key={a.title} achievement={a} theme={theme} />)}
        </div>
      )}
    </div>
  );
};

export default AchievementsPage;