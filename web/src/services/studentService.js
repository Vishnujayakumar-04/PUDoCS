
import { studentStorageService } from './studentStorageService';
import { localDataService } from './localDataService';

export const studentService = {
    // Get profile - searches local data by email or registerNumber
    getProfile: async (studentId, email = null) => {
        try {
            console.log('🔍 Getting profile for:', { studentId, email });

            // 1. Check local storage (localStorage) for the currently logged-in user's profile
            const savedProfile = localStorage.getItem('user_profile');
            if (savedProfile) {
                const parsed = JSON.parse(savedProfile);
                if (parsed.email === email || parsed.id === studentId) {
                    console.log('✅ Found profile in localStorage:', parsed.name);
                    return parsed;
                }
            }

            // 2. Fallback: Search in our static local data
            if (email) {
                const student = localDataService.getStudentByEmail(email);
                if (student) {
                    console.log('✅ Found static profile:', student.name);
                    return {
                        ...student,
                        email: student.email || `${student.registerNumber.toLowerCase()}@pondiuni.ac.in`,
                    };
                }
            }

            console.warn('⚠️ Profile not found for:', email);
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

            // Check localStorage fallback
            const storageKey = `timetable_${program}_${year}`;
            const stored = localStorage.getItem(storageKey);
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

    // Get events (shared from localStorage)
    getEvents: async () => {
        try {
            const existingStr = localStorage.getItem('events');
            let events = existingStr ? JSON.parse(existingStr) : [];

            // Seed Alumni Meet once if no events present
            const alreadySeeded = events.some(
                (e) => e.id === '1' || (e.name || e.title) === 'Alumni Meet 2026'
            );

            if (!alreadySeeded) {
                // In web we don't handle local asset require the same way. 
                // We'll skip image seeding or use a placeholder URL.

                const initialEvent = {
                    id: '1',
                    name: 'Alumni Meet 2026',
                    title: 'Alumni Meet 2026',
                    category: 'Alumni / University Event',
                    description:
                        'The Department of Computer Science, Pondicherry University, through PUDoCS Footprints – Alumni Association, invites alumni to Alumni Meet 2026. The event focuses on reconnecting alumni with the department and reliving memories while strengthening alumni–student–faculty relations.',
                    theme: 'Retracing where it all began',
                    date: '2026-01-26',
                    time: '10:00 AM',
                    venue: 'Cultural-cum-Convention Centre',
                    location: 'Cultural-cum-Convention Centre, Pondicherry University',
                    organizedBy:
                        'PUDoCS Footprints – Alumni Association\nDepartment of Computer Science\nPondicherry University',
                    registrationRequired: true,
                    registrationLink: 'https://forms.gle/Rro7DNsh8VD9Zziz9',
                    contact: '+91 9346101109',
                    email: 'footprintscscpu@gmail.com',
                    image: null, // Placeholder or URL
                    createdAt: new Date('2026-01-08').toISOString(),
                    type: 'event',
                };

                events = [initialEvent, ...events];
                localStorage.setItem('events', JSON.stringify(events));
            }

            return events;
        } catch (error) {
            console.error('Error getting events:', error);
            return [];
        }
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

            // Get static students from local service (JSON)
            const staticStudents = localDataService.getStudents(program, year) || [];

            // Get dynamic students from storage (User uploads, etc.)
            const dynamicStudents = await studentStorageService.getStudents();
            const dynamicMap = new Map();
            dynamicStudents.forEach(s => {
                if (s.registerNumber) dynamicMap.set(s.registerNumber, s);
            });

            // Map and merge
            const mergedStudents = staticStudents.map(s => {
                const dynamic = dynamicMap.get(s.registerNumber);
                return {
                    ...s,
                    ...(dynamic || {}), // Priority to dynamic data (e.g. photoUrl)
                    program,
                    year,
                    email: s.email || dynamic?.email || `${s.registerNumber.toLowerCase()}@pondiuni.ac.in`
                };
            });

            console.log(`✅ Returned ${mergedStudents.length} merged students`);
            return mergedStudents;
        } catch (error) {
            console.error("Error fetching students:", error);
            return [];
        }
    },

    // Save student profile - saves to localStorage only
    saveProfile: async (studentId, studentData) => {
        try {
            // Save to local storage
            localStorage.setItem('user_profile', JSON.stringify(studentData));
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

            // In a real local-first app, we'd append this to a list in localStorage
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
            // In a real local app, save to localStorage list
            return { id: Date.now().toString(), ...complaintData };
        } catch (error) {
            console.error('Error submitting complaint:', error);
            throw error;
        }
    }
};
