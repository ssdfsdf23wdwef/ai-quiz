import React from 'react';
import { QuizQuestion } from '../types';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';

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
  quizId
 }) => {
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
    if (percentage >= 75) return { 
      text: 'text-green-600 dark:text-green-400', 
      border: 'border-green-500 dark:border-green-500/50', 
      bg: 'bg-green-50 dark:bg-green-500/10' 
    };
    if (percentage >= 50) return { 
      text: 'text-yellow-600 dark:text-yellow-400', 
      border: 'border-yellow-500 dark:border-yellow-500/50', 
      bg: 'bg-yellow-50 dark:bg-yellow-500/10' 
    };
    return { 
      text: 'text-red-600 dark:text-red-400', 
      border: 'border-red-500 dark:border-red-500/50', 
      bg: 'bg-red-50 dark:bg-red-500/10' 
    };
  };
  
  const resultColors = getResultColorClasses();

  const restartButtonText = () => {
    if (onDeleteSpecificResult) return "Sınav Listesine Dön"; 
    if (isViewingSaved) return "Ana Sayfa"; 
    return "Yeni Sınav Oluştur"; 
  }

  return (
    <div className="w-full max-w-3xl p-6 md:p-8 bg-white dark:bg-secondary-800 rounded-xl shadow-2xl text-gray-800 dark:text-gray-200">
      <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">Sınav Sonucu</h2>
      {isViewingSaved && pdfName && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-1">PDF Kaynağı: {pdfName}</p>
      )}
      {isViewingSaved && savedAt && (
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mb-4">Kaydedilme Tarihi: {new Date(savedAt).toLocaleString('tr-TR')}</p>
      )}
      
      <div className={`text-center mb-8 p-6 rounded-lg ${resultColors.bg} border-2 ${resultColors.border}`}>
        <p className={`text-5xl font-extrabold mb-2 ${resultColors.text}`}>{percentage}%</p>
        <p className="text-xl text-gray-700 dark:text-gray-300">
          {score} / {totalQuestions} doğru cevap
        </p>
      </div>

      <div className="space-y-6 mb-8 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar-results">
        {questions.map((q, index) => {
          const userAnswer = userAnswers[q.id];
          const isCorrect = userAnswer === q.correctAnswerIndex;
          const itemBgColor = isCorrect 
            ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30' 
            : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30';
          
          return (
            <div key={q.id} className={`p-4 border rounded-lg ${itemBgColor}`}>
              <p className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Soru {index + 1}: {q.question}</p>
              {q.subtopic && (
                <p className="text-xs text-primary-600 dark:text-primary-400 mb-2 italic">
                  Alt Konu: {q.subtopic}
                </p>
              )}
              <ul className="list-none space-y-1 pl-0">
                {q.options.map((option, optIndex) => (
                  <li 
                    key={optIndex} 
                    className={`flex items-center p-2 rounded text-sm
                                ${optIndex === q.correctAnswerIndex ? 'font-bold text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'}
                                ${userAnswer === optIndex && !isCorrect ? 'text-red-700 dark:text-red-300 line-through' : ''}
                                ${userAnswer === optIndex && isCorrect ? 'bg-green-100 dark:bg-green-500/20' : ''}
                                ${userAnswer === optIndex && !isCorrect && optIndex !== q.correctAnswerIndex ? 'bg-red-100 dark:bg-red-500/20' : ''}
                                `}
                  >
                    {optIndex === q.correctAnswerIndex && <CheckCircleIcon className="w-5 h-5 mr-2 text-green-500 dark:text-green-400 shrink-0" />}
                    {userAnswer === optIndex && optIndex !== q.correctAnswerIndex && <XCircleIcon className="w-5 h-5 mr-2 text-red-500 dark:text-red-400 shrink-0" />}
                    {!(optIndex === q.correctAnswerIndex || (userAnswer === optIndex && optIndex !== q.correctAnswerIndex)) && <span className="w-5 h-5 mr-2 shrink-0"></span>}

                     <span className="min-w-0 break-words">{option}</span>
                     {userAnswer === optIndex && <span className="ml-2 text-xs italic">({isCorrect ? 'Sizin Cevabınız - Doğru' : 'Sizin Cevabınız - Yanlış'})</span>}
                     {userAnswer !== optIndex && optIndex === q.correctAnswerIndex && userAnswer !== undefined && <span className="ml-2 text-xs italic">(Doğru Cevap)</span>}
                     {userAnswer === undefined && optIndex === q.correctAnswerIndex && <span className="ml-2 text-xs italic">(Doğru Cevap)</span>}
                  </li>
                ))}
                 {userAnswers[q.id] === undefined && (
                  <li className="mt-1 text-xs text-yellow-600 dark:text-yellow-400 italic">Bu soru cevaplanmadı.</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="text-center space-y-3 md:space-y-0 md:flex md:justify-center md:space-x-4">
        <button
          onClick={onRestart}
          className="w-full md:w-auto px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold shadow-lg text-lg focus:ring-2 focus:ring-primary-400 focus:ring-opacity-50"
        >
          <i className="fas fa-redo-alt mr-2"></i> {restartButtonText()}
        </button>
        {!isViewingSaved && onSaveResult && (
          <button
            onClick={onSaveResult}
            className="w-full md:w-auto px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold shadow-lg text-lg focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
          >
            <i className="fas fa-save mr-2"></i> Sonuçları Kaydet
          </button>
        )}
         {isViewingSaved && onDeleteSpecificResult && quizId && (
          <button
            onClick={() => onDeleteSpecificResult(quizId)}
            className="w-full md:w-auto px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold shadow-lg text-lg focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
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
