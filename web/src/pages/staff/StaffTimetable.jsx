import React, { useState, useEffect } from 'react';
import {
    CalendarClock,
    Clock,
    MapPin,
    BookOpen,
    Users,
    Download,
    ChevronRight,
    Loader2,
    AlertCircle,
    Save
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import { staffData } from '../../data/staffData';
import { staffTimetables } from '../../data/staffTimetable';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { staffService } from '../../services/staffService';

const TIME_SLOTS = [
    "9:30-10:30",
    "10:30-11:30",
    "11:30-12:30",
    "12:30-1:30",
    "1:30-2:30",
    "2:30-3:30",
    "3:30-4:30",
    "4:30-5:30"
];

const StaffTimetable = () => {
    const { user, role: authRole } = useAuth();
    // schedule will store the raw object for grid mapping: { "Monday": [...], "Tuesday": [...] }
    const [timetableData, setTimetableData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [staffName, setStaffName] = useState('');
    const [saving, setSaving] = useState(false);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null); // { day, time, subject, room }
    const [formData, setFormData] = useState({ subject: '', room: '' });

    // Days to display
    const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    const handleSlotClick = (day, time, currentSubject, currentRoom) => {
        if (!isEditing) return;

        setSelectedSlot({ day, time });
        setFormData({
            subject: currentSubject !== '-' ? currentSubject : '',
            room: currentRoom !== '-' ? currentRoom : ''
        });
        setModalOpen(true);
    };

    const handleSaveSlot = async () => {
        if (!selectedSlot) return;
        setSaving(true);

        // Clone current data, ensuring object structure
        const newTimetable = timetableData ? { ...timetableData } : {};

        // Ensure day array exists
        if (!newTimetable[selectedSlot.day]) {
            newTimetable[selectedSlot.day] = [];
        }

        // Find existing slot index if it exists in the array
        const slotIndex = newTimetable[selectedSlot.day].findIndex(s => s.time === selectedSlot.time);

        const newSlotData = {
            time: selectedSlot.time,
            subject: formData.subject || '-',
            room: formData.room || '-'
        };

        if (slotIndex >= 0) {
            newTimetable[selectedSlot.day][slotIndex] = newSlotData;
        } else {
            newTimetable[selectedSlot.day].push(newSlotData);
        }

        try {
            // Save to Firestore
            await staffService.saveTimetable(user.uid, newTimetable, user.email);
            setTimetableData(newTimetable);
            setModalOpen(false);
        } catch (error) {
            console.error("Failed to save timetable:", error);
            alert("Failed to save changes. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteSlot = async (e, day, time) => {
        e.stopPropagation(); // Prevent opening modal
        if (!window.confirm("Clear this slot?")) return;

        const newTimetable = { ...timetableData };
        const slotIndex = newTimetable[day].findIndex(s => s.time === time);
        if (slotIndex >= 0) {
            newTimetable[day][slotIndex] = { ...newTimetable[day][slotIndex], subject: '-', room: '-' };

            try {
                // Save to Firestore
                await staffService.saveTimetable(user.uid, newTimetable, user.email);
                setTimetableData(newTimetable);
            } catch (error) {
                console.error("Failed to save timetable:", error);
                alert("Failed to save changes. Please try again.");
            }
        }
    };

    useEffect(() => {
        const fetchTimetable = async () => {
            setLoading(true);
            try {
                if (user?.email) {
                    let name = '';
                    const staffMember = staffData.find(s => s.email.toLowerCase() === user.email.toLowerCase());

                    if (staffMember) {
                        name = staffMember.name;
                    } else {
                        // Fallback name lookup
                        const q = query(collection(db, 'staff'), where('email', '==', user.email));
                        const querySnapshot = await getDocs(q);
                        if (!querySnapshot.empty) {
                            name = querySnapshot.docs[0].data().name;
                        }
                    }

                    setStaffName(name);

                    // 1. Try fetching from Firestore
                    const savedSchedule = await staffService.getTimetable(user.uid);

                    if (savedSchedule) {
                        setTimetableData(savedSchedule);
                    } else {
                        // 2. Fallback to static file if no Firestore data
                        if (name && staffTimetables[name]) {
                            setTimetableData(staffTimetables[name]);
                            // Optional: Auto-migrate static data to Firestore on first load?
                            // await staffService.saveTimetable(user.uid, staffTimetables[name], user.email);
                        } else {
                            setTimetableData(null);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching timetable:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTimetable();
    }, [user]);

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50 items-center justify-center">
                <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-gray-50 overflow-hidden flex">
            {/* Background Animations */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-200/30 rounded-full blur-[100px] animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-yellow-200/30 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-red-200/30 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
            </div>

            <Sidebar role={authRole || 'Staff'} />

            <div className="flex-1 flex flex-col overflow-hidden lg:ml-64 relative z-10 transition-all duration-300">
                <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center">
                                <CalendarClock className="mr-3 text-orange-500" />
                                My Timetable
                            </h1>
                            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest italic">
                                {staffName || 'Staff'} - Weekly Schedule
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`flex items-center px-6 py-2.5 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest shadow-lg transform active:scale-95 ${isEditing ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-200' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100 shadow-gray-100'
                                    }`}
                            >
                                <Users className="w-4 h-4 mr-2" />
                                {isEditing ? 'Done Editing' : 'Edit Schedule'}
                            </button>
                            {!isEditing && (
                                <button className="flex items-center px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-gray-200 transform active:scale-95">
                                    <Download className="w-4 h-4 mr-2" />
                                    PDF
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {timetableData ? (
                            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr>
                                                <th className="sticky left-0 z-20 bg-gray-50/90 backdrop-blur-md px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-r border-gray-200 min-w-[120px]">
                                                    Day / Time
                                                </th>
                                                {TIME_SLOTS.map((slot) => (
                                                    <th key={slot} className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 min-w-[160px] whitespace-nowrap text-center bg-white/50 backdrop-blur-md">
                                                        {slot}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {DAYS.map((day) => {
                                                const daySlots = timetableData[day] || [];
                                                return (
                                                    <tr key={day} className="group hover:bg-white/60 transition-colors">
                                                        <td className="sticky left-0 z-10 bg-white/95 backdrop-blur-sm group-hover:bg-white px-6 py-6 border-r border-gray-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                                                            <div className="flex items-center">
                                                                <div className={`w-1.5 h-8 rounded-full mr-3 shadow-sm ${day === 'Monday' ? 'bg-purple-500' :
                                                                    day === 'Tuesday' ? 'bg-blue-500' :
                                                                        day === 'Wednesday' ? 'bg-green-500' :
                                                                            day === 'Thursday' ? 'bg-orange-500' :
                                                                                'bg-pink-500'
                                                                    }`}></div>
                                                                <span className="text-xs font-black text-gray-900 uppercase tracking-widest">{day.substring(0, 3)}</span>
                                                            </div>
                                                        </td>

                                                        {TIME_SLOTS.map((timeSlot) => {
                                                            const scheduledClass = daySlots.find(s => s.time === timeSlot);
                                                            const hasClass = scheduledClass && scheduledClass.subject !== '-';
                                                            const isLab = hasClass && (scheduledClass.room.includes('Lab') || scheduledClass.subject.includes('Lab'));

                                                            return (
                                                                <td
                                                                    key={timeSlot}
                                                                    className={`px-2 py-2 border-r border-gray-50/50 last:border-r-0 align-top h-full ${isEditing ? 'cursor-pointer hover:bg-orange-50/30' : ''}`}
                                                                    onClick={() => handleSlotClick(day, timeSlot, scheduledClass?.subject || '-', scheduledClass?.room || '-')}
                                                                >
                                                                    {hasClass ? (
                                                                        <div className={`relative h-full min-h-[100px] p-4 rounded-2xl border flex flex-col justify-between transition-all hover:shadow-lg hover:-translate-y-1 duration-300 ${isLab
                                                                            ? 'bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-100/50 hover:border-cyan-200'
                                                                            : 'bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-100/50 hover:border-orange-200'
                                                                            }`}>
                                                                            {isEditing && (
                                                                                <div
                                                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md cursor-pointer hover:bg-red-600 z-10 hover:scale-110 transition-transform"
                                                                                    onClick={(e) => handleDeleteSlot(e, day, timeSlot)}
                                                                                >
                                                                                    <AlertCircle className="w-3 h-3" />
                                                                                </div>
                                                                            )}
                                                                            <div className="mb-2">
                                                                                <div className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${isLab ? 'text-cyan-600' : 'text-orange-600'
                                                                                    }`}>
                                                                                    {isLab ? 'Practical' : 'Theory'}
                                                                                </div>
                                                                                <div className="text-sm font-black text-gray-900 leading-tight line-clamp-2">
                                                                                    {scheduledClass.subject}
                                                                                </div>
                                                                            </div>

                                                                            {scheduledClass.room && scheduledClass.room !== '-' && (
                                                                                <div className="flex items-center text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-auto bg-white/50 px-2 py-1 rounded-lg backdrop-blur-sm w-fit shadow-sm">
                                                                                    <MapPin className="w-3 h-3 mr-1.5" />
                                                                                    {scheduledClass.room}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="h-full min-h-[100px] flex items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl group-hover:border-gray-200 transition-colors">
                                                                            {isEditing ? (
                                                                                <Users className="text-gray-300 w-5 h-5" />
                                                                            ) : (
                                                                                <span className="text-gray-200 text-3xl font-black opacity-20">-</span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            // Empty state...
                            <div className="flex flex-col items-center justify-center h-80 text-center mt-10 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-200">
                                <div className="p-4 bg-orange-50 rounded-full mb-4">
                                    <CalendarClock className="w-10 h-10 text-orange-400" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">No Schedule Found</h3>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">Your weekly timetable is currently empty.</p>
                                <button
                                    onClick={() => {
                                        setTimetableData({});
                                        setIsEditing(true);
                                    }}
                                    className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-orange-200 transition-all active:scale-95"
                                >
                                    Create Schedule
                                </button>
                            </div>
                        )}
                    </div>
                </main>

                {/* Edit Modal */}
                {modalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-8 animate-in zoom-in-95 duration-200 border border-gray-100">
                            <h3 className="text-xl font-black text-gray-900 mb-1 tracking-tight">Edit Slot</h3>
                            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-8">
                                {selectedSlot?.day} • {selectedSlot?.time}
                            </p>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Subject</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-gray-900 text-sm transition-all"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        placeholder="e.g. CS101"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Room / Type</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium text-gray-900 text-sm transition-all"
                                        value={formData.room}
                                        onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                                        placeholder="e.g. Lab 1 or Theory"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveSlot}
                                    disabled={saving}
                                    className="flex-1 px-4 py-3 bg-orange-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 hover:shadow-orange-300 transform active:scale-95 disabled:opacity-70"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffTimetable;
