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
        <div className="flex h-screen bg-gray-50">
            <Sidebar role={authRole || 'Staff'} />

            <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
                <header className="bg-white shadow-sm z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center">
                                <CalendarCheck className="mr-3 text-teal-600" />
                                Event Calendar
                            </h1>
                            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest italic">Inter-departmental Activity Feed</p>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto">

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="animate-spin h-10 w-10 text-teal-600" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {events.map((event) => (
                                    <Card key={event.id} className="p-0 border border-gray-100 hover:shadow-2xl transition-all group group overflow-hidden bg-white flex flex-col">
                                        <div className="h-32 bg-teal-600 relative overflow-hidden">
                                            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-xl p-2 text-white">
                                                <div className="text-[10px] font-black uppercase tracking-widest">Organizer</div>
                                                <div className="text-xs font-bold">Office</div>
                                            </div>
                                            <Calendar className="absolute -bottom-6 -left-6 w-32 h-32 text-white/10 rotate-12" />
                                        </div>
                                        <div className="p-6 -mt-10 bg-white rounded-t-3xl relative z-10 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="h-14 w-14 bg-teal-50 rounded-2xl flex flex-col items-center justify-center border border-teal-100 group-hover:scale-110 transition-transform">
                                                    <span className="text-[10px] font-black text-teal-600 uppercase">Jan</span>
                                                    <span className="text-xl font-black text-teal-700">24</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Venue</div>
                                                    <div className="text-xs font-bold text-gray-700">{event.location || event.venue}</div>
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-black text-gray-900 tracking-tight leading-tight mb-4">{event.name || event.title}</h3>

                                            <div className="space-y-3 mt-auto pt-6 border-t border-gray-50">
                                                <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                    <Clock className="w-3.5 h-3.5 mr-2 text-teal-500" />
                                                    {event.time || 'All Day'}
                                                </div>
                                                <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                    <Users className="w-3.5 h-3.5 mr-2 text-teal-500" />
                                                    Open to All
                                                </div>
                                            </div>
                                        </div>
                                        <button className="w-full bg-teal-600 py-3 text-white text-[10px] font-black uppercase tracking-widest hover:bg-teal-700 transition-colors flex items-center justify-center group-hover:gap-4 transition-all gap-2">
                                            <span>Reserve Seat</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </Card>
                                ))}
                                {events.length === 0 && (
                                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                                        <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
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
