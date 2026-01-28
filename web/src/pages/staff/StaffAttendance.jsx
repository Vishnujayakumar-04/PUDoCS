import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // Added useLocation
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
    AlertCircle,
    ArrowLeft,
    Download,
    Calendar // Added Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { staffService } from '../../services/staffService';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
// import { staffMapping } from '../../data/staffMapping'; // Removed Legacy
import { staffData } from '../../data/staffData';
import { MSC_CS_1ST_YEAR_STUDENTS } from '../../utils/mscCS1stYearStudentList';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';

const StaffAttendance = () => {
    const { user, role: authRole } = useAuth();
    const location = useLocation(); // Hook for state access
    const [assignedClasses, setAssignedClasses] = useState([]);
    const [markingMode, setMarkingMode] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isEditable, setIsEditable] = useState(true);
    const [recordExists, setRecordExists] = useState(false);
    const [showMarkingInterface, setShowMarkingInterface] = useState(false);

    // Handle passed state from navigation
    useEffect(() => {
        if (!loading && location.state?.classObj && assignedClasses.length > 0) {
            const passedClass = location.state.classObj;
            // Find the matching class in assignedClasses to ensure we have the correct ID/Structure
            // We match by name and subject
            const matchingClass = assignedClasses.find(c => c.name === passedClass.class && c.subject === passedClass.subject);

            if (matchingClass) {
                setSelectedClass(matchingClass);
                setMarkingMode(true);
                // Clear state so it doesn't re-trigger on reload if not desired, 
                // but React Router state persists. We can leave it or clear it.
                window.history.replaceState({}, document.title);
            }
        }
    }, [loading, location.state, assignedClasses]);

    // Fetch students/attendance when class OR date changes
    useEffect(() => {
        const fetchAttendanceData = async () => {
            if (selectedClass) {
                setLoading(true);
                try {
                    // 1. Check if editing is allowed (24h window)
                    const selected = new Date(selectedDate);
                    const now = new Date();
                    const diffHours = (now - selected) / (1000 * 60 * 60); // diff in hours

                    // Allow edit if it's today OR within last 24 hours. future dates disabled for submission usually but we'll assume valid date.
                    // Strict rule: cannot edit if > 24 hours passed since the DATE (midnight). 
                    // Better: cannot edit if > 24h passed since RECORD CREATION? 
                    // User said: "edit option for submitted attendance within 24 hours".
                    // If no record exists yet, we can definitely "edit/create".
                    // If record exists, check its timestamp. 

                    let canEdit = true;

                    // 2. Fetch existing attendance
                    const existingRecord = await staffService.getAttendance(selectedClass.id, selectedDate);

                    if (existingRecord) {
                        // Check timestamp for 24h rule
                        const recordTime = new Date(existingRecord.timestamp || existingRecord.updatedAt || selectedDate);
                        const timeDiff = (now - recordTime) / (1000 * 60 * 60);
                        if (timeDiff > 24) {
                            canEdit = false;
                        }

                        // Populate with savings
                        setStudents(existingRecord.students || []);
                        setRecordExists(true);
                        setShowMarkingInterface(false); // Hide marking UI by default if record exists
                        console.log("Loaded existing attendance record");
                    } else {
                        // No record, fetch fresh student list
                        setRecordExists(false);
                        setShowMarkingInterface(true); // Always show marking UI if no record exists
                        const isUG = /B\.?TECH|B\.?SC/i.test(selectedClass.name);

                        if (isUG) {
                            setStudents([]);
                        } else {
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

                            const filters = { program: programFilter };
                            if (yearFilter) filters.year = yearFilter;

                            const fetchedStudents = await staffService.getStudents(filters);

                            const formattedStudents = (Array.isArray(fetchedStudents) ? fetchedStudents : []).map(s => ({
                                id: s.id || s.registerNumber,
                                name: s.name,
                                regNo: s.registerNumber,
                                status: 'P' // Default to Present as per "Select All" ease
                            }));
                            setStudents(formattedStudents);
                        }
                    }
                    setIsEditable(canEdit);

                } catch (error) {
                    console.error("Error fetching data:", error);
                    setStudents([]);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchAttendanceData();
    }, [selectedClass, selectedDate]);

    useEffect(() => {
        const fetchClasses = async () => {
            if (user?.email) {
                const staffMember = staffData.find(s => s.email.toLowerCase() === user.email.toLowerCase());

                let firestoreProfile = null;
                try {
                    firestoreProfile = await staffService.getProfile(user.uid, user.email);
                } catch (e) {
                    console.error("Failed to fetch profile", e);
                }

                if (firestoreProfile || staffMember) {
                    const name = firestoreProfile?.name || staffMember?.name;
                    let mappings = [];

                    if (firestoreProfile?.teachingAssignments && Array.isArray(firestoreProfile.teachingAssignments)) {
                        mappings = firestoreProfile.teachingAssignments;
                    }

                    // Transform for the view
                    const formattedClasses = mappings.map((item, index) => {
                        const normalizedName = item.class.replace(/\./g, '').toUpperCase().trim();
                        const isMscCS1stYear = normalizedName === 'I MSC CS';

                        return {
                            id: index,
                            name: item.class,
                            subject: item.subject,
                            // Use actual count ONLY for I MSC CS
                            students: isMscCS1stYear ? MSC_CS_1ST_YEAR_STUDENTS.length.toString() : '0'
                        };
                    });
                    setAssignedClasses(formattedClasses);
                }
            }
            setLoading(false);
        };
        fetchClasses();
    }, [user]);

    const handleSelectAll = (status) => {
        if (!isEditable) return;
        const updated = students.map(s => ({ ...s, status }));
        setStudents(updated);
    };

    const handleGenerateReport = () => {
        // Simple CSV generation
        const headers = ["Register Number", "Name", "Status", "Date", "Class", "Subject"];
        const rows = students.map(s => [
            s.regNo,
            s.name,
            s.status === 'P' ? 'Present' : 'Absent',
            selectedDate,
            selectedClass.name,
            selectedClass.subject
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Attendance_${selectedClass.name}_${selectedDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    const handleSubmitAttendance = async () => {
        if (!isEditable) {
            alert('Editing time window (24hrs) has closed for this record.');
            return;
        }

        try {
            const attendanceData = {
                classId: selectedClass.id,
                className: selectedClass.name,
                subject: selectedClass.subject,
                students: students,
                markedBy: authRole,
                date: selectedDate
            };
            await staffService.saveAttendance(attendanceData);

            // Send notifications for absent students
            const absentStudents = students.filter(s => s.status === 'A');
            absentStudents.forEach(async (student) => {
                try {
                    await addDoc(collection(db, 'notifications'), {
                        type: 'ATTENDANCE_ABSENT',
                        targetStudentId: student.id, // ID used to link parent
                        studentName: student.name,
                        date: selectedDate,
                        className: selectedClass.name,
                        subject: selectedClass.subject,
                        message: `Your child ${student.name} was marked absent for ${selectedClass.subject} on ${selectedDate}.`,
                        read: false,
                        createdAt: new Date().toISOString()
                    });
                } catch (e) {
                    console.error("Failed to send notification for " + student.name, e);
                }
            });

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
                        <div className="flex items-center">
                            {markingMode && (
                                <button
                                    onClick={() => setMarkingMode(false)}
                                    className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                                    title="Go Back"
                                >
                                    <ArrowLeft className="w-6 h-6 text-gray-500 group-hover:text-green-600" />
                                </button>
                            )}
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 flex items-center tracking-tight">
                                    <CalendarCheck className="mr-3 text-green-600" />
                                    Attendance Tracker
                                </h1>
                                <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest">Record and monitor daily class attendance</p>
                            </div>
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

                            recordExists && !showMarkingInterface ? (
                                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-12 text-center animate-in zoom-in-95 duration-300">
                                    <div className="inline-flex p-6 bg-green-50 rounded-full mb-6 relative">
                                        <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
                                        <Check className="w-12 h-12 text-green-600 relative z-10" />
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 mb-2">Attendance Marked</h2>
                                    <p className="text-gray-500 font-medium mb-8">
                                        Attendance for <span className="text-gray-900 font-bold">{selectedClass?.name}</span> on <span className="text-gray-900 font-bold">{selectedDate}</span> has already been submitted.
                                    </p>

                                    <div className="flex justify-center space-x-4">
                                        {isEditable && (
                                            <button
                                                onClick={() => setShowMarkingInterface(true)}
                                                className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                                            >
                                                Edit Record
                                            </button>
                                        )}
                                        <button
                                            onClick={handleGenerateReport}
                                            className="px-6 py-3 bg-green-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200"
                                        >
                                            Download Report
                                        </button>
                                    </div>

                                    {!isEditable && (
                                        <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-100 inline-block">
                                            <div className="flex items-center text-amber-800 text-xs font-bold uppercase tracking-wide">
                                                <AlertCircle className="w-4 h-4 mr-2" />
                                                Editing period (24h) has ended
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 overflow-hidden animate-in zoom-in-95 duration-300">
                                    <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900 tracking-tight">{selectedClass?.name}</h3>
                                            <div className="flex items-center mt-1 space-x-2">
                                                {/* Date Picker */}
                                                <div className="flex items-center bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-400 mr-2" />
                                                    <input
                                                        type="date"
                                                        value={selectedDate}
                                                        onChange={handleDateChange}
                                                        className="text-[10px] font-bold text-gray-700 uppercase tracking-widest bg-transparent outline-none cursor-pointer"
                                                    />
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">• {selectedClass?.subject}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={handleGenerateReport}
                                                className="p-2 bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 rounded-xl transition-all shadow-sm"
                                                title="Export CSV"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>

                                            {isEditable && (
                                                <>
                                                    <button
                                                        onClick={() => handleSelectAll('P')}
                                                        className="px-3 py-1.5 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-green-100 hover:bg-green-100 transition-colors"
                                                    >
                                                        Mark All Present
                                                    </button>
                                                    <button
                                                        onClick={() => handleSelectAll('A')}
                                                        className="px-3 py-1.5 bg-red-50 text-red-700 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-red-100 hover:bg-red-100 transition-colors"
                                                    >
                                                        Mark All Absent
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {!isEditable && (
                                        <div className="bg-amber-50 px-6 py-2 border-b border-amber-100 flex items-center justify-center">
                                            <AlertCircle className="w-4 h-4 text-amber-500 mr-2" />
                                            <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                                                View Only Mode - Editing disabled after 24 hours
                                            </span>
                                        </div>
                                    )}

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
                                                        <button
                                                            disabled={!isEditable}
                                                            onClick={() => {
                                                                const newStudents = students.map(s =>
                                                                    s.id === student.id ? { ...s, status: 'P' } : s
                                                                );
                                                                setStudents(newStudents);
                                                            }}
                                                            className={`w-24 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border transform active:scale-95 duration-200 
                                                                    ${student.status === 'P' ? 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-200' : 'bg-white text-gray-400 border-gray-200 hover:border-green-300 hover:text-green-500'}
                                                                    ${!isEditable ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
                                                                `}
                                                        >
                                                            Present
                                                        </button>
                                                        <button
                                                            disabled={!isEditable}
                                                            onClick={() => {
                                                                const newStudents = students.map(s =>
                                                                    s.id === student.id ? { ...s, status: 'A' } : s
                                                                );
                                                                setStudents(newStudents);
                                                            }}
                                                            className={`w-24 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border transform active:scale-95 duration-200 
                                                                    ${student.status === 'A' ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-200' : 'bg-white text-gray-400 border-gray-200 hover:border-red-300 hover:text-red-500'}
                                                                    ${!isEditable ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
                                                                `}
                                                        >
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
                            )
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StaffAttendance;
