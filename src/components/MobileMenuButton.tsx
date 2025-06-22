import React from 'react';

interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
  theme?: string;
}

const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({ isOpen, onClick, theme }) => {
  return (
    <button
      onClick={onClick}
      className={`lg:hidden fixed top-4 left-4 z-50 p-3 rounded-lg shadow-lg transition-all duration-200 ${
        theme === 'dark'
          ? 'bg-secondary-800 text-white border border-secondary-600 hover:bg-secondary-700'
          : 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50'
      }`}
      aria-label={isOpen ? 'Menüyü kapat' : 'Menüyü aç'}
    >
      <div className="w-5 h-5 flex flex-col justify-center items-center">
        <span
          className={`bg-current h-0.5 w-5 rounded-sm transform transition duration-300 ease-in-out ${
            isOpen ? 'rotate-45 translate-y-1.5' : ''
          }`}
        />
        <span
          className={`bg-current h-0.5 w-5 rounded-sm my-1 transition duration-300 ease-in-out ${
            isOpen ? 'opacity-0' : 'opacity-100'
          }`}
        />
        <span
          className={`bg-current h-0.5 w-5 rounded-sm transform transition duration-300 ease-in-out ${
            isOpen ? '-rotate-45 -translate-y-1.5' : ''
          }`}
        />
      </div>
    </button>
  );
};

export default React.memo(MobileMenuButton);
