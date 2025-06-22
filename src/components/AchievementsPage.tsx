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
                      ? 'bg-white dark:bg-secondary-800 ring-gray-200 dark:ring-secondary-700/50' 
                      : 'bg-gray-100 dark:bg-secondary-800/60 ring-gray-200 dark:ring-secondary-700/30 opacity-70'}`}>
      
      {isUnlocked && category && (
        <span className={`absolute top-3 right-3 px-2 py-0.5 text-xs font-semibold rounded-full 
                        ${category === 'Sınavlar' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300' : 
                          category === 'Performans' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300' :
                          category === 'Öğrenme' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300' : 
                          'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300'}`}>
          {category}
        </span>
      )}

      <div className="flex items-center mb-4">
        <div className={`p-3 rounded-lg mr-4 ${isUnlocked ? 'bg-gradient-to-br from-yellow-400 to-amber-500 dark:from-yellow-500 dark:to-amber-600' : 'bg-gray-200 dark:bg-secondary-700'}`}>
          <i className={`${icon} text-3xl ${isUnlocked ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`}></i>
        </div>
        <div className="flex-grow">
          <h3 className={`text-xl font-semibold ${isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{title}</h3>
        </div>
      </div>
      
      <p className={`text-sm mb-4 flex-grow ${isUnlocked ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
        {description}
      </p>

      {progress && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className={isUnlocked ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400 dark:text-gray-500'}>İlerleme</span>
            <span className={isUnlocked ? 'text-gray-800 dark:text-white' : 'text-gray-400 dark:text-gray-500'}>{progress.current} / {progress.target}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-secondary-700 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full transition-all duration-500 ease-out ${isUnlocked ? (progressBarWidth === 100 ? 'bg-green-500' : 'bg-yellow-500') : 'bg-gray-300 dark:bg-secondary-600'}`}
              style={{ width: `${progressBarWidth}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="mt-auto text-xs">
        {isUnlocked ? (
          <p className="text-green-600 dark:text-green-400 flex items-center">
            <i className="fas fa-check-circle mr-1.5"></i> Kilidi Açıldı
            {unlockedDate && ` - ${new Date(unlockedDate).toLocaleDateString('tr-TR')}`}
          </p>
        ) : (
          <p className="text-gray-400 dark:text-gray-500 flex items-center">
            <i className="fas fa-lock mr-1.5"></i> Kilitli
          </p>
        )}
      </div>
    </div>
  );
});


const AchievementsPage: React.FC<AchievementsPageProps> = ({ achievements, onBack }) => {
  const unlockedAchievements = achievements.filter(a => a.isUnlocked);
  const lockedAchievements = achievements.filter(a => !a.isUnlocked);

  return (
    <div className="w-full h-full flex flex-col p-0 text-gray-800 dark:text-gray-200">
      <div className="mb-6 px-1 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Başarılarım</h1>
          <p className="text-gray-500 dark:text-gray-400">QuizMaster'daki yolculuğunuzda kazandığınız özel rozetler ve başarılar.</p>
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

      {achievements.length === 0 ? (
        <EmptyState
          iconClass="fas fa-trophy"
          title="Henüz Başarım Yok"
          message="Uygulamayı kullandıkça ve hedeflerinize ulaştıkça başarılarınız burada görünecektir. Yeni sınavlar oluşturarak ve öğrenme hedeflerinizi tamamlayarak başlayın!"
          actionButton={onBack ? {
            text: "Ana Sayfaya Dön",
            onClick: onBack,
            iconClass: "fas fa-home",
          } : undefined}
        />
      ) : (
        <div className="flex-grow overflow-y-auto space-y-8 custom-scrollbar-achievements pr-1">
          {unlockedAchievements.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 px-1">Kazanılan Başarılar ({unlockedAchievements.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unlockedAchievements.map(ach => <AchievementCard key={ach.id} achievement={ach} />)}
              </div>
            </section>
          )}

          {lockedAchievements.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold text-gray-500 dark:text-gray-400 mb-4 px-1">Kilitli Başarılar ({lockedAchievements.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lockedAchievements.map(ach => <AchievementCard key={ach.id} achievement={ach} />)}
              </div>
            </section>
          )}
        </div>
      )}
      <style>{`
        .custom-scrollbar-achievements::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar-achievements::-webkit-scrollbar-track {
          background: var(--scrollbar-track-color);
        }
        .custom-scrollbar-achievements::-webkit-scrollbar-thumb {
          background: var(--scrollbar-thumb-color);
          border-radius: 10px;
        }
        .custom-scrollbar-achievements::-webkit-scrollbar-thumb:hover {
          background: var(--scrollbar-thumb-hover-color);
        }
        .custom-scrollbar-achievements {
          scrollbar-width: thin;
          scrollbar-color: var(--scrollbar-thumb-color) var(--scrollbar-track-color);
        }
      `}</style>
    </div>
  );
};

export default React.memo(AchievementsPage);