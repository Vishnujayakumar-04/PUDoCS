import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import { studentService } from '../../services/studentService';
import {
    CalendarDays,
    Sun,
    CalendarClock,
    Clock
} from 'lucide-react';

const StudentNotices = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotices();
    }, []);

    const loadNotices = async () => {
        try {
            const data = await studentService.getNotices();
            // Filter only vacation/holiday notices to match mobile parity
            const vacationNotices = (data || []).filter(notice => {
                const title = (notice.title || '').toLowerCase();
                const content = (notice.content || '').toLowerCase();
                const category = (notice.category || '').toLowerCase();
                return (
                    category === 'vacation' ||
                    category === 'holiday' ||
                    title.includes('vacation') ||
                    title.includes('holiday') ||
                    title.includes('reopen') ||
                    title.includes('college reopen') ||
                    content.includes('vacation') ||
                    content.includes('holiday') ||
                    content.includes('reopen')
                );
            });
            setNotices(vacationNotices);
        } catch (error) {
            console.error('Error loading notices:', error);
        } finally {
            setLoading(false);
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

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar role="Student" />

            <main className="flex-1 ml-0 lg:ml-64 p-4 sm:p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <Sun className="mr-3 text-orange-500" />
                        Vacations & Holidays
                    </h1>
                    <p className="text-gray-500 mt-1">College reopening dates and holiday schedules</p>
                </header>

                <div className="space-y-6">
                    {notices.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                            <CalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-700">No Vacation Notices</h3>
                            <p className="text-gray-500">Check back later for updates on holidays.</p>
                        </div>
                    ) : (
                        notices.map((notice, idx) => (
                            <Card key={idx} className="hover:shadow-md transition-shadow border-l-4 border-l-orange-400">
                                <div className="flex items-start">
                                    <div className="p-3 bg-orange-50 rounded-full mr-4 text-orange-500 hidden md:block">
                                        <CalendarDays className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-800 mb-2">{notice.title}</h3>
                                        {notice.content && (
                                            <p className="text-gray-600 mb-4">{notice.content}</p>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {(notice.vacationStartDate || notice.vacationEndDate) && (
                                                <div className="bg-gray-50 p-3 rounded-lg flex items-center">
                                                    <CalendarDays className="w-5 h-5 text-gray-400 mr-2" />
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-gray-500 font-medium uppercase">Duration</span>
                                                        <span className="text-sm font-semibold text-gray-700">
                                                            {notice.vacationStartDate ? new Date(notice.vacationStartDate).toLocaleDateString() : 'TBA'}
                                                            {' - '}
                                                            {notice.vacationEndDate ? new Date(notice.vacationEndDate).toLocaleDateString() : 'TBA'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {notice.reopenDate && (
                                                <div className="bg-green-50 p-3 rounded-lg flex items-center">
                                                    <CalendarClock className="w-5 h-5 text-green-600 mr-2" />
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-green-600 font-medium uppercase">College Reopens</span>
                                                        <span className="text-sm font-bold text-green-700">
                                                            {new Date(notice.reopenDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-xs text-gray-400">
                                            <Clock className="w-3 h-3 mr-1" />
                                            Posted: {notice.createdAt ? new Date(notice.createdAt).toLocaleDateString() : 'Recently'}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>

            </main>
        </div>
    );
};

export default StudentNotices;
