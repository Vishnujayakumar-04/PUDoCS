import React from 'react';
import {
    CalendarClock,
    Clock,
    MapPin,
    BookOpen,
    Users,
    Download,
    ChevronRight,
    Search,
    Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';

const StaffTimetable = () => {
    const { role: authRole } = useAuth();

    const schedule = [
        {
            day: 'Monday', slots: [
                { time: '10:00 - 11:00', subject: 'Modern Operating Systems', room: '103', class: 'M.Sc CS - 1st Year' },
                { time: '11:15 - 12:15', subject: 'Advanced Database Systems', room: '203', class: 'M.Sc CS - 2nd Year' },
            ]
        },
        {
            day: 'Tuesday', slots: [
                { time: '02:00 - 03:00', subject: 'Machine Learning', room: 'SH 367', class: 'M.Tech DS - 1st Year' },
            ]
        },
        {
            day: 'Wednesday', slots: [
                { time: '10:00 - 11:00', subject: 'Modern Operating Systems', room: '103', class: 'M.Sc CS - 1st Year' },
            ]
        },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar role={authRole || 'Staff'} />

            <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
                <header className="bg-white shadow-sm z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center">
                                <CalendarClock className="mr-3 text-orange-500" />
                                Faculty Schedule
                            </h1>
                            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest italic">Academic Engagement Log</p>
                        </div>
                        <button className="flex items-center px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-gray-200">
                            <Download className="w-4 h-4 mr-2" />
                            Export PDF
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-5xl mx-auto space-y-6">

                        <div className="grid grid-cols-1 gap-8">
                            {schedule.map((dayData, i) => (
                                <div key={i} className="relative">
                                    <div className="flex items-center mb-4">
                                        <div className="h-px bg-gray-200 flex-1"></div>
                                        <h2 className="mx-4 text-xs font-black text-gray-400 tracking-[0.2em] uppercase">{dayData.day}</h2>
                                        <div className="h-px bg-gray-200 flex-1"></div>
                                    </div>

                                    <div className="space-y-4">
                                        {dayData.slots.map((slot, j) => (
                                            <Card key={j} className="border border-gray-100 hover:border-orange-200 transition-all p-0 overflow-hidden shadow-sm hover:shadow-md">
                                                <div className="flex flex-col md:flex-row">
                                                    <div className="bg-orange-50/50 md:w-48 p-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-orange-100">
                                                        <Clock className="w-5 h-5 text-orange-500 mb-2" />
                                                        <span className="text-sm font-black text-gray-900">{slot.time}</span>
                                                    </div>
                                                    <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between">
                                                        <div>
                                                            <h3 className="text-lg font-black text-gray-900 tracking-tight">{slot.subject}</h3>
                                                            <div className="mt-2 flex items-center space-x-4">
                                                                <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                                    <MapPin className="w-4 h-4 mr-1 text-orange-400" />
                                                                    Room {slot.room}
                                                                </div>
                                                                <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                                    <Users className="w-4 h-4 mr-1 text-orange-400" />
                                                                    {slot.class}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button className="mt-4 md:mt-0 p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all border border-transparent hover:border-orange-100">
                                                            <ChevronRight className="w-6 h-6" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default StaffTimetable;
