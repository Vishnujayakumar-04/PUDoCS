/**
 * Script to post Alumni Meet notice with image
 * Run this script to post the notice to Firestore
 * 
 * Usage: node scripts/postAlumniMeetNotice.js
 */

import { db, storage } from '../services/firebaseConfig.js';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';

const postAlumniMeetNotice = async () => {
    try {
        console.log('📢 Posting Alumni Meet Notice...');

        // Load the image asset
        const imageAsset = Asset.fromModule(require('../assets/Notice/Alumini meet.jpeg'));
        await imageAsset.downloadAsync();
        
        const imageUri = imageAsset.localUri || imageAsset.uri;
        console.log('📷 Image loaded:', imageUri);

        // Upload image to Firebase Storage
        const response = await fetch(imageUri);
        const blob = await response.blob();
        
        const imageName = `alumni_meet_${Date.now()}.jpeg`;
        const storageRef = ref(storage, `notices/${imageName}`);
        
        console.log('⬆️ Uploading image to Firebase Storage...');
        await uploadBytes(storageRef, blob);
        const imageUrl = await getDownloadURL(storageRef);
        console.log('✅ Image uploaded:', imageUrl);

        // Create notice data
        const noticeData = {
            title: 'Alumni Meet',
            content: 'Join us for the Alumni Meet! We are excited to reconnect with our alumni and celebrate our shared journey.',
            category: 'Event',
            priority: 'High',
            imageUrl: imageUrl,
            targetAudience: {
                course: '', // Empty = all courses
                program: '', // Empty = all programs
                year: '', // Empty = all years
            },
            createdAt: new Date().toISOString(),
            isApproved: true,
            postedBy: 'Office',
            isPriority: true
        };

        // Post notice to Firestore
        console.log('📝 Posting notice to Firestore...');
        const docRef = await addDoc(collection(db, "notices"), noticeData);
        console.log('✅ Notice posted successfully!');
        console.log('📄 Notice ID:', docRef.id);
        console.log('📋 Notice Data:', noticeData);

        return { id: docRef.id, ...noticeData };
    } catch (error) {
        console.error('❌ Error posting notice:', error);
        throw error;
    }
};

// Run the script
if (require.main === module) {
    postAlumniMeetNotice()
        .then(() => {
            console.log('🎉 Alumni Meet notice posted successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Failed to post notice:', error);
            process.exit(1);
        });
}

export default postAlumniMeetNotice;

