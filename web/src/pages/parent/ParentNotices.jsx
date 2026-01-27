import React from 'react';
import Sidebar from '../../components/Sidebar';

const ParentNotices = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar role="Parent" />
            <main className="flex-1 ml-0 lg:ml-64 p-8">
                <h1 className="text-2xl font-bold mb-4">Notices & Announcements</h1>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <p className="text-gray-500">Important notices will be displayed here.</p>
                </div>
            </main>
        </div>
    );
};

export default ParentNotices;
