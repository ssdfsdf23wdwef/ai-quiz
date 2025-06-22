import React, { useState } from 'react';
import { SavedQuizData } from '../types';
import EmptyState from './EmptyState';

interface QuizListPageProps {
  savedQuizzes: SavedQuizData[];
  onViewQuiz: (quiz: SavedQuizData) => void;
  onAddNewQuiz: () => void;
  onAddNewPersonalizedQuiz?: () => void; 
  theme?: string;
}

const QuizListPage: React.FC<QuizListPageProps> = ({ savedQuizzes, onViewQuiz, onAddNewQuiz, onAddNewPersonalizedQuiz, theme }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredQuizzes = (savedQuizzes || []).filter(quiz =>
    (quiz.pdfName || `Sınav ${new Date(quiz.savedAt).toLocaleDateString()}`).toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => b.savedAt - a.savedAt); 

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('tr-TR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="w-full h-full flex flex-col p-0">
      <div className="mb-6 px-1">
        <h1 className={`text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Sınavlarım</h1>
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Geçmiş sınavlarınızı görüntüleyin ve yeni sınavlar oluşturun.</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-1">
        <div className="relative flex-grow sm:max-w-xs md:max-w-sm">
          <input
            type="text"
            placeholder="Sınav ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full p-3 pl-10 border rounded-lg focus:ring-primary-500 focus:border-primary-500 ${theme === 'dark' ? 'bg-secondary-800 border-secondary-700 text-gray-200 placeholder-gray-500' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'}`}
            aria-label="Sınav arama"
          />
          <i className={`fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}></i>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <div className="relative">
            <select
              className={`appearance-none w-full sm:w-auto p-3 pr-10 border rounded-lg focus:ring-primary-500 focus:border-primary-500 ${theme === 'dark' ? 'bg-secondary-800 border-secondary-700 text-gray-200' : 'bg-white border-gray-300 text-gray-800'}`}
              aria-label="Sınav türüne göre filtrele"
              defaultValue="all"
            >
              <option value="all">Tüm Sınavlar</option>
            </select>
            <i className={`fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}></i>
          </div>
          <button
            onClick={onAddNewQuiz}
            className="flex-1 sm:flex-none px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-md flex items-center justify-center text-sm sm:text-base"
            title="Yeni Hızlı Sınav Oluştur"
          >
            <i className="fas fa-bolt mr-2"></i> Hızlı Sınav
          </button>
          {onAddNewPersonalizedQuiz && (
            <button
              onClick={onAddNewPersonalizedQuiz}
              className="flex-1 sm:flex-none px-4 py-3 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-md flex items-center justify-center text-sm sm:text-base"
              title="Yeni Kişiselleştirilmiş Sınav Oluştur"
            >
              <i className="fas fa-user-cog mr-2"></i> Kişisel Sınav
            </button>
          )}
        </div>
      </div>

      <div className="flex-grow overflow-y-auto bg-white dark:bg-secondary-800 rounded-lg shadow-xl ring-1 ring-gray-200 dark:ring-secondary-700/50">
        {filteredQuizzes.length === 0 ? (
           <EmptyState
            iconClass="fas fa-folder-open"
            title="Henüz Kaydedilmiş Sınav Yok"
            message="Oluşturduğunuz sınavların sonuçları burada listelenir. Hemen yeni bir tane oluşturun!"
            actionButton={onAddNewPersonalizedQuiz ? {
              text: "Yeni Kişisel Sınav Oluştur",
              onClick: onAddNewPersonalizedQuiz,
              iconClass: "fas fa-user-cog",
              gradientClasses: "bg-gradient-to-r from-pink-500 to-fuchsia-600",
            } : {
              text: "Yeni Hızlı Sınav Oluştur",
              onClick: onAddNewQuiz,
              iconClass: "fas fa-bolt",
              gradientClasses: "bg-gradient-to-r from-cyan-500 to-blue-600",
            }
          }
          />
        ) : (
          <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-secondary-700">
            <thead className="bg-gray-50 dark:bg-secondary-700/50 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sinav</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tür</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tarih</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Skor</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-secondary-700">
              {filteredQuizzes.map((quiz) => (
                <tr key={quiz.id} className="hover:bg-gray-50 dark:hover:bg-secondary-700/30 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="mr-3 text-blue-500 dark:text-blue-400 flex-shrink-0">
                        <i className="fas fa-file-alt text-xl"></i>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs md:max-w-sm" title={quiz.pdfName || `Sınav (${formatDate(quiz.savedAt).split(' ')[0]})`}>
                          {quiz.pdfName || `Sınav (${formatDate(quiz.savedAt).split(' ')[0]})`}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{quiz.totalQuestions} Soru</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                     ${quiz.quizType === 'Kişiselleştirilmiş Sınav' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300' : 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'}`}>
                      {quiz.quizType || "Hızlı Sınav"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{formatDate(quiz.savedAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {`${quiz.score}/${quiz.totalQuestions} (%${Math.round((quiz.score/quiz.totalQuestions)*100)})`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onViewQuiz(quiz)}
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors"
                      aria-label={`'${quiz.pdfName || 'Bu sınavı'}' görüntüle`}
                    >
                      Sonucu Görüntüle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default React.memo(QuizListPage);