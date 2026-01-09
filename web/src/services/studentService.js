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
    updateDoc,
    deleteDoc
} from 'firebase/firestore';
import { getStudentCollectionName } from '../utils/collectionMapper';

export const studentService = {
    // Get profile - fetches from Firestore 'students' or 'users' collection
    getProfile: async (studentId, email = null) => {
        try {
            console.log('🔍 Getting profile for:', { studentId, email });

            // 1. Try fetching by ID (if it looks like a register number) directly from 'students'
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

    // Get timetable - fetch from 'timetables' collection (if exists) or local fallback
    getTimetable: async (program, year) => {
        return null;
    },

    // Get exams
    getExams: async (program, year) => {
        try {
            const q = query(
                collection(db, 'exams'),
                orderBy('date')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.error("Error fetching exams:", e);
            return [];
        }
    },

    // Get notices
    getNotices: async (limitCount = 20) => {
        try {
            const q = query(
                collection(db, 'notices'),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        } catch (e) {
            console.error("Error fetching notices:", e);
            return [];
        }
    },

    // Get events
    getEvents: async () => {
        try {
            const q = query(collection(db, 'events'), orderBy('date', 'asc'));
            const snapshot = await getDocs(q);
            const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (events.length === 0) {
                return [];
            }
            return events;
        } catch (error) {
            console.error('Error getting events:', error);
            return [];
        }
    },

    // Get students for directory
    getStudentsByProgram: async (program, year, course = 'PG') => {
        try {
            console.log("Fetching students - Program:", program, "Year:", year, "Course:", course);

            // Use partitioning if we have all info
            if (course && program && year) {
                const collectionName = getStudentCollectionName(course, program, year);
                console.log(`📂 Attempting partitioned collection: ${collectionName}`);
                const qPartition = query(collection(db, collectionName), orderBy('name', 'asc'));
                const snapshotPartition = await getDocs(qPartition);

                if (!snapshotPartition.empty) {
                    return snapshotPartition.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                }
                console.log(`⚠️ Partition ${collectionName} is empty, falling back to global collection`);
            }

            // Fallback for directory or global search
            let q;
            if (program && year) {
                q = query(
                    collection(db, 'students'),
                    where('program', '==', program),
                    where('year', '==', parseInt(year))
                );
            } else if (program) {
                q = query(collection(db, 'students'), where('program', '==', program));
            } else {
                q = query(collection(db, 'students'), limit(50));
            }

            const snapshot = await getDocs(q);
            const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            console.log(`✅ Returned ${students.length} students from DB`);
            return students;
        } catch (error) {
            console.error("Error fetching students:", error);
            return [];
        }
    },

    // Search students by name or register number
    searchStudents: async (queryStr) => {
        try {
            console.log("🔍 Searching students for:", queryStr);
            const q = collection(db, 'students');
            const snapshot = await getDocs(q);
            const allStudents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const searchLower = queryStr.toLowerCase();
            return allStudents.filter(s =>
                (s.name && s.name.toLowerCase().includes(searchLower)) ||
                (s.registerNumber && s.registerNumber.toLowerCase().includes(searchLower))
            );
        } catch (error) {
            console.error("Error searching students:", error);
            return [];
        }
    },

    // Save student profile
    saveProfile: async (studentId, studentData) => {
        try {
            await setDoc(doc(db, 'students', studentId), studentData, { merge: true });
            console.log('✅ Profile saved to Firestore');
            return true;
        } catch (error) {
            console.error("Error saving profile:", error);
            throw error;
        }
    },

    // Request a letter/certificate
    requestLetter: async (studentId, type, purpose) => {
        try {
            const newDocRef = doc(collection(db, 'letter_requests'));
            await setDoc(newDocRef, {
                studentId,
                type,
                purpose,
                status: 'Pending',
                createdAt: new Date().toISOString()
            });
            return { id: newDocRef.id, status: 'Pending' };
        } catch (e) {
            console.error("Error requesting letter:", e);
            throw e;
        }
    },

    // Get letter requests 
    getLetterRequests: async (studentId) => {
        return [];
    },

    // Get results
    getResults: async (studentId) => {
        return { semesters: [], cgpa: 0.00 };
    },

    // Submit complaint
    submitComplaint: async (complaintData) => {
        try {
            const newDocRef = doc(collection(db, 'complaints'));
            await setDoc(newDocRef, {
                ...complaintData,
                createdAt: new Date().toISOString(),
                status: 'Open'
            });
            return { id: newDocRef.id };
        } catch (error) {
            console.error('Error submitting complaint:', error);
            throw error;
        }
    },

    // getAttendance (Mock for now, or fetch from DB if migrated)
    getAttendance: async () => {
        return [
            { subject: "Modern Operating Systems", attended: 32, total: 36, color: "#4F46E5" },
            { subject: "Advanced Database Systems", attended: 28, total: 34, color: "#06B6D4" },
            { subject: "Optimization Techniques", attended: 15, total: 18, color: "#F59E0B" },
            { subject: "Social Network Analytics", attended: 22, total: 24, color: "#10B981" },
        ];
    }
};
