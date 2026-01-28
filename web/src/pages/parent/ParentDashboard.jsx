import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import Card from '../../components/Card';
import {
    User,
    Calendar,
    CheckSquare,
    CreditCard,
    FileText,
    Bell,
    TrendingUp,
    AlertCircle,
    Info
} from 'lucide-react';

const ParentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [generalNotices, setGeneralNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.uid) return;

            try {
                // 1. Fetch Parent Profile to get linked Student ID
                let parentDoc = await getDoc(doc(db, 'parents', user.uid));
                if (!parentDoc.exists()) {
                    // Fallback to strict router pattern if parent data is in users only (less likely due to profile creation logic)
                    parentDoc = await getDoc(doc(db, 'users', user.uid));
                }

                if (!parentDoc.exists()) {
                    throw new Error("Parent profile not found.");
                }

                const parentData = parentDoc.data();
                const studentId = parentData.linkedStudentId;

                if (!studentId) {
                    throw new Error("No student linked to this parent account.");
                }

                // 2. Fetch Student Profile
                let studentDoc = await getDoc(doc(db, 'students', studentId));

                if (studentDoc.exists()) {
                    setStudent({ id: studentDoc.id, ...studentDoc.data() });
                } else {
                    throw new Error(`Student data not found for ID: ${studentId}`);
                }

                // 3. Fetch Personal Notifications
                const notificationsQ = query(
                    collection(db, 'notifications'),
                    where('targetStudentId', '==', studentId),
                    orderBy('createdAt', 'desc'),
                    limit(10)
                );
                const notificationsSnap = await getDocs(notificationsQ);
                setNotifications(notificationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // 4. Fetch General Notices
                const noticesQ = query(collection(db, 'notices'), orderBy('createdAt', 'desc'), limit(5));
                const noticesSnap = await getDocs(noticesQ);
                setGeneralNotices(noticesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            } catch (err) {
                console.error("Dashboard error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar role="Parent" />
                <div className="flex-1 ml-0 lg:ml-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar role="Parent" />
                <div className="flex-1 ml-0 lg:ml-64 p-8">
                    <div className="bg-red-50 border-l-4 border-red-500 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-red-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">Error: {error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar role="Parent" />
            <main className="flex-1 ml-0 lg:ml-64 p-4 sm:p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Parent Dashboard</h1>
                    <p className="text-gray-500">Welcome, Parent of {student?.name}</p>
                </header>

                {/* Student Overview Card */}
                {student && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                                    {student.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{student.name}</h2>
                                    <p className="text-gray-500">{student.registerNumber}</p>
                                    <p className="text-sm text-gray-400 mt-1">{student.program} - Year {student.year}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${student.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {student.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <DashboardCard
                        title="Attendance"
                        value="Check"
                        icon={CheckSquare}
                        color="blue"
                    />
                    <DashboardCard
                        title="Fees"
                        value="Status"
                        icon={CreditCard}
                        color="green"
                    />
                    <DashboardCard
                        title="Alerts"
                        value={`${notifications.length} New`}
                        icon={Bell}
                        color={notifications.length > 0 ? "orange" : "gray"}
                    />
                    <DashboardCard
                        title="Notices"
                        value={`${generalNotices.length} New`}
                        icon={Info}
                        color="purple"
                    />
                </div>

                {/* Recent Notifications Section */}
                {notifications.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Alerts</h3>
                        <div className="space-y-3">
                            {notifications.map((notif) => (
                                <div key={notif.id} className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-start">
                                    <Bell className="w-5 h-5 text-orange-600 mr-3 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{notif.message}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(notif.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <Card title="Quick Actions">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <QuickActionButton label="Attendance" icon={CheckSquare} onClick={() => navigate('/parent/attendance')} />
                        <QuickActionButton label="Exam Results" icon={FileText} onClick={() => navigate('/parent/results')} />
                        <QuickActionButton label="View Timetable" icon={Calendar} onClick={() => navigate('/parent/timetable')} />
                        <QuickActionButton label="Pay Fees" icon={CreditCard} onClick={() => navigate('/parent/fees')} />
                    </div>
                </Card>
            </main>
        </div>
    );
};

const DashboardCard = ({ title, value, icon: Icon, color }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
        gray: 'bg-gray-50 text-gray-600'
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[color] || colorClasses.gray}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
};

const QuickActionButton = ({ label, icon: Icon, onClick }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
        <Icon className="w-6 h-6 text-gray-600 mb-2" />
        <span className="text-sm font-medium text-gray-700">{label}</span>
    </button>
);

export default ParentDashboard;
