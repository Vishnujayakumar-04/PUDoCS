import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCaT7tbMpPhWLW6GZPsweUAtFBk9sWF_UU",
    authDomain: "pudocs-depofcs.firebaseapp.com",
    projectId: "pudocs-depofcs",
    storageBucket: "pudocs-depofcs.firebasestorage.app",
    messagingSenderId: "41744174106",
    appId: "1:41744174106:web:418f3d3239a07a925615a3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
