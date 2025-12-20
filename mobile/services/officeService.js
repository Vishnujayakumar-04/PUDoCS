import api from './api';

export const officeService = {
    // Get dashboard
    getDashboard: async () => {
        const response = await api.get('/office/dashboard');
        return response.data;
    },

    // Student management
    getStudents: async () => {
        const response = await api.get('/office/students');
        return response.data;
    },

    verifyStudent: async (id, studentData) => {
        const response = await api.put(`/office/students/${id}/verify`, studentData);
        return response.data;
    },

    // Fee management
    updateFees: async (studentId, feeData) => {
        const response = await api.put(`/office/fees/${studentId}`, feeData);
        return response.data;
    },

    // Exam eligibility
    getExamEligibility: async () => {
        const response = await api.get('/office/exam-eligibility');
        return response.data;
    },

    // Results
    uploadResults: async (resultsData) => {
        const response = await api.post('/office/results', resultsData);
        return response.data;
    },

    // Letter formats
    uploadLetterFormat: async (formatData) => {
        const response = await api.post('/office/letter-formats', formatData);
        return response.data;
    },

    // Notices
    postNotice: async (noticeData) => {
        const response = await api.post('/office/notices', noticeData);
        return response.data;
    },

    approveNotice: async (noticeId) => {
        const response = await api.put(`/office/notices/${noticeId}/approve`);
        return response.data;
    },
};
