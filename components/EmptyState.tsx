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
}

const EmptyState: React.FC<EmptyStateProps> = ({ iconClass, title, message, actionButton }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 h-full bg-white dark:bg-secondary-800 rounded-lg shadow-xl ring-1 ring-gray-200 dark:ring-secondary-700/50">
      <div className="p-5 bg-primary-100 dark:bg-primary-500/10 rounded-full mb-6">
        <i className={`${iconClass} text-5xl md:text-6xl text-primary-500 dark:text-primary-400`}></i>
      </div>
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white mb-2">{title}</h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">{message}</p>
      {actionButton && (
        <button
          onClick={actionButton.onClick}
          className={`px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-md flex items-center justify-center text-sm sm:text-base ${actionButton.gradientClasses || 'bg-gradient-to-r from-primary-500 to-primary-600'}`}
        >
          {actionButton.iconClass && <i className={`${actionButton.iconClass} mr-2`}></i>}
          {actionButton.text}
        </button>
      )}
    </div>
  );
};

export default React.memo(EmptyState);