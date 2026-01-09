import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { studentService } from '../../services/studentService';
import {
    MessageSquare,
    Send,
    HelpCircle,
    AlertCircle
} from 'lucide-react';

const StudentComplaint = () => {
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('Academic');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Mock User
    const user = { uid: 'student123', email: 'student@pondiuni.ac.in' };

    const categories = ['Academic', 'Administrative', 'Infrastructure', 'Hostel', 'Other'];

    const handleSubmit = async () => {
        if (!subject.trim()) {
            alert('Please enter a subject');
            return;
        }
        if (!description.trim()) {
            alert('Please enter complaint details');
            return;
        }

        setSubmitting(true);
        try {
            await studentService.submitComplaint({
                studentId: user?.uid,
                studentEmail: user?.email,
                subject: subject.trim(),
                category,
                description: description.trim(),
                status: 'Pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            alert('Your complaint has been submitted successfully.');
            setSubject('');
            setDescription('');
            setCategory('Academic');
        } catch (error) {
            console.error('Error submitting complaint:', error);
            alert('Failed to submit complaint.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar role="Student" />

            <main className="flex-1 ml-0 lg:ml-64 p-4 sm:p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <MessageSquare className="mr-3 text-red-600" />
                        File a Complaint
                    </h1>
                    <p className="text-gray-500 mt-1">We are here to help you</p>
                </header>

                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
                        <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                        <p className="text-sm text-blue-700 leading-relaxed">
                            Please provide detailed information about your complaint. Our team will review and respond to your concern as soon as possible. Your feedback helps us improve.
                        </p>
                    </div>

                    <Card className="p-8">
                        <div className="space-y-6">
                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setCategory(cat)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${category === cat
                                                    ? 'bg-red-600 text-white shadow-md'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Subject <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder-gray-400"
                                    placeholder="Brief description of your complaint"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    maxLength={100}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Details <span className="text-red-500">*</span></label>
                                <textarea
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder-gray-400 min-h-[150px]"
                                    placeholder="Please explain the issue in detail..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    maxLength={1000}
                                />
                                <div className="flex justify-between mt-2">
                                    <span className="text-xs text-gray-400">
                                        This will be sent to the administration.
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {description.length}/1000
                                    </span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-end">
                                <Button
                                    variant="primary"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="bg-red-600 hover:bg-red-700 border-red-600"
                                >
                                    {submitting ? (
                                        <span className="flex items-center">
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                                            Submitting...
                                        </span>
                                    ) : (
                                        <span className="flex items-center">
                                            <Send className="w-4 h-4 mr-2" /> Submit Complaint
                                        </span>
                                    )}
                                </Button>
                            </div>

                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default StudentComplaint;

