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
    ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { staffService } from '../../services/staffService';
import Sidebar from '../../components/Sidebar';

const StaffDashboard = () => {
    const { user, logout } = useAuth();
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
        { title: 'My Students', path: '/staff/students', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Attendance', path: '/staff/attendance', icon: CalendarCheck, color: 'text-green-600', bg: 'bg-green-50' },
        { title: 'Gallery', path: '/staff/gallery', icon: ImageIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
        { title: 'Timetable', path: '/staff/timetable', icon: CalendarClock, color: 'text-orange-600', bg: 'bg-orange-50' },
        { title: 'Exams', path: '/staff/exams', icon: FileText, color: 'text-red-600', bg: 'bg-red-50' },
        { title: 'Internals', path: '/staff/internals', icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { title: 'Notices', path: '/staff/notices', icon: Bell, color: 'text-pink-600', bg: 'bg-pink-50' },
        { title: 'Events', path: '/staff/events', icon: Calendar, color: 'text-teal-600', bg: 'bg-teal-50' },
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
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-sm z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Staff Portal</h1>
                                <p className="text-sm text-gray-500">Faculty Management Dashboard</p>
                            </div>

                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setNotificationModalOpen(true)}
                                    className="p-2 rounded-full hover:bg-gray-100 relative"
                                >
                                    <Bell className="h-6 w-6 text-gray-600" />
                                    {notifications.length > 0 && (
                                        <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                                    )}
                                </button>

                                <div
                                    className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                                    onClick={() => navigate('/staff/profile')}
                                >
                                    <div className="h-9 w-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                                        {profile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="hidden md:block text-right">
                                        <p className="text-sm font-medium text-gray-900">{profile?.name || 'Staff Member'}</p>
                                        <p className="text-xs text-gray-500">{profile?.designation || 'Faculty'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-8">

                        {/* Welcome Card */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                            <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform translate-x-12"></div>
                            <div className="relative z-10">
                                <h2 className="text-3xl font-bold mb-2">
                                    Welcome, {profile?.name?.split(' ')[0] || 'Staff'}!
                                </h2>
                                <p className="text-blue-100 text-lg">
                                    {profile?.designation || 'Faculty'} • {profile?.department || 'Computer Science'}
                                </p>
                            </div>
                        </div>

                        {/* Quick Access Grid */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <Clock className="w-5 h-5 mr-2 text-gray-500" />
                                Quick Access
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {features.map((feature, index) => (
                                    <button
                                        key={index}
                                        onClick={() => navigate(feature.path)}
                                        className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all group"
                                    >
                                        <div className={`p-4 rounded-full ${feature.bg} mb-4 group-hover:scale-110 transition-transform`}>
                                            <feature.icon className={`h-6 w-6 ${feature.color}`} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">{feature.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Upcoming Exams */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                    <h3 className="font-bold text-gray-900 flex items-center">
                                        <FileText className="w-5 h-5 mr-2 text-gray-500" />
                                        Upcoming Exams
                                    </h3>
                                    <button onClick={() => navigate('/staff/exams')} className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</button>
                                </div>
                                <div className="p-4">
                                    {upcomingExams.length > 0 ? (
                                        <div className="space-y-4">
                                            {upcomingExams.slice(0, 3).map((exam) => (
                                                <div key={exam.id || exam._id} className="flex items-start p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className="font-semibold text-gray-900">{exam.name || exam.subject}</h4>
                                                            <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 font-medium">
                                                                {exam.examType || 'Exam'}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-1">{exam.subject || exam.program}</p>
                                                        <p className="text-xs text-gray-500 flex items-center">
                                                            <Calendar className="w-3 h-3 mr-1" />
                                                            {formatDate(exam.date)} {exam.startTime ? `• ${exam.startTime}` : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>No upcoming exams scheduled</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Recent Notices */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                    <h3 className="font-bold text-gray-900 flex items-center">
                                        <Bell className="w-5 h-5 mr-2 text-gray-500" />
                                        Recent Notices
                                    </h3>
                                    <button onClick={() => navigate('/staff/notices')} className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</button>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {notices.length > 0 ? (
                                        notices.map((notice, index) => (
                                            <div key={index} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/staff/notices')}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCategoryColor(notice.category)}`}>
                                                        {notice.category || 'General'}
                                                    </span>
                                                    <span className="text-xs text-gray-500">{formatDate(notice.createdAt)}</span>
                                                </div>
                                                <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">{notice.title}</h4>
                                                <p className="text-xs text-gray-600 line-clamp-2">{notice.content}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>No new notices</p>
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
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setNotificationModalOpen(false)}>
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <Bell className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">Notifications</h3>
                                            <button onClick={() => setNotificationModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                        <div className="mt-2 text-left">
                                            <div className="space-y-3">
                                                {notifications.map((notification) => (
                                                    <div key={notification.id} className="p-3 bg-gray-50 rounded-lg">
                                                        <p className="text-sm text-gray-800">{notification.message}</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {new Date(notification.date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => setNotificationModalOpen(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffDashboard;
