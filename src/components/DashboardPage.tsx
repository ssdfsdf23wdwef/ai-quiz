import React from 'react';

export interface FeatureCardProps {
  icon: string;
  tag?: { text: string; colorClass: string; bgColorClass: string };
  title: string;
  description: string;
  buttonText: string;
  buttonIcon: string;
  buttonGradientClasses: string;
  premium?: boolean;
  onClick?: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = React.memo(({ icon, tag, title, description, buttonText, buttonIcon, buttonGradientClasses, premium, onClick }) => (
  <div className={`p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col h-full ${premium ? 'bg-purple-50 dark:bg-gradient-to-br dark:from-secondary-800 dark:to-purple-900' : 'bg-white dark:bg-secondary-800' }`}>
    <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${premium ? 'bg-purple-200 dark:bg-purple-500/30' : 'bg-primary-100 dark:bg-primary-500/20'}`}>
            <i className={`${icon} text-2xl sm:text-3xl ${premium ? 'text-pink-500 dark:text-pink-400' : 'text-primary-500 dark:text-primary-400'}`}></i>
        </div>
        {tag && (
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${tag.bgColorClass} ${tag.colorClass}`}>
            {tag.text}
          </span>
        )}
    </div>
    <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-3">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-6 flex-grow leading-relaxed">{description}</p>
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-center px-6 py-3 rounded-lg text-white font-semibold shadow-md hover:opacity-90 transition-all duration-200 hover:scale-[1.02] ${buttonGradientClasses}`}>
      <i className={`${buttonIcon} mr-2`}></i>
      {buttonText}
    </button>
  </div>
));

interface DashboardPageProps {
  features: FeatureCardProps[];
  onStartQuizFlow: (mode: 'quick' | 'personalized') => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ features, onStartQuizFlow }) => {
  const updatedFeatures = features.map(feature => ({
    ...feature,
    onClick: feature.title === 'Hızlı Sınav' ? () => onStartQuizFlow('quick') : () => onStartQuizFlow('personalized')
  }));

  return (
    <div className="min-h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="text-center mb-12 lg:mb-16">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-2">
          <span className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 bg-clip-text text-transparent">AI Quiz</span>
        </h2>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Yapay Zeka Quiz Platformu
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-4xl mx-auto text-lg sm:text-xl leading-relaxed font-medium px-4">
          Bilgi seviyenizi ölçün, eksiklerinizi tespit edin ve öğrenme sürecinizi <strong className="text-primary-600 dark:text-primary-300">kişiselleştirilmiş bir deneyimle</strong> optimize edin.
        </p>
      </section>
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 max-w-6xl mx-auto">
        {updatedFeatures.map(feature => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </section>
    </div>
  );
};

export default React.memo(DashboardPage);