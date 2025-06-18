import React from 'react';

interface LoadingSpinnerProps {
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      {text && <p className="mt-3 text-lg text-primary-700 dark:text-primary-300">{text}</p>}
    </div>
  );
};

export default React.memo(LoadingSpinner);
