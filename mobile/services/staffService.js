import api from './api';

export const staffService = {
    // Get dashboard
    getDashboard: async () => {
        const response = await api.get('/staff/dashboard');
        return response.data;
    },

    // Student management
    getStudents: async (params) => {
        const response = await api.get('/staff/students', { params });
        return response.data;
    },

    addStudent: async (studentData) => {
        const response = await api.post('/staff/students', studentData);
        return response.data;
    },

    updateStudent: async (id, studentData) => {
        const response = await api.put(`/staff/students/${id}`, studentData);
        return response.data;
    },

    deleteStudent: async (id) => {
        const response = await api.delete(`/staff/students/${id}`);
        return response.data;
    },

    // Attendance
    markAttendance: async (attendanceData) => {
        const response = await api.post('/staff/attendance', attendanceData);
        return response.data;
    },

    // Timetable
    manageTimetable: async (timetableData) => {
        const response = await api.post('/staff/timetable', timetableData);
        return response.data;
    },

    // Exam management
    createExam: async (examData) => {
        const response = await api.post('/staff/exams', examData);
        return response.data;
    },

    allocateSeats: async (examId) => {
        const response = await api.post(`/staff/exams/${examId}/allocate-seats`);
        return response.data;
    },

    lockSeats: async (examId) => {
        const response = await api.put(`/staff/exams/${examId}/lock-seats`);
        return response.data;
    },

    // Internals
    uploadInternals: async (internalsData) => {
        const response = await api.post('/staff/internals', internalsData);
        return response.data;
    },

    // Notices and Events
    postNotice: async (noticeData) => {
        const response = await api.post('/staff/notices', noticeData);
        return response.data;
    },

    createEvent: async (eventData) => {
        const response = await api.post('/staff/events', eventData);
        return response.data;
    },
};
