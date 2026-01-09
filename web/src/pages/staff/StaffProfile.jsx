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
    X
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
        <div className="flex h-screen bg-gray-50">
            <Sidebar role={authRole || 'Staff'} />

            <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
                {/* Header */}
                <header className="bg-white shadow-sm z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                                </button>
                                <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-3xl mx-auto space-y-6">

                        {/* Profile Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 text-center">
                                <div className="w-32 h-32 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-blue-600 border-4 border-blue-200 overflow-hidden">
                                    {profile?.photoUrl || staffImages[profile?.imageKey] ? (
                                        <img
                                            src={profile.photoUrl || staffImages[profile.imageKey]}
                                            alt={profile.name}
                                            className="w-full h-full object-contain bg-gray-50"
                                        />
                                    ) : (
                                        profile?.name?.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-1">{profile?.name}</h2>
                                <p className="text-blue-100">{profile?.email}</p>
                            </div>

                            <div className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600 mr-4">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Full Name</p>
                                            <p className="font-semibold text-gray-900">{profile?.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600 mr-4">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Email Address</p>
                                            <p className="font-semibold text-gray-900">{profile?.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                                        <div className="p-2 bg-green-100 rounded-lg text-green-600 mr-4">
                                            <Briefcase className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Designation</p>
                                            <p className="font-semibold text-gray-900">{profile?.designation}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                                        <div className="p-2 bg-orange-100 rounded-lg text-orange-600 mr-4">
                                            <Building className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Department</p>
                                            <p className="font-semibold text-gray-900">{profile?.department}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Subjects Handled */}
                                {profile?.subjectsHandled && profile.subjectsHandled.length > 0 && (
                                    <div className="mt-8">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">Subjects Handled</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.subjectsHandled.map((subject, index) => (
                                                <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100">
                                                    {subject}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="mt-8 space-y-3">
                                    <button
                                        onClick={() => setPasswordModalOpen(true)}
                                        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                    >
                                        <Lock className="w-4 h-4 mr-2" />
                                        Change Password
                                    </button>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-center px-4 py-3 border border-transparent shadow-sm text-sm font-medium rounded-xl text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
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
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" onClick={() => setPasswordModalOpen(false)}>
                            <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                            <div className="bg-white px-6 pt-6 pb-4">
                                <div className="flex justify-between items-center mb-5">
                                    <h3 className="text-lg font-bold text-gray-900">Change Password</h3>
                                    <button onClick={() => setPasswordModalOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>

                                {message.content && (
                                    <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                        {message.content}
                                    </div>
                                )}

                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                        <input
                                            type="password"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                        <input
                                            type="password"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                        <input
                                            type="password"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        />
                                    </div>

                                    <div className="pt-4 flex space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => setPasswordModalOpen(false)}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={changingPassword}
                                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                                        >
                                            {changingPassword ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffProfile;
