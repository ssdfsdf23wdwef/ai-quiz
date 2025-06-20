
import { useState, useEffect, useCallback } from 'react';
import { User, QuizQuestion, SavedQuizData, LearningObjective, Achievement, Course, AppConfig, PersonalizedQuizType, LearningObjectiveStatus, QuizDifficulty } from '../types';
import {
  addQuizToDB, getAllQuizzesFromDB, deleteQuizFromDB,
  addOrUpdateLearningObjectives, getAllLearningObjectives, // Corrected import
  addCourseToDB, getAllCoursesFromDB, deleteCourseFromDB,
  updateMultipleQuizzesInDB
} from '../services/firestoreService';

type ErrorHandler = (error: string | Error, isDataOperationError?: boolean) => void;

export const usePersistentData = (
    currentUser: User | null, 
    handleError: ErrorHandler, 
    appConfig: AppConfig | null
) => {
  const [allSavedQuizzes, setAllSavedQuizzes] = useState<SavedQuizData[]>([]);
  const [selectedQuizForViewing, setSelectedQuizForViewing] = useState<SavedQuizData | null>(null);
  const [learningObjectives, setLearningObjectives] = useState<LearningObjective[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [currentViewingCourseForLO, setCurrentViewingCourseForLO] = useState<Course | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true); 

  const loadInitialData = useCallback(async () => {
    if (!currentUser) {
      setAllSavedQuizzes([]);
      setLearningObjectives([]);
      setAllCourses([]);
      setAchievements([]); 
      setIsLoadingData(false);
      return;
    }
    setIsLoadingData(true);
    try {
      const [quizzes, objectives, courses] = await Promise.all([
        getAllQuizzesFromDB(currentUser.uid),
        getAllLearningObjectives(currentUser.uid), // Corrected call
        getAllCoursesFromDB(currentUser.uid)
      ]);
      setAllSavedQuizzes(quizzes);
      setLearningObjectives(objectives);
      setAllCourses(courses);
    } catch (error) {
      console.error("Başlangıç verileri Firestore'dan yüklenirken hata:", error);
      handleError(error as Error, true);
    } finally {
      setIsLoadingData(false);
    }
  }, [currentUser, handleError]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);


  const calculateAndSetAchievements = useCallback(() => {
    if (!appConfig || !currentUser || isLoadingData) return;
    
    const userQuizzes = allSavedQuizzes; 
    const userLOs = learningObjectives; 
    const userCourses = allCourses; 

    const currentAchievements: Achievement[] = [
      { userId: currentUser.uid, id: 'ach1', title: 'İlk Adım', description: 'İlk sınavınızı başarıyla tamamladınız!', icon: 'fas fa-flag-checkered', isUnlocked: userQuizzes.length > 0, unlockedDate: userQuizzes.length > 0 ? Date.now() : undefined, category: 'Sınavlar' },
      { userId: currentUser.uid, id: 'ach2', title: 'Kitap Kurdu', description: 'Bir PDF\'ten sınav oluşturdunuz.', icon: 'fas fa-book-reader', isUnlocked: userQuizzes.some(q => q.pdfName), unlockedDate: userQuizzes.some(q => q.pdfName) ? Date.now() : undefined, category: 'Sınavlar' },
      { userId: currentUser.uid, id: 'ach3', title: 'Yüksek Skorer', description: 'Bir sınavda %90 veya üzeri başarı elde ettiniz.', icon: 'fas fa-star', isUnlocked: userQuizzes.some(q => q.totalQuestions > 0 && (q.score / q.totalQuestions) * 100 >= 90), unlockedDate: userQuizzes.some(q => q.totalQuestions > 0 && (q.score / q.totalQuestions) * 100 >= 90) ? Date.now() : undefined, category: 'Performans' },
      { userId: currentUser.uid, id: 'ach4', title: 'Kişisel Yolculuk', description: 'İlk kişiselleştirilmiş sınavınızı oluşturdunuz.', icon: 'fas fa-user-graduate', isUnlocked: userQuizzes.some(q => q.quizType === 'Kişiselleştirilmiş Sınav'), unlockedDate: userQuizzes.some(q => q.quizType === 'Kişiselleştirilmiş Sınav') ? Date.now() : undefined, category: 'Sınavlar' },
      { userId: currentUser.uid, id: 'ach5', title: 'Hedef Avcısı', description: 'Bir öğrenme hedefini "Başarılı" statüsüne getirdiniz.', icon: 'fas fa-bullseye-arrow', isUnlocked: userLOs.some(lo => lo.status === 'success'), unlockedDate: userLOs.some(lo => lo.status === 'success') ? Date.now() : undefined, category: 'Öğrenme' },
      { userId: currentUser.uid, id: 'ach6', title: 'Sınav Maratoncusu', description: 'Toplam 5 sınav tamamladınız.', icon: 'fas fa-running', isUnlocked: userQuizzes.length >= 5, unlockedDate: userQuizzes.length >= 5 ? Date.now() : undefined, category: 'Sınavlar', progress: {current: Math.min(userQuizzes.length, 5) , target: 5} },
      { userId: currentUser.uid, id: 'ach7', title: 'Ders Kaşifi', description: 'İlk dersinizi oluşturdunuz.', icon: 'fas fa-chalkboard-teacher', isUnlocked: userCourses.length > 0, unlockedDate: userCourses.length > 0 ? Date.now() : undefined, category: 'Öğrenme' },
    ];
    setAchievements(currentAchievements);
  }, [allSavedQuizzes, learningObjectives, allCourses, appConfig, currentUser, isLoadingData]);

  useEffect(() => {
    calculateAndSetAchievements();
  }, [calculateAndSetAchievements]); 

  const addCourse = useCallback(async (courseName: string): Promise<Course | undefined> => {
    if (!currentUser) {
        handleError("Yeni ders oluşturmak için giriş yapmalısınız.");
        return undefined;
    }
    if (!courseName.trim()) {
        handleError("Ders adı boş olamaz.");
        return undefined;
    }
    const courseData: Omit<Course, 'id' | 'createdAt' | 'userId'> = { name: courseName.trim() };
    try {
        const newCourse = await addCourseToDB(courseData, currentUser.uid);
        if (newCourse) {
            setAllCourses(prev => [newCourse, ...prev].sort((a,b) => b.createdAt - a.createdAt));
        }
        return newCourse;
    } catch (err) { 
        handleError(err as Error, true);
        return undefined;
    }
  }, [currentUser, handleError]);
  
  const updateMultipleQuizzes = useCallback(async (quizzesToUpdate: SavedQuizData[]) => {
     if (!currentUser || quizzesToUpdate.length === 0) return;
     try {
        await updateMultipleQuizzesInDB(quizzesToUpdate.map(q => ({...q, userId: currentUser.uid })), currentUser.uid); 
        const updatedQuizzes = await getAllQuizzesFromDB(currentUser.uid);
        setAllSavedQuizzes(updatedQuizzes);
     } catch (err) {
        handleError(err as Error, true);
     }
  }, [currentUser, handleError]);
  
  const addOrUpdateLOs = useCallback(async (objectivesToUpdate: LearningObjective[]) => {
    if (!currentUser || objectivesToUpdate.length === 0) return;
    try {
        await addOrUpdateLearningObjectives(objectivesToUpdate.map(lo => ({...lo, userId: currentUser.uid})), currentUser.uid); // Ensure userId
        const updatedDbObjectives = await getAllLearningObjectives(currentUser.uid); // Corrected call
        setLearningObjectives(updatedDbObjectives);
    } catch(dbError) {
        console.error("Öğrenme hedefleri Firestore'da güncellenirken hata:", dbError);
        handleError(`Öğrenme hedefleri güncellenemedi: ${(dbError as Error).message}`, true);
    }
  }, [currentUser, handleError]);

  const deleteCourse = useCallback(async (courseId: string) => {
    if (!currentUser) {
        handleError("Ders silmek için giriş yapmalısınız.");
        return;
    }
    if (window.confirm("Bu dersi silmek istediğinize emin misiniz? Bu dersle ilişkili sınavlar ve öğrenme hedefleri artık bu dersle ilişkilendirilmeyecektir (ancak veriler silinmeyecektir).")) {
        setIsLoadingData(true);
        try {
            const currentQuizzes = await getAllQuizzesFromDB(currentUser.uid);
            const quizzesToUpdate = currentQuizzes
                .filter(q => q.courseId === courseId)
                .map(q => ({ ...q, courseId: undefined, courseName: undefined, userId: currentUser.uid }));
            if (quizzesToUpdate.length > 0) await updateMultipleQuizzes(quizzesToUpdate);

            const currentLOs = await getAllLearningObjectives(currentUser.uid); // Corrected call
            const losToUpdate = currentLOs
                .filter(lo => lo.courseId === courseId)
                .map(lo => ({ ...lo, courseId: undefined, courseName: undefined, userId: currentUser.uid }));
            if (losToUpdate.length > 0) await addOrUpdateLOs(losToUpdate);
            
            await deleteCourseFromDB(courseId, currentUser.uid);
            
            setAllCourses(prev => prev.filter(c => c.id !== courseId));
             const updatedQuizzes = await getAllQuizzesFromDB(currentUser.uid);
             setAllSavedQuizzes(updatedQuizzes);
             const updatedLOs = await getAllLearningObjectives(currentUser.uid); // Corrected call
             setLearningObjectives(updatedLOs);

        } catch (err) { handleError(err as Error, true); }
        finally { setIsLoadingData(false); }
    }
  }, [currentUser, handleError, updateMultipleQuizzes, addOrUpdateLOs]);

  const saveQuizResult = useCallback(async (
    questions: QuizQuestion[],
    answers: Record<string, number>,
    pdfName: string | null,
    quizMode: 'quick' | 'personalized',
    personalizedQuizType: PersonalizedQuizType | null,
    selectedCourseId: string | null,
    difficulty: QuizDifficulty, 
    timerEnabled: boolean,
    numQuestionsForTime: number,
    secondsPerQ: number
  ): Promise<boolean> => {
    if (!currentUser) {
        handleError("Sınav sonuçlarını kaydetmek için giriş yapmalısınız.");
        return false; 
    }
    const score = questions.reduce((acc, q) => answers[q.id] === q.correctAnswerIndex ? acc + 1 : acc, 0);
    const selectedCourse = selectedCourseId ? allCourses.find(c => c.id === selectedCourseId) : undefined;
    
    const baseQuizData: Omit<SavedQuizData, 'id' | 'savedAt' | 'userId' | 'totalTimeAllocated'> = {
      questions,
      userAnswers: answers,
      score,
      totalQuestions: questions.length,
      quizType: quizMode === 'personalized' ? "Kişiselleştirilmiş Sınav" : "Hızlı Sınav",
      courseId: selectedCourse?.id || 'default-course',
      courseName: selectedCourse?.name || 'Genel',
      difficulty,
      isTimerEnabled: timerEnabled,
      ...(pdfName && { pdfName }),
      ...(quizMode === 'personalized' && personalizedQuizType && { personalizedQuizType }),
    };

    let quizDataToSave: Omit<SavedQuizData, 'id' | 'savedAt' | 'userId'>;

    if (timerEnabled) {
      quizDataToSave = {
        ...baseQuizData,
        totalTimeAllocated: numQuestionsForTime * secondsPerQ,
      };
    } else {
      quizDataToSave = baseQuizData;
    }
    
    try {
      const newSavedQuiz = await addQuizToDB(quizDataToSave, currentUser.uid);

      if (newSavedQuiz && newSavedQuiz.id && typeof newSavedQuiz.savedAt === 'number') {
        setAllSavedQuizzes(prev => {
          const existing = prev.find(q => q.id === newSavedQuiz.id);
          if (existing) {
            return prev.map(q => q.id === newSavedQuiz.id ? newSavedQuiz : q).sort((a,b) => b.savedAt - a.savedAt);
          }
          return [newSavedQuiz, ...prev].sort((a,b) => b.savedAt - a.savedAt);
        });
        return true; 
      } else {
        console.error("Sınav kaydedildikten sonra Firestore'dan alınırken bir sorun oluştu veya eksik veri döndü.", newSavedQuiz);
        handleError(new Error("Sınav kaydedildi ancak veriler tam olarak alınamadı. Liste güncellenmemiş olabilir."), true);
        return false;
      }
    } catch (err) {
      console.error("Sınav sonucu Firestore'a kaydedilirken hata:", err);
      handleError(new Error(`Sınav sonuçları kaydedilemedi: ${(err as Error).message}`), true);
      return false;
    }
  }, [currentUser, handleError, allCourses]);

  const deleteQuizFromList = useCallback(async (quizIdToDelete: string) => {
    if (!currentUser) {
        handleError("Sınav silmek için giriş yapmalısınız.");
        return;
    }
    if (window.confirm("Bu sınav sonucunu kalıcı olarak silmek istediğinize emin misiniz?")) {
      try {
        await deleteQuizFromDB(quizIdToDelete, currentUser.uid);
        setAllSavedQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz.id !== quizIdToDelete));
      } catch (err) {
        handleError(new Error(`Sınav Firestore'dan silinirken bir hata oluştu: ${(err as Error).message}`), true);
      }
    }
  }, [currentUser, handleError]);
  
  const resetPersistentDataSelectionState = useCallback(() => {
    setSelectedQuizForViewing(null);
    setCurrentViewingCourseForLO(null);
  }, []);

  return {
    allSavedQuizzes,
    learningObjectives,
    allCourses,
    achievements,
    selectedQuizForViewing,
    currentViewingCourseO: currentViewingCourseForLO, // Corrected typo
    isLoadingData,
    loadInitialData,
    addCourse,
    deleteCourse,
    saveQuizResult,
    viewQuizFromList: setSelectedQuizForViewing, 
    deleteQuizFromList,
    addOrUpdateLOs, 
    updateMultipleQuizzes,
    resetPersistentDataSelectionState,
    setSelectedQuizForViewingState: setSelectedQuizForViewing, 
    setCurrentViewingCourseForLOState: setCurrentViewingCourseForLO,
  };
};
