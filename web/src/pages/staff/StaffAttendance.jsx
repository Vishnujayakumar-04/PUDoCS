import React, { useState, useEffect } from 'react';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Users,
    BookOpen,
    CheckCircle2,
    XCircle,
    Save,
    Search,
    Loader2,
    GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { staffService } from '../../services/staffService';
import { attendanceService } from '../../services/attendanceService';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Button from '../../components/Button';

const StaffAttendance = () => {
    const { user } = useAuth();
    const [view, setView] = useState('landing'); // 'landing' | 'ug' | 'pg' | 'class' | 'mark'
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [markingAttendance, setMarkingAttendance] = useState(false);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceMap, setAttendanceMap] = useState({});

    useEffect(() => {
        if (view === 'class' && selectedClass) {
            loadClassData();
        }
    }, [view, selectedClass]);

    const loadClassData = async () => {
        setLoading(true);
        try {
            // Get students using staffService with filters
            const filteredStudents = await staffService.getStudents({
                program: selectedClass.name,
                year: selectedClass.year
            });
            setStudents(filteredStudents);

            // Get subjects from attendanceService/timetable
            const timetableSubjects = await attendanceService.getStudentSubjects(
                selectedClass.name,
                selectedClass.year
            );
            setSubjects(timetableSubjects);

            // Initialize attendance map (all Present by default)
            const initialMap = {};
            filteredStudents.forEach(student => {
                const studentId = student.id || student.registerNumber;
                initialMap[studentId] = 'Present';
            });
            setAttendanceMap(initialMap);
        } catch (error) {
            console.error('Error loading class data:', error);
            alert('Failed to load class data');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (view === 'mark') {
            setView('class');
            setSelectedSubject(null);
        } else if (view === 'class') {
            setView(selectedClass?.category === 'ug' ? 'ug' : 'pg');
            setSelectedClass(null);
        } else if (view === 'ug' || view === 'pg') {
            setView('landing');
        }
    };

    const handleClassSelect = (classItem) => {
        setSelectedClass(classItem);
        setView('class');
    };

    const handleSubjectSelect = (subject) => {
        setSelectedSubject(subject);
        setView('mark');
    };

    const toggleStudentAttendance = (studentId) => {
        setAttendanceMap(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present'
        }));
    };

    const handleSaveAttendance = async () => {
        if (!selectedSubject) {
            alert('Please select a subject');
            return;
        }

        setMarkingAttendance(true);
        try {
            const markedBy = user?.email || user?.name || 'Staff';

            const results = await attendanceService.addClassAttendance(
                students,
                selectedSubject.code,
                selectedSubject.name,
                attendanceDate,
                attendanceMap,
                markedBy
            );

            const successCount = results.filter(r => r.success).length;
            const errorCount = results.length - successCount;

            if (successCount > 0) {
                alert(`Attendance marked for ${successCount} student(s).${errorCount > 0 ? ` ${errorCount} failed.` : ''}`);
                setView('class');
                setSelectedSubject(null);
                setAttendanceMap({});
            } else {
                alert('Failed to mark attendance for any students');
            }
        } catch (error) {
            console.error('Error saving attendance:', error);
            alert('Failed to save attendance');
        } finally {
            setMarkingAttendance(false);
        }
    };

    const renderLanding = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto py-10">
            <button
                onClick={() => setView('ug')}
                className="group relative overflow-hidden bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="p-10 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <GraduationCap className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Undergraduate (UG)</h3>
                    <p className="text-gray-500">B.Tech & B.Sc Programs</p>
                    <div className="mt-8 flex items-center text-blue-600 font-semibold">
                        Select Program <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                </div>
            </button>

            <button
                onClick={() => setView('pg')}
                className="group relative overflow-hidden bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="p-10 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-10 h-10 text-indigo-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Postgraduate (PG)</h3>
                    <p className="text-gray-500">M.Sc, M.Tech & MCA Programs</p>
                    <div className="mt-8 flex items-center text-indigo-600 font-semibold">
                        Select Program <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                </div>
            </button>
        </div>
    );

    const ProgramSection = ({ title, items }) => (
        <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 px-2">{title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => handleClassSelect(item)}
                        className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left"
                    >
                        <span className="font-medium text-gray-700">{item.label}</span>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                ))}
            </div>
        </div>
    );

    const renderUGSelection = () => (
        <div className="max-w-5xl mx-auto py-6">
            <ProgramSection
                title="B.Tech CSE Programs"
                items={[
                    { label: 'B.Tech CSE – 1st Year', name: 'B.Tech', year: '1', category: 'ug' },
                    { label: 'B.Tech CSE – 2nd Year', name: 'B.Tech', year: '2', category: 'ug' },
                    { label: 'B.Tech CSE – 3rd Year', name: 'B.Tech', year: '3', category: 'ug' },
                    { label: 'B.Tech CSE – 4th Year', name: 'B.Tech', year: '4', category: 'ug' },
                ]}
            />
            <ProgramSection
                title="B.Sc Computer Science"
                items={[
                    { label: 'B.Sc CS – 1st Year', name: 'B.Sc CS', year: '1', category: 'ug' },
                    { label: 'B.Sc CS – 2nd Year', name: 'B.Sc CS', year: '2', category: 'ug' },
                    { label: 'B.Sc CS – 3rd Year', name: 'B.Sc CS', year: '3', category: 'ug' },
                ]}
            />
        </div>
    );

    const renderPGSelection = () => (
        <div className="max-w-5xl mx-auto py-6">
            <ProgramSection
                title="M.Tech Programs"
                items={[
                    { label: 'M.Tech Data Science – 1st Year', name: 'M.Tech DS', year: '1', category: 'pg' },
                    { label: 'M.Tech CSE – 1st Year', name: 'M.Tech CSE', year: '1', category: 'pg' },
                ]}
            />
            <ProgramSection
                title="M.Sc Programs"
                items={[
                    { label: 'M.Sc CS – 1st Year', name: 'M.Sc CS', year: '1', category: 'pg' },
                    { label: 'M.Sc CS – 2nd Year', name: 'M.Sc CS', year: '2', category: 'pg' },
                    { label: 'M.Sc Data Analytics – 1st Year', name: 'M.Sc Data Analytics', year: '1', category: 'pg' },
                    { label: 'M.Sc CS Integrated – 1st Year', name: 'M.Sc CS Integrated', year: '1', category: 'pg' },
                ]}
            />
            <ProgramSection
                title="MCA Programs"
                items={[
                    { label: 'MCA – 1st Year', name: 'MCA', year: '1', category: 'pg' },
                    { label: 'MCA – 2nd Year', name: 'MCA', year: '2', category: 'pg' },
                ]}
            />
        </div>
    );

    const renderClassView = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                    <p className="text-gray-500 font-medium">Loading subjects...</p>
                </div>
            );
        }

        return (
            <div className="max-w-5xl mx-auto py-6">
                <div className="bg-indigo-600 rounded-3xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <h2 className="text-3xl font-bold mb-2">{selectedClass?.label}</h2>
                    <p className="text-indigo-100 opacity-90">Select a subject to begin marking attendance for today.</p>
                </div>

                {subjects.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                        <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-1">No subjects found</h3>
                        <p className="text-gray-500">We couldn't find any subjects assigned to this class in the timetable.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {subjects.map((subject, index) => (
                            <button
                                key={index}
                                onClick={() => handleSubjectSelect(subject)}
                                className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all text-left flex items-center justify-between"
                            >
                                <div>
                                    <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">{subject.code}</div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">{subject.name}</h4>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-md text-gray-600 font-medium">{subject.credits} Credits</span>
                                        <span className="text-xs px-2 py-1 bg-blue-50 rounded-md text-blue-600 font-medium">{subject.type}</span>
                                    </div>
                                </div>
                                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <ChevronRight className="w-6 h-6" />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderMarkAttendance = () => {
        const presentCount = Object.values(attendanceMap).filter(s => s === 'Present').length;
        const absentCount = students.length - presentCount;

        return (
            <div className="max-w-5xl mx-auto py-6">
                {/* Header Info */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="bg-blue-600 p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">{selectedSubject?.code}</div>
                            <h2 className="text-2xl font-bold">{selectedSubject?.name}</h2>
                            <p className="text-blue-100 opacity-90 text-sm mt-1">{selectedClass?.label}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4">
                            <Calendar className="w-6 h-6 text-white" />
                            <input
                                type="date"
                                className="bg-transparent border-none text-white font-bold outline-none focus:ring-0 cursor-pointer"
                                value={attendanceDate}
                                onChange={(e) => setAttendanceDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
                        <div className="p-6 text-center">
                            <div className="text-xs font-bold text-gray-400 uppercase mb-1">Total</div>
                            <div className="text-2xl font-black text-gray-900">{students.length}</div>
                        </div>
                        <div className="p-6 text-center bg-green-50/30">
                            <div className="text-xs font-bold text-green-600 uppercase mb-1">Present</div>
                            <div className="text-2xl font-black text-green-600">{presentCount}</div>
                        </div>
                        <div className="p-6 text-center bg-red-50/30">
                            <div className="text-xs font-bold text-red-600 uppercase mb-1">Absent</div>
                            <div className="text-2xl font-black text-red-600">{absentCount}</div>
                        </div>
                    </div>

                    {/* Student List */}
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Student List</h3>
                            <div className="text-xs font-medium text-gray-500 italic">Click on a row to toggle status</div>
                        </div>

                        <div className="space-y-3">
                            {students.map((student, index) => {
                                const studentId = student.id || student.registerNumber;
                                const status = attendanceMap[studentId] || 'Present';
                                return (
                                    <button
                                        key={index}
                                        onClick={() => toggleStudentAttendance(studentId)}
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border-2 ${status === 'Present'
                                                ? 'bg-white border-green-500 shadow-sm'
                                                : 'bg-red-50 border-red-500'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4 text-left">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {student.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{student.name}</div>
                                                <div className="text-xs text-gray-500 font-medium">{student.registerNumber}</div>
                                            </div>
                                        </div>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${status === 'Present' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                            }`}>
                                            {status === 'Present' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50 border-t border-gray-100">
                        <button
                            onClick={handleSaveAttendance}
                            disabled={markingAttendance}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
                        >
                            {markingAttendance ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    <span>Saving Attendance...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-6 h-6" />
                                    <span>Save Attendance Records</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-sm z-10 border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {view !== 'landing' && (
                                <button
                                    onClick={handleBack}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                            )}
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    {view === 'landing' ? 'Mark Attendance' :
                                        view === 'ug' ? 'UG Programs' :
                                            view === 'pg' ? 'PG Programs' :
                                                view === 'class' ? 'Select Subject' :
                                                    'Attendance Register'}
                                </h1>
                                {view !== 'landing' && (
                                    <p className="text-xs text-gray-500 font-medium">Step {view === 'ug' || view === 'pg' ? '2' : view === 'class' ? '3' : '4'} of 4</p>
                                )}
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl text-blue-700 text-sm font-bold">
                            <Users className="w-4 h-4" />
                            <span>Staff Portal</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4">
                    {view === 'landing' && renderLanding()}
                    {view === 'ug' && renderUGSelection()}
                    {view === 'pg' && renderPGSelection()}
                    {view === 'class' && renderClassView()}
                    {view === 'mark' && renderMarkAttendance()}
                </main>
            </div>
        </div>
    );
};

export default StaffAttendance;
