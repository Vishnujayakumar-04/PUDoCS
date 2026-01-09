import React, { useState } from 'react';
import {
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    Eye,
    Download,
    Mail,
    Filter,
    ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';

const OfficeLetters = () => {
    const { role: authRole } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    const requests = [
        { id: '1', student: 'Adarsh P S', type: 'Bonafide Certificate', purpose: 'Education Loan', status: 'Pending', date: '2025-01-20' },
        { id: '2', student: 'Alan Shaji', type: 'Transfer Certificate', purpose: 'Higher Studies', status: 'Approved', date: '2025-01-18' },
        { id: '3', student: 'Amal K Paulson', type: 'Course Completion', purpose: 'Passport Verification', status: 'Approved', date: '2025-01-15' },
        { id: '4', student: 'Athira G', type: 'Bonafide Certificate', purpose: 'Internship', status: 'Pending', date: '2025-01-21' },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar role={authRole || 'Office'} />

            <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
                <header className="bg-white shadow-sm z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <h1 className="text-2xl font-bold text-gray-900 underline decoration-indigo-500 underline-offset-8">Approval Portal</h1>
                        <p className="text-sm text-gray-500 mt-2">Approve student letter and certificate requests</p>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto space-y-6">

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b border-gray-50 flex items-center justify-between gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-300" />
                                    <input
                                        type="text"
                                        placeholder="Search by student name..."
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm tracking-tight"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="flex space-x-2">
                                    <button className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors">
                                        All Status
                                    </button>
                                </div>
                            </div>

                            <div className="divide-y divide-gray-50">
                                {requests.map((request) => (
                                    <div key={request.id} className="p-4 hover:bg-indigo-50/10 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900 tracking-tight">{request.student}</div>
                                                <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest">{request.type}</div>
                                                <div className="text-[10px] text-gray-400 mt-0.5">Purpose: {request.purpose}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-6">
                                            <div className="text-right">
                                                <div className={`text-[10px] font-bold uppercase tracking-widest ${request.status === 'Approved' ? 'text-green-600' : 'text-amber-500'}`}>
                                                    {request.status}
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-bold">{request.date}</div>
                                            </div>

                                            <div className="flex space-x-2">
                                                {request.status === 'Pending' ? (
                                                    <>
                                                        <button className="p-2 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-all border border-green-100">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all border border-red-100">
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-all border border-indigo-100">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default OfficeLetters;
