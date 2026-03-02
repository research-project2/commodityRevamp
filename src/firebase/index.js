// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDc171V5qKLGiI5sgO_MhZh-XXDPZ_EWhI",
  authDomain: "commodityrevamp.firebaseapp.com",
  projectId: "commodityrevamp",
  storageBucket: "commodityrevamp.firebasestorage.app",
  messagingSenderId: "439876762502",
  appId: "1:439876762502:web:750065e700eae9d2798a07"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

console.log('Firebase initialized successfully');

export { auth, database, storage, app };