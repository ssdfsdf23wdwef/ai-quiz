import React from 'react';

interface LoadingSpinnerProps {
  text?: string;
  theme?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text, theme }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-10 h-10 sm:w-12 sm:h-12 border-3 sm:border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      {text && <p className={`mt-3 text-sm sm:text-base lg:text-lg text-center max-w-xs ${theme === 'dark' ? 'text-primary-300' : 'text-primary-700'}`}>{text}</p>}
    </div>
  );
};

export default React.memo(LoadingSpinner);
