import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
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

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);
