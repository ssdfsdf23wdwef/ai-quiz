
import { useState, useEffect, useCallback } from 'react';
import { AppSettings, AppConfig } from '../types';
import { LOCAL_STORAGE_KEY_APP_SETTINGS } from '../constants';

export const useAppSettings = (appConfig: AppConfig | null) => {
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!appConfig) {
      // Config not loaded yet, or failed to load.
      // We might already have settings from a previous session, or we might need to wait.
      // For now, if appConfig is null, we assume we might still be in a loading phase or using defaults.
      // If settings were previously loaded from localStorage, they might persist until config provides new defaults.
      return;
    }
    
    setIsLoading(true);
    const configDefaults = appConfig.appSettingsDefaults;
    const defaultValues: AppSettings = {
      defaultTimerEnabled: configDefaults.defaultTimerEnabled,
      secondsPerQuestion: configDefaults.secondsPerQuestion,
      numOptionsPerQuestion: configDefaults.numOptionsPerQuestion,
      theme: (configDefaults.theme === 'light' || configDefaults.theme === 'dark') ? configDefaults.theme : 'dark',
    };

    let currentActiveSettings = { ...defaultValues };
    try {
      const savedSettingsString = localStorage.getItem(LOCAL_STORAGE_KEY_APP_SETTINGS);
      if (savedSettingsString) {
        const parsedSettings = JSON.parse(savedSettingsString);
        currentActiveSettings = {
          defaultTimerEnabled: typeof parsedSettings.defaultTimerEnabled === 'boolean' ? parsedSettings.defaultTimerEnabled : defaultValues.defaultTimerEnabled,
          secondsPerQuestion: typeof parsedSettings.secondsPerQuestion === 'number' && parsedSettings.secondsPerQuestion > 0 ? parsedSettings.secondsPerQuestion : defaultValues.secondsPerQuestion,
          numOptionsPerQuestion: typeof parsedSettings.numOptionsPerQuestion === 'number' && parsedSettings.numOptionsPerQuestion >= 2 ? parsedSettings.numOptionsPerQuestion : defaultValues.numOptionsPerQuestion,
          theme: (parsedSettings.theme === 'light' || parsedSettings.theme === 'dark') ? parsedSettings.theme : defaultValues.theme,
        };
      }
    } catch (error) {
        console.error("Error loading app settings from localStorage:", error);
    }
    setAppSettings(currentActiveSettings);
    setIsLoading(false);
  }, [appConfig]);

  useEffect(() => {
    if (!appSettings) return;
    const root = document.documentElement;
    if (appSettings.theme === 'light') {
      root.classList.remove('dark');
      root.style.setProperty('--scrollbar-track-color', '#e2e8f0'); // secondary-200 for light
      root.style.setProperty('--scrollbar-thumb-color', '#94a3b8'); // secondary-400 for light
      root.style.setProperty('--scrollbar-thumb-hover-color', '#64748b'); // secondary-500 for light
    } else {
      root.classList.add('dark');
      root.style.setProperty('--scrollbar-track-color', '#334155'); // secondary-700 for dark
      root.style.setProperty('--scrollbar-thumb-color', '#64748b'); // secondary-500 for dark
      root.style.setProperty('--scrollbar-thumb-hover-color', '#94a3b8'); // secondary-400 for dark
    }
  }, [appSettings?.theme]);

  const updateAppSettings = useCallback((newSettings: AppSettings) => {
    if (!appConfig || !appSettings) return; // Guard against config/settings not loaded

    const validatedSettings: AppSettings = {
        defaultTimerEnabled: typeof newSettings.defaultTimerEnabled === 'boolean' ? newSettings.defaultTimerEnabled : appSettings.defaultTimerEnabled,
        secondsPerQuestion: typeof newSettings.secondsPerQuestion === 'number' && newSettings.secondsPerQuestion >= 10 && newSettings.secondsPerQuestion <= 600 ? newSettings.secondsPerQuestion : appSettings.secondsPerQuestion,
        numOptionsPerQuestion: typeof newSettings.numOptionsPerQuestion === 'number' && newSettings.numOptionsPerQuestion >= 2 && newSettings.numOptionsPerQuestion <= 6 ? newSettings.numOptionsPerQuestion : appSettings.numOptionsPerQuestion,
        theme: (newSettings.theme === 'light' || newSettings.theme === 'dark') ? newSettings.theme : appSettings.theme,
    };
    setAppSettings(validatedSettings);
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY_APP_SETTINGS, JSON.stringify(validatedSettings));
    } catch (error) {
        console.error("Error saving app settings to localStorage:", error);
    }
  }, [appSettings, appConfig]);

  return {
    appSettings,
    updateAppSettings,
    isLoading,
    theme: appSettings?.theme // Expose theme directly for convenience
  };
};
