import React, { useState, useEffect } from 'react';
import {
    Bell,
    Plus,
    Search,
    Edit2,
    Trash2,
    Calendar,
    Tag,
    Clock,
    X,
    MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { staffService } from '../../services/staffService';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Button from '../../components/Button';

const StaffNotices = () => {
    const { role: authRole } = useAuth();
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'General'
    });

    useEffect(() => {
        loadNotices();
    }, []);

    const loadNotices = async () => {
        try {
            setLoading(true);
            const data = await staffService.getNotices();
            setNotices(data);
        } catch (error) {
            console.error('Error loading notices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        alert('Action restricted. Please contact office for global announcements.');
        setModalOpen(false);
    };

    const getCategoryStyle = (category) => {
        switch (category?.toLowerCase()) {
            case 'academic': return 'border-blue-500 text-blue-600 bg-blue-50';
            case 'exam': return 'border-red-500 text-red-600 bg-red-50';
            case 'event': return 'border-purple-500 text-purple-600 bg-purple-50';
            default: return 'border-gray-500 text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="relative min-h-screen bg-gray-50 overflow-hidden flex">
            {/* Background Animations */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-200/30 rounded-full blur-[100px] animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-blue-200/30 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-purple-200/30 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
            </div>

            <Sidebar role={authRole || 'Staff'} />

            <div className="flex-1 flex flex-col relative z-10 lg:ml-64 transition-all duration-300">
                <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center">
                                <Bell className="mr-3 text-pink-600" />
                                Announcement Hub
                            </h1>
                            <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest italic">Department Communication Log</p>
                        </div>
                        <button
                            onClick={() => setModalOpen(true)}
                            className="flex items-center px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-pink-200 hover:shadow-pink-300 transform active:scale-95"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Compose
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
                            </div>
                        ) : notices.length > 0 ? (
                            notices.map((notice) => (
                                <div key={notice.id} className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/50 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                                    <div className={`absolute top-0 left-0 w-1.5 h-full ${notice.category === 'Exam' ? 'bg-red-500' : notice.category === 'Academic' ? 'bg-blue-500' : 'bg-pink-500'}`}></div>

                                    <div className="flex justify-between items-start mb-4 pl-3">
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getCategoryStyle(notice.category)}`}>
                                            {notice.category?.toUpperCase() || 'GENERAL'}
                                        </div>
                                        <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-lg">
                                            <Clock className="w-3.5 h-3.5 mr-1.5" />
                                            {new Date(notice.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight leading-tight mb-3 pl-3 group-hover:text-pink-600 transition-colors">{notice.title}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed pl-3 font-medium bg-white/40 p-3 rounded-xl border border-white/50 text-justify">{notice.content}</p>

                                    <div className="mt-6 flex items-center justify-between pl-3 pt-4 border-t border-gray-100/50">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-7 w-7 rounded-full border-2 border-white bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-[8px] font-black text-gray-600 shadow-sm">UID</div>
                                            ))}
                                        </div>
                                        <button className="text-[10px] font-black uppercase tracking-widest text-pink-600 flex items-center hover:bg-pink-50 px-3 py-1.5 rounded-lg transition-colors">
                                            Read Comments <MessageSquare className="w-3.5 h-3.5 ml-2" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-200">
                                <div className="inline-flex p-4 bg-gray-50 rounded-full mb-4">
                                    <Bell className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase">Dashboard Clear</h3>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">No pending announcements in your feed.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Modal placeholder */}
            {modalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center">
                                <Edit2 className="w-5 h-5 mr-2 text-pink-600" />
                                Draft Notice
                            </h3>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-pink-500 p-2 hover:bg-pink-50 rounded-xl transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-8 text-center space-y-6">
                            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Tag className="w-8 h-8 text-pink-600" />
                            </div>
                            <p className="text-gray-600 font-bold text-lg leading-relaxed">System Restriction</p>
                            <p className="text-gray-500 text-sm font-medium">Drafting system is currently in read-only mode for faculty accounts. Please contact the Office Administrator for school-wide broadcasts.</p>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="w-full py-3 bg-pink-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-pink-200 hover:bg-pink-700 transition-all active:scale-95"
                            >
                                Acknowledge
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffNotices;
