import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBfnFnqLwLxPYDTpAaUQxI0vBaeHFM9uzA',
  authDomain: 'bbtimer.firebaseapp.com',
  projectId: 'bbtimer',
  storageBucket: 'bbtimer.firebasestorage.app',
  messagingSenderId: '1016421887345',
  appId: '1:1016421887345:web:8d407726c73b6df475dad0',
  measurementId: 'G-BJNVP39707',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Firestore collections
export const CUSTOMERS_COLLECTION = 'customers';
export const CHECK_INS_COLLECTION = 'checkIns';
export const SETTINGS_COLLECTION = 'settings';
