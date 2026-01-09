import React, { useState } from 'react';
import {
    Image as ImageIcon,
    Plus,
    Search,
    Grid,
    List,
    Download,
    Share2,
    Trash2,
    X,
    Maximize2,
    Filter,
    Camera
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';

const StaffGallery = () => {
    const { role: authRole } = useAuth();
    const [viewMode, setViewMode] = useState('grid');
    const [selectedImage, setSelectedImage] = useState(null);

    const albums = [
        { id: '1', title: 'Department Tour 2024', count: 12, date: 'Oct 2024', cover: 'https://images.unsplash.com/photo-1523050853064-95ef14114757?auto=format&fit=crop&q=80&w=400' },
        { id: '2', title: 'Tech Fest 24', count: 45, date: 'Dec 2024', cover: 'https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?auto=format&fit=crop&q=80&w=400' },
        { id: '3', title: 'Academic Conference', count: 28, date: 'Nov 2024', cover: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&q=80&w=400' },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar role={authRole || 'Staff'} />

            <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
                <header className="bg-white shadow-sm z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center">
                                <ImageIcon className="mr-3 text-purple-600" />
                                Memory Vault
                            </h1>
                            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest italic">Visual Media Log</p>
                        </div>
                        <button className="flex items-center px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-purple-100">
                            <Plus className="w-4 h-4 mr-2" />
                            Upload Media
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto space-y-8">

                        {/* Highlights */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {albums.map((album) => (
                                <div key={album.id} className="relative group cursor-pointer overflow-hidden rounded-3xl aspect-[16/10] bg-gray-900">
                                    <img
                                        src={album.cover}
                                        alt={album.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-90"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-gray-900 via-transparent to-transparent">
                                        <h3 className="text-white font-black text-xl leading-tight">{album.title}</h3>
                                        <p className="text-purple-300 text-[10px] font-bold uppercase tracking-widest mt-1">{album.count} Photos • {album.date}</p>
                                    </div>
                                    <div className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Maximize2 className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Activity Section */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-black text-gray-900 tracking-tight">RECENT UPLOADS</h2>
                                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400'}`}
                                    >
                                        <Grid className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400'}`}
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                                    <div key={i} className="aspect-square bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 hover:border-purple-300 hover:bg-purple-50 transition-all group cursor-pointer">
                                        <Camera className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Media {i}</span>
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

export default StaffGallery;
