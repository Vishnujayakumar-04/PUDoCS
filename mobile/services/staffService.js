import { db } from './firebaseConfig';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, setDoc } from 'firebase/firestore';
import { allocateSeatsLogic } from '../utils/seatAllocation';
import { studentStorageService } from './studentStorageService';
import { getCollectionFromDisplayName, getAllStudentCollections, getStudentCollectionName } from '../utils/collectionMapper';

export const staffService = {
    // Get staff profile from 'users' collection (for authentication)
    getProfile: async (userId) => {
        try {
            const userDocRef = doc(db, "users", userId);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
                return userDoc.data();
            }
            return null;
        } catch (error) {
            console.error("Error fetching staff profile:", error);
            return null;
        }
    },

    // Get staff details from 'staff' collection
    getStaffDetails: async (email) => {
        try {
            const staffDocRef = doc(db, "staff", email.toLowerCase().trim());
            const staffDoc = await getDoc(staffDocRef);
            
            if (staffDoc.exists()) {
                return staffDoc.data();
            }
            return null;
        } catch (error) {
            console.error("Error fetching staff details:", error);
            return null;
        }
    },

    // Get all staff from 'staff' collection
    getAllStaff: async () => {
        try {
            const staffCollectionRef = collection(db, "staff");
            const staffSnapshot = await getDocs(staffCollectionRef);
            
            const allStaff = staffSnapshot.docs.map(docSnap => ({
                id: docSnap.id,
                ...docSnap.data(),
            }));

            // Return only active staff by default
            return allStaff.filter(staff => staff.isActive !== false);
        } catch (error) {
            console.error("Error fetching all staff:", error);
            return [];
        }
    },

    // Add a new staff member
    addStaff: async (staff) => {
        try {
            const email = staff.email?.toLowerCase().trim();
            if (!email) {
                throw new Error('Email is required for staff');
            }

            const now = new Date().toISOString();

            const staffPayload = {
                name: staff.name?.trim() || '',
                email,
                designation: staff.designation || '',
                department: staff.department || 'Computer Science',
                subjectsHandled: Array.isArray(staff.subjectsHandled) ? staff.subjectsHandled : [],
                courseCoordinator: staff.courseCoordinator || '',
                imageKey: staff.imageKey || null,
                photoPath: staff.photoPath || null,
                role: 'Staff',
                isActive: staff.isActive !== false,
                passwordChanged: staff.passwordChanged || false,
                createdAt: staff.createdAt || now,
                updatedAt: now,
            };

            const staffDocRef = doc(db, "staff", email);
            await setDoc(staffDocRef, staffPayload, { merge: true });

            return { id: email, ...staffPayload };
        } catch (error) {
            console.error("Error adding staff:", error);
            throw error;
        }
    },

    // Update existing staff member
    updateStaff: async (email, updates) => {
        try {
            const staffId = email?.toLowerCase().trim();
            if (!staffId) {
                throw new Error('Email is required to update staff');
            }

            const now = new Date().toISOString();

            const staffDocRef = doc(db, "staff", staffId);
            const payload = {
                ...updates,
                email: staffId,
                updatedAt: now,
            };

            await setDoc(staffDocRef, payload, { merge: true });
            return { id: staffId, ...payload };
        } catch (error) {
            console.error("Error updating staff:", error);
            throw error;
        }
    },

    // Soft delete staff member (mark as inactive)
    deleteStaff: async (email) => {
        try {
            const staffId = email?.toLowerCase().trim();
            if (!staffId) {
                throw new Error('Email is required to delete staff');
            }

            const staffDocRef = doc(db, "staff", staffId);
            await setDoc(staffDocRef, {
                isActive: false,
                updatedAt: new Date().toISOString(),
            }, { merge: true });

            return true;
        } catch (error) {
            console.error("Error deleting staff:", error);
            throw error;
        }
    },

    // Get dashboard stats
    getDashboard: async (userId) => {
        try {
            // Fetch upcoming exams
            const examsQuery = query(
                collection(db, "exams"),
                orderBy("date", "asc")
            );
            const examsSnapshot = await getDocs(examsQuery);
            const upcomingExams = examsSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(exam => {
                    const examDate = exam.date?.toDate ? exam.date.toDate() : new Date(exam.date);
                    return examDate >= new Date();
                })
                .slice(0, 5);

            // Fetch recent notices
            const noticesQuery = query(
                collection(db, "notices"),
                orderBy("createdAt", "desc")
            );
            const noticesSnapshot = await getDocs(noticesQuery);
            const recentNotices = noticesSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .slice(0, 5);

            return {
                assignedClasses: [], // Can be populated later if needed
                upcomingExams,
                recentNotices
            };
        } catch (error) {
            console.error('Error loading dashboard:', error);
            return { assignedClasses: [], upcomingExams: [], recentNotices: [] };
        }
    },

    // Student management - fetches from all collections
    getStudents: async (filters = {}) => {
        try {
            // First try to get from local storage
            let students = await studentStorageService.getStudents();
            
            // Ensure students is always an array
            if (!Array.isArray(students)) {
                console.warn('Students data is not an array, converting...');
                students = [];
            }
            
            // If local storage has data, use it (for faster access)
            if (students.length > 0) {
                console.log(`Using ${students.length} students from local storage`);
                
                // Apply filters if provided
                if (filters.course) {
                    students = students.filter(s => s.course === filters.course);
                }
                if (filters.program) {
                    students = students.filter(s => s.program === filters.program);
                }
                if (filters.year) {
                    const yearNum = typeof filters.year === 'string' ? parseInt(filters.year, 10) : filters.year;
                    students = students.filter(s => 
                        s.year === yearNum || s.year === yearNum.toString() || parseInt(s.year) === yearNum
                    );
                }
                if (filters.section) {
                    students = students.filter(s => s.section === filters.section);
                }
                
                // Also fetch from Firestore in background to sync
                getAllStudentCollections().forEach(async (collName) => {
                    try {
                        const snapshot = await getDocs(collection(db, collName));
                        const firestoreStudents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                        if (firestoreStudents.length > 0) {
                            await studentStorageService.addStudentsBulk(firestoreStudents);
                        }
                    } catch (err) {
                        console.error(`Background sync error for ${collName}:`, err);
                    }
                });
                
                return students;
            }
            
            // If no local data, fetch from all Firestore collections
            console.log('No local data, fetching from all Firestore collections...');
            const allStudents = [];
            const collections = getAllStudentCollections();
            
            for (const collName of collections) {
                try {
                    const snapshot = await getDocs(collection(db, collName));
                    const collStudents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    allStudents.push(...collStudents);
                } catch (error) {
                    console.error(`Error fetching from ${collName}:`, error);
                }
            }
            
            // Also check old students collection for backward compatibility
            try {
                const oldSnapshot = await getDocs(collection(db, "students"));
                const oldStudents = oldSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                allStudents.push(...oldStudents);
            } catch (oldError) {
                console.warn('Error checking old collection:', oldError);
            }
            
            // Ensure allStudents is always an array
            const safeFirestoreStudents = Array.isArray(allStudents) ? allStudents : [];
            
            // Save to local storage for next time
            if (safeFirestoreStudents.length > 0) {
                await studentStorageService.saveStudents(safeFirestoreStudents);
            }
            
            // Apply filters
            let filtered = safeFirestoreStudents;
            if (filters.course) {
                filtered = filtered.filter(s => s.course === filters.course);
            }
            if (filters.program) {
                filtered = filtered.filter(s => s.program === filters.program);
            }
            if (filters.year) {
                const yearNum = typeof filters.year === 'string' ? parseInt(filters.year, 10) : filters.year;
                filtered = filtered.filter(s => 
                    s.year === yearNum || s.year === yearNum.toString() || parseInt(s.year) === yearNum
                );
            }
            if (filters.section) {
                filtered = filtered.filter(s => s.section === filters.section);
            }
            
            // Ensure filtered is always an array
            return Array.isArray(filtered) ? filtered : [];
        } catch (error) {
            console.error('Error getting students:', error);
            // Fallback to local storage on error
            try {
                const fallbackStudents = await studentStorageService.getStudents();
                return Array.isArray(fallbackStudents) ? fallbackStudents : [];
            } catch (fallbackError) {
                console.error('Fallback error:', fallbackError);
                return []; // Return empty array as last resort
            }
        }
    },

    addStudent: async (studentData) => {
        try {
            const studentWithMeta = {
                ...studentData,
                isActive: true,
                createdAt: new Date().toISOString()
            };
            
            // Get the correct collection name
            const collectionName = getStudentCollectionName(
                studentData.course || 'PG',
                studentData.program || '',
                studentData.year || 1
            );
            
            // Use registerNumber as document ID if available
            const docId = studentData.registerNumber || studentData.id;
            let savedStudent;
            
            if (docId) {
                // Use setDoc with registerNumber as ID
                const docRef = doc(db, collectionName, docId);
                await setDoc(docRef, studentWithMeta, { merge: true });
                savedStudent = { id: docId, ...studentWithMeta };
            } else {
                // Fallback to addDoc if no registerNumber
                const docRef = await addDoc(collection(db, collectionName), studentWithMeta);
                savedStudent = { id: docRef.id, ...studentWithMeta };
            }
            
            // Also save to local storage
            await studentStorageService.addStudent(savedStudent);
            
            console.log(`✓ Student added to ${collectionName} and local storage: ${savedStudent.name}`);
            return savedStudent;
        } catch (error) {
            console.error('Error adding student:', error);
            throw error;
        }
    },

    // Bulk add students - saves to correct collections
    addStudentsBulk: async (studentsList) => {
        const results = [];
        const errors = [];
        
        for (const student of studentsList) {
            try {
                const studentData = {
                    ...student,
                    isActive: true,
                    createdAt: new Date().toISOString()
                };
                
                // Get the correct collection name
                const collectionName = getStudentCollectionName(
                    studentData.course || 'PG',
                    studentData.program || '',
                    studentData.year || 1
                );
                
                // Use registerNumber as document ID if available
                const docId = studentData.registerNumber || studentData.id;
                let savedStudent;
                
                if (docId) {
                    // Use setDoc with registerNumber as ID
                    const docRef = doc(db, collectionName, docId);
                    await setDoc(docRef, studentData, { merge: true });
                    savedStudent = { id: docId, ...studentData };
                } else {
                    // Fallback to addDoc if no registerNumber
                    const docRef = await addDoc(collection(db, collectionName), studentData);
                    savedStudent = { id: docRef.id, ...studentData };
                }
                
                results.push(savedStudent);
                
                // Also save to local storage
                await studentStorageService.addStudent(savedStudent);
            } catch (error) {
                errors.push({ student, error: error.message });
            }
        }
        
        // Sync all students to local storage after bulk add
        if (results.length > 0) {
            await studentStorageService.addStudentsBulk(results);
        }
        
        console.log(`✓ Bulk added ${results.length} students to correct collections and local storage`);
        return { success: results, errors };
    },

    updateStudent: async (id, studentData) => {
        try {
            // Determine the correct collection
            const collectionName = getStudentCollectionName(
                studentData.course || 'PG',
                studentData.program || '',
                studentData.year || 1
            );
            
            // Update in Firestore
            const docRef = doc(db, collectionName, id);
            await setDoc(docRef, studentData, { merge: true });
            const updatedStudent = { id, ...studentData };
            
            // Also update in local storage
            await studentStorageService.updateStudent(id, studentData);
            
            console.log(`✓ Student updated in ${collectionName} and local storage: ${id}`);
            return updatedStudent;
        } catch (error) {
            console.error('Error updating student:', error);
            throw error;
        }
    },

    deleteStudent: async (id) => {
        try {
            // Search across all collections to find the student
            const collections = getAllStudentCollections();
            let deleted = false;
            
            for (const collName of collections) {
                try {
                    const docRef = doc(db, collName, id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        // Soft delete
                        await updateDoc(docRef, { isActive: false });
                        deleted = true;
                        console.log(`✓ Student soft deleted from ${collName}: ${id}`);
                        break;
                    }
                } catch (error) {
                    // Continue searching other collections
                    continue;
                }
            }
            
            // Also check old students collection
            if (!deleted) {
                try {
                    const docRef = doc(db, "students", id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        await updateDoc(docRef, { isActive: false });
                        deleted = true;
                        console.log(`✓ Student soft deleted from old students collection: ${id}`);
                    }
                } catch (error) {
                    console.warn('Error checking old collection:', error);
                }
            }
            
            // Also update in local storage
            await studentStorageService.updateStudent(id, { isActive: false });
            
            if (deleted) {
                console.log(`✓ Student soft deleted from Firestore and local storage: ${id}`);
            } else {
                console.warn(`⚠️ Student not found in any collection: ${id}`);
            }
            
            return deleted;
        } catch (error) {
            console.error('Error deleting student:', error);
            throw error;
        }
    },

    // Attendance
    markAttendance: async ({ studentIds, date, subject, status }) => {
        // Batch update or efficient loop
        const promises = studentIds.map(async (id) => {
            const studentRef = doc(db, "students", id);
            const studentDoc = await getDoc(studentRef);
            if (studentDoc.exists()) {
                const currentAttendance = studentDoc.data().attendance || [];
                currentAttendance.push({ date, subject, status });
                await updateDoc(studentRef, { attendance: currentAttendance });
            }
        });
        await Promise.all(promises);
        return { message: 'Attendance marked' };
    },

    // Timetable
    manageTimetable: async (timetableData) => {
        const q = query(
            collection(db, "timetables"),
            where("program", "==", timetableData.program),
            where("year", "==", timetableData.year)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const docId = snapshot.docs[0].id;
            await updateDoc(doc(db, "timetables", docId), timetableData);
            return { id: docId, ...timetableData };
        } else {
            const docRef = await addDoc(collection(db, "timetables"), timetableData);
            return { id: docRef.id, ...timetableData };
        }
    },

    // Exam management
    createExam: async (examData) => {
        // 1. Fetch eligible students based on criteria
        const { course, program, year } = examData;
        const q = query(
            collection(db, "students"),
            where("course", "==", course),
            where("year", "==", year),
            where("isActive", "==", true)
        );
        const studentSnap = await getDocs(q);

        // Filter for fee payment (isExamEligible) - assuming structure has fees object
        const eligibleStudents = studentSnap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(s => s.fees && s.fees.semester && s.fees.exam);

        // 2. Save Exam with eligible list
        const examPayload = {
            ...examData,
            eligibleStudents: eligibleStudents.map(s => ({ id: s.id, name: s.name, registerNumber: s.registerNumber })),
            isSeatsAllocated: false,
            createdAt: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, "exams"), examPayload);
        return { id: docRef.id, ...examPayload };
    },

    allocateSeats: async (examId) => {
        // 1. Fetch Exam
        const examRef = doc(db, "exams", examId);
        const examSnap = await getDoc(examRef);
        if (!examSnap.exists()) throw new Error("Exam not found");
        const exam = examSnap.data();

        // 2. Fetch Classrooms
        const classSnap = await getDocs(collection(db, "classrooms"));
        const classrooms = classSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // 3. Run Logic (Client Side)
        const allocationResult = allocateSeatsLogic(exam.eligibleStudents, classrooms, examId);

        // 4. Update Exam
        await updateDoc(examRef, {
            hallAllocations: allocationResult.hallAllocations,
            isSeatsAllocated: true,
            updatedAt: new Date().toISOString()
        });

        return { ...exam, ...allocationResult, id: examId };
    },

    lockSeats: async (examId) => {
        const examRef = doc(db, "exams", examId);
        await updateDoc(examRef, { isSeatsLocked: true });
        return { id: examId, isSeatsLocked: true };
    },

    // Notices
    postNotice: async (noticeData) => {
        const docRef = await addDoc(collection(db, "notices"), {
            ...noticeData,
            createdAt: new Date().toISOString()
        });
        return { id: docRef.id, ...noticeData };
    },

    createEvent: async (eventData) => {
        const docRef = await addDoc(collection(db, "events"), {
            ...eventData,
            createdAt: new Date().toISOString()
        });
        return { id: docRef.id, ...eventData };
    },

    // Get notices
    getNotices: async () => {
        try {
            const noticesQuery = query(
                collection(db, "notices"),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(noticesQuery);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting notices:', error);
            return [];
        }
    },

    // Get events
    getEvents: async () => {
        try {
            const eventsQuery = query(
                collection(db, "events"),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(eventsQuery);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting events:', error);
            return [];
        }
    }
};
