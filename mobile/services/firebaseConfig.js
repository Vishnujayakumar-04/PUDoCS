import { initializeApp } from "firebase/app";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Replace with your actual Firebase config values
const firebaseConfig = {
    apiKey: "AIzaSyCaT7tbMpPhWLW6GZPsweUAtFBk9sWF_UU",
    authDomain: "pudocs-depofcs.firebaseapp.com",
    projectId: "pudocs-depofcs",
    storageBucket: "pudocs-depofcs.firebasestorage.app",
    messagingSenderId: "41744174106",
    appId: "1:41744174106:web:418f3d3239a07a925615a3"
};

const app = initializeApp(firebaseConfig);

// Initialize auth with error handling to prevent crashes
let auth;
try {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
} catch (error) {
    // If auth is already initialized, get the existing instance
    if (error.code === 'auth/already-initialized') {
        auth = getAuth(app);
    } else {
        console.error('Firebase Auth initialization error:', error);
        throw error;
    }
}

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);
