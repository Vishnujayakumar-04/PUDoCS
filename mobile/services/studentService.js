import { db } from './firebaseConfig';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export const studentService = {
    // Get profile
    getProfile: async (studentId) => {
        try {
            const docRef = doc(db, "students", studentId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data();
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

    // Get students for directory
    getStudentsByProgram: async (program, year) => {
        try {
            const q = query(
                collection(db, "students"),
                where("program", "==", program),
                where("academicYear", "==", year)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching students:", error);
            return [];
        }
    }
};
