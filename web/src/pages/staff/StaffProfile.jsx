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
    Camera,
    Edit,
    Phone,
    Heart,
    Calendar as CalendarIcon,
    MapPin
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
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);

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

    const handleEditOpen = () => {
        setEditData({
            name: profile?.name || '',
            staffId: profile?.staffId || '',
            designation: profile?.designation || '',
            department: profile?.department || '',
            dob: profile?.dob || '',
            bloodGroup: profile?.bloodGroup || '',
            address: profile?.address || '',
            phone: profile?.phone || '',
            email: profile?.email || '',
            subjectsHandled: profile?.subjectsHandled ? profile.subjectsHandled.join(', ') : '',
            cabin: profile?.cabin || ''
        });
        setEditModalOpen(true);
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Convert subjects back to array
            const subjectsArray = editData.subjectsHandled.split(',').map(s => s.trim()).filter(s => s);

            const updatedProfile = {
                ...editData,
                subjectsHandled: subjectsArray,
                email: profile.email // Ensure email is not changed accidentally
            };

            await staffService.updateProfile(user.uid, updatedProfile);

            // Refresh local profile
            setProfile(prev => ({ ...prev, ...updatedProfile }));
            setEditModalOpen(false);
            setMessage({ type: 'success', content: 'Profile updated successfully!' });
            setTimeout(() => setMessage({ type: '', content: '' }), 3000);

        } catch (error) {
            console.error("Error saving profile:", error);
            setMessage({ type: 'error', content: 'Failed to update profile' });
        } finally {
            setSaving(false);
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
                                <p className="text-blue-100 font-medium text-lg">{profile?.designation}</p>

                                <button
                                    onClick={handleEditOpen}
                                    className="absolute top-6 right-6 p-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-white hover:bg-white hover:text-blue-600 transition-all shadow-lg"
                                    title="Edit Profile"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-8 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-blue-100 transition-colors">
                                        <div className="p-2.5 bg-blue-100 rounded-xl text-blue-600 mr-4">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</p>
                                            <p className="text-sm font-bold text-gray-900">{profile?.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-indigo-100 transition-colors">
                                        <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-600 mr-4">
                                            <Briefcase className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Staff ID</p>
                                            <p className="text-sm font-bold text-gray-900">{profile?.staffId || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-purple-100 transition-colors">
                                        <div className="p-2.5 bg-purple-100 rounded-xl text-purple-600 mr-4">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                                            <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{profile?.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-green-100 transition-colors">
                                        <div className="p-2.5 bg-green-100 rounded-xl text-green-600 mr-4">
                                            <Building className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Department</p>
                                            <p className="text-sm font-bold text-gray-900">{profile?.department}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-orange-100 transition-colors">
                                        <div className="p-2.5 bg-orange-100 rounded-xl text-orange-600 mr-4">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone No</p>
                                            <p className="text-sm font-bold text-gray-900">{profile?.phone || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-pink-100 transition-colors">
                                        <div className="p-2.5 bg-pink-100 rounded-xl text-pink-600 mr-4">
                                            <CalendarIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date of Birth</p>
                                            <p className="text-sm font-bold text-gray-900">{profile?.dob || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="col-span-1 md:col-span-2 flex items-center p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-red-100 transition-colors">
                                        <div className="p-2.5 bg-red-100 rounded-xl text-red-600 mr-4">
                                            <Heart className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Blood Group</p>
                                            <p className="text-sm font-bold text-gray-900">{profile?.bloodGroup || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="col-span-1 md:col-span-2 flex items-start p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-cyan-100 transition-colors">
                                        <div className="p-2.5 bg-cyan-100 rounded-xl text-cyan-600 mr-4 mt-1">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Address</p>
                                            <p className="text-sm font-bold text-gray-900 whitespace-pre-wrap">{profile?.address || 'N/A'}</p>
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

            {/* Edit Profile Modal */}
            {editModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10 backdrop-blur-sm">
                            <h3 className="text-lg font-black text-gray-900">Edit Profile</h3>
                            <button onClick={() => setEditModalOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Staff ID</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900"
                                        value={editData.staffId}
                                        onChange={(e) => setEditData({ ...editData, staffId: e.target.value })}
                                        placeholder="e.g. STF001"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Date of Birth</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900"
                                        value={editData.dob}
                                        onChange={(e) => setEditData({ ...editData, dob: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Designation</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900"
                                        value={editData.designation}
                                        onChange={(e) => setEditData({ ...editData, designation: e.target.value })}
                                        placeholder="e.g. Assistant Professor"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Department</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900"
                                        value={editData.department}
                                        onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                                        placeholder="e.g. Computer Science"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Phone Number</label>
                                    <input
                                        type="tel"
                                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900"
                                        value={editData.phone}
                                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                        placeholder="e.g. 9876543210"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Blood Group</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900"
                                        value={editData.bloodGroup}
                                        onChange={(e) => setEditData({ ...editData, bloodGroup: e.target.value })}
                                    >
                                        <option value="">Select Group</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Address</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900 min-h-[80px]"
                                    value={editData.address}
                                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                                    placeholder="Enter full address"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900"
                                    value={editData.email}
                                    readOnly={true}
                                    title="Email cannot be changed"
                                />
                                <p className="mt-1 text-xs text-gray-400">Email cannot be changed directly.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Cabin / Location</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900"
                                    value={editData.cabin}
                                    onChange={(e) => setEditData({ ...editData, cabin: e.target.value })}
                                    placeholder="e.g. Block A, Room 101"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Subjects of Expertise</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900 min-h-[100px]"
                                    value={editData.subjectsHandled}
                                    onChange={(e) => setEditData({ ...editData, subjectsHandled: e.target.value })}
                                    placeholder="Comma separated (e.g. Java, Python, AI)"
                                />
                                <p className="mt-1 text-xs text-gray-400">Separate multiple subjects with commas</p>
                            </div>

                            <div className="pt-4 flex space-x-4 border-t border-gray-100 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditModalOpen(false)}
                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold uppercase tracking-widest text-xs shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all disabled:opacity-50 flex items-center justify-center"
                                >
                                    {saving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Saving...
                                        </>
                                    ) : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
