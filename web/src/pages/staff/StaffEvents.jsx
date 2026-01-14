import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Plus,
    Search,
    MapPin,
    Clock,
    Users,
    ChevronRight,
    Loader2,
    CalendarCheck,
    ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { staffService } from '../../services/staffService';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';

const StaffEvents = () => {
    const { role: authRole } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            setLoading(true);
            const data = await staffService.getEvents();
            setEvents(data);
        } catch (error) {
            console.error('Error loading events:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-gray-50 overflow-hidden flex">
            {/* Background Animations */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-200/30 rounded-full blur-[100px] animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-emerald-200/30 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-cyan-200/30 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
            </div>

            <Sidebar role={authRole || 'Staff'} />

            <div className="flex-1 flex flex-col relative z-10 lg:ml-64 transition-all duration-300">
                <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center">
                                <CalendarCheck className="mr-3 text-teal-600" />
                                Event Calendar
                            </h1>
                            <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest italic">Inter-departmental Activity Feed</p>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="animate-spin h-10 w-10 text-teal-600" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {events.map((event) => (
                                    <div key={event.id} className="group bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden relative">
                                        <div className="h-40 bg-gradient-to-br from-teal-500 to-emerald-600 relative overflow-hidden">
                                            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-xl p-2 text-white border border-white/20">
                                                <div className="text-[10px] font-black uppercase tracking-widest">Organizer</div>
                                                <div className="text-xs font-bold">Office</div>
                                            </div>
                                            <Calendar className="absolute -bottom-6 -left-6 w-40 h-40 text-white/10 rotate-12 group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="p-6 -mt-12 relative z-10 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="h-16 w-16 bg-white rounded-2xl flex flex-col items-center justify-center border border-gray-100 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                    <span className="text-[10px] font-black text-teal-600 uppercase">Jan</span>
                                                    <span className="text-2xl font-black text-gray-900">24</span>
                                                </div>
                                                <div className="text-right mt-2">
                                                    <div className="text-[10px] font-black text-teal-200 bg-teal-800/80 backdrop-blur-sm px-2 py-1 rounded-lg uppercase tracking-widest">Venue</div>
                                                    <div className="text-xs font-bold text-gray-700 mt-1 shadow-sm bg-white/50 px-2 py-1 rounded-lg backdrop-blur-sm">{event.location || event.venue}</div>
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-black text-gray-900 tracking-tight leading-tight mb-4 group-hover:text-teal-700 transition-colors">{event.name || event.title}</h3>

                                            <div className="space-y-3 mt-auto pt-6 border-t border-gray-100/50">
                                                <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50 p-2 rounded-lg">
                                                    <Clock className="w-4 h-4 mr-2.5 text-teal-500" />
                                                    {event.time || 'All Day'}
                                                </div>
                                                <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50 p-2 rounded-lg">
                                                    <Users className="w-4 h-4 mr-2.5 text-teal-500" />
                                                    Open to Members
                                                </div>
                                            </div>
                                        </div>
                                        <button className="w-full bg-teal-600 py-4 text-white text-[10px] font-black uppercase tracking-widest hover:bg-teal-700 transition-colors flex items-center justify-center group-hover:gap-4 gap-2 border-t border-teal-700/20">
                                            <span>Reserve Seat</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                                {events.length === 0 && (
                                    <div className="col-span-full py-20 text-center bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-200">
                                        <div className="inline-flex p-4 bg-gray-50 rounded-full mb-4">
                                            <Calendar className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-400 text-xs font-black uppercase tracking-widest">No scheduled activities found in the calendar.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StaffEvents;
