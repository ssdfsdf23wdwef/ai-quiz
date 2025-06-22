import React from 'react';

interface EmptyStateProps {
  iconClass: string;
  title: string;
  message: string;
  actionButton?: {
    text: string;
    onClick: () => void;
    iconClass?: string;
    gradientClasses?: string;
  };
  theme?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ iconClass, title, message, actionButton, theme }) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-4 sm:p-8 md:p-12 h-full rounded-lg shadow-xl ring-1 ${theme === 'dark' ? 'bg-secondary-800 ring-secondary-700/50' : 'bg-white ring-gray-200'}`}>
      <div className={`p-4 sm:p-5 rounded-full mb-4 sm:mb-6 ${theme === 'dark' ? 'bg-primary-500/10' : 'bg-primary-100'}`}>
        <i className={`${iconClass} text-4xl sm:text-5xl md:text-6xl ${theme === 'dark' ? 'text-primary-400' : 'text-primary-500'}`}></i>
      </div>
      <h2 className={`text-lg sm:text-xl md:text-2xl font-semibold mb-2 px-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{title}</h2>
      <p className={`max-w-md mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed px-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{message}</p>
      {actionButton && (
        <button
          onClick={actionButton.onClick}
          className={`px-4 sm:px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-md flex items-center justify-center text-sm sm:text-base touch-target ${actionButton.gradientClasses || 'bg-gradient-to-r from-primary-500 to-primary-600'}`}
        >
          {actionButton.iconClass && <i className={`${actionButton.iconClass} mr-2`}></i>}
          {actionButton.text}
        </button>
      )}
    </div>
  );
};

export default React.memo(EmptyState);