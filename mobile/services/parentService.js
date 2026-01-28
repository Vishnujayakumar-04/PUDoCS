import { db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { studentService } from './studentService';
import { offlineStorage } from './offlineStorage';

export const parentService = {
    // Get Ward Details (Offline First)
    getWardDetails: async (parentId) => {
        try {
            console.log(`[Mobile] Getting Ward Details for Parent: ${parentId}`);

            // 1. Check Local Cache for Parent Profile (to get ward ID)
            let wardId = null;
            const type = 'parents';

            // Try cache
            const cachedParent = await offlineStorage.get(parentId, type, parentId);
            if (cachedParent && cachedParent.wardUid) {
                wardId = cachedParent.wardUid;
            } else {
                // Fetch from Cloud
                const parentDoc = await getDoc(doc(db, 'parents', parentId));
                if (parentDoc.exists()) {
                    const data = parentDoc.data();
                    wardId = data.wardUid || data.linkedStudentId;
                    // Cache parent profile
                    await offlineStorage.save(parentId, type, parentId, { id: parentId, ...data }, true);
                }
            }

            if (!wardId) {
                console.warn('[Mobile] No ward linked to this parent.');
                return null;
            }

            console.log(`[Mobile] Found Ward ID: ${wardId}. Fetching Student Profile...`);

            // 2. Fetch Student Profile (Reuse studentService which is Offline-First)
            const studentProfile = await studentService.getProfile(wardId);
            return studentProfile;

        } catch (error) {
            console.error("Error fetching ward details:", error);
            return null;
        }
    }
};
