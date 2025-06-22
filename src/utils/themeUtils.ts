/**
 * Theme utility functions for consistent theme handling across components
 */

export const getThemeClasses = (theme: string | undefined) => {
  const isDark = theme === 'dark';
  
  return {
    // Background classes
    bg: {
      primary: isDark ? 'bg-secondary-900' : 'bg-white',
      secondary: isDark ? 'bg-secondary-800' : 'bg-gray-50', 
      tertiary: isDark ? 'bg-secondary-700' : 'bg-gray-100',
      card: isDark ? 'bg-secondary-800' : 'bg-white',
      input: isDark ? 'bg-secondary-700' : 'bg-white',
      button: {
        primary: isDark ? 'bg-primary-600 hover:bg-primary-700' : 'bg-primary-500 hover:bg-primary-600',
        secondary: isDark ? 'bg-secondary-700 hover:bg-secondary-600' : 'bg-gray-200 hover:bg-gray-300',
        success: isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600',
        warning: isDark ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600',
      }
    },
    
    // Text classes
    text: {
      primary: isDark ? 'text-white' : 'text-gray-900',
      secondary: isDark ? 'text-gray-200' : 'text-gray-700',
      tertiary: isDark ? 'text-gray-300' : 'text-gray-600',
      muted: isDark ? 'text-gray-400' : 'text-gray-500',
      accent: isDark ? 'text-primary-400' : 'text-primary-600',
    },
    
    // Border classes  
    border: {
      primary: isDark ? 'border-secondary-700' : 'border-gray-200',
      secondary: isDark ? 'border-secondary-600' : 'border-gray-300',
      input: isDark ? 'border-secondary-600' : 'border-gray-300',
    },
    
    // Ring classes for focus states
    ring: {
      primary: isDark ? 'ring-secondary-700/50' : 'ring-gray-200',
      focus: 'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
    },
    
    // Utility to combine classes
    combine: (...classes: string[]) => classes.filter(Boolean).join(' '),
  };
};

export const themeClasses = (theme: string | undefined, lightClass: string, darkClass: string) => {
  return theme === 'dark' ? darkClass : lightClass;
};

// Specialized functions for different component types
export const getContainerClasses = (theme: string | undefined) => {
  return theme === 'dark' ? 'bg-secondary-800 text-gray-200' : 'bg-white text-gray-800';
};

export const getCardClasses = (theme: string | undefined) => {
  return theme === 'dark' ? 'bg-secondary-700 border-secondary-600' : 'bg-white border-gray-200';
};

export const getTextClasses = (theme: string | undefined, variant: 'primary' | 'secondary' | 'muted' = 'primary') => {
  const isDark = theme === 'dark';
  switch (variant) {
    case 'primary':
      return isDark ? 'text-white' : 'text-gray-900';
    case 'secondary':
      return isDark ? 'text-gray-200' : 'text-gray-700';
    case 'muted':
      return isDark ? 'text-gray-400' : 'text-gray-500';
    default:
      return isDark ? 'text-white' : 'text-gray-900';
  }
};

export const getButtonClasses = (theme: string | undefined, variant: 'primary' | 'secondary' | 'success' | 'danger' = 'primary') => {
  const isDark = theme === 'dark';
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors';
  
  switch (variant) {
    case 'primary':
      return `${baseClasses} ${isDark ? 'bg-primary-600 hover:bg-primary-700 text-white' : 'bg-primary-500 hover:bg-primary-600 text-white'}`;
    case 'secondary':
      return `${baseClasses} ${isDark ? 'bg-secondary-700 hover:bg-secondary-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`;
    case 'success':
      return `${baseClasses} ${isDark ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`;
    case 'danger':
      return `${baseClasses} ${isDark ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`;
    default:
      return `${baseClasses} ${isDark ? 'bg-primary-600 hover:bg-primary-700 text-white' : 'bg-primary-500 hover:bg-primary-600 text-white'}`;
  }
};
