import { db, storage } from './firebaseConfig';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    setDoc,
    updateDoc,
    deleteDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getStudentCollectionName } from '../utils/collectionMapper';

export const officeService = {
    // Dashboard stats
    getDashboard: async () => {
        try {
            const snapshot = await getDocs(collection(db, 'students'));
            const totalStudents = snapshot.size;

            const examsQ = query(collection(db, 'exams'), orderBy('date', 'asc'), limit(5));
            const examsSnap = await getDocs(examsQ);

            return {
                stats: {
                    totalStudents,
                    pendingFees: 0,
                    newApplications: 0,
                    todayEvents: 0
                },
                upcomingExams: examsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            };
        } catch (error) {
            console.error('Error loading dashboard:', error);
            return {
                stats: { totalStudents: 0, pendingFees: 0, newApplications: 0, todayEvents: 0 },
                upcomingExams: []
            };
        }
    },

    // Student management (List)
    getStudents: async (filters = {}) => {
        try {
            console.log("🔍 Office/Admin fetching students with filters:", filters);

            if (filters.course && filters.program && filters.year) {
                const collectionName = getStudentCollectionName(filters.course, filters.program, filters.year);
                const q = query(collection(db, collectionName), orderBy('name', 'asc'));
                const snapshot = await getDocs(q);
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }

            let q = collection(db, 'students');
            if (filters.program) {
                q = query(q, where('program', '==', filters.program));
            }
            if (filters.year) {
                q = query(q, where('year', '==', parseInt(filters.year)));
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting students:', error);
            return [];
        }
    },

    // Fee management
    updateFees: async (studentId, feeData) => {
        try {
            const globalRef = doc(db, 'students', studentId);
            const globalSnap = await getDoc(globalRef);

            if (globalSnap.exists()) {
                const studentData = globalSnap.data();
                const updatedFees = { ...(studentData.fees || {}), ...feeData };

                await updateDoc(globalRef, { fees: updatedFees });

                const collectionName = getStudentCollectionName(studentData.course, studentData.program, studentData.year);
                const partRef = doc(db, collectionName, studentId);
                await updateDoc(partRef, { fees: updatedFees });

                return { id: studentId, fees: updatedFees };
            }
            throw new Error('Student not found');
        } catch (error) {
            console.error('Error updating fees:', error);
            throw error;
        }
    },

    // Notices
    getNotices: async (limitCount = 10) => {
        try {
            const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'), limit(limitCount));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting notices:', error);
            return [];
        }
    },

    postNotice: async (noticeData) => {
        try {
            const docRef = doc(collection(db, 'notices'));
            const notice = {
                id: docRef.id,
                ...noticeData,
                createdAt: new Date().toISOString(),
                isApproved: true,
                postedBy: 'Office'
            };
            await setDoc(docRef, notice);
            return notice;
        } catch (error) {
            console.error("Error posting notice:", error);
            throw error;
        }
    },

    updateNotice: async (id, updates) => {
        try {
            const docRef = doc(db, 'notices', id);
            await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
            return { id, ...updates };
        } catch (error) {
            console.error('Error updating notice:', error);
            throw error;
        }
    },

    deleteNotice: async (id) => {
        try {
            const docRef = doc(db, 'notices', id);
            await setDoc(docRef, { deleted: true }, { merge: true });
            return true;
        } catch (error) {
            console.error('Error deleting notice:', error);
            throw error;
        }
    },

    // Events
    getEvents: async (limitCount = 10) => {
        try {
            const q = query(collection(db, 'events'), orderBy('date', 'asc'), limit(limitCount));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting events:', error);
            return [];
        }
    },

    postEvent: async (eventData) => {
        try {
            const docRef = doc(collection(db, 'events'));
            const event = {
                id: docRef.id,
                ...eventData,
                createdAt: new Date().toISOString()
            };
            await setDoc(docRef, event);
            return event;
        } catch (error) {
            console.error('Error posting event:', error);
            throw error;
        }
    },

    updateEvent: async (id, updates) => {
        try {
            const docRef = doc(db, 'events', id);
            await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
            return { id, ...updates };
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    },

    deleteEvent: async (id) => {
        try {
            const docRef = doc(db, 'events', id);
            await setDoc(docRef, { deleted: true }, { merge: true });
            return true;
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    },

    // Officers / Staff Management
    getOfficers: async () => {
        try {
            const q = query(collection(db, 'staff'), where('role', '==', 'Office'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting officers:', error);
            return [];
        }
    },

    // Exams
    getExams: async () => {
        try {
            const q = query(collection(db, 'exams'), orderBy('date', 'asc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting exams:', error);
            return [];
        }
    },

    createExam: async (examData) => {
        try {
            const docRef = doc(collection(db, 'exams'));
            const exam = { id: docRef.id, ...examData, createdAt: new Date().toISOString() };
            await setDoc(docRef, exam);
            return exam;
        } catch (error) {
            console.error('Error creating exam:', error);
            throw error;
        }
    },

    updateExam: async (id, updates) => {
        try {
            const docRef = doc(db, 'exams', id);
            await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
            return { id, ...updates };
        } catch (error) {
            console.error('Error updating exam:', error);
            throw error;
        }
    },

    deleteExam: async (id) => {
        try {
            await deleteDoc(doc(db, 'exams', id));
            return true;
        } catch (error) {
            console.error('Error deleting exam:', error);
            throw error;
        }
    },

    // Timetables
    getTimetables: async () => {
        try {
            const q = query(collection(db, 'timetables'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting timetables:', error);
            return [];
        }
    },

    saveTimetable: async (timetableData) => {
        try {
            const docRef = doc(collection(db, 'timetables'));
            const timetable = {
                id: docRef.id,
                ...timetableData,
                createdAt: new Date().toISOString()
            };
            await setDoc(docRef, timetable);
            return timetable;
        } catch (error) {
            console.error('Error saving timetable:', error);
            throw error;
        }
    },

    deleteTimetable: async (id) => {
        try {
            await deleteDoc(doc(db, 'timetables', id));
            return true;
        } catch (error) {
            console.error('Error deleting timetable:', error);
            throw error;
        }
    },

    uploadImage: async (file, path = 'images') => {
        try {
            const storageRef = ref(storage, `${path}/${Date.now()}_image`);
            const snapshot = await uploadBytes(storageRef, file);
            return await getDownloadURL(snapshot.ref);
        } catch (error) {
            console.error("Error uploading image:", error);
            throw error;
        }
    }
};
