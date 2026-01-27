// web/src/services/mockStorage.js

export const storage = { type: 'mock-storage' };

export const ref = (storage, path) => ({ type: 'ref', path });

export const uploadBytes = async (ref, file) => {
    console.log(`[MockStorage] Uploaded ${file.name} to ${ref.path}`);
    return {
        ref: ref,
        metadata: { fullPath: ref.path }
    };
};

export const getDownloadURL = async (ref) => {
    return `https://via.placeholder.com/150?text=Mock+Image+${ref.path.split('/').pop()}`;
};
