import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';
import { studentStorageService } from '../../services/studentStorageService';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    BookOpen,
    GraduationCap,
    Shield,
    Edit2,
    ChevronDown,
    ChevronUp,
    X,
    Camera
} from 'lucide-react';

const StudentProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [personalInfoExpanded, setPersonalInfoExpanded] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const { user } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        gender: '',
        fatherName: '',
        fatherMobile: '',
        motherName: '',
        motherMobile: '',
        caste: '',
        houseAddress: '',
        course: '',
        program: '',
        year: '',
        section: '',
        registerNumber: '',
        photoUrl: '',
    });
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        if (user) {
            loadProfile();
        }
    }, [user]);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await studentService.getProfile(user.uid, user.email);
            if (data) {
                setProfile(data);
                setFormData({
                    name: data.name || '',
                    phone: data.phone || '',
                    email: data.email || '',
                    gender: data.gender || '',
                    fatherName: data.fatherName || '',
                    fatherMobile: data.fatherMobile || '',
                    motherName: data.motherName || '',
                    motherMobile: data.motherMobile || '',
                    caste: data.caste || '',
                    houseAddress: data.houseAddress || '',
                    course: data.course || 'Master of Science',
                    program: data.program || 'Computer Science',
                    year: data.year || '2',
                    section: data.section || 'Batch II',
                    registerNumber: data.registerNumber || '',
                    photoUrl: data.photoUrl || '',
                });
            }
        } catch (error) {
            console.error("Failed to load profile", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updateData = {
                ...profile,
                ...formData,
                profileUpdatedAt: new Date().toISOString()
            };

            // Save using studentStorageService (local storage)
            // Since we don't have a real registerNumber in mock, we use ID or email logic
            const id = profile?.registerNumber || profile?.id || user.uid;
            await studentStorageService.updateStudent(id, updateData);

            // Refresh
            setProfile(updateData);
            setEditModalOpen(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error("Error saving profile", error);
            alert('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpload = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result;
                // Update local state
                setProfile(prev => ({ ...prev, photoUrl: base64String }));
                setFormData(prev => ({ ...prev, photoUrl: base64String }));

                // Save to storage
                try {
                    const studentId = user.uid || user.email;
                    await studentStorageService.updateStudent(studentId, { photoUrl: base64String });

                    // Update user_profile in localStorage (the main source for the current user)
                    const currentProfile = {
                        ...(profile || {}),
                        photoUrl: base64String
                    };
                    localStorage.setItem('user_profile', JSON.stringify(currentProfile));
                } catch (error) {
                    console.error("Error saving photo:", error);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar role="Student" />
                <div className="flex-1 ml-0 lg:ml-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    const ProfileRow = ({ icon: Icon, label, value }) => (
        <div className="flex items-center py-3 border-b border-gray-100 last:border-0">
            <div className="flex items-center w-1/3 text-gray-500">
                {Icon && <Icon className="w-4 h-4 mr-2" />}
                <span className="text-sm font-medium">{label}</span>
            </div>
            <div className="w-2/3 text-gray-900 text-sm font-medium break-words">
                {value || 'N/A'}
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar role="Student" />

            <main className="flex-1 overflow-y-auto lg:ml-64">
                {/* Header/Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-48 relative">
                    <div className="absolute -bottom-16 left-8 flex items-end">
                        <div className="relative group">
                            <div className="h-32 w-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden cursor-pointer" onClick={handlePhotoUpload}>
                                <img
                                    src={profile?.photoUrl || `https://ui-avatars.com/api/?name=${profile?.name || 'User'}&background=random`}
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handlePhotoChange}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>
                        <div className="mb-4 ml-4">
                            <h1 className="text-2xl font-bold text-white shadow-sm">{profile?.name || 'Student Name'}</h1>
                            <p className="text-blue-100 text-sm font-medium">{profile?.registerNumber || 'ID: ----'}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-20 px-8 pb-12 max-w-5xl mx-auto space-y-6">

                    {/* Personal Info Card */}
                    <Card
                        title="Personal Information"
                        titleRight={
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setEditModalOpen(true)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setPersonalInfoExpanded(!personalInfoExpanded)}
                                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                    {personalInfoExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                            </div>
                        }
                    >
                        <div className={`space-y-1 transition-all duration-300 ${personalInfoExpanded ? 'block' : 'hidden'}`}>
                            <ProfileRow icon={User} label="Full Name" value={profile?.name} />
                            <ProfileRow icon={Phone} label="Phone" value={profile?.phone} />
                            <ProfileRow icon={Mail} label="Email" value={profile?.email} />
                            <ProfileRow icon={User} label="Gender" value={profile?.gender} />
                            <ProfileRow icon={User} label="Father's Name" value={profile?.fatherName} />
                            <ProfileRow icon={Phone} label="Father's Mobile" value={profile?.fatherMobile} />
                            <ProfileRow icon={User} label="Mother's Name" value={profile?.motherName} />
                            <ProfileRow icon={Phone} label="Mother's Mobile" value={profile?.motherMobile} />
                            <ProfileRow icon={Shield} label="Caste" value={profile?.caste} />
                            <ProfileRow icon={MapPin} label="Address" value={profile?.houseAddress} />
                        </div>
                    </Card>

                    {/* Academic Info Card */}
                    <Card title="Academic Information">
                        <ProfileRow icon={GraduationCap} label="Course" value={profile?.course || "Master of Science"} />
                        <ProfileRow icon={BookOpen} label="Program" value={profile?.program || "Computer Science"} />
                        <ProfileRow icon={Calendar} label="Year" value={profile?.year ? `${profile.year} Year` : "2nd Year"} />
                        <ProfileRow icon={Shield} label="Section" value={profile?.section || "Batch II"} />
                    </Card>

                </div>
            </main>

            {/* Edit Modal */}
            {editModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">Edit Profile</h3>
                            <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Register Number</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.registerNumber}
                                        onChange={(e) => setFormData({ ...formData, registerNumber: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Caste</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.caste}
                                        onChange={(e) => setFormData({ ...formData, caste: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.course}
                                        onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.program}
                                        onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                    >
                                        <option value="1">1st Year</option>
                                        <option value="2">2nd Year</option>
                                        <option value="3">3rd Year</option>
                                        <option value="4">4th Year</option>
                                    </select>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.section}
                                        onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.fatherName}
                                        onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Father's Mobile</label>
                                    <input
                                        type="tel"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.fatherMobile}
                                        onChange={(e) => setFormData({ ...formData, fatherMobile: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.motherName}
                                        onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Mobile</label>
                                    <input
                                        type="tel"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.motherMobile}
                                        onChange={(e) => setFormData({ ...formData, motherMobile: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">House Address</label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                        value={formData.houseAddress}
                                        onChange={(e) => setFormData({ ...formData, houseAddress: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
                                <Button type="submit" loading={saving}>Save Changes</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div >
    );
};

export default StudentProfile;

