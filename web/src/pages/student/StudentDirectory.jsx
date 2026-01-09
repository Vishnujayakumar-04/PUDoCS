import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { studentService } from '../../services/studentService';
import {
    Users,
    ChevronRight,
    MapPin,
    Search,
    ArrowLeft,
    GraduationCap,
    BookOpen,
    User,
    Shield,
    FileText
} from 'lucide-react';
import { studentStorageService } from '../../services/studentStorageService';

const StudentDirectory = () => {
    // View State: 'landing' | 'ug' | 'pg' | 'directory'
    const [view, setView] = useState('landing');
    const [selectedClass, setSelectedClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    // Timetable
    const [classTimetable, setClassTimetable] = useState(null);

    // Detail Modal State
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Data for Selection
    const ugPrograms = [
        { label: 'B.Tech CSE – 1st Year', name: 'B.Tech', year: 1, category: 'UG' },
        { label: 'B.Tech CSE – 2nd Year', name: 'B.Tech', year: 2, category: 'UG' },
        { label: 'B.Sc CS – 1st Year', name: 'B.Sc CS', year: 1, category: 'UG' },
        { label: 'B.Sc CS – 2nd Year', name: 'B.Sc CS', year: 2, category: 'UG' },
        { label: 'B.Sc CS – 3rd Year', name: 'B.Sc CS', year: 3, category: 'UG' },
    ];

    const pgPrograms = [
        { label: 'M.Sc Computer Science – 2nd Year', name: 'M.Sc CS', year: 2, category: 'PG' },
        { label: 'M.Sc Data Analytics – 1st Year', name: 'M.Sc Data Analytics', year: 1, category: 'PG' },
        { label: 'M.Sc CS Integrated – 1st Year', name: 'M.Sc CS Integrated', year: 1, category: 'PG' },
        { label: 'MCA – 1st Year', name: 'MCA', year: 1, category: 'PG' },
        { label: 'MCA – 2nd Year', name: 'MCA', year: 2, category: 'PG' },
        { label: 'M.Tech Data Science – 1st Year', name: 'M.Tech Data Analytics', year: 1, category: 'PG' },
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
            if (item.name === 'M.Tech DS') mappedProgram = 'M.Tech Data Analytics';

            const data = await studentService.getStudentsByProgram(mappedProgram, item.year);
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
        if (view === 'directory') setView(selectedClass.category === 'UG' ? 'ug' : 'pg');
        else setView('landing');
    };

    const renderLanding = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
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
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleStudentClick(student)}
                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                        >
                                            View <ChevronRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
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
            <Sidebar role="Student" />

            <main className="flex-1 ml-0 lg:ml-64 p-4 sm:p-6 lg:p-8">
                <header className="mb-6">
                    <div className="flex items-center">
                        {view !== 'landing' && (
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
                                Student Directory
                            </h1>
                            <p className="text-gray-500 mt-1">
                                {view === 'landing' && "Find and connect with classmates"}
                                {view === 'ug' && "Undergraduate Programs"}
                                {view === 'pg' && "Postgraduate Programs"}
                                {view === 'directory' && `${selectedClass?.label}`}
                            </p>
                        </div>
                    </div>
                </header>

                {view === 'landing' && renderLanding()}
                {view === 'ug' && renderSelection(ugPrograms, 'Undergraduate')}
                {view === 'pg' && renderSelection(pgPrograms, 'Postgraduate')}
                {view === 'directory' && renderDirectory()}

                {isDetailOpen && <DetailModal />}

            </main>
        </div>
    );
};

export default StudentDirectory;

