import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { studentService } from '../../services/studentService';
import { getDefaultSubjects } from '../../utils/defaultSubjects';
import {
    Trophy,
    FileText,
    Edit,
    ChevronRight,
    Download
} from 'lucide-react';

const StudentResults = () => {
    // Tab: 'internal' | 'assignment'
    const [activeTab, setActiveTab] = useState('internal');
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState(null);
    const [internalMarks, setInternalMarks] = useState([]);
    const [assignmentMarks, setAssignmentMarks] = useState([]);
    const [profile, setProfile] = useState(null);

    // Mock User
    const user = { uid: 'student123', email: 'student@pondiuni.ac.in' };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [resultsData, internalData, assignmentData, profileData] = await Promise.all([
                studentService.getResults(user.uid),
                studentService.getInternalMarks(user.uid, user.email),
                studentService.getAssignmentMarks(user.uid, user.email),
                studentService.getProfile(user.uid, user.email)
            ]);

            setResults(resultsData);
            setProfile(profileData);

            if (profileData && profileData.program && profileData.year) {
                const defaultSubjects = getDefaultSubjects(profileData.program, profileData.year);

                // Merge Internals
                const mergedInternal = defaultSubjects.map(def => {
                    const existing = internalData.find(m =>
                        (m.subjectCode || m.code) === def.code ||
                        (m.subjectName || m.subject) === def.name
                    );
                    return existing || {
                        code: def.code,
                        name: def.name,
                        maxMarks: null,
                        marks: null
                    };
                });
                setInternalMarks(mergedInternal);

                // Merge Assignments
                const mergedAssignment = defaultSubjects.map(def => {
                    const existing = assignmentData.find(m =>
                        (m.subjectCode || m.code) === def.code ||
                        (m.subjectName || m.subject) === def.name
                    );
                    return existing || {
                        code: def.code,
                        name: def.name,
                        maxMarks: null,
                        marks: null
                    };
                });
                setAssignmentMarks(mergedAssignment);
            } else {
                setInternalMarks(internalData);
                setAssignmentMarks(assignmentData);
            }

        } catch (error) {
            console.error("Error loading results", error);
        } finally {
            setLoading(false);
        }
    };

    const isSecondYear = profile && (
        (profile.program === 'M.Sc CS' && (profile.year === 'II' || profile.year === '2')) ||
        (profile.program === 'MCA' && (profile.year === 'II' || profile.year === '2'))
    );

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

    if (isSecondYear) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar role="Student" />
                <main className="flex-1 ml-0 lg:ml-64 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                    <div className="text-center">
                        <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-700">Project Work Only</h2>
                        <p className="text-gray-500 mt-2">Internal and Assignment marks are not applicable for 2nd year project work.</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar role="Student" />

            <main className="flex-1 ml-0 lg:ml-64 p-4 sm:p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <Trophy className="mr-3 text-blue-600" />
                        Results & Marks
                    </h1>
                    <p className="text-gray-500 mt-1">View your internal assessments and assignment scores</p>
                </header>

                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg mb-6 w-fit">
                    <button
                        onClick={() => setActiveTab('internal')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${activeTab === 'internal'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Internal Marks
                    </button>
                    <button
                        onClick={() => setActiveTab('assignment')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${activeTab === 'assignment'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Assignment Marks
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    <Card title={activeTab === 'internal' ? 'Internal Assessment Scores' : 'Assignment Scores'}>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 text-left">
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">S.No</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject Code</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject Name</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Total Marks</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Secured</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {(activeTab === 'internal' ? internalMarks : assignmentMarks).length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                No marks available yet
                                            </td>
                                        </tr>
                                    ) : (
                                        (activeTab === 'internal' ? internalMarks : assignmentMarks).map((mark, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{mark.code || mark.subjectCode}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{mark.name || mark.subjectName}</td>
                                                <td className="px-6 py-4 text-center text-sm text-gray-500">{mark.maxMarks || mark.totalMark || '--'}</td>
                                                <td className="px-6 py-4 text-center text-sm font-bold text-blue-600">{mark.marks || mark.markSecured || '--'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

            </main>
        </div>
    );
};

export default StudentResults;

