import React from 'react';

interface LoadingSpinnerProps {
  text?: string;
  theme?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text, theme }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      {text && <p className={`mt-3 text-lg ${theme === 'dark' ? 'text-primary-300' : 'text-primary-700'}`}>{text}</p>}
    </div>
  );
};

export default React.memo(LoadingSpinner);
