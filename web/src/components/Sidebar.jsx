import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    User,
    Calendar,
    CheckSquare,
    FileText,
    CreditCard,
    Image as ImageIcon,
    LogOut,
    Bell,
    Building2,
    Users,
    Settings,
    Menu,
    X,
    GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ role = 'Student' }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const activeClass = "flex items-center space-x-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl transition-all duration-200 font-medium";
    const inactiveClass = "flex items-center space-x-3 px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-all duration-200 font-medium";

    const studentLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Profile', path: '/student/profile', icon: User },
        { name: 'Staff Directory', path: '/student/staff-directory', icon: Users },
        { name: 'Students', path: '/student/directory', icon: Users },
        { name: 'Timetable', path: '/student/timetable', icon: Calendar },
        { name: 'Syllabus', path: '/student/syllabus', icon: FileText },
        { name: 'Attendance', path: '/student/attendance', icon: CheckSquare },
        { name: 'Internal Marks', path: '/student/results', icon: FileText },
        { name: 'Exam Schedules', path: '/student/exams', icon: Calendar },
        { name: 'Fees', path: '/student/fees', icon: CreditCard },
        { name: 'Notices', path: '/student/notices', icon: Bell },
        { name: 'Gallery', path: '/student/gallery', icon: ImageIcon },
    ];

    const staffLinks = [
        { name: 'Dashboard', path: '/staff/dashboard', icon: LayoutDashboard },
        { name: 'My Class', path: '/staff/my-class', icon: GraduationCap },
        // Attendance and Internals removed as per request - accessible only via My Class
        { name: 'Exam Schedule', path: '/staff/exams', icon: FileText },
        { name: 'Timetable', path: '/staff/timetable', icon: Calendar },
        { name: 'My Students', path: '/staff/students', icon: Users },
        { name: 'Staff Directory', path: '/staff/staff-directory', icon: Users },
        { name: 'Notices', path: '/staff/notices', icon: Bell },
        { name: 'Events', path: '/staff/events', icon: Calendar },
        { name: 'Gallery', path: '/staff/gallery', icon: ImageIcon },
        { name: 'Profile', path: '/staff/profile', icon: User },
    ];

    const officeLinks = [
        { name: 'Dashboard', path: '/office/dashboard', icon: LayoutDashboard },
        { name: 'Staff Directory', path: '/office/staff-directory', icon: Users },
        { name: 'Student Directory', path: '/office/students', icon: Users },
        { name: 'Fee Mgmt', path: '/office/fees', icon: CreditCard },
        { name: 'Admissions', path: '/office/admissions', icon: FileText },
        { name: 'Timetable', path: '/office/timetable', icon: Calendar },
        { name: 'Notices', path: '/office/notices', icon: Bell },
        { name: 'Events', path: '/office/events', icon: Calendar },
        { name: 'Letters', path: '/office/letters', icon: FileText },
        { name: 'Settings', path: '/office/settings', icon: Settings },
    ];

    const parentLinks = [
        { name: 'Dashboard', path: '/parent/dashboard', icon: LayoutDashboard },
        { name: 'Attendance', path: '/parent/attendance', icon: CheckSquare },
        { name: 'Results', path: '/parent/results', icon: FileText },
        { name: 'Fees', path: '/parent/fees', icon: CreditCard },
        { name: 'Timetable', path: '/parent/timetable', icon: Calendar },
        { name: 'Notices', path: '/parent/notices', icon: Bell },
    ];

    const links = (role === 'Staff' || role === 'Faculty') ? staffLinks :
        (role === 'Office' || role === 'Admin') ? officeLinks :
            (role === 'Parent') ? parentLinks :
                (role === 'cr') ? [{ name: 'Dashboard', path: '/cr/dashboard', icon: LayoutDashboard }] : studentLinks;

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
                {isMobileMenuOpen ? (
                    <X className="w-6 h-6 text-gray-700" />
                ) : (
                    <Menu className="w-6 h-6 text-gray-700" />
                )}
            </button>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={closeMobileMenu}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`
                w-64 bg-white border-r border-gray-100 flex flex-col h-screen fixed left-0 top-0 z-50
                transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
            `}>
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                                <Building2 className="text-white w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800 tracking-tight">PUDoCS</h1>
                                <p className="text-xs text-blue-600 font-semibold tracking-wide uppercase">{role} Portal</p>
                            </div>
                        </div>
                        {/* Close button for mobile */}
                        <button
                            onClick={closeMobileMenu}
                            className="lg:hidden p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                    {links.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            onClick={closeMobileMenu}
                            className={({ isActive }) => isActive ? activeClass : inactiveClass}
                        >
                            <link.icon className="w-5 h-5" />
                            <span>{link.name}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <button
                        onClick={() => {
                            handleLogout();
                            closeMobileMenu();
                        }}
                        className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                    <div className="mt-4 text-center">
                        <p className="text-[10px] text-gray-400">© 2026 PUDoCS v1.0.0</p>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
