
import { useState, useCallback, useRef, useEffect } from 'react';
import { AppState, AppConfig, AppSettings, Course, User, PersonalizedQuizType } from '../types';
import { onAuthStateChangedListener } from '../services/authService'; 

type ResetWorkflowStateFn = () => void;
type ResetPersistentDataSelectionsFn = () => void;
type SetCurrentQuizModeFn = (mode: 'quick' | 'personalized' | null) => void;
type SetIsTimerEnabledFn = (enabled: boolean) => void;

type LoadConfigFn = () => Promise<AppConfig>;
type GetConfigFn = () => AppConfig;

export const useAppRouter = () => {
  const [appState, setAppState] = useState<AppState>('auth_loading');
  const [isLoading, setIsLoading] = useState<boolean>(false); // General loading for operations like PDF processing
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  
  const [appConfig, setAppConfigInternal] = useState<AppConfig | null>(null);
  const [configLoading, setConfigLoadingInternal] = useState<boolean>(true);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true); 
  const [authError, setAuthError] = useState<string | null>(null); 
  const [authMessage, setAuthMessage] = useState<{type: 'success' | 'error', text:string} | null>(null);


  const [currentQuizModeForFlow, setCurrentQuizModeForFlow] = useState<'quick' | 'personalized' | null>(null);
  const [currentPersonalizedQuizTypeForFlow, setCurrentPersonalizedQuizTypeForFlow] = useState<PersonalizedQuizType | null>(null);
  const [currentSelectedCourseIdForFlow, setCurrentSelectedCourseIdForFlow] = useState<string | null>(null);
  const [currentViewingCourseForLOForFlow, setCurrentViewingCourseForLOForFlow] = useState<Course | null>(null);

  const appStateRef = useRef(appState);
  useEffect(() => {
    appStateRef.current = appState;
  }, [appState]);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      // Navigation logic based on auth state and current app state
      if (!user && !['login', 'signup', 'forgot_password', 'error', 'auth_loading'].includes(appStateRef.current)) {
         setAppState('login');
      } else if (user && (appStateRef.current === 'login' || appStateRef.current === 'signup' || appStateRef.current === 'auth_loading')) {
         setAppState('dashboard_main');
      } else if (!user && appStateRef.current === 'auth_loading') {
         setAppState('login');
      }
    });
    return unsubscribe;
  }, []);


  const setError = useCallback((error: string | Error, isDataOperationError: boolean = false) => {
    const messageString = error instanceof Error ? error.message : error;
    console.error("AppRouter Hata:", messageString, error);
    
    let displayMessage = messageString;
    if (messageString.includes("Firebase:")) { // Basic check for Firebase specific errors
        displayMessage = `Bir Firebase hatası oluştu: ${messageString}. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.`;
    } else if (isDataOperationError) {
        displayMessage = `Veri işlemi sırasında bir hata oluştu: ${messageString}. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.`;
    }
    setErrorMessage(displayMessage);
    setAppState('error');
    setIsLoading(false);
    setAuthLoading(false); 
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const navigateTo = useCallback((newState: AppState) => {
    if (appStateRef.current === 'error' && newState !== 'error') {
        clearError();
    }
    if (!['login', 'signup', 'forgot_password'].includes(newState)) {
        setAuthError(null);
        setAuthMessage(null);
    }
    setIsLoading(false); 
    setAppState(newState);
  }, [clearError]);

  const resetAppToDashboard = useCallback((
    resetQuizWorkflowState: ResetWorkflowStateFn,
    resetPersistentDataSelections: ResetPersistentDataSelectionsFn,
    navigate: boolean = true
  ) => {
    resetQuizWorkflowState();
    resetPersistentDataSelections();
    
    setCurrentQuizModeForFlow(null);
    setCurrentPersonalizedQuizTypeForFlow(null);
    setCurrentSelectedCourseIdForFlow(null);
    setCurrentViewingCourseForLOForFlow(null);

    setErrorMessage(null);
    setAuthError(null);
    setAuthMessage(null);
    setIsLoading(false);
    if (navigate) {
        if (currentUser) {
            navigateTo('dashboard_main');
        } else {
            navigateTo('login');
        }
    }
  }, [navigateTo, currentUser]);

  const startQuizFlow = useCallback((
    mode: 'quick' | 'personalized',
    resetQuizWorkflowState: ResetWorkflowStateFn,
    resetPersistentDataSelections: ResetPersistentDataSelectionsFn,
    setCurrentQuizModeCB: SetCurrentQuizModeFn,
    setIsTimerEnabledCB: SetIsTimerEnabledFn,
    currentAppSettings: AppSettings | null
  ) => {
    if (!appConfig || !currentAppSettings) {
        setError("Uygulama yapılandırması henüz hazır değil.");
        return;
    }
    if (mode === 'personalized' && !currentUser) {
        setError("Kişiselleştirilmiş sınavlar için giriş yapmanız gerekmektedir.");
        navigateTo('login');
        return;
    }

    resetAppToDashboard(resetQuizWorkflowState, resetPersistentDataSelections, false);
    
    setCurrentQuizModeForFlow(mode);
    setCurrentQuizModeCB(mode);
    setIsTimerEnabledCB(currentAppSettings.defaultTimerEnabled);

    if (mode === 'personalized') {
      navigateTo('selecting_course_for_quiz');
    } else {
      navigateTo('initial');
    }
  }, [appConfig, currentUser, setError, resetAppToDashboard, navigateTo]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);
  
  const initializeConfig = useCallback(async (loadConfigFn: LoadConfigFn, getConfigFn: GetConfigFn): Promise<AppConfig | null> => {
    setConfigLoadingInternal(true);
    try {
        const loadedConfig = await loadConfigFn();
        setAppConfigInternal(loadedConfig);
        return loadedConfig;
    } catch (error) {
        console.error("Ana uygulama yapılandırması yüklenemedi (useAppRouter):", error);
        const fallbackConfig = getConfigFn(); // Assuming getConfigFn returns a valid default or cached config
        setAppConfigInternal(fallbackConfig);
        // Do not call setError here as it might navigate to 'error' state too early.
        // Let App.tsx handle initial config load error display if necessary, or rely on defaults.
        return fallbackConfig; 
    } finally {
        setConfigLoadingInternal(false);
    }
  }, []);


  return {
    appState,
    isLoading, 
    errorMessage,
    isSidebarCollapsed,
    currentUser,
    authLoading,
    authError,
    authMessage,
    currentQuizModeForFlow,
    currentPersonalizedQuizTypeForFlow,
    currentSelectedCourseIdForFlow,
    currentViewingCourseForLOForFlow,
    navigateTo,
    setLoading: setIsLoading,
    setError,
    clearError,
    toggleSidebar,
    startQuizFlow,
    resetAppToDashboard,
    appConfig,
    configLoading,
    setAppConfigValue: setAppConfigInternal,
    setConfigLoadingStatus: setConfigLoadingInternal,
    initializeConfig,
    setAuthLoadingState: setAuthLoading,
    setAuthErrorState: setAuthError,
    setAuthMessageState: setAuthMessage,
    setCurrentSelectedCourseIdForFlowState: setCurrentSelectedCourseIdForFlow,
    setCurrentPersonalizedQuizTypeForFlowState: setCurrentPersonalizedQuizTypeForFlow,
    setCurrentViewingCourseForLOForFlowState: setCurrentViewingCourseForLOForFlow,
  };
};
