import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    CalendarCheck,
    Image as ImageIcon,
    CalendarClock,
    FileText,
    BookOpen,
    Bell,
    Calendar,
    UserCircle,
    X,
    Clock,
    Briefcase,
    MapPin,
    Mail,
    LogOut,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { staffService } from '../../services/staffService';
import Sidebar from '../../components/Sidebar';

const StaffDashboard = () => {
    const { user, logout, role: authRole } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [notices, setNotices] = useState([]);
    const [events, setEvents] = useState([]);
    const [upcomingExams, setUpcomingExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notificationModalOpen, setNotificationModalOpen] = useState(false);

    // Static notifications
    const notifications = [
        { id: '1', message: 'Examination results have been published.', date: new Date().toISOString() },
        { id: '2', message: 'The college will reopen on 19-01-2026.', date: new Date().toISOString() },
    ];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const profileData = await staffService.getProfile(user?.uid, user?.email);
            setProfile(profileData);

            const dashboardData = await staffService.getDashboard(user?.uid);
            const noticesData = await staffService.getNotices();
            const eventsData = await staffService.getEvents();

            setNotices(noticesData.slice(0, 3));
            setEvents(eventsData.slice(0, 5));
            setUpcomingExams(dashboardData?.upcomingExams || []);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    const features = [
        { title: 'My Students', path: '/staff/students', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
        { title: 'Attendance', path: '/staff/attendance', icon: CalendarCheck, color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
        { title: 'Gallery', path: '/staff/gallery', icon: ImageIcon, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
        { title: 'Timetable', path: '/staff/timetable', icon: CalendarClock, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
        { title: 'Exams', path: '/staff/exams', icon: FileText, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
        { title: 'Internals', path: '/staff/internals', icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
        { title: 'Notices', path: '/staff/notices', icon: Bell, color: 'text-pink-600', bg: 'bg-pink-50 border-pink-100' },
        { title: 'Events', path: '/staff/events', icon: Calendar, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-100' },
    ];

    const getCategoryColor = (category) => {
        switch (category?.toLowerCase()) {
            case 'academic': return 'bg-blue-100 text-blue-800';
            case 'exam': return 'bg-yellow-100 text-yellow-800';
            case 'event': return 'bg-purple-100 text-purple-800';
            case 'administrative': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
                {/* Glassmorphic Header */}
                <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div>
                                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">Staff Portal</h1>
                                <p className="text-xs font-semibold text-gray-500 tracking-wide uppercase">Faculty Management Dashboard</p>
                            </div>

                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setNotificationModalOpen(true)}
                                    className="p-2 rounded-full hover:bg-gray-100/50 transition-colors relative"
                                >
                                    <Bell className="h-6 w-6 text-gray-600" />
                                    {notifications.length > 0 && (
                                        <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white ring-1 ring-red-100 animate-pulse"></span>
                                    )}
                                </button>

                                <div
                                    className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100/50 p-2 rounded-xl transition-all duration-200"
                                    onClick={() => navigate('/staff/profile')}
                                >
                                    <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg shadow-blue-500/30 flex items-center justify-center text-white font-bold border border-white/20 transform hover:rotate-3 transition-transform">
                                        {profile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="hidden md:block text-right">
                                        <p className="text-sm font-bold text-gray-900">{profile?.name || 'Staff Member'}</p>
                                        <p className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">{profile?.designation || 'Faculty'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Welcome Card */}
                        <div className="relative overflow-hidden rounded-3xl shadow-xl shadow-indigo-500/20 group">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                            {/* Decorative Circles */}
                            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
                            <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700 delay-100"></div>

                            <div className="relative p-8 md:p-10 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium mb-3 border border-white/10">
                                        <Sparkles className="w-3 h-3 mr-1.5 text-yellow-300" />
                                        Have a great day!
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
                                        Welcome back, {profile?.name?.split(' ')[0] || 'Staff'}!
                                    </h2>
                                    <p className="text-blue-100/90 text-lg font-medium max-w-xl">
                                        {profile?.designation || 'Faculty'} • {profile?.department || 'Computer Science Department'}
                                    </p>
                                </div>
                                <div className="hidden md:block">
                                    <div className="h-24 w-24 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-2xl flex items-center justify-center transform rotate-6 group-hover:rotate-12 transition-transform duration-500">
                                        <CalendarClock className="w-10 h-10 text-white drop-shadow-md" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Access Grid */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center">
                                <Clock className="w-5 h-5 mr-2 text-indigo-500" />
                                Quick Actions
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                                {features.map((feature, index) => (
                                    <button
                                        key={index}
                                        onClick={() => navigate(feature.path)}
                                        className="relative flex flex-col items-center justify-center p-6 bg-white/60 backdrop-blur-xl rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-white/50 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
                                    >
                                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${feature.bg.replace('bg-', 'from-').split(' ')[0]}/20 to-white`}></div>
                                        <div className={`p-4 rounded-2xl ${feature.bg} mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 relative z-10 shadow-sm`}>
                                            <feature.icon className={`h-7 w-7 ${feature.color}`} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 relative z-10 transition-colors">{feature.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Upcoming Exams */}
                            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/50 overflow-hidden hover:shadow-md transition-all duration-300">
                                <div className="p-5 border-b border-gray-100/50 flex justify-between items-center bg-white/50">
                                    <h3 className="font-bold text-gray-900 flex items-center">
                                        <FileText className="w-5 h-5 mr-2 text-red-500" />
                                        Upcoming Exams
                                    </h3>
                                    <button onClick={() => navigate('/staff/exams')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider px-3 py-1 rounded-lg hover:bg-indigo-50 transition-colors">View All</button>
                                </div>
                                <div className="p-5">
                                    {upcomingExams.length > 0 ? (
                                        <div className="space-y-4">
                                            {upcomingExams.slice(0, 3).map((exam) => (
                                                <div key={exam.id || exam._id} className="flex items-start p-4 bg-white rounded-xl border border-gray-100 hover:border-indigo-100 hover:shadow-sm transition-all group">
                                                    <div className="h-10 w-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center mr-4 group-hover:bg-red-100 transition-colors">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className="font-bold text-gray-900">{exam.name || exam.subject}</h4>
                                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-bold uppercase tracking-wide">
                                                                {exam.examType || 'Exam'}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-2 font-medium">{exam.subject || exam.program}</p>
                                                        <p className="text-xs text-gray-400 font-bold flex items-center uppercase tracking-wide">
                                                            <Calendar className="w-3 h-3 mr-1.5" />
                                                            {formatDate(exam.date)} {exam.startTime ? `• ${exam.startTime}` : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="inline-flex p-3 bg-gray-50 rounded-full mb-3 text-gray-300">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <p className="text-gray-400 font-medium">No upcoming exams scheduled</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Recent Notices */}
                            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/50 overflow-hidden hover:shadow-md transition-all duration-300">
                                <div className="p-5 border-b border-gray-100/50 flex justify-between items-center bg-white/50">
                                    <h3 className="font-bold text-gray-900 flex items-center">
                                        <Bell className="w-5 h-5 mr-2 text-pink-500" />
                                        Recent Notices
                                    </h3>
                                    <button onClick={() => navigate('/staff/notices')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider px-3 py-1 rounded-lg hover:bg-indigo-50 transition-colors">View All</button>
                                </div>
                                <div className="divide-y divide-gray-100/70">
                                    {notices.length > 0 ? (
                                        notices.map((notice, index) => (
                                            <div key={index} className="p-5 hover:bg-white/80 transition-colors cursor-pointer group" onClick={() => navigate('/staff/notices')}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${getCategoryColor(notice.category)}`}>
                                                        {notice.category || 'General'}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-bold">{formatDate(notice.createdAt)}</span>
                                                </div>
                                                <h4 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">{notice.title}</h4>
                                                <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">{notice.content}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="inline-flex p-3 bg-gray-50 rounded-full mb-3 text-gray-300">
                                                <Bell className="w-6 h-6" />
                                            </div>
                                            <p className="text-gray-400 font-medium">No new notices</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>

            {/* Notifications Modal */}
            {notificationModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                <Bell className="w-5 h-5 mr-2 text-indigo-600" />
                                Notifications
                            </h3>
                            <button onClick={() => setNotificationModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <div className="space-y-3">
                                {notifications.map((notification) => (
                                    <div key={notification.id} className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl relative hover:bg-indigo-50 transition-colors">
                                        <div className="flex start gap-3">
                                            <div className="h-2 w-2 rounded-full bg-indigo-500 mt-2"></div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 leading-relaxed">{notification.message}</p>
                                                <p className="text-xs text-gray-400 font-bold mt-2 uppercase tracking-wide">
                                                    {new Date(notification.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                            <button
                                type="button"
                                className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-3 bg-indigo-600 text-base font-bold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm tracking-wide transition-colors"
                                onClick={() => setNotificationModalOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffDashboard;
