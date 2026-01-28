import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Added for navigation
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import {
    Users,
    GraduationCap,
    BookOpen,
    Clock,
    AlertCircle,
    Calendar,
    X,
    CalendarCheck,
    FileText,
    ChevronRight,
    User
} from 'lucide-react';
import { staffData } from '../../data/staffData';
// import { staffMapping } from '../../data/staffMapping'; // Removed Legacy
import { staffService } from '../../services/staffService';

const StaffMyClass = () => {
    const { user, role: authRole } = useAuth();
    const navigate = useNavigate(); // Hook for navigation
    const [assignedClasses, setAssignedClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [staffName, setStaffName] = useState('');

    // Modal State
    const [selectedClass, setSelectedClass] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [classStudents, setClassStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    useEffect(() => {
        const fetchClasses = async () => {
            if (user?.email) {
                // Find visible name from staffData based on email (Static Data Fallback)
                const staffMember = staffData.find(s => s.email.toLowerCase() === user.email.toLowerCase());

                // Try fetching profile from Firestore
                let firestoreProfile = null;
                try {
                    firestoreProfile = await staffService.getProfile(user.uid, user.email);
                } catch (e) {
                    console.error("Failed to fetch profile from Firestore", e);
                }

                if (firestoreProfile || staffMember) {
                    const name = firestoreProfile?.name || staffMember?.name;
                    setStaffName(name);

                    // 1. Try Firestore 'teachingAssignments' field
                    if (firestoreProfile?.teachingAssignments && Array.isArray(firestoreProfile.teachingAssignments)) {
                        setAssignedClasses(firestoreProfile.teachingAssignments);
                    } else {
                        console.warn(`No teaching assignments found for: ${user.email}`);
                        setAssignedClasses([]);
                    }
                } else {
                    setAssignedClasses([]);
                }
            }
            setLoading(false);
        };

        fetchClasses();
    }, [user]);

    const handleViewDetails = async (cls) => {
        setSelectedClass(cls);
        setModalOpen(true);
        setLoadingStudents(true);
        setClassStudents([]);

        try {
            // Extract Year and Program from class name (e.g. "I MCA" -> Year: 1, Program: "MCA")
            const match = cls.class.match(/^(I|II|III|IV|V|VI)\s+(.+)/);
            let programFilter = cls.class;
            let yearFilter = null;

            if (match) {
                const romanYear = match[1];
                programFilter = match[2].trim();
                const yearMap = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6 };
                yearFilter = yearMap[romanYear] || 1;
            }

            // Fetch students matching this program AND year
            const filters = { program: programFilter };
            if (yearFilter) filters.year = yearFilter;

            const students = await staffService.getStudents(filters);
            setClassStudents(Array.isArray(students) ? students : []);
        } catch (error) {
            console.error("Error fetching class students:", error);
        } finally {
            setLoadingStudents(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-gray-50 overflow-hidden flex">
            {/* Background Animations */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[100px] animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-blue-200/30 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-indigo-200/30 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
            </div>

            <Sidebar role={authRole || 'Staff'} />

            <div className="flex-1 flex flex-col relative z-10 lg:ml-64 transition-all duration-300">
                <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center">
                                    <GraduationCap className="mr-3 text-indigo-600" />
                                    My Classes
                                </h1>
                                <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest">
                                    {staffName ? `Welcome, ${staffName}` : 'My Teaching Schedule'}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        {assignedClasses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {assignedClasses.map((item, index) => (
                                    <div key={index} className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/50 p-6 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                                        <div className={`absolute top-0 left-0 w-1 h-full ${item.type === 'Lab' ? 'bg-cyan-500' : 'bg-indigo-600'}`}></div>

                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${item.type === 'Lab'
                                                ? 'bg-cyan-50 text-cyan-600 border border-cyan-100'
                                                : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                                }`}>
                                                {item.type}
                                            </span>
                                            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                                                <BookOpen className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem] leading-tight group-hover:text-indigo-700 transition-colors">
                                            {item.subject}
                                        </h3>

                                        <div className="space-y-2">
                                            <div className="flex items-center text-gray-600 text-sm font-medium bg-white/50 p-2.5 rounded-xl border border-gray-100/50">
                                                <Users className="w-4 h-4 mr-2.5 text-gray-400" />
                                                <span>{item.class}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleViewDetails(item)}
                                            className="w-full mt-5 py-3 text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50/50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in zoom-in duration-500">
                                <div className="bg-white p-6 rounded-full mb-6 shadow-xl shadow-indigo-100 border border-indigo-50 relative">
                                    <div className="absolute inset-0 bg-indigo-100/50 rounded-full animate-ping opacity-20"></div>
                                    <AlertCircle className="w-12 h-12 text-indigo-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">No Classes Assigned</h3>
                                <p className="text-gray-500 max-w-md leading-relaxed">
                                    Based on records for <strong className="text-indigo-600">{staffName || user?.email}</strong>, no classes are currently mapped.
                                    <br />Please contact the administration if this is an error.
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Class Details Modal */}
            {modalOpen && selectedClass && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col max-h-[85vh]">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
                            <div>
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${selectedClass.type === 'Lab' ? 'bg-cyan-100 text-cyan-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                        {selectedClass.type}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-600">
                                        {selectedClass.class}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight leading-tight">
                                    {selectedClass.subject}
                                </h3>
                            </div>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            {/* Quick Actions */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <button
                                    onClick={() => navigate('/staff/attendance', { state: { classObj: selectedClass } })}
                                    className="flex items-center justify-center p-4 rounded-xl border border-gray-200 bg-white hover:border-green-500 hover:bg-green-50 hover:text-green-700 transition-all group shadow-sm"
                                >
                                    <div className="mr-3 p-2 bg-gray-100 rounded-lg group-hover:bg-white group-hover:text-green-600 transition-colors">
                                        <CalendarCheck className="w-5 h-5 text-gray-500 group-hover:text-green-600" />
                                    </div>
                                    <span className="text-sm font-bold uppercase tracking-wide">Mark Attendance</span>
                                </button>
                                <button
                                    onClick={() => navigate('/staff/internals', { state: { classObj: selectedClass } })}
                                    className="flex items-center justify-center p-4 rounded-xl border border-gray-200 bg-white hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition-all group shadow-sm"
                                >
                                    <div className="mr-3 p-2 bg-gray-100 rounded-lg group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                                        <FileText className="w-5 h-5 text-gray-500 group-hover:text-indigo-600" />
                                    </div>
                                    <span className="text-sm font-bold uppercase tracking-wide">Internal Marks</span>
                                </button>
                            </div>

                            {/* Student List Section */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                                    <Users className="w-4 h-4 mr-2 text-indigo-600" />
                                    Enrolled Students
                                    <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full">
                                        {classStudents.length}
                                    </span>
                                </h4>

                                {loadingStudents ? (
                                    <div className="py-12 flex justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                    </div>
                                ) : classStudents.length > 0 ? (
                                    <div className="bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden">
                                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar divide-y divide-gray-100">
                                            {classStudents.map((student, idx) => (
                                                <div key={idx} className="p-3 flex items-center justify-between hover:bg-white transition-colors">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                                            {idx + 1}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-gray-900">{student.name}</div>
                                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{student.registerNumber}</div>
                                                        </div>
                                                    </div>
                                                    {/* Optional: Student specific action */}
                                                    <button className="text-gray-300 hover:text-indigo-600 p-1">
                                                        <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <User className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500 font-medium">No students found for this class.</p>
                                        <p className="text-xs text-gray-400 mt-1">Make sure students are registered under "{selectedClass.class}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffMyClass;
