import React, { useState } from 'react';
import {
    Image as ImageIcon,
    Search,
    Grid,
    List,
    Maximize2,
    Camera
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';

const StaffGallery = () => {
    const { role: authRole } = useAuth();
    const [viewMode, setViewMode] = useState('grid');

    const albums = [
        { id: '1', title: 'Department Tour 2024', count: 12, date: 'Oct 2024', cover: 'https://images.unsplash.com/photo-1523050853064-95ef14114757?auto=format&fit=crop&q=80&w=400' },
        { id: '2', title: 'Tech Fest 24', count: 45, date: 'Dec 2024', cover: 'https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?auto=format&fit=crop&q=80&w=400' },
        { id: '3', title: 'Academic Conference', count: 28, date: 'Nov 2024', cover: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&q=80&w=400' },
    ];

    return (
        <div className="relative min-h-screen bg-gray-50 overflow-hidden flex">
            {/* Background Animations */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[100px] animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-pink-200/30 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-indigo-200/30 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
            </div>

            <Sidebar role={authRole || 'Staff'} />

            <div className="flex-1 flex flex-col relative z-10 lg:ml-64 transition-all duration-300">
                <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center">
                                <ImageIcon className="mr-3 text-purple-600" />
                                Memory Vault
                            </h1>
                            <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest italic">Visual Media Log</p>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Highlights */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {albums.map((album) => (
                                <div key={album.id} className="relative group cursor-pointer overflow-hidden rounded-3xl aspect-[16/10] bg-gray-900 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                                    <img
                                        src={album.cover}
                                        alt={album.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
                                    <div className="absolute inset-x-0 bottom-0 p-6">
                                        <h3 className="text-white font-black text-xl leading-tight mb-1 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">{album.title}</h3>
                                        <div className="flex items-center text-purple-200 text-[10px] font-bold uppercase tracking-widest translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-75">
                                            <span className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 mr-2">{album.count} Photos</span>
                                            <span>{album.date}</span>
                                        </div>
                                    </div>
                                    <div className="absolute top-4 right-4 p-2.5 bg-white/20 backdrop-blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:text-purple-600 border border-white/20 text-white">
                                        <Maximize2 className="w-5 h-5" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Activity Section */}
                        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-white/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>

                            <div className="flex justify-between items-center mb-8 relative z-10">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 tracking-tight">RECENT UPLOADS</h2>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Latest captures specific to your department</p>
                                </div>
                                <div className="flex bg-white/50 p-1.5 rounded-xl border border-gray-100 backdrop-blur-sm">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        <Grid className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 relative z-10">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                                    <div key={i} className="aspect-square bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 hover:border-purple-400 hover:bg-purple-50 transition-all group cursor-pointer hover:shadow-lg hover:-translate-y-1 duration-300">
                                        <div className="p-3 bg-gray-50 text-gray-300 rounded-full mb-3 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                                            <Camera className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest group-hover:text-purple-600 transition-colors">Media {i}</span>
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
