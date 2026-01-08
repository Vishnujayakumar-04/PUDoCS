import AsyncStorage from '@react-native-async-storage/async-storage';
import { studentStorageService } from './studentStorageService';
import { localDataService } from './localDataService';

export const studentService = {
    // Get profile - searches local data by email or registerNumber
    getProfile: async (studentId, email = null) => {
        try {
            console.log('🔍 Getting profile for:', { studentId, email });

            // If we have an email, search in our local static data
            if (email) {
                const programs = localDataService.getAvailablePrograms();
                for (const program of programs) {
                    // Search in both 1st and 2nd year (and others if available)
                    const years = ["1", "2", "I", "II"];
                    for (const year of years) {
                        const students = localDataService.getStudents(program, year);

                        // Find by email (case insensitive)
                        const student = students.find(s =>
                            (s.email && s.email.toLowerCase() === email.toLowerCase()) ||
                            // Construct email if not present
                            (`${s.registerNumber.toLowerCase()}@pondiuni.ac.in` === email.toLowerCase())
                        );

                        if (student) {
                            console.log('✅ Found profile locally:', student.name);
                            return {
                                ...student,
                                email: student.email || `${student.registerNumber.toLowerCase()}@pondiuni.ac.in`,
                                program: program,
                                year: year
                            };
                        }
                    }
                }
            }

            // Fallback: Check local storage (AsyncStorage) for any saved profile
            // This handles cases where we might have saved a profile manually
            const savedProfile = await AsyncStorage.getItem('user_profile');
            if (savedProfile) {
                const parsed = JSON.parse(savedProfile);
                if (parsed.email === email || parsed.id === studentId) {
                    return parsed;
                }
            }

            console.warn('⚠️ Profile not found locally for:', email);
            return null;
        } catch (error) {
            console.error("Error fetching profile:", error);
            return null;
        }
    },

    // Get timetable - fetches from local static data
    getTimetable: async (program, year, forceRefresh = false) => {
        try {
            // Check local static data
            const timetable = localDataService.getTimetable(program, year);

            if (timetable) {
                console.log('✅ Found local timetable for:', program, year);
                return timetable;
            }

            // Check AsyncStorage fallback
            const storageKey = `timetable_${program}_${year}`;
            const stored = await AsyncStorage.getItem(storageKey);
            if (stored) return JSON.parse(stored);

            console.warn('⚠️ No timetable found for:', program, year);
            return null;
        } catch (error) {
            console.error("Error fetching timetable:", error);
            return null;
        }
    },

    // Get exams (Mock data for now as exams are usually dynamic, preventing Firestore call)
    getExams: async (program, year) => {
        return [
            { id: '1', subject: "Advanced Database Systems", date: "15 June 2026", time: "10:00 AM - 01:00 PM", venue: "Examination Hall A", course: "CSSC 422" },
            { id: '2', subject: "Modern Operating Systems", date: "18 June 2026", time: "10:00 AM - 01:00 PM", venue: "Examination Hall B", course: "CSSC 421" },
            { id: '3', subject: "Optimization Techniques", date: "21 June 2026", time: "10:00 AM - 01:00 PM", venue: "Examination Hall A", course: "CSSC 433" },
        ];
    },

    // Get notices (Mock data)
    getNotices: async (limitCount = 20) => {
        return [
            { category: "Academic", title: "Internal Assessment - II", content: "The second internal assessment for all PG programs will commence from July 1st.", date: "2 hours ago", isPriority: true, createdAt: new Date().toISOString() },
            { category: "Events", title: "Guest Lecture on Cloud Computing", content: "Expert talk by Industry Specialist on AWS & Azure ecosystems in Seminar Hall.", date: "Yesterday", isPriority: false, createdAt: new Date().toISOString() },
            { category: "Fees", title: "Semester Fee Deadline Extended", content: "The last date for payment of fees has been extended to June 30th with no fine.", date: "2 days ago", isPriority: false, createdAt: new Date().toISOString() },
        ];
    },

    // Get events (Mock data)
    getEvents: async () => {
        return [
            { name: "Inforia '25 - Dept Fest", date: "24-26 Feb 2026", location: "Auditorium" },
            { name: "Workshop on GenAI", date: "12 March 2026", location: "Lab 2" }
        ];
    },

    // Get attendance (Mock data)
    getAttendance: async () => {
        return [
            { subject: "Modern Operating Systems", attended: 32, total: 36, color: "#4F46E5" },
            { subject: "Advanced Database Systems", attended: 28, total: 34, color: "#06B6D4" },
            { subject: "Optimization Techniques", attended: 15, total: 18, color: "#F59E0B" },
            { subject: "Social Network Analytics", attended: 22, total: 24, color: "#10B981" },
        ];
    },

    // Get students for directory - uses local static data
    getStudentsByProgram: async (program, year) => {
        try {
            console.log("Fetching students - Program:", program, "Year:", year);

            // Get from local service
            const students = localDataService.getStudents(program, year);

            if (students && students.length > 0) {
                console.log(`✅ Found ${students.length} students locally`);

                // Hydrate students with default fields if missing
                return students.map(s => ({
                    ...s,
                    program,
                    year,
                    email: s.email || `${s.registerNumber.toLowerCase()}@pondiuni.ac.in`
                }));
            }

            return [];
        } catch (error) {
            console.error("Error fetching students:", error);
            return [];
        }
    },

    // Save student profile - saves to AsyncStorage only
    saveProfile: async (studentId, studentData) => {
        try {
            // Save to local storage
            await AsyncStorage.setItem('user_profile', JSON.stringify(studentData));
            // Also update in studentStorageService for directory consistency
            await studentStorageService.updateStudent(studentId, studentData);

            console.log('✅ Profile saved locally');
            return true;
        } catch (error) {
            console.error("Error saving profile locally:", error);
            throw error;
        }
    },

    // Request a letter/certificate (Store locally for now)
    requestLetter: async (studentId, type, purpose) => {
        try {
            const letterRequest = {
                id: Date.now().toString(),
                studentId,
                type,
                purpose: purpose || '',
                status: 'Pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            // In a real local-first app, we'd append this to a list in AsyncStorage
            return letterRequest;
        } catch (error) {
            console.error("Error requesting letter:", error);
            throw error;
        }
    },

    // Get letter requests 
    getLetterRequests: async (studentId) => {
        return [];
    },

    // Get student results (Mock)
    getResults: async (studentId) => {
        return {
            semesters: [],
            cgpa: 0.00,
        };
    },

    // Get internal marks (Mock)
    getInternalMarks: async (studentId, email = null) => {
        return [];
    },

    // Get assignment marks (Mock)
    getAssignmentMarks: async (studentId, email = null) => {
        return [];
    },

    // Submit complaint (Mock)
    submitComplaint: async (complaintData) => {
        try {
            console.log('📝 Mock submitting complaint:', complaintData);
            // In a real local app, save to AsyncStorage list
            return { id: Date.now().toString(), ...complaintData };
        } catch (error) {
            console.error('Error submitting complaint:', error);
            throw error;
        }
    }
};
