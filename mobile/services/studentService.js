import { db } from './firebaseConfig';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, limit, setDoc } from 'firebase/firestore';
import { studentStorageService } from './studentStorageService';
import { getCollectionFromDisplayName } from '../utils/collectionMapper';

export const studentService = {
    // Get profile - searches across all collections
    getProfile: async (studentId) => {
        try {
            // Try the old students collection first (for backward compatibility)
            let docRef = doc(db, "students", studentId);
            let docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data();
            }
            
            // If not found, search in all student collections
            const collections = [
                'students_ug_btech_1', 'students_ug_btech_2', 'students_ug_btech_3', 'students_ug_btech_4',
                'students_ug_bsc_cs_1', 'students_ug_bsc_cs_2', 'students_ug_bsc_cs_3',
                'students_pg_msc_cs_1', 'students_pg_msc_cs_2',
                'students_pg_msc_ds_1',
                'students_pg_msc_cs_int_5', 'students_pg_msc_cs_int_6',
                'students_pg_mca_1', 'students_pg_mca_2',
                'students_pg_mtech_da_1',
                'students_pg_mtech_nis_2',
                'students_pg_mtech_cse_1', 'students_pg_mtech_cse_2',
            ];
            
            for (const collName of collections) {
                docRef = doc(db, collName, studentId);
                docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    return docSnap.data();
                }
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
        return null;
    },

    // Get timetable
    getTimetable: async (program, year) => {
        try {
            const q = query(
                collection(db, "timetables"),
                where("program", "==", program || "M.Sc. Computer Science"),
                where("year", "==", year || "I")
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                return snapshot.docs[0].data();
            }
        } catch (error) {
            console.error("Error fetching timetable:", error);
        }

        // Fallback to mock data if Firestore is empty/fails
        return {
            program: "M.Sc. Computer Science",
            year: "I",
            schedule: [
                {
                    day: "Monday",
                    slots: [
                        { startTime: "09:30 AM", endTime: "10:30 AM", subject: "Advanced Database Systems", type: "Lecture", faculty: { name: "DR SUKHVINDER SINGH" }, room: "SH310" },
                        { startTime: "10:30 AM", endTime: "11:30 AM", subject: "Advanced Database Systems", type: "Lecture", faculty: { name: "DR SUKHVINDER SINGH" }, room: "SH310" },
                        { startTime: "11:30 AM", endTime: "12:30 PM", subject: "Intro to A.I. & Expert Systems", type: "Softcore", faculty: { name: "Dr V UMA" }, room: "SH310" },
                        { startTime: "01:30 PM", endTime: "02:30 PM", subject: "Practical III - OS Lab", type: "Lab", faculty: { name: "Dr R SUNITHA" }, room: "Lab 1" },
                        { startTime: "02:30 PM", endTime: "03:30 PM", subject: "Practical III - OS Lab", type: "Lab", faculty: { name: "Dr R SUNITHA" }, room: "Lab 1" },
                        { startTime: "03:30 PM", endTime: "04:30 PM", subject: "Practical III - OS Lab", type: "Lab", faculty: { name: "Dr R SUNITHA" }, room: "Lab 1" },
                    ]
                },
                {
                    day: "Tuesday",
                    slots: [
                        { startTime: "09:30 AM", endTime: "10:30 AM", subject: "Modern Operating Systems", type: "Lecture", faculty: { name: "Dr R SUNITHA" }, room: "SH310" },
                        { startTime: "10:30 AM", endTime: "11:30 AM", subject: "Modern Operating Systems", type: "Lecture", faculty: { name: "Dr R SUNITHA" }, room: "SH310" },
                        { startTime: "11:30 AM", endTime: "12:30 PM", subject: "Optimization Techniques", type: "Lecture", faculty: { name: "Dr R SUBRAMANIAN" }, room: "SH310" },
                    ]
                },
                {
                    day: "Wednesday",
                    slots: [
                        { startTime: "09:30 AM", endTime: "11:30 AM", subject: "Advanced Database Systems", type: "Lecture", faculty: { name: "DR SUKHVINDER SINGH" }, room: "SH310" },
                        { startTime: "11:30 AM", endTime: "12:30 PM", subject: "Intro to A.I. & Expert Systems", type: "Softcore", faculty: { name: "Dr V UMA" }, room: "SH310" },
                        { startTime: "12:30 PM", endTime: "01:30 PM", subject: "Intro to A.I. & Expert Systems", type: "Softcore", faculty: { name: "Dr V UMA" }, room: "SH310" },
                    ]
                },
                {
                    day: "Thursday",
                    slots: [
                        { startTime: "09:30 AM", endTime: "12:30 PM", subject: "Practical IV - DB Lab", type: "Lab", faculty: { name: "DR SUKHVINDER SINGH" }, room: "Lab 2" },
                        { startTime: "02:30 PM", endTime: "04:30 PM", subject: "Social Network Analytics", type: "Softcore", faculty: { name: "Dr R SUNITHA" }, room: "SH310" },
                    ]
                },
                {
                    day: "Friday",
                    slots: [
                        { startTime: "10:30 AM", endTime: "11:30 AM", subject: "Modern Operating Systems", type: "Lecture", faculty: { name: "Dr R SUNITHA" }, room: "SH310" },
                        { startTime: "11:30 AM", endTime: "01:30 PM", subject: "Optimization Techniques", type: "Lecture", faculty: { name: "Dr R SUBRAMANIAN" }, room: "SH310" },
                    ]
                }
            ]
        };
    },

    // Get exams
    getExams: async (program, year) => {
        try {
            const q = query(
                collection(db, "exams"),
                orderBy("date", "asc")
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }
        } catch (error) {
            console.error("Error fetching exams:", error);
        }

        // Fallback mock
        return [
            { id: '1', subject: "Advanced Database Systems", date: "15 June 2026", time: "10:00 AM - 01:00 PM", venue: "Examination Hall A", course: "CSSC 422" },
            { id: '2', subject: "Modern Operating Systems", date: "18 June 2026", time: "10:00 AM - 01:00 PM", venue: "Examination Hall B", course: "CSSC 421" },
            { id: '3', subject: "Optimization Techniques", date: "21 June 2026", time: "10:00 AM - 01:00 PM", venue: "Examination Hall A", course: "CSSC 433" },
        ];
    },

    // Get notices
    getNotices: async (limitCount = 20) => {
        try {
            const q = query(
                collection(db, "notices"),
                orderBy("createdAt", "desc"),
                limit(limitCount)
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }
        } catch (error) {
            console.error("Error fetching notices:", error);
        }

        return [
            { category: "Academic", title: "Internal Assessment - II", content: "The second internal assessment for all PG programs will commence from July 1st.", date: "2 hours ago", isPriority: true, createdAt: new Date().toISOString() },
            { category: "Events", title: "Guest Lecture on Cloud Computing", content: "Expert talk by Industry Specialist on AWS & Azure ecosystems in Seminar Hall.", date: "Yesterday", isPriority: false, createdAt: new Date().toISOString() },
            { category: "Fees", title: "Semester Fee Deadline Extended", content: "The last date for payment of fees has been extended to June 30th with no fine.", date: "2 days ago", isPriority: false, createdAt: new Date().toISOString() },
        ];
    },

    // Get events
    getEvents: async () => {
        try {
            const q = query(
                collection(db, "events"),
                orderBy("date", "asc")
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }
        } catch (error) {
            console.error("Error fetching events:", error);
        }

        return [
            { name: "Inforia '25 - Dept Fest", date: "24-26 Feb 2026", location: "Auditorium" },
            { name: "Workshop on GenAI", date: "12 March 2026", location: "Lab 2" }
        ];
    },

    // Get attendance
    getAttendance: async () => {
        // Attendance logic usually requires specific student context
        return [
            { subject: "Modern Operating Systems", attended: 32, total: 36, color: "#4F46E5" },
            { subject: "Advanced Database Systems", attended: 28, total: 34, color: "#06B6D4" },
            { subject: "Optimization Techniques", attended: 15, total: 18, color: "#F59E0B" },
            { subject: "Social Network Analytics", attended: 22, total: 24, color: "#10B981" },
        ];
    },

    // Get students for directory - uses separate collections
    getStudentsByProgram: async (program, year) => {
        try {
            console.log("Fetching students - Program:", program, "Year:", year, "Type:", typeof year);
            
            // Ensure year is a number
            const yearNum = typeof year === 'string' ? parseInt(year, 10) : year;
            
            // Get the correct collection name
            const collectionName = getCollectionFromDisplayName(program, yearNum);
            console.log(`Using collection: ${collectionName}`);
            
            // First try local storage
            let students = await studentStorageService.filterStudents(program, yearNum);
            
            if (students.length > 0) {
                console.log(`Found ${students.length} students from local storage for ${program} Year ${yearNum}`);
                
                // Sync with Firestore in background
                try {
                    const q = query(collection(db, collectionName));
                    const snapshot = await getDocs(q);
                    const firestoreStudents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    
                    if (firestoreStudents.length > 0) {
                        await studentStorageService.addStudentsBulk(firestoreStudents);
                        // Return Firestore data if it's different
                        if (firestoreStudents.length !== students.length) {
                            return firestoreStudents;
                        }
                    }
                } catch (syncError) {
                    console.warn("Background sync failed, using local data:", syncError);
                }
                
                return students;
            }
            
            // If no local data, fetch from Firestore
            console.log(`No local data, fetching from Firestore collection: ${collectionName}`);
            const q = query(collection(db, collectionName));
            const snapshot = await getDocs(q);
            students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            console.log(`Found ${students.length} students from Firestore collection ${collectionName}`);
            
            // Also check old students collection for backward compatibility
            if (students.length === 0) {
                console.log("Checking old 'students' collection for backward compatibility...");
                try {
                    const oldQ = query(
                        collection(db, "students"),
                        where("program", "==", program),
                        where("year", "==", yearNum)
                    );
                    const oldSnapshot = await getDocs(oldQ);
                    students = oldSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    console.log(`Found ${students.length} students in old collection`);
                } catch (oldError) {
                    console.warn("Error checking old collection:", oldError);
                }
            }
            
            // Save to local storage for next time
            if (students.length > 0) {
                await studentStorageService.addStudentsBulk(students);
            }
            
            return students;
        } catch (error) {
            console.error("Error fetching students:", error);
            console.error("Error details:", error.message, error.code);
            
            // Fallback to local storage
            try {
                console.log("Attempting fallback: checking local storage...");
                const yearNum = typeof year === 'string' ? parseInt(year, 10) : year;
                const localStudents = await studentStorageService.filterStudents(program, yearNum);
                console.log(`Fallback found ${localStudents.length} students from local storage`);
                return localStudents;
            } catch (fallbackError) {
                console.error("Fallback also failed:", fallbackError);
                return [];
            }
        }
    },
    
    // Save student profile - saves to correct collection
    saveProfile: async (studentId, studentData) => {
        try {
            const { course, program, year } = studentData;
            const collectionName = getCollectionFromDisplayName(program, year);
            
            const docRef = doc(db, collectionName, studentId);
            await setDoc(docRef, studentData, { merge: true });
            
            // Also update local storage
            await studentStorageService.updateStudent(studentId, studentData);
            
            return true;
        } catch (error) {
            console.error("Error saving profile:", error);
            throw error;
        }
    }
};
