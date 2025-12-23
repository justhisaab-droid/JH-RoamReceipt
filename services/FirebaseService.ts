import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA0FVjUb-kpeQdQXQ1sTWkEtdpwRrdcFEM",
  authDomain: "justhisaab-80c17.firebaseapp.com",
  databaseURL: "https://justhisaab-80c17-default-rtdb.firebaseio.com",
  projectId: "justhisaab-80c17",
  storageBucket: "justhisaab-80c17.firebasestorage.app",
  messagingSenderId: "1014622710892",
  appId: "1:1014622710892:web:72d45e573ab5d520c9bc49",
  measurementId: "G-7097P73W1W"
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
const auth = getAuth(app);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };