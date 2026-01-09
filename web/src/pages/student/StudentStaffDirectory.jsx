import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import { staffData } from '../../data/staffData';
import {
    Users,
    Mail,
    Phone,
    BookOpen,
    Award,
    ChevronRight,
    XCircle,
    User,
    Briefcase
} from 'lucide-react';

const StudentStaffDirectory = () => {
    const [selectedCategory, setSelectedCategory] = useState('Professor');
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const categories = ['Professor', 'Associate Professor', 'Assistant Professor'];

    const filteredStaff = staffData.filter(staff => staff.designation === selectedCategory);

    const handleStaffClick = (staff) => {
        setSelectedStaff(staff);
        setIsModalOpen(true);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar role="Student" />

            <main className="flex-1 ml-0 lg:ml-64 p-4 sm:p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <Users className="mr-3 text-indigo-600" />
                        Staff Directory
                    </h1>
                    <p className="text-gray-500 mt-1">Department Faculty Members</p>
                </header>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === category
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredStaff.map((staff, idx) => (
                        <Card
                            key={idx}
                            className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group p-0 border border-gray-100"
                            onClick={() => handleStaffClick(staff)}
                        >
                            <div className="h-48 bg-gray-200 relative overflow-hidden">
                                {/* Placeholder for Staff Image - In real app, map imageKey to actual path */}
                                <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-300">
                                    <User className="w-24 h-24" />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                                    <h3 className="text-white font-bold text-lg leading-tight">{staff.name}</h3>
                                    <p className="text-white/80 text-xs mt-1">{staff.designation}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Modal */}
                {isModalOpen && selectedStaff && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                            <div className="relative h-48 bg-gray-800">
                                <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                                    {/* Placeholder */}
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                        <User className="w-24 h-24 text-gray-400" />
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full backdrop-blur-md transition-colors"
                                >
                                    <XCircle className="w-8 h-8" />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent pt-12">
                                    <h2 className="text-2xl font-bold text-white">{selectedStaff.name}</h2>
                                    <div className="flex items-center mt-1">
                                        <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded mr-2">
                                            {selectedStaff.designation}
                                        </span>
                                        <span className="text-gray-300 text-sm">{selectedStaff.department}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">

                                {/* Subjects */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Subjects Handled</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedStaff.subjectsHandled.map((subject, i) => (
                                            <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700">
                                                <BookOpen className="w-3 h-3 mr-1.5" />
                                                {subject}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Roles */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Course Coordinator</span>
                                        <span className="text-sm font-medium text-gray-800">{selectedStaff.courseCoordinator || 'N/A'}</span>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Faculty In-Charge</span>
                                        <span className="text-sm font-medium text-gray-800">{selectedStaff.facultyInCharge || 'Not Assigned'}</span>
                                    </div>
                                </div>

                                {/* Contact */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Contact Information</h4>
                                    <div className="space-y-3">
                                        <a href={`mailto:${selectedStaff.email}`} className="flex items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-indigo-100 transition-colors group">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700">{selectedStaff.email}</span>
                                        </a>
                                        <a href={`tel:${selectedStaff.contact}`} className="flex items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-green-100 transition-colors group">
                                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                                <Phone className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">{selectedStaff.contact}</span>
                                        </a>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};

export default StudentStaffDirectory;

