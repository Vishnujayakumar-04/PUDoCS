import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import { Users, GraduationCap, BookOpen, Clock, AlertCircle, Calendar } from 'lucide-react';
import { staffMapping } from '../../data/staffMapping';
import { staffData } from '../../data/staffData';
import { staffService } from '../../services/staffService';

const StaffMyClass = () => {
    const { user, role: authRole } = useAuth();
    const [assignedClasses, setAssignedClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [staffName, setStaffName] = useState('');

    useEffect(() => {
        const fetchClasses = async () => {
            if (user?.email) {
                // Find visible name from staffData based on email (Static Data Fallback)
                const staffMember = staffData.find(s => s.email.toLowerCase() === user.email.toLowerCase());

                // Try fetching profile from Firestore
                let firestoreProfile = null;
                try {
                    firestoreProfile = await staffService.getProfile(user.uid, user.email);
                } catch (e) {
                    console.error("Failed to fetch profile from Firestore", e);
                }

                if (firestoreProfile || staffMember) {
                    const name = firestoreProfile?.name || staffMember?.name;
                    setStaffName(name);

                    // 1. Try Firestore 'assignments' field
                    if (firestoreProfile?.assignments && Array.isArray(firestoreProfile.assignments)) {
                        setAssignedClasses(firestoreProfile.assignments);
                    }
                    // 2. Fallback to static staffMapping
                    else if (name && staffMapping[name]) {
                        setAssignedClasses(staffMapping[name]);
                    } else {
                        console.warn(`Staff mapping not found for email: ${user.email}`);
                        setAssignedClasses([]);
                    }
                } else {
                    setAssignedClasses([]);
                }
            }
            setLoading(false);
        };

        fetchClasses();
    }, [user]);

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
                <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center">
                                    <GraduationCap className="mr-3 text-indigo-600" />
                                    My Classes
                                </h1>
                                <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest">
                                    {staffName ? `Welcome, ${staffName}` : 'My Teaching Schedule'}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        {assignedClasses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {assignedClasses.map((item, index) => (
                                    <div key={index} className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/50 p-6 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                                        <div className={`absolute top-0 left-0 w-1 h-full ${item.type === 'Lab' ? 'bg-cyan-500' : 'bg-indigo-600'}`}></div>

                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${item.type === 'Lab'
                                                ? 'bg-cyan-50 text-cyan-600 border border-cyan-100'
                                                : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                                }`}>
                                                {item.type}
                                            </span>
                                            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                                                <BookOpen className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem] leading-tight group-hover:text-indigo-700 transition-colors">
                                            {item.subject}
                                        </h3>

                                        <div className="space-y-2">
                                            <div className="flex items-center text-gray-600 text-sm font-medium bg-white/50 p-2.5 rounded-xl border border-gray-100/50">
                                                <Users className="w-4 h-4 mr-2.5 text-gray-400" />
                                                <span>{item.class}</span>
                                            </div>
                                            {/* Placeholder for schedule if available, or just keeping the card simple */}
                                        </div>

                                        <button className="w-full mt-5 py-3 text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50/50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all duration-300 shadow-sm hover:shadow-md">
                                            View Details
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in zoom-in duration-500">
                                <div className="bg-white p-6 rounded-full mb-6 shadow-xl shadow-indigo-100 border border-indigo-50 relative">
                                    <div className="absolute inset-0 bg-indigo-100/50 rounded-full animate-ping opacity-20"></div>
                                    <AlertCircle className="w-12 h-12 text-indigo-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">No Classes Assigned</h3>
                                <p className="text-gray-500 max-w-md leading-relaxed">
                                    Based on records for <strong className="text-indigo-600">{staffName || user?.email}</strong>, no classes are currently mapped.
                                    <br />Please contact the administration if this is an error.
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StaffMyClass;
