import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  theme?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry, theme }) => {
  return (
    <div className={`border-l-4 p-3 sm:p-4 rounded-md shadow-md ${theme === 'dark' ? 'bg-red-500/10 border-red-400 text-red-300' : 'bg-red-50 border-red-500 text-red-700'}`} role="alert">
      <div className="flex">
        <div className="py-1 flex-shrink-0">
          <svg className={`fill-current h-5 w-5 sm:h-6 sm:w-6 mr-3 sm:mr-4 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM11.414 10l2.829-2.828a1 1 0 1 0-1.414-1.414L10 8.586 7.172 5.757a1 1 0 0 0-1.414 1.414L8.586 10l-2.829 2.828a1 1 0 1 0 1.414 1.414L10 11.414l2.828 2.829a1 1 0 0 0 1.414-1.414L11.414 10z"/>
          </svg>
        </div>
        <div className="flex-grow min-w-0">
          <p className="font-bold text-sm sm:text-base">Bir Hata Oluştu</p>
          <p className="text-xs sm:text-sm leading-relaxed break-words">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 px-3 sm:px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors text-xs sm:text-sm touch-target"
            >
              Tekrar Dene
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ErrorMessage);
