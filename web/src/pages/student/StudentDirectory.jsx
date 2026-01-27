import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { studentService } from '../../services/studentService';
import { staffService } from '../../services/staffService';
import {
    Users,
    ChevronRight,
    Search,
    ArrowLeft,
    GraduationCap,
    BookOpen,
    X,
    Plus,
    Edit2,
    Trash2,
    Upload,
    Camera,
    Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const StudentDirectory = () => {
    const { role: authRole, user } = useAuth();
    // View State: 'landing' | 'ug' | 'pg' | 'directory'
    const [view, setView] = useState('landing');
    const [selectedClass, setSelectedClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    // Dynamic role for Sidebar
    const role = authRole || user?.role || 'Student';

    // Timetable
    const [classTimetable, setClassTimetable] = useState(null);

    // Detail Modal State
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Filter State
    const [filters, setFilters] = useState({
        course: '',
        program: '',
        year: ''
    });

    // Management State
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [uploading, setUploading] = useState(false);
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

    // Data for Selection
    const ugPrograms = [
        { label: 'B.Tech CSE – 1st Year', name: 'B.Tech', year: 1, category: 'UG' },
        { label: 'B.Tech CSE – 2nd Year', name: 'B.Tech', year: 2, category: 'UG' },
        { label: 'B.Sc CS – 1st Year', name: 'B.Sc CS', year: 1, category: 'UG' },
        { label: 'B.Sc CS – 2nd Year', name: 'B.Sc CS', year: 2, category: 'UG' },
        { label: 'B.Sc CS – 3rd Year', name: 'B.Sc CS', year: 3, category: 'UG' },
    ];

    const pgPrograms = [
        { label: 'M.Sc Computer Science – 1st Year', name: 'M.Sc CS', year: 1, category: 'PG' },
        { label: 'M.Sc Computer Science – 2nd Year', name: 'M.Sc CS', year: 2, category: 'PG' },
        { label: 'M.Sc Data Analytics – 1st Year', name: 'M.Sc DA', year: 1, category: 'PG' },
        { label: 'M.Sc CS Integrated – 1st Year', name: 'M.Sc CS Integrated', year: 1, category: 'PG' },
        { label: 'MCA – 1st Year', name: 'MCA', year: 1, category: 'PG' },
        { label: 'MCA – 2nd Year', name: 'MCA', year: 2, category: 'PG' },
        { label: 'M.Tech Data Science – 1st Year', name: 'M.Tech DS & AI', year: 1, category: 'PG' },
    ];

    const classroomData = [
        { course: 'I BTECH (CSE)', room: '103', location: 'Ground Floor (CS Annexe)' },
        { course: 'II BTECH (CSE)', room: '203', location: 'First Floor (CS Annexe)' },
        { course: 'I MCA', room: 'SH 367', location: 'Second Floor (South)' },
        // Add more as needed
    ];

    const handleClassSelect = async (item) => {
        setSelectedClass(item);
        setLoading(true);
        setView('directory');
        try {
            // Map program
            let mappedProgram = item.name;
            if (item.name === 'M.Tech DS' || item.name === 'M.Tech DS & AI') mappedProgram = 'M.Tech Data Analytics';

            const data = await studentService.getStudentsByProgram(mappedProgram, item.year, item.category);
            setStudents(data || []);

            // Load Timetable
            const timetable = await studentService.getTimetable(mappedProgram, item.year);
            setClassTimetable(timetable);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStudentClick = (student) => {
        setSelectedStudent(student);
        setIsDetailOpen(true);
    };

    const handleBack = () => {
        if (isSearching) {
            setIsSearching(false);
            setSearchQuery('');
            return;
        }
        if (view === 'directory') setView(selectedClass.category === 'UG' ? 'ug' : 'pg');
        else setView('landing');
    };

    const handleSearchSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        setIsSearching(true);
        try {
            const results = await studentService.searchStudents(searchQuery);
            setSearchResults(results);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setIsSearching(false);
        setSearchResults([]);
    };

    // Management Handlers
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
        setIsManageModalOpen(true);
    };

    const handleOpenEditModal = (e, student) => {
        e.stopPropagation();
        setEditMode(true);
        setSelectedStudent(student);
        setFormData({
            ...student,
            photoUrl: student.photoUrl || ''
        });
        setIsManageModalOpen(true);
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
            setIsManageModalOpen(false);
            // Reload the current class if in directory view
            if (selectedClass) {
                handleClassSelect(selectedClass);
            }
        } catch (error) {
            alert('Error saving student: ' + error.message);
        }
    };

    const handleDeleteStudent = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await staffService.deleteStudent(id, formData);
                alert('Student deleted successfully');
                // Reload the current class
                if (selectedClass) {
                    handleClassSelect(selectedClass);
                }
            } catch (error) {
                alert('Error deleting student: ' + error.message);
            }
        }
    };

    const renderLanding = () => (
        <div>
            {/* Filter Box */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mt-6">
                <div className="flex items-center gap-2 mb-4">
                    <Search className="w-5 h-5 text-gray-400" />
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Filter Students</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Course</label>
                        <select
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={filters.course}
                            onChange={(e) => setFilters({ ...filters, course: e.target.value, program: '' })}
                        >
                            <option value="">All Courses</option>
                            <option value="UG">Undergraduate (UG)</option>
                            <option value="PG">Postgraduate (PG)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Program</label>
                        <select
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={filters.program}
                            onChange={(e) => setFilters({ ...filters, program: e.target.value })}
                        >
                            <option value="">All Programs</option>
                            {filters.course === 'UG' && (
                                <>
                                    <option value="B.Tech">B.Tech CSE</option>
                                    <option value="B.Sc CS">B.Sc CS</option>
                                </>
                            )}
                            {filters.course === 'PG' && (
                                <>
                                    <option value="M.Sc CS">M.Sc CS</option>
                                    <option value="MCA">MCA</option>
                                    <option value="M.Tech DS & AI">M.Tech DS & AI</option>
                                </>
                            )}
                            {!filters.course && (
                                <>
                                    <option value="B.Tech">B.Tech CSE</option>
                                    <option value="B.Sc CS">B.Sc CS</option>
                                    <option value="M.Sc CS">M.Sc CS</option>
                                    <option value="MCA">MCA</option>
                                    <option value="M.Tech DS & AI">M.Tech DS & AI</option>
                                </>
                            )}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Year</label>
                        <select
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={filters.year}
                            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                        >
                            <option value="">All Years</option>
                            <option value="1">Year 1</option>
                            <option value="2">Year 2</option>
                            <option value="3">Year 3</option>
                            <option value="4">Year 4</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                if (filters.course || filters.program || filters.year) {
                                    // Navigate to directory with selected filters
                                    const program = filters.program || (filters.course === 'UG' ? 'B.Tech' : 'M.Sc CS');
                                    const year = parseInt(filters.year) || 1;
                                    handleClassSelect({ name: program, year, category: filters.course || 'PG' });
                                }
                            }}
                            disabled={!filters.course && !filters.program && !filters.year}
                            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Apply Filter
                        </button>
                    </div>
                </div>
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <button
                    onClick={() => setView('ug')}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-8 text-left hover:scale-[1.02] transition-transform shadow-lg group"
                >
                    <Users className="w-12 h-12 mb-4 text-blue-100" />
                    <h2 className="text-2xl font-bold">Undergraduate</h2>
                    <p className="text-blue-100 mt-2">B.Tech, B.Sc Computer Science</p>
                    <div className="mt-8 flex items-center text-sm font-semibold text-blue-50 group-hover:text-white">
                        Explore Classes <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                </button>
                <button
                    onClick={() => setView('pg')}
                    className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl p-8 text-left hover:scale-[1.02] transition-transform shadow-lg group"
                >
                    <GraduationCap className="w-12 h-12 mb-4 text-indigo-100" />
                    <h2 className="text-2xl font-bold">Postgraduate</h2>
                    <p className="text-indigo-100 mt-2">M.Sc, MCA, M.Tech Students</p>
                    <div className="mt-8 flex items-center text-sm font-semibold text-indigo-50 group-hover:text-white">
                        Explore Classes <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                </button>
            </div>
        </div>
    );

    const renderSelection = (items, title) => (
        <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{title} Programs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item, idx) => (
                    <Card
                        key={idx}
                        className="cursor-pointer hover:shadow-md transition-shadow group border border-gray-100 hover:border-blue-200"
                        onClick={() => handleClassSelect(item)}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-gray-800">{item.label}</h3>
                                <p className="text-xs text-gray-500 mt-1">{item.name} • Year {item.year}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500" />
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );

    const renderDirectory = () => (
        <div className="mt-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex flex-wrap gap-6 justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{selectedClass.label}</h2>
                        <p className="text-gray-500 text-sm mt-1">{students.length} Students Enrolled</p>
                    </div>
                    <div className="flex gap-3">
                        {(role === 'Office' || role === 'Staff') && (
                            <button
                                onClick={handleOpenAddModal}
                                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Student
                            </button>
                        )}
                        {classTimetable && (
                            <Button variant="outline" className="text-sm">
                                <BookOpen className="w-4 h-4 mr-2" /> View Timetable
                            </Button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : students.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
                        <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No students found for this class.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">S.No</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Register No</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {students.map((student, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 font-mono">
                                            {student.registerNumber || student.RegisterNumber || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-800 font-medium flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-3 text-xs font-bold overflow-hidden">
                                                {student.photoUrl ? (
                                                    <img src={student.photoUrl} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    (student.name || student.Name || 'U').charAt(0)
                                                )}
                                            </div>
                                            {student.name || student.Name || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {(role === 'Office' || role === 'Staff') && (
                                                    <>
                                                        <button
                                                            onClick={(e) => handleOpenEditModal(e, student)}
                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit Student"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDeleteStudent(e, student.id || student.registerNumber)}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete Student"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleStudentClick(student)}
                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                >
                                                    View <ChevronRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

    // Detail Modal Content
    const DetailModal = () => {
        if (!selectedStudent) return null;
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative">
                        <button
                            onClick={() => setIsDetailOpen(false)}
                            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <div className="flex items-center">
                            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold backdrop-blur-md border-2 border-white/30 overflow-hidden">
                                {selectedStudent.photoUrl ? (
                                    <img src={selectedStudent.photoUrl} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    (selectedStudent.name || 'U').charAt(0)
                                )}
                            </div>
                            <div className="ml-6">
                                <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                                <p className="text-white/80 font-mono mt-1">{selectedStudent.registerNumber}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Academic Info</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <span className="block text-xs text-gray-500 mb-1">Program</span>
                                    <span className="font-medium text-gray-900">{selectedStudent.program || selectedClass?.name || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-500 mb-1">Year</span>
                                    <span className="font-medium text-gray-900">{selectedStudent.year || selectedClass?.year || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-500 mb-1">Course</span>
                                    <span className="font-medium text-gray-900">{selectedStudent.course || 'Computer Science'}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-500 mb-1">Email</span>
                                    <span className="font-medium text-gray-900 break-all">{selectedStudent.email || `${selectedStudent.registerNumber?.toLowerCase()}@pondiuni.ac.in`}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Personal Info</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <span className="block text-xs text-gray-500 mb-1">Phone</span>
                                    <span className="font-medium text-gray-900">{selectedStudent.phone || '--'}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-500 mb-1">Caste</span>
                                    <span className="font-medium text-gray-900">{selectedStudent.caste || '--'}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="block text-xs text-gray-500 mb-1">Address</span>
                                    <span className="font-medium text-gray-900">{selectedStudent.houseAddress || '--'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 flex justify-end">
                        <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Close</Button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar role={role} />

            <main className="flex-1 ml-0 lg:ml-64 p-4 sm:p-6 lg:p-8">
                <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center">
                        {(view !== 'landing' || isSearching) && (
                            <button
                                onClick={handleBack}
                                className="mr-4 p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                                <Users className="mr-3 text-blue-600" />
                                {isSearching ? 'Search Results' : 'Student Directory'}
                            </h1>
                            <p className="text-gray-500 mt-1">
                                {isSearching ? `Found ${searchResults.length} students` : (
                                    view === 'landing' ? "Find and connect with classmates" :
                                        view === 'ug' ? "Undergraduate Programs" :
                                            view === 'pg' ? "Postgraduate Programs" :
                                                `${selectedClass?.label}`
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Search Bar - Visible for Staff and Office */}
                    {(role === 'Staff' || role === 'Office') && (
                        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
                            <input
                                type="text"
                                placeholder="Search Name or Reg No..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
                            />
                            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </form>
                    )}
                </header>

                {isSearching ? (
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : searchResults.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                                {searchResults.map((student) => (
                                    <Card
                                        key={student.id || student.registerNumber}
                                        className="cursor-pointer hover:shadow-lg transition-all border border-gray-100 group"
                                        onClick={() => handleStudentClick(student)}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-xl border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                {student.name ? student.name.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-900 line-clamp-1">{student.name}</h3>
                                                <p className="text-sm text-gray-500">{student.registerNumber}</p>
                                                <div className="flex items-center mt-1 text-xs text-blue-600 font-medium bg-blue-50 w-fit px-2 py-0.5 rounded-full">
                                                    {student.program} • Year {student.year}
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500" />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No students found</h3>
                                <p className="text-gray-500">Try searching with a different name or register number.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {view === 'landing' && renderLanding()}
                        {view === 'ug' && renderSelection(ugPrograms, 'Undergraduate')}
                        {view === 'pg' && renderSelection(pgPrograms, 'Postgraduate')}
                        {view === 'directory' && renderDirectory()}
                    </>
                )}

                {isDetailOpen && <DetailModal />}

                {/* Management Modal */}
                {isManageModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {editMode ? 'Edit Student Record' : 'Add New Student'}
                                </h3>
                                <button onClick={() => setIsManageModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSaveStudent} className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Student Photo</label>
                                        <div className="space-y-3">
                                            {formData.photoUrl ? (
                                                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 group/img">
                                                    <img
                                                        src={formData.photoUrl}
                                                        alt="Student Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                        <label className="p-2 bg-white text-blue-600 rounded-lg cursor-pointer hover:scale-110 transition-transform">
                                                            <Camera className="w-5 h-5" />
                                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, photoUrl: '' }))}
                                                            className="p-2 bg-white text-red-600 rounded-lg hover:scale-110 transition-transform"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all group">
                                                    {uploading ? (
                                                        <div className="flex flex-col items-center animate-pulse">
                                                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                                                            <span className="text-xs font-bold text-gray-400">Uploading...</span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl mb-2 group-hover:scale-110 transition-transform">
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
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Course</label>
                                        <select
                                            required
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.course}
                                            onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                                        >
                                            <option value="UG">UG</option>
                                            <option value="PG">PG</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Program</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g., B.Tech, M.Sc CS"
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.program}
                                            onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Year</label>
                                        <select
                                            required
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.year}
                                            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                        >
                                            {[1, 2, 3, 4, 5, 6].map(y => <option key={y} value={y}>Year {y}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Section</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g., A, B, C"
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.section}
                                            onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsManageModalOpen(false)}
                                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                                    >
                                        {editMode ? 'Update Student' : 'Add Student'}
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

export default StudentDirectory;

