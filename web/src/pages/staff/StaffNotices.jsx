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
        <div className="flex h-screen bg-gray-50">
            <Sidebar role={authRole || 'Staff'} />

            <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
                <header className="bg-white shadow-sm z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center">
                                <Bell className="mr-3 text-pink-600" />
                                Announcement Hub
                            </h1>
                            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest italic">Department Communication Log</p>
                        </div>
                        <button
                            onClick={() => setModalOpen(true)}
                            className="flex items-center px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-pink-100"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Compose Notice
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto space-y-6">

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
                            </div>
                        ) : notices.length > 0 ? (
                            notices.map((notice) => (
                                <Card key={notice.id} className="border-l-4 border-l-pink-500 hover:shadow-xl transition-all group p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getCategoryStyle(notice.category)}`}>
                                            {notice.category?.toUpperCase() || 'GENERAL'}
                                        </div>
                                        <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            <Clock className="w-3.5 h-3.5 mr-1" />
                                            {new Date(notice.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight leading-tight mb-2">{notice.title}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">{notice.content}</p>
                                    <div className="mt-6 flex items-center justify-between">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[8px] font-black">ST</div>
                                            ))}
                                        </div>
                                        <button className="text-[10px] font-black uppercase tracking-widest text-pink-600 flex items-center group-hover:underline">
                                            Read Comments <MessageSquare className="w-3 h-3 ml-1" />
                                        </button>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                <Bell className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase">Dashboard Clear</h3>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">No pending announcements in your feed.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Modal placeholder */}
            {modalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-lg animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight underline decoration-pink-500 decoration-4 underline-offset-8">Draft Notice</h3>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-pink-500 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <p className="text-gray-500 font-medium mb-6">Drafting system is currently in read-only mode for faculty accounts. Use the Office Portal for school-wide broadcasts.</p>
                        <button
                            onClick={() => setModalOpen(false)}
                            className="w-full py-3 bg-pink-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-pink-100 transition-all active:scale-95"
                        >
                            Confirm
                        </button>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default StaffNotices;
