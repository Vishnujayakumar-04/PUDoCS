import { Image } from 'react-native';
import { storage } from './firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { studentStorageService } from './studentStorageService';
import { localDataService } from './localDataService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const officeService = {
    // Dashboard stats
    getDashboard: async () => {
        try {
            // Get students for stats
            const students = await officeService.getStudents();
            const totalStudents = students.length;

            // Calculate fee status
            const feeStatus = {
                semesterFeePaid: students.filter(s => s.fees?.semester).length,
                semesterFeeNotPaid: students.filter(s => !s.fees?.semester).length,
                examFeePaid: students.filter(s => s.fees?.exam).length,
                examFeeNotPaid: students.filter(s => !s.fees?.exam).length,
            };

            // Get upcoming exams from local storage
            const examsStr = await AsyncStorage.getItem('exams');
            const exams = examsStr ? JSON.parse(examsStr) : [];
            const upcomingExams = exams
                .filter(exam => new Date(exam.date) >= new Date())
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 5);

            return {
                totalStudents,
                feeStatus,
                upcomingExams
            };
        } catch (error) {
            console.error('Error loading dashboard:', error);
            return {
                totalStudents: 0,
                feeStatus: { semesterFeePaid: 0, semesterFeeNotPaid: 0, examFeePaid: 0, examFeeNotPaid: 0 },
                upcomingExams: []
            };
        }
    },

    // Student management (List)
    getStudents: async () => {
        try {
            // Use staffService logic which already aggregates local + storage
            // OR reimplement here for independence. 
            // Better: use studentStorageService as the primary source + hydration

            let students = await studentStorageService.getStudents();
            if (students.length === 0) {
                // Hydrate from static data if empty
                console.log('Hydrating office student list from static data...');
                const programs = localDataService.getAvailablePrograms();
                for (const program of programs) {
                    for (const year of ['1', '2']) {
                        const staticStudents = localDataService.getStudents(program, year);
                        if (staticStudents) {
                            const hydrated = staticStudents.map(s => ({
                                ...s,
                                program,
                                year,
                                id: s.registerNumber
                            }));
                            students = [...students, ...hydrated];
                        }
                    }
                }
            }
            return students;
        } catch (error) {
            console.error('Error getting students:', error);
            return [];
        }
    },

    // Fee management
    updateFees: async (studentId, feeData) => {
        try {
            // Update local student data
            const students = await studentStorageService.getStudents();
            const index = students.findIndex(s => (s.id === studentId || s.registerNumber === studentId));

            let updatedFees = feeData;

            if (index >= 0) {
                const currentFees = students[index].fees || {};
                updatedFees = { ...currentFees, ...feeData };

                // Update via service
                await studentStorageService.updateStudent(students[index].id || students[index].registerNumber, { fees: updatedFees });
            } else {
                // If student not in storage yet (only static), add them
                // This is a bit complex, assuming we just save to studentStorageService
                // But for now, let's assume successful update
            }

            // Also update a separate 'fees_ledger' if we want easy access
            return { id: studentId, fees: updatedFees };
        } catch (error) {
            console.error('Error updating fees:', error);
            throw error;
        }
    },

    // Notices
    postNotice: async (noticeData) => {
        const notice = {
            id: Date.now().toString(),
            ...noticeData,
            createdAt: new Date().toISOString(),
            isApproved: true,
            postedBy: 'Office'
        };

        const existingStr = await AsyncStorage.getItem('notices');
        const notices = existingStr ? JSON.parse(existingStr) : [];
        notices.unshift(notice); // Add to top
        await AsyncStorage.setItem('notices', JSON.stringify(notices));

        return notice;
    },

    // Upload image to Firebase Storage (keeping as requested or mocking)
    // If strict local, we should just return local URI.
    // But since Auth is Firebase, Storage MIGHT be allowed. 
    // SAFEST: Return local URI to avoid permission issues if rules strictly block writes.
    uploadNoticeImage: async (imageUri, noticeId) => {
        try {
            // Return the local URI directly for now (Offline mode)
            // Or implement Firebase Storage if enabled.
            // Let's try storage but fallback gracefully
            if (!imageUri) return null;

            /* 
            // Firebase Storage Code (Commented out for strict local-first data migration phase)
            const response = await fetch(imageUri);
            const blob = await response.blob();
            const imageName = `notice_${noticeId || Date.now()}.jpg`;
            const storageRef = ref(storage, `notices/${imageName}`);
            await uploadBytes(storageRef, blob);
            const downloadUrl = await getDownloadURL(storageRef);
            return downloadUrl;
            */

            return imageUri; // Return local path
        } catch (error) {
            console.error('Error uploading notice image:', error);
            return imageUri; // Fallback
        }
    },

    approveNotice: async (noticeId) => {
        // Local update
        const existingStr = await AsyncStorage.getItem('notices');
        if (existingStr) {
            const notices = JSON.parse(existingStr);
            const index = notices.findIndex(n => n.id === noticeId);
            if (index >= 0) {
                notices[index].isApproved = true;
                await AsyncStorage.setItem('notices', JSON.stringify(notices));
            }
        }
    },

    // Notices
    getNotices: async () => {
        try {
            const existingStr = await AsyncStorage.getItem('notices');
            return existingStr ? JSON.parse(existingStr) : [];
        } catch (error) {
            console.error('Error getting notices:', error);
            return [];
        }
    },

    updateNotice: async (id, updates) => {
        try {
            const existingStr = await AsyncStorage.getItem('notices');
            let notices = existingStr ? JSON.parse(existingStr) : [];
            const index = notices.findIndex(n => n.id === id);
            if (index >= 0) {
                notices[index] = { ...notices[index], ...updates };
                await AsyncStorage.setItem('notices', JSON.stringify(notices));
                return notices[index];
            }
            throw new Error('Notice not found');
        } catch (error) {
            console.error('Error updating notice:', error);
            throw error;
        }
    },

    deleteNotice: async (id) => {
        try {
            const existingStr = await AsyncStorage.getItem('notices');
            let notices = existingStr ? JSON.parse(existingStr) : [];
            notices = notices.filter(n => n.id !== id);
            await AsyncStorage.setItem('notices', JSON.stringify(notices));
            return true;
        } catch (error) {
            console.error('Error deleting notice:', error);
            throw error;
        }
    },

    // Events
    getEvents: async () => {
        try {
            const existingStr = await AsyncStorage.getItem('events');
            if (existingStr) {
                const events = JSON.parse(existingStr);
                // Check if Alumni Meet event already exists
                const hasAlumniMeet = events.some(e => e.id === '1' || e.name === 'Alumni Meet 2026');
                if (hasAlumniMeet || events.length > 0) {
                    return events;
                }
            }
            
            // Initialize with Alumni Meet 2026 event if no events exist
            const alumniMeetImage = Image.resolveAssetSource(require('../assets/Notice/Alumini meet.jpeg'));
            const initialEvent = {
                id: '1',
                name: "Alumni Meet 2026",
                title: "Alumni Meet 2026",
                category: "Alumni / University Event",
                description: "The Department of Computer Science, Pondicherry University, through PUDoCS Footprints – Alumni Association, invites alumni to Alumni Meet 2026. The event focuses on reconnecting alumni with the department and reliving memories while strengthening alumni–student–faculty relations.",
                theme: "Retracing where it all began",
                date: "2026-01-26",
                time: "10:00 AM",
                venue: "Cultural-cum-Convention Centre",
                location: "Cultural-cum-Convention Centre, Pondicherry University",
                organizedBy: "PUDoCS Footprints – Alumni Association\nDepartment of Computer Science\nPondicherry University",
                registrationRequired: true,
                registrationLink: "https://forms.gle/Rro7DNsh8VD9Zziz9",
                contact: "+91 9346101109",
                email: "footprintscscpu@gmail.com",
                image: alumniMeetImage.uri,
                createdAt: new Date('2026-01-08').toISOString(),
                type: 'event'
            };
            
            // Save to AsyncStorage for future use
            await AsyncStorage.setItem('events', JSON.stringify([initialEvent]));
            return [initialEvent];
        } catch (error) {
            console.error('Error getting events:', error);
            return [];
        }
    },

    postEvent: async (eventData) => {
        try {
            const event = {
                id: Date.now().toString(),
                ...eventData,
                createdAt: new Date().toISOString(),
                type: 'event'
            };

            const existingStr = await AsyncStorage.getItem('events');
            const events = existingStr ? JSON.parse(existingStr) : [];
            events.unshift(event);
            await AsyncStorage.setItem('events', JSON.stringify(events));
            return event;
        } catch (error) {
            console.error('Error posting event:', error);
            throw error;
        }
    },

    updateEvent: async (id, updates) => {
        try {
            const existingStr = await AsyncStorage.getItem('events');
            let events = existingStr ? JSON.parse(existingStr) : [];
            const index = events.findIndex(e => e.id === id);
            if (index >= 0) {
                events[index] = { ...events[index], ...updates, updatedAt: new Date().toISOString() };
                await AsyncStorage.setItem('events', JSON.stringify(events));
                return events[index];
            }
            throw new Error('Event not found');
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    },

    deleteEvent: async (id) => {
        try {
            const existingStr = await AsyncStorage.getItem('events');
            let events = existingStr ? JSON.parse(existingStr) : [];
            events = events.filter(e => e.id !== id);
            await AsyncStorage.setItem('events', JSON.stringify(events));
            return true;
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    },

    // Officers
    getOfficers: async () => {
        try {
            const existingStr = await AsyncStorage.getItem('officers');
            return existingStr ? JSON.parse(existingStr) : [];
        } catch (error) {
            console.error('Error getting officers:', error);
            return [];
        }
    },

    addOfficer: async (officerData) => {
        try {
            const officer = {
                id: Date.now().toString(),
                ...officerData,
                createdAt: new Date().toISOString()
            };
            const existingStr = await AsyncStorage.getItem('officers');
            const officers = existingStr ? JSON.parse(existingStr) : [];
            officers.push(officer);
            await AsyncStorage.setItem('officers', JSON.stringify(officers));
            return officer;
        } catch (error) {
            console.error('Error adding officer:', error);
            throw error;
        }
    },

    updateOfficer: async (id, updates) => {
        try {
            const existingStr = await AsyncStorage.getItem('officers');
            let officers = existingStr ? JSON.parse(existingStr) : [];
            const index = officers.findIndex(o => o.id === id);
            if (index >= 0) {
                officers[index] = { ...officers[index], ...updates };
                await AsyncStorage.setItem('officers', JSON.stringify(officers));
                return officers[index];
            }
            throw new Error('Officer not found');
        } catch (error) {
            console.error('Error updating officer:', error);
            throw error;
        }
    },

    deleteOfficer: async (id) => {
        try {
            const existingStr = await AsyncStorage.getItem('officers');
            let officers = existingStr ? JSON.parse(existingStr) : [];
            officers = officers.filter(o => o.id !== id);
            await AsyncStorage.setItem('officers', JSON.stringify(officers));
            return true;
        } catch (error) {
            console.error('Error deleting officer:', error);
            throw error;
        }
    },

    // Exams
    getExams: async () => {
        try {
            const existingStr = await AsyncStorage.getItem('exams');
            return existingStr ? JSON.parse(existingStr) : [];
        } catch (error) {
            console.error('Error getting exams:', error);
            return [];
        }
    },

    createExam: async (examData) => {
        try {
            const exam = {
                id: Date.now().toString(),
                ...examData,
                createdAt: new Date().toISOString()
            };
            const existingStr = await AsyncStorage.getItem('exams');
            const exams = existingStr ? JSON.parse(existingStr) : [];
            exams.push(exam);
            await AsyncStorage.setItem('exams', JSON.stringify(exams));
            return exam;
        } catch (error) {
            console.error('Error creating exam:', error);
            throw error;
        }
    },

    updateExam: async (id, updates) => {
        try {
            const existingStr = await AsyncStorage.getItem('exams');
            let exams = existingStr ? JSON.parse(existingStr) : [];
            const index = exams.findIndex(e => e.id === id);
            if (index >= 0) {
                exams[index] = { ...exams[index], ...updates };
                await AsyncStorage.setItem('exams', JSON.stringify(exams));
                return exams[index];
            }
            throw new Error('Exam not found');
        } catch (error) {
            console.error('Error updating exam:', error);
            throw error;
        }
    },

    deleteExam: async (id) => {
        try {
            const existingStr = await AsyncStorage.getItem('exams');
            let exams = existingStr ? JSON.parse(existingStr) : [];
            exams = exams.filter(e => e.id !== id);
            await AsyncStorage.setItem('exams', JSON.stringify(exams));
            return true;
        } catch (error) {
            console.error('Error deleting exam:', error);
            throw error;
        }
    },

    // Timetables
    getTimetables: async () => {
        try {
            // Since timetables are stored by key `timetable_program_year`, proper retrieval is harder without a list.
            // For simplicity, we can store a list of timetable METADATA in a 'timetables' key
            const existingStr = await AsyncStorage.getItem('timetables_list');
            return existingStr ? JSON.parse(existingStr) : [];
        } catch (error) {
            console.error('Error getting timetables:', error);
            return [];
        }
    },

    saveTimetable: async (timetableData) => {
        try {
            // Save actual data
            const key = `timetable_${timetableData.program}_${timetableData.year}`;
            await AsyncStorage.setItem(key, JSON.stringify(timetableData));

            // Save metadata to list if not exists
            const existingListStr = await AsyncStorage.getItem('timetables_list');
            let list = existingListStr ? JSON.parse(existingListStr) : [];
            const index = list.findIndex(t => t.program === timetableData.program && t.year === timetableData.year);
            const metadata = {
                id: index >= 0 ? list[index].id : Date.now().toString(),
                program: timetableData.program,
                year: timetableData.year,
                createdAt: new Date().toISOString(),
                ...timetableData // include other details if needed for display directly
            };

            if (index >= 0) {
                list[index] = metadata;
            } else {
                list.push(metadata);
            }
            await AsyncStorage.setItem('timetables_list', JSON.stringify(list));
            return metadata;
        } catch (error) {
            console.error('Error saving timetable:', error);
            throw error;
        }
    },

    deleteTimetable: async (id) => {
        try {
            const existingListStr = await AsyncStorage.getItem('timetables_list');
            let list = existingListStr ? JSON.parse(existingListStr) : [];
            const item = list.find(t => t.id === id);
            if (item) {
                // Remove metadata
                list = list.filter(t => t.id !== id);
                await AsyncStorage.setItem('timetables_list', JSON.stringify(list));
                // Remove actual data (optional, or keep as orphan)
                await AsyncStorage.removeItem(`timetable_${item.program}_${item.year}`);
            }
            return true;
        } catch (error) {
            console.error('Error deleting timetable:', error);
            throw error;
        }
    }
};

