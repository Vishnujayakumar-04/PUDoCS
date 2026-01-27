import React, { useState, useEffect } from 'react';
import {
    FileText,
    Plus,
    Search,
    Calendar,
    ChevronRight,
    Loader2,
    BookOpen,
    Clock,
    MapPin,
    AlertCircle,
    CheckCircle,
    Edit2,
    Save,
    X,
    Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { staffService } from '../../services/staffService';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import { staffMapping } from '../../data/staffMapping';
import { staffData } from '../../data/staffData';

const StaffExams = () => {
    const { user, role: authRole } = useAuth();
    const [modalOpen, setModalOpen] = useState(false);
    const [exams, setExams] = useState([]);
    const [assignedClasses, setAssignedClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [newExam, setNewExam] = useState({
        name: '',
        classId: '',
        className: '',
        subject: '',
        date: '',
        time: '',
        examType: 'internal'
    });

    useEffect(() => {
        const fetchData = async () => {
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

                    // Set Assigned Classes for Dropdown
                    const classesList = mappings.map((item, index) => ({
                        id: index, // Use index or generate ID if missing
                        name: item.class,
                        subject: item.subject
                    }));
                    setAssignedClasses(classesList);

                    // Fetch real exams from Firestore
                    try {
                        const allExams = await staffService.getExams();

                        // Filter exams relevant to this staff (matching class or subject)
                        // Normalize strings for comparison
                        const relevantExams = allExams.filter(exam =>
                            classesList.some(cls =>
                                (cls.name === exam.program) ||
                                (cls.subject === exam.subject)
                            )
                        );

                        setExams(relevantExams);
                    } catch (err) {
                        console.error("Error loading exams:", err);
                        // Fallback to empty if error
                        setExams([]);
                    }
                }
            }
            setLoading(false);
        };
        fetchData();
    }, [user]);

    const handleCreateExam = async (e) => {
        e.preventDefault();
        try {
            if (!newExam.classId || !newExam.date || !newExam.name) {
                alert("Please fill in all required fields");
                return;
            }

            const payload = {
                ...newExam,
                program: newExam.className, // Simplify for display
                status: 'Upcoming',
                year: new Date(newExam.date).getFullYear().toString()
            };

            const result = await staffService.scheduleExam(payload);

            if (result.success) {
                // Update local state
                setExams([...exams, { ...payload, id: result.id }]);
                setModalOpen(false);
                setNewExam({ name: '', classId: '', className: '', subject: '', date: '', time: '', examType: 'internal' });
                alert("Exam scheduled successfully!");
            }
        } catch (error) {
            console.error("Failed to schedule exam", error);
            alert("Failed to schedule exam. Please try again.");
        }
    };

    const handleClassChange = (e) => {
        const clsId = e.target.value;
        const cls = assignedClasses.find(c => c.id.toString() === clsId);
        if (cls) {
            setNewExam({
                ...newExam,
                classId: clsId,
                className: cls.name,
                subject: cls.subject
            });
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-gray-50 overflow-hidden flex">
            {/* Background Animations */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-200/30 rounded-full blur-[100px] animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-orange-200/30 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-rose-200/30 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
            </div>

            <Sidebar role={authRole || 'Staff'} />

            <div className="flex-1 flex flex-col relative z-10 lg:ml-64 transition-all duration-300">
                <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center">
                                <FileText className="mr-3 text-red-600" />
                                Examination Management
                            </h1>
                            <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest">Schedule exams and manage question papers</p>
                        </div>
                        <button
                            onClick={() => setModalOpen(true)}
                            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-red-200 hover:shadow-red-300 transform active:scale-95"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Schedule
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {exams.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {exams.map((exam) => (
                                    <div key={exam.id} className="group bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/50 hover:shadow-xl hover:shadow-red-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden relative">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-50 to-orange-50 rounded-bl-full z-0 group-hover:scale-150 transition-transform duration-500"></div>

                                        <div className="p-6 relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-3 bg-red-50 rounded-2xl text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest ${exam.status === 'Upcoming' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                                                    {exam.status}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-black text-gray-900 leading-tight mb-2 group-hover:text-red-700 transition-colors">{exam.name}</h3>
                                            <p className="text-[10px] font-bold text-red-600 tracking-widest uppercase mb-6 line-clamp-2 min-h-[2.5em]">{exam.subject}</p>

                                            <div className="space-y-3 bg-white/50 p-4 rounded-xl border border-gray-100/50">
                                                <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                                                    <Calendar className="w-3.5 h-3.5 mr-3 text-red-400" />
                                                    {exam.date}
                                                </div>
                                                <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                                                    <Clock className="w-3.5 h-3.5 mr-3 text-red-400" />
                                                    {exam.time}
                                                </div>
                                                <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                                                    <Users className="w-3.5 h-3.5 mr-3 text-red-400" />
                                                    {exam.program} • {exam.year}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-auto flex border-t border-gray-100/50 divide-x divide-gray-100/50">
                                            <button className="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 hover:text-red-600 transition-colors">Edit Details</button>
                                            <button className="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors">View Results</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-200">
                                <div className="inline-flex p-4 bg-gray-50 rounded-full mb-4">
                                    <FileText className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium">No exams currently scheduled for your subjects.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center">
                                <Plus className="w-5 h-5 mr-2 text-red-600" />
                                Schedule New Exam
                            </h3>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-lg">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateExam} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Exam Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Internal Assessment 1"
                                    value={newExam.name}
                                    onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Class</label>
                                <select
                                    value={newExam.classId}
                                    onChange={handleClassChange}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium appearance-none"
                                    required
                                >
                                    <option value="">Select a Class</option>
                                    {assignedClasses.map(cls => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Subject</label>
                                <input
                                    type="text"
                                    value={newExam.subject}
                                    readOnly
                                    className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-200 text-gray-500 cursor-not-allowed font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Exam Type</label>
                                <select
                                    value={newExam.examType}
                                    onChange={(e) => setNewExam({ ...newExam, examType: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium appearance-none"
                                    required
                                >
                                    <option value="internal">Internal Test</option>
                                    <option value="semester">Semester Exam</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Date</label>
                                    <input
                                        type="date"
                                        value={newExam.date}
                                        onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Time</label>
                                    <input
                                        type="time"
                                        value={newExam.time}
                                        onChange={(e) => setNewExam({ ...newExam, time: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-red-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-200"
                                >
                                    Create Exam
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffExams;
