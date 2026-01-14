import React, { useState, useEffect } from 'react';
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
    Minus,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { staffService } from '../../services/staffService';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import { staffMapping } from '../../data/staffMapping';
import { staffData } from '../../data/staffData';

const StaffAttendance = () => {
    const { user, role: authRole } = useAuth();
    const [assignedClasses, setAssignedClasses] = useState([]); // Added missing state
    const [markingMode, setMarkingMode] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true); // Added loading state

    // Mock student list for PG classes
    const mockPGStudents = [
        { id: '1', name: 'Adarsh P S', regNo: '24MSCCS001', status: 'P' },
        { id: '2', name: 'Alan Shaji', regNo: '24MSCCS002', status: 'P' },
        { id: '3', name: 'Amal K Paulson', regNo: '24MSCCS003', status: 'A' },
        { id: '4', name: 'Athira G', regNo: '24MSCCS004', status: 'P' },
        { id: '5', name: 'Gouri Parameswaran', regNo: '24MSCCS005', status: 'P' },
    ];

    useEffect(() => {
        if (selectedClass) {
            // Check if it's a UG class (B.Sc or B.Tech)
            const isUG = /B\.?TECH|B\.?SC/i.test(selectedClass.name);
            if (isUG) {
                setStudents([]);
            } else {
                setStudents(mockPGStudents);
            }
        }
    }, [selectedClass]);

    useEffect(() => {
        const fetchClasses = async () => {
            if (user?.email) {
                const staffMember = staffData.find(s => s.email.toLowerCase() === user.email.toLowerCase());

                // Try Firestore Profile
                let firestoreProfile = null;
                try {
                    firestoreProfile = await staffService.getProfile(user.uid, user.email);
                } catch (e) {
                    console.error("Failed to fetch profile", e);
                }

                if (firestoreProfile || staffMember) {
                    const name = firestoreProfile?.name || staffMember?.name;
                    let mappings = [];

                    if (firestoreProfile?.assignments && Array.isArray(firestoreProfile.assignments)) {
                        mappings = firestoreProfile.assignments;
                    } else if (name && staffMapping[name]) {
                        mappings = staffMapping[name];
                    }

                    // Transform for the view
                    const formattedClasses = mappings.map((item, index) => ({
                        id: index,
                        name: item.class,
                        subject: item.subject,
                        students: /B\.?TECH|B\.?SC/i.test(item.class) ? '0' : '25' // Mock count adjustment
                    }));
                    setAssignedClasses(formattedClasses);
                }
            }
            setLoading(false);
        };
        fetchClasses();
    }, [user]);

    const handleSubmitAttendance = async () => {
        try {
            const attendanceData = {
                classId: selectedClass.id,
                className: selectedClass.name,
                subject: selectedClass.subject,
                students: students,
                markedBy: authRole,
            };
            await staffService.saveAttendance(attendanceData);
            alert('Attendance submitted successfully');
            setMarkingMode(false);
        } catch (error) {
            alert('Error submitting attendance');
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-gray-50 overflow-hidden flex">
            {/* Background Animations */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-200/30 rounded-full blur-[100px] animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-teal-200/30 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-emerald-200/30 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
            </div>

            <Sidebar role={authRole || 'Staff'} />

            <div className="flex-1 flex flex-col relative z-10 lg:ml-64 transition-all duration-300">
                <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 flex items-center tracking-tight">
                                <CalendarCheck className="mr-3 text-green-600" />
                                Attendance Tracker
                            </h1>
                            <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest">Record and monitor daily class attendance</p>
                        </div>
                        {markingMode && (
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setMarkingMode(false)}
                                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitAttendance}
                                    className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-green-200 hover:bg-green-700 hover:shadow-green-300 transition-all flex items-center transform active:scale-95"
                                >
                                    <Save className="w-3.5 h-3.5 mr-2" />
                                    Submit
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {!markingMode ? (
                            assignedClasses.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {assignedClasses.map((cls) => (
                                        <div key={cls.id} className="cursor-pointer bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/50 hover:border-green-500/50 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 group overflow-hidden flex flex-col relative hover:-translate-y-1">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-[100px] -mr-8 -mt-8 z-0 group-hover:scale-150 transition-transform duration-500 ease-out"></div>

                                            <div className="p-6 relative z-10">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                                                        <BookOpen className="w-6 h-6 text-green-600" />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-full border border-gray-100">~{cls.students} Students</span>
                                                </div>
                                                <h3 className="text-lg font-black text-gray-900 tracking-tight mb-1">{cls.name}</h3>
                                                <p className="text-[10px] font-bold text-green-600 tracking-widest uppercase line-clamp-2 min-h-[2.5em]">{cls.subject}</p>
                                            </div>

                                            <div className="mt-auto p-4 pt-0 relative z-10">
                                                <button
                                                    onClick={() => {
                                                        setSelectedClass(cls);
                                                        setMarkingMode(true);
                                                    }}
                                                    className="w-full py-3 rounded-xl bg-green-50 text-[10px] font-bold uppercase tracking-widest text-green-700 group-hover:bg-green-600 group-hover:text-white transition-all flex items-center justify-center space-x-2"
                                                >
                                                    <span>Mark Attendance</span>
                                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-200">
                                    <div className="inline-flex p-4 bg-gray-50 rounded-full mb-4">
                                        <CalendarCheck className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 font-medium">No classes assigned for attendance marking.</p>
                                </div>
                            )
                        ) : (
                            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 overflow-hidden animate-in zoom-in-95 duration-300">
                                <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900 tracking-tight">{selectedClass?.name}</h3>
                                        <div className="flex items-center mt-1 space-x-2">
                                            <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                                {new Date().toLocaleDateString()}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">• {selectedClass?.subject}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center space-x-1">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span className="text-xs font-bold text-gray-600">Present</span>
                                        </div>
                                        <div className="h-4 w-px bg-gray-200"></div>
                                        <div className="flex items-center space-x-1">
                                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                            <span className="text-xs font-bold text-gray-600">Absent</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="divide-y divide-gray-100/50 max-h-[600px] overflow-y-auto custom-scrollbar p-2">
                                    {students.length > 0 ? (
                                        students.map((student) => (
                                            <div key={student.id} className="p-3 mx-2 my-1 rounded-xl flex items-center justify-between hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100">
                                                <div className="flex items-center space-x-4">
                                                    <div className="h-10 w-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-xs font-black text-gray-500 group-hover:from-indigo-100 group-hover:to-blue-100 group-hover:text-indigo-600 transition-all">
                                                        {student.regNo.slice(-3)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors">{student.name}</div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{student.regNo}</div>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button className={`w-24 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border transform active:scale-95 duration-200 ${student.status === 'P' ? 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-200' : 'bg-white text-gray-400 border-gray-200 hover:border-green-300 hover:text-green-500'}`}>
                                                        Present
                                                    </button>
                                                    <button className={`w-24 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border transform active:scale-95 duration-200 ${student.status === 'A' ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-200' : 'bg-white text-gray-400 border-gray-200 hover:border-red-300 hover:text-red-500'}`}>
                                                        Absent
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-12 text-center">
                                            <div className="inline-flex p-4 bg-gray-50 rounded-full mb-3">
                                                <AlertCircle className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <p className="text-gray-500 font-medium text-sm">No student list available for this class yet.</p>
                                        </div>
                                    )}
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
