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
  theme?: string;
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
  theme,
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
    <div className={`w-full max-w-2xl mx-auto p-6 space-y-8 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
      {/* Header Section */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center space-x-3">
          <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-primary-500/20' : 'bg-primary-100'}`}>
            <i className={`fas fa-cog text-xl ${theme === 'dark' ? 'text-primary-400' : 'text-primary-600'}`}></i>
          </div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Sınav Tercihleri
          </h2>
        </div>
        <div className={`p-4 rounded-lg border-l-4 ${
          theme === 'dark' 
            ? 'bg-secondary-800/50 border-primary-500 text-gray-300' 
            : 'bg-blue-50 border-blue-400 text-gray-700'
        }`}>
          <p className="text-sm leading-relaxed">
            <i className="fas fa-info-circle mr-2 text-blue-500"></i>
            {subtopicInfoText}
          </p>
        </div>
      </div>

      {/* Settings Cards */}
      <div className="space-y-6">
        {/* Question Count Card */}
        <div className={`quiz-card p-6 rounded-xl border transition-all duration-300 hover:shadow-lg ${
          theme === 'dark' 
            ? 'bg-secondary-800/50 border-secondary-600 hover:border-primary-500/50' 
            : 'bg-white border-gray-200 hover:border-primary-300 shadow-sm'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <i className={`fas fa-list-ol ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}></i>
            </div>
            <div>
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Soru Sayısı
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Sınavda yer alacak toplam soru sayısını belirleyin
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Seçilen Soru Sayısı
              </span>
              <div className={`px-4 py-2 rounded-full font-bold text-lg ${
                theme === 'dark' 
                  ? 'bg-primary-500/20 text-primary-300' 
                  : 'bg-primary-100 text-primary-700'
              }`}>
                {numQuestions}
              </div>
            </div>
            
            {currentSliderOptions.length > 0 ? (
              <div className="space-y-3">
                <div className="relative">
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
                    className={`w-full h-3 rounded-lg appearance-none cursor-pointer slider-enhanced ${
                      theme === 'dark' ? 'bg-secondary-600' : 'bg-gray-200'
                    }`}
                    style={{
                      background: theme === 'dark' 
                        ? `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((numQuestions - sliderMin) / (sliderMax - sliderMin)) * 100}%, #4b5563 ${((numQuestions - sliderMin) / (sliderMax - sliderMin)) * 100}%, #4b5563 100%)`
                        : `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((numQuestions - sliderMin) / (sliderMax - sliderMin)) * 100}%, #e5e7eb ${((numQuestions - sliderMin) / (sliderMax - sliderMin)) * 100}%, #e5e7eb 100%)`
                    }}
                    aria-label={`Soru sayısı, mevcut değer ${numQuestions}`}
                  />
                  {currentSliderOptions.length > 1 && (
                    <datalist id="num-questions-datalist">
                      {currentSliderOptions.map(opt => <option key={opt} value={opt} label={opt.toString()}></option>)}
                    </datalist>
                  )}
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className={`px-2 py-1 rounded ${theme === 'dark' ? 'bg-secondary-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                    Min: {sliderMin}
                  </span>
                  <div className={`flex space-x-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {currentSliderOptions.map((opt) => (
                      <span 
                        key={opt} 
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          opt === numQuestions 
                            ? 'bg-primary-500 scale-125' 
                            : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                        }`}
                      ></span>
                    ))}
                  </div>
                  <span className={`px-2 py-1 rounded ${theme === 'dark' ? 'bg-secondary-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                    Max: {sliderMax}
                  </span>
                </div>
              </div>
            ) : (
              <div className={`p-4 rounded-lg border-l-4 ${
                theme === 'dark' 
                  ? 'bg-yellow-900/20 border-yellow-500 text-yellow-300' 
                  : 'bg-yellow-50 border-yellow-400 text-yellow-700'
              }`}>
                <i className="fas fa-exclamation-triangle mr-2"></i>
                Seçilen alt konu sayısına göre uygun soru sayısı aralığı bulunamadı. Lütfen alt konu seçiminizi gözden geçirin.
              </div>
            )}
          </div>
        </div>

        {/* Difficulty Card */}
        <div className={`quiz-card p-6 rounded-xl border transition-all duration-300 hover:shadow-lg ${
          theme === 'dark' 
            ? 'bg-secondary-800/50 border-secondary-600 hover:border-primary-500/50' 
            : 'bg-white border-gray-200 hover:border-primary-300 shadow-sm'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
              <i className={`fas fa-chart-line ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}></i>
            </div>
            <div>
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Zorluk Seviyesi
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Sınav sorularının zorluk derecesini seçin
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {(['Kolay', 'Orta', 'Zor'] as QuizDifficulty[]).map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
                  difficulty === level
                    ? theme === 'dark'
                      ? 'border-primary-500 bg-primary-500/20 text-primary-300'
                      : 'border-primary-500 bg-primary-50 text-primary-700'
                    : theme === 'dark'
                      ? 'border-secondary-600 bg-secondary-700/50 text-gray-300 hover:border-secondary-500'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className={`text-lg mb-1 ${
                  level === 'Kolay' ? 'text-green-500' : 
                  level === 'Orta' ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  <i className={`fas ${
                    level === 'Kolay' ? 'fa-smile' : 
                    level === 'Orta' ? 'fa-meh' : 'fa-frown'
                  }`}></i>
                </div>
                <div className="font-medium">{level}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Timer Card */}
        <div className={`quiz-card p-6 rounded-xl border transition-all duration-300 hover:shadow-lg ${
          theme === 'dark' 
            ? 'bg-secondary-800/50 border-secondary-600 hover:border-primary-500/50' 
            : 'bg-white border-gray-200 hover:border-primary-300 shadow-sm'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
              <i className={`fas fa-clock ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}></i>
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Zamanlayıcı Ayarı
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Her soru için {defaultSecondsPerQuestion} saniye süre sınırı
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={timerEnabled}
                onChange={(e) => setTimerEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-14 h-7 rounded-full peer transition-colors duration-200 ${
                timerEnabled 
                  ? 'bg-primary-500' 
                  : theme === 'dark' ? 'bg-secondary-600' : 'bg-gray-300'
              } peer-focus:ring-4 ${
                theme === 'dark' ? 'peer-focus:ring-primary-500/25' : 'peer-focus:ring-primary-200'
              } relative`}>
                <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-6 w-6 transition-transform duration-200 ${
                  timerEnabled ? 'translate-x-7' : 'translate-x-0'
                } shadow-md flex items-center justify-center`}>
                  <i className={`fas ${timerEnabled ? 'fa-check' : 'fa-times'} text-xs ${
                    timerEnabled ? 'text-primary-500' : 'text-gray-400'
                  }`}></i>
                </div>
              </div>
            </label>
          </div>
          
          <div className={`text-sm ${
            timerEnabled 
              ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
              : theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
          }`}>
            <i className={`fas ${timerEnabled ? 'fa-play-circle' : 'fa-pause-circle'} mr-2`}></i>
            {timerEnabled 
              ? 'Zamanlayıcı aktif - Her soru için süre sınırı uygulanacak'
              : 'Zamanlayıcı devre dışı - Sınırsız süre'}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`flex justify-between items-center pt-6 border-t ${theme === 'dark' ? 'border-secondary-700' : 'border-gray-200'}`}>
        <button
          onClick={onBack}
          className={`px-6 py-3 rounded-lg border transition-all duration-200 flex items-center space-x-2 ${
            theme === 'dark' 
              ? 'border-secondary-600 text-gray-300 hover:text-white hover:border-secondary-500 hover:bg-secondary-700/50' 
              : 'border-gray-300 text-gray-600 hover:text-gray-800 hover:border-gray-400 hover:bg-gray-50'
          }`}
          aria-label="Geri dön"
        >
          <i className="fas fa-arrow-left"></i>
          <span>Geri</span>
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={(currentSliderOptions.length === 0 || numQuestions < sliderMin || numQuestions > sliderMax) && currentSliderOptions.length > 0} 
          className={`px-8 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 flex items-center space-x-2 transform hover:scale-105 ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white' 
              : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100`}
          aria-label="Sınavı Başlat"
        >
          <span>Sınavı Başlat</span>
          <i className="fas fa-play-circle"></i>
        </button>
      </div>
    </div>
  );
};

export default React.memo(QuizPreferences);