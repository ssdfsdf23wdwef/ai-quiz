
import React from 'react';
import { PersonalizedQuizType } from '../types'; // Import PersonalizedQuizType

export type QuizStageKey = 'course_selection' | 'personalized_quiz_type_selection' | 'file_upload' | 'subtopic_selection' | 'preferences' | 'generating';

interface StepConfig {
  key: QuizStageKey;
  title: string;
  icon: string;
  description: string; 
  subDescription: string; 
}

// Base steps available for both quick and personalized (after type selection for personalized)
const baseStepsConfig: StepConfig[] = [
  { 
    key: 'file_upload', 
    title: 'Dosya Yükleme', 
    icon: 'fas fa-file-upload',
    description: 'Dosya Yükleme', 
    subDescription: 'Sınav oluşturmak için bir dosya yükleyin.'
  },
  { 
    key: 'subtopic_selection', 
    title: 'Alt Konular', 
    icon: 'fas fa-list-ul',
    description: 'Alt Konu Seçimi',
    subDescription: 'Sınavınız için odaklanmak istediğiniz alt konuları seçin (isteğe bağlı).'
  },
  { 
    key: 'preferences', 
    title: 'Tercihler', 
    icon: 'fas fa-sliders-h',
    description: 'Sınav Ayarları',
    subDescription: 'Soru sayısı ve zorluk seviyesi gibi sınav ayarlarını yapın.'
   },
];

const personalizedOnlyStepsConfig: StepConfig[] = [
   { 
    key: 'course_selection', 
    title: 'Ders Seçimi', 
    icon: 'fas fa-layer-group',
    description: 'Ders Seçimi', 
    subDescription: 'Kişiselleştirilmiş sınavınız için bir ders seçin veya yeni bir ders oluşturun.'
  },
  {
    key: 'personalized_quiz_type_selection',
    title: 'Sınav Türü',
    icon: 'fas fa-cogs',
    description: 'Sınav Türü Seçimi',
    subDescription: 'Kişiselleştirilmiş sınavınız için bir tür seçin (Kapsamlı, Yeni Konular, Zayıf Konular).'
  }
];


interface QuizCreationLayoutProps {
  currentStageKey: QuizStageKey;
  progress: number; 
  children: React.ReactNode;
  onBack?: () => void;
  quizMode?: 'quick' | 'personalized';
  currentPersonalizedQuizType?: PersonalizedQuizType | null;
  theme?: string;
}

