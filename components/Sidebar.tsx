
import React from 'react';
import { AppState, User } from '../types'; // Added User

interface SidebarItemProps {
  icon: string;
  text: string;
  isActive?: boolean;
  isBottom?: boolean;
  onClick?: () => void;
  'aria-current'?: 'page' | undefined;
  isCollapsed: boolean;
  showBadge?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = React.memo(({ icon, text, isActive, isBottom, onClick, isCollapsed, showBadge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 rounded-xl transition-all duration-200 ease-in-out group relative sidebar-item-hover
                ${isActive 
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-700 hover:text-gray-800 dark:hover:text-white'}
                ${isBottom ? '' : ''}
                ${isCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-3'}`}
    aria-current={isActive ? "page" : undefined}
    title={isCollapsed ? text : undefined}
  >
    <div className={`flex items-center justify-center w-5 h-5 ${isCollapsed ? 'mx-auto' : ''}`}>
      <i className={`${icon} text-sm ${isActive ? 'text-white' : 'text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300'} transition-colors`}></i>
    </div>
    {!isCollapsed && <span className="font-medium text-sm">{text}</span>}
    {!isCollapsed && isActive && showBadge && (
      <div className="ml-auto flex items-center">
        <div className="w-2 h-2 bg-white rounded-full shadow-sm"></div>
      </div>
    )}
    {/* Active indicator */}
    {isActive && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
    )}
  </button>
));

interface NavItemConfig {
  icon: string;
  text: string;
  appStateLink?: AppState | AppState[]; 
  onClick?: () => void; // Made onClick optional as some items might just be links
  requiresAuth?: boolean; // New: to control visibility based on auth state
  hideWhenAuth?: boolean; // New: to hide when authenticated (e.g. Login button)
}
interface SidebarProps {
  appState: AppState;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNavigateToDashboard: () => void;
  onNavigateToQuizList: () => void;
  onNavigateToLearningObjectives: () => void;
  onNavigateToPerformanceAnalysis: () => void;
  onNavigateToAchievements: () => void;
  onNavigateToCourses: () => void;
  onNavigateToSettings: () => void;
  currentUser: User | null; // Added currentUser
  onNavigateToProfile: () => void; // Added for profile
  onLogout: () => void; // Added for logout
}

const Sidebar: React.FC<SidebarProps> = ({
  appState,
  isCollapsed,
  onToggleCollapse,
  onNavigateToDashboard,
  onNavigateToQuizList,
  onNavigateToLearningObjectives,
  onNavigateToPerformanceAnalysis,
  onNavigateToAchievements,
  onNavigateToCourses,
  onNavigateToSettings,
  currentUser,
  onNavigateToProfile,
  onLogout,
}) => {

  const navItems: NavItemConfig[] = [
    { icon: 'fas fa-home', text: 'Ana Sayfa', appStateLink: 'dashboard_main', onClick: onNavigateToDashboard, requiresAuth: true },
    { icon: 'fas fa-layer-group', text: 'Derslerim', appStateLink: 'viewing_courses_list', onClick: onNavigateToCourses, requiresAuth: true },
    { icon: 'fas fa-clipboard-list', text: 'Sınavlarım',  appStateLink: ['viewing_quiz_list', 'viewing_specific_saved_result'], onClick: onNavigateToQuizList, requiresAuth: true },
    { icon: 'fas fa-bullseye', text: 'Öğrenme Hedeflerim', appStateLink: ['viewing_learning_objectives', 'viewing_course_learning_objectives'], onClick: onNavigateToLearningObjectives, requiresAuth: true },
    { icon: 'fas fa-chart-line', text: 'Performans Analizi', appStateLink: 'viewing_performance_analysis', onClick: onNavigateToPerformanceAnalysis, requiresAuth: true },
    { icon: 'fas fa-trophy', text: 'Başarılarım', appStateLink: 'viewing_achievements', onClick: onNavigateToAchievements, requiresAuth: true },
  ];

  const getInitials = (name?: string | null, email?: string | null): string => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return '??';
  };


  return (
    <aside className={`bg-white dark:bg-secondary-800 flex flex-col shadow-2xl shrink-0 transition-all duration-300 ease-in-out fixed top-0 left-0 h-full z-50 border-r border-gray-200 dark:border-secondary-700 ${isCollapsed ? 'w-20' : 'w-72'}`}>
      {/* Header Section */}
      <div className={`relative p-4 border-b border-gray-200 dark:border-secondary-700 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className={`p-2.5 bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 rounded-xl shadow-lg ${isCollapsed ? 'mb-0' : ''}`}>
            <i className="fas fa-robot text-xl text-white"></i>
          </div>
          {!isCollapsed && (
            <div className="flex-grow">
              <h1 className="text-lg font-bold text-gray-800 dark:text-white">AI Quiz</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Yapay Zeka Quiz Platformu</p>
            </div>
          )}
        </div>
        
        {/* Toggle Button */}
        <button 
          onClick={onToggleCollapse} 
          className={`absolute top-1/2 -translate-y-1/2 transform bg-white dark:bg-secondary-800 hover:bg-primary-500 text-gray-600 dark:text-gray-300 hover:text-white dark:hover:text-white w-8 h-8 rounded-full flex items-center justify-center focus:outline-none shadow-lg border border-gray-200 dark:border-secondary-600 transition-all duration-200 hover:scale-110
                      ${isCollapsed ? '-right-4' : '-right-4'}`}
          aria-label={isCollapsed ? "Kenar çubuğunu genişlet" : "Kenar çubuğunu daralt"}
          title={isCollapsed ? "Genişlet" : "Daralt"}
        >
          <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'} text-xs`}></i>
        </button>
      </div>

      {/* Navigation Section */}
      <nav className="flex-grow flex flex-col px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar-sidebar">
        {navItems.filter(item => !item.requiresAuth || currentUser).map(item => {
          const isActive = Array.isArray(item.appStateLink) 
                            ? item.appStateLink.includes(appState) 
                            : appState === item.appStateLink;
          return (
            <SidebarItem
              key={item.text}
              icon={item.icon}
              text={item.text}
              isActive={isActive}
              onClick={item.onClick}
              isCollapsed={isCollapsed}
              showBadge={true}
            />
          );
        })}
      </nav>
      
      {/* Bottom Section - User Profile & Settings */}
      <div className="border-t border-gray-200 dark:border-secondary-700 p-3 space-y-2">
        {currentUser ? (
          <>
            {/* User Profile Card */}
            <div 
              className={`flex items-center p-3 rounded-xl transition-all duration-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-secondary-700 group ${isCollapsed ? 'justify-center' : ''}`}
              onClick={onNavigateToProfile}
              title={isCollapsed ? (currentUser.displayName || currentUser.email || "Profil") : "Profili Görüntüle"}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                  {getInitials(currentUser.displayName, currentUser.email)}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white dark:border-secondary-800 rounded-full"></div>
              </div>
              {!isCollapsed && (
                <div className="ml-3 flex-grow min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{currentUser.displayName || 'Kullanıcı'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser.email}</p>
                </div>
              )}
              {!isCollapsed && (
                <i className="fas fa-chevron-right text-xs text-gray-400 group-hover:text-primary-500 transition-colors"></i>
              )}
            </div>
            
            {/* Settings Item */}
            <SidebarItem
              icon="fas fa-cog"
              text="Ayarlar"
              isActive={appState === 'viewing_settings'}
              onClick={onNavigateToSettings}
              isCollapsed={isCollapsed}
              isBottom={true}
              showBadge={false}
            />
            
            {/* Logout Item */}
            <SidebarItem
              icon="fas fa-sign-out-alt"
              text="Çıkış Yap"
              onClick={onLogout}
              isCollapsed={isCollapsed}
              isBottom={true}
              showBadge={false}
            />
          </>
        ) : (
          <SidebarItem
            icon="fas fa-sign-in-alt"
            text="Giriş Yap / Kayıt Ol"
            onClick={onNavigateToProfile}
            isCollapsed={isCollapsed}
            isBottom={true}
            showBadge={false}
          />
        )}
      </div>
      <style>{`
        .custom-scrollbar-sidebar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar-sidebar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar-sidebar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar-sidebar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }
        .custom-scrollbar-sidebar {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
        }
        
        /* Smooth hover animations */
        .sidebar-item-hover {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .sidebar-item-hover:hover {
          transform: translateX(2px);
        }
      `}</style>
    </aside>
  );
};

export default React.memo(Sidebar);
