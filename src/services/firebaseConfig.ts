
// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
// import { getAnalytics, Analytics } from "firebase/analytics"; // Uncomment if you need Analytics

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// IMPORTANT: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyC_735vq8jM3ahjTzSOspNCG_yIlAEMhw0",
  authDomain: "ss-g-5e4d4.firebaseapp.com",
  projectId: "ss-g-5e4d4",
  storageBucket: "ss-g-5e4d4.firebasestorage.app",
  messagingSenderId: "1066930277028",
  appId: "1:1066930277028:web:29128a8dde4219f2857431",
  measurementId: "G-QM3K1N1KPY",
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const firestore: Firestore = getFirestore(app);
// const analytics: Analytics | undefined = firebaseConfig.measurementId ? getAnalytics(app) : undefined; // Uncomment if you need Analytics

export { app, auth, firestore /*, analytics */ };