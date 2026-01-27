// web/src/services/firebaseConfig.js

// REPLACED WITH LOCAL STORAGE MOCKS
import { db as mockDb } from './mockFirebase';
import { auth as mockAuth } from './mockAuth';

console.log("⚠️ APP IS RUNNING IN OFFLINE / MOCK MODE ⚠️");

export const app = { name: '[DEFAULT] MockApp' };
export const auth = mockAuth;
export const db = mockDb;
export const storage = { type: 'mock-storage' };
export const analytics = { logEvent: () => { } }; // Dummy analytics