const QuizCreationLayout: React.FC<QuizCreationLayoutProps> = ({
  currentStageKey,
  progress,
  children,
  onBack,
  quizMode,
  currentPersonalizedQuizType,
  theme,
}) => {
  const effectiveCurrentStageKey = currentStageKey === 'generating' ? 'preferences' : currentStageKey;
  
  const personalizedBaseSteps = (quizMode === 'personalized' && currentPersonalizedQuizType === 'weak_topics')
    ? baseStepsConfig.filter(step => step.key !== 'file_upload') // Skip file_upload for weak_topics
    : baseStepsConfig;

  const activeStepsConfig = quizMode === 'personalized' 
    ? [...personalizedOnlyStepsConfig, ...personalizedBaseSteps]
    : baseStepsConfig; 

  const currentActiveStepIndex = activeStepsConfig.findIndex(step => step.key === effectiveCurrentStageKey);
  let currentStageInfo = activeStepsConfig.find(step => step.key === effectiveCurrentStageKey) || activeStepsConfig[0];

  let stageDescription = currentStageInfo.description;
  let stageSubDescription = currentStageInfo.subDescription;

  if (quizMode === 'personalized') {
    if (currentStageInfo.key === 'course_selection') {
      stageDescription = 'Ders Seçimi';
      stageSubDescription = 'Kişiselleştirilmiş sınavınız için bir ders seçin veya oluşturun.';
    } else if (currentStageInfo.key === 'personalized_quiz_type_selection') {
      stageDescription = 'Kişisel Sınav Türü';
      stageSubDescription = 'Sınavınız için bir tür seçin: Kapsamlı, Yeni Konular veya Zayıf Konular.';
    } else if (currentStageInfo.key === 'file_upload') { // This will be shown for 'new_topics' & 'comprehensive'
      stageDescription = 'Kişisel Sınav İçin Dosya';
      stageSubDescription = 'Seçtiğiniz ders ve sınav türü için temel olacak bir PDF dosyası yükleyin.';
    } else if (currentStageInfo.key === 'subtopic_selection') {
      stageDescription = currentPersonalizedQuizType === 'weak_topics' ? 'Zayıf Konu Seçimi' : 'Kişisel Sınav Konuları';
      stageSubDescription = currentPersonalizedQuizType === 'weak_topics' 
        ? 'Sınavınızda odaklanmak istediğiniz zayıf konuları seçin.'
        : 'Kişiselleştirilmiş sınavınızda odaklanılacak alt konuları belirleyin.';
    } else if (currentStageInfo.key === 'preferences') {
      stageDescription = currentPersonalizedQuizType === 'weak_topics' ? 'Zayıf Konular Sınav Ayarları' : 'Kişisel Sınav Ayarları';
      stageSubDescription = currentPersonalizedQuizType === 'weak_topics'
        ? 'Seçtiğiniz zayıf konular için sınav ayarlarını yapın.'
        : 'Soru sayısı ve zorluk seviyesi gibi kişiselleştirilmiş sınav ayarlarını yapın.';
    }
  } else { // Quick Quiz
     if (currentStageInfo.key === 'file_upload') {
      stageDescription = 'Hızlı Sınav İçin Dosya';
      stageSubDescription = 'Hızlı sınavınız için bir PDF dosyası yükleyin.';
    } else if (currentStageInfo.key === 'subtopic_selection') {
      stageDescription = 'Hızlı Sınav Konuları';
      stageSubDescription = 'Hızlı sınavınızda odaklanılacak alt konuları belirleyin (isteğe bağlı).';
    } else if (currentStageInfo.key === 'preferences') {
      stageDescription = 'Hızlı Sınav Ayarları';
      stageSubDescription = 'Soru sayısı ve zorluk seviyesi gibi hızlı sınav ayarlarını yapın.';
    }
  }
  
  if (currentStageKey === 'generating') {
    stageDescription = "Sınav Oluşturuluyor";
    stageSubDescription = "Lütfen bekleyin, yapay zeka sınavınızı hazırlıyor...";
  }


  const layoutTitle = quizMode === 'personalized' ? "Kişiselleştirilmiş Sınav Oluşturma" : "Hızlı Sınav Oluşturma";
  const layoutSubtitle = quizMode === 'personalized' ? "Size özel sınav oluşturma süreci" : "Anında sınav oluşturma süreci";

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full h-full">
      {/* Left Stepper Column */}
      <div className={`w-full md:w-1/3 lg:w-1/4 p-6 rounded-xl shadow-lg flex flex-col ${
        theme === 'dark' ? 'bg-secondary-800' : 'bg-white'
      }`}>
        <div className="flex items-center mb-6">
          <div className={`p-3 rounded-lg mr-4 ${
            theme === 'dark' ? 'bg-primary-500/20' : 'bg-primary-100'
          }`}>
            <i className={`fas ${quizMode === 'personalized' ? 'fa-user-graduate' : 'fa-bolt'} text-2xl ${
              theme === 'dark' ? 'text-primary-400' : 'text-primary-600'
            }`}></i>
          </div>
          <div>
            <h2 className={`text-xl font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>{layoutTitle}</h2>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>{layoutSubtitle}</p>
          </div>
        </div>

        <nav className="space-y-3 flex-grow">
          {activeStepsConfig.map((step, index) => {
            const isActive = step.key === effectiveCurrentStageKey;
            const isCompleted = index < currentActiveStepIndex;
            const displayStepKeyForStatus = currentStageKey === 'generating' && step.key === 'preferences' ? 'generating' : step.key;
            
            let statusText = 'Bekliyor';
            let statusColor = theme === 'dark' ? 'text-gray-500' : 'text-gray-500';
            if (isActive) {
                statusText = displayStepKeyForStatus === 'generating' ? 'Oluşturuluyor...' : 'Devam Ediyor';
                statusColor = theme === 'dark' ? 'text-blue-400' : 'text-blue-600';
            } else if (isCompleted) {
                statusText = 'Tamamlandı';
                statusColor = theme === 'dark' ? 'text-green-400' : 'text-green-600';
            }
            
            // If it's weak_topics mode and the step is file_upload (which should be skipped)
            // AND the current active step is beyond where file_upload would have been, mark file_upload as completed/skipped.
            let isFileuploadSkippedAndCompleted = false;
            if (quizMode === 'personalized' && currentPersonalizedQuizType === 'weak_topics' && step.key === 'file_upload') {
                const personalizedTypeSelectionIndex = activeStepsConfig.findIndex(s => s.key === 'personalized_quiz_type_selection');
                if (currentActiveStepIndex > personalizedTypeSelectionIndex) { // If we are past type selection
                     isFileuploadSkippedAndCompleted = true; // Mark file upload as 'completed' (or N/A)
                     statusText = 'Atlandı'; // Or 'Tamamlandı' or 'Geçerli Değil'
                     statusColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'; // Muted color
                }
            }


            return (
              <div
                key={step.key}
                className={`p-4 rounded-lg transition-all duration-200 ease-in-out ${
                  isActive 
                    ? (theme === 'dark' ? 'bg-blue-600 shadow-md' : 'bg-blue-500 shadow-md')
                    : (isCompleted || isFileuploadSkippedAndCompleted)
                      ? (theme === 'dark' ? 'bg-secondary-700/50 opacity-70' : 'bg-gray-100 opacity-70')
                      : (theme === 'dark' ? 'bg-secondary-700/50 hover:bg-secondary-700' : 'bg-gray-100 hover:bg-gray-200')
                }`}
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-md mr-3 ${
                    isActive 
                      ? (theme === 'dark' ? 'bg-blue-500' : 'bg-blue-400')
                      : (isCompleted || isFileuploadSkippedAndCompleted) 
                        ? (theme === 'dark' ? 'bg-green-500/30' : 'bg-green-100')
                        : (theme === 'dark' ? 'bg-secondary-600' : 'bg-gray-200')
                  }`}>
                    <i className={`${step.icon} w-5 h-5 ${
                      isActive 
                        ? 'text-white'
                        : (isCompleted || isFileuploadSkippedAndCompleted) 
                          ? (isFileuploadSkippedAndCompleted 
                              ? (theme === 'dark' ? 'text-gray-500' : 'text-gray-400')
                              : (theme === 'dark' ? 'text-green-300' : 'text-green-500'))
                          : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')
                    }`}></i>
                  </div>
                  <div className="flex-grow">
                    <h3 className={`font-medium ${
                      isActive 
                        ? 'text-white' 
                        : (theme === 'dark' ? 'text-gray-200' : 'text-gray-800')
                    }`}>{step.title}</h3>
                    <p className={`text-xs ${statusColor}`}>{statusText}</p>
                  </div>
                  {isActive && displayStepKeyForStatus !== 'generating' && <i className="fas fa-arrow-right text-white ml-auto"></i>}
                  {isActive && displayStepKeyForStatus === 'generating' && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-auto"></div>}
                  {(isCompleted || isFileuploadSkippedAndCompleted) && !isActive && <i className={`fas ${isFileuploadSkippedAndCompleted ? 'fa-minus-circle' : 'fa-check-circle'} ${
                    isFileuploadSkippedAndCompleted 
                      ? (theme === 'dark' ? 'text-gray-500' : 'text-gray-400')
                      : (theme === 'dark' ? 'text-green-400' : 'text-green-500')
                  } ml-auto`}></i>}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="mt-auto pt-6">
          <p className={`text-xs mb-1 text-right ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>{progress}% Tamamlandı</p>
          <div className={`w-full rounded-full h-2.5 ${
            theme === 'dark' ? 'bg-secondary-700' : 'bg-gray-200'
          }`}>
            <div
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Right Content Column */}
      <div className={`w-full md:w-2/3 lg:w-3/4 p-6 sm:p-8 rounded-xl shadow-lg flex flex-col ${
        theme === 'dark' ? 'bg-secondary-800' : 'bg-white'
      }`}>
        <div className="flex justify-between items-center mb-1">
            <h2 className={`text-2xl font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>{stageDescription}</h2>
            {onBack && currentStageKey !== 'generating' && ( 
                 <button 
                    onClick={onBack}
                    className={`text-sm transition-colors flex items-center ${
                      theme === 'dark' 
                        ? 'text-gray-400 hover:text-white' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    aria-label="Geri dön"
                >
                    <i className="fas fa-arrow-left mr-2"></i> Geri
                </button>
            )}
        </div>
        <p className={`text-sm mb-6 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>{stageSubDescription}</p>
        
        <div className="flex-grow overflow-y-auto custom-scrollbar-layout pr-2">
           {children}
        </div>
      </div>
      <style>{`
        .custom-scrollbar-layout::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar-layout::-webkit-scrollbar-track {
          background: var(--scrollbar-track-color);
          border-radius: 10px;
        }
        .custom-scrollbar-layout::-webkit-scrollbar-thumb {
          background: var(--scrollbar-thumb-color);
          border-radius: 10px;
        }
        .custom-scrollbar-layout::-webkit-scrollbar-thumb:hover {
          background: var(--scrollbar-thumb-hover-color);
        }
        .custom-scrollbar-layout {
          scrollbar-width: thin;
          scrollbar-color: var(--scrollbar-thumb-color) var(--scrollbar-track-color);
        }
      `}</style>
    </div>
  );
};

export default React.memo(QuizCreationLayout);
