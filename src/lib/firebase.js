// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB6ntLqPOR2Vbr-RBPZ6EituHGwN6TjzUo",
  authDomain: "collectify-2d503.firebaseapp.com",
  projectId: "collectify-2d503",
  storageBucket: "collectify-2d503.firebasestorage.app",
  messagingSenderId: "707488772865",
  appId: "1:707488772865:web:e74279462217f1ffada100",
  measurementId: "G-4VXWYF9B02",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
