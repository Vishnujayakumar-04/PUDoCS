import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Plus,
    Edit2,
    Trash2,
    UserPlus,
    Download,
    Filter,
    X,
    ChevronRight,
    Loader2,
    Upload,
    Camera,
    Image as ImageIcon,
    Calendar // Added Calendar icon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { staffService } from '../../services/staffService';
import { addMscCS1stYearStudents } from '../../utils/addMscCS1stYearStudents';
import { addMtechDSStudents } from '../../utils/addMtechDSStudents';
import { createStaffAccounts } from '../../utils/createStaffAccounts';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { classTimetables } from '../../data/classTimetables'; // Import Timetables

const StaffStudentManagement = () => {
    const { user, role: authRole } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Timetable States
    const [timetableModalOpen, setTimetableModalOpen] = useState(false);
    const [selectedTimetableClass, setSelectedTimetableClass] = useState(Object.keys(classTimetables)[0]);

    // Filters
    const [filters, setFilters] = useState({
        course: '',
        program: '',
        year: ''
    });

    // Form data
    const [formData, setFormData] = useState({
        name: '',
        registerNumber: '',
        email: '',
        course: 'UG',
        program: '',
        year: 1,
        section: 'A',
        photoUrl: ''
    });

    useEffect(() => {
        loadStudents();
    }, [filters]);

    const loadStudents = async () => {
        try {
            setLoading(true);
            const data = await staffService.getStudents(filters);
            setStudents(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading students:', error);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setEditMode(false);
        setFormData({
            name: '',
            registerNumber: '',
            email: '',
            course: 'UG',
            program: '',
            year: 1,
            section: 'A',
            photoUrl: ''
        });
        setModalOpen(true);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const downloadURL = await staffService.uploadStudentImage(file);
            setFormData(prev => ({ ...prev, photoUrl: downloadURL }));
        } catch (error) {
            console.error("Upload error:", error);
            alert('Error uploading image: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleOpenEditModal = (student) => {
        setEditMode(true);
        setSelectedStudent(student);
        setFormData({
            name: student.name || '',
            registerNumber: student.registerNumber || '',
            email: student.email || '',
            course: student.course || 'UG',
            program: student.program || '',
            year: student.year || 1,
            section: student.section || 'A',
        });
        setModalOpen(true);
    };

    const handleSaveStudent = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await staffService.updateStudent(selectedStudent.id || selectedStudent.registerNumber, formData);
                alert('Student updated successfully');
            } else {
                await staffService.addStudent(formData);
                alert('Student added successfully');
            }
            setModalOpen(false);
            loadStudents();
        } catch (error) {
            alert('Error saving student: ' + error.message);
        }
    };

    const handleDeleteStudent = async (student) => {
        if (window.confirm(`Are you sure you want to deactivate ${student.name}?`)) {
            try {
                await staffService.deleteStudent(student.id || student.registerNumber);
                alert('Student deactivated');
                loadStudents();
            } catch (error) {
                alert('Failed to delete student');
            }
        }
    };

    const handleBulkImport = async (type) => {
        const confirmMsg = type === 'msc'
            ? 'This will import M.Sc CS 1st Year students. Continue?'
            : 'This will import M.Tech DS & AI 1st Year students. Continue?';

        if (window.confirm(confirmMsg)) {
            setImporting(true);
            try {
                const result = type === 'msc' ? await addMscCS1stYearStudents() : await addMtechDSStudents();
                alert(`Successfully imported ${result.success} students. ${result.failed} failed.`);

                // If it was M.Sc CS, let's set the filters to show it
                if (type === 'msc') {
                    setFilters({ course: 'PG', program: 'M.Sc CS', year: '1' });
                } else if (type === 'mtech') {
                    setFilters({ course: 'PG', program: 'M.Tech DS & AI', year: '1' });
                }

                loadStudents();
            } catch (error) {
                alert('Import failed: ' + error.message);
            } finally {
                setImporting(false);
            }
        }
    };

    const handleCreateStaffAccounts = async () => {
        if (window.confirm('Create 19 staff accounts with default password "Pass@123"?')) {
            setImporting(true);
            try {
                const result = await createStaffAccounts();
                alert(`Successfully created/verified ${result.success} staff accounts.`);
            } catch (error) {
                alert('Failed to create staff accounts: ' + error.message);
            } finally {
                setImporting(false);
            }
        }
    };

    const filteredStudents = students.filter(s =>
        (s.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.registerNumber?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.email?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Timetable Grid Helper
    const timeSlots = ["9:30-10:30", "10:30-11:30", "11:30-12:30", "12:30-1:30", "1:30-2:30", "2:30-3:30", "3:30-4:30", "4:30-5:30"];
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    const getSlotData = (day, time) => {
        const schedule = classTimetables[selectedTimetableClass]?.schedule;
        if (!schedule || !schedule[day]) return null;
        return schedule[day].find(s => s.time === time);
    };

    return (
        <div className="relative min-h-screen bg-gray-50 overflow-hidden flex">
            {/* Background Animations */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[100px] animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-indigo-200/30 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-purple-200/30 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
            </div>

            <Sidebar role={authRole || 'Staff'} />

            <div className="flex-1 flex flex-col relative z-10 lg:ml-64 transition-all duration-300">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center">
                                <Users className="mr-3 text-blue-600" />
                                Student Management
                            </h1>
                            <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest">Manage, monitor and import student records</p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setTimetableModalOpen(true)}
                                className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 rounded-xl transition-all font-bold text-xs uppercase tracking-widest shadow-sm"
                            >
                                <Calendar className="w-4 h-4 mr-2" />
                                Timetables
                            </button>
                            <button
                                onClick={handleOpenAddModal}
                                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-200 hover:shadow-blue-300 transform active:scale-95"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Student
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Search & Bulk Actions */}
                        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/50 p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, register number or email..."
                                    className="w-full pl-10 pr-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400 text-sm font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/50 p-6">
                            <div className="flex flex-col md:flex-row md:items-end gap-4">
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Course</label>
                                        <select
                                            className="w-full px-3 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-gray-700"
                                            value={filters.course}
                                            onChange={(e) => setFilters({ ...filters, course: e.target.value, program: '' })}
                                        >
                                            <option value="">All Courses</option>
                                            <option value="UG">UG</option>
                                            <option value="PG">PG</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Program</label>
                                        <select
                                            className="w-full px-3 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-gray-700 disabled:opacity-50"
                                            value={filters.program}
                                            onChange={(e) => setFilters({ ...filters, program: e.target.value })}
                                            disabled={!filters.course}
                                        >
                                            <option value="">All Programs</option>
                                            {filters.course === 'UG' && (
                                                <>
                                                    <option value="B.Tech">B.Tech</option>
                                                    <option value="B.Sc CS">B.Sc CS</option>
                                                </>
                                            )}
                                            {filters.course === 'PG' && (
                                                <>
                                                    <option value="M.Sc CS">M.Sc CS</option>
                                                    <option value="M.Sc DA">M.Sc DA</option>
                                                    <option value="M.Sc CS Integrated">M.Sc CS Integrated</option>
                                                    <option value="MCA">MCA</option>
                                                    <option value="M.Tech DS & AI">M.Tech DS & AI</option>
                                                    <option value="M.Tech NIS">M.Tech NIS</option>
                                                    <option value="M.Tech CSE">M.Tech CSE</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Year</label>
                                        <select
                                            className="w-full px-3 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-gray-700"
                                            value={filters.year}
                                            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                                        >
                                            <option value="">All Years</option>
                                            {[1, 2, 3, 4, 5, 6].map(y => <option key={y} value={y}>Year {y}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Student List */}
                        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/50 overflow-hidden">
                            <div className="p-4 border-b border-gray-100/50 bg-gray-50/50 flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{filteredStudents.length} Students Found</span>
                            </div>
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                                    <p className="text-gray-500 font-medium">Loading student records...</p>
                                </div>
                            ) : filteredStudents.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100/50">
                                                <th className="px-6 py-4">Student</th>
                                                <th className="px-6 py-4">Reg Number</th>
                                                <th className="px-6 py-4">Program & Year</th>
                                                <th className="px-6 py-4">Section</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100/50">
                                            {filteredStudents.map((student) => (
                                                <tr key={student.id || student.registerNumber} className="hover:bg-blue-50/40 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center text-indigo-700 font-black border border-indigo-200/50 shadow-sm group-hover:scale-110 transition-transform">
                                                                {student.name?.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{student.name}</div>
                                                                <div className="text-xs text-gray-500 font-medium">{student.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-white border border-gray-200 text-gray-600 shadow-sm">
                                                            {student.registerNumber}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-bold text-gray-700">{student.program}</div>
                                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Year {student.year}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-gray-900 font-bold bg-gray-100 px-2 py-1 rounded-lg">{student.section}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleOpenEditModal(student)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteStudent(student)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <div className="inline-flex items-center justify-center p-4 bg-gray-50 rounded-full mb-4">
                                        <Users className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">No students found</h3>
                                    <p className="text-gray-500 max-w-xs mx-auto text-sm">
                                        No student records match your current filters. Try adjusting them or add a new student.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Timetable Modal */}
            {timetableModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100">
                        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 backdrop-blur-md">
                            <div className="flex items-center space-x-6">
                                <h3 className="text-2xl font-black text-gray-900 flex items-center tracking-tight">
                                    <Calendar className="w-7 h-7 mr-3 text-indigo-600" />
                                    Class Timetable
                                </h3>
                                <div className="h-8 w-px bg-gray-300"></div>
                                <select
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-gray-700 text-sm outline-none shadow-sm hover:border-indigo-300 transition-colors"
                                    value={selectedTimetableClass}
                                    onChange={(e) => setSelectedTimetableClass(e.target.value)}
                                >
                                    {Object.keys(classTimetables).map(cls => (
                                        <option key={cls} value={cls}>{cls}</option>
                                    ))}
                                </select>
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-widest border border-indigo-100">
                                    Room: {classTimetables[selectedTimetableClass]?.room}
                                </span>
                            </div>
                            <button onClick={() => setTimetableModalOpen(false)} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto p-8 bg-gray-50/50">
                            <div className="min-w-[1000px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                                <div className="grid grid-cols-[120px_repeat(8,1fr)] bg-gray-50/80 border-b border-gray-200">
                                    <div className="p-5 font-black text-gray-400 text-[10px] uppercase tracking-widest text-center border-r border-gray-100 flex items-center justify-center">Day / Time</div>
                                    {timeSlots.map(slot => (
                                        <div key={slot} className="p-5 font-black text-gray-600 text-[10px] text-center border-r last:border-r-0 border-gray-100 uppercase tracking-wider">{slot}</div>
                                    ))}
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {days.map(day => (
                                        <div key={day} className="grid grid-cols-[120px_repeat(8,1fr)] group hover:bg-gray-50/50 transition-colors">
                                            <div className="p-4 font-black text-gray-400 text-[10px] uppercase tracking-widest border-r border-gray-100 flex items-center justify-center bg-gray-50/30">
                                                {day.substring(0, 3)}
                                            </div>
                                            {timeSlots.map(time => {
                                                const slot = getSlotData(day, time);
                                                const isLunch = slot?.type === 'break' || time === "1:30-2:30"; // Fallback for 1:30 break

                                                return (
                                                    <div
                                                        key={`${day}-${time}`}
                                                        className={`p-3 border-r last:border-r-0 border-gray-100 min-h-[120px] flex flex-col items-center justify-center text-center transition-all duration-300 relative overflow-hidden
                                                            ${isLunch ? 'bg-amber-50/30 text-amber-600 font-black tracking-widest text-[10px] uppercase' : ''}
                                                            ${slot && !isLunch ? 'hover:bg-indigo-50/30' : ''}
                                                        `}
                                                    >
                                                        {isLunch ? (
                                                            <span className="opacity-50">Lunch Break</span>
                                                        ) : slot ? (
                                                            <div className="w-full h-full flex flex-col justify-center items-center z-10">
                                                                <span className="text-xs font-bold text-gray-900 mb-2 line-clamp-3 leading-tight">{slot.subject}</span>
                                                                {slot.room && (
                                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-full">{slot.room}</span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-200 font-bold text-xl">-</span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">
                                {editMode ? 'Edit Student' : 'New Student'}
                            </h3>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveStudent} className="p-8 space-y-5">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-gray-900 placeholder:text-gray-300 transition-all"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Student Photo</label>
                                    <div className="space-y-3">
                                        {formData.photoUrl ? (
                                            <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 group/img shadow-sm">
                                                <img
                                                    src={formData.photoUrl}
                                                    alt="Student Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                                                    <label className="p-3 bg-white text-blue-600 rounded-xl cursor-pointer hover:scale-110 transition-transform shadow-lg">
                                                        <Camera className="w-5 h-5" />
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, photoUrl: '' }))}
                                                        className="p-3 bg-white text-red-600 rounded-xl hover:scale-110 transition-transform shadow-lg"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-blue-50/50 hover:border-blue-400 transition-all group overflow-hidden relative">
                                                {uploading ? (
                                                    <div className="flex flex-col items-center animate-pulse">
                                                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Uploading...</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl mb-3 group-hover:scale-110 transition-transform group-hover:shadow-md">
                                                            <Upload className="w-6 h-6" />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Click to Upload Photo</span>
                                                    </>
                                                )}
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                            </label>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Reg. Number</label>
                                        <input
                                            type="text"
                                            required
                                            disabled={editMode}
                                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold text-gray-900 transition-all"
                                            value={formData.registerNumber}
                                            onChange={(e) => setFormData({ ...formData, registerNumber: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Email</label>
                                        <input
                                            type="email"
                                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-gray-900 transition-all"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Course</label>
                                        <select
                                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-gray-900 transition-all"
                                            value={formData.course}
                                            onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                                        >
                                            <option value="UG">UG</option>
                                            <option value="PG">PG</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Year</label>
                                        <select
                                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-gray-900 transition-all"
                                            value={formData.year}
                                            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                        >
                                            {[1, 2, 3, 4, 5, 6].map(y => <option key={y} value={y}>Year {y}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Program</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. M.Sc CS"
                                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-gray-900 transition-all"
                                            value={formData.program}
                                            onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Section</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-gray-900 transition-all"
                                            value={formData.section}
                                            onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="flex-1 px-6 py-4 border border-gray-200 text-gray-600 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-4 bg-blue-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all transform active:scale-95"
                                >
                                    {editMode ? 'Update' : 'Add Student'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffStudentManagement;
