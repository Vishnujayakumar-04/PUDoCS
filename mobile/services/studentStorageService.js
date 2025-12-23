import AsyncStorage from '@react-native-async-storage/async-storage';

const STUDENTS_STORAGE_KEY = '@students_data';
const STUDENTS_LAST_SYNC_KEY = '@students_last_sync';

/**
 * Student Local Storage Service
 * Handles caching student data locally for offline access
 */

export const studentStorageService = {
    // Save all students to local storage
    saveStudents: async (students) => {
        try {
            const data = {
                students: students,
                lastSync: new Date().toISOString(),
            };
            await AsyncStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(data));
            await AsyncStorage.setItem(STUDENTS_LAST_SYNC_KEY, new Date().toISOString());
            console.log(`✓ Saved ${students.length} students to local storage`);
            return true;
        } catch (error) {
            console.error('Error saving students to local storage:', error);
            return false;
        }
    },

    // Get all students from local storage
    getStudents: async () => {
        try {
            const dataStr = await AsyncStorage.getItem(STUDENTS_STORAGE_KEY);
            if (dataStr) {
                const data = JSON.parse(dataStr);
                console.log(`✓ Retrieved ${data.students?.length || 0} students from local storage`);
                return data.students || [];
            }
            return [];
        } catch (error) {
            console.error('Error getting students from local storage:', error);
            return [];
        }
    },

    // Add a single student to local storage
    addStudent: async (student) => {
        try {
            const students = await studentStorageService.getStudents();
            // Check if student already exists (by registerNumber or id)
            const existingIndex = students.findIndex(
                s => s.registerNumber === student.registerNumber || 
                     s.id === student.id ||
                     (student.id && s.id === student.id)
            );
            
            if (existingIndex >= 0) {
                // Update existing student
                students[existingIndex] = { ...students[existingIndex], ...student };
            } else {
                // Add new student
                students.push(student);
            }
            
            await studentStorageService.saveStudents(students);
            console.log(`✓ Added/Updated student ${student.name} to local storage`);
            return true;
        } catch (error) {
            console.error('Error adding student to local storage:', error);
            return false;
        }
    },

    // Add multiple students to local storage
    addStudentsBulk: async (newStudents) => {
        try {
            const existingStudents = await studentStorageService.getStudents();
            const studentsMap = new Map();
            
            // Add existing students to map
            existingStudents.forEach(s => {
                const key = s.registerNumber || s.id;
                if (key) studentsMap.set(key, s);
            });
            
            // Add/update new students
            newStudents.forEach(student => {
                const key = student.registerNumber || student.id;
                if (key) {
                    studentsMap.set(key, { ...studentsMap.get(key), ...student });
                } else {
                    studentsMap.set(`temp_${Date.now()}_${Math.random()}`, student);
                }
            });
            
            const allStudents = Array.from(studentsMap.values());
            await studentStorageService.saveStudents(allStudents);
            console.log(`✓ Added/Updated ${newStudents.length} students to local storage`);
            return true;
        } catch (error) {
            console.error('Error bulk adding students to local storage:', error);
            return false;
        }
    },

    // Update a student in local storage
    updateStudent: async (studentId, updates) => {
        try {
            const students = await studentStorageService.getStudents();
            const index = students.findIndex(s => s.id === studentId || s.registerNumber === studentId);
            
            if (index >= 0) {
                students[index] = { ...students[index], ...updates };
                await studentStorageService.saveStudents(students);
                console.log(`✓ Updated student ${studentId} in local storage`);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating student in local storage:', error);
            return false;
        }
    },

    // Delete a student from local storage
    deleteStudent: async (studentId) => {
        try {
            const students = await studentStorageService.getStudents();
            const filtered = students.filter(s => s.id !== studentId && s.registerNumber !== studentId);
            await studentStorageService.saveStudents(filtered);
            console.log(`✓ Deleted student ${studentId} from local storage`);
            return true;
        } catch (error) {
            console.error('Error deleting student from local storage:', error);
            return false;
        }
    },

    // Clear all students from local storage
    clearStudents: async () => {
        try {
            await AsyncStorage.removeItem(STUDENTS_STORAGE_KEY);
            await AsyncStorage.removeItem(STUDENTS_LAST_SYNC_KEY);
            console.log('✓ Cleared students from local storage');
            return true;
        } catch (error) {
            console.error('Error clearing students from local storage:', error);
            return false;
        }
    },

    // Get last sync time
    getLastSync: async () => {
        try {
            const lastSync = await AsyncStorage.getItem(STUDENTS_LAST_SYNC_KEY);
            return lastSync ? new Date(lastSync) : null;
        } catch (error) {
            console.error('Error getting last sync time:', error);
            return null;
        }
    },

    // Filter students by program and year
    filterStudents: async (program, year) => {
        try {
            const students = await studentStorageService.getStudents();
            const yearNum = typeof year === 'string' ? parseInt(year, 10) : year;
            
            const filtered = students.filter(s => {
                const programMatch = s.program === program || s.program?.trim() === program?.trim();
                const yearMatch = s.year === yearNum || s.year === yearNum.toString() || parseInt(s.year) === yearNum;
                return programMatch && yearMatch && (s.isActive !== false); // Only active students
            });
            
            console.log(`✓ Filtered ${filtered.length} students from local storage (${program}, Year ${yearNum})`);
            return filtered;
        } catch (error) {
            console.error('Error filtering students from local storage:', error);
            return [];
        }
    },
};

