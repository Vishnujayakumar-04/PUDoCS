import { db, storage } from './firebaseConfig';
import { collection, doc, getDoc, setDoc, addDoc, getDocs, query, orderBy, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Gallery Service
 * Handles gallery image uploads and retrieval
 */

export const galleryService = {
    /**
     * Get all gallery albums
     */
    getAlbums: async () => {
        try {
            const albumsQuery = query(
                collection(db, 'gallery'),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(albumsQuery);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting gallery albums:', error);
            return [];
        }
    },

    /**
     * Get a specific gallery album by ID
     */
    getAlbum: async (albumId) => {
        try {
            const albumRef = doc(db, 'gallery', albumId);
            const albumDoc = await getDoc(albumRef);
            if (albumDoc.exists()) {
                return { id: albumDoc.id, ...albumDoc.data() };
            }
            return null;
        } catch (error) {
            console.error('Error getting gallery album:', error);
            return null;
        }
    },

    /**
     * Create a new gallery album
     * @param {Object} albumData - Album data with title, description, images array
     * @param {Array} imagePaths - Array of local image paths
     * @param {string} postedBy - User email or ID who posted
     */
    createAlbum: async (albumData, imagePaths, postedBy) => {
        try {
            const uploadedImages = [];
            
            // Upload each image to Firebase Storage
            for (let i = 0; i < imagePaths.length; i++) {
                const imagePath = imagePaths[i];
                try {
                    // Handle different image path formats
                    let imageUri = imagePath;
                    
                    // If it's an object with uri property (from document picker)
                    if (typeof imagePath === 'object' && imagePath.uri) {
                        imageUri = imagePath.uri;
                    } else if (typeof imagePath === 'string') {
                        // If it's already a URI (file:// or http://), use it directly
                        if (imagePath.startsWith('file://') || imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
                            imageUri = imagePath;
                        } else {
                            // Try to convert Windows path to file:// URI
                            if (imagePath.includes('\\') || imagePath.includes('/')) {
                                if (!imagePath.startsWith('file://')) {
                                    imageUri = imagePath.startsWith('/') ? `file://${imagePath}` : `file:///${imagePath.replace(/\\/g, '/')}`;
                                }
                            }
                        }
                    }
                    
                    // Get file info
                    const fileInfo = await FileSystem.getInfoAsync(imageUri);
                    if (!fileInfo.exists) {
                        console.warn(`Image not found: ${imageUri}`);
                        continue;
                    }
                    
                    // Read file as base64
                    const base64 = await FileSystem.readAsStringAsync(imageUri, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    
                    // Convert base64 to Uint8Array
                    const byteCharacters = atob(base64);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let j = 0; j < byteCharacters.length; j++) {
                        byteNumbers[j] = byteCharacters.charCodeAt(j);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    
                    // Upload to Firebase Storage
                    const imageName = `gallery_${Date.now()}_${i}.jpg`;
                    const storageRef = ref(storage, `gallery/${imageName}`);
                    await uploadBytes(storageRef, byteArray);
                    const downloadURL = await getDownloadURL(storageRef);
                    
                    uploadedImages.push({
                        url: downloadURL,
                        name: imageName,
                        order: i,
                    });
                } catch (error) {
                    console.error(`Error uploading image ${i}:`, error);
                    // Continue with other images
                }
            }
            
            // Create album document in Firestore
            const albumRef = await addDoc(collection(db, 'gallery'), {
                title: albumData.title,
                description: albumData.description,
                images: uploadedImages,
                postedBy,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            
            return { id: albumRef.id, ...albumData, images: uploadedImages };
        } catch (error) {
            console.error('Error creating gallery album:', error);
            throw error;
        }
    },

    /**
     * Update a gallery album
     */
    updateAlbum: async (albumId, albumData, newImagePaths = [], postedBy) => {
        try {
            const albumRef = doc(db, 'gallery', albumId);
            const albumDoc = await getDoc(albumRef);
            
            if (!albumDoc.exists()) {
                throw new Error('Album not found');
            }
            
            const existingAlbum = albumDoc.data();
            let images = existingAlbum.images || [];
            
            // Upload new images if provided
            if (newImagePaths.length > 0) {
                const uploadedImages = [];
                for (let i = 0; i < newImagePaths.length; i++) {
                    const imagePath = newImagePaths[i];
                    try {
                        // Handle different image path formats
                        let imageUri = imagePath;
                        
                        // If it's an object with uri property (from document picker)
                        if (typeof imagePath === 'object' && imagePath.uri) {
                            imageUri = imagePath.uri;
                        } else if (typeof imagePath === 'string') {
                            // If it's already a URI (file:// or http://), use it directly
                            if (imagePath.startsWith('file://') || imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
                                imageUri = imagePath;
                            } else {
                                // Try to convert Windows path to file:// URI
                                if (imagePath.includes('\\') || imagePath.includes('/')) {
                                    if (!imagePath.startsWith('file://')) {
                                        imageUri = imagePath.startsWith('/') ? `file://${imagePath}` : `file:///${imagePath.replace(/\\/g, '/')}`;
                                    }
                                }
                            }
                        }
                        
                        const fileInfo = await FileSystem.getInfoAsync(imageUri);
                        if (!fileInfo.exists) {
                            continue;
                        }
                        
                        const base64 = await FileSystem.readAsStringAsync(imageUri, {
                            encoding: FileSystem.EncodingType.Base64,
                        });
                        
                        const byteCharacters = atob(base64);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let j = 0; j < byteCharacters.length; j++) {
                            byteNumbers[j] = byteCharacters.charCodeAt(j);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        
                        const imageName = `gallery_${Date.now()}_${i}.jpg`;
                        const storageRef = ref(storage, `gallery/${imageName}`);
                        await uploadBytes(storageRef, byteArray);
                        const downloadURL = await getDownloadURL(storageRef);
                        
                        uploadedImages.push({
                            url: downloadURL,
                            name: imageName,
                            order: images.length + i,
                        });
                    } catch (error) {
                        console.error(`Error uploading new image ${i}:`, error);
                    }
                }
                images = [...images, ...uploadedImages];
            }
            
            // Update album document
            await setDoc(albumRef, {
                ...existingAlbum,
                title: albumData.title,
                description: albumData.description,
                images,
                updatedAt: new Date().toISOString(),
                updatedBy: postedBy,
            }, { merge: true });
            
            return { id: albumId, ...albumData, images };
        } catch (error) {
            console.error('Error updating gallery album:', error);
            throw error;
        }
    },

    /**
     * Delete a gallery album
     */
    deleteAlbum: async (albumId) => {
        try {
            const albumRef = doc(db, 'gallery', albumId);
            await deleteDoc(albumRef);
            return true;
        } catch (error) {
            console.error('Error deleting gallery album:', error);
            throw error;
        }
    },
};

