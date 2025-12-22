import { db } from './firebaseConfig';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, setDoc } from 'firebase/firestore';
import { allocateSeatsLogic } from '../utils/seatAllocation';

export const staffService = {
    // Get dashboard stats
    getDashboard: async (userId) => {
        // Fetch simplified stats
        return { assignedClasses: [], upcomingExams: [], recentNotices: [] };
    },

    // Student management
    getStudents: async (filters = {}) => {
        let q = collection(db, "students");
        // Apply filters if needed (requires composite indexes)
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    addStudent: async (studentData) => {
        // Add to 'students' collection
        const docRef = await addDoc(collection(db, "students"), {
            ...studentData,
            isActive: true,
            createdAt: new Date().toISOString()
        });
        return { id: docRef.id, ...studentData };
    },

    updateStudent: async (id, studentData) => {
        const docRef = doc(db, "students", id);
        await updateDoc(docRef, studentData);
        return { id, ...studentData };
    },

    deleteStudent: async (id) => {
        const docRef = doc(db, "students", id);
        await updateDoc(docRef, { isActive: false }); // Soft delete
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
    }
};
