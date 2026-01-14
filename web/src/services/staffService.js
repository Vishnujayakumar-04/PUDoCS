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
import { storage } from './firebaseConfig';
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

            // 3. Fallback: Search in 'users' collection
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

    // Get all staff members (Deduplicated)
    getAllStaff: async () => {
        try {
            console.log('🔍 Fetching all staff from Firestore...');
            const q = query(collection(db, 'staff'), orderBy('name', 'asc'));
            const querySnapshot = await getDocs(q);

            // Deduplicate by email/name
            const staffMap = new Map();
            querySnapshot.docs.forEach(docSnap => {
                const data = docSnap.data();
                const key = data.email?.toLowerCase() || data.name?.toLowerCase();

                if (!staffMap.has(key) || (!staffMap.get(key).imageKey && data.imageKey)) {
                    staffMap.set(key, { id: docSnap.id, ...data });
                }
            });

            const staffList = Array.from(staffMap.values());
            console.log(`✅ Returned ${staffList.length} unique staff members`);
            return staffList;
        } catch (error) {
            console.error("Error fetching all staff:", error);
            return [];
        }
    },

    // Get dashboard data
    getDashboard: async (userId) => {
        try {
            // Mock or fetch from Firestore collections 'exams', 'notices', etc.
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

    // Student Management (for staff)
    getStudents: async (filters = {}) => {
        try {
            console.log("🔍 Fetching students with filters:", filters);

            // If we have course, program and year, use the partitioned collection
            if (filters.course && filters.program && filters.year) {
                // FORCE EMPTY FOR UG as per request "in the ug there is no namelist just keep it empt"
                if (filters.course === 'UG' || /B\.?TECH|B\.?SC/i.test(filters.program)) {
                    console.log('⚠️ UG namelist is temporarily disabled/empty.');
                    return [];
                }

                const collectionName = getStudentCollectionName(filters.course, filters.program, filters.year);
                console.log(`📂 Attempting partitioned collection: ${collectionName}`);
                const qPartition = query(collection(db, collectionName), orderBy('name', 'asc'));
                const snapshotPartition = await getDocs(qPartition);

                if (!snapshotPartition.empty) {
                    return snapshotPartition.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                }
                console.log(`⚠️ Partition ${collectionName} is empty, falling back to global collection`);
            }

            // Fallback to global 'students' collection or searching all (if needed)
            let q = collection(db, 'students');

            if (filters.program && filters.year) {
                if (/B\.?TECH|B\.?SC/i.test(filters.program)) {
                    console.log('⚠️ UG namelist is temporarily disabled/empty.');
                    return [];
                }
                q = query(q, where('program', '==', filters.program), where('year', '==', parseInt(filters.year)));
            } else if (filters.program) {
                if (/B\.?TECH|B\.?SC/i.test(filters.program)) {
                    console.log('⚠️ UG namelist is temporarily disabled/empty.');
                    return [];
                }
                q = query(q, where('program', '==', filters.program));
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching students for staff:", error);
            return [];
        }
    },

    // Create Event
    createEvent: async (eventData) => {
        try {
            const newDocRef = doc(collection(db, 'events'));
            const event = {
                id: newDocRef.id,
                ...eventData,
                createdAt: new Date().toISOString()
            };
            await setDoc(newDocRef, event);
            return event;
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    },

    // Get Notices
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

    // Get Events
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

    addStudent: async (studentData) => {
        try {
            const { course, program, year, registerNumber } = studentData;
            const collectionName = getStudentCollectionName(course || 'PG', program || '', year || 1);

            console.log(`📝 Saving student to: ${collectionName}`);
            const docRef = doc(db, collectionName, registerNumber);
            await setDoc(docRef, {
                ...studentData,
                createdAt: new Date().toISOString()
            }, { merge: true });

            // Also save to global for legacy lookups
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

            // Update in partitioned
            const docRef = doc(db, collectionName, id);
            await updateDoc(docRef, studentData);

            // Update in global
            try {
                const globalRef = doc(db, 'students', id);
                await updateDoc(globalRef, studentData);
            } catch (e) { /* ignore if not in global */ }

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

            // Delete from partitioned
            const docRef = doc(db, collectionName, id);
            await deleteDoc(docRef);

            // Delete from global
            try {
                const globalRef = doc(db, 'students', id);
                await deleteDoc(globalRef);
            } catch (e) { /* ignore */ }

            return true;
        } catch (error) {
            console.error("Error deleting student:", error);
            throw error;
        }
    },

    saveAttendance: async (attendanceData) => {
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

    saveInternalMarks: async (marksData) => {
        try {
            const marksRef = doc(collection(db, 'internal_marks'));
            await setDoc(marksRef, {
                ...marksData,
                timestamp: new Date().toISOString()
            });
            return { id: marksRef.id, success: true };
        } catch (error) {
            console.error("Error saving internal marks:", error);
            throw error;
        }
    },

    // Staff Management (for Office)
    getStaff: async () => {
        try {
            const q = query(collection(db, 'staff'), orderBy('name', 'asc'));
            const snapshot = await getDocs(q);

            // Deduplicate by email or name
            const staffMap = new Map();
            snapshot.docs.forEach(docSnap => {
                const data = docSnap.data();
                const key = data.email?.toLowerCase().trim() || data.name?.toLowerCase().trim();

                // Prioritize entries with images if duplicate found
                if (!staffMap.has(key) || (!staffMap.get(key).imageKey && data.imageKey)) {
                    staffMap.set(key, { id: docSnap.id, ...data });
                }
            });

            return Array.from(staffMap.values());
        } catch (error) {
            console.error("Error fetching staff for management:", error);
            return [];
        }
    },

    // Update Staff (for Office)
    updateStaff: async (id, staffData) => {
        try {
            const staffRef = doc(db, 'staff', id);
            await setDoc(staffRef, staffData, { merge: true });
            return true;
        } catch (error) {
            console.error("Error updating staff:", error);
            throw error;
        }
    },

    addStaff: async (staffData) => {
        try {
            const staffRef = doc(collection(db, 'staff'));
            await setDoc(staffRef, {
                ...staffData,
                createdAt: new Date().toISOString()
            });
            return { id: staffRef.id, success: true };
        } catch (error) {
            console.error("Error adding staff:", error);
            throw error;
        }
    },

    deleteStaff: async (id) => {
        try {
            const staffRef = doc(db, 'staff', id);
            await setDoc(staffRef, { deleted: true }, { merge: true });
            return true;
        } catch (error) {
            console.error("Error deleting staff:", error);
            throw error;
        }
    },

    // Upload Staff Image
    uploadStaffImage: async (file) => {
        try {
            const storageRef = ref(storage, `staff_images/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        } catch (error) {
            console.error("Error uploading staff image:", error);
            throw error;
        }
    },

    // Upload Student Image
    uploadStudentImage: async (file) => {
        try {
            const storageRef = ref(storage, `student_images/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        } catch (error) {
            console.error("Error uploading student image:", error);
            throw error;
        }
    },

    // Upload Gallery Image
    uploadGalleryImage: async (file) => {
        try {
            const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        } catch (error) {
            console.error("Error uploading gallery image:", error);
            throw error;
        }
    },

    // Get Staff Timetable
    getTimetable: async (identifier) => {
        try {
            // Identifier can be UID or Email.
            // First try doc with identifier (assuming it might be UID)
            const docRef = doc(db, 'staff_timetables', identifier);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return docSnap.data().schedule;
            }

            // If not found by ID, try querying by email field if identifier looks like email
            if (identifier.includes('@')) {
                const q = query(collection(db, 'staff_timetables'), where('email', '==', identifier));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    return querySnapshot.docs[0].data().schedule;
                }
            }

            return null;
        } catch (error) {
            console.error("Error fetching timetable:", error);
            return null;
        }
    },

    // Save Staff Timetable
    saveTimetable: async (identifier, schedule, email = '') => {
        try {
            // We use the identifier (UID preferred) as the doc ID
            const docRef = doc(db, 'staff_timetables', identifier);
            await setDoc(docRef, {
                schedule,
                email, // store email for secondary lookup
                updatedAt: new Date().toISOString()
            }, { merge: true });
            return true;
        } catch (error) {
            console.error("Error saving timetable:", error);
            throw error;
        }
    }
};
