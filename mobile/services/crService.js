import { db } from './firebaseConfig';
import { collection, query, where, getDocs, doc, setDoc, addDoc } from 'firebase/firestore';
import { offlineStorage } from './offlineStorage';
import { syncEngine } from './syncEngine';

export const crService = {
    // Get class students (Read Only)
    getClassStudents: async (program, year) => {
        try {
            // Check cache first? Students might be large, but CR only sees one class.
            // Let's use direct query or cache if we implement 'class-roster' cache type.
            // For now, direct fetch as per "Read Only" requirement, optimized.

            const q = query(
                collection(db, 'students'),
                where('program', '==', program),
                where('year', '==', parseInt(year))
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching class students:", error);
            return [];
        }
    },

    // Submit Attendance with Offline Write Queue
    submitAttendance: async (attendanceList, date, markedBy, subject) => {
        try {
            const isOnline = await syncEngine.isOnline();

            // Prepare records
            const records = attendanceList.map(item => ({
                studentId: item.studentId,
                studentName: item.name,
                date: date,
                status: item.status,
                subjectName: subject,
                markedBy: markedBy,
                markedByRole: 'CR',
                createdAt: new Date().toISOString()
            }));

            if (!isOnline) {
                console.log('📴 [CR] Offline. Queuing attendance...');
                for (const record of records) {
                    const tempId = `temp_cr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                    await offlineStorage.save(markedBy, 'attendance', tempId, { ...record, id: tempId }, false);
                }
                return { success: true, offline: true };
            }

            // Online Write
            // Use batch in real app. Here strict loop.
            const batch = [];
            for (const record of records) {
                await addDoc(collection(db, 'attendance'), record);
            }
            return { success: true };

        } catch (error) {
            console.error("Error submitting attendance:", error);
            throw error;
        }
    },

    // Post Notice
    postNotice: async (noticeData) => {
        try {
            await addDoc(collection(db, 'notices'), {
                ...noticeData,
                createdAt: new Date().toISOString()
            });
            return { success: true };
        } catch (error) {
            console.error("Error posting notice:", error);
            throw error;
        }
    }
};
