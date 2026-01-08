import AsyncStorage from '@react-native-async-storage/async-storage';
import { allocateSeatsLogic } from '../utils/seatAllocation';
import { studentStorageService } from './studentStorageService';
import { localDataService } from './localDataService';

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
            const savedProfile = await AsyncStorage.getItem('staff_profile');
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
            const stored = await AsyncStorage.getItem(`staff_${email.toLowerCase()}`);
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
            const existingStr = await AsyncStorage.getItem('staff_list');
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
            await AsyncStorage.setItem(`staff_${email}`, JSON.stringify(newStaff));

            // Update list
            const existingStr = await AsyncStorage.getItem('staff_list');
            const list = existingStr ? JSON.parse(existingStr) : [];

            // Remove if exists (update)
            const filteredList = list.filter(s => s.email.toLowerCase() !== email);
            filteredList.push(newStaff);

            await AsyncStorage.setItem('staff_list', JSON.stringify(filteredList));

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
            const existingStr = await AsyncStorage.getItem('staff_list');
            const list = existingStr ? JSON.parse(existingStr) : [];

            const index = list.findIndex(s => s.email.toLowerCase() === normalizedEmail);

            let updatedStaff;
            if (index >= 0) {
                // Dynamic update
                updatedStaff = { ...list[index], ...updates, updatedAt: new Date().toISOString() };
                list[index] = updatedStaff;
                await AsyncStorage.setItem('staff_list', JSON.stringify(list));
                await AsyncStorage.setItem(`staff_${normalizedEmail}`, JSON.stringify(updatedStaff));
            } else {
                // Check static
                const staticStaff = localDataService.getStaffByEmail(normalizedEmail);
                if (staticStaff) {
                    // Convert to dynamic
                    updatedStaff = { ...staticStaff, ...updates, updatedAt: new Date().toISOString() };
                    list.push(updatedStaff);
                    await AsyncStorage.setItem('staff_list', JSON.stringify(list));
                    await AsyncStorage.setItem(`staff_${normalizedEmail}`, JSON.stringify(updatedStaff));
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
            const existingStr = await AsyncStorage.getItem('staff_list');
            if (existingStr) {
                const list = JSON.parse(existingStr);
                const filtered = list.filter(s => s.email.toLowerCase() !== normalizedEmail);
                await AsyncStorage.setItem('staff_list', JSON.stringify(filtered));
            }

            // Remove detail
            await AsyncStorage.removeItem(`staff_${normalizedEmail}`);

            // Mark deleted for static (soft delete implementation if needed, checking deleted keys)
            await AsyncStorage.setItem(`staff_deleted_${normalizedEmail}`, 'true');

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
            console.log('Fetching all students locally for staff...');
            const programs = localDataService.getAvailablePrograms();
            let allStudents = [];

            for (const program of programs) {
                const years = ["1", "2"]; // Assuming 2 years for most PG
                for (const year of years) {
                    const students = localDataService.getStudents(program, year);
                    if (students) {
                        const hydrated = students.map(s => ({
                            ...s,
                            program,
                            year,
                            email: s.email || `${s.registerNumber.toLowerCase()}@pondiuni.ac.in`
                        }));
                        allStudents = [...allStudents, ...hydrated];
                    }
                }
            }

            // Apply Filters
            if (filters.program) {
                allStudents = allStudents.filter(s => s.program === filters.program);
            }
            if (filters.year) {
                allStudents = allStudents.filter(s => String(s.year) === String(filters.year));
            }

            return allStudents;
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
        // Save to AsyncStorage
        const key = `attendance_${date}_${subject}`;
        await AsyncStorage.setItem(key, JSON.stringify({ studentIds, status }));
        return { message: 'Attendance marked locally' };
    },

    // Timetable
    manageTimetable: async (timetableData) => {
        // Mock success, maybe save to AsyncStorage override
        const key = `timetable_${timetableData.program}_${timetableData.year}`;
        await AsyncStorage.setItem(key, JSON.stringify(timetableData));
        return { id: Date.now().toString(), ...timetableData };
    },

    // Exam management
    createExam: async (examData) => {
        const id = Date.now().toString();
        const exam = { id, ...examData, createdAt: new Date().toISOString() };

        // Save to local exams list
        const existing = await AsyncStorage.getItem('exams') || '[]';
        const exams = JSON.parse(existing);
        exams.push(exam);
        await AsyncStorage.setItem('exams', JSON.stringify(exams));

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
        const id = Date.now().toString();
        return { id, ...eventData };
    },

    // Get notices
    getNotices: async () => {
        return [
            { id: '1', title: "Internal Assessment", content: "Details...", createdAt: new Date().toISOString() }
        ];
    },

    // Get events
    getEvents: async () => {
        return [
            { id: '1', name: "Dept Fest", date: "2026-02-24" }
        ];
    }
};

