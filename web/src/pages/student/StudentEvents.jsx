import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { studentService } from '../../services/studentService';
import {
    Calendar,
    Clock,
    MapPin,
    Star,
    ExternalLink,
    Phone,
    Mail
} from 'lucide-react';

const StudentEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const data = await studentService.getEvents();
            setEvents(data || []);
        } catch (error) {
            console.error('Error loading events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = (event) => {
        if (event.registrationLink) {
            window.open(event.registrationLink, '_blank');
        } else {
            alert(`Contact: ${event.contact || event.email || 'Admin'}`);
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
                        <Star className="mr-3 text-yellow-500" />
                        Upcoming Events
                    </h1>
                    <p className="text-gray-500 mt-1">Workshops, seminars, and cultural activities</p>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    {events.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-700">No Events Found</h3>
                            <p className="text-gray-500">Stay tuned for upcoming events.</p>
                        </div>
                    ) : (
                        events.map((event, idx) => (
                            <Card key={idx} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                                <div className="flex flex-col md:flex-row">
                                    {/* Image or Placeholder */}
                                    <div className="md:w-1/3 h-48 md:h-auto bg-gray-200 relative">
                                        {event.image ? (
                                            <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 text-center">
                                                <Calendar className="w-12 h-12 mb-2 opacity-80" />
                                                <h3 className="font-bold text-lg">{event.name || event.title}</h3>
                                                <span className="text-sm opacity-90 mt-1">{event.category}</span>
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-blue-600 uppercase shadow-sm">
                                            {event.category || 'Event'}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-6 flex flex-col">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{event.name || event.title}</h3>

                                        <div className="space-y-3 mb-4">
                                            <div className="flex items-center text-gray-600 text-sm">
                                                <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                                                {event.date ? new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Date TBA'}
                                            </div>
                                            {event.time && (
                                                <div className="flex items-center text-gray-600 text-sm">
                                                    <Clock className="w-4 h-4 mr-2 text-blue-500" />
                                                    {event.time}
                                                </div>
                                            )}
                                            <div className="flex items-center text-gray-600 text-sm">
                                                <MapPin className="w-4 h-4 mr-2 text-red-500" />
                                                {event.location || event.venue || 'Venue TBA'}
                                            </div>
                                        </div>

                                        <p className="text-gray-600 text-sm mb-6 flex-1 line-clamp-3">
                                            {event.description}
                                        </p>

                                        {/* Footer / Action */}
                                        <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                                            <div className="flex space-x-4">
                                                {event.contact && (
                                                    <div className="flex items-center text-xs text-gray-500" title={`Contact: ${event.contact}`}>
                                                        <Phone className="w-3 h-3 mr-1" />
                                                        <span>Contact</span>
                                                    </div>
                                                )}
                                                {event.email && (
                                                    <div className="flex items-center text-xs text-gray-500" title={`Email: ${event.email}`}>
                                                        <Mail className="w-3 h-3 mr-1" />
                                                        <span>Email</span>
                                                    </div>
                                                )}
                                            </div>
                                            <Button
                                                variant={event.registrationLink ? "primary" : "outline"}
                                                onClick={() => handleRegister(event)}
                                                className="text-sm py-1.5"
                                            >
                                                {event.registrationLink ? (
                                                    <>Register Now <ExternalLink className="w-3 h-3 ml-2" /></>
                                                ) : (
                                                    'View Details'
                                                )}
                                            </Button>
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

export default StudentEvents;

