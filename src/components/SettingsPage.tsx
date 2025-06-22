
import React, { useState, useEffect } from 'react';
import { AppSettings, AppConfig } from '../types';
import { getThemeClasses } from '../utils/themeUtils';

interface SettingsPageProps {
  currentSettings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onBack?: () => void;
  appConfigDefaults: AppConfig['appSettingsDefaults']; // Pass defaults from appConfig
  theme?: string; // Add theme prop
}

const SettingsPage: React.FC<SettingsPageProps> = ({ currentSettings, onSaveSettings, onBack, appConfigDefaults, theme }) => {
  const [defaultTimerEnabled, setDefaultTimerEnabled] = useState(currentSettings.defaultTimerEnabled);
  const [secondsPerQuestion, setSecondsPerQuestion] = useState(currentSettings.secondsPerQuestion);
  const [numOptionsPerQuestion, setNumOptionsPerQuestion] = useState(currentSettings.numOptionsPerQuestion);
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>(currentSettings.theme);
  
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    setDefaultTimerEnabled(currentSettings.defaultTimerEnabled);
    setSecondsPerQuestion(currentSettings.secondsPerQuestion);
    setNumOptionsPerQuestion(currentSettings.numOptionsPerQuestion);
    setSelectedTheme(currentSettings.theme);
  }, [currentSettings]);

  const handleSave = () => {
    const newSettings = {
      defaultTimerEnabled,
      secondsPerQuestion: Number(secondsPerQuestion),
      numOptionsPerQuestion: Number(numOptionsPerQuestion),
      theme: selectedTheme,
    };
    onSaveSettings(newSettings);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };
  
  const handleResetToDefaults = () => {
    const configDefaultSettings: AppSettings = {
        defaultTimerEnabled: appConfigDefaults.defaultTimerEnabled, 
        secondsPerQuestion: appConfigDefaults.secondsPerQuestion, 
        numOptionsPerQuestion: appConfigDefaults.numOptionsPerQuestion,
        theme: (appConfigDefaults.theme === 'light' || appConfigDefaults.theme === 'dark') ? appConfigDefaults.theme : 'dark',
    };
    setDefaultTimerEnabled(configDefaultSettings.defaultTimerEnabled);
    setSecondsPerQuestion(configDefaultSettings.secondsPerQuestion);
    setNumOptionsPerQuestion(configDefaultSettings.numOptionsPerQuestion);
    setSelectedTheme(configDefaultSettings.theme);
    onSaveSettings(configDefaultSettings); 
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const themeClasses = getThemeClasses(theme);

  const SettingCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className={`p-4 sm:p-6 rounded-xl shadow-lg ring-1 ${themeClasses.bg.secondary} ${themeClasses.ring.primary}`}>
      <h2 className={`text-lg sm:text-xl font-semibold mb-4 sm:mb-5 ${themeClasses.text.primary}`}>{title}</h2>
      <div className="space-y-4 sm:space-y-5">
        {children}
      </div>
    </section>
  );

  return (
    <div className={`w-full h-full flex flex-col p-0 ${themeClasses.text.secondary}`}>
      <div className="mb-4 sm:mb-6 px-1 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-grow">
          <h1 className={`text-2xl sm:text-3xl font-bold mb-1 ${themeClasses.text.primary}`}>Uygulama Ayarları</h1>
          <p className={`text-sm sm:text-base ${themeClasses.text.muted}`}>Sınav varsayılanlarını ve diğer uygulama tercihlerini yapılandırın.</p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center text-sm sm:text-base self-start sm:self-auto touch-target ${themeClasses.bg.button.secondary} ${themeClasses.text.secondary}`}
            aria-label="Ana Sayfaya Dön"
          >
            <i className="fas fa-arrow-left mr-1 sm:mr-2"></i> 
            <span className="hidden sm:inline">Ana Sayfa</span>
            <span className="sm:hidden">Geri</span>
          </button>
        )}
      </div>

      <div className={`flex-grow overflow-y-auto rounded-lg shadow-xl ring-1 p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 custom-scrollbar-settings pr-2 ${themeClasses.bg.card} ${themeClasses.ring.primary}`}>
        
        <SettingCard title="Görünüm Ayarları">
          <div>
            <label htmlFor="theme-select" className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
              Tema Seçimi
            </label>
            <select
              id="theme-select"
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value as 'light' | 'dark')}
              className={`w-full sm:max-w-xs p-3 sm:p-2.5 rounded-lg text-base sm:text-sm touch-target ${themeClasses.bg.input} ${themeClasses.border.input} ${themeClasses.text.primary} ${themeClasses.ring.focus}`}
            >
              <option value="light">Açık Mod</option>
              <option value="dark">Karanlık Mod</option>
            </select>
            <p className={`mt-2 text-xs ${themeClasses.text.muted}`}>Uygulamanın genel renk temasını seçin.</p>
          </div>
        </SettingCard>
        
        <SettingCard title="Zamanlayıcı Ayarları">
            <div>
              <label htmlFor="defaultTimerEnabled" className="flex items-start sm:items-center cursor-pointer touch-target">
                <input
                  id="defaultTimerEnabled"
                  type="checkbox"
                  checked={defaultTimerEnabled}
                  onChange={(e) => setDefaultTimerEnabled(e.target.checked)}
                  className={`form-checkbox h-5 w-5 sm:h-4 sm:w-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 mt-0.5 sm:mt-0 flex-shrink-0 ${themeClasses.bg.input} ${themeClasses.border.input}`}
                />
                <span className={`ml-3 text-sm sm:text-sm font-medium leading-relaxed ${themeClasses.text.secondary}`}>Sınav Zamanlayıcısını Varsayılan Olarak Etkinleştir</span>
              </label>
              <p className={`ml-8 mt-2 text-xs leading-relaxed ${themeClasses.text.muted}`}>Bu ayar, yeni bir sınav başlatırken zamanlayıcının başlangıç durumunu belirler.</p>
            </div>
            <div>
              <label htmlFor="secondsPerQuestion" className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                Soru Başına Süre (Saniye)
              </label>
              <input
                id="secondsPerQuestion"
                type="number"
                min="10"
                max="600"
                step="5"
                value={secondsPerQuestion}
                onChange={(e) => setSecondsPerQuestion(parseInt(e.target.value, 10))}
                className={`w-full sm:max-w-xs p-3 sm:p-2.5 rounded-lg text-base sm:text-sm touch-target ${themeClasses.bg.input} ${themeClasses.border.input} ${themeClasses.text.primary} ${themeClasses.ring.focus}`}
                aria-describedby="secondsPerQuestionHelp"
              />
              <p id="secondsPerQuestionHelp" className={`mt-2 text-xs leading-relaxed ${themeClasses.text.muted}`}>Zamanlayıcı etkinleştirildiğinde her soru için varsayılan süre (10-600 saniye).</p>
            </div>
        </SettingCard>

        <SettingCard title="Soru Ayarları">
            <div>
              <label htmlFor="numOptionsPerQuestion" className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                Soru Başına Seçenek Sayısı
              </label>
              <select
                id="numOptionsPerQuestion"
                value={numOptionsPerQuestion}
                onChange={(e) => setNumOptionsPerQuestion(parseInt(e.target.value, 10))}
                className={`w-full sm:max-w-xs p-3 sm:p-2.5 rounded-lg text-base sm:text-sm touch-target ${themeClasses.bg.input} ${themeClasses.border.input} ${themeClasses.text.primary} ${themeClasses.ring.focus}`}
                aria-describedby="numOptionsHelp"
              >
                <option value="2">2 Seçenek</option>
                <option value="3">3 Seçenek</option>
                <option value="4">4 Seçenek</option>
                <option value="5">5 Seçenek</option>
                <option value="6">6 Seçenek</option>
              </select>
              <p id="numOptionsHelp" className={`mt-2 text-xs leading-relaxed ${themeClasses.text.muted}`}>Her çoktan seçmeli soru için varsayılan seçenek sayısı.</p>
            </div>
        </SettingCard>
        
        {/* Action Buttons */}
        <div className={`pt-6 sm:pt-8 mt-4 border-t flex flex-col sm:flex-row justify-end items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 ${themeClasses.border.primary}`}>
          {showSuccessMessage && (
            <div className={`text-sm px-3 py-2 rounded-md flex items-center order-first sm:order-none sm:mr-auto ${
              theme === 'dark' 
                ? 'text-green-400 bg-green-500/10' 
                : 'text-green-600 bg-green-100'
            }`}>
                <i className="fas fa-check-circle mr-2"></i>Ayarlar başarıyla kaydedildi!
            </div>
           )}
           <button
            onClick={handleResetToDefaults}
            className={`w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-2.5 text-white rounded-lg font-medium shadow-md text-sm flex items-center justify-center touch-target ${themeClasses.bg.button.warning}`}
            aria-label="Ayarları Varsayılana Sıfırla"
          >
            <i className="fas fa-undo-alt mr-2"></i> 
            <span className="hidden sm:inline">Varsayılana Sıfırla</span>
            <span className="sm:hidden">Sıfırla</span>
          </button>
          <button
            onClick={handleSave}
            className={`w-full sm:w-auto px-6 sm:px-8 py-3 text-white rounded-lg font-semibold shadow-lg text-base flex items-center justify-center touch-target ${themeClasses.bg.button.primary}`}
            aria-label="Ayarları Kaydet"
          >
            <i className="fas fa-save mr-2"></i> 
            <span className="hidden sm:inline">Ayarları Kaydet</span>
            <span className="sm:hidden">Kaydet</span>
          </button>
        </div>
      </div>
      <style>{`
        .custom-scrollbar-settings::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar-settings::-webkit-scrollbar-track {
          background: var(--scrollbar-track-color);
          border-radius: 10px;
        }
        .custom-scrollbar-settings::-webkit-scrollbar-thumb {
          background: var(--scrollbar-thumb-color);
          border-radius: 10px;
        }
        .custom-scrollbar-settings::-webkit-scrollbar-thumb:hover {
          background: var(--scrollbar-thumb-hover-color);
        }
        .custom-scrollbar-settings {
          scrollbar-width: thin;
          scrollbar-color: var(--scrollbar-thumb-color) var(--scrollbar-track-color);
        }
      `}</style>
    </div>
  );
};

export default React.memo(SettingsPage);
