import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import { FileText, Download, BookOpen, ExternalLink } from 'lucide-react';

const StudentSyllabus = () => {
    const [loading, setLoading] = useState(false);

    // Syllabus data organized by program and year
    const syllabusData = [
        {
            id: 1,
            program: 'M.Sc Computer Science',
            year: '2nd Year',
            academicYear: '2020-21',
            fileName: 'msc-cs-2020-21.pdf',
            fileUrl: '/syllabus/msc-cs-2020-21.pdf',
            subjects: [
                'Advanced Algorithms',
                'Machine Learning',
                'Cloud Computing',
                'Data Mining',
                'Network Security',
                'Electives'
            ]
        },
        // Add more syllabus entries here as you get them
    ];

    const handleDownload = (fileUrl, fileName) => {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleView = (fileUrl) => {
        window.open(fileUrl, '_blank');
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

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar role="Student" />

            <main className="flex-1 ml-0 lg:ml-64 p-4 sm:p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <BookOpen className="mr-3 text-cyan-600" />
                        Course Syllabus
                    </h1>
                    <p className="text-gray-500 mt-1">Download and view course syllabi for all programs</p>
                </header>

                {/* Syllabus Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {syllabusData.map((syllabus) => (
                        <Card key={syllabus.id} className="hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start">
                                    <div className="p-3 bg-cyan-50 rounded-lg mr-4">
                                        <FileText className="w-6 h-6 text-cyan-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{syllabus.program}</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {syllabus.year} • Academic Year {syllabus.academicYear}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Subjects List */}
                            <div className="mb-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Subjects Covered:</p>
                                <div className="flex flex-wrap gap-2">
                                    {syllabus.subjects.map((subject, idx) => (
                                        <span
                                            key={idx}
                                            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
                                        >
                                            {subject}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => handleView(syllabus.fileUrl)}
                                    className="flex-1 flex items-center justify-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium text-sm"
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    View PDF
                                </button>
                                <button
                                    onClick={() => handleDownload(syllabus.fileUrl, syllabus.fileName)}
                                    className="flex-1 flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {syllabusData.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-700">No Syllabus Available</h3>
                        <p className="text-gray-500 mt-2">Syllabus documents will be available soon.</p>
                    </div>
                )}

                {/* Info Card */}
                <Card className="mt-6 bg-blue-50 border-blue-200">
                    <div className="flex items-start">
                        <FileText className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-bold text-blue-900 mb-2">About Syllabus</h3>
                            <p className="text-sm text-blue-800 mb-2">
                                The syllabus contains detailed information about course objectives, topics covered,
                                evaluation criteria, and recommended textbooks.
                            </p>
                            <p className="text-xs text-blue-700">
                                For any queries regarding the syllabus, please contact your program coordinator.
                            </p>
                        </div>
                    </div>
                </Card>
            </main>
        </div>
    );
};

export default StudentSyllabus;
