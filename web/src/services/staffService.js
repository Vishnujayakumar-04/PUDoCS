import { db, auth } from './firebaseConfig';
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
import { offlineStorage } from './offlineStorage';

export const staffService = {
    // Get staff profile (Offline First)
    getProfile: async (userId, email = null) => {
        try {
            // 1. Local Cache Lookup
            if (userId) {
                const localData = offlineStorage.get(userId, 'staff', userId);
                if (localData) return localData;
            }

            console.log('🔍 Missed Local Cache. Fetching staff profile for:', { userId, email });

            // 2. Cloud Lookup
            let profileData = null;

            // Strategy A: By ID
            if (userId) {
                const docRef = doc(db, 'staff', userId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    profileData = { id: docSnap.id, ...docSnap.data() };
                }
            }

            // Strategy B: By Email
            if (!profileData && email) {
                const q = query(collection(db, 'staff'), where('email', '==', email));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    profileData = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
                }
            }

            // Strategy C: Users Fallback
            if (!profileData && userId) {
                const userRef = doc(db, 'users', userId);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    if (userData.role === 'Staff' || userData.role === 'Office') {
                        profileData = { id: userSnap.id, ...userData };
                    }
                }
            }

            // 3. Update Cache
            if (profileData) {
                offlineStorage.save(profileData.id, 'staff', profileData.id, profileData, true);
                return profileData;
            }

            return null;
        } catch (error) {
            console.error("Error fetching staff profile:", error);
            return null;
        }
    },

    // Update staff profile
    updateProfile: async (userId, profileData) => {
        try {
            const docRef = doc(db, 'staff', userId);
            await setDoc(docRef, { ...profileData, updatedAt: new Date().toISOString() }, { merge: true });
            return true;
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
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
            console.log(`Getting Staff Dashboard for: ${userId}`);

            // 1. Fetch Assignments from Firestore (Strict Parity)
            // This replaces the old file-based mapping logic.
            const staffDocRef = doc(db, 'staff', userId);
            const staffDocSnap = await getDoc(staffDocRef);
            let assignments = [];

            if (staffDocSnap.exists()) {
                const data = staffDocSnap.data();
                if (data.teachingAssignments && Array.isArray(data.teachingAssignments)) {
                    assignments = data.teachingAssignments;
                }
            } else {
                console.warn(`Staff profile not found for ${userId} when fetching dashboard.`);
            }

            console.log(`Found ${assignments.length} teaching assignments.`);

            // 2. Fetch Exams/Notices as before
            const examsQ = query(collection(db, 'exams'), orderBy('date', 'asc'), limit(5));
            const examsSnap = await getDocs(examsQ);

            return {
                assignedClasses: assignments,
                upcomingExams: examsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
                recentNotices: []
            };
        } catch (e) {
            console.error("Dashboard Error:", e);
            return { assignedClasses: [], upcomingExams: [], recentNotices: [] };
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

    // Student Management (for staff) - Offline First
    getStudents: async (filters = {}) => {
        try {
            console.log("🔍 Fetching students with filters:", filters);

            // 0. Get Current User Value for Scope
            // We need the staff UID to scope the cache.
            // If called from UI, we assume AuthContext has verified login.
            // We use auth.currentUser if available.
            const currentUser = auth.currentUser;
            const scopeUid = currentUser ? currentUser.uid : 'public'; // Fallback if strictly testing, but should be logged in.

            // 1. Try Local Cache
            const cachedStudents = offlineStorage.getAll(scopeUid, 'students');
            const localResults = cachedStudents.filter(s => {
                let match = true;
                if (filters.course && s.course !== filters.course) match = false;
                if (filters.program && s.program !== filters.program) match = false;
                if (filters.year && s.year !== parseInt(filters.year)) match = false;
                return match;
            });

            if (localResults.length > 0) {
                console.log(`✅ Found ${localResults.length} students in Local Cache. Returning...`);
                // Trigger background refresh if online? Ideally yes, but keeping simple.
                // We will return local logic immediately.
            }

            // 2. Decide to Fetch Cloud
            // If local is empty OR we want to force refresh (not implemented here)
            // For now, if we found data, we return it. (Strict Offline Priority)
            // But if specific filters yielded nothing locally, we should try cloud.

            if (localResults.length > 0) return localResults;

            // 3. Fetch from Cloud if Local Empty
            console.log("☁️ Local Cache miss/empty. Fetching from Firestore...");

            // (Original Cloud Logic) ...

            // 1. UG Exclusion Rule
            if ((filters.course === 'UG') || (filters.program && /B\.?TECH|B\.?SC/i.test(filters.program))) {
                console.log('⚠️ UG namelist is temporarily disabled/empty.');
                return [];
            }

            // ... (Partition Logic Skipped for Brevity, defaulting to Central Query for new system)

            let q = collection(db, 'students');
            const constraints = [];

            if (filters.course) constraints.push(where('course', '==', filters.course));
            if (filters.program) constraints.push(where('program', '==', filters.program));
            if (filters.year) constraints.push(where('year', '==', Number(filters.year)));

            if (constraints.length > 0) {
                q = query(q, ...constraints, orderBy('name', 'asc'));
            } else {
                q = query(q, limit(50));
            }

            const snapshot = await getDocs(q);
            const cloudStudents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // 4. Cache Results
            cloudStudents.forEach(s => {
                offlineStorage.save(scopeUid, 'students', s.id, s, true);
            });

            return cloudStudents;

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

    getAttendance: async (classId, dateStr) => {
        try {
            // Query by classId and date
            // Note: dateStr should be YYYY-MM-DD format usually
            const q = query(
                collection(db, 'attendance'),
                where('classId', '==', classId),
                where('date', '==', dateStr)
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
            }
            return null;
        } catch (error) {
            console.error("Error fetching attendance:", error);
            return null;
        }
    },

    saveAttendance: async (attendanceData) => {
        try {
            // Check if record exists for this day/class to update instead of create new
            // This prevents duplicate records for same day
            const q = query(
                collection(db, 'attendance'),
                where('classId', '==', attendanceData.classId),
                where('date', '==', attendanceData.date) // Expecting 'date' in YYYY-MM-DD
            );

            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                // Extract Student IDs for Querying
                const studentIds = attendanceData.students ? attendanceData.students.map(s => s.id) : [];

                const docId = snapshot.docs[0].id;
                await setDoc(doc(db, 'attendance', docId), {
                    ...attendanceData,
                    studentIds,
                    updatedAt: new Date().toISOString()
                }, { merge: true });
                return { id: docId, success: true };
            } else {
                // Extract Student IDs for Querying
                const studentIds = attendanceData.students ? attendanceData.students.map(s => s.id) : [];

                const attendanceRef = doc(collection(db, 'attendance'));
                await setDoc(attendanceRef, {
                    ...attendanceData,
                    studentIds,
                    timestamp: new Date().toISOString()
                });
                return { id: attendanceRef.id, success: true };
            }
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

    // Get All Exams
    getExams: async () => {
        try {
            const q = query(collection(db, 'exams'), orderBy('date', 'asc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching exams:", error);
            return [];
        }
    },
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
    ,

    // Schedule Exam
    scheduleExam: async (examData) => {
        try {
            const examRef = doc(collection(db, 'exams'));
            const finalData = {
                id: examRef.id,
                ...examData,
                createdAt: new Date().toISOString()
            };
            await setDoc(examRef, finalData);
            return { success: true, id: examRef.id };
        } catch (error) {
            console.error("Error scheduling exam:", error);
            throw error;
        }
    }
};
