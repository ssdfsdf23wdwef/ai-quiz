
import yaml from 'js-yaml';
import { AppConfig } from '../types';

let currentConfig: AppConfig | null = null;
let configPromise: Promise<AppConfig> | null = null;

const defaultConfig: AppConfig = { // Fallback in case loading fails critically
  gemini: {
    textModel: "gemini-2.5-flash-preview-04-17",
    identifySubtopics: {
      temperature: 0.0,
      thinkingBudget: 0,
    },
    generateQuiz: {
      defaultTemperature: 0.1,
      personalizedTemperature: 0.3,
      thinkingBudget: 0,
      responseMimeType: "application/json",
    },
  },
  quizDefaults: {
    defaultNumQuestions: 6,
    minQuestionsPerSubtopic: 2,
    minQuestionsForQuiz: 3,
    maxQuestionsForQuiz: 20,
    minSubtopicsForDynamicOptions: 3,
    maxSubtopicsForDynamicOptions: 10,
  },
  appSettingsDefaults: {
    secondsPerQuestion: 90,
    numOptionsPerQuestion: 4,
    theme: "dark",
    defaultTimerEnabled: false,
  },
  maxPdfTextLength: 100000,
};


export const loadAppConfig = (): Promise<AppConfig> => {
  if (currentConfig) {
    return Promise.resolve(currentConfig);
  }
  if (configPromise) {
    return configPromise;
  }

  configPromise = fetch('./appconfig.yaml')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Yapılandırma dosyası yüklenemedi: ${response.status} ${response.statusText}`);
      }
      return response.text();
    })
    .then(yamlText => {
      try {
        const loadedYamlValue = yaml.load(yamlText);

        if (loadedYamlValue === null || loadedYamlValue === undefined || typeof loadedYamlValue !== 'object') {
          console.warn('YAML dosyası boş, yorum içeriyor veya geçerli bir YAML nesnesi değil. Varsayılan yapılandırma kullanılıyor.');
          currentConfig = { ...defaultConfig }; // Use a fresh copy of defaultConfig
          return currentConfig;
        }
        
        const parsedConfig = loadedYamlValue as Partial<AppConfig>;

        currentConfig = {
          ...defaultConfig,
          ...parsedConfig, // Overrides top-level properties from parsedConfig
          gemini: {
            ...defaultConfig.gemini,
            ...(parsedConfig.gemini || {}),
            identifySubtopics: {
              ...defaultConfig.gemini.identifySubtopics,
              ...(parsedConfig.gemini?.identifySubtopics || {}),
            },
            generateQuiz: {
              ...defaultConfig.gemini.generateQuiz,
              ...(parsedConfig.gemini?.generateQuiz || {}),
            },
          },
          quizDefaults: {
            ...defaultConfig.quizDefaults,
            ...(parsedConfig.quizDefaults || {}),
          },
          appSettingsDefaults: {
            ...defaultConfig.appSettingsDefaults,
            ...(parsedConfig.appSettingsDefaults || {}),
          },
          maxPdfTextLength: parsedConfig.maxPdfTextLength ?? defaultConfig.maxPdfTextLength,
        };
        
        // Ensure theme from config is valid, otherwise use default
        if (currentConfig.appSettingsDefaults.theme !== 'light' && currentConfig.appSettingsDefaults.theme !== 'dark') {
            currentConfig.appSettingsDefaults.theme = defaultConfig.appSettingsDefaults.theme;
        }

        return currentConfig;
      } catch (e) {
        // This catch is for actual syntax errors in yaml.load
        console.error("YAML ayrıştırma hatası (sentaks):", e);
        throw new Error(`YAML dosyası sözdizimi hatası nedeniyle ayrıştırılamadı: ${(e as Error).message}`);
      }
    })
    .catch(error => {
      console.error('Uygulama yapılandırması yüklenirken veya ayrıştırılırken hata oluştu:', error.message);
      console.warn('Varsayılan yapılandırma kullanılıyor.');
      currentConfig = { ...defaultConfig }; // Use fallback default config
      return currentConfig;
    })
    .finally(() => {
      configPromise = null; // Clear promise after completion/failure
    });
  return configPromise;
};

export const getConfig = (): AppConfig => {
  if (!currentConfig) {
    console.warn("Yapılandırma henüz yüklenmedi. Kritik hata! Acil varsayılan yapılandırma kullanılıyor. Uygulamanın başlangıcında loadAppConfig çağrıldığından ve beklendiğinden emin olun.");
    currentConfig = { ...defaultConfig }; // Ensure defaultConfig is returned if somehow currentConfig is null
  }
  return currentConfig;
};
