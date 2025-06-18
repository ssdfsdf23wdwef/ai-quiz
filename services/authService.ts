
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from './firebaseConfig'; 
import { User } from '../types';

export const onAuthStateChangedListener = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const { uid, email, displayName } = firebaseUser;
      callback({ uid, email, displayName });
    } else {
      callback(null);
    }
  });
};

export const signInUser = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const { uid, email: userEmail, displayName } = userCredential.user;
  return { uid, email: userEmail, displayName };
};

export const signUpUser = async (email: string, password: string, displayName?: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }
  const { uid, email: userEmail, displayName: newDisplayName } = userCredential.user;
  return { uid, email: userEmail, displayName: newDisplayName || displayName };
};

export const signOutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const sendPasswordReset = async (email: string): Promise<void> => {
  await firebaseSendPasswordResetEmail(auth, email);
};

export const getCurrentUser = (): User | null => {
  const firebaseUser = auth.currentUser;
  if (firebaseUser) {
    const { uid, email, displayName } = firebaseUser;
    return { uid, email, displayName };
  }
  return null;
};
