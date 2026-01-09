import React, { useState } from 'react';
import {
    BookOpen,
    Search,
    Edit2,
    Save,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Loader2,
    UserCircle,
    ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { staffService } from '../../services/staffService';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';

const StaffInternals = () => {
    const { role: authRole } = useAuth();
    const [markingMode, setMarkingMode] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);

    const classes = [
        { id: '1', name: 'M.Sc CS - 1st Year', subject: 'Modern Operating Systems', count: 19 },
        { id: '2', name: 'M.Sc CS - 2nd Year', subject: 'Advanced Database Systems', count: 24 },
        { id: '3', name: 'M.Tech DS - 1st Year', subject: 'Machine Learning', count: 15 },
    ];

    const studentMarks = [
        { id: '1', name: 'Adarsh P S', regNo: '24MSCCS001', marks: 18, total: 20 },
        { id: '2', name: 'Alan Shaji', regNo: '24MSCCS002', marks: 16, total: 20 },
        { id: '3', name: 'Amal K Paulson', regNo: '24MSCCS003', marks: 14, total: 20 },
        { id: '4', name: 'Athira G', regNo: '24MSCCS004', marks: 19, total: 20 },
        { id: '5', name: 'Gouri Parameswaran', regNo: '24MSCCS005', marks: 11, total: 20 },
    ];

    const handleSubmitMarks = async () => {
        try {
            const marksData = {
                classId: selectedClass.id,
                className: selectedClass.name,
                subject: selectedClass.subject,
                marks: studentMarks, // In a real app, from state
                updatedBy: authRole
            };
            await staffService.saveInternalMarks(marksData);
            alert('Marks published successfully');
            setMarkingMode(false);
        } catch (error) {
            alert('Error publishing marks');
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar role={authRole || 'Staff'} />

            <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
                <header className="bg-white shadow-sm z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <div className="flex items-center">
                            {markingMode && (
                                <button onClick={() => setMarkingMode(false)} className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                                </button>
                            )}
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase border-l-4 border-indigo-600 pl-4">Gradebook</h1>
                                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest italic">Internal Assessment Portal</p>
                            </div>
                        </div>
                        {markingMode && (
                            <button
                                onClick={handleSubmitMarks}
                                className="flex items-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100"
                            >
                                <Save className="w-3.5 h-3.5 mr-2" />
                                Publish Grades
                            </button>
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-5xl mx-auto space-y-6">

                        {!markingMode ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {classes.map((cls) => (
                                    <Card key={cls.id} className="cursor-pointer border border-gray-100 hover:border-indigo-500 hover:shadow-xl transition-all group overflow-hidden bg-white">
                                        <div className="p-1">
                                            <div className="bg-indigo-50 p-6 rounded-xl mb-4 group-hover:bg-indigo-600 transition-colors">
                                                <BookOpen className="w-8 h-8 text-indigo-600 group-hover:text-white" />
                                            </div>
                                            <div className="px-4 pb-4">
                                                <h3 className="text-lg font-black text-gray-900 tracking-tight">{cls.name}</h3>
                                                <p className="text-xs font-bold text-indigo-500 tracking-widest uppercase mt-1 mb-4">{cls.subject}</p>
                                                <button
                                                    onClick={() => {
                                                        setSelectedClass(cls);
                                                        setMarkingMode(true);
                                                    }}
                                                    className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-indigo-600 group-hover:underline"
                                                >
                                                    Enter Marks <ChevronRight className="w-3 h-3 ml-1" />
                                                </button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="p-6 bg-indigo-100/50 border-b border-indigo-100">
                                    <h3 className="text-lg font-black text-gray-900 tracking-tight">{selectedClass?.subject}</h3>
                                    <p className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase">{selectedClass?.name} • Continuous Evaluation</p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-100">
                                                <th className="px-6 py-4">Student</th>
                                                <th className="px-6 py-4">Current Score</th>
                                                <th className="px-6 py-4">Total</th>
                                                <th className="px-6 py-4 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {studentMarks.map((student) => (
                                                <tr key={student.id} className="hover:bg-indigo-50/20 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-bold text-gray-900 tracking-tight">{student.name}</div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{student.regNo}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="number"
                                                            className="w-20 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm"
                                                            defaultValue={student.marks}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-bold text-gray-400">/ {student.total}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="p-2 text-indigo-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-indigo-100">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StaffInternals;
