import React from 'react';
import { getThemeClasses } from '../utils/themeUtils';

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
  theme?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = React.memo(({ icon, tag, title, description, buttonText, buttonIcon, buttonGradientClasses, premium, onClick, theme }) => {
  const themeClasses = getThemeClasses(theme);
  
  return (
    <div className={`p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col h-full ${
      premium 
        ? theme === 'dark' 
          ? 'bg-gradient-to-br from-secondary-800 to-purple-900' 
          : 'bg-purple-50'
        : themeClasses.bg.card
    }`}>
      <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-lg ${
            premium 
              ? theme === 'dark' ? 'bg-purple-500/30' : 'bg-purple-200'
              : theme === 'dark' ? 'bg-primary-500/20' : 'bg-primary-100'
          }`}>
              <i className={`${icon} text-2xl sm:text-3xl ${
                premium 
                  ? theme === 'dark' ? 'text-pink-400' : 'text-pink-500'
                  : theme === 'dark' ? 'text-primary-400' : 'text-primary-500'
              }`}></i>
          </div>
          {tag && (
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${tag.bgColorClass} ${tag.colorClass}`}>
              {tag.text}
            </span>
          )}
      </div>
      <h3 className={`text-xl sm:text-2xl font-semibold mb-3 ${themeClasses.text.primary}`}>{title}</h3>
      <p className={`text-sm sm:text-base mb-6 flex-grow leading-relaxed ${themeClasses.text.muted}`}>{description}</p>
      <button
          onClick={onClick}
          className={`w-full flex items-center justify-center px-6 py-3 rounded-lg text-white font-semibold shadow-md hover:opacity-90 transition-all duration-200 hover:scale-[1.02] ${buttonGradientClasses}`}>
        <i className={`${buttonIcon} mr-2`}></i>
        {buttonText}
      </button>
    </div>
  );
});

interface DashboardPageProps {
  features: FeatureCardProps[];
  onStartQuizFlow: (mode: 'quick' | 'personalized') => void;
  theme?: string;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ features, onStartQuizFlow, theme }) => {
  const themeClasses = getThemeClasses(theme);
  
  const updatedFeatures = features.map(feature => ({
    ...feature,
    theme,
    onClick: feature.title === 'Hızlı Sınav' ? () => onStartQuizFlow('quick') : () => onStartQuizFlow('personalized')
  }));

  return (
    <div className="min-h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="text-center mb-12 lg:mb-16">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-2">
          <span className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 bg-clip-text text-transparent">AI Quiz</span>
        </h2>
        <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 ${themeClasses.text.primary}`}>
          Yapay Zeka Quiz Platformu
        </h1>
        <p className={`max-w-4xl mx-auto text-lg sm:text-xl leading-relaxed font-medium px-4 ${themeClasses.text.muted}`}>
          Bilgi seviyenizi ölçün, eksiklerinizi tespit edin ve öğrenme sürecinizi <strong className={themeClasses.text.accent}>kişiselleştirilmiş bir deneyimle</strong> optimize edin.
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