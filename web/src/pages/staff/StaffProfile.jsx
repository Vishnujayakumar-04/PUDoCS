import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Mail,
    Briefcase,
    Building,
    Lock,
    LogOut,
    ArrowLeft,
    X,
    Camera
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { staffService } from '../../services/staffService';
import { changePassword } from '../../services/authService';
import staffImages from '../../data/staffImages';
import Sidebar from '../../components/Sidebar';

const StaffProfile = () => {
    const { user, logout, role: authRole } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [changingPassword, setChangingPassword] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const profileData = await staffService.getProfile(user?.uid, user?.email);
            if (profileData) {
                setProfile(profileData);
            } else {
                setProfile({
                    name: user?.email?.split('@')[0] || 'Staff',
                    email: user?.email || '',
                    designation: 'Faculty',
                    department: 'Computer Science',
                });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', content: 'New passwords do not match' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', content: 'Password must be at least 6 characters' });
            return;
        }

        setChangingPassword(true);
        setMessage({ type: '', content: '' });

        try {
            await changePassword(passwordData.currentPassword, passwordData.newPassword);
            setMessage({ type: 'success', content: 'Password changed successfully!' });
            setTimeout(() => {
                setPasswordModalOpen(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setMessage({ type: '', content: '' });
            }, 2000);
        } catch (error) {
            setMessage({ type: 'error', content: error.message || 'Failed to change password' });
        } finally {
            setChangingPassword(false);
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
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[100px] animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-cyan-200/30 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-indigo-200/30 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
            </div>

            <Sidebar role={authRole || 'Staff'} />

            <div className="flex-1 flex flex-col relative z-10 lg:ml-64 transition-all duration-300">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="mr-4 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                                </button>
                                <h1 className="text-xl font-black text-gray-900 tracking-tight">My Profile</h1>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
                    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Profile Card */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-100/50 to-indigo-100/50 rounded-bl-[150px] -mr-16 -mt-16 z-0 pointer-events-none"></div>

                            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-10 text-center relative z-10">
                                <div className="w-36 h-36 bg-white rounded-full mx-auto mb-5 flex items-center justify-center text-4xl font-black text-blue-600 border-4 border-white/30 shadow-2xl relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                                    {profile?.photoUrl || staffImages[profile?.imageKey] ? (
                                        <img
                                            src={profile.photoUrl || staffImages[profile.imageKey]}
                                            alt={profile.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        profile?.name?.charAt(0).toUpperCase()
                                    )}
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <h2 className="text-3xl font-black text-white mb-2 tracking-tight">{profile?.name}</h2>
                                <p className="text-blue-100 font-medium text-lg">{profile?.email}</p>
                            </div>

                            <div className="p-8 relative z-10">
                                <div className="space-y-4">
                                    <div className="flex items-center p-5 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-blue-100 transition-colors">
                                        <div className="p-3 bg-blue-100 rounded-xl text-blue-600 mr-5">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Full Name</p>
                                            <p className="text-lg font-bold text-gray-900">{profile?.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center p-5 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-purple-100 transition-colors">
                                        <div className="p-3 bg-purple-100 rounded-xl text-purple-600 mr-5">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                                            <p className="text-lg font-bold text-gray-900">{profile?.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center p-5 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-green-100 transition-colors">
                                        <div className="p-3 bg-green-100 rounded-xl text-green-600 mr-5">
                                            <Briefcase className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Designation</p>
                                            <p className="text-lg font-bold text-gray-900">{profile?.designation}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center p-5 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-orange-100 transition-colors">
                                        <div className="p-3 bg-orange-100 rounded-xl text-orange-600 mr-5">
                                            <Building className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Department</p>
                                            <p className="text-lg font-bold text-gray-900">{profile?.department}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Subjects Handled */}
                                {profile?.subjectsHandled && profile.subjectsHandled.length > 0 && (
                                    <div className="mt-10">
                                        <h3 className="text-lg font-black text-gray-900 mb-5 flex items-center">
                                            Topics of Expertise
                                        </h3>
                                        <div className="flex flex-wrap gap-3">
                                            {profile.subjectsHandled.map((subject, index) => (
                                                <span key={index} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold uppercase tracking-wide border border-blue-100 hover:bg-blue-100 transition-colors cursor-default">
                                                    {subject}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="mt-10 space-y-4">
                                    <button
                                        onClick={() => setPasswordModalOpen(true)}
                                        className="w-full flex items-center justify-center px-6 py-4 border border-gray-200 shadow-sm text-sm font-bold uppercase tracking-widest rounded-2xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-all hover:shadow-md"
                                    >
                                        <Lock className="w-4 h-4 mr-2.5" />
                                        Change Password
                                    </button>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-center px-6 py-4 border border-transparent shadow-sm text-sm font-bold uppercase tracking-widest rounded-2xl text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none transition-all hover:shadow-md"
                                    >
                                        <LogOut className="w-4 h-4 mr-2.5" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Change Password Modal */}
            {passwordModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-black text-gray-900">Change Password</h3>
                            <button onClick={() => setPasswordModalOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {message.content && (
                                <div className={`mb-5 p-4 rounded-xl text-sm font-bold ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                    {message.content}
                                </div>
                            )}

                            <form onSubmit={handleChangePassword} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Current Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Confirm New Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    />
                                </div>

                                <div className="pt-4 flex space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setPasswordModalOpen(false)}
                                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors text-xs"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={changingPassword}
                                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold uppercase tracking-widest text-xs shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all disabled:opacity-50"
                                    >
                                        {changingPassword ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffProfile;
