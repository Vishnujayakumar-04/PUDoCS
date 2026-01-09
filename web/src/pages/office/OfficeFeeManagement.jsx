import React, { useState } from 'react';
import {
    CreditCard,
    Search,
    Filter,
    Download,
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Button from '../../components/Button';

const OfficeFeeManagement = () => {
    const { role: authRole } = useAuth();
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const feeRecords = [
        { id: '1', studentName: 'Adarsh P S', regNo: '24MSCCS001', amount: 45000, status: 'Paid', date: '2025-01-05' },
        { id: '2', studentName: 'Alan Shaji', regNo: '24MSCCS002', amount: 45000, status: 'Pending', date: '-' },
        { id: '3', studentName: 'Amal K Paulson', regNo: '24MSCCS003', amount: 45000, status: 'Overdue', date: '-' },
        { id: '4', studentName: 'Athira G', regNo: '24MSCCS004', amount: 45000, status: 'Paid', date: '2025-01-08' },
        { id: '5', studentName: 'Gouri Parameswaran', regNo: '24MSCCS005', amount: 45000, status: 'Paid', date: '2025-01-02' },
    ];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Paid': return 'bg-green-100 text-green-700 border-green-200';
            case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Overdue': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Paid': return <CheckCircle2 className="w-4 h-4 mr-1" />;
            case 'Pending': return <Clock className="w-4 h-4 mr-1" />;
            case 'Overdue': return <AlertCircle className="w-4 h-4 mr-1" />;
            default: return null;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar role={authRole || 'Office'} />

            <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
                <header className="bg-white shadow-sm z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
                            <p className="text-sm text-gray-500">Monitor and manage student fee payments</p>
                        </div>
                        <div className="flex space-x-3">
                            <button className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium hover:bg-gray-50 shadow-sm">
                                <Download className="w-4 h-4 mr-2" />
                                Export Report
                            </button>
                            <button className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm">
                                <PlusIcon className="w-4 h-4 mr-2" />
                                New Billing
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto space-y-6">

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                                <p className="text-green-100 text-sm font-medium uppercase tracking-wider">Total Collection</p>
                                <h3 className="text-3xl font-bold mt-1">₹ 14,25,000</h3>
                                <p className="text-green-100 text-xs mt-2 font-medium">↑ 12% from last month</p>
                            </Card>
                            <Card className="bg-white border-l-4 border-amber-500">
                                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Pending Payments</p>
                                <h3 className="text-3xl font-bold text-gray-800 mt-1">₹ 2,40,000</h3>
                                <p className="text-amber-600 text-xs mt-2 font-medium">18 students remaining</p>
                            </Card>
                            <Card className="bg-white border-l-4 border-red-500">
                                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Overdue</p>
                                <h3 className="text-3xl font-bold text-gray-800 mt-1">₹ 85,000</h3>
                                <p className="text-red-600 text-xs mt-2 font-medium">5 critical students</p>
                            </Card>
                        </div>

                        {/* Search & Filter */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search student or register number..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button className="flex items-center px-4 py-2 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                                <Filter className="w-4 h-4 mr-2" />
                                Filter
                            </button>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-left font-medium">
                                <thead>
                                    <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <th className="px-6 py-4">Student</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Paid On</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {feeRecords.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-gray-900">{record.studentName}</div>
                                                <div className="text-xs text-gray-500 font-medium tracking-tight">{record.regNo}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 font-bold">₹ {record.amount.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(record.status)}`}>
                                                    {getStatusIcon(record.status)}
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 font-medium">{record.date}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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

export default OfficeFeeManagement;
