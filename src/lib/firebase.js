// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBWaS4VR5sFqX9Fw9hXUw2VC0xdmkZa5cY",
  authDomain: "chatbot-creator-85990.firebaseapp.com",
  projectId: "chatbot-creator-85990",
  storageBucket: "chatbot-creator-85990.appspot.com",
  messagingSenderId: "637577650344",
  appId: "1:637577650344:web:39d78e4c80a5d8dafaa29d",
  measurementId: "G-3Z8HFBC75N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);