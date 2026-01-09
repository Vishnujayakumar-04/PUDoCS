import { localDataService } from './localDataService';
import { studentStorageService } from './studentStorageService';

// Mock data for assets that might be missing
const ALUMNI_MEET_IMAGE = '/assets/Notice/Alumini meet.jpeg'; // Ensure this path exists or use a placeholder

export const staffService = {
    // Get staff profile (from local static data or auth)
    getProfile: async (userId, email) => {
        try {
            console.log('🔍 Getting staff profile for:', { userId, email });

            if (email) {
                const staff = localDataService.getStaffByEmail(email);
                if (staff) {
                    console.log('✅ Found staff profile locally:', staff.name);
                    return { ...staff, id: userId || email };
                }
            }

            // Fallback to local storage (e.g. newly registered staff)
            const savedProfile = localStorage.getItem('staff_profile');
            if (savedProfile) {
                const parsed = JSON.parse(savedProfile);
                if (parsed.email === email || parsed.id === userId) {
                    return parsed;
                }
            }

            return null;
        } catch (error) {
            console.error("Error fetching staff profile:", error);
            return null;
        }
    },

    // Get staff details
    getStaffDetails: async (email) => {
        try {
            const staff = localDataService.getStaffByEmail(email);
            if (staff) return staff;

            // Check dynamic storage
            const stored = localStorage.getItem(`staff_${email.toLowerCase()}`);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error("Error fetching staff details:", error);
            return null;
        }
    },

    // Get all staff (Static + Dynamic)
    getAllStaff: async () => {
        try {
            // Get static staff
            const staticStaff = localDataService.getAllStaff().map(s => ({ ...s, isStatic: true }));

            // Get dynamic staff list
            const existingStr = localStorage.getItem('staff_list');
            const dynamicStaff = existingStr ? JSON.parse(existingStr) : [];

            // Merge (dynamic overrides static if same email)
            const staffMap = new Map();

            // Add static first
            staticStaff.forEach(s => staffMap.set(s.email.toLowerCase(), s));

            // Add dynamic (overrides)
            dynamicStaff.forEach(s => staffMap.set(s.email.toLowerCase(), s));

            // Convert back to array
            return Array.from(staffMap.values());
        } catch (error) {
            console.error("Error fetching all staff:", error);
            const staticStaff = localDataService.getAllStaff();
            return staticStaff;
        }
    },

    // Add a new staff member (Local Storage)
    addStaff: async (staff) => {
        try {
            const email = staff.email?.toLowerCase().trim();
            if (!email) throw new Error('Email is required');

            const newStaff = { ...staff, email, createdAt: new Date().toISOString() };

            // Save details
            localStorage.setItem(`staff_${email}`, JSON.stringify(newStaff));

            // Update list
            const existingStr = localStorage.getItem('staff_list');
            const list = existingStr ? JSON.parse(existingStr) : [];

            // Remove if exists (update)
            const filteredList = list.filter(s => s.email.toLowerCase() !== email);
            filteredList.push(newStaff);

            localStorage.setItem('staff_list', JSON.stringify(filteredList));

            return newStaff;
        } catch (error) {
            console.error("Error adding staff:", error);
            throw error;
        }
    },

    // Update existing staff member
    updateStaff: async (email, updates) => {
        try {
            const normalizedEmail = email.toLowerCase().trim();
            // Try to find in dynamic list first
            const existingStr = localStorage.getItem('staff_list');
            const list = existingStr ? JSON.parse(existingStr) : [];

            const index = list.findIndex(s => s.email.toLowerCase() === normalizedEmail);

            let updatedStaff;
            if (index >= 0) {
                // Dynamic update
                updatedStaff = { ...list[index], ...updates, updatedAt: new Date().toISOString() };
                list[index] = updatedStaff;
                localStorage.setItem('staff_list', JSON.stringify(list));
                localStorage.setItem(`staff_${normalizedEmail}`, JSON.stringify(updatedStaff));
            } else {
                // Check static
                const staticStaff = localDataService.getStaffByEmail(normalizedEmail);
                if (staticStaff) {
                    // Convert to dynamic
                    updatedStaff = { ...staticStaff, ...updates, updatedAt: new Date().toISOString() };
                    list.push(updatedStaff);
                    localStorage.setItem('staff_list', JSON.stringify(list));
                    localStorage.setItem(`staff_${normalizedEmail}`, JSON.stringify(updatedStaff));
                } else {
                    throw new Error('Staff not found');
                }
            }
            return updatedStaff;
        } catch (error) {
            console.error("Error updating staff:", error);
            throw error;
        }
    },

    // Soft delete staff member
    deleteStaff: async (email) => {
        try {
            const normalizedEmail = email.toLowerCase().trim();

            // Remove from dynamic list
            const existingStr = localStorage.getItem('staff_list');
            if (existingStr) {
                const list = JSON.parse(existingStr);
                const filtered = list.filter(s => s.email.toLowerCase() !== normalizedEmail);
                localStorage.setItem('staff_list', JSON.stringify(filtered));
            }

            // Remove detail
            localStorage.removeItem(`staff_${normalizedEmail}`);

            // Mark deleted for static (soft delete implementation if needed, checking deleted keys)
            localStorage.setItem(`staff_deleted_${normalizedEmail}`, 'true');

            return true;
        } catch (error) {
            console.error("Error deleting staff:", error);
            throw error;
        }
    },

    // Get dashboard stats
    getDashboard: async (userId) => {
        return {
            assignedClasses: [],
            upcomingExams: [
                { id: '1', subject: "Advanced Database Systems", date: new Date(Date.now() + 86400000).toISOString() },
                { id: '2', subject: "Modern Operating Systems", date: new Date(Date.now() + 172800000).toISOString() }
            ],
            recentNotices: [
                { id: '1', title: "Internal Assessment", createdAt: new Date().toISOString() }
            ]
        };
    },

    // Student management - fetches from localDataService
    getStudents: async (filters = {}) => {
        try {
            console.log('Fetching students with filters:', filters);

            // 1. Get static students
            const programs = localDataService.getAvailablePrograms();
            let allStudents = [];

            for (const program of programs) {
                // Search up to 5 years (for integrated/BTech)
                const years = ["1", "2", "3", "4", "5", "6"];
                for (const year of years) {
                    const students = localDataService.getStudents(program, year);
                    if (students) {
                        const hydrated = students.map(s => ({
                            ...s,
                            id: s.registerNumber,
                            program,
                            year: parseInt(year),
                            isStatic: true,
                            email: s.email || `${s.registerNumber.toLowerCase()}@pondiuni.ac.in`
                        }));
                        allStudents = [...allStudents, ...hydrated];
                    }
                }
            }

            // 2. Get dynamic students (from localStorage via studentStorageService)
            const dynamicStudents = await studentStorageService.getStudents();

            // 3. Merge (dynamic overrides static)
            const studentMap = new Map();
            allStudents.forEach(s => studentMap.set(s.registerNumber, s));
            dynamicStudents.forEach(s => {
                const existing = studentMap.get(s.registerNumber);
                studentMap.set(s.registerNumber, { ...existing, ...s, isStatic: false });
            });

            let mergedStudents = Array.from(studentMap.values());

            // 4. Apply Filters
            if (filters.course) {
                mergedStudents = mergedStudents.filter(s => s.course === filters.course);
            }
            if (filters.program) {
                // Flexible matching for program names
                const searchProgram = filters.program.toLowerCase();
                mergedStudents = mergedStudents.filter(s =>
                    s.program?.toLowerCase().includes(searchProgram)
                );
            }
            if (filters.year) {
                mergedStudents = mergedStudents.filter(s => String(s.year) === String(filters.year));
            }

            // Only return active students by default
            return mergedStudents.filter(s => s.isActive !== false);
        } catch (error) {
            console.error('Error getting students:', error);
            return [];
        }
    },

    addStudent: async (studentData) => {
        // Delegate to studentStorageService for local persistence across app
        return studentStorageService.addStudent(studentData);
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
        // Save to localStorage
        const key = `attendance_${date}_${subject}`;
        localStorage.setItem(key, JSON.stringify({ studentIds, status }));
        return { message: 'Attendance marked locally' };
    },

    // Timetable
    manageTimetable: async (timetableData) => {
        // Mock success, maybe save to localStorage override
        const key = `timetable_${timetableData.program}_${timetableData.year}`;
        localStorage.setItem(key, JSON.stringify(timetableData));
        return { id: Date.now().toString(), ...timetableData };
    },

    // Exam management
    createExam: async (examData) => {
        const id = Date.now().toString();
        const exam = { id, ...examData, createdAt: new Date().toISOString() };

        // Save to local exams list
        const existing = localStorage.getItem('exams') || '[]';
        const exams = JSON.parse(existing);
        exams.push(exam);
        localStorage.setItem('exams', JSON.stringify(exams));

        return exam;
    },

    allocateSeats: async (examId) => {
        // Dummy allocation
        return { id: examId, isSeatsAllocated: true, hallAllocations: [] };
    },

    lockSeats: async (examId) => {
        return { id: examId, isSeatsLocked: true };
    },

    // Notices
    postNotice: async (noticeData) => {
        const id = Date.now().toString();
        return { id, ...noticeData };
    },

    createEvent: async (eventData) => {
        try {
            const event = {
                id: Date.now().toString(),
                ...eventData,
                createdAt: new Date().toISOString(),
                type: 'event'
            };

            // Save to localStorage (shared with all roles)
            const existingStr = localStorage.getItem('events');
            const events = existingStr ? JSON.parse(existingStr) : [];
            events.unshift(event);
            localStorage.setItem('events', JSON.stringify(events));
            return event;
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    },

    // Get notices
    getNotices: async () => {
        return [
            { id: '1', title: "Internal Assessment", content: "Details...", createdAt: new Date().toISOString() }
        ];
    },

    // Get events (shared from localStorage) – seeds Alumni Meet if missing
    getEvents: async () => {
        try {
            const existingStr = localStorage.getItem('events');
            let events = existingStr ? JSON.parse(existingStr) : [];

            const alreadySeeded = events.some(
                (e) => e.id === '1' || (e.name || e.title) === 'Alumni Meet 2026'
            );

            if (!alreadySeeded) {
                // For web, we can't require images like in React Native. Use a public URL or placeholder.
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
                    image: ALUMNI_MEET_IMAGE, // Use dummy or public path
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
    }
};
