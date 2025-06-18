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
  <div className={`p-8 rounded-2xl shadow-xl flex flex-col ${premium ? 'bg-gradient-to-br from-secondary-700 to-purple-800 dark:from-secondary-800 dark:to-purple-900' : 'bg-white dark:bg-secondary-800' }`}>
    <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${premium ? 'bg-purple-200 dark:bg-purple-500/30' : 'bg-primary-100 dark:bg-primary-500/20'}`}>
            <i className={`${icon} text-3xl ${premium ? 'text-pink-500 dark:text-pink-400' : 'text-primary-500 dark:text-primary-400'}`}></i>
        </div>
        {tag && (
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${tag.bgColorClass} ${tag.colorClass}`}>
            {tag.text}
          </span>
        )}
    </div>
    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 flex-grow">{description}</p>
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-center px-6 py-3 rounded-lg text-white font-semibold shadow-md hover:opacity-90 transition-opacity ${buttonGradientClasses}`}>
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
    <>
      <section className="mb-12">
        <h2 className="text-4xl md:text-5xl font-extrabold">
          <span className="text-teal-500 dark:text-teal-400">AI Quiz</span>
        </h2>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-3">
          Yapay Zeka Destekli Öğrenme Platformu
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl text-lg">
          Bilgi seviyenizi ölçün, eksiklerinizi tespit edin ve öğrenme sürecinizi <strong className="text-primary-600 dark:text-primary-300">kişiselleştirilmiş bir deneyimle</strong> optimize edin.
        </p>
      </section>
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {updatedFeatures.map(feature => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </section>
      <footer className="w-full text-center mt-12 py-6 border-t border-gray-200 dark:border-secondary-700/50">
        <p className="text-sm text-gray-500 dark:text-secondary-500">
          &copy; {new Date().getFullYear()} QuizMaster AI Platform. Gemini API ile güçlendirilmiştir.
        </p>
      </footer>
    </>
  );
};

export default React.memo(DashboardPage);
