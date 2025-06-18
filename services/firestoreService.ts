
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  writeBatch,
  serverTimestamp, 
  updateDoc,
  getDoc,
  Timestamp,
  setDoc,
  DocumentReference, // Added for type safety
  DocumentData,    // Added for type safety
} from 'firebase/firestore';
import { firestore } from './firebaseConfig';
import { SavedQuizData, LearningObjective, Course } from '../types';

const QUIZZES_COLLECTION = 'quizzes';
const LEARNING_OBJECTIVES_COLLECTION = 'learningObjectives';
const COURSES_COLLECTION = 'courses';

// Helper to convert Firestore Timestamps to numbers if they exist
const mapTimestampToNumber = (data: any): any => {
  const mappedData = { ...data };
  if (mappedData.createdAt instanceof Timestamp) {
    mappedData.createdAt = mappedData.createdAt.toMillis();
  }
  if (mappedData.updatedAt instanceof Timestamp) {
    mappedData.updatedAt = mappedData.updatedAt.toMillis();
  }
  if (mappedData.savedAt instanceof Timestamp) {
    mappedData.savedAt = mappedData.savedAt.toMillis();
  }
  return mappedData;
};

const getDocDataWithId = async <T extends { id: string }>(docRef: DocumentReference<DocumentData>): Promise<T | null> => {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return mapTimestampToNumber({ id: docSnap.id, ...docSnap.data() } as T);
    }
    return null;
};


// Quiz Data Functions
export const addQuizToDB = async (quizData: Omit<SavedQuizData, 'id' | 'savedAt' | 'userId'>, userId: string): Promise<SavedQuizData | null> => {
  const docRef = await addDoc(collection(firestore, QUIZZES_COLLECTION), {
    ...quizData,
    userId,
    savedAt: serverTimestamp(), 
  });
  return getDocDataWithId<SavedQuizData>(docRef);
};

export const getAllQuizzesFromDB = async (userId: string): Promise<SavedQuizData[]> => {
  const q = query(
    collection(firestore, QUIZZES_COLLECTION),
    where('userId', '==', userId),
    orderBy('savedAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => mapTimestampToNumber({ id: doc.id, ...doc.data() } as SavedQuizData));
};

export const deleteQuizFromDB = async (quizId: string, userId: string): Promise<void> => {
  // Add a check for userId before deleting if desired, or rely on Firestore rules
  const docRef = doc(firestore, QUIZZES_COLLECTION, quizId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists() && docSnap.data().userId === userId) {
    await deleteDoc(docRef);
  } else {
    throw new Error("Quiz not found or permission denied.");
  }
};

export const updateMultipleQuizzesInDB = async (quizzes: SavedQuizData[], userId: string): Promise<void> => {
  if (quizzes.length === 0) return;
  const batch = writeBatch(firestore);
  quizzes.forEach(quiz => {
    if (quiz.userId !== userId) {
        console.warn(`Skipping quiz update for ${quiz.id} as it does not belong to user ${userId}`);
        return;
    }
    const docRef = doc(firestore, QUIZZES_COLLECTION, quiz.id);
    const { id, ...quizDataToUpdate } = quiz; 
    batch.update(docRef, { ...quizDataToUpdate, updatedAt: serverTimestamp() });
  });
  await batch.commit();
};

// Learning Objective Functions
export const addOrUpdateLearningObjectives = async (objectives: LearningObjective[], userId: string): Promise<void> => {
  if (objectives.length === 0) return;
  const batch = writeBatch(firestore);
  objectives.forEach(objective => {
    if (objective.userId !== userId) {
        console.warn(`Skipping LO update for ${objective.id} as it does not belong to user ${userId}`);
        return;
    }
    const docRef = doc(firestore, LEARNING_OBJECTIVES_COLLECTION, objective.id);
    const { id, ...objectiveData } = objective;
    const dataToSet: Partial<LearningObjective> & { updatedAt: any, createdAt?: any } = {
        ...objectiveData,
        userId, // Ensure userId is part of the data being set
        updatedAt: serverTimestamp(),
    };
    
    // Check if it's potentially a new objective by looking at createdAt on the object (which would be a number if pre-filled by client)
    // Or if we are sure it's an update, we don't need to set createdAt.
    // For set with merge, if createdAt exists, it's an update; if not, it's a create.
    // If objective.createdAt is not already a serverTimestamp or number, set it.
    // This logic might need refinement based on how `id` is generated and if `createdAt` is pre-filled.
    // Assuming objectives might be new if they don't have a numeric createdAt.
    if (typeof objective.createdAt !== 'number') { 
        dataToSet.createdAt = serverTimestamp();
    }

    batch.set(docRef, dataToSet, { merge: true }); 
  });
  await batch.commit();
};


export const getAllLearningObjectives = async (userId: string): Promise<LearningObjective[]> => {
  const q = query(
    collection(firestore, LEARNING_OBJECTIVES_COLLECTION),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => mapTimestampToNumber({ id: doc.id, ...doc.data() } as LearningObjective));
};


export const getLearningObjectiveById = async (id: string, userId: string): Promise<LearningObjective | undefined> => {
  const docRef = doc(firestore, LEARNING_OBJECTIVES_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = mapTimestampToNumber({ id: docSnap.id, ...docSnap.data() } as LearningObjective);
    return data.userId === userId ? data : undefined;
  }
  return undefined;
};

// Course Functions
export const addCourseToDB = async (courseData: Omit<Course, 'id' | 'createdAt' | 'userId'>, userId: string): Promise<Course | null> => {
  const docRef = await addDoc(collection(firestore, COURSES_COLLECTION), {
    ...courseData,
    userId,
    createdAt: serverTimestamp(),
  });
  return getDocDataWithId<Course>(docRef);
};

export const getAllCoursesFromDB = async (userId: string): Promise<Course[]> => {
  const q = query(
    collection(firestore, COURSES_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => mapTimestampToNumber({ id: doc.id, ...doc.data() } as Course));
};

export const deleteCourseFromDB = async (courseId: string, userId: string): Promise<void> => {
  const docRef = doc(firestore, COURSES_COLLECTION, courseId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists() && docSnap.data().userId === userId) {
    await deleteDoc(docRef);
  } else {
    throw new Error("Course not found or permission denied.");
  }
};
