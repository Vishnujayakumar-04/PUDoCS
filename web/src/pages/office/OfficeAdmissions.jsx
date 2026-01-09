import React, { useState } from 'react';
import {
    FilePlus,
    Search,
    UserPlus,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    Filter,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';

const OfficeAdmissions = () => {
    const { role: authRole } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    const applications = [
        { id: '1', applicant: 'Rahul Sharma', program: 'M.Sc CS', ugPercent: '88%', status: 'Under Review', appliedAt: '2025-01-18' },
        { id: '2', applicant: 'Priya Mani', program: 'MCA', ugPercent: '92%', status: 'Shortlisted', appliedAt: '2025-01-19' },
        { id: '3', applicant: 'Sameer Khan', program: 'M.Tech DS', ugPercent: '85%', status: 'Pending Docs', appliedAt: '2025-01-15' },
        { id: '4', applicant: 'Anita Raj', program: 'M.Sc CS', ugPercent: '94%', status: 'Accepted', appliedAt: '2025-01-20' },
    ];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Accepted': return 'bg-green-100 text-green-700';
            case 'Shortlisted': return 'bg-blue-100 text-blue-700';
            case 'Under Review': return 'bg-purple-100 text-purple-700';
            case 'Pending Docs': return 'bg-amber-100 text-amber-700';
            case 'Rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar role={authRole || 'Office'} />

            <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
                <header className="bg-white shadow-sm z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Admissions Portal</h1>
                            <p className="text-sm text-gray-500">Review student applications and enrollment</p>
                        </div>
                        <button className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium shadow-md">
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Open New Cycle
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto space-y-6">

                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Applications', value: '1,248', color: 'text-purple-600', icon: FileText },
                                { label: 'Shortlisted', value: '312', color: 'text-blue-600', icon: UserPlus },
                                { label: 'Accepted', value: '150', color: 'text-green-600', icon: CheckCircle },
                                { label: 'Pending', value: '45', color: 'text-amber-600', icon: Clock },
                            ].map((stat, i) => (
                                <Card key={i} className="flex flex-col items-center justify-center p-4">
                                    <stat.icon className={`h-6 w-6 ${stat.color} mb-2`} />
                                    <div className="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</div>
                                </Card>
                            ))}
                        </div>

                        {/* Search and Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search applicant name..."
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent focus:border-purple-500 rounded-lg outline-none font-medium text-sm transition-all"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <button className="flex items-center px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-bold uppercase tracking-widest border border-gray-200">
                                    <Filter className="w-4 h-4 mr-2" />
                                    Sort
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left font-medium">
                                    <thead>
                                        <tr className="bg-gray-50/50 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                            <th className="px-6 py-4">Applicant</th>
                                            <th className="px-6 py-4">Program</th>
                                            <th className="px-6 py-4">UG Score</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {applications.map((app) => (
                                            <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-gray-900 tracking-tight">{app.applicant}</div>
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Added {app.appliedAt}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-gray-700">{app.program}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-purple-600">{app.ugPercent}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusStyle(app.status)}`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="inline-flex items-center text-purple-600 hover:text-purple-800 text-xs font-bold uppercase tracking-widest group">
                                                        Review <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

const PlusIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

export default OfficeAdmissions;
