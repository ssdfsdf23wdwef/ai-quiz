import { useState, useCallback } from 'react';
import {
  QuizQuestion, QuizDifficulty, PersonalizedQuizType, AppConfig, AppSettings,
  LearningObjective, Course, LearningObjectiveStatus, AppState, User
} from '../types';
import { generateQuizFromText, identifySubtopicsFromText } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';

type ErrorHandler = (error: string | Error, isDataOperationError?: boolean) => void;
type NavigateHandler = (newState: AppState) => void;
type AddOrUpdateLOsHandler = (objectives: LearningObjective[]) => Promise<void>;

export const useQuizWorkflow = (
  currentUser: User | null, // Added currentUser
  appConfig: AppConfig | null,
  appSettings: AppSettings | null,
  learningObjectivesFromDB: LearningObjective[],
  allCoursesFromDB: Course[],
  addOrUpdateLOs: AddOrUpdateLOsHandler, // Renamed from addOrUpdateLOsInDB
  handleError: ErrorHandler,
  navigateTo: NavigateHandler,
  currentSelectedCourseIdForFlow: string | null 
) => {
  const [currentQuizMode, setCurrentQuizMode] = useState<'quick' | 'personalized' | null>(null);
  const [currentPersonalizedQuizType, setCurrentPersonalizedQuizType] = useState<PersonalizedQuizType | null>(null);
  const [extractedPdfText, setExtractedPdfText] = useState<string | null>(null);
  const [currentPdfName, setCurrentPdfName] = useState<string | null>(null);

  const [numQuizQuestions, setNumQuizQuestions] = useState<number>(appConfig?.quizDefaults.defaultNumQuestions || 6);
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty>('Orta');
  const [isTimerEnabledForQuiz, setIsTimerEnabledForQuiz] = useState<boolean>(false);

  const [identifiedNewSubtopics, setIdentifiedNewSubtopics] = useState<string[] | null>(null);
  const [confirmedExistingSubtopics, setConfirmedExistingSubtopics] = useState<string[] | null>(null); // May not be used with Firestore if LOs are the source of truth
  const [selectedSubtopics, setSelectedSubtopics] = useState<string[] | null>(null);

  const [currentQuizQuestions, setCurrentQuizQuestions] = useState<QuizQuestion[] | null>(null);
  const [currentUserAnswers, setCurrentUserAnswers] = useState<Record<string, number> | null>(null); // Not directly set here, but part of overall state
  const [currentSelectedCourseId, setCurrentSelectedCourseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const setWorkflowError = (message: string) => {
    handleError(message);
    setIsLoading(false);
  }

  const resetQuizWorkflowState = useCallback(() => {
    setCurrentQuizMode(null);
    setCurrentPersonalizedQuizType(null);
    setExtractedPdfText(null);
    setCurrentPdfName(null);
    setIdentifiedNewSubtopics(null);
    setConfirmedExistingSubtopics(null);
    setSelectedSubtopics(null);
    setCurrentQuizQuestions(null);
    setCurrentUserAnswers(null);
    setCurrentSelectedCourseId(null); 
    if (appConfig) setNumQuizQuestions(appConfig.quizDefaults.defaultNumQuestions);
    setSelectedDifficulty('Orta');
    if (appSettings) setIsTimerEnabledForQuiz(appSettings.defaultTimerEnabled);
    setIsLoading(false);
  }, [appConfig, appSettings]);

  const handleCourseSelectedForQuiz = useCallback((courseId: string, navigate: NavigateHandler) => {
    setCurrentSelectedCourseId(courseId); 
    if (currentQuizMode === 'personalized') {
        navigate('selecting_personalized_quiz_type');
    } else {
        // Should not happen for quick quiz from this flow directly
        navigate('initial');
    }
  }, [currentQuizMode]);

  const handleNewCourseCreatedForQuiz = useCallback(async (
    newCourseName: string, 
    addCourseToDBAndState: (name: string) => Promise<Course | undefined>, 
    navigate: NavigateHandler
  ) => {
    if (!currentUser) {
        handleError("Ders oluşturmak için giriş yapmalısınız.");
        return;
    }
    if (!newCourseName.trim()) {
        handleError("Ders adı boş olamaz.");
        return;
    }
    const newCourse = await addCourseToDBAndState(newCourseName);
    if (newCourse) {
        setCurrentSelectedCourseId(newCourse.id);
        if (currentQuizMode === 'personalized') {
            navigate('selecting_personalized_quiz_type');
        } else {
            handleError("Hızlı sınav modunda yeni ders oluşturulmamalıydı.");
            navigate('initial');
        }
    }
  }, [handleError, currentQuizMode, currentUser]);


  const handlePersonalizedQuizTypeSelected = useCallback((
    quizType: PersonalizedQuizType,
    navigate: NavigateHandler,
    setLoadingCB: (loading: boolean) => void // Callback from App.tsx
  ) => {
    setCurrentPersonalizedQuizType(quizType);
    const selectedCourse = allCoursesFromDB.find(c => c.id === currentSelectedCourseId && c.userId === currentUser?.uid);

    if (!currentUser) {
        handleError("Bu işlem için giriş yapmalısınız.");
        navigate('login');
        return;
    }

    if (!selectedCourse && quizType !== null) {
        handleError("Lütfen önce bir ders seçin.");
        navigate('selecting_course_for_quiz');
        return;
    }

    setExtractedPdfText(null); // Use direct state setters
    setCurrentPdfName(null);
    setIdentifiedNewSubtopics(null);
    setConfirmedExistingSubtopics(null);
    setSelectedSubtopics(null);
    setLoadingCB(true);

    if (quizType === 'weak_topics' && selectedCourse) {
        const weakLearningObjectives = learningObjectivesFromDB.filter(
            lo => lo.courseId === selectedCourse.id && lo.userId === currentUser.uid && (lo.status === 'failure' || lo.status === 'intermediate' || lo.status === 'pending')
        );
        const weakTopicNames = weakLearningObjectives.map(lo => lo.name);
        setIdentifiedNewSubtopics(weakTopicNames); 
        setConfirmedExistingSubtopics([]); 
        setSelectedSubtopics(weakTopicNames); 
        setLoadingCB(false);
        navigate('selecting_subtopics');
    } else { // new_topics or comprehensive require PDF upload
        setLoadingCB(false);
        navigate('initial'); // Navigate to PDF uploader
    }
  }, [currentSelectedCourseId, allCoursesFromDB, learningObjectivesFromDB, handleError, currentUser]);


  const handlePdfTextExtracted = useCallback(async (
    text: string, 
    pdfName: string,
    navigate: NavigateHandler,
    setLoadingCB: (loading: boolean) => void
  ) => {
    if (!appConfig || !currentUser) { // Added currentUser check
        setWorkflowError("Uygulama yapılandırması yüklenemedi veya kullanıcı bulunamadı.");
        return;
    }
    setExtractedPdfText(text);
    setCurrentPdfName(pdfName);
    setLoadingCB(true);
    navigate('identifying_subtopics');

    const selectedCourse = currentSelectedCourseId ? allCoursesFromDB.find(c => c.id === currentSelectedCourseId && c.userId === currentUser.uid) : undefined;

    try {
      const { newSubtopics } = await identifySubtopicsFromText(text, pdfName);

      if (currentQuizMode === 'personalized' && (currentPersonalizedQuizType === 'new_topics' || currentPersonalizedQuizType === 'comprehensive') && pdfName && selectedCourse) {
        const objectivesToUpdateInDB: LearningObjective[] = [];
        const existingObjectivesMapForThisPdfCourse = new Map(
          learningObjectivesFromDB
            .filter(lo => lo.sourcePdfName === pdfName && lo.courseId === selectedCourse?.id && lo.userId === currentUser.uid)
            .map(obj => [obj.name, obj])
        );

        newSubtopics.forEach(subtopicName => {
            if (!existingObjectivesMapForThisPdfCourse.has(subtopicName)) {
                const id = uuidv4();
                const newObjective: LearningObjective = {
                    id, userId: currentUser.uid, name: subtopicName, status: 'pending',
                    sourcePdfName: pdfName, createdAt: Date.now(), updatedAt: Date.now(),
                    courseId: selectedCourse.id, courseName: selectedCourse.name,
                };
                objectivesToUpdateInDB.push(newObjective);
            }
        });
        if (objectivesToUpdateInDB.length > 0) {
            await addOrUpdateLOs(objectivesToUpdateInDB); // Use the renamed prop
        }
      }

      const topicsForSelectionStep = newSubtopics;
      if (topicsForSelectionStep.length > 0) {
        setIdentifiedNewSubtopics(topicsForSelectionStep);
        setConfirmedExistingSubtopics([]);
        setSelectedSubtopics(topicsForSelectionStep); 
        navigate('selecting_subtopics');
      } else {
        setIdentifiedNewSubtopics(null);
        setConfirmedExistingSubtopics(null);
        setSelectedSubtopics(null); 
        navigate('preferences_setup');
      }
    } catch (err) { setWorkflowError((err as Error).message); }
    finally { setLoadingCB(false); }
  }, [appConfig, currentUser, currentSelectedCourseId, allCoursesFromDB, currentQuizMode, currentPersonalizedQuizType, learningObjectivesFromDB, addOrUpdateLOs]);

  const handleSubtopicsSelected = useCallback((topics: string[], navigate: NavigateHandler, setLoadingCB: (loading: boolean) => void) => {
    setSelectedSubtopics(topics);
    navigate('preferences_setup');
    setLoadingCB(false);
  }, []);

  const handleCancelSubtopicSelection = useCallback((navigate: NavigateHandler, setLoadingCB: (loading: boolean) => void) => {
    setSelectedSubtopics(null); 
    navigate('preferences_setup');
    setLoadingCB(false);
  }, []);

  const handlePreferencesSubmit = useCallback(async (
    questionsCount: number, 
    difficulty: QuizDifficulty, 
    timerEnabled: boolean,
    navigate: NavigateHandler,
    setLoadingCB: (loading: boolean) => void
    ) => {
    if (!appConfig || !appSettings || !currentUser) { // Added currentUser check
        setWorkflowError("Yapılandırma yüklenemedi veya kullanıcı bulunamadı.");
        return;
    }
    if (!extractedPdfText && !(currentQuizMode === 'personalized' && currentPersonalizedQuizType === 'weak_topics')) {
      setWorkflowError("PDF metni bulunamadı. Lütfen tekrar deneyin.");
      return;
    }
    setNumQuizQuestions(questionsCount);
    setSelectedDifficulty(difficulty);
    setIsTimerEnabledForQuiz(timerEnabled);
    setLoadingCB(true);
    navigate('generating_quiz');

    let topicsForQuizGeneration = selectedSubtopics || [];
    if (currentQuizMode === 'personalized' && currentSelectedCourseId && currentUser) { // Added currentSelectedCourseId check & currentUser
        if (currentPersonalizedQuizType === 'weak_topics') {
            topicsForQuizGeneration = selectedSubtopics || identifiedNewSubtopics || [];
        } else if (currentPersonalizedQuizType === 'comprehensive') {
            const weakLOsNames = learningObjectivesFromDB
                .filter(lo => lo.courseId === currentSelectedCourseId && lo.userId === currentUser.uid && (lo.status === 'failure' || lo.status === 'intermediate' || lo.status === 'pending'))
                .map(lo => lo.name);
            topicsForQuizGeneration = Array.from(new Set([...weakLOsNames, ...(selectedSubtopics || [])]));
        }
    }

    try {
      const quizData = await generateQuizFromText(
        extractedPdfText, questionsCount, appSettings.numOptionsPerQuestion,
        topicsForQuizGeneration.length > 0 ? topicsForQuizGeneration : undefined,
        currentQuizMode || 'quick', difficulty,
        currentQuizMode === 'personalized' ? currentPersonalizedQuizType : undefined
      );
      if (quizData.questions.length === 0) {
        setWorkflowError("Sınav oluşturulamadı. Model hiç soru üretemedi. Lütfen ayarlarınızı veya kaynak metni/konuları kontrol edin.");
        navigate('preferences_setup');
        setLoadingCB(false);
        return;
      }
      setCurrentQuizQuestions(quizData.questions);
      navigate('quiz_active');
    } catch (err) { 
      setWorkflowError((err as Error).message); 
      navigate('preferences_setup'); // Navigate back on error
    }
    finally { setLoadingCB(false); }
  }, [appConfig, appSettings, currentUser, extractedPdfText, currentQuizMode, currentPersonalizedQuizType, selectedSubtopics, identifiedNewSubtopics, learningObjectivesFromDB, currentSelectedCourseId]);

  const handleQuizSubmitAndUpdateLOs = useCallback(async (answers: Record<string, number>) => { // Renamed to avoid clash, added answers
    if (!currentUser) {
        setWorkflowError("Bu işlem için kullanıcı girişi gereklidir.");
        return;
    }
    setCurrentUserAnswers(answers); // Store answers for QuizResult
    const selectedCourse = currentSelectedCourseId ? allCoursesFromDB.find(c => c.id === currentSelectedCourseId && c.userId === currentUser.uid) : undefined;

    if (currentQuizMode === 'personalized' && currentQuizQuestions && selectedCourse) {
        const objectivesToUpdate: LearningObjective[] = [];
        const subtopicPerformance: Record<string, { correct: number, total: number }> = {};
        currentQuizQuestions.forEach(q => {
            if (q.subtopic) {
                if (!subtopicPerformance[q.subtopic]) subtopicPerformance[q.subtopic] = { correct: 0, total: 0 };
                subtopicPerformance[q.subtopic].total++;
                if (answers[q.id] === q.correctAnswerIndex) subtopicPerformance[q.subtopic].correct++;
            }
        });
        const sourcePdfForLOs = currentPersonalizedQuizType === 'weak_topics' 
            ? `Zayıf Konular (${selectedCourse.name})` // Use a more descriptive source for weak topics
            : currentPdfName;

        Object.keys(subtopicPerformance).forEach(subtopicName => {
            const existingObjective = learningObjectivesFromDB.find(lo =>
                lo.name === subtopicName && lo.courseId === selectedCourse.id && lo.userId === currentUser.uid &&
                (currentPersonalizedQuizType === 'weak_topics' || lo.sourcePdfName === sourcePdfForLOs)
            );

            const perf = subtopicPerformance[subtopicName];
            let newStatus: LearningObjectiveStatus = existingObjective?.status || 'pending';
            if (perf && perf.total > 0) {
                const pct = (perf.correct / perf.total) * 100;
                if (pct >= 90) newStatus = 'success'; // Stricter for success
                else if (pct < 50) newStatus = 'failure';
                else newStatus = 'intermediate';
            } else if (existingObjective && existingObjective.status === 'pending') {
                newStatus = 'intermediate'; // If tested but no data, mark as intermediate from pending
            }
            
            if (existingObjective) {
                if (existingObjective.status !== newStatus || !existingObjective.userId) { // Update if status changes or userId missing
                    objectivesToUpdate.push({ ...existingObjective, userId: currentUser.uid, status: newStatus, updatedAt: Date.now() });
                }
            } else if (sourcePdfForLOs) { // Create new LO only if not weak_topics and sourcePdf is available
                 const id = uuidv4();
                    objectivesToUpdate.push({
                        id, userId: currentUser.uid, name: subtopicName, status: newStatus, sourcePdfName: sourcePdfForLOs,
                        createdAt: Date.now(), updatedAt: Date.now(),
                        courseId: selectedCourse.id, courseName: selectedCourse.name,
                    });
            }
        });
        if (objectivesToUpdate.length > 0) {
            await addOrUpdateLOs(objectivesToUpdate); // Use the renamed prop
        }
    }
    navigateTo('quiz_completed'); // Navigate after processing
  }, [currentUser, currentSelectedCourseId, allCoursesFromDB, currentQuizMode, currentQuizQuestions, currentPersonalizedQuizType, currentPdfName, learningObjectivesFromDB, addOrUpdateLOs, navigateTo, setWorkflowError]);


  return {
    currentQuizMode,
    currentPersonalizedQuizType,
    extractedPdfText,
    currentPdfName,
    numQuizQuestions,
    selectedDifficulty,
    isTimerEnabledForQuiz,
    identifiedNewSubtopics,
    confirmedExistingSubtopics,
    selectedSubtopics,
    currentQuizQuestions,
    currentUserAnswers, // Ensure this is returned
    currentSelectedCourseId, 
    isLoading,
    setQuizWorkflowLoading: setIsLoading,
    setQuizWorkflowError: setWorkflowError, 
    handleCourseSelectedForQuiz,
    handleNewCourseCreatedForQuiz,
    handlePersonalizedQuizTypeSelected,
    handlePdfTextExtracted,
    handleSubtopicsSelected,
    handleCancelSubtopicSelection,
    handlePreferencesSubmit,
    handleQuizSubmitAndUpdateLOs, 
    resetQuizWorkflowState,
    setCurrentQuizModeState: setCurrentQuizMode,
    setExtractedPdfTextState: setExtractedPdfText,
    setCurrentPdfNameState: setCurrentPdfName,
    setIdentifiedNewSubtopicsState: setIdentifiedNewSubtopics,
    setConfirmedExistingSubtopicsState: setConfirmedExistingSubtopics,
    setSelectedSubtopicsState: setSelectedSubtopics,
    setCurrentQuizQuestionsState: setCurrentQuizQuestions,
    setCurrentUserAnswersState: setCurrentUserAnswers,
    setCurrentSelectedCourseIdState: setCurrentSelectedCourseId,
  };
};