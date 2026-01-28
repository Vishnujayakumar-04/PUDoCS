import AsyncStorage from '@react-native-async-storage/async-storage';

const getStorageKey = (uid, collection) => `pudocs_${uid}_${collection}`;

export const offlineStorage = {
    save: async (uid, collection, docId, data, synced = false) => {
        try {
            const key = getStorageKey(uid, collection);
            const existingRaw = await AsyncStorage.getItem(key);
            const store = existingRaw ? JSON.parse(existingRaw) : {};

            store[docId] = {
                id: docId,
                ...data,
                _synced: synced,
                _lastUpdated: Date.now()
            };

            await AsyncStorage.setItem(key, JSON.stringify(store));
            return store[docId];
        } catch (error) {
            console.error('[MobileStorage] Save Failed:', error);
            return null;
        }
    },

    get: async (uid, collection, docId) => {
        try {
            const key = getStorageKey(uid, collection);
            const existingRaw = await AsyncStorage.getItem(key);
            if (!existingRaw) return null;
            const store = JSON.parse(existingRaw);
            return store[docId] || null;
        } catch (error) {
            console.error('[MobileStorage] Get Failed:', error);
            return null;
        }
    },

    getAll: async (uid, collection) => {
        try {
            const key = getStorageKey(uid, collection);
            const existingRaw = await AsyncStorage.getItem(key);
            if (!existingRaw) return [];
            const store = JSON.parse(existingRaw);
            return Object.values(store);
        } catch (error) {
            console.error('[MobileStorage] GetAll Failed:', error);
            return [];
        }
    },

    markSynced: async (uid, collection, docId) => {
        try {
            const key = getStorageKey(uid, collection);
            const existingRaw = await AsyncStorage.getItem(key);
            if (!existingRaw) return;
            const store = JSON.parse(existingRaw);

            if (store[docId]) {
                store[docId]._synced = true;
                store[docId]._lastUpdated = Date.now();
                await AsyncStorage.setItem(key, JSON.stringify(store));
            }
        } catch (error) {
            console.error('[MobileStorage] MarkSynced Failed:', error);
        }
    },

    getPendingSync: async (uid, collection) => {
        try {
            const key = getStorageKey(uid, collection);
            const existingRaw = await AsyncStorage.getItem(key);
            if (!existingRaw) return [];
            const store = JSON.parse(existingRaw);
            return Object.values(store).filter(item => item._synced === false);
        } catch (error) { return []; }
    }
};
