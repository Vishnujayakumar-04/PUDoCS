import { db } from './firebaseConfig';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export const officeService = {
    // Get Office Profile
    getProfile: async (userId, email) => {
        try {
            // Check 'staff' collection first (Office might be treated as staff in DB)
            const staffRef = doc(db, 'staff', userId);
            const staffSnap = await getDoc(staffRef);

            if (staffSnap.exists()) {
                return { id: staffSnap.id, ...staffSnap.data() };
            }

            // Or just return basic info if not found
            return {
                name: 'Office Admin',
                email: email,
                role: 'Office',
                department: 'Computer Science',
                designation: 'Office Administration'
            };
        } catch (error) {
            console.error("Error fetching office profile:", error);
            return null;
        }
    },

    // Get Dashboard Stats
    getDashboard: async (userId) => {
        return {
            stats: {
                totalStudents: 120, // Mock for now or fetch count
                pendingFees: 15,
                newApplications: 5,
                todayEvents: 2
            },
            upcomingExams: []
        };
    },

    // Get Notices
    getNotices: async () => {
        try {
            const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'), limit(10));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching notices:", error);
            return [];
        }
    },

    // Get Events
    getEvents: async () => {
        try {
            const q = query(collection(db, 'events'), orderBy('date', 'asc'), limit(5));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching events:", error);
            return [];
        }
    },

    // Add Notice
    addNotice: async (noticeData) => {
        try {
            const noticeRef = doc(collection(db, 'notices'));
            await setDoc(noticeRef, {
                ...noticeData,
                createdAt: new Date().toISOString()
            });
            return { id: noticeRef.id, success: true };
        } catch (error) {
            console.error("Error adding notice:", error);
            throw error;
        }
    },

    // Delete Notice
    deleteNotice: async (id) => {
        try {
            await updateDoc(doc(db, 'notices', id), { deleted: true }); // Or actually delete
            // deleteDoc(doc(db, 'notices', id));
            return { success: true };
        } catch (error) {
            throw error;
        }
    },

    // Add Event
    addEvent: async (eventData) => {
        try {
            const eventRef = doc(collection(db, 'events'));
            await setDoc(eventRef, {
                ...eventData,
                createdAt: new Date().toISOString()
            });
            return { id: eventRef.id, success: true };
        } catch (error) {
            console.error("Error adding event:", error);
            throw error;
        }
    },

    // Delete Event
    deleteEvent: async (id) => {
        try {
            // Delete the document
            await setDoc(doc(db, 'events', id), { deleted: true }, { merge: true });
            return { success: true };
        } catch (error) {
            throw error;
        }
    },

    // Timetable Management
    getTimetables: async () => {
        try {
            const q = query(collection(db, 'timetables'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching timetables:", error);
            return [];
        }
    },

    deleteTimetable: async (id) => {
        try {
            const { deleteDoc } = await import('firebase/firestore');
            await deleteDoc(doc(db, 'timetables', id));
            return { success: true };
        } catch (error) {
            console.error("Error deleting timetable:", error);
            throw error;
        }
    }
};
