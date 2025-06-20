import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-red-50 dark:bg-red-500/10 border-l-4 border-red-500 dark:border-red-400 text-red-700 dark:text-red-300 p-4 rounded-md shadow-md" role="alert">
      <div className="flex">
        <div className="py-1">
          <svg className="fill-current h-6 w-6 text-red-500 dark:text-red-400 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM11.414 10l2.829-2.828a1 1 0 1 0-1.414-1.414L10 8.586 7.172 5.757a1 1 0 0 0-1.414 1.414L8.586 10l-2.829 2.828a1 1 0 1 0 1.414 1.414L10 11.414l2.828 2.829a1 1 0 0 0 1.414-1.414L11.414 10z"/>
          </svg>
        </div>
        <div>
          <p className="font-bold">Bir Hata Oluştu</p>
          <p className="text-sm">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
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
