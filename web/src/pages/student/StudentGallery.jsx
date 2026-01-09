import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import { galleryService } from '../../services/galleryService';
import {
    Image as ImageIcon,
    X,
    ChevronLeft,
    ChevronRight,
    Maximize2
} from 'lucide-react';

const StudentGallery = () => {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    useEffect(() => {
        loadAlbums();
    }, []);

    const loadAlbums = async () => {
        setLoading(true);
        try {
            const data = await galleryService.getAlbums();
            setAlbums(data || []);
        } catch (error) {
            console.error('Error loading albums:', error);
        } finally {
            setLoading(false);
        }
    };

    const openAlbum = (album) => {
        // Just simulating the "Open Album" -> "View Viewer" flow. 
        // In web, we can perhaps show grid of photos first.
        // For now, let's just open the viewer for the first image of the album directly or show detail view.
        // Let's implement a detail view state if we want to mimic mobile "Open Album"
        // But for simplicity, let's just open the viewer directly on click or have a "View" button.
        // Better: Click album -> Open viewer for first image.
        setSelectedAlbum(album);
        setSelectedImageIndex(0);
        setIsViewerOpen(true);
    };

    const handleNext = (e) => {
        e.stopPropagation();
        if (selectedAlbum && selectedImageIndex < selectedAlbum.images.length - 1) {
            setSelectedImageIndex(prev => prev + 1);
        }
    };

    const handlePrev = (e) => {
        e.stopPropagation();
        if (selectedImageIndex > 0) {
            setSelectedImageIndex(prev => prev - 1);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar role="Student" />

            <main className="flex-1 ml-0 lg:ml-64 p-4 sm:p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <ImageIcon className="mr-3 text-pink-600" />
                        Gallery
                    </h1>
                    <p className="text-gray-500 mt-1">Campus Life & Events</p>
                </header>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                    </div>
                ) : albums.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                        <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-700">No Albums Yet</h3>
                        <p className="text-gray-500">Check back later for photos.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {albums.map((album) => (
                            <Card
                                key={album.id}
                                className="group cursor-pointer hover:shadow-xl transition-all overflow-hidden p-0 border border-gray-100"
                                onClick={() => openAlbum(album)}
                            >
                                <div className="aspect-video bg-gray-200 relative overflow-hidden">
                                    {album.images && album.images.length > 0 ? (
                                        <img
                                            src={album.images[0].url}
                                            alt={album.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <ImageIcon className="w-12 h-12" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                                        <h3 className="text-white font-bold text-xl drop-shadow-sm">{album.title}</h3>
                                        <p className="text-white/80 text-sm mt-1 flex items-center">
                                            {album.images?.length || 0} Photos <Maximize2 className="w-3 h-3 ml-2" />
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Viewer Modal */}
                {isViewerOpen && selectedAlbum && (
                    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center backdrop-blur-sm">

                        {/* Close Button */}
                        <button
                            onClick={() => setIsViewerOpen(false)}
                            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[60]"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        {/* Main Image Area */}
                        <div className="relative w-full h-full flex items-center justify-center px-4 md:px-20">

                            {/* Navigation */}
                            <button
                                onClick={handlePrev}
                                disabled={selectedImageIndex === 0}
                                className={`absolute left-4 md:left-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all ${selectedImageIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </button>

                            <div className="max-w-5xl max-h-[80vh] flex flex-col items-center">
                                <img
                                    src={selectedAlbum.images[selectedImageIndex].url}
                                    alt="Gallery View"
                                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
                                />
                                <div className="text-center mt-6 max-w-2xl px-4">
                                    <h3 className="text-white font-bold text-lg mb-2">{selectedAlbum.title}</h3>
                                    <p className="text-gray-400 text-sm line-clamp-3">
                                        {selectedAlbum.description}
                                    </p>
                                    <div className="text-gray-500 text-xs mt-3">
                                        Image {selectedImageIndex + 1} of {selectedAlbum.images.length}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleNext}
                                disabled={selectedImageIndex === selectedAlbum.images.length - 1}
                                className={`absolute right-4 md:right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all ${selectedImageIndex === selectedAlbum.images.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                            >
                                <ChevronRight className="w-8 h-8" />
                            </button>

                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};

export default StudentGallery;
