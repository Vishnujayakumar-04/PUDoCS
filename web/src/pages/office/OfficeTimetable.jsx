import React, { useState, useEffect } from 'react';
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

import { officeService } from '../../services/officeService';

const OfficeTimetable = () => {
    const { role: authRole } = useAuth();
    const [timetables, setTimetables] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await officeService.getTimetables();
            setTimetables(data);
        } catch (error) {
            console.error('Error loading timetables:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this timetable?')) {
            try {
                await officeService.deleteTimetable(id);
                setTimetables(prev => prev.filter(t => t.id !== id));
            } catch (error) {
                alert('Failed to delete timetable');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50 lg:ml-64 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

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
                            {timetables.length > 0 ? timetables.map((tt) => (
                                <Card key={tt.id} className="p-0 border border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all overflow-hidden flex flex-col group">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 group-hover:scale-110 transition-transform">
                                                <CalendarClock className="w-8 h-8" />
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Schedule</div>
                                                <div className="text-xs font-bold text-orange-600">{tt.semester || 'Syllabus'}</div>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900 leading-tight">{tt.program}</h3>
                                        <p className="text-sm font-bold text-gray-500 mt-1">Year {tt.year}</p>

                                        <div className="mt-8 pt-4 border-t border-gray-50 flex items-center justify-between">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Modified: {new Date(tt.createdAt || tt.lastUpdated).toLocaleDateString()}</div>
                                            <div className="flex space-x-1">
                                                <button className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-transparent hover:border-orange-100">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(tt.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )) : (
                                <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
                                    <CalendarClock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 font-medium">No timetables found. Create one to get started.</p>
                                </div>
                            )}
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default OfficeTimetable;
