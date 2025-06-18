
import React, { useState, useEffect, useMemo } from 'react';
import { QuizDifficulty, PersonalizedQuizType, AppConfig } from '../types';

interface QuizPreferencesProps {
  onSubmit: (numQuestions: number, difficulty: QuizDifficulty, timerEnabled: boolean) => void;
  onBack: () => void;
  initialNumQuestions: number;
  initialDifficulty: QuizDifficulty;
  initialTimerEnabled: boolean; 
  defaultSecondsPerQuestion: number; 
  selectedSubtopicsCount: number; 
  hasIdentifiedSubtopics: boolean;
  currentQuizMode?: 'quick' | 'personalized' | null;
  currentPersonalizedQuizType?: PersonalizedQuizType | null;
  quizDefaults: AppConfig['quizDefaults']; // Pass quizDefaults from config
}

const QuizPreferences: React.FC<QuizPreferencesProps> = ({
  onSubmit,
  onBack,
  initialNumQuestions,
  initialDifficulty = 'Orta',
  initialTimerEnabled = false, 
  defaultSecondsPerQuestion = 90, 
  selectedSubtopicsCount,
  hasIdentifiedSubtopics,
  currentQuizMode,
  currentPersonalizedQuizType,
  quizDefaults,
}) => {
  const [numQuestions, setNumQuestions] = useState(initialNumQuestions || quizDefaults.defaultNumQuestions);
  const [difficulty, setDifficulty] = useState<QuizDifficulty>(initialDifficulty);
  const [timerEnabled, setTimerEnabled] = useState<boolean>(initialTimerEnabled);

  const dynamicNumQuestionOptions = useMemo(() => {
    const { 
        minQuestionsPerSubtopic, 
        minSubtopicsForDynamicOptions, 
        maxSubtopicsForDynamicOptions,
        minQuestionsForQuiz 
    } = quizDefaults;

    let minQuestionsBasedOnSelection = minQuestionsForQuiz;
    if (selectedSubtopicsCount > 0) {
        minQuestionsBasedOnSelection = Math.max(minQuestionsForQuiz, selectedSubtopicsCount * minQuestionsPerSubtopic);
    }
    
    let options: number[] = [];
    const baseOptionCount = maxSubtopicsForDynamicOptions - minSubtopicsForDynamicOptions + 1;

    if (baseOptionCount > 0) {
        options = Array.from(
            { length: baseOptionCount },
            (_, i) => (minSubtopicsForDynamicOptions + i) * minQuestionsPerSubtopic
        );
    }
    
    // Filter options to be >= minQuestionsBasedOnSelection
    options = options.filter(option => option >= minQuestionsBasedOnSelection && option <= quizDefaults.maxQuestionsForQuiz);

    // If no options are suitable, create a fallback range
    if (options.length === 0) {
        if (minQuestionsBasedOnSelection > quizDefaults.maxQuestionsForQuiz) {
            // If even the minimum calculated based on subtopics exceeds max, use max.
             options = [quizDefaults.maxQuestionsForQuiz];
        } else {
             options = [
                minQuestionsBasedOnSelection, 
                Math.min(quizDefaults.maxQuestionsForQuiz, minQuestionsBasedOnSelection + minQuestionsPerSubtopic), 
                Math.min(quizDefaults.maxQuestionsForQuiz, minQuestionsBasedOnSelection + minQuestionsPerSubtopic * 2)
            ].filter((v, i, a) => a.indexOf(v) === i && v <= quizDefaults.maxQuestionsForQuiz); // distinct and within max
             if (options.length === 0) options = [minQuestionsBasedOnSelection];
        }
    }
     // Ensure options are sorted and unique
    options = [...new Set(options)].sort((a, b) => a - b);


    return options.length > 0 ? options : [minQuestionsForQuiz]; // Absolute fallback
  }, [selectedSubtopicsCount, quizDefaults]);

  const currentSliderOptions = dynamicNumQuestionOptions;
  const sliderMin = currentSliderOptions[0];
  const sliderMax = currentSliderOptions[currentSliderOptions.length - 1];
  
  useEffect(() => {
    let newNumQuestions = numQuestions;
    if (currentSliderOptions.length > 0) {
        if (numQuestions < sliderMin) {
            newNumQuestions = sliderMin;
        } else if (numQuestions > sliderMax) {
            newNumQuestions = sliderMax;
        } else {
            const closest = currentSliderOptions.reduce((prev, curr) => 
                (Math.abs(curr - numQuestions) < Math.abs(prev - numQuestions) ? curr : prev)
            , sliderMin);
            newNumQuestions = closest;
        }
    } else { // Fallback if no options, should not happen with current logic
        newNumQuestions = quizDefaults.defaultNumQuestions;
    }

    if (newNumQuestions !== numQuestions) {
        setNumQuestions(newNumQuestions);
    }
  }, [numQuestions, currentSliderOptions, sliderMin, sliderMax, quizDefaults.defaultNumQuestions]);


  const handleSubmit = () => {
    onSubmit(numQuestions, difficulty, timerEnabled);
  };

  const subtopicInfoText = useMemo(() => {
    if (currentQuizMode === 'personalized') {
        if (currentPersonalizedQuizType === 'weak_topics') {
            return selectedSubtopicsCount > 0 
                ? `${selectedSubtopicsCount} zayıf konu üzerinden sınav oluşturulacaktır.` 
                : "Seçili ders için zayıf konu bulunmuyor. Sınav genel kapsamda olabilir veya hiç soru üretilemeyebilir.";
        } else if (currentPersonalizedQuizType === 'new_topics') {
            if (hasIdentifiedSubtopics) { 
                 return selectedSubtopicsCount > 0 
                    ? `${selectedSubtopicsCount} yeni alt konu üzerinden sınav oluşturulacaktır.`
                    : "Belgeden ayırt edici yeni alt konu bulunamadı. Sınav tüm dokümanı kapsayacaktır.";
            }
            return "Sınav, PDF'ten belirlenecek yeni konuları kapsayacaktır."; 
        } else if (currentPersonalizedQuizType === 'comprehensive') {
            let info = `Sınav, zayıf olduğunuz konuları ve PDF'teki yeni konuları kapsayacaktır.`;
            if (hasIdentifiedSubtopics && selectedSubtopicsCount > 0) {
                info += ` PDF'ten ${selectedSubtopicsCount} konu belirlendi/seçildi.`;
            } else if (hasIdentifiedSubtopics) {
                 info += ` PDF'ten yeni konu belirlenemedi, zayıf konulara odaklanılacak.`;
            }
            return info;
        }
        return "Kişiselleştirilmiş sınav ayarları yapılıyor."; 
    } 
    if (hasIdentifiedSubtopics) {
        return selectedSubtopicsCount > 0
            ? `${selectedSubtopicsCount} alt konu üzerinden sınav oluşturulacaktır.`
            : "Hiç alt konu seçilmedi. Sınav tüm dokümanı kapsayacaktır.";
    }
    return "Sınav tüm dokümanı kapsayacaktır.";
  }, [currentQuizMode, currentPersonalizedQuizType, selectedSubtopicsCount, hasIdentifiedSubtopics]);


  return (
    <div className="w-full max-w-lg mx-auto p-4 md:p-0 text-gray-700 dark:text-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Sınav Ayarları</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{subtopicInfoText} Lütfen soru sayısı, zorluk seviyesi ve zamanlayıcı tercihini seçin.</p>

      <div className="space-y-6">
        <div>
          <label htmlFor="num-questions-slider" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            Soru Sayısı: <span className="font-bold text-primary-600 dark:text-primary-300">{numQuestions}</span>
          </label>
          {currentSliderOptions.length > 0 ? (
            <>
            <input
                id="num-questions-slider"
                type="range"
                min={sliderMin}
                max={sliderMax}
                step={currentSliderOptions.length > 1 && (currentSliderOptions[1] - currentSliderOptions[0]) > 0 ? (currentSliderOptions[1] - currentSliderOptions[0]) : 1}
                value={numQuestions}
                onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    const closest = currentSliderOptions.reduce((prev, curr) => 
                        (Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev)
                    , sliderMin);
                    setNumQuestions(closest);
                }}
                className="w-full h-2 bg-gray-200 dark:bg-secondary-600 rounded-lg appearance-none cursor-pointer accent-primary-500"
                aria-label={`Soru sayısı, mevcut değer ${numQuestions}`}
                list="num-questions-datalist"
            />
            {currentSliderOptions.length > 1 && (
                 <datalist id="num-questions-datalist">
                    {currentSliderOptions.map(opt => <option key={opt} value={opt} label={opt.toString()}></option>)}
                </datalist>
            )}
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
                <span>{sliderMin}</span>
                <span>{sliderMax}</span>
            </div>
            </>
          ) : (
            <p className="text-sm text-yellow-500 dark:text-yellow-400">Seçilen alt konu sayısına göre uygun soru sayısı aralığı bulunamadı. Lütfen alt konu seçiminizi gözden geçirin veya varsayılan ayarları kullanın.</p>
          )}
        </div>

        <div>
          <label htmlFor="difficulty-select" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            Zorluk Seviyesi
          </label>
          <select
            id="difficulty-select"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as QuizDifficulty)}
            className="w-full p-3 bg-gray-50 dark:bg-secondary-700 border border-gray-300 dark:border-secondary-600 rounded-lg text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-gray-400"
          >
            <option value="Kolay">Kolay</option>
            <option value="Orta">Orta</option>
            <option value="Zor">Zor</option>
          </select>
        </div>

        <div>
            <label htmlFor="timer-enabled-checkbox" className="flex items-center cursor-pointer">
                <input
                    id="timer-enabled-checkbox"
                    type="checkbox"
                    checked={timerEnabled}
                    onChange={(e) => setTimerEnabled(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-primary-600 dark:text-primary-500 bg-gray-100 dark:bg-secondary-600 border-gray-300 dark:border-secondary-500 rounded focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-offset-white dark:focus:ring-offset-secondary-800"
                />
                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">Sınav Zamanlayıcısını Etkinleştir</span>
            </label>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500 italic">
                Etkinleştirilirse, her soru için {defaultSecondsPerQuestion} saniye süre tanınacaktır.
            </p>
        </div>
      </div>

      <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-300 dark:border-secondary-700">
        <button
          onClick={onBack}
          className="px-7 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors text-base flex items-center"
          aria-label="Geri dön"
        >
          <i className="fas fa-arrow-left mr-2"></i> Geri
        </button>
        <button
          onClick={handleSubmit}
          disabled={(currentSliderOptions.length === 0 || numQuestions < sliderMin || numQuestions > sliderMax) && currentSliderOptions.length > 0} 
          className="px-7 py-3 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg font-semibold shadow-md disabled:opacity-60 disabled:cursor-not-allowed text-base flex items-center"
          aria-label="Sınavı Başlat"
        >
          Sınavı Başlat <i className="fas fa-play-circle ml-2"></i>
        </button>
      </div>
    </div>
  );
};

export default React.memo(QuizPreferences);