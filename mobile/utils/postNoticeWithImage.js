/**
 * Utility function to post a notice with an image
 * Can be used from the Office Dashboard or Office Notices screen
 */

import { db, storage } from '../services/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, uploadString, getDownloadURL, StringFormat } from 'firebase/storage';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert } from 'react-native';

/**
 * Posts a notice with an image attachment
 * @param {Object} noticeData - Notice data object
 * @param {string} noticeData.title - Notice title
 * @param {string} noticeData.content - Notice content
 * @param {string} noticeData.category - Notice category (Administrative, Academic, Exam, Event)
 * @param {string} noticeData.priority - Priority level (Urgent, High, Medium, Low)
 * @param {Object} noticeData.targetAudience - Target audience (optional)
 * @param {string} imagePath - Local path to image (e.g., require('../assets/Notice/image.jpeg'))
 * @returns {Promise<Object>} Posted notice with ID
 */
export const postNoticeWithImage = async (noticeData, imagePath) => {
    try {
        let imageUrl = null;

        // Upload image if provided
        if (imagePath) {
            console.log('📷 Starting image upload...');
            
            // Handle both require() paths and local file paths
            let imageUri;
            try {
                if (typeof imagePath === 'string' && (imagePath.startsWith('file://') || imagePath.startsWith('http'))) {
                    // Direct file path or URL
                    imageUri = imagePath;
                } else {
                    // Asset module (require())
                    console.log('📦 Loading asset module...');
                    const imageAsset = Asset.fromModule(imagePath);
                    await imageAsset.downloadAsync();
                    imageUri = imageAsset.localUri || imageAsset.uri;
                    console.log('✅ Asset loaded:', imageUri);
                }
            } catch (assetError) {
                console.error('❌ Error loading asset:', assetError);
                throw new Error(`Failed to load image asset: ${assetError.message}`);
            }

            console.log('📁 Image URI:', imageUri);

            // Verify file exists (with error handling for legacy API)
            let fileInfo;
            try {
                fileInfo = await FileSystem.getInfoAsync(imageUri);
            } catch (infoError) {
                console.warn('⚠️ Could not get file info, attempting to read anyway:', infoError.message);
                fileInfo = { exists: true };
            }
            
            if (!fileInfo.exists) {
                throw new Error(`Image file not found at: ${imageUri}`);
            }

            console.log('📁 File info:', fileInfo);

            // Read file as base64 using FileSystem (React Native compatible)
            let base64;
            try {
                base64 = await FileSystem.readAsStringAsync(imageUri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
            } catch (readError) {
                console.error('❌ Error reading image as base64:', readError);
                throw new Error(`Failed to read image file: ${readError.message}`);
            }

            const imageName = `notice_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
            const storagePath = `notices/${imageName}`;
            const storageRef = ref(storage, storagePath);
            
            console.log('⬆️ Uploading to Firebase Storage...');
            console.log('📊 Base64 length:', base64.length, 'characters');
            console.log('📂 Storage path:', storagePath);
            
            try {
                // Use uploadString with base64 format (more reliable in React Native)
                console.log('📤 Calling uploadString with BASE64...');
                await uploadString(storageRef, base64, StringFormat.BASE64);
                console.log('✅ Upload successful, getting download URL...');
                imageUrl = await getDownloadURL(storageRef);
                console.log('✅ Image uploaded successfully:', imageUrl);
            } catch (uploadError) {
                console.error('❌ Firebase Storage upload error:', uploadError);
                console.error('Error code:', uploadError.code);
                console.error('Error message:', uploadError.message);
                console.error('Error server response:', uploadError.serverResponse);
                if (uploadError.customData) {
                    console.error('Error custom data:', uploadError.customData);
                }
                
                // If it's a storage rules issue, provide helpful message
                if (uploadError.code === 'storage/unauthorized' || uploadError.code === 'storage/unknown') {
                    const errorMessage = 'Firebase Storage upload failed. This is likely a security rules issue.\n\n' +
                        'Please update your Firebase Storage rules to allow writes to the "notices" folder.\n\n' +
                        'Go to: Firebase Console > Storage > Rules\n\n' +
                        'Add this rule:\n' +
                        'match /notices/{allPaths=**} {\n' +
                        '  allow write: if request.auth != null;\n' +
                        '  allow read: if request.auth != null;\n' +
                        '}';
                    throw new Error(errorMessage);
                }
                
                // For other errors, throw with details
                throw new Error(`Firebase Storage upload failed: ${uploadError.message || uploadError.code || 'Unknown error'}`);
            }
        }

        // Create notice document
        const noticePayload = {
            ...noticeData,
            imageUrl: imageUrl,
            createdAt: new Date().toISOString(),
            isApproved: true, // Office notices are auto-approved
            postedBy: 'Office',
            isPriority: noticeData.priority === 'Urgent' || noticeData.priority === 'High'
        };

        // Post to Firestore
        const docRef = await addDoc(collection(db, "notices"), noticePayload);
        console.log('✅ Notice posted with ID:', docRef.id);

        return { id: docRef.id, ...noticePayload };
    } catch (error) {
        console.error('❌ Error posting notice with image:', error);
        throw error;
    }
};

/**
 * Quick function to post Alumni Meet 2026 notice
 * Posts to both notices and events collections
 */
export const postAlumniMeetNotice = async () => {
    const alumniMeetContent = `PUDoCS Footprints – Alumni Association invites all alumni and current students for Alumni Meet 2026. Join us to reconnect, share memories, and celebrate the journey of Computer Science at Pondicherry University.

📅 Date: January 26, 2026
⏰ Time: 10:00 AM
📍 Venue: Cultural – Cum – Convention Centre, Pondicherry University

Register now and be part of the reunion!`;

    const noticeData = {
        title: 'Alumni Meet 2026',
        content: alumniMeetContent,
        category: 'Event',
        priority: 'High',
        targetAudience: {
            course: '', // Empty = all courses (broadcast to all)
            program: '', // Empty = all programs
            year: '', // Empty = all years
        },
        // Event-specific fields
        eventDate: '2026-01-26',
        eventTime: '10:00 AM',
        venue: 'Cultural – Cum – Convention Centre, Pondicherry University',
        registrationLink: 'https://forms.gle/Rro7DNsh8VD9Zziz9',
        contact: '+91 9346101109',
        theme: 'Retracing where it all began',
        organizedBy: 'Department of Computer Science, Pondicherry University',
        association: 'PUDoCS Footprints – Alumni Association',
        links: ['https://forms.gle/Rro7DNsh8VD9Zziz9'], // Registration link
    };

    // Post as notice
    const noticeResult = await postNoticeWithImage(
        noticeData,
        require('../assets/Notice/Alumini meet.jpeg')
    );

    // Also post to events collection
    try {
        const eventPayload = {
            name: 'Alumni Meet 2026',
            description: alumniMeetContent,
            date: '2026-01-26',
            time: '10:00 AM',
            venue: 'Cultural – Cum – Convention Centre, Pondicherry University',
            location: 'Cultural – Cum – Convention Centre, Pondicherry University',
            registrationLink: 'https://forms.gle/Rro7DNsh8VD9Zziz9',
            contact: '+91 9346101109',
            theme: 'Retracing where it all began',
            organizedBy: 'Department of Computer Science, Pondicherry University',
            association: 'PUDoCS Footprints – Alumni Association',
            imageUrl: noticeResult.imageUrl || noticeResult.imageUrls?.[0] || null,
            images: noticeResult.imageUrls || (noticeResult.imageUrl ? [noticeResult.imageUrl] : []),
            createdAt: new Date().toISOString(),
            type: 'event',
            category: 'Alumni Interaction',
            visibleTo: ['students', 'staff', 'office'],
        };

        const eventRef = await addDoc(collection(db, "events"), eventPayload);
        console.log('✅ Event posted with ID:', eventRef.id);
    } catch (eventError) {
        console.error('⚠️ Error posting to events collection (notice still posted):', eventError);
        // Don't fail if events posting fails
    }

    return noticeResult;
};

/**
 * Posts a notice with multiple images and PDFs
 * @param {Object} noticeData - Notice data object
 * @param {Array<string>} imageUris - Array of image file URIs (from document picker)
 * @param {Array<string>} pdfUris - Array of PDF file URIs (from document picker)
 * @returns {Promise<Object>} Posted notice with ID
 */
export const postNoticeWithMultipleFiles = async (noticeData, imageUris = [], pdfUris = []) => {
    try {
        const imageUrls = [];
        const pdfUrls = [];

        // Upload images
        if (imageUris && imageUris.length > 0) {
            console.log(`📷 Starting upload of ${imageUris.length} image(s)...`);
            for (let i = 0; i < imageUris.length; i++) {
                try {
                    const imageUri = imageUris[i];
                    
                    // Try to get file info (with error handling for deprecation)
                    let fileInfo;
                    try {
                        fileInfo = await FileSystem.getInfoAsync(imageUri);
                    } catch (infoError) {
                        console.warn(`⚠️ Could not get file info for image ${i + 1}, attempting to read anyway:`, infoError.message);
                        // Continue without file info check
                        fileInfo = { exists: true };
                    }
                    
                    if (!fileInfo.exists) {
                        console.warn(`⚠️ Image file not found: ${imageUri}`);
                        continue;
                    }

                    // Read file as base64
                    let base64;
                    try {
                        base64 = await FileSystem.readAsStringAsync(imageUri, {
                            encoding: FileSystem.EncodingType.Base64,
                        });
                    } catch (readError) {
                        console.error(`❌ Error reading image ${i + 1} as base64:`, readError);
                        throw new Error(`Failed to read image file: ${readError.message}`);
                    }

                    const imageName = `notice_image_${Date.now()}_${i}_${Math.random().toString(36).substring(7)}.jpg`;
                    const storagePath = `notices/images/${imageName}`;
                    const storageRef = ref(storage, storagePath);

                    await uploadString(storageRef, base64, StringFormat.BASE64);
                    const downloadUrl = await getDownloadURL(storageRef);
                    imageUrls.push(downloadUrl);
                    console.log(`✅ Image ${i + 1}/${imageUris.length} uploaded: ${downloadUrl}`);
                } catch (error) {
                    console.error(`❌ Error uploading image ${i + 1}:`, error);
                    // Continue with other images even if one fails
                }
            }
        }

        // Upload PDFs
        if (pdfUris && pdfUris.length > 0) {
            console.log(`📄 Starting upload of ${pdfUris.length} PDF(s)...`);
            for (let i = 0; i < pdfUris.length; i++) {
                try {
                    const pdfUri = pdfUris[i];
                    
                    // Try to get file info (with error handling for deprecation)
                    let fileInfo;
                    try {
                        fileInfo = await FileSystem.getInfoAsync(pdfUri);
                    } catch (infoError) {
                        console.warn(`⚠️ Could not get file info for PDF ${i + 1}, attempting to read anyway:`, infoError.message);
                        // Continue without file info check
                        fileInfo = { exists: true, name: `document_${i + 1}.pdf` };
                    }
                    
                    if (!fileInfo.exists) {
                        console.warn(`⚠️ PDF file not found: ${pdfUri}`);
                        continue;
                    }

                    // Read PDF as base64
                    let base64;
                    try {
                        base64 = await FileSystem.readAsStringAsync(pdfUri, {
                            encoding: FileSystem.EncodingType.Base64,
                        });
                    } catch (readError) {
                        console.error(`❌ Error reading PDF ${i + 1} as base64:`, readError);
                        throw new Error(`Failed to read PDF file: ${readError.message}`);
                    }

                    const pdfName = `notice_pdf_${Date.now()}_${i}_${Math.random().toString(36).substring(7)}.pdf`;
                    const storagePath = `notices/pdfs/${pdfName}`;
                    const storageRef = ref(storage, storagePath);

                    await uploadString(storageRef, base64, StringFormat.BASE64);
                    const downloadUrl = await getDownloadURL(storageRef);
                    pdfUrls.push({
                        name: fileInfo.name || pdfName,
                        url: downloadUrl
                    });
                    console.log(`✅ PDF ${i + 1}/${pdfUris.length} uploaded: ${downloadUrl}`);
                } catch (error) {
                    console.error(`❌ Error uploading PDF ${i + 1}:`, error);
                    // Continue with other PDFs even if one fails
                }
            }
        }

        // Create notice document
        const noticePayload = {
            ...noticeData,
            imageUrls: imageUrls.length > 0 ? imageUrls : null,
            pdfUrls: pdfUrls.length > 0 ? pdfUrls : null,
            // Keep backward compatibility with single imageUrl
            imageUrl: imageUrls.length > 0 ? imageUrls[0] : null,
            createdAt: new Date().toISOString(),
            isApproved: true,
            postedBy: 'Office',
            isPriority: noticeData.priority === 'Urgent' || noticeData.priority === 'High'
        };

        // Post to Firestore
        const docRef = await addDoc(collection(db, "notices"), noticePayload);
        console.log('✅ Notice posted with ID:', docRef.id);

        // Send notifications to all roles (store notification in Firestore)
        try {
            await addDoc(collection(db, "notifications"), {
                noticeId: docRef.id,
                title: noticeData.title,
                message: noticeData.content.substring(0, 100) + (noticeData.content.length > 100 ? '...' : ''),
                category: noticeData.category,
                priority: noticeData.priority,
                targetRoles: ['Student', 'Staff', 'Office'], // Broadcast to all roles
                createdAt: new Date().toISOString(),
                readBy: [],
                isRead: false
            });
            console.log('✅ Notification sent to all roles');
        } catch (notifError) {
            console.error('⚠️ Error sending notification (notice still posted):', notifError);
            // Don't fail the notice posting if notification fails
        }

        return { id: docRef.id, ...noticePayload };
    } catch (error) {
        console.error('❌ Error posting notice with files:', error);
        throw error;
    }
};

/**
 * Quick function to post Internal Hackathon notice
 * @param {string|null} imagePath - Optional image path (e.g., require('../assets/Notice/1.jpeg'))
 *                                   If null, notice will be posted without image
 */
export const postHackathonNotice = async (imagePath = null) => {
    const hackathonContent = `**INTERNAL HACKATHON**
Department of Computer Science, Pondicherry University
In association with Footprints Alumni Association (DoCS)

**📅 Important Dates:**
• Registration Last Date: December 30, 2025
• Hackathon Date: January 22, 2026
• Winners Announcement: January 26, 2026 (Alumni Meet Day)

**🎯 Themes:**
1. #Sustainable Reduced Inequality
2. #Sustainable Healthcare and Well Being
3. #Sustainable Quality Education

**📋 Guidelines:**
• Team Size: 3 members (including 1 Team Leader)
• Maximum 1 idea solution per team
• Top shortlisted team from each theme will get the prize
• Presentation and Demo required on Hackathon day
• Use only open source software

**🏆 Awards:**
Winners from each theme will be awarded during the Alumni Meet on January 26, 2026.

**📍 Venues:**
• Hackathon: Department of Computer Science, PU
• Winners Announcement: CCC Centre, Puducherry

**📝 Registration:**
Register now: https://forms.gle/4MW56y81W8w9ZQCr7

**Note:** This Internal Hackathon is exclusively for Computer Science Students of Pondicherry University. Students from other departments/affiliated colleges or other institutions are not allowed to participate.`;

    return await postNoticeWithImage(
        {
            title: 'Internal Hackathon - Registration Open',
            content: hackathonContent,
            category: 'Event',
            priority: 'High',
            targetAudience: {
                course: '', // Empty = all courses (broadcast to all)
                program: '', // Empty = all programs
                year: '', // Empty = all years
            }
        },
        imagePath // Can be null if no image, or require('../assets/Notice/Hackathon.jpeg')
    );
};

