import React, { useState } from 'react';
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
    X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';

const StaffExams = () => {
    const { role: authRole } = useAuth();
    const [modalOpen, setModalOpen] = useState(false);

    const exams = [
        { id: '1', name: 'Internal Exam 1', subject: 'Modern Operating Systems', program: 'M.Sc CS', year: '1st Year', date: '2025-02-10', time: '10:00 AM', status: 'Upcoming' },
        { id: '2', name: 'Internal Exam 1', subject: 'Advanced Database Systems', program: 'M.Sc CS', year: '2nd Year', date: '2025-02-11', time: '10:00 AM', status: 'Upcoming' },
        { id: '3', name: 'Class Test', subject: 'Machine Learning', program: 'M.Tech DS', year: '1st Year', date: '2025-01-25', time: '02:00 PM', status: 'Scheduled' },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar role={authRole || 'Staff'} />

            <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
                <header className="bg-white shadow-sm z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Examination Management</h1>
                            <p className="text-sm text-gray-500">Schedule exams and manage question papers</p>
                        </div>
                        <button
                            onClick={() => setModalOpen(true)}
                            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-red-100"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Schedule Exam
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {exams.map((exam) => (
                                <Card key={exam.id} className="p-0 border border-gray-100 hover:shadow-xl transition-all overflow-hidden flex flex-col group">
                                    <div className="h-2 bg-red-500"></div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-red-50 rounded-2xl text-red-600 group-hover:scale-110 transition-transform">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest ${exam.status === 'Upcoming' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                                {exam.status}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-black text-gray-900 leading-tight">{exam.name}</h3>
                                        <p className="text-xs font-bold text-red-600 tracking-widest uppercase mt-1">{exam.subject}</p>

                                        <div className="mt-6 space-y-3">
                                            <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                                                <Calendar className="w-3.5 h-3.5 mr-2 text-red-400" />
                                                {exam.date}
                                            </div>
                                            <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                                                <Clock className="w-3.5 h-3.5 mr-2 text-red-400" />
                                                {exam.time}
                                            </div>
                                            <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                                                <Users className="w-3.5 h-3.5 mr-2 text-red-400" />
                                                {exam.program} • {exam.year}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-auto flex border-t border-gray-50">
                                        <button className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors border-r border-gray-50">Edit</button>
                                        <button className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors">Results</button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </main>
            </div>

            {/* Modal placeholder */}
            {modalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-lg animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight underline decoration-red-500 decoration-4 underline-offset-8">New Examination</h3>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <p className="text-gray-500 font-medium">Exam scheduling feature is being connected to the core engine...</p>
                            <div className="flex gap-3 pt-6">
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="flex-1 py-3 bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-red-100 transition-all active:scale-95"
                                >
                                    Understood
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default StaffExams;
