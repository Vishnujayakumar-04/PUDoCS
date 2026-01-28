/**
 * Offline Storage Adapter (L1 Cache)
 * Uses LocalStorage to persist data for offline access.
 * Scoped by User UID to prevent data leaks.
 */

const getStorageKey = (uid, collection) => `pudocs_${uid}_${collection}`;

export const offlineStorage = {
    /**
     * Save a document to local storage.
     * @param {string} uid - User ID
     * @param {string} collection - Collection Name (e.g., 'students')
     * @param {string} docId - Document ID
     * @param {object} data - The data object
     * @param {boolean} synced - Whether it is already synced with Cloud
     */
    save: (uid, collection, docId, data, synced = false) => {
        try {
            const key = getStorageKey(uid, collection);
            const existingRaw = localStorage.getItem(key);
            const store = existingRaw ? JSON.parse(existingRaw) : {};

            store[docId] = {
                id: docId,
                ...data,
                _synced: synced,
                _lastUpdated: Date.now()
            };

            localStorage.setItem(key, JSON.stringify(store));
            return store[docId];
        } catch (error) {
            console.error(`[OfflineStorage] Save Failed:`, error);
            return null;
        }
    },

    /**
     * Get a single document.
     */
    get: (uid, collection, docId) => {
        try {
            const key = getStorageKey(uid, collection);
            const existingRaw = localStorage.getItem(key);
            if (!existingRaw) return null;

            const store = JSON.parse(existingRaw);
            return store[docId] || null;
        } catch (error) {
            return null;
        }
    },

    /**
     * Get all documents in a collection as an array.
     */
    getAll: (uid, collection) => {
        try {
            const key = getStorageKey(uid, collection);
            const existingRaw = localStorage.getItem(key);
            if (!existingRaw) return [];

            const store = JSON.parse(existingRaw);
            return Object.values(store);
        } catch (error) {
            return [];
        }
    },

    /**
     * Mark a document as synced.
     */
    markSynced: (uid, collection, docId) => {
        try {
            const key = getStorageKey(uid, collection);
            const existingRaw = localStorage.getItem(key);
            if (!existingRaw) return;

            const store = JSON.parse(existingRaw);
            if (store[docId]) {
                store[docId]._synced = true;
                localStorage.setItem(key, JSON.stringify(store));
            }
        } catch (error) {
            console.error(`[OfflineStorage] MarkSynced Failed:`, error);
        }
    },

    /**
     * Get all pending sync items (synced: false) for a collection.
     */
    getPendingSync: (uid, collection) => {
        try {
            const allItems = offlineStorage.getAll(uid, collection);
            return allItems.filter(item => item._synced === false);
        } catch (error) {
            return [];
        }
    },

    /**
     * Clear specific collection for user (e.g. on logout clean up if desired, though we usually keep for offline)
     */
    clear: (uid, collection) => {
        localStorage.removeItem(getStorageKey(uid, collection));
    }
};
