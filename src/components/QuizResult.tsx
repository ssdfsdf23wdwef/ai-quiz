import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';
import { getContainerClasses, getTextClasses, getButtonClasses } from '../utils/themeUtils';

interface QuizResultProps {
  questions: QuizQuestion[];
  userAnswers: Record<string, number>;
  onRestart: () => void; 
  onSaveResult?: () => void; 
  onDeleteSpecificResult?: (quizId: string) => void; 
  isViewingSaved?: boolean; 
  pdfName?: string;
  savedAt?: number;
  quizId?: string; 
  theme?: string;
}

const QuizResult: React.FC<QuizResultProps> = ({ 
  questions, 
  userAnswers, 
  onRestart, 
  onSaveResult,
  onDeleteSpecificResult,
  isViewingSaved = false,
  pdfName,
  savedAt,
  quizId,
  theme,
}) => {
  const [showExplanations, setShowExplanations] = useState<Record<string, boolean>>({});

  const toggleExplanation = (questionId: string) => {
    setShowExplanations(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };
  const calculateScore = () => {
    let correctAnswers = 0;
    questions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswerIndex) {
        correctAnswers++;
      }
    });
    return correctAnswers;
  };

  const score = calculateScore();
  const totalQuestions = questions.length;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  const getResultColorClasses = () => {
    const isDark = theme === 'dark';
    if (percentage >= 75) return { 
      text: isDark ? 'text-green-400' : 'text-green-600', 
      border: isDark ? 'border-green-500/50' : 'border-green-500', 
      bg: isDark ? 'bg-green-500/10' : 'bg-green-50' 
    };
    if (percentage >= 50) return { 
      text: isDark ? 'text-yellow-400' : 'text-yellow-600', 
      border: isDark ? 'border-yellow-500/50' : 'border-yellow-500', 
      bg: isDark ? 'bg-yellow-500/10' : 'bg-yellow-50' 
    };
    return { 
      text: isDark ? 'text-red-400' : 'text-red-600', 
      border: isDark ? 'border-red-500/50' : 'border-red-500', 
      bg: isDark ? 'bg-red-500/10' : 'bg-red-50' 
    };
  };
  
  const resultColors = getResultColorClasses();

  const restartButtonText = () => {
    if (onDeleteSpecificResult) return "Sınav Listesine Dön"; 
    if (isViewingSaved) return "Ana Sayfa"; 
    return "Yeni Sınav Oluştur"; 
  }

  return (
    <div className={`w-full max-w-3xl p-6 md:p-8 rounded-xl shadow-2xl ${getContainerClasses(theme)}`}>
      <h2 className={`text-3xl font-bold text-center mb-2 ${getTextClasses(theme, 'primary')}`}>Sınav Sonucu</h2>
      {isViewingSaved && pdfName && (
        <p className={`text-center text-sm mb-1 ${getTextClasses(theme, 'muted')}`}>PDF Kaynağı: {pdfName}</p>
      )}
      {isViewingSaved && savedAt && (
        <p className={`text-center text-xs mb-4 ${getTextClasses(theme, 'muted')}`}>Kaydedilme Tarihi: {new Date(savedAt).toLocaleString('tr-TR')}</p>
      )}
      
      <div className={`text-center mb-8 p-6 rounded-lg ${resultColors.bg} border-2 ${resultColors.border}`}>
        <p className={`text-5xl font-extrabold mb-2 ${resultColors.text}`}>{percentage}%</p>
        <p className={`text-xl ${getTextClasses(theme, 'secondary')}`}>
          {score} / {totalQuestions} doğru cevap
        </p>
      </div>

      <div className="space-y-6 mb-8 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar-results">
        {questions.map((q, index) => {
          const userAnswer = userAnswers[q.id];
          const isCorrect = userAnswer === q.correctAnswerIndex;
          const isDark = theme === 'dark';
          const itemBgColor = isCorrect 
            ? (isDark ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200')
            : (isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200');
          
          return (
            <div key={q.id} className={`p-4 border rounded-lg ${itemBgColor}`}>
              <div className="flex items-start justify-between mb-1">
                <p className={`font-semibold ${getTextClasses(theme, 'primary')}`}>Soru {index + 1}: {q.question}</p>
                {q.explanation && (
                  <button
                    onClick={() => toggleExplanation(q.id)}
                    className={`ml-3 px-2 py-1 text-xs rounded-md transition-colors flex items-center gap-1 flex-shrink-0 ${
                      showExplanations[q.id]
                        ? (isDark 
                            ? 'text-blue-300 bg-blue-500/20 hover:bg-blue-500/30' 
                            : 'text-blue-700 bg-blue-100 hover:bg-blue-200')
                        : (isDark 
                            ? 'text-gray-400 bg-gray-500/20 hover:bg-gray-500/30' 
                            : 'text-gray-600 bg-gray-100 hover:bg-gray-200')
                    }`}
                    title={showExplanations[q.id] ? 'Açıklamayı Gizle' : 'Açıklamayı Göster'}
                  >
                    <i className={`fas ${showExplanations[q.id] ? 'fa-eye-slash' : 'fa-lightbulb'}`}></i>
                    <span className="hidden sm:inline">{showExplanations[q.id] ? 'Gizle' : 'Açıklama'}</span>
                  </button>
                )}
              </div>
              {q.subtopic && (
                <p className={`text-xs mb-2 italic ${theme === 'dark' ? 'text-primary-400' : 'text-primary-600'}`}>
                  Alt Konu: {q.subtopic}
                </p>
              )}
              <ul className="list-none space-y-1 pl-0">
                {q.options.map((option, optIndex) => {
                  const isDark = theme === 'dark';
                  const isCorrectOption = optIndex === q.correctAnswerIndex;
                  const isUserAnswer = userAnswer === optIndex;
                  
                  let optionClasses = 'flex items-center p-2 rounded text-sm ';
                  
                  if (isCorrectOption) {
                    optionClasses += isDark ? 'font-bold text-green-300' : 'font-bold text-green-700';
                  } else {
                    optionClasses += isDark ? 'text-gray-300' : 'text-gray-700';
                  }
                  
                  if (isUserAnswer && !isCorrect) {
                    optionClasses += isDark ? ' text-red-300 line-through' : ' text-red-700 line-through';
                  }
                  
                  if (isUserAnswer && isCorrect) {
                    optionClasses += isDark ? ' bg-green-500/20' : ' bg-green-100';
                  } else if (isUserAnswer && !isCorrect && !isCorrectOption) {
                    optionClasses += isDark ? ' bg-red-500/20' : ' bg-red-100';
                  }
                  
                  return (
                    <li key={optIndex} className={optionClasses}>
                      {isCorrectOption && <CheckCircleIcon className={`w-5 h-5 mr-2 shrink-0 ${isDark ? 'text-green-400' : 'text-green-500'}`} />}
                      {isUserAnswer && !isCorrectOption && <XCircleIcon className={`w-5 h-5 mr-2 shrink-0 ${isDark ? 'text-red-400' : 'text-red-500'}`} />}
                      {!(isCorrectOption || (isUserAnswer && !isCorrectOption)) && <span className="w-5 h-5 mr-2 shrink-0"></span>}

                      <span className="min-w-0 break-words">{option}</span>
                      {isUserAnswer && <span className="ml-2 text-xs italic">({isCorrect ? 'Sizin Cevabınız - Doğru' : 'Sizin Cevabınız - Yanlış'})</span>}
                      {!isUserAnswer && isCorrectOption && userAnswer !== undefined && <span className="ml-2 text-xs italic">(Doğru Cevap)</span>}
                      {userAnswer === undefined && isCorrectOption && <span className="ml-2 text-xs italic">(Doğru Cevap)</span>}
                    </li>
                  );
                })}
                {userAnswers[q.id] === undefined && (
                  <li className={`mt-1 text-xs italic ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>Bu soru cevaplanmadı.</li>
                )}
              </ul>
              
              {/* Açıklama Alanı */}
              {q.explanation && showExplanations[q.id] && (
                <div className={`mt-3 p-3 rounded-md border ${
                  isDark 
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-200' 
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}>
                  <div className="flex items-start gap-2">
                    <i className={`fas fa-lightbulb mt-1 flex-shrink-0 ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    }`}></i>
                    <div>
                      <h4 className={`font-medium text-sm mb-1 ${
                        isDark ? 'text-blue-300' : 'text-blue-700'
                      }`}>
                        Açıklama:
                      </h4>
                      <p className={`text-sm leading-relaxed ${
                        isDark ? 'text-blue-200' : 'text-blue-800'
                      }`}>
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center space-y-3 md:space-y-0 md:flex md:justify-center md:space-x-4">
        <button
          onClick={onRestart}
          className={`w-full md:w-auto px-8 py-3 rounded-lg font-semibold shadow-lg text-lg focus:ring-2 focus:ring-opacity-50 ${getButtonClasses(theme, 'primary')}`}
        >
          <i className="fas fa-redo-alt mr-2"></i> {restartButtonText()}
        </button>
        {!isViewingSaved && onSaveResult && (
          <button
            onClick={onSaveResult}
            className={`w-full md:w-auto px-8 py-3 rounded-lg font-semibold shadow-lg text-lg focus:ring-2 focus:ring-opacity-50 ${getButtonClasses(theme, 'success')}`}
          >
            <i className="fas fa-save mr-2"></i> Sonuçları Kaydet
          </button>
        )}
         {isViewingSaved && onDeleteSpecificResult && quizId && (
          <button
            onClick={() => onDeleteSpecificResult(quizId)}
            className={`w-full md:w-auto px-8 py-3 rounded-lg font-semibold shadow-lg text-lg focus:ring-2 focus:ring-opacity-50 ${getButtonClasses(theme, 'danger')}`}
          >
            <i className="fas fa-trash-alt mr-2"></i> Kayıtlı Sonucu Sil
          </button>
        )}
      </div>
       <style>{`
        .custom-scrollbar-results::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar-results::-webkit-scrollbar-track {
          background: var(--scrollbar-track-color); 
          border-radius: 10px;
        }
        .custom-scrollbar-results::-webkit-scrollbar-thumb {
          background: var(--scrollbar-thumb-color); 
          border-radius: 10px;
        }
        .custom-scrollbar-results::-webkit-scrollbar-thumb:hover {
          background: var(--scrollbar-thumb-hover-color);
        }
        .custom-scrollbar-results {
          scrollbar-width: thin;
          scrollbar-color: var(--scrollbar-thumb-color) var(--scrollbar-track-color);
        }
      `}</style>
    </div>
  );
};

export default React.memo(QuizResult);
