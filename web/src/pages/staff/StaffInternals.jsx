import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // Added useLocation
import {
    BookOpen,
    Search,
    Edit2,
    Save,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Loader2,
    UserCircle,
    ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { staffService } from '../../services/staffService';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import { staffMapping } from '../../data/staffMapping';
import { staffData } from '../../data/staffData';
import { MSC_CS_1ST_YEAR_STUDENTS } from '../../utils/mscCS1stYearStudentList';

const StaffInternals = () => {
    const { user, role: authRole } = useAuth();
    const location = useLocation(); // Added location hook
    const [markingMode, setMarkingMode] = useState(false);
    const [maxMarks, setMaxMarks] = useState(20);
    const [selectedClass, setSelectedClass] = useState(null);
    const [assignedClasses, setAssignedClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Handle passed state from navigation
    useEffect(() => {
        if (!loading && location.state?.classObj && assignedClasses.length > 0) {
            const passedClass = location.state.classObj;
            // Find the matching class in assignedClasses
            // We match by name and subject. Note: in StaffInternals locally, 'class' prop is mapped to 'name' state
            const matchingClass = assignedClasses.find(c => c.name === passedClass.class && c.subject === passedClass.subject);

            if (matchingClass) {
                setSelectedClass(matchingClass);
                setMarkingMode(true);
                window.history.replaceState({}, document.title);
            }
        }
    }, [loading, location.state, assignedClasses]);

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

                    const formattedClasses = mappings.map((item, index) => ({
                        id: index,
                        name: item.class,
                        subject: item.subject,
                        count: 25 // Mock count
                    }));
                    setAssignedClasses(formattedClasses);
                }
            }
            setLoading(false);
        };
        fetchClasses();
    }, [user]);

    useEffect(() => {
        const fetchStudents = async () => {
            if (selectedClass) {
                setLoading(true);
                try {
                    const isUG = /B\.?TECH|B\.?SC/i.test(selectedClass.name);

                    if (isUG) {
                        setStudents([]);
                    } else {
                        // Derive program from class name
                        // Extract Year and Program from class name
                        const match = selectedClass.name.match(/^(I|II|III|IV|V|VI)\s+(.+)/);
                        let programFilter = selectedClass.name;
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

                        const fetchedStudents = await staffService.getStudents(filters);

                        const formattedStudents = (Array.isArray(fetchedStudents) ? fetchedStudents : []).map(s => ({
                            id: s.id || s.registerNumber,
                            name: s.name,
                            regNo: s.registerNumber,
                            marks: s.marks || '',
                            total: 20
                        }));
                        setStudents(formattedStudents);
                    }
                } catch (error) {
                    console.error("Error fetching students:", error);
                    setStudents([]);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchStudents();
    }, [selectedClass]);

    const handleSubmitMarks = async () => {
        try {
            const marksData = {
                classId: selectedClass.id,
                className: selectedClass.name,
                subject: selectedClass.subject,
                marks: students,
                updatedBy: authRole
            };
            await staffService.saveInternalMarks(marksData);
            alert('Marks published successfully');
            setMarkingMode(false);
        } catch (error) {
            alert('Error publishing marks');
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
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[100px] animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-purple-200/30 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-blue-200/30 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
            </div>

            <Sidebar role={authRole || 'Staff'} />

            <div className="flex-1 flex flex-col relative z-10 lg:ml-64 transition-all duration-300">
                <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <div className="flex items-center">
                            {markingMode && (
                                <button onClick={() => setMarkingMode(false)} className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                                </button>
                            )}
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center">
                                    <BookOpen className="mr-3 text-indigo-600" />
                                    Gradebook
                                </h1>
                                <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest">Internal Assessment Portal</p>
                            </div>
                        </div>
                        {markingMode && (
                            <button
                                onClick={handleSubmitMarks}
                                className="flex items-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 transform active:scale-95"
                            >
                                <Save className="w-3.5 h-3.5 mr-2" />
                                Publish
                            </button>
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {!markingMode ? (
                            assignedClasses.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {assignedClasses.map((cls) => (
                                        <div key={cls.id} className="cursor-pointer bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/50 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group overflow-hidden flex flex-col relative hover:-translate-y-1">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-100/50 transition-colors"></div>

                                            <div className="p-6 relative z-10">
                                                <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm mb-5 group-hover:scale-110 transition-transform duration-300">
                                                    <BookOpen className="w-7 h-7 text-indigo-600" />
                                                </div>
                                                <div className="px-0 pb-2">
                                                    <h3 className="text-lg font-black text-gray-900 tracking-tight mb-2">{cls.name}</h3>
                                                    <p className="text-[10px] font-bold text-indigo-500 tracking-widest uppercase mb-4 line-clamp-2 min-h-[2.5em]">{cls.subject}</p>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedClass(cls);
                                                            setMarkingMode(true);
                                                        }}
                                                        className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all"
                                                    >
                                                        Enter Marks <ChevronRight className="w-3 h-3 ml-1" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-200">
                                    <div className="inline-flex p-4 bg-gray-50 rounded-full mb-4">
                                        <AlertCircle className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 font-medium">No classes available for internal marks entry.</p>
                                </div>
                            )
                        ) : (
                            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 overflow-hidden animate-in zoom-in-95 duration-300">
                                <div className="p-6 bg-indigo-50/30 border-b border-indigo-100/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 tracking-tight">{selectedClass?.subject}</h3>
                                        <p className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase mt-1">{selectedClass?.name} • Continuous Evaluation</p>
                                    </div>
                                    <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mr-2">Max Marks:</label>
                                        <input
                                            type="number"
                                            value={maxMarks}
                                            onChange={(e) => setMaxMarks(Number(e.target.value))}
                                            className="w-16 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-indigo-600 font-bold text-sm text-center outline-none focus:ring-2 focus:ring-indigo-500"
                                            min="1"
                                        />
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50/50 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-100">
                                                <th className="px-6 py-4">Student</th>
                                                <th className="px-6 py-4">Current Score</th>
                                                <th className="px-6 py-4">Total</th>
                                                <th className="px-6 py-4 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100/50">
                                            {students.length > 0 ? (
                                                students.map((student) => (
                                                    <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                                                    {student.regNo.slice(-3)}
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-bold text-gray-900 tracking-tight">{student.name}</div>
                                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{student.regNo}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="number"
                                                                className="w-20 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm text-center shadow-sm"
                                                                defaultValue={student.marks}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    const newStudents = students.map(s =>
                                                                        s.id === student.id ? { ...s, marks: val } : s
                                                                    );
                                                                    setStudents(newStudents);
                                                                }}
                                                                max={maxMarks}
                                                                min="0"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-bold text-gray-400">/ {maxMarks}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                                        <div className="inline-flex p-3 bg-gray-50 rounded-full mb-2">
                                                            <AlertCircle className="w-6 h-6 text-gray-300" />
                                                        </div>
                                                        <p className="text-sm font-medium">No student list available for this class yet.</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StaffInternals;
