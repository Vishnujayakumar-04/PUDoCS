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
    Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { staffService } from '../../services/staffService';
import { addMscCS1stYearStudents } from '../../utils/addMscCS1stYearStudents';
import { addMtechDSStudents } from '../../utils/addMtechDSStudents';
import { createStaffAccounts } from '../../utils/createStaffAccounts';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Button from '../../components/Button';

const StaffStudentManagement = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

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
        });
        setModalOpen(true);
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

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-sm z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
                            <p className="text-sm text-gray-500">Manage, monitor and import student records</p>
                        </div>
                        <div className="flex space-x-3">
                            {user?.role === 'Office' && (
                                <button
                                    onClick={handleCreateStaffAccounts}
                                    disabled={importing}
                                    className="flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-sm font-medium"
                                >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    {importing ? 'Processing...' : 'Create Staff Accounts'}
                                </button>
                            )}
                            <button
                                onClick={handleOpenAddModal}
                                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Student
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto space-y-6">

                        {/* Filters & Bulk Actions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex flex-col md:flex-row md:items-end gap-4">
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Course</label>
                                        <select
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={filters.course}
                                            onChange={(e) => setFilters({ ...filters, course: e.target.value, program: '' })}
                                        >
                                            <option value="">All Courses</option>
                                            <option value="UG">UG</option>
                                            <option value="PG">PG</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Program</label>
                                        <select
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                                                    <option value="M.Tech DS">M.Tech DS</option>
                                                    <option value="M.Tech NIS">M.Tech NIS</option>
                                                    <option value="M.Tech CSE">M.Tech CSE</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Year</label>
                                        <select
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={filters.year}
                                            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                                        >
                                            <option value="">All Years</option>
                                            {[1, 2, 3, 4, 5, 6].map(y => <option key={y} value={y}>Year {y}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleBulkImport('msc')}
                                        disabled={importing}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                    >
                                        <Download className="w-4 h-4 mr-2 text-gray-400" />
                                        M.Sc CS 1st
                                    </button>
                                    <button
                                        onClick={() => handleBulkImport('mtech')}
                                        disabled={importing}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                    >
                                        <Download className="w-4 h-4 mr-2 text-gray-400" />
                                        M.Tech DS 1st
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Student List */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-900">{students.length} Students Found</span>
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                                    <p className="text-gray-500 font-medium">Loading student records...</p>
                                </div>
                            ) : students.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                <th className="px-6 py-4">Student</th>
                                                <th className="px-6 py-4">Reg Number</th>
                                                <th className="px-6 py-4">Program & Year</th>
                                                <th className="px-6 py-4">Section</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {students.map((student) => (
                                                <tr key={student.id || student.registerNumber} className="hover:bg-blue-50/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                                                                {student.name?.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-bold text-gray-900">{student.name}</div>
                                                                <div className="text-xs text-gray-500">{student.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                            {student.registerNumber}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-700">{student.program}</div>
                                                        <div className="text-xs text-gray-500">Year {student.year}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-gray-900 font-medium">{student.section}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end space-x-2">
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
                                    <div className="inline-flex items-center justify-center p-4 bg-gray-100 rounded-full mb-4">
                                        <Users className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">No students found</h3>
                                    <p className="text-gray-500 max-w-xs mx-auto">
                                        No student records match your current filters. Try adjusting them or add a new student.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Add/Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editMode ? 'Edit Student Record' : 'Add New Student'}
                            </h3>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveStudent} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Registration Number</label>
                                    <input
                                        type="text"
                                        required
                                        disabled={editMode}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                                        value={formData.registerNumber}
                                        onChange={(e) => setFormData({ ...formData, registerNumber: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email (Optional)</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Course</label>
                                        <select
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.course}
                                            onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                                        >
                                            <option value="UG">UG</option>
                                            <option value="PG">PG</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Year</label>
                                        <select
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.year}
                                            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                        >
                                            {[1, 2, 3, 4, 5, 6].map(y => <option key={y} value={y}>Year {y}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Program</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. M.Sc CS"
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.program}
                                            onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Section</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.section}
                                            onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition-all transform active:scale-95"
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
