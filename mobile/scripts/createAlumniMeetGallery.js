/**
 * Script to create the Alumni Meet 2025 Gallery
 * Run this once to upload all images and create the gallery album
 */

import { galleryService } from '../services/galleryService';

const ALUMNI_MEET_GALLERY = {
    title: 'Alumni Meet 2025',
    description: `The Department of Computer Science, Pondicherry University organized Footprints Alumni Meet 2025 on 26th January 2025 at the Convention Cum Cultural Complex. The event brought together alumni, faculty members, and current students to reconnect, share experiences, and strengthen industry–academia relationships.

The program included University Anthem, Welcome Address, Special Address, Honouring of the Guests, Presidential Address, Student Achievement Awards, Alumni Experience Sharing, Cultural Performances, Games, Vote of Thanks, and concluded with National Anthem followed by Lunch & Networking.

This gallery features key moments from the event including stage sessions, guest interactions, felicitation, award distribution, cultural events, group photographs, and informal networking moments.`,
    images: [
        require('../assets/Gallery/IMG_9554.JPG'),
        require('../assets/Gallery/IMG_9555.JPG'),
        require('../assets/Gallery/IMG_9562.JPG'),
        require('../assets/Gallery/IMG_9569.JPG'),
        require('../assets/Gallery/IMG_9621.JPG'),
        require('../assets/Gallery/IMG_9655.JPG'),
        require('../assets/Gallery/IMG_9659.JPG'),
        require('../assets/Gallery/IMG_9663.JPG'),
        require('../assets/Gallery/IMG_9666.JPG'),
        require('../assets/Gallery/IMG_9675.JPG'),
        require('../assets/Gallery/IMG_9684.JPG'),
        require('../assets/Gallery/IMG_9686.JPG'),
        require('../assets/Gallery/IMG_9691.JPG'),
        require('../assets/Gallery/IMG_9694.JPG'),
        require('../assets/Gallery/IMG_9697.JPG'),
        require('../assets/Gallery/IMG_9699.JPG'),
        require('../assets/Gallery/IMG_9703.JPG'),
        require('../assets/Gallery/IMG_9704.JPG'),
        require('../assets/Gallery/IMG_9705.JPG'),
        require('../assets/Gallery/IMG_9706.JPG'),
        require('../assets/Gallery/IMG_9707.JPG'),
        require('../assets/Gallery/IMG_9708.JPG'),
        require('../assets/Gallery/IMG_9711.JPG'),
        require('../assets/Gallery/IMG_9717.JPG'),
        require('../assets/Gallery/IMG_9719.JPG'),
        require('../assets/Gallery/IMG_9721.JPG'),
        require('../assets/Gallery/IMG_9723.JPG'),
        require('../assets/Gallery/IMG_9726.JPG'),
        require('../assets/Gallery/IMG_9728.JPG'),
        require('../assets/Gallery/IMG_9730.JPG'),
        require('../assets/Gallery/Artboard 2.png'),
        require('../assets/Gallery/Invitation.png'),
        require('../assets/Gallery/4.JPG'),
        require('../assets/Gallery/5.JPG'),
        require('../assets/Gallery/6.JPG'),
        require('../assets/Gallery/IMG_0036.JPG'),
        require('../assets/Gallery/IMG_0038.JPG'),
        require('../assets/Gallery/IMG_0056.JPG'),
        require('../assets/Gallery/IMG_0066.JPG'),
        require('../assets/Gallery/IMG_9517.JPG'),
        require('../assets/Gallery/IMG_9546.JPG'),
    ],
};

const createAlumniMeetGallery = async () => {
    try {
        console.log('📸 Creating Alumni Meet 2025 Gallery...');
        console.log(`📷 Uploading ${ALUMNI_MEET_GALLERY.images.length} images...`);
        
        // Convert require() modules to paths that can be handled
        // Note: In a real scenario, you'd need to handle these differently
        // For now, we'll use a workaround by getting the asset URIs
        
        const imagePaths = [];
        for (const imageAsset of ALUMNI_MEET_GALLERY.images) {
            try {
                const { Asset } = require('expo-asset');
                const asset = Asset.fromModule(imageAsset);
                await asset.downloadAsync();
                imagePaths.push(asset.localUri || asset.uri);
            } catch (error) {
                console.error('Error loading asset:', error);
            }
        }
        
        const result = await galleryService.createAlbum(
            {
                title: ALUMNI_MEET_GALLERY.title,
                description: ALUMNI_MEET_GALLERY.description,
            },
            imagePaths,
            'Office'
        );
        
        console.log('✅ Gallery created successfully!');
        console.log('Gallery ID:', result.id);
        return result;
    } catch (error) {
        console.error('❌ Error creating gallery:', error);
        throw error;
    }
};

// Export for use in app or run directly
export default createAlumniMeetGallery;

// If running as script
if (require.main === module) {
    createAlumniMeetGallery()
        .then(() => {
            console.log('✅ Script completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Script failed:', error);
            process.exit(1);
        });
}

