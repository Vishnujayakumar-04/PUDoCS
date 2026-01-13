import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';
import {
    Calendar,
    Clock,
    MapPin,
    User,
    ChevronRight,
    BookOpen,
    Filter
} from 'lucide-react';

const StudentTimetable = () => {
    const { user, role: authRole } = useAuth();
    // Mode: 'selector' or 'viewer'
    const [mode, setMode] = useState('viewer');
    const [loading, setLoading] = useState(true);
    const [program, setProgram] = useState(null); // { name, year, label }
    const [timetable, setTimetable] = useState(null);
    const [selectedDay, setSelectedDay] = useState('Monday');
    const [availableDays, setAvailableDays] = useState([]);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            // Try to auto-load from profile
            const profile = await studentService.getProfile(user.uid, user.email);
            if (profile?.program && profile?.year) {
                const mappedProgram = mapProgramName(profile.program);
                const initProgram = {
                    name: mappedProgram,
                    year: profile.year,
                    label: `${mappedProgram} - Year ${profile.year}`
                };
                setProgram(initProgram);
                await loadTimetable(initProgram.name, initProgram.year);
            } else {
                setMode('selector');
            }
        } catch (error) {
            console.error("Error loading initial data", error);
            setMode('selector');
        } finally {
            setLoading(false);
        }
    };

    const mapProgramName = (prog) => {
        if (!prog) return prog;
        const p = prog.toUpperCase();
        if (p.includes('M.SC') && p.includes('CS')) return 'M.Sc CS';
        if (p.includes('MCA')) return 'MCA';
        // Add more mappings as needed, kept simple for now matching mobile logic partially
        return prog;
    };

    const loadTimetable = async (progName, progYear) => {
        setLoading(true);
        try {
            const data = await studentService.getTimetable(progName, progYear);
            if (data && data.schedule) {
                setTimetable(data);
                const days = data.schedule.map(d => d.day);
                setAvailableDays(days);
                if (days.length > 0 && !days.includes(selectedDay)) {
                    setSelectedDay(days[0]);
                }
                setMode('viewer');
            } else {
                setTimetable(null);
                setAvailableDays([]);
            }
        } catch (error) {
            console.error("Error fetching timetable", error);
        } finally {
            setLoading(false);
        }
    };

    const handleProgramSelect = (p) => {
        setProgram(p);
        loadTimetable(p.name, p.year);
    };

    const getDaySchedule = () => {
        if (!timetable?.schedule) return [];
        const dayData = timetable.schedule.find(d => d.day === selectedDay);
        return dayData ? dayData.slots : [];
    };

    const programs = [
        { label: 'M.Sc Computer Science - 1st Year', name: 'M.Sc CS', year: 1 },
        { label: 'M.Sc Computer Science - 2nd Year', name: 'M.Sc CS', year: 2 },
        { label: 'MCA - 1st Year', name: 'MCA', year: 1 },
        { label: 'MCA - 2nd Year', name: 'MCA', year: 2 },
        // Add more as needed
    ];

    if (loading && !timetable) {
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
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                            <Calendar className="mr-3 text-blue-600" />
                            Class Timetable
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {program ? program.label : 'Select your program to view timetable'}
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => setMode('selector')}>
                        <Filter className="w-4 h-4 mr-2" />
                        Change Program
                    </Button>
                </header>

                {mode === 'selector' ? (
                    <div className="max-w-3xl mx-auto grid gap-4">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Select Program</h2>
                        {programs.map((p, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleProgramSelect(p)}
                                className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md cursor-pointer border border-gray-100 transition-all flex justify-between items-center group"
                            >
                                <div className="flex items-center">
                                    <div className="bg-blue-50 p-3 rounded-lg mr-4 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <span className="font-medium text-lg text-gray-800">{p.label}</span>
                                </div>
                                <ChevronRight className="text-gray-400 group-hover:text-blue-500" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {!timetable ? (
                            <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-700">No Timetable Found</h3>
                                <p className="text-gray-500">No schedule available for {program?.label}</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Day Tabs */}
                                <div className="flex space-x-2 overflow-x-auto pb-2">
                                    {availableDays.map(day => (
                                        <button
                                            key={day}
                                            onClick={() => setSelectedDay(day)}
                                            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedDay === day
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                                }`}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>

                                {/* Slots */}
                                <div className="space-y-4">
                                    {getDaySchedule().length === 0 ? (
                                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                            <p className="text-gray-500">No classes scheduled for {selectedDay}</p>
                                        </div>
                                    ) : (
                                        getDaySchedule().map((slot, index) => (
                                            <Card key={index} className="hover:shadow-md transition-shadow">
                                                <div className="flex flex-col md:flex-row md:items-center">
                                                    {/* Time Column */}
                                                    <div className="md:w-48 flex-shrink-0 flex md:flex-col items-center md:items-start justify-between md:justify-center border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-6 mb-4 md:mb-0">
                                                        <div className="flex items-center text-blue-600 font-bold text-lg">
                                                            <Clock className="w-5 h-5 mr-2" />
                                                            {slot.startTime}
                                                        </div>
                                                        <div className="h-8 w-px bg-gray-200 hidden md:block my-1 ml-2"></div>
                                                        <div className="text-gray-400 text-sm font-medium pl-7 md:pl-0">
                                                            {slot.endTime}
                                                        </div>
                                                    </div>

                                                    {/* Content Column */}
                                                    <div className="flex-1 md:pl-6">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h3 className="text-lg font-bold text-gray-800">{slot.subject}</h3>
                                                                {slot.periods && slot.periods > 1 && (
                                                                    <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                                                                        {slot.periods} Periods
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${slot.type === 'Lecture' ? 'bg-blue-100 text-blue-800' :
                                                                slot.type === 'Lab' ? 'bg-purple-100 text-purple-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {slot.type}
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                                            <div className="flex items-center text-gray-600 text-sm">
                                                                <User className="w-4 h-4 mr-2 text-gray-400" />
                                                                {slot.faculty?.name || 'Faculty TBA'}
                                                            </div>
                                                            {slot.room && (
                                                                <div className="flex items-center text-gray-600 text-sm">
                                                                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                                                    Room: {slot.room}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default StudentTimetable;

