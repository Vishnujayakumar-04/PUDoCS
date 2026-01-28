import { db } from './firebaseConfig';
import { collection, query, getDocs, setDoc, doc, Timestamp, where } from 'firebase/firestore';
import { offlineStorage } from './offlineStorage';

/**
 * Sync Engine (L2 Cloud Sync)
 * Handles Push (Local -> Cloud) and Pull (Cloud -> Local).
 */
export const syncEngine = {

    /**
     * Pushes pending local changes to Firestore.
     */
    pushChanges: async (uid, collectionName) => {
        try {
            const pendingItems = offlineStorage.getPendingSync(uid, collectionName);
            if (pendingItems.length === 0) return 0;

            console.log(`[Sync] Pushing ${pendingItems.length} items for ${collectionName}...`);

            let successCount = 0;
            for (const item of pendingItems) {
                try {
                    // Remove internal fields before sending to Firestore
                    const { _synced, _lastUpdated, id, ...dataToUpload } = item;

                    // Add timestamp
                    dataToUpload.updatedAt = Timestamp.now();

                    const docRef = doc(db, collectionName, id);
                    await setDoc(docRef, dataToUpload, { merge: true });

                    // Mark local as synced
                    offlineStorage.markSynced(uid, collectionName, id);
                    successCount++;
                } catch (err) {
                    console.error(`[Sync] Failed to push item ${item.id}:`, err);
                }
            }
            return successCount;
        } catch (error) {
            console.error(`[Sync] Push Error (${collectionName}):`, error);
            return 0;
        }
    },

    /**
     * Pulls latest changes from Firestore and updates Local Storage.
     * Currently fetches ALL. Optimized version would use 'updatedAt' cursor.
     */
    pullChanges: async (uid, collectionName, constraints = []) => {
        try {
            console.log(`[Sync] Pulling ${collectionName}...`);
            const q = query(collection(db, collectionName), ...constraints);
            const snapshot = await getDocs(q);

            let pullCount = 0;
            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                // Filter: For security, some collections might need client-side filtering 
                // if checks weren't sufficient, but Firestore Rules should handle it.
                // However, we must ensure we don't overwrite pending local changes unless server is newer?
                // Rule: Server Wins for simplicity in this implementation.

                offlineStorage.save(uid, collectionName, docSnap.id, data, true);
                pullCount++;
            });
            console.log(`[Sync] Pulled ${pullCount} items for ${collectionName}.`);
            return pullCount;
        } catch (error) {
            console.error(`[Sync] Pull Error (${collectionName}):`, error);
            return 0;
        }
    },

    /**
     * Run Full Sync for a User (Push & Pull)
     */
    runFullSync: async (uid, collectionsToSync = []) => {
        const results = { pushed: 0, pulled: 0 };
        for (const col of collectionsToSync) {
            results.pushed += await syncEngine.pushChanges(uid, col);
            results.pulled += await syncEngine.pullChanges(uid, col);
        }
        return results;
    }
};
