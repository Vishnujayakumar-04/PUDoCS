import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import { studentService } from '../../services/studentService';
import {
    Calendar,
    Clock,
    MapPin,
    FileText,
    AlertCircle
} from 'lucide-react';

const StudentExams = () => {
    const [loading, setLoading] = useState(true);
    const [exams, setExams] = useState([]);
    const [profile, setProfile] = useState(null);

    // Mock User
    const user = { uid: 'student123', email: 'student@pondiuni.ac.in' };

    useEffect(() => {
        loadExams();
    }, []);

    const loadExams = async () => {
        setLoading(true);
        try {
            const profileData = await studentService.getProfile(user.uid, user.email);
            setProfile(profileData);

            if (profileData && profileData.program && profileData.year) {
                const data = await studentService.getExams(profileData.program, profileData.year);
                setExams(data || []);
            }
        } catch (error) {
            console.error("Error loading exams", error);
        } finally {
            setLoading(false);
        }
    };

    const isSecondYear = profile && (
        (profile.program === 'M.Sc CS' && (profile.year === 'II' || profile.year === '2')) ||
        (profile.program === 'MCA' && (profile.year === 'II' || profile.year === '2'))
    );

    const projectReviews = [
        { milestone: 'Zeroth Review*', date: '2026-01-22', docs: 'Project title, Intro, Internship letter', marks: 10 },
        { milestone: 'First Review*', date: '2026-02-21', docs: 'Analysis, Design, Progress Report I', marks: 10 },
        { milestone: 'Second Review*', date: '2026-04-07', docs: 'Full Demo, Progress Report II', marks: 10 },
        { milestone: 'Report Submission', date: '2026-04-28', docs: 'Final Project Report', marks: 10 },
        { milestone: 'Final External Review', date: '2026-05-04', docs: 'Demo, Report, Viva Voce', marks: 60 },
    ];

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
                        <Calendar className="mr-3 text-blue-600" />
                        Exam Schedule
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isSecondYear ? 'Project Review & Evaluation Schedule' : 'Your upcoming examination dates'}
                    </p>
                </header>

                {isSecondYear ? (
                    <div className="space-y-6">
                        <Card>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 text-left">
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Milestone</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Documents</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Marks</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {projectReviews.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">{item.milestone}</td>
                                                <td className="px-6 py-4 text-gray-600 font-medium whitespace-nowrap">{new Date(item.date).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-gray-600 text-sm">{item.docs}</td>
                                                <td className="px-6 py-4 text-center font-bold text-blue-600">{item.marks}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-yellow-800">Important Notes</h4>
                                <ul className="mt-1 text-sm text-yellow-700 list-disc list-inside">
                                    <li>ALL students should attend the reviews in person.</li>
                                    <li>Online reviews will not be conducted.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 relative border-l-2 border-gray-200 ml-3 pl-8">
                        {exams.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100 -ml-8">
                                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-700">No Exams Scheduled</h3>
                                <p className="text-gray-500">Exam schedules will appear here once published.</p>
                            </div>
                        ) : (
                            exams.map((exam, idx) => (
                                <div key={idx} className="relative mb-8">
                                    {/* Timeline Dot */}
                                    <div className="absolute -left-[43px] top-6 w-5 h-5 rounded-full bg-blue-600 border-4 border-white shadow-sm"></div>

                                    <Card className="hover:shadow-md transition-shadow">
                                        <div className="flex flex-col md:flex-row justify-between md:items-center">
                                            <div>
                                                <div className="flex items-center mb-1">
                                                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wide bg-blue-50 px-2 py-1 rounded mr-3">
                                                        {exam.course}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-800">{exam.subject}</h3>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-50">
                                            <div className="flex items-center text-gray-600">
                                                <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                                                <span className="font-medium">{exam.date}</span>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <Clock className="w-5 h-5 mr-3 text-gray-400" />
                                                <span className="font-medium">{exam.time}</span>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                                                <span className="font-medium">{exam.venue}</span>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            ))
                        )}
                    </div>
                )}

            </main>
        </div>
    );
};

export default StudentExams;

