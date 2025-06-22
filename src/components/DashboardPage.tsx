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
  theme?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = React.memo(({ icon, tag, title, description, buttonText, buttonIcon, buttonGradientClasses, premium, onClick, theme }) => {
  const isDark = theme === 'dark';
  
  const getCardClasses = () => {
    let baseClasses = 'group relative p-4 sm:p-6 rounded-3xl shadow-xl flex flex-col h-full transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border backdrop-blur-sm overflow-hidden ';
    
    if (premium) {
      baseClasses += isDark 
        ? 'bg-gradient-to-br from-purple-900/80 via-pink-900/80 to-indigo-900/80 border-purple-500/30 hover:border-purple-400/50' 
        : 'bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 border-purple-200 hover:border-purple-300';
    } else {
      baseClasses += isDark 
        ? 'bg-secondary-800/90 border-secondary-700 hover:border-primary-500/50' 
        : 'bg-white border-gray-200 hover:border-primary-300';
    }
    
    return baseClasses;
  };

  const getIconClasses = () => {
    if (premium) {
      return isDark 
        ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white' 
        : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white';
    } else {
      return isDark 
        ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white' 
        : 'bg-gradient-to-br from-primary-500 to-primary-600 text-white';
    }
  };

  return (
    <div className={getCardClasses()}>
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <div className={`w-full h-full rounded-full ${
          premium 
            ? 'bg-gradient-to-br from-purple-400 to-pink-400' 
            : 'bg-gradient-to-br from-primary-400 to-primary-500'
        } transform translate-x-16 -translate-y-16`}></div>
      </div>
      
      <div className="relative z-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
          <div className={`p-3 rounded-2xl shadow-lg ${getIconClasses()}`}>
            <i className={`${icon} text-xl sm:text-2xl`}></i>
          </div>
          {tag && (
            <span className={`px-3 py-1.5 text-xs font-bold rounded-full self-start shadow-sm ${tag.bgColorClass} ${tag.colorClass} border ${
              isDark ? 'border-white/20' : 'border-black/10'
            }`}>
              {tag.text}
            </span>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col">
          <h3 className={`text-lg sm:text-xl lg:text-2xl font-bold mb-3 ${
            premium 
              ? (isDark ? 'text-purple-100' : 'text-purple-900')
              : (isDark ? 'text-white' : 'text-gray-900')
          }`}>
            {title}
          </h3>
          
          <p className={`text-sm sm:text-base lg:text-lg mb-6 flex-grow leading-relaxed ${
            premium 
              ? (isDark ? 'text-purple-200' : 'text-purple-700')
              : (isDark ? 'text-gray-300' : 'text-gray-600')
          }`}>
            {description}
          </p>

          {/* Action Button */}
          <button
            onClick={onClick}
            className={`group/btn relative w-full flex items-center justify-center px-5 py-3 rounded-xl text-white font-bold shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl text-sm sm:text-base overflow-hidden ${buttonGradientClasses}`}
          >
            {/* Button Background Animation */}
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
            
            <div className="relative flex items-center gap-2">
              <i className={`${buttonIcon} text-base`}></i>
              <span>{buttonText}</span>
              <i className="fas fa-arrow-right text-sm transition-transform duration-300 group-hover/btn:translate-x-1"></i>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
});

interface DashboardPageProps {
  features: FeatureCardProps[];
  onStartQuizFlow: (mode: 'quick' | 'personalized') => void;
  theme?: string;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ features, onStartQuizFlow, theme }) => {
  const isDark = theme === 'dark';
  
  const updatedFeatures = features.map(feature => ({
    ...feature,
    theme,
    onClick: feature.title === 'Hızlı Sınav' ? () => onStartQuizFlow('quick') : () => onStartQuizFlow('personalized')
  }));

  const getBackgroundClasses = () => {
    return isDark 
      ? 'bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900' 
      : 'bg-gradient-to-br from-gray-50 via-white to-blue-50';
  };

  return (
    <div className={`min-h-full ${getBackgroundClasses()} relative overflow-hidden`}>
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 opacity-5">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-400 to-primary-600 transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        <div className="absolute bottom-0 right-0 w-96 h-96 opacity-5">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-pink-600 transform translate-x-1/3 translate-y-1/3"></div>
        </div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 opacity-3">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-teal-400 to-blue-600 transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 lg:py-8">
        {/* Hero Section */}
        <section className="text-center mb-6 sm:mb-8 lg:mb-10">
          {/* Main Logo/Brand */}
          <div className="mb-4 sm:mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 shadow-2xl mb-4">
              <i className="fas fa-robot text-2xl sm:text-3xl lg:text-4xl text-white"></i>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-3">
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-500 bg-clip-text text-transparent">
                AI Quiz
              </span>
            </h1>
            
            <h2 className={`text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              Yapay Zeka Quiz Platformu
            </h2>
          </div>

          {/* Description */}
          <div className="max-w-4xl mx-auto">
            <p className={`text-sm sm:text-base lg:text-lg xl:text-xl leading-relaxed font-medium px-4 sm:px-6 mb-6 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Bilgi seviyenizi ölçün, eksiklerinizi tespit edin ve öğrenme sürecinizi{' '}
              <span className={`font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent`}>
                kişiselleştirilmiş bir deneyimle
              </span>
              {' '}optimize edin.
            </p>

            {/* Features Icons */}
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8 mb-6">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-green-500`}></div>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>PDF Desteği</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-500`}></div>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Kişiselleştirilmiş</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-purple-500`}></div>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Performans Analizi</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Section */}
        <section>
          <div className="text-center mb-4 sm:mb-6">
            <h3 className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-2 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              Sınav Türünü Seçin
            </h3>
            <p className={`text-sm sm:text-base max-w-2xl mx-auto ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              İhtiyacınıza uygun sınav türünü seçerek öğrenme sürecinizi başlatın
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
            {updatedFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className="transform transition-all duration-300"
                style={{
                  animationDelay: `${index * 200}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center mt-6 sm:mt-8 lg:mt-10">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium ${
            isDark 
              ? 'bg-secondary-800/50 text-gray-300 border border-secondary-600' 
              : 'bg-white/80 text-gray-600 border border-gray-200'
          }`}>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Hemen başlayın - Kayıt gerekmez!</span>
          </div>
        </section>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Touch feedback for mobile */
        @media (hover: none) and (pointer: coarse) {
          .group:active {
            transform: scale(0.98);
          }
        }
        
        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default React.memo(DashboardPage);