import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { attendanceService } from '../../services/attendanceService';
import Card from '../../components/Card';
import {
    CheckSquare,
    AlertCircle,
    CheckCircle,
    XCircle
} from 'lucide-react';

const ParentAttendance = () => {
    const { user } = useAuth();
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [student, setStudent] = useState(null);
    const [overallAttendance, setOverallAttendance] = useState(0);

    useEffect(() => {
        const fetchAttendance = async () => {
            if (!user?.uid) return;

            try {
                // 1. Get Linked Student
                let parentDoc = await getDoc(doc(db, 'parents', user.uid));
                if (!parentDoc.exists()) parentDoc = await getDoc(doc(db, 'users', user.uid));

                if (!parentDoc.exists()) throw new Error("Parent profile not found");

                const studentId = parentDoc.data().linkedStudentId;
                if (!studentId) throw new Error("No student linked");

                const studentDoc = await getDoc(doc(db, 'students', studentId));
                if (!studentDoc.exists()) throw new Error("Student not found");

                const studentData = { id: studentDoc.id, ...studentDoc.data() };
                setStudent(studentData);

                // 2. Fetch Attendance
                if (studentData.program && studentData.year) {
                    const data = await attendanceService.getStudentAttendance(
                        studentData.registerNumber || studentData.id, // ID used in attendance coll
                        studentData.program,
                        studentData.year
                    );
                    setAttendance(data);

                    // Calculate Overall
                    if (data.length > 0) {
                        const totalCredits = data.reduce((sum, subj) => sum + (subj.credits || 3), 0);
                        const weightedSum = data.reduce((sum, subj) => {
                            const credits = subj.credits || 3;
                            return sum + (subj.attendancePercentage * credits);
                        }, 0);
                        const overall = totalCredits > 0 ? weightedSum / totalCredits : 100;
                        setOverallAttendance(Math.round(overall * 100) / 100);
                    }
                }

            } catch (error) {
                console.error("Error loading parent attendance view:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, [user]);

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar role="Parent" />
                <div className="flex-1 ml-0 lg:ml-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar role="Parent" />
            <main className="flex-1 ml-0 lg:ml-64 p-4 sm:p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <CheckSquare className="mr-3 text-blue-600" />
                        Attendance Monitoring
                    </h1>
                    {student && <p className="text-gray-500 mt-1">Viewing attendance for {student.name}</p>}
                </header>

                {/* Overall Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Card className="bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 font-medium">Overall Attendance</p>
                                <h2 className={`text-4xl font-bold mt-2 ${overallAttendance >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                                    {overallAttendance}%
                                </h2>
                            </div>
                            <div className={`p-4 rounded-full ${overallAttendance >= 75 ? 'bg-green-100' : 'bg-red-100'}`}>
                                {overallAttendance >= 75 ? <CheckCircle className="w-8 h-8 text-green-600" /> : <AlertCircle className="w-8 h-8 text-red-600" />}
                            </div>
                        </div>
                    </Card>
                </div>

                <Card title="Subject-wise Breakdown">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 text-left">
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Subject</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Total</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Attended</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Percentage</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {attendance.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-8 text-center text-gray-500">No records found.</td>
                                    </tr>
                                ) : (
                                    attendance.map((subject, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-4">
                                                <div className="font-medium text-gray-900">{subject.name}</div>
                                                <div className="text-xs text-gray-500">{subject.code}</div>
                                            </td>
                                            <td className="px-4 py-4 text-center text-sm">{subject.totalClasses}</td>
                                            <td className="px-4 py-4 text-center text-sm">{subject.attendedClasses}</td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${subject.attendancePercentage >= 75 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {subject.attendancePercentage}%
                                                </span>
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

export default ParentAttendance;
