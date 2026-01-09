import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { studentService } from '../../services/studentService';
import {
    FileText,
    PlusCircle,
    Clock,
    CheckCircle,
    XCircle,
    HelpCircle,
    File
} from 'lucide-react';

const StudentLetters = () => {
    const [activeTab, setActiveTab] = useState('new'); // 'new' | 'status'
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState([]);

    // Request Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [purpose, setPurpose] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Mock User
    const user = { uid: 'student123' };

    const LETTER_TYPES = [
        { id: 1, title: 'Bonafide Certificate', description: 'For bank account, passport, or scholarship purposes.', fee: '₹50' },
        { id: 2, title: 'Course Completion', description: 'Formal letter stating the current status of your degree.', fee: '₹100' },
        { id: 3, title: 'Fee Structure', description: 'Official document detailing semester-wise fee breakdown.', fee: 'Free' },
        { id: 4, title: 'Character Certificate', description: 'Attestation of conduct during the academic period.', fee: '₹50' },
    ];

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        setLoading(true);
        try {
            const data = await studentService.getLetterRequests(user.uid);
            setRequests(data || []);
        } catch (error) {
            console.error('Error loading requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestClick = (type) => {
        setSelectedType(type);
        setPurpose('');
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        if (!purpose.trim()) {
            alert('Please provide a purpose.');
            return;
        }

        setSubmitting(true);
        try {
            await studentService.requestLetter(user.uid, selectedType.title, purpose);
            await loadRequests(); // Refresh list
            setIsModalOpen(false);
            setActiveTab('status'); // Switch to status tab
            alert('Request submitted successfully!');
        } catch (error) {
            console.error('Error submitting request:', error);
            alert('Failed to submit request.');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'text-green-600 bg-green-50 border-green-200';
            case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
            case 'collected': return 'text-blue-600 bg-blue-50 border-blue-200';
            default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar role="Student" />

            <main className="flex-1 ml-0 lg:ml-64 p-4 sm:p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <FileText className="mr-3 text-purple-600" />
                        Letters & Requests
                    </h1>
                    <p className="text-gray-500 mt-1">Apply for certificates and track status</p>
                </header>

                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg mb-6 w-fit">
                    <button
                        onClick={() => setActiveTab('new')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${activeTab === 'new'
                                ? 'bg-white text-purple-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        New Request
                    </button>
                    <button
                        onClick={() => setActiveTab('status')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${activeTab === 'status'
                                ? 'bg-white text-purple-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        <Clock className="w-4 h-4 mr-2" />
                        Status History
                    </button>
                </div>

                {activeTab === 'new' ? (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {LETTER_TYPES.map((type) => (
                                <Card key={type.id} className="hover:border-purple-300 transition-colors cursor-pointer group" onClick={() => handleRequestClick(type)}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-bold text-gray-800 group-hover:text-purple-600 transition-colors">{type.title}</h3>
                                            <p className="text-sm text-gray-500 mt-1 mb-3 pr-4">{type.description}</p>
                                            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">
                                                Fee: {type.fee}
                                            </span>
                                        </div>
                                        <PlusCircle className="w-6 h-6 text-purple-400 group-hover:text-purple-600" />
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <div className="bg-purple-50 rounded-lg p-4 flex items-center text-purple-700 text-sm">
                            <HelpCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                            Documents are usually processed within 3-5 working days. You will be notified when ready for collection.
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                                <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-700">No Requests Yet</h3>
                                <p className="text-gray-500">Your request history will appear here.</p>
                            </div>
                        ) : (
                            requests.map((req) => (
                                <Card key={req.id}>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-bold text-gray-800">{req.type}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(req.status)}`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-3">
                                        <span className="font-medium text-gray-500">Purpose:</span> {req.purpose}
                                    </p>
                                    <div className="text-xs text-gray-400">
                                        Requested on {new Date(req.createdAt).toLocaleDateString()}
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                )}

                {/* Modal */}
                {isModalOpen && selectedType && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-800">Request {selectedType.title}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Purpose of Request <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder-gray-400"
                                        rows="4"
                                        placeholder="Please specify why you need this document..."
                                        value={purpose}
                                        onChange={(e) => setPurpose(e.target.value)}
                                    ></textarea>
                                    <p className="text-xs text-gray-500 mt-2 text-right">{purpose.length}/500 chars</p>
                                </div>

                                <div className="flex space-x-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="primary"
                                        className="flex-1 bg-purple-600 hover:bg-purple-700 border-purple-600"
                                        onClick={handleSubmit}
                                        disabled={submitting || !purpose.trim()}
                                    >
                                        {submitting ? 'Submitting...' : 'Submit Request'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};

export default StudentLetters;

