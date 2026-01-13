import { db } from './firebaseConfig';
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
    updateDoc
} from 'firebase/firestore';
import { getStudentCollectionName } from '../utils/collectionMapper';

export const studentService = {
    // Get profile - fetches from Firestore 'students' or 'users' collection
    getProfile: async (studentId, email = null) => {
        try {
            console.log('🔍 Getting student profile for:', { studentId, email });

            // 1. Try fetching by ID (register number) directly from 'students'
            if (studentId) {
                const docRef = doc(db, 'students', studentId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    console.log('✅ Found profile in Firestore (by ID)');
                    return { id: docSnap.id, ...docSnap.data() };
                }
            }

            // 2. If email provided, query 'students' collection by email
            if (email) {
                const q = query(collection(db, 'students'), where('email', '==', email));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const docData = querySnapshot.docs[0];
                    console.log('✅ Found profile in Firestore (by Email)');
                    return { id: docData.id, ...docData.data() };
                }
            }

            // 3. Fallback: Search in 'users' collection if not in 'students'
            if (studentId) {
                const userRef = doc(db, 'users', studentId);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    console.log('✅ Found user profile in Firestore');
                    return { id: userSnap.id, ...userSnap.data() };
                }
            }

            console.warn('⚠️ Profile not found in Firestore for:', email || studentId);
            return null;
        } catch (error) {
            console.error("Error fetching profile:", error);
            return null;
        }
    },

    // Get timetable
    getTimetable: async (program, year) => {
        try {
            const q = query(
                collection(db, 'timetables'),
                where('program', '==', program),
                where('year', '==', parseInt(year)),
                limit(1)
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
            }
            return null;
        } catch (error) {
            console.error("Error fetching timetable:", error);
            return null;
        }
    },

    // Get exams
    getExams: async (program, year) => {
        try {
            const q = query(collection(db, 'exams'), orderBy('date', 'asc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching exams:", error);
            return [];
        }
    },

    // Get notices
    getNotices: async (limitCount = 20) => {
        try {
            const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'), limit(limitCount));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching notices:", error);
            return [];
        }
    },

    // Get events
    getEvents: async () => {
        try {
            const q = query(collection(db, 'events'), orderBy('date', 'asc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting events:', error);
            return [];
        }
    },

    // Get attendance
    getAttendance: async (studentId) => {
        try {
            // Mock attendance for now or fetch from 'attendance' collection
            return [
                { subject: "Modern Operating Systems", attended: 32, total: 36, color: "#4F46E5" },
                { subject: "Advanced Database Systems", attended: 28, total: 34, color: "#06B6D4" },
                { subject: "Optimization Techniques", attended: 15, total: 18, color: "#F59E0B" },
                { subject: "Social Network Analytics", attended: 22, total: 24, color: "#10B981" },
            ];
        } catch (error) {
            console.error("Error fetching attendance:", error);
            return [];
        }
    },

    // Get students for directory
    getStudentsByProgram: async (program, year, course = 'PG') => {
        try {
            console.log("Fetching students - Program:", program, "Year:", year, "Course:", course);

            if (course && program && year) {
                const collectionName = getStudentCollectionName(course, program, year);
                const qPartition = query(collection(db, collectionName), orderBy('name', 'asc'));
                const snapshotPartition = await getDocs(qPartition);

                if (!snapshotPartition.empty) {
                    return snapshotPartition.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                }
            }

            let q = collection(db, 'students');
            if (program && year) {
                q = query(q, where('program', '==', program), where('year', '==', parseInt(year)));
            } else if (program) {
                q = query(q, where('program', '==', program));
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching students:", error);
            return [];
        }
    },

    // Save student profile
    saveProfile: async (studentId, studentData) => {
        try {
            const docRef = doc(db, 'students', studentId);
            await setDoc(docRef, studentData, { merge: true });

            // Also update in partitioning collection if info exists
            if (studentData.course && studentData.program && studentData.year) {
                const collectionName = getStudentCollectionName(studentData.course, studentData.program, studentData.year);
                await setDoc(doc(db, collectionName, studentId), studentData, { merge: true });
            }

            return true;
        } catch (error) {
            console.error("Error saving profile:", error);
            throw error;
        }
    },

    // Request a letter/certificate
    requestLetter: async (studentId, type, purpose) => {
        try {
            const docRef = doc(collection(db, 'letter_requests'));
            const request = {
                studentId,
                type,
                purpose,
                status: 'Pending',
                createdAt: new Date().toISOString()
            };
            await setDoc(docRef, request);
            return { id: docRef.id, ...request };
        } catch (error) {
            console.error("Error requesting letter:", error);
            throw error;
        }
    },

    // Submit complaint
    submitComplaint: async (complaintData) => {
        try {
            const docRef = doc(collection(db, 'complaints'));
            const complaint = {
                ...complaintData,
                createdAt: new Date().toISOString(),
                status: 'Open'
            };
            await setDoc(docRef, complaint);
            return { id: docRef.id, ...complaint };
        } catch (error) {
            console.error('Error submitting complaint:', error);
            throw error;
        }
    }
};
