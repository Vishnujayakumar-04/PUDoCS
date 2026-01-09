import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Plus,
    Search,
    Edit2,
    Trash2,
    MapPin,
    Clock,
    X,
    Users,
    ChevronRight,
    Loader2,
    Upload,
    Image as ImageIcon,
    Camera
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { officeService } from '../../services/officeService';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Button from '../../components/Button';

const OfficeEventManagement = () => {
    const { role: authRole } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        date: '',
        time: '',
        location: '',
        description: '',
        organizer: 'Department',
        imageUrl: ''
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            setLoading(true);
            const data = await officeService.getEvents();
            setEvents(data);
        } catch (error) {
            console.error('Error loading events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await officeService.addEvent(formData);
            alert('Event created successfully');
            setModalOpen(false);
            setFormData({ name: '', date: '', time: '', location: '', description: '', organizer: 'Department' });
            loadEvents();
        } catch (error) {
            alert('Error creating event: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this event?')) {
            try {
                await officeService.deleteEvent(id);
                loadEvents();
            } catch (error) {
                alert('Error deleting event: ' + error.message);
            }
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar role={authRole || 'Office'} />

            <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
                <header className="bg-white shadow-sm z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Event Portal</h1>
                            <p className="text-sm text-gray-500">Plan and manage department ceremonies and events</p>
                        </div>
                        <button
                            onClick={() => setModalOpen(true)}
                            className="flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors text-sm font-medium shadow-lg"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Plan New Event
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto space-y-8">

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="animate-spin h-10 w-10 text-teal-600" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {events.map((event) => (
                                    <Card key={event.id} className="p-0 overflow-hidden border border-gray-100 hover:border-teal-200 hover:shadow-xl transition-all group flex flex-col">
                                        <div className="bg-teal-600 p-4 text-white">
                                            <div className="flex justify-between items-start">
                                                <div className="bg-teal-500 p-2 rounded-lg">
                                                    <Calendar className="w-6 h-6" />
                                                </div>
                                                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg transition-colors">
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(event.id)}
                                                        className="p-1.5 bg-white/20 hover:bg-red-500/40 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-bold mt-4 leading-tight">{event.name || event.title}</h3>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col justify-between">
                                            <div className="space-y-3">
                                                <div className="flex items-center text-sm text-gray-600 font-medium">
                                                    <Clock className="w-4 h-4 mr-2 text-teal-600" />
                                                    {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-500 font-medium tracking-tight">
                                                    <MapPin className="w-4 h-4 mr-2 text-teal-600" />
                                                    {event.location || event.venue}
                                                </div>
                                            </div>
                                            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-xs font-bold uppercase tracking-widest text-teal-700">
                                                <span>{event.organizer || 'Department'}</span>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                                {events.length === 0 && (
                                    <div className="col-span-full py-20 text-center">
                                        <p className="text-gray-400">No events scheduled yet.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900 tracking-tight underline decoration-teal-500 underline-offset-4">SCHEDULE EVENT</h3>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Event Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-medium text-sm"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Time</label>
                                    <input
                                        type="time"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-medium text-sm"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Venue / Location</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-medium"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Description</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none resize-none font-medium"
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Event Image</label>
                                <div className="space-y-3">
                                    {formData.imageUrl ? (
                                        <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 group">
                                            <img
                                                src={formData.imageUrl}
                                                alt="Event Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <label className="p-2 bg-white text-teal-600 rounded-lg cursor-pointer hover:scale-110 transition-transform">
                                                    <Camera className="w-5 h-5" />
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={async (e) => {
                                                            const file = e.target.files[0];
                                                            if (!file) return;
                                                            setUploading(true);
                                                            try {
                                                                const { storage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
                                                                const { storage: firebaseStorage } = await import('../../services/firebaseConfig');
                                                                const storageRef = ref(firebaseStorage, `event_images/${Date.now()}_${file.name}`);
                                                                await uploadBytes(storageRef, file);
                                                                const downloadURL = await getDownloadURL(storageRef);
                                                                setFormData(prev => ({ ...prev, imageUrl: downloadURL }));
                                                            } catch (error) {
                                                                console.error('Upload error:', error);
                                                                alert('Error uploading image');
                                                            } finally {
                                                                setUploading(false);
                                                            }
                                                        }}
                                                    />
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                                                    className="p-2 bg-white text-red-600 rounded-lg hover:scale-110 transition-transform"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-teal-300 transition-all group">
                                            {uploading ? (
                                                <div className="flex flex-col items-center animate-pulse">
                                                    <Loader2 className="w-6 h-6 text-teal-500 animate-spin mb-2" />
                                                    <span className="text-xs font-bold text-gray-400">Uploading...</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="p-3 bg-teal-50 text-teal-600 rounded-xl mb-2 group-hover:scale-110 transition-transform">
                                                        <Upload className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Add Image</span>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                disabled={uploading}
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if (!file) return;
                                                    setUploading(true);
                                                    try {
                                                        const { storage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
                                                        const { storage: firebaseStorage } = await import('../../services/firebaseConfig');
                                                        const storageRef = ref(firebaseStorage, `event_images/${Date.now()}_${file.name}`);
                                                        await uploadBytes(storageRef, file);
                                                        const downloadURL = await getDownloadURL(storageRef);
                                                        setFormData(prev => ({ ...prev, imageUrl: downloadURL }));
                                                    } catch (error) {
                                                        console.error('Upload error:', error);
                                                        alert('Error uploading image');
                                                    } finally {
                                                        setUploading(false);
                                                    }
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors uppercase tracking-widest text-[10px]"
                                >
                                    Discard
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-100 transition-all active:scale-95 uppercase tracking-widest text-[10px]"
                                >
                                    Confirm Event
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OfficeEventManagement;
