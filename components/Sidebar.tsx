
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
  <a
    href="#"
    onClick={(e) => { e.preventDefault(); onClick?.(); }}
    className={`relative flex items-center space-x-3 rounded-lg transition-all duration-200 ease-in-out
                ${isActive 
                  ? 'bg-primary-500 text-white shadow-lg' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-secondary-700 hover:text-gray-800 dark:hover:text-white'}
                ${isBottom ? 'mt-auto' : ''}
                ${isCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-3'}`}
    aria-current={isActive ? "page" : undefined}
    title={isCollapsed ? text : undefined}
  >
    <i className={`${icon} w-5 h-5 ${isActive ? 'text-white' : 'text-primary-700 dark:text-primary-300'} ${isCollapsed ? 'mx-auto' : ''}`}></i>
    {!isCollapsed && <span className="font-medium">{text}</span>}
    {!isCollapsed && isActive && showBadge && <span className="ml-auto w-2 h-2 bg-white dark:bg-white rounded-full"></span>}
  </a>
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
  
  const bottomNavItems: NavItemConfig[] = [
     { icon: 'fas fa-cog', text: 'Ayarlar', appStateLink: 'viewing_settings', onClick: onNavigateToSettings, requiresAuth: true },
     // Profile and Logout are handled separately for better UX if needed, or can be added here.
     // For simplicity, let's add Profile here and Logout can be inside ProfilePage or a dropdown.
     { icon: 'fas fa-user-circle', text: 'Profilim', appStateLink: 'profile', onClick: onNavigateToProfile, requiresAuth: true },
     { icon: 'fas fa-sign-in-alt', text: 'Giriş Yap', appStateLink: 'login', onClick: () => { /* navigateTo('login') handled by App.tsx */ onNavigateToProfile(); /* Temp, should be navigateToLogin */}, hideWhenAuth: true },
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
    <aside className={`bg-white dark:bg-secondary-800 p-4 flex flex-col space-y-2 shadow-2xl shrink-0 transition-all duration-300 ease-in-out fixed top-0 left-0 h-full z-50 ${isCollapsed ? 'w-20 items-center' : 'w-72'}`}>
      <div className={`flex items-center mb-6 p-1 relative ${isCollapsed ? 'justify-center w-full' : 'space-x-3'}`}>
        <div className={`p-2 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-lg ${isCollapsed ? 'mb-0' : ''}`}>
          <i className="fas fa-brain text-2xl text-white"></i>
        </div>
        {!isCollapsed && (
          <div className="flex-grow">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">QuizMaster</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">AI Learning Platform</p>
          </div>
        )}
         <button 
            onClick={onToggleCollapse} 
            className={`absolute top-1/2 -translate-y-1/2 transform bg-gray-100 dark:bg-secondary-700 hover:bg-primary-500 text-gray-600 dark:text-gray-300 hover:text-white dark:hover:text-white w-7 h-7 rounded-full flex items-center justify-center focus:outline-none shadow-md border border-gray-300 dark:border-secondary-600 transition-colors z-10
                        ${isCollapsed ? '-right-3.5' : '-right-2'}`} // Adjusted position
            aria-label={isCollapsed ? "Kenar çubuğunu genişlet" : "Kenar çubuğunu daralt"}
            title={isCollapsed ? "Genişlet" : "Daralt"}
          >
          <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'} text-xs`}></i>
        </button>
      </div>

      <nav className="flex-grow flex flex-col space-y-2 overflow-y-auto custom-scrollbar-sidebar pr-1">
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
      
      {/* Bottom section with User Info / Logout */}
      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-secondary-700">
        {currentUser ? (
             <div 
                className={`flex items-center p-2 rounded-lg transition-colors cursor-pointer hover:bg-gray-200 dark:hover:bg-secondary-700 ${isCollapsed ? 'justify-center' : ''}`}
                onClick={onNavigateToProfile}
                title={isCollapsed ? (currentUser.displayName || currentUser.email || "Profil") : "Profili Görüntüle"}
            >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {getInitials(currentUser.displayName, currentUser.email)}
                </div>
                {!isCollapsed && (
                    <div className="ml-3 flex-grow min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{currentUser.displayName || 'Kullanıcı'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser.email}</p>
                    </div>
                )}
                 {!isCollapsed && <i className="fas fa-cog ml-auto text-gray-500 dark:text-gray-400 hover:text-primary-500"></i>}
            </div>
        ) : (
             <SidebarItem
                icon="fas fa-sign-in-alt"
                text="Giriş Yap / Kayıt Ol"
                onClick={onNavigateToProfile} // This should navigate to login, handled by App router if no user
                isCollapsed={isCollapsed}
                isBottom={true}
             />
        )}

        {bottomNavItems.filter(item => (item.requiresAuth && currentUser) || (item.hideWhenAuth && !currentUser) || (!item.requiresAuth && !item.hideWhenAuth)).map(item => {
           // Avoid rendering "Profilim" again if already handled by user info block
           if (item.text === "Profilim" && currentUser) return null;
           // Avoid rendering "Giriş Yap" if user info block is handling it or currentUser exists
           if (item.text === "Giriş Yap" && currentUser) return null;

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
                isBottom={true} 
                showBadge={true}
              />
            );
        })}
        {currentUser && (
            <SidebarItem
                icon="fas fa-sign-out-alt"
                text="Çıkış Yap"
                onClick={onLogout}
                isCollapsed={isCollapsed}
                isBottom={true}
            />
        )}
      </div>
      <style>{`
        .custom-scrollbar-sidebar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar-sidebar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar-sidebar::-webkit-scrollbar-thumb {
          background: var(--scrollbar-thumb-color);
          border-radius: 10px;
        }
        .custom-scrollbar-sidebar::-webkit-scrollbar-thumb:hover {
          background: var(--scrollbar-thumb-hover-color);
        }
        .custom-scrollbar-sidebar {
          scrollbar-width: thin;
          scrollbar-color: var(--scrollbar-thumb-color) transparent;
        }
      `}</style>
    </aside>
  );
};

export default React.memo(Sidebar);
