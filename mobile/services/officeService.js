import { db } from './firebaseConfig';
import { collection, doc, getDocs, updateDoc, addDoc, query, where, orderBy } from 'firebase/firestore';

export const officeService = {
    // Dashboard stats
    getDashboard: async () => {
        // Calculate stats client side or maintain counters
        return { totalStudents: 0, feesPending: 0 };
    },

    // Student management (List)
    getStudents: async () => {
        const snapshot = await getDocs(collection(db, "students"));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // Fee management
    updateFees: async (studentId, feeData) => {
        // feeData: { semester: true, exam: true }
        const studentRef = doc(db, "students", studentId);
        await updateDoc(studentRef, { fees: feeData });
        return { id: studentId, fees: feeData };
    },

    // Exam eligibility report
    getExamEligibility: async () => {
        // Fetch students where fees are paid
        // Note: Firestore query limitations might require client-side filtering 
        // if asking for "fees.semester == true" AND "fees.exam == true"
        const snapshot = await getDocs(collection(db, "students"));
        const students = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        return students.filter(s => s.fees && s.fees.semester && s.fees.exam);
    },

    // Notices
    postNotice: async (noticeData) => {
        await addDoc(collection(db, "notices"), {
            ...noticeData,
            createdAt: new Date().toISOString(),
            isApproved: true // Office notices are auto-approved
        });
    },

    approveNotice: async (noticeId) => {
        const noticeRef = doc(db, "notices", noticeId);
        await updateDoc(noticeRef, { isApproved: true });
    }
};
