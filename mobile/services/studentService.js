import api from './api';

export const studentService = {
    // Get student profile
    getProfile: async () => {
        const response = await api.get('/student/profile');
        return response.data;
    },

    // Get timetable
    getTimetable: async () => {
        const response = await api.get('/student/timetable');
        return response.data;
    },

    // Get notices
    getNotices: async () => {
        const response = await api.get('/student/notices');
        return response.data;
    },

    // Get exams
    getExams: async () => {
        const response = await api.get('/student/exams');
        return response.data;
    },

    // Get events
    getEvents: async () => {
        const response = await api.get('/student/events');
        return response.data;
    },

    // Get letter formats
    getLetterFormats: async () => {
        const response = await api.get('/student/letter-formats');
        return response.data;
    },

    // Get results
    getResults: async () => {
        const response = await api.get('/student/results');
        return response.data;
    },

    // Get staff directory
    getStaff: async () => {
        const response = await api.get('/student/staff');
        return response.data;
    },

    // Get attendance
    getAttendance: async () => {
        const response = await api.get('/student/attendance');
        return response.data;
    },
};
