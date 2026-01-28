import { db } from './firebaseConfig';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import * as Network from 'expo-network';
import { offlineStorage } from './offlineStorage';

export const syncEngine = {
    isOnline: async () => {
        try {
            const state = await Network.getNetworkStateAsync();
            return state.isConnected && state.isInternetReachable;
        } catch (e) {
            return false;
        }
    },

    runFullSync: async (uid, role) => {
        const online = await syncEngine.isOnline();
        if (!online) {
            console.log('📴 [Sync] Offline. Skipping sync.');
            return;
        }

        console.log('🔄 [Sync] Starting Push Sync...');

        try {
            // 1. Process Write Queue (Pending Syncs)
            // We check common collections. A improved design would track "dirty" collections.
            // For now, we check 'attendance' and 'complaints' etc.
            const collectionsToCheck = ['attendance', 'students', 'complaints'];

            for (const col of collectionsToCheck) {
                const pending = await offlineStorage.getPendingSync(uid, col);
                if (pending.length > 0) {
                    console.log(`[Sync] Pushing ${pending.length} items for ${col}...`);
                    const batch = writeBatch(db);
                    let batchCount = 0;

                    for (const item of pending) {
                        // We need to strip local-only fields if any, or just push everything.
                        // Firestore doc ref
                        const docId = item.id;
                        const docRef = doc(db, col, docId);

                        // Create data copy without internal keys if logic requires, 
                        // but standard approach is:
                        const { _synced, _lastUpdated, ...dataToSave } = item;

                        batch.set(docRef, dataToSave, { merge: true });
                        batchCount++;
                    }

                    if (batchCount > 0) {
                        await batch.commit();
                        console.log(`✅ [Sync] Batch committed for ${col}.`);

                        // Mark as synced locally
                        for (const item of pending) {
                            await offlineStorage.markSynced(uid, col, item.id);
                        }
                    }
                }
            }
            console.log('🚀 [Sync] Push Sync Complete.');

        } catch (error) {
            console.error('❌ [Sync] Error during sync:', error);
        }
    }
};
