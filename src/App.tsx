import React, { useEffect, useMemo, useCallback} from 'react';
import { loadAppConfig, getConfig } from './services/configService';

import PdfUploader from './components/PdfUploader';
import SubtopicSelector from './components/SubtopicSelector';
import QuizPreferences from './components/QuizPreferences';
import QuizView from './components/QuizView';
import QuizResult from './components/QuizResult';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import QuizCreationLayout, { QuizStageKey } from './components/QuizCreationLayout';
import ErrorBoundary from './components/ErrorBoundary';
import QuizListPage from './components/QuizListPage';
import LearningObjectivesPage from './components/LearningObjectivesPage';
import PerformanceAnalysisPage from './components/PerformanceAnalysisPage';
import AchievementsPage from './components/AchievementsPage';
import DashboardPage, { FeatureCardProps } from './components/DashboardPage';
import Sidebar from './components/Sidebar';
import MobileMenuButton from './components/MobileMenuButton';
import CoursesPage from './components/CoursesPage';
import CourseSelectionForQuizStep from './components/CourseSelectionForQuizStep';
import PersonalizedQuizTypeSelector from './components/PersonalizedQuizTypeSelector';
import SettingsPage from './components/SettingsPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ProfilePage from './components/ProfilePage';

import { useAppSettings } from './hooks/useAppSettings';
import { usePersistentData } from './hooks/usePersistentData';
import { useQuizWorkflow } from './hooks/useQuizWorkflow';
import { useAppRouter } from './hooks/useAppRouter';
import { signOutUser } from './services/authService';
import { getAuthMessageClasses, getTagClasses } from './utils/themeUtils';

