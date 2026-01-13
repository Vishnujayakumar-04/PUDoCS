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

export const staffService = {
    // Get staff profile
    getProfile: async (userId, email = null) => {
        try {
            console.log('🔍 Getting staff profile for:', { userId, email });

            // 1. Try fetching by ID directly from 'staff' collection
            if (userId) {
                const docRef = doc(db, 'staff', userId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    console.log('✅ Found staff profile in Firestore (by ID)');
                    return { id: docSnap.id, ...docSnap.data() };
                }
            }

            // 2. Query by email
            if (email) {
                const q = query(collection(db, 'staff'), where('email', '==', email));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const docData = querySnapshot.docs[0];
                    console.log('✅ Found staff profile in Firestore (by Email)');
                    return { id: docData.id, ...docData.data() };
                }
            }

            // 3. Fallback: Search in 'users' collection (using UID)
            if (userId) {
                const userRef = doc(db, 'users', userId);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    if (userData.role === 'Staff' || userData.role === 'Office') {
                        console.log('✅ Found user profile (Staff/Office)');
                        return { id: userSnap.id, ...userData };
                    }
                }
            }

            return null;
        } catch (error) {
            console.error("Error fetching staff profile:", error);
            return null;
        }
    },

    // Get all staff members
    getAllStaff: async () => {
        try {
            console.log('🔍 Fetching all staff from Firestore...');
            const q = query(collection(db, 'staff'), orderBy('name', 'asc'));
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(docSnap => ({
                id: docSnap.id,
                ...docSnap.data()
            }));
        } catch (error) {
            console.error("Error fetching all staff:", error);
            return [];
        }
    },

    // Get dashboard data
    getDashboard: async (userId) => {
        try {
            const examsQ = query(collection(db, 'exams'), orderBy('date', 'asc'), limit(5));
            const examsSnap = await getDocs(examsQ);

            return {
                assignedClasses: [],
                upcomingExams: examsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
                recentNotices: []
            };
        } catch (e) {
            return { upcomingExams: [], recentNotices: [] };
        }
    },

    // Student Management (for staff)
    getStudents: async (filters = {}) => {
        try {
            console.log("🔍 Fetching students from Firestore with filters:", filters);

            // If we have course, program and year, use the partitioned collection
            if (filters.course && filters.program && filters.year) {
                const collectionName = getStudentCollectionName(filters.course, filters.program, filters.year);
                console.log(`📂 Attempting partitioned collection: ${collectionName}`);
                const qPartition = query(collection(db, collectionName), orderBy('name', 'asc'));
                const snapshotPartition = await getDocs(qPartition);

                if (!snapshotPartition.empty) {
                    return snapshotPartition.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                }
            }

            // Fallback to global 'students' collection
            let q = collection(db, 'students');
            if (filters.program && filters.year) {
                q = query(q, where('program', '==', filters.program), where('year', '==', parseInt(filters.year)));
            } else if (filters.program) {
                q = query(q, where('program', '==', filters.program));
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching students:", error);
            return [];
        }
    },

    addStudent: async (studentData) => {
        try {
            const { course, program, year, registerNumber } = studentData;
            const collectionName = getStudentCollectionName(course || 'PG', program || '', year || 1);

            const docRef = doc(db, collectionName, registerNumber);
            await setDoc(docRef, {
                ...studentData,
                createdAt: new Date().toISOString()
            }, { merge: true });

            const globalRef = doc(db, 'students', registerNumber);
            await setDoc(globalRef, {
                ...studentData,
                createdAt: new Date().toISOString()
            }, { merge: true });

            return true;
        } catch (error) {
            console.error("Error adding student:", error);
            throw error;
        }
    },

    updateStudent: async (id, studentData) => {
        try {
            const { course, program, year } = studentData;
            const collectionName = getStudentCollectionName(course || 'PG', program || '', year || 1);

            const docRef = doc(db, collectionName, id);
            await updateDoc(docRef, studentData);

            try {
                const globalRef = doc(db, 'students', id);
                await updateDoc(globalRef, studentData);
            } catch (e) { }

            return true;
        } catch (error) {
            console.error("Error updating student:", error);
            throw error;
        }
    },

    deleteStudent: async (id, studentData = {}) => {
        try {
            const { course, program, year } = studentData;
            const collectionName = getStudentCollectionName(course || 'PG', program || '', year || 1);

            const docRef = doc(db, collectionName, id);
            await deleteDoc(docRef);

            try {
                const globalRef = doc(db, 'students', id);
                await deleteDoc(globalRef);
            } catch (e) { }

            return true;
        } catch (error) {
            console.error("Error deleting student:", error);
            throw error;
        }
    },

    // Attendance
    markAttendance: async (attendanceData) => {
        try {
            const attendanceRef = doc(collection(db, 'attendance'));
            await setDoc(attendanceRef, {
                ...attendanceData,
                timestamp: new Date().toISOString()
            });
            return { id: attendanceRef.id, success: true };
        } catch (error) {
            console.error("Error saving attendance:", error);
            throw error;
        }
    },

    // Bulk add students
    addStudentsBulk: async (studentsList) => {
        return studentStorageService.addStudentsBulk(studentsList);
    },

    updateStudent: async (id, studentData) => {
        return studentStorageService.updateStudent(id, studentData);
    },

    deleteStudent: async (id) => {
        return studentStorageService.deleteStudent(id);
    },

    // Attendance
    markAttendance: async ({ studentIds, date, subject, status }) => {
        // Save to AsyncStorage
        const key = `attendance_${date}_${subject}`;
        await AsyncStorage.setItem(key, JSON.stringify({ studentIds, status }));
        return { message: 'Attendance marked locally' };
    },

    // Timetable
    manageTimetable: async (timetableData) => {
        try {
            const docRef = doc(collection(db, 'timetables'));
            await setDoc(docRef, {
                ...timetableData,
                createdAt: new Date().toISOString()
            });
            return { id: docRef.id, ...timetableData };
        } catch (error) {
            console.error("Error managing timetable:", error);
            throw error;
        }
    },

    // Exam management
    createExam: async (examData) => {
        try {
            const docRef = doc(collection(db, 'exams'));
            await setDoc(docRef, {
                ...examData,
                createdAt: new Date().toISOString()
            });
            return { id: docRef.id, ...examData };
        } catch (error) {
            console.error("Error creating exam:", error);
            throw error;
        }
    },

    allocateSeats: async (examId) => {
        // Platform parity logic for seat allocation
        return { id: examId, isSeatsAllocated: true, hallAllocations: [] };
    },

    lockSeats: async (examId) => {
        return { id: examId, isSeatsLocked: true };
    },

    // Notices
    postNotice: async (noticeData) => {
        try {
            const docRef = doc(collection(db, 'notices'));
            await setDoc(docRef, {
                ...noticeData,
                createdAt: new Date().toISOString()
            });
            return { id: docRef.id, ...noticeData };
        } catch (error) {
            console.error("Error posting notice:", error);
            throw error;
        }
    },

    getNotices: async (limitCount = 10) => {
        try {
            const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'), limit(limitCount));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching notices:", error);
            return [];
        }
    },

    // Events
    createEvent: async (eventData) => {
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
            console.error('Error creating event:', error);
            throw error;
        }
    },

    getEvents: async () => {
        try {
            const q = query(collection(db, 'events'), orderBy('date', 'asc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching events:", error);
            return [];
        }
    },

    // Office Management (Parity with Web)
    addStaff: async (staffData) => {
        try {
            const docRef = doc(collection(db, 'staff'));
            await setDoc(docRef, {
                ...staffData,
                createdAt: new Date().toISOString()
            });
            return { id: docRef.id, success: true };
        } catch (error) {
            console.error("Error adding staff:", error);
            throw error;
        }
    },

    updateStaff: async (id, staffData) => {
        try {
            const docRef = doc(db, 'staff', id);
            await setDoc(docRef, staffData, { merge: true });
            return true;
        } catch (error) {
            console.error("Error updating staff:", error);
            throw error;
        }
    },

    deleteStaff: async (id) => {
        try {
            const docRef = doc(db, 'staff', id);
            await setDoc(docRef, { deleted: true }, { merge: true });
            return true;
        } catch (error) {
            console.error("Error deleting staff:", error);
            throw error;
        }
    },

    uploadImage: async (file, path = 'staff_images') => {
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

