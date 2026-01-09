import React, { useState } from 'react';
import {
    CalendarCheck,
    Plus,
    Search,
    BookOpen,
    Users,
    ChevronRight,
    Loader2,
    Filter,
    ArrowRight,
    Save,
    X,
    Check,
    Minus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { staffService } from '../../services/staffService';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';

const StaffAttendance = () => {
    const { role: authRole } = useAuth();
    const [markingMode, setMarkingMode] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);

    const classes = [
        { id: '1', name: 'M.Sc CS - 1st Year', subject: 'MOS', students: 19 },
        { id: '2', name: 'M.Sc CS - 2nd Year', subject: 'ADBS', students: 24 },
        { id: '3', name: 'M.Tech DS - 1st Year', subject: 'ML', students: 15 },
    ];

    const studentList = [
        { id: '1', name: 'Adarsh P S', regNo: '24MSCCS001', status: 'P' },
        { id: '2', name: 'Alan Shaji', regNo: '24MSCCS002', status: 'P' },
        { id: '3', name: 'Amal K Paulson', regNo: '24MSCCS003', status: 'A' },
        { id: '4', name: 'Athira G', regNo: '24MSCCS004', status: 'P' },
        { id: '5', name: 'Gouri Parameswaran', regNo: '24MSCCS005', status: 'P' },
    ];

    const toggleStatus = (id) => {
        // ... toggle logic for local state if I had one
    };

    const handleSubmitAttendance = async () => {
        try {
            const attendanceData = {
                classId: selectedClass.id,
                className: selectedClass.name,
                subject: selectedClass.subject,
                students: studentList, // In a real app, this would be the modified list
                markedBy: authRole,
            };
            await staffService.saveAttendance(attendanceData);
            alert('Attendance submitted successfully');
            setMarkingMode(false);
        } catch (error) {
            alert('Error submitting attendance');
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar role={authRole || 'Staff'} />

            <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
                <header className="bg-white shadow-sm z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                <CalendarCheck className="mr-3 text-green-600" />
                                Attendance Tracker
                            </h1>
                            <p className="text-sm text-gray-500">Record and monitor daily class attendance</p>
                        </div>
                        {markingMode && (
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setMarkingMode(false)}
                                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitAttendance}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest shadow-lg shadow-green-100 flex items-center"
                                >
                                    <Save className="w-3.5 h-3.5 mr-2" />
                                    Submit Attendance
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-5xl mx-auto space-y-6">

                        {!markingMode ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {classes.map((cls) => (
                                    <Card key={cls.id} className="cursor-pointer hover:border-green-500 hover:shadow-xl transition-all group overflow-hidden border border-gray-100 p-0 flex flex-col">
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-3 bg-green-50 rounded-2xl group-hover:scale-110 transition-transform">
                                                    <BookOpen className="w-6 h-6 text-green-600" />
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{cls.students} Students</span>
                                            </div>
                                            <h3 className="text-lg font-black text-gray-900 tracking-tight">{cls.name}</h3>
                                            <p className="text-xs font-bold text-green-600 tracking-widest uppercase mt-1">{cls.subject}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedClass(cls);
                                                setMarkingMode(true);
                                            }}
                                            className="w-full bg-gray-50 border-t border-gray-100 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:bg-green-600 group-hover:text-white transition-all flex items-center justify-center space-x-2"
                                        >
                                            <span>Mark Attendance</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                                <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 tracking-tight">{selectedClass?.name}</h3>
                                        <p className="text-[10px] font-bold text-green-600 tracking-widest uppercase">{selectedClass?.subject} • {new Date().toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                            P: <span className="text-green-600">--</span> | A: <span className="text-red-500">--</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {studentList.map((student) => (
                                        <div key={student.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center text-xs font-black text-gray-400">
                                                    {student.regNo.slice(-3)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900 tracking-tight">{student.name}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{student.regNo}</div>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${student.status === 'P' ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-100' : 'bg-white text-gray-400 border-gray-100 hover:border-green-200'}`}>
                                                    Present
                                                </button>
                                                <button className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${student.status === 'A' ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-100' : 'bg-white text-gray-400 border-gray-100 hover:border-red-200'}`}>
                                                    Absent
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StaffAttendance;