const App: React.FC = () => {
  const {
    appState, isLoading: isRouterLoading, errorMessage, isSidebarCollapsed, currentUser, authLoading, authError, authMessage,
   currentSelectedCourseIdForFlow,
    navigateTo, setLoading: setRouterLoading, setError: setRouterError, toggleSidebar, startQuizFlow: routerStartQuizFlow,
    resetAppToDashboard: routerResetAppToDashboard,
    appConfig, configLoading, initializeConfig, 
    setAuthLoadingState, setAuthErrorState, setAuthMessageState,
     setCurrentPersonalizedQuizTypeForFlowState,
  } = useAppRouter();

  const { appSettings, updateAppSettings, isLoading: settingsLoading, theme } = useAppSettings(appConfig);

  const {
    allSavedQuizzes, learningObjectives, allCourses, achievements, selectedQuizForViewing,
    currentViewingCourseForLO,
    isLoadingData: persistentDataLoading,
    addCourse, deleteCourse, saveQuizResult, deleteQuizFromList,
    addOrUpdateLOs, deleteLearningObjectives, resetPersistentDataSelectionState,
    setSelectedQuizForViewingState, setCurrentViewingCourseForLOState,
  } = usePersistentData(currentUser, setRouterError, appConfig);

  const {
    currentQuizMode, currentPersonalizedQuizType, extractedPdfText, currentPdfName, numQuizQuestions,
    selectedDifficulty, isTimerEnabledForQuiz, identifiedNewSubtopics, confirmedExistingSubtopics,
    selectedSubtopics, currentQuizQuestions, currentUserAnswers, currentSelectedCourseId, 
    isLoading: quizWorkflowLoading,
    handleCourseSelectedForQuiz, handleNewCourseCreatedForQuiz, handlePersonalizedQuizTypeSelected,
    handlePdfTextExtracted, handleSubtopicsSelected, handleCancelSubtopicSelection,
    handlePreferencesSubmit, handleQuizSubmitAndUpdateLOs, resetQuizWorkflowState,
    setCurrentQuizModeState, setCurrentSelectedCourseIdState,setCurrentUserAnswersState,
  } = useQuizWorkflow(
    currentUser, appConfig, appSettings, learningObjectives, allCourses, addOrUpdateLOs, 
    setRouterError, navigateTo, currentSelectedCourseIdForFlow
  );
  
  // Initialize App Configuration
  useEffect(() => {
    initializeConfig(loadAppConfig, getConfig);
  }, [initializeConfig]);

  // quizCreationProgress'i hook kurallarına uygun şekilde en üstte tanımla
  const quizCreationProgress = useMemo(() => {
    const stages: QuizStageKey[] = currentQuizMode === 'personalized'
      ? (currentPersonalizedQuizType === 'weak_topics' 
          ? ['course_selection', 'personalized_quiz_type_selection', 'subtopic_selection', 'preferences'] 
          : ['course_selection', 'personalized_quiz_type_selection', 'file_upload', 'subtopic_selection', 'preferences'])
      : ['file_upload', 'subtopic_selection', 'preferences'];
    
    let currentStageIndex = stages.findIndex(s => {
      if (appState === 'initial' && (s === 'file_upload' || (currentQuizMode === 'personalized' && s === 'course_selection'))) return true;
      if (appState === 'selecting_course_for_quiz' && s === 'course_selection') return true;
      if (appState === 'selecting_personalized_quiz_type' && s === 'personalized_quiz_type_selection') return true;
      if (appState === 'selecting_subtopics' && s === 'subtopic_selection') return true;
      if (appState === 'preferences_setup' && s === 'preferences') return true;
      if (appState === 'generating_quiz' && s === 'preferences') return true; // generating uses preference's slot
      return false;
    });

    if (currentStageIndex === -1 && (appState === 'parsing_pdf' || appState === 'identifying_subtopics')) {
      currentStageIndex = stages.findIndex(s => s === 'file_upload'); // Or course_selection if personalized
      if (currentQuizMode === 'personalized' && stages.includes('course_selection')) {
        currentStageIndex = stages.findIndex(s => s === 'course_selection');
      }
    }
    
    if (currentStageIndex === -1 && appState === 'generating_quiz') currentStageIndex = stages.length -1; // Last step before completion

    return stages.length > 0 ? ((currentStageIndex + 1) / stages.length) * 100 : 0;
  }, [appState, currentQuizMode, currentPersonalizedQuizType]);

  const overallLoading = isRouterLoading || settingsLoading || persistentDataLoading || quizWorkflowLoading || configLoading || authLoading;

  const handleStartQuizFlow = useCallback((mode: 'quick' | 'personalized') => {
    if (!appSettings) {
      setRouterError("Uygulama ayarları henüz yüklenmedi.");
      return;
    }
    routerStartQuizFlow(mode, resetQuizWorkflowState, resetPersistentDataSelectionState, setCurrentQuizModeState, setIsTimerEnabledForQuizStateProxy, appSettings);
  }, [routerStartQuizFlow, resetQuizWorkflowState, resetPersistentDataSelectionState, setCurrentQuizModeState, appSettings, setRouterError]);

  const setIsTimerEnabledForQuizStateProxy = useCallback((_enabled: boolean) => {
    // Timer state is managed through quiz preferences, no direct state update needed here
    // This is a placeholder function for the workflow's interface compatibility
  }, []);


  const handleBackNavigation = useCallback(() => {
    switch (appState) {
      case 'selecting_subtopics':
        if(currentQuizMode === 'personalized' && currentPersonalizedQuizType === 'weak_topics'){
            navigateTo('selecting_personalized_quiz_type');
        } else {
            navigateTo('initial');
        }
        break;
      case 'preferences_setup':
        if (identifiedNewSubtopics && identifiedNewSubtopics.length > 0) {
            navigateTo('selecting_subtopics');
        } else if (currentQuizMode === 'personalized' && currentPersonalizedQuizType === 'weak_topics') {
             // If weak_topics and no subtopics were found (identifiedNewSubtopics is null/empty),
             // going back from preferences should go to personalized_quiz_type_selection
            navigateTo('selecting_personalized_quiz_type');
        } else if (extractedPdfText) { // If there was a PDF, go back to initial (PDF uploader)
            navigateTo('initial');
        } else if (currentQuizMode === 'personalized') {
             // If personalized but no PDF and not weak_topics (e.g., error case or unexpected flow)
            navigateTo('selecting_personalized_quiz_type');
        } else {
            navigateTo('initial'); // Default fallback for quick quiz or unexpected
        }
        break;
      case 'quiz_active': navigateTo('preferences_setup'); break;
      case 'quiz_completed': navigateTo(currentUser ? 'dashboard_main' : 'login'); break; // Stay on quiz_completed, let user decide action
      case 'viewing_specific_saved_result': navigateTo('viewing_quiz_list'); break;
      case 'viewing_course_learning_objectives': navigateTo('viewing_courses_list'); break;
      case 'selecting_personalized_quiz_type': navigateTo('selecting_course_for_quiz'); break;
      case 'selecting_course_for_quiz': 
         routerResetAppToDashboard(resetQuizWorkflowState, resetPersistentDataSelectionState);
         break;
      default: routerResetAppToDashboard(resetQuizWorkflowState, resetPersistentDataSelectionState);
    }
  }, [appState, navigateTo, routerResetAppToDashboard, resetQuizWorkflowState, resetPersistentDataSelectionState, currentQuizMode, currentPersonalizedQuizType, identifiedNewSubtopics, extractedPdfText, currentUser]);

  const handleSaveAndExitQuizResults = useCallback(async () => {
    if (!currentQuizQuestions || !currentUserAnswers || !appSettings || !currentUser) {
      setRouterError("Sınav sonuçları kaydedilemedi: Gerekli veriler eksik.");
      return;
    }
    setRouterLoading(true);
    const success = await saveQuizResult(
      currentQuizQuestions, currentUserAnswers, currentPdfName,
      currentQuizMode || 'quick', currentPersonalizedQuizType, currentSelectedCourseId,
      selectedDifficulty, isTimerEnabledForQuiz, numQuizQuestions, appSettings.secondsPerQuestion
    );
    setRouterLoading(false);

    if (success) {
      setAuthMessageState({ type: 'success', text: "Sınav sonuçları başarıyla kaydedildi!" });
      routerResetAppToDashboard(resetQuizWorkflowState, resetPersistentDataSelectionState);
    } else {
      // Error is handled by saveQuizResult via handleError, which should set appState to 'error'
      // or display a prominent error message. No need for additional error handling here unless
      // saveQuizResult's error handling doesn't navigate or display prominently.
    }
  }, [
    currentQuizQuestions, currentUserAnswers, currentPdfName, currentQuizMode, currentPersonalizedQuizType,
    currentSelectedCourseId, selectedDifficulty, isTimerEnabledForQuiz, numQuizQuestions, appSettings, saveQuizResult, 
    routerResetAppToDashboard, resetQuizWorkflowState, resetPersistentDataSelectionState, currentUser, setRouterError,
    setRouterLoading, setAuthMessageState
  ]);

  // Kullanıcı hızlı sınav sonucunu kaydetmek için giriş yapmaya yönlendirilir
  const handleLoginToSaveQuizResult = useCallback(() => {
    navigateTo('login');
  }, [navigateTo]);
  
  const handleDeleteSpecificSavedResult = useCallback(async(quizId: string) => {
    if (!currentUser) {
        setRouterError("Bu işlem için giriş yapmalısınız.");
        return;
    }
    await deleteQuizFromList(quizId);
    setAuthMessageState({ type: 'success', text: "Sınav sonucu silindi." });
    routerResetAppToDashboard(resetQuizWorkflowState, resetPersistentDataSelectionState);
  }, [deleteQuizFromList, routerResetAppToDashboard, resetQuizWorkflowState, resetPersistentDataSelectionState, currentUser, setRouterError, setAuthMessageState]);

  const handlePdfProcessingStateChange = useCallback((isProcessing: boolean) => {
    setRouterLoading(isProcessing);
    if (!isProcessing && appState === 'parsing_pdf') { 
    } else if (isProcessing) {
        navigateTo('parsing_pdf');
    }
  }, [setRouterLoading, appState, navigateTo]);
  
  const mainFeatureCards: FeatureCardProps[] = [
    {
      icon: 'fas fa-bolt',
      title: 'Hızlı Sınav',
      description: 'Bir PDF belgesi yükleyin ve metin içeriğinden anında rastgele bir sınav oluşturun. Hızlı bilgi kontrolü için idealdir.',
      buttonText: 'Hızlı Sınav Oluştur',
      buttonIcon: 'fas fa-arrow-right',
      buttonGradientClasses: 'bg-gradient-to-r from-cyan-500 to-blue-600',
      onClick: () => handleStartQuizFlow('quick'),
    },
    {
      icon: 'fas fa-user-graduate',
      tag: { text: '', colorClass: getTagClasses(theme, 'pink').colorClass, bgColorClass: getTagClasses(theme, 'pink').bgColorClass },
      title: 'Kişiselleştirilmiş Sınav',
      description: 'Öğrenme hedeflerinize, zayıf olduğunuz konulara veya belgedeki yeni konulara odaklanan özel sınavlar oluşturun. Gelişiminizi takip edin.',
      buttonText: 'Kişisel Sınav Oluştur',
      buttonIcon: 'fas fa-arrow-right',
      buttonGradientClasses: 'bg-gradient-to-r from-pink-500 to-fuchsia-600',
      premium: true,
      onClick: () => handleStartQuizFlow('personalized'),
    },
  ];

  const handleLogout = async () => {
    setAuthLoadingState(true);
    try {
      await signOutUser();
      routerResetAppToDashboard(resetQuizWorkflowState, resetPersistentDataSelectionState, true); // true to navigate to login
    } catch (e) {
      setRouterError("Çıkış yapılamadı: " + (e as Error).message);
    } finally {
      setAuthLoadingState(false);
    }
  };

  // Sınav tamamlandığında kullanıcının giriş durumuna göre yönlendirme
  const handleFinishQuiz = useCallback(() => {
    if (currentUser) {
      // Giriş yapan kullanıcı Sınavlarım sayfasına
      navigateTo('viewing_quiz_list');
    } else {
      // Giriş yapmayan kullanıcı Ana Sayfa'ya
      routerResetAppToDashboard(resetQuizWorkflowState, resetPersistentDataSelectionState);
    }
  }, [currentUser, navigateTo, routerResetAppToDashboard, resetQuizWorkflowState, resetPersistentDataSelectionState]);

  const renderContent = () => {
    if (authLoading || configLoading || (!appSettings && appState !== 'error')) {
      return <div className="flex items-center justify-center h-screen"><LoadingSpinner text="Uygulama yükleniyor..." /></div>;
    }
    if (errorMessage && appState === 'error') {
      return <ErrorMessage message={errorMessage} onRetry={() => routerResetAppToDashboard(resetQuizWorkflowState, resetPersistentDataSelectionState)} />;
    }
    
    // Auth Pages (no sidebar)
    if (!currentUser && (appState === 'login' || appState === 'signup' || appState === 'forgot_password' || appState === 'auth_loading')) {
       if (authLoading && appState === 'auth_loading') return <div className="flex items-center justify-center h-screen"><LoadingSpinner text="Oturum durumu kontrol ediliyor..." /></div>;
        if (appState === 'login') return <LoginPage 
                                            onLoginSuccess={() => navigateTo('dashboard_main')} 
                                            navigateTo={(state) => navigateTo(state)}
                                            setAuthLoading={setAuthLoadingState}
                                            setAuthError={setAuthErrorState}
                                            theme={theme}
                                        />;
        if (appState === 'signup') return <SignupPage 
                                            onSignupSuccess={() => navigateTo('dashboard_main')} 
                                            navigateTo={(state) => navigateTo(state)}
                                            setAuthLoading={setAuthLoadingState}
                                            setAuthError={setAuthErrorState}
                                            theme={theme}
                                        />;
        if (appState === 'forgot_password') return <ForgotPasswordPage 
                                                    navigateTo={(state) => navigateTo(state)}
                                                    setAuthLoading={setAuthLoadingState}
                                                    setAuthMessage={setAuthMessageState}
                                                    theme={theme}
                                                />;
    }
    
    // Artık giriş yapmayan kullanıcılar da ana sayfaya erişebilir
    // Sadece auth sayfalarında (login, signup, forgot_password) kontrol yap
    
    // Common UI for all users (Sidebar + Main Content)
    // Show spinner if any critical data is loading for the main app view
    if (settingsLoading || persistentDataLoading || (!appConfig && !errorMessage)) {
        return (
            <div className={`flex h-screen ${theme === 'dark' ? 'bg-secondary-900' : 'bg-gray-100'}`}>
                {!configLoading && <Sidebar 
                    appState={appState} 
                    isCollapsed={isSidebarCollapsed} 
                    onToggleCollapse={toggleSidebar}
                    onNavigateToDashboard={() => routerResetAppToDashboard(resetQuizWorkflowState, resetPersistentDataSelectionState)}
                    onNavigateToQuizList={() => navigateTo('viewing_quiz_list')}
                    onNavigateToLearningObjectives={() => { setCurrentViewingCourseForLOState(null); navigateTo('viewing_learning_objectives');}}
                    onNavigateToPerformanceAnalysis={() => navigateTo('viewing_performance_analysis')}
                    onNavigateToAchievements={() => navigateTo('viewing_achievements')}
                    onNavigateToCourses={() => navigateTo('viewing_courses_list')}
                    onNavigateToSettings={() => navigateTo('viewing_settings')}
                    currentUser={currentUser}
                    onNavigateToProfile={() => navigateTo('profile')}
                    onNavigateToLogin={() => navigateTo('login')}
                    onLogout={handleLogout}
                    theme={theme}
                />}
                <main className="flex-grow overflow-y-auto flex items-center justify-center">
                    <div className="p-4 sm:p-6 lg:p-8">
                        <LoadingSpinner text="Veriler yükleniyor..." />
                    </div>
                </main>
            </div>
        );
    }
    
    if (!appConfig || !appSettings) { // Should be caught by configLoading or error state
        return <ErrorMessage message="Uygulama yapılandırması yüklenemedi. Lütfen sayfayı yenileyin." onRetry={() => window.location.reload()} />;
    }
    
    let pageContent;
    switch (appState) {
      case 'initial':
      case 'parsing_pdf':
      case 'identifying_subtopics':
      case 'selecting_subtopics':
      case 'preferences_setup':
      case 'generating_quiz':
      case 'selecting_course_for_quiz':
      case 'selecting_personalized_quiz_type':
        let creationStageKey: QuizStageKey;
        if (appState === 'initial') creationStageKey = currentQuizMode === 'personalized' && currentPersonalizedQuizType !== 'weak_topics' ? 'file_upload' : (currentQuizMode === 'personalized' ? 'course_selection' : 'file_upload');
        else if (appState === 'selecting_course_for_quiz') creationStageKey = 'course_selection';
        else if (appState === 'selecting_personalized_quiz_type') creationStageKey = 'personalized_quiz_type_selection';
        else if (appState === 'selecting_subtopics') creationStageKey = 'subtopic_selection';
        else if (appState === 'preferences_setup') creationStageKey = 'preferences';
        else if (appState === 'generating_quiz') creationStageKey = 'generating';
        else creationStageKey = 'file_upload'; // Fallback for parsing_pdf, identifying_subtopics

         if (appState === 'initial' && currentQuizMode === 'personalized' && !currentSelectedCourseId) {
            creationStageKey = 'course_selection';
        } else if (appState === 'initial' && currentQuizMode === 'personalized' && currentSelectedCourseId && !currentPersonalizedQuizType) {
            creationStageKey = 'personalized_quiz_type_selection';
        } else if (appState === 'initial' && currentQuizMode === 'personalized' && currentPersonalizedQuizType === 'weak_topics'){
             // Should have navigated to subtopic_selection already
             // This case means user somehow got back to 'initial'
             creationStageKey = 'subtopic_selection';
        }


        let childContent;
        if (appState === 'initial' || appState === 'parsing_pdf' || appState === 'identifying_subtopics') {
            if (currentQuizMode === 'personalized') {                if (!currentSelectedCourseId) { // Needs course selection
                    childContent = <CourseSelectionForQuizStep 
                                      courses={allCourses} 
                                      onCourseSelected={(courseId) => {
                                        setCurrentSelectedCourseIdState(courseId);
                                        handleCourseSelectedForQuiz(courseId, navigateTo);
                                      }}
                                      onNewCourseCreated={async (name) => {
                                        const newCourse = await addCourse(name);
                                        if (newCourse) {
                                            setCurrentSelectedCourseIdState(newCourse.id);
                                            handleNewCourseCreatedForQuiz(name, addCourse, navigateTo);
                                        }
                                      }}
                                      onCancel={() => routerResetAppToDashboard(resetQuizWorkflowState, resetPersistentDataSelectionState)}
                                      theme={theme}
                                    />;
                    creationStageKey = 'course_selection';
                } else if (!currentPersonalizedQuizType) { // Needs personalized type selection
                    childContent = <PersonalizedQuizTypeSelector 
                                    learningObjectives={learningObjectives}
                                    currentCourseId={currentSelectedCourseId}
                                    onQuizTypeSelected={(type) => {
                                        setCurrentPersonalizedQuizTypeForFlowState(type);
                                        handlePersonalizedQuizTypeSelected(type, navigateTo, setRouterLoading);
                                    }}
                                    onBack={handleBackNavigation}
                                    theme={theme}
                                  />;
                    creationStageKey = 'personalized_quiz_type_selection';
                } else if (currentPersonalizedQuizType === 'weak_topics') {
                    // Directly go to subtopic selector for weak_topics
                     childContent = <SubtopicSelector
                                        newSubtopics={identifiedNewSubtopics || []}
                                        confirmedExistingSubtopics={confirmedExistingSubtopics || []}
                                        onConfirm={(topics) => handleSubtopicsSelected(topics, navigateTo, setRouterLoading)}
                                        onCancel={() => handleCancelSubtopicSelection(navigateTo, setRouterLoading)}
                                        isLoading={quizWorkflowLoading && (appState === 'identifying_subtopics' || appState === 'parsing_pdf')}
                                        selectionContext="weak_topics"
                                        theme={theme}
                                    />;
                    creationStageKey = 'subtopic_selection';
                } else { // new_topics or comprehensive, needs PDF
                     childContent = <PdfUploader 
                                        onPdfTextExtracted={(text, name) => handlePdfTextExtracted(text, name, navigateTo, setRouterLoading)}
                                        onProcessingStateChange={handlePdfProcessingStateChange}
                                        onError={(msg) => setRouterError(msg)}
                                        theme={theme}
                                    />;
                    creationStageKey = 'file_upload';
                }
            } else { // Quick quiz, needs PDF
                 childContent = <PdfUploader 
                                    onPdfTextExtracted={(text, name) => handlePdfTextExtracted(text, name, navigateTo, setRouterLoading)}
                                    onProcessingStateChange={handlePdfProcessingStateChange}
                                    onError={(msg) => setRouterError(msg)}
                                    theme={theme}
                                />;
                creationStageKey = 'file_upload';
            }
        } else if (appState === 'selecting_course_for_quiz') {
            childContent = <CourseSelectionForQuizStep 
                              courses={allCourses} 
                              onCourseSelected={(courseId) => {
                                setCurrentSelectedCourseIdState(courseId);
                                handleCourseSelectedForQuiz(courseId, navigateTo);
                              }}
                              onNewCourseCreated={async (name) => {
                                const newCourse = await addCourse(name);
                                if (newCourse) {
                                    setCurrentSelectedCourseIdState(newCourse.id);
                                    handleNewCourseCreatedForQuiz(name, addCourse, navigateTo);
                                }
                              }}
                              onCancel={() => routerResetAppToDashboard(resetQuizWorkflowState, resetPersistentDataSelectionState)}
                              theme={theme}
                          />;
        } else if (appState === 'selecting_personalized_quiz_type') {
             childContent = <PersonalizedQuizTypeSelector 
                                learningObjectives={learningObjectives}
                                currentCourseId={currentSelectedCourseId} // from workflow state
                                onQuizTypeSelected={(type) => {
                                    setCurrentPersonalizedQuizTypeForFlowState(type);
                                    handlePersonalizedQuizTypeSelected(type, navigateTo, setRouterLoading);
                                }}
                                onBack={handleBackNavigation}
                                theme={theme}
                              />;
        } else if (appState === 'selecting_subtopics') {
          childContent = <SubtopicSelector
                            newSubtopics={identifiedNewSubtopics || []}
                            confirmedExistingSubtopics={confirmedExistingSubtopics || []}
                            onConfirm={(topics) => handleSubtopicsSelected(topics, navigateTo, setRouterLoading)}
                            onCancel={() => handleCancelSubtopicSelection(navigateTo, setRouterLoading)}
                            isLoading={quizWorkflowLoading}
                            selectionContext={currentPersonalizedQuizType === 'weak_topics' ? 'weak_topics' : 'pdf_scan'}
                            theme={theme}
                         />;
        } else if (appState === 'preferences_setup') {
          childContent = <QuizPreferences
                            onSubmit={(numQ, diff, timer) => handlePreferencesSubmit(numQ, diff, timer, navigateTo, setRouterLoading)}
                            onBack={handleBackNavigation}
                            initialNumQuestions={numQuizQuestions}
                            initialDifficulty={selectedDifficulty}
                            initialTimerEnabled={isTimerEnabledForQuiz}
                            defaultSecondsPerQuestion={appSettings.secondsPerQuestion}
                            selectedSubtopicsCount={selectedSubtopics?.length || 0}
                            hasIdentifiedSubtopics={!!(identifiedNewSubtopics && identifiedNewSubtopics.length > 0) || (currentPersonalizedQuizType === 'weak_topics' && !!identifiedNewSubtopics)}
                            currentQuizMode={currentQuizMode}
                            currentPersonalizedQuizType={currentPersonalizedQuizType}
                            quizDefaults={appConfig.quizDefaults}
                            theme={theme}
                          />;
        } else if (appState === 'generating_quiz') {
          childContent = <LoadingSpinner text="Sınavınız oluşturuluyor, lütfen bekleyin..." />;
        }
        pageContent = (
          <QuizCreationLayout 
            currentStageKey={creationStageKey} 
            progress={quizCreationProgress} 
            onBack={appState !== 'generating_quiz' ? handleBackNavigation : undefined}
            quizMode={currentQuizMode || undefined}
            currentPersonalizedQuizType={currentPersonalizedQuizType}
          >
            {childContent}
          </QuizCreationLayout>
        );
        break;
      case 'quiz_active':
        if (!currentQuizQuestions) {
          setRouterError("Sınav soruları yüklenemedi.");
          pageContent = <ErrorMessage message="Sınav soruları yüklenemedi." onRetry={handleBackNavigation} />;
        } else {
          pageContent = <QuizView
                            questions={currentQuizQuestions}
                            onSubmitQuiz={(answers) => {
                                setCurrentUserAnswersState(answers); // Store answers for result view
                                handleQuizSubmitAndUpdateLOs(answers); // Process LOs and then navigate
                            }}
                            onCancel={() => routerResetAppToDashboard(resetQuizWorkflowState, resetPersistentDataSelectionState)}
                            isTimerEnabled={isTimerEnabledForQuiz}
                            totalTimeInSeconds={isTimerEnabledForQuiz ? numQuizQuestions * appSettings.secondsPerQuestion : 0}
                            pdfSourceFilename={currentPdfName || undefined}
                            theme={theme}
                        />;
        }
        break;
      case 'quiz_completed':
        if (!currentQuizQuestions || !currentUserAnswers) {
          setRouterError("Sınav sonuçları görüntülenemedi: Gerekli veriler eksik.");
          pageContent = <ErrorMessage message="Sınav sonuçları görüntülenemedi." onRetry={handleBackNavigation} />;
        } else {
          pageContent = <QuizResult
                            questions={currentQuizQuestions}
                            userAnswers={currentUserAnswers}
                            onRestart={() => routerResetAppToDashboard(resetQuizWorkflowState, resetPersistentDataSelectionState)}
                            onFinish={handleFinishQuiz}
                            onSaveResult={currentUser ? handleSaveAndExitQuizResults : undefined}
                            onLoginToSave={!currentUser ? handleLoginToSaveQuizResult : undefined}
                            isUserLoggedIn={!!currentUser}
                            theme={theme}
                        />;
        }
        break;
      case 'dashboard_main':
        pageContent = <DashboardPage features={mainFeatureCards} onStartQuizFlow={handleStartQuizFlow} theme={theme} />;
        break;
      case 'viewing_quiz_list':
        pageContent = <QuizListPage 
                          savedQuizzes={allSavedQuizzes} 
                          onViewQuiz={(quiz) => { setSelectedQuizForViewingState(quiz); navigateTo('viewing_specific_saved_result'); }} 
                          onAddNewQuiz={() => handleStartQuizFlow('quick')}
                          onAddNewPersonalizedQuiz={() => handleStartQuizFlow('personalized')}
                          theme={theme}
                      />;
        break;
      case 'viewing_specific_saved_result':
        if (!selectedQuizForViewing) {
          setRouterError("Kaydedilmiş sınav sonucu bulunamadı.");
          pageContent = <ErrorMessage message="Kaydedilmiş sınav sonucu bulunamadı." onRetry={() => navigateTo('viewing_quiz_list')} />;
        } else {
          pageContent = <QuizResult
                            questions={selectedQuizForViewing.questions}
                            userAnswers={selectedQuizForViewing.userAnswers}
                            onRestart={() => routerResetAppToDashboard(resetQuizWorkflowState, resetPersistentDataSelectionState)}
                            onFinish={handleFinishQuiz}
                            isViewingSaved={true}
                            pdfName={selectedQuizForViewing.pdfName}
                            savedAt={selectedQuizForViewing.savedAt}
                            quizId={selectedQuizForViewing.id}
                            onDeleteSpecificResult={handleDeleteSpecificSavedResult}
                            isUserLoggedIn={!!currentUser}
                            theme={theme}
                          />;
        }
        break;
      case 'viewing_learning_objectives':
      case 'viewing_course_learning_objectives':
        pageContent = <LearningObjectivesPage 
                          objectives={learningObjectives} 
                          allCourses={allCourses}
                          filterByCourse={appState === 'viewing_course_learning_objectives' ? currentViewingCourseForLO : null}
                          onBack={appState === 'viewing_course_learning_objectives' ? () => navigateTo('viewing_courses_list') : () => routerResetAppToDashboard(resetQuizWorkflowState, resetPersistentDataSelectionState)}
                          onDeleteObjectives={deleteLearningObjectives}
                          theme={theme || 'light'}
                      />;
        break;
      case 'viewing_performance_analysis':
        pageContent = <PerformanceAnalysisPage 
                            savedQuizzes={allSavedQuizzes} 
                            allCourses={allCourses} 
                            learningObjectives={learningObjectives}
                            onBack={() => routerResetAppToDashboard(resetQuizWorkflowState, resetPersistentDataSelectionState)}
                            theme={theme || 'light'}
                        />;
        break;
      case 'viewing_achievements':
        pageContent = <AchievementsPage achievements={achievements} onBack={() => routerResetAppToDashboard(resetQuizWorkflowState, resetPersistentDataSelectionState)} theme={theme} />;
        break;
      case 'viewing_courses_list':
        pageContent = <CoursesPage 
                        courses={allCourses} 
                        learningObjectives={learningObjectives}
                        onAddCourse={addCourse} 
                        onDeleteCourse={deleteCourse} 
                        onViewCourseLOs={(course) => {setCurrentViewingCourseForLOState(course); navigateTo('viewing_course_learning_objectives');}}
                        onBack={() => routerResetAppToDashboard(resetQuizWorkflowState, resetPersistentDataSelectionState)}
                        theme={theme}
                      />;
        break;
      case 'viewing_settings':
        pageContent = <SettingsPage 
                        currentSettings={appSettings} 
                        onSaveSettings={updateAppSettings} 
                        onBack={() => routerResetAppToDashboard(resetQuizWorkflowState, resetPersistentDataSelectionState)}
                        appConfigDefaults={appConfig.appSettingsDefaults}
                        theme={theme}
                      />;
        break;
      case 'profile':
        pageContent = <ProfilePage 
                        currentUser={currentUser} 
                        onLogout={handleLogout}
                        onBack={() => routerResetAppToDashboard(resetQuizWorkflowState, resetPersistentDataSelectionState)}
                        setAuthLoading={setAuthLoadingState}
                        setAuthError={setAuthErrorState}
                        theme={theme}
                      />;
        break;
      default:
        pageContent = <div className="text-center">Beklenmeyen durum: {appState}</div>;
    }
    
    // Auth messages (e.g., password reset email sent, login error)
    let authFeedbackMessage = null;
    if (authError && (appState === 'login' || appState === 'signup')) {
        authFeedbackMessage = <div className={`fixed top-5 right-5 px-4 py-3 rounded-md shadow-lg z-[100000] border ${getAuthMessageClasses(theme, 'error')}`} role="alert">
                                <strong className="font-bold">Hata!</strong>
                                <span className="block sm:inline ml-2">{authError}</span>
                                <span className="absolute top-0 bottom-0 right-0 px-3 py-2" onClick={() => setAuthErrorState(null)}>
                                    <i className="fas fa-times cursor-pointer"></i>
                                </span>
                              </div>;
    }
    if (authMessage && (appState === 'login' || appState === 'forgot_password' || appState === 'dashboard_main' || appState === 'quiz_completed' || appState === 'viewing_quiz_list')) {
         authFeedbackMessage = <div className={`fixed top-5 right-5 px-4 py-3 rounded-md shadow-lg z-[100000] border ${getAuthMessageClasses(theme, authMessage.type === 'success' ? 'success' : 'error')}`} role="alert">
                                <strong className="font-bold">{authMessage.type === 'success' ? 'Başarılı!' : 'Bilgi'}</strong>
                                <span className="block sm:inline ml-2">{authMessage.text}</span>
                                <span className="absolute top-0 bottom-0 right-0 px-3 py-2" onClick={() => setAuthMessageState(null)}>
                                    <i className="fas fa-times cursor-pointer"></i>
                                </span>
                              </div>;
    }


    return (
      <div className={`flex h-screen font-sans overflow-hidden ${theme === 'dark' ? 'bg-secondary-900' : 'bg-gray-100'}`}>
        {authFeedbackMessage}
        
        {/* Mobile Menu Button */}
        {!['login', 'signup', 'forgot_password', 'auth_loading'].includes(appState) && (
          <MobileMenuButton
            isOpen={!isSidebarCollapsed}
            onClick={toggleSidebar}
            theme={theme}
          />
        )}
        
        {!['login', 'signup', 'forgot_password', 'auth_loading'].includes(appState) && (
            <Sidebar
                appState={appState}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={toggleSidebar}
                onNavigateToDashboard={() => routerResetAppToDashboard(resetQuizWorkflowState, resetPersistentDataSelectionState)}
                onNavigateToQuizList={() => navigateTo('viewing_quiz_list')}
                onNavigateToLearningObjectives={() => { setCurrentViewingCourseForLOState(null); navigateTo('viewing_learning_objectives'); }}
                onNavigateToPerformanceAnalysis={() => navigateTo('viewing_performance_analysis')}
                onNavigateToAchievements={() => navigateTo('viewing_achievements')}
                onNavigateToCourses={() => navigateTo('viewing_courses_list')}
                onNavigateToSettings={() => navigateTo('viewing_settings')}
                currentUser={currentUser}
                onNavigateToProfile={() => navigateTo('profile')}
                onNavigateToLogin={() => navigateTo('login')}
                onLogout={handleLogout}
                theme={theme}
            />
        )}
        <main className={`flex-grow overflow-y-auto transition-all duration-300 ease-in-out ${
          !['login', 'signup', 'forgot_password', 'auth_loading'].includes(appState)
            ? `ml-0 lg:ml-${isSidebarCollapsed ? '20' : '72'}`
            : 'ml-0'
        } ${
          !['login', 'signup', 'forgot_password', 'auth_loading'].includes(appState)
            ? 'pt-16 lg:pt-0' 
            : ''
        }`}>
          <div className="min-h-full p-3 sm:p-4 lg:p-6 xl:p-8">
            {overallLoading && appState !== 'error' && !authError && !authMessage ? <LoadingSpinner text="Yükleniyor..." /> : pageContent}
          </div>
        </main>
      </div>
    );
  };
  
  return (
    <ErrorBoundary onReset={() => routerResetAppToDashboard(resetQuizWorkflowState, resetPersistentDataSelectionState)}>
      {renderContent()}
    </ErrorBoundary>
  );
};

export default App;
