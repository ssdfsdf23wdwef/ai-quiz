
export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

export interface Course {
  id: string;
  userId: string;
  name: string;
  createdAt: number;
}

export interface QuizQuestion {
  id:string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  userAnswerIndex?: number;
  subtopic?: string;
  explanation?: string; // Sorunun açıklaması/çözümü
}

export type LearningObjectiveStatus = 'pending' | 'success' | 'failure' | 'intermediate';

export interface LearningObjective {
  id: string; 
  userId: string;
  name: string;
  status: LearningObjectiveStatus;
  sourcePdfName: string;
  createdAt: number;
  updatedAt: number;
  courseId?: string;
  courseName?: string;
}

export type QuizDifficulty = 'Kolay' | 'Orta' | 'Zor';
export type PersonalizedQuizType = 'comprehensive' | 'new_topics' | 'weak_topics';

export type AppState = 
  | 'initial' 
  | 'parsing_pdf' 
  | 'identifying_subtopics'
  | 'selecting_subtopics'
  | 'preferences_setup' 
  | 'generating_quiz' 
  | 'quiz_active' 
  | 'quiz_completed' 
  | 'viewing_saved_results' 
  | 'dashboard_main'
  | 'viewing_quiz_list' 
  | 'viewing_specific_saved_result' 
  | 'viewing_learning_objectives' 
  | 'viewing_course_learning_objectives' 
  | 'viewing_performance_analysis' 
  | 'viewing_achievements' 
  | 'viewing_courses_list' 
  | 'selecting_course_for_quiz'
  | 'selecting_personalized_quiz_type' 
  | 'viewing_settings'
  | 'login'
  | 'signup'
  | 'forgot_password'
  | 'profile'
  | 'auth_loading' 
  | 'error';

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  retrievedContext?: {
    uri:string;
    title: string;
  };
}

export interface SavedQuizData {
  id: string;
  userId: string;
  questions: QuizQuestion[];
  userAnswers: Record<string, number>;
  score: number;
  totalQuestions: number;
  pdfName?: string; 
  savedAt: number;
  quizType?: string; 
  courseId?: string;
  courseName?: string;
  difficulty?: QuizDifficulty; 
  isTimerEnabled?: boolean; 
  totalTimeAllocated?: number; 
  personalizedQuizType?: PersonalizedQuizType;
}

export interface Achievement {
  id: string;
  userId: string;
  title: string;
  description: string;
  icon: string; 
  isUnlocked: boolean;
  unlockedDate?: number; 
  progress?: { current: number; target: number }; 
  category?: string; 
}

export interface AppSettings {
  defaultTimerEnabled: boolean;
  secondsPerQuestion: number;
  numOptionsPerQuestion: number;
  theme: 'light' | 'dark';
}

export interface AppConfig {
  gemini: {
    textModel: string;
    identifySubtopics: {
      temperature: number;
      thinkingBudget: number;
    };
    generateQuiz: {
      defaultTemperature: number;
      personalizedTemperature: number;
      thinkingBudget: number;
      responseMimeType: string;
    };
  };
  quizDefaults: {
    defaultNumQuestions: number;
    minQuestionsPerSubtopic: number;
    minQuestionsForQuiz: number;
    maxQuestionsForQuiz: number;
    minSubtopicsForDynamicOptions: number;
    maxSubtopicsForDynamicOptions: number;
    maxSubtopicsPerDocument: number;
  };
  appSettingsDefaults: {
    secondsPerQuestion: number;
    numOptionsPerQuestion: number;
    theme: string; 
    defaultTimerEnabled: boolean;
  };
  maxPdfTextLength: number;
}
