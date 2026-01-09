import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import { studentService } from '../../services/studentService';
import { attendanceService } from '../../services/attendanceService';
import {
    CheckSquare,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';

const StudentAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [overallAttendance, setOverallAttendance] = useState(0);
    const [overallEligible, setOverallEligible] = useState(true);

    // Mock User
    const user = { uid: 'student123', email: 'student@pondiuni.ac.in' };

    useEffect(() => {
        loadAttendance();
    }, []);

    const loadAttendance = async () => {
        setLoading(true);
        try {
            const studentProfile = await studentService.getProfile(user.uid, user.email);

            if (studentProfile && studentProfile.program && studentProfile.year) {
                const studentId = user.uid || studentProfile.registerNumber || studentProfile.id;
                const data = await attendanceService.getStudentAttendance(
                    studentId,
                    studentProfile.program,
                    studentProfile.year
                );
                setAttendance(data);

                if (data.length > 0) {
                    const totalCredits = data.reduce((sum, subj) => sum + (subj.credits || 3), 0);
                    const weightedSum = data.reduce((sum, subj) => {
                        const credits = subj.credits || 3;
                        return sum + (subj.attendancePercentage * credits);
                    }, 0);
                    const overall = totalCredits > 0 ? weightedSum / totalCredits : 100;
                    setOverallAttendance(Math.round(overall * 100) / 100);
                    setOverallEligible(overall >= 75);
                }
            }
        } catch (error) {
            console.error("Error loading attendance", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar role="Student" />
                <div className="flex-1 ml-0 lg:ml-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar role="Student" />

            <main className="flex-1 ml-0 lg:ml-64 p-4 sm:p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <CheckSquare className="mr-3 text-blue-600" />
                        My Attendance
                    </h1>
                    <p className="text-gray-500 mt-1">Track your attendance and eligibility</p>
                </header>

                {/* Overall Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Card className="bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 font-medium">Overall Attendance</p>
                                <h2 className={`text-4xl font-bold mt-2 ${overallEligible ? 'text-green-600' : 'text-red-600'}`}>
                                    {overallAttendance}%
                                </h2>
                            </div>
                            <div className={`p-4 rounded-full ${overallEligible ? 'bg-green-100' : 'bg-red-100'}`}>
                                {overallEligible ? <CheckCircle className="w-8 h-8 text-green-600" /> : <AlertCircle className="w-8 h-8 text-red-600" />}
                            </div>
                        </div>
                    </Card>
                    <Card className="bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 font-medium">Exam Eligibility</p>
                                <h2 className={`text-2xl font-bold mt-2 ${overallEligible ? 'text-green-600' : 'text-red-600'}`}>
                                    {overallEligible ? 'Combined Eligible' : 'Not Eligible'}
                                </h2>
                                <p className="text-xs text-gray-400 mt-1">Min 75% required</p>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-full">
                                <Clock className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Attendance Table */}
                <Card title="Subject-wise Attendance">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 text-left">
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Total</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Attended</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Absent</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Percentage</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {attendance.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                            No attendance records found
                                        </td>
                                    </tr>
                                ) : (
                                    attendance.map((subject, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                                                <div className="text-xs text-gray-500">{subject.code}</div>
                                            </td>
                                            <td className="px-4 py-4 text-center text-sm">{subject.totalClasses}</td>
                                            <td className="px-4 py-4 text-center text-sm font-medium text-green-600">{subject.attendedClasses}</td>
                                            <td className="px-4 py-4 text-center text-sm font-medium text-red-600">{subject.notAttendedClasses}</td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${subject.attendancePercentage >= 75 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {subject.attendancePercentage}%
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {subject.isEligible ? (
                                                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

            </main>
        </div>
    );
};

export default StudentAttendance;
