import { storage } from './firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Gallery Service (Local First)
 * Handles gallery image uploads and retrieval
 */

const STORAGE_KEY = 'gallery_albums';

export const galleryService = {
    /**
     * Get all gallery albums
     */
    getAlbums: async () => {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
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
            const albums = await galleryService.getAlbums();
            return albums.find(a => a.id === albumId) || null;
        } catch (error) {
            console.error('Error getting gallery album:', error);
            return null;
        }
    },

    /**
     * Create a new gallery album
     */
    createAlbum: async (albumData, imagePaths, postedBy) => {
        try {
            const uploadedImages = [];

            // Process images (Just keep local URIs for local-first approach)
            // If cloud sync is needed, we would upload to Firebase Storage here
            for (let i = 0; i < imagePaths.length; i++) {
                const imagePath = imagePaths[i];
                let imageUri = imagePath;

                if (typeof imagePath === 'object' && imagePath.uri) {
                    imageUri = imagePath.uri;
                }

                // For now, we save local URIs. 
                // Note: Local URIs might not persist well if cache is cleared or on other devices.
                uploadedImages.push({
                    url: imageUri,
                    name: `local_image_${i}.jpg`,
                    order: i,
                });
            }

            const newAlbum = {
                id: Date.now().toString(),
                title: albumData.title,
                description: albumData.description,
                images: uploadedImages,
                postedBy,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            // Save to Local Storage
            const albums = await galleryService.getAlbums();
            albums.unshift(newAlbum);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(albums));

            return newAlbum;
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
            const albums = await galleryService.getAlbums();
            const index = albums.findIndex(a => a.id === albumId);

            if (index === -1) {
                throw new Error('Album not found');
            }

            const existingAlbum = albums[index];
            let images = existingAlbum.images || [];

            // Process new images
            if (newImagePaths.length > 0) {
                const newImages = newImagePaths.map((path, i) => {
                    let uri = path;
                    if (typeof path === 'object' && path.uri) uri = path.uri;
                    return {
                        url: uri,
                        name: `local_image_new_${i}.jpg`,
                        order: images.length + i
                    };
                });
                images = [...images, ...newImages];
            }

            const updatedAlbum = {
                ...existingAlbum,
                title: albumData.title,
                description: albumData.description,
                images,
                updatedAt: new Date().toISOString(),
                updatedBy: postedBy,
            };

            albums[index] = updatedAlbum;
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(albums));

            return updatedAlbum;
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
            const albums = await galleryService.getAlbums();
            const filtered = albums.filter(a => a.id !== albumId);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
            return true;
        } catch (error) {
            console.error('Error deleting gallery album:', error);
            throw error;
        }
    },
};


