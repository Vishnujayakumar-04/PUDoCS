import React, { useState } from 'react';
import {
    CalendarClock,
    Plus,
    Search,
    Edit2,
    Trash2,
    Download,
    Eye,
    ChevronRight,
    MapPin,
    Clock,
    BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';

const OfficeTimetable = () => {
    const { role: authRole } = useAuth();

    const timetables = [
        { id: '1', program: 'M.Sc CS', year: '1st Year', lastUpdated: '2025-01-15', semester: 'Sem 1' },
        { id: '2', program: 'M.Sc CS', year: '2nd Year', lastUpdated: '2025-01-12', semester: 'Sem 3' },
        { id: '3', program: 'MCA', year: '1st Year', lastUpdated: '2025-01-10', semester: 'Sem 1' },
        { id: '4', program: 'M.Tech DS', year: '1st Year', lastUpdated: '2025-01-18', semester: 'Sem 1' },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar role={authRole || 'Office'} />

            <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
                <header className="bg-white shadow-sm z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 border-b-4 border-orange-500 inline-block">Scheduling Hub</h1>
                            <p className="text-sm text-gray-500 mt-2">Design and publish department timetables</p>
                        </div>
                        <button className="flex items-center px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-orange-100">
                            <Plus className="w-4 h-4 mr-2" />
                            New Schedule
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto space-y-8">

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {timetables.map((tt) => (
                                <Card key={tt.id} className="p-0 border border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all overflow-hidden flex flex-col group">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 group-hover:scale-110 transition-transform">
                                                <CalendarClock className="w-8 h-8" />
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Schedule</div>
                                                <div className="text-xs font-bold text-orange-600">{tt.semester}</div>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900 leading-tight">{tt.program}</h3>
                                        <p className="text-sm font-bold text-gray-500 mt-1">{tt.year}</p>

                                        <div className="mt-8 pt-4 border-t border-gray-50 flex items-center justify-between">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Modified: {tt.lastUpdated}</div>
                                            <div className="flex space-x-1">
                                                <button className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-transparent hover:border-orange-100">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="w-full bg-gray-50 py-3 text-xs font-bold uppercase tracking-widest text-gray-600 hover:bg-orange-500 hover:text-white transition-all border-t border-gray-100 flex items-center justify-center space-x-2">
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Download PDF</span>
                                    </button>
                                </Card>
                            ))}
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default OfficeTimetable;
