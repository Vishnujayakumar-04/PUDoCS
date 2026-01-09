import React from 'react';
import {
    Settings,
    User,
    Shield,
    Bell,
    Database,
    HelpCircle,
    ChevronRight,
    LogOut,
    Lock,
    Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';

const OfficeSettings = () => {
    const { role: authRole, logout } = useAuth();

    const sections = [
        { title: 'Account Settings', desc: 'Manage your profile and admin credentials', icon: User, color: 'text-blue-600' },
        { title: 'Security', desc: 'Secure your office account with 2FA', icon: Shield, color: 'text-green-600' },
        { title: 'System Configurations', desc: 'Department-wide settings and academic year setup', icon: Database, color: 'text-purple-600' },
        { title: 'Notifications', desc: 'Email and portal alert preferences', icon: Bell, color: 'text-amber-600' },
        { title: 'Access Control', desc: 'Manage staff permissions and roles', icon: Lock, color: 'text-red-600' },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar role={authRole || 'Office'} />

            <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
                <header className="bg-white shadow-sm z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <h1 className="text-2xl font-bold text-gray-900 underline decoration-indigo-500 underline-offset-8">Portal Settings</h1>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-3xl mx-auto space-y-4">

                        {sections.map((section, i) => (
                            <button key={i} className="w-full text-left bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all group flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className={`p-3 rounded-xl bg-gray-50 group-hover:scale-110 transition-transform`}>
                                        <section.icon className={`w-6 h-6 ${section.color}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 tracking-tight underline decoration-gray-100 group-hover:decoration-indigo-100">{section.title}</h3>
                                        <p className="text-xs text-gray-400 mt-1 font-medium">{section.desc}</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                            </button>
                        ))}

                        <button
                            onClick={logout}
                            className="w-full mt-8 p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 hover:bg-red-600 hover:text-white transition-all font-bold uppercase tracking-widest text-xs flex items-center justify-center space-x-2 shadow-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out of Portal</span>
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default OfficeSettings;
