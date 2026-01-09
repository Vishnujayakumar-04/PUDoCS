const STORAGE_KEY = 'gallery_albums';

export const galleryService = {
    /**
     * Get all gallery albums - automatically seeds Alumni Meet gallery if missing
     */
    getAlbums: async () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            let albums = data ? JSON.parse(data) : [];

            // Check if Alumni Meet gallery already exists
            const hasAlumniMeet = albums.some(
                (album) => album.id === 'alumni-meet-2025' || album.title === 'Alumni Meet 2025'
            );

            if (!hasAlumniMeet) {
                const images = Array.from({ length: 12 }).map((_, i) => ({
                    url: `https://picsum.photos/800/600?random=${i + 1}`,
                    name: `alumni_meet_${i + 1}.jpg`,
                    order: i,
                }));

                const newAlbum = {
                    id: `alumni-meet-2025`,
                    title: "Alumni Meet 2025",
                    description: `The Department of Computer Science, Pondicherry University organized Footprints Alumni Meet 2025 on 26th January 2025 at the Convention Cum Cultural Complex.\n\n(Note: This is a web demo using placeholder images as access to mobile assets is restricted.)`,
                    images,
                    postedBy: "Office",
                    createdAt: new Date('2025-01-26').toISOString(),
                    updatedAt: new Date('2025-01-26').toISOString(),
                };
                albums = [newAlbum, ...albums];
                localStorage.setItem(STORAGE_KEY, JSON.stringify(albums));
            }

            return albums;
        } catch (error) {
            console.error('Error getting gallery albums:', error);
            return [];
        }
    },

    /**
     * Get a specific gallery album by ID
     */
    getAlbum: async (albumId) => {
        try {
            const albums = await galleryService.getAlbums();
            return albums.find(a => a.id === albumId) || null;
        } catch (error) {
            console.error('Error getting gallery album:', error);
            return null;
        }
    }
};
