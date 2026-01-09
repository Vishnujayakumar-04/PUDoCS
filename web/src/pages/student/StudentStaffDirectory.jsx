import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import { staffService } from '../../services/staffService';
import staffImages from '../../data/staffImages';
import { useAuth } from '../../context/AuthContext';
import {
    Users,
    Mail,
    Phone,
    BookOpen,
    Award,
    ChevronRight,
    XCircle,
    User,
    Briefcase,
    X,
    Search,
    Upload,
    Camera,
    Image as ImageIcon,
    Plus,
    Edit2,
    Trash2,
    Loader2
} from 'lucide-react';

const StudentStaffDirectory = () => {
    const { role: authRole, user } = useAuth();
    const [staffData, setStaffData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('Professor');
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Form data for management
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        designation: 'Assistant Professor',
        department: 'Computer Science',
        role: 'Staff',
        imageKey: '',
        photoUrl: '',
        contact: '',
        subjectsHandled: []
    });

    // Dynamic role for Sidebar
    const role = authRole || user?.role || 'Student';

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const data = await staffService.getAllStaff();
            setStaffData(data);
        } catch (error) {
            console.error("Error loading staff:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const categories = ['Professor', 'Associate Professor', 'Assistant Professor'];

    const handleStaffClick = (staff) => {
        setSelectedStaff(staff);
        setIsViewModalOpen(true);
    };

    const handleOpenAddModal = () => {
        setEditMode(false);
        setFormData({
            name: '',
            email: '',
            designation: 'Assistant Professor',
            department: 'Computer Science',
            role: 'Staff',
            imageKey: '',
            photoUrl: '',
            contact: '',
            subjectsHandled: []
        });
        setIsManageModalOpen(true);
    };

    const handleOpenEditModal = (e, staff) => {
        e.stopPropagation();
        setEditMode(true);
        setSelectedStaff(staff);
        setFormData({
            ...staff,
            subjectsHandled: staff.subjectsHandled || []
        });
        setIsManageModalOpen(true);
    };

    const handleDeleteStaff = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this staff member?')) {
            try {
                await staffService.deleteStaff(id);
                fetchStaff();
            } catch (error) {
                alert('Error deleting staff: ' + error.message);
            }
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const downloadURL = await staffService.uploadStaffImage(file);
            setFormData(prev => ({ ...prev, photoUrl: downloadURL }));
        } catch (error) {
            console.error("Upload error:", error);
            alert('Error uploading image: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSaveStaff = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await staffService.updateStaff(selectedStaff.id, formData);
                alert('Staff updated successfully');
            } else {
                await staffService.addStaff(formData);
                alert('Staff added successfully');
            }
            setIsManageModalOpen(false);
            fetchStaff();
        } catch (error) {
            alert('Error saving staff: ' + error.message);
        }
    };

    const filteredStaff = staffData.filter(staff => {
        const matchesCategory = staff.designation === selectedCategory;
        const matchesSearch = staff.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            staff.email?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar role={role} />

            <main className="flex-1 ml-0 lg:ml-64 p-4 sm:p-6 lg:p-8">
                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                            <Users className="mr-3 text-indigo-600" />
                            Staff Directory
                        </h1>
                        <p className="text-gray-500 mt-1">Department Faculty Members</p>
                    </div>
                    {role === 'Office' && (
                        <button
                            onClick={handleOpenAddModal}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center shadow-lg shadow-indigo-100 transition-all hover:-translate-y-0.5"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Staff
                        </button>
                    )}
                </header>

                {/* Search & Tabs */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === category
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search staff..."
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex animate-pulse space-x-4">
                        <div className="flex-1 space-y-6 py-1">
                            <div className="h-2 bg-slate-200 rounded"></div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                                <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredStaff.map((staff, idx) => (
                                <Card
                                    key={idx}
                                    className="overflow-hidden hover:shadow-xl transition-all cursor-pointer group p-0 border border-gray-100 relative"
                                    onClick={() => handleStaffClick(staff)}
                                >
                                    {/* Management Actions */}
                                    {role === 'Office' && (
                                        <div className="absolute top-2 right-2 z-10 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => handleOpenEditModal(e, staff)}
                                                className="p-1.5 bg-white/90 backdrop-blur-sm text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteStaff(e, staff.id)}
                                                className="p-1.5 bg-white/90 backdrop-blur-sm text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}

                                    <div className="h-72 bg-gray-50 flex items-center justify-center relative overflow-hidden group">
                                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-indigo-300">
                                            {staff.photoUrl || staffImages[staff.imageKey] ? (
                                                <img
                                                    src={staff.photoUrl || staffImages[staff.imageKey]}
                                                    alt={staff.name}
                                                    className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <User className="w-24 h-24" />
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4">
                                            <h3 className="text-white font-bold text-lg leading-tight">{staff.name}</h3>
                                            <p className="text-white/80 text-xs mt-1">{staff.email}</p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {filteredStaff.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                                <Users className="mx-auto h-12 w-12 text-gray-300" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No staff found</h3>
                                <p className="mt-1 text-sm text-gray-500">Try selecting a different category.</p>
                            </div>
                        )}
                    </>
                )}

                {/* View Modal */}
                {isViewModalOpen && selectedStaff && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                            <div className="relative h-96 bg-gray-900 flex items-center justify-center">
                                <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                        {selectedStaff.photoUrl || staffImages[selectedStaff.imageKey] ? (
                                            <img
                                                src={selectedStaff.photoUrl || staffImages[selectedStaff.imageKey]}
                                                alt={selectedStaff.name}
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        ) : (
                                            <User className="w-24 h-24 text-gray-400" />
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsViewModalOpen(false)}
                                    className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full backdrop-blur-md transition-colors"
                                >
                                    <X className="w-8 h-8" />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent pt-12">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">{selectedStaff.name}</h2>
                                            <div className="flex items-center mt-1">
                                                <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded mr-2">
                                                    {selectedStaff.designation}
                                                </span>
                                                <span className="text-gray-300 text-sm">{selectedStaff.department}</span>
                                            </div>
                                        </div>
                                        {role === 'Office' && (
                                            <button
                                                onClick={(e) => {
                                                    setIsViewModalOpen(false);
                                                    handleOpenEditModal(e, selectedStaff);
                                                }}
                                                className="bg-white/20 hover:bg-white text-white hover:text-indigo-600 p-2 rounded-lg transition-all backdrop-blur-sm"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">

                                {/* Subjects */}
                                {selectedStaff.subjectsHandled && selectedStaff.subjectsHandled.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Subjects Handled</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedStaff.subjectsHandled.map((subject, i) => (
                                                <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700">
                                                    <BookOpen className="w-3 h-3 mr-1.5" />
                                                    {subject}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Roles */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Course Coordinator</span>
                                        <span className="text-sm font-medium text-gray-800">{selectedStaff.courseCoordinator || 'N/A'}</span>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Faculty In-Charge</span>
                                        <span className="text-sm font-medium text-gray-800">{selectedStaff.facultyInCharge || 'Not Assigned'}</span>
                                    </div>
                                </div>

                                {/* Contact */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Contact Information</h4>
                                    <div className="space-y-3">
                                        <a href={`mailto:${selectedStaff.email}`} className="flex items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-indigo-100 transition-colors group">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700">{selectedStaff.email}</span>
                                        </a>
                                        {selectedStaff.contact && (
                                            <a href={`tel:${selectedStaff.contact}`} className="flex items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-green-100 transition-colors group">
                                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                                    <Phone className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">{selectedStaff.contact}</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Management Modal */}
                {isManageModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {editMode ? 'Edit Staff Profile' : 'Add Staff Member'}
                                </h3>
                                <button onClick={() => setIsManageModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSaveStaff} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Dr. Jane Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Staff Photo</label>
                                    <div className="space-y-3">
                                        {formData.photoUrl || formData.imageKey ? (
                                            <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 group/img">
                                                <img
                                                    src={formData.photoUrl || staffImages[formData.imageKey]}
                                                    alt="Staff Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <label className="p-2 bg-white text-indigo-600 rounded-lg cursor-pointer hover:scale-110 transition-transform">
                                                        <Camera className="w-5 h-5" />
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, photoUrl: '', imageKey: '' }))}
                                                        className="p-2 bg-white text-red-600 rounded-lg hover:scale-110 transition-transform"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-indigo-300 transition-all group overflow-hidden relative">
                                                {uploading ? (
                                                    <div className="flex flex-col items-center animate-pulse">
                                                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
                                                        <span className="text-xs font-bold text-gray-400">Uploading...</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl mb-2 group-hover:scale-110 transition-transform">
                                                            <Upload className="w-6 h-6" />
                                                        </div>
                                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Upload Photo</span>
                                                        <span className="text-[10px] text-gray-400 mt-1">JPG, PNG or GIF</span>
                                                    </>
                                                )}
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                            </label>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="email@pudocs.edu"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Designation</label>
                                        <select
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                                            value={formData.designation}
                                            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                        >
                                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Staff Role</label>
                                        <select
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="Staff">Staff</option>
                                            <option value="Office">Office Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contact Number</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                                        value={formData.contact}
                                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                        placeholder="+91 XXXXXXXXXX"
                                    />
                                </div>

                                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsManageModalOpen(false)}
                                        className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                                    >
                                        {editMode ? 'Update Staff' : 'Add Staff'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};

export default StudentStaffDirectory;
