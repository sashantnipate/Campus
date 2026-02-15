// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
console.log("ENV CHECK:", import.meta.env.VITE_FIREBASE_API_KEY);
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "eventflow-72c9a.firebaseapp.com",
  projectId: "eventflow-72c9a",
  storageBucket: "eventflow-72c9a.firebasestorage.app",
  messagingSenderId: "727865402715",
  appId: "1:727865402715:web:29b617ae4ced80d07f267e",
  measurementId: "G-GH0LDDJKLR"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

