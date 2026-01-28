import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebaseConfig';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { Users, Megaphone, CheckCircle, Lock, Crown, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const CRDashboard = () => {
    const { currentUser, role, userProfile, logout } = useAuth();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceMap, setAttendanceMap] = useState({});
    const [isAttendanceEnabled, setIsAttendanceEnabled] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [noticeTitle, setNoticeTitle] = useState('');
    const [noticeContent, setNoticeContent] = useState('');

    useEffect(() => {
        // Only attempt fetch if userProfile is loaded. 
        // If userProfile is null/undefined, we wait (loading stays true).
        // If userProfile is loaded but missing specific fields, we stop loading and show error.

        if (userProfile) {
            console.log("CRDashboard: userProfile loaded", userProfile);
            if (userProfile.assignedClass || (userProfile.program && userProfile.year)) {
                fetchClassData();
            } else {
                console.warn("CRDashboard: Missing program/year/assignedClass in profile.");
                setLoading(false);
            }
        }
    }, [userProfile]);

    const fetchClassData = async () => {
        setLoading(true);
        try {
            const { program, year } = userProfile;

            if (!program || !year) {
                console.error("CR Profile missing program/year during fetch", userProfile);
                setLoading(false);
                return;
            }

            console.log(`CRDashboard: Fetching students for ${program} Year ${year}`);

            const studentsRef = collection(db, 'students');
            const q = query(studentsRef, where('program', '==', program), where('year', '==', parseInt(year)));
            const snapshot = await getDocs(q);

            const studentList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })).sort((a, b) => (a.registerNumber || '').localeCompare(b.registerNumber || ''));

            console.log("CRDashboard: Students found:", studentList.length);
            setStudents(studentList);

            const initialMap = {};
            studentList.forEach(s => initialMap[s.id] = 'Present');
            setAttendanceMap(initialMap);

        } catch (error) {
            console.error("Error fetching class data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAttendanceChange = (studentId, status) => {
        setAttendanceMap(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const submitAttendance = async () => {
        if (!isAttendanceEnabled) return;
        setSubmitting(true);
        try {
            const subject = "Class Attendance";

            // In a real app, use batched writes
            for (const student of students) {
                await addDoc(collection(db, 'attendance'), {
                    studentId: student.id,
                    studentName: student.name,
                    date: attendanceDate,
                    status: attendanceMap[student.id],
                    subjectName: subject,
                    markedBy: currentUser.uid,
                    markedByRole: 'CR',
                    createdAt: new Date().toISOString()
                });
            }

            alert('Attendance Submitted Successfully');
        } catch (error) {
            console.error("Error submitting attendance:", error);
            alert('Failed to submit attendance');
        } finally {
            setSubmitting(false);
        }
    };

    const postNotice = async () => {
        if (!noticeTitle.trim() || !noticeContent.trim()) return;
        try {
            await addDoc(collection(db, 'notices'), {
                title: noticeTitle,
                content: noticeContent,
                category: 'Class',
                targetClass: `${userProfile.program}-${userProfile.year}`,
                postedBy: currentUser.uid,
                createdAt: new Date().toISOString()
            });
            setNoticeTitle('');
            setNoticeContent('');
            alert('Notice Posted!');
        } catch (e) {
            alert('Error posting notice');
        }
    };



    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar role="cr" />

            <div className="flex-1 flex flex-col ml-0 lg:ml-64 transition-all duration-300 relative font-sans">
                {/* Background Animations */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-200/30 rounded-full blur-[100px] animate-blob"></div>
                    <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-amber-200/30 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-yellow-200/30 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
                    <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
                </div>

                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center">
                                <Crown className="mr-3 text-orange-500" />
                                CR Portal
                            </h1>
                            <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest">
                                Class Representative • {userProfile?.program} {userProfile?.year && `- Year ${userProfile.year}`}
                            </p>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar relative z-10">
                    <div className="max-w-7xl mx-auto">
                        {/* Tabs */}
                        <div className="flex justify-center mb-8">
                            <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-2xl inline-flex shadow-sm border border-white/60">
                                {['overview', 'attendance', 'notices'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === tab
                                            ? 'bg-white text-orange-600 shadow-md shadow-orange-100'
                                            : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeTab === 'overview' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-sm hover:shadow-xl transition-all group">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-orange-50 rounded-2xl group-hover:scale-110 transition-transform">
                                                <Users className="w-6 h-6 text-orange-500" />
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Count</span>
                                        </div>
                                        <h3 className="text-3xl font-black text-gray-900 mb-1">{students.length}</h3>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Students in Class</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'attendance' && (
                                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100/50 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
                                        <div>
                                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Daily Attendance</h2>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Date: {attendanceDate}</p>
                                        </div>

                                        {isAttendanceEnabled ? (
                                            <button
                                                onClick={submitAttendance}
                                                disabled={submitting}
                                                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-orange-200 transition-all flex items-center gap-2 disabled:opacity-70 transform active:scale-95"
                                            >
                                                {submitting ? 'Submitting...' : <><CheckCircle size={16} /> Submit Attendance</>}
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border border-amber-100">
                                                <Lock size={14} />
                                                <span>Locked</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-gray-50/80 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                                                <tr>
                                                    <th className="px-6 py-4">Reg. No</th>
                                                    <th className="px-6 py-4">Student Name</th>
                                                    <th className="px-6 py-4 text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100/50">
                                                {students.map(student => (
                                                    <tr key={student.id} className="hover:bg-orange-50/30 transition-colors group">
                                                        <td className="px-6 py-4 font-bold text-xs text-gray-500">{student.registerNumber}</td>
                                                        <td className="px-6 py-4 font-bold text-sm text-gray-900 group-hover:text-orange-600 transition-colors">{student.name}</td>
                                                        <td className="px-6 py-4 text-center">
                                                            <div className="flex justify-center gap-2">
                                                                <button
                                                                    onClick={() => handleAttendanceChange(student.id, 'Present')}
                                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-all ${attendanceMap[student.id] === 'Present'
                                                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 scale-110'
                                                                        : 'bg-gray-100 text-gray-400 hover:bg-emerald-50 hover:text-emerald-500'
                                                                        }`}
                                                                >
                                                                    P
                                                                </button>
                                                                <button
                                                                    onClick={() => handleAttendanceChange(student.id, 'Absent')}
                                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-all ${attendanceMap[student.id] === 'Absent'
                                                                        ? 'bg-red-500 text-white shadow-lg shadow-red-200 scale-110'
                                                                        : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500'
                                                                        }`}
                                                                >
                                                                    A
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notices' && (
                                <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-8">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-3 bg-orange-100 rounded-2xl">
                                            <Megaphone className="w-6 h-6 text-orange-600" />
                                        </div>
                                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Post Class Notice</h2>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Title</label>
                                            <input
                                                type="text"
                                                value={noticeTitle}
                                                onChange={(e) => setNoticeTitle(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                                placeholder="e.g. Tomorrow's Test Syllabus"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Content</label>
                                            <textarea
                                                value={noticeContent}
                                                onChange={(e) => setNoticeContent(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none h-32 resize-none transition-all"
                                                placeholder="Type your message here..."
                                            />
                                        </div>
                                        <button
                                            onClick={postNotice}
                                            className="w-full bg-gray-900 hover:bg-black text-white px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-gray-200 transform active:scale-95"
                                        >
                                            Post Notice
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CRDashboard;
