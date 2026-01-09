import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Modal,
    Dimensions,
    Animated,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { galleryService } from '../../services/galleryService';

// Only use static requires from _component_ files, NOT from services!
const ALUMNI_MEET_IMAGES = [
    require('../../assets/Gallery/IMG_9554.jpg'),
    require('../../assets/Gallery/IMG_9555.jpg'),
    require('../../assets/Gallery/IMG_9562.jpg'),
    require('../../assets/Gallery/IMG_9569.jpg'),
    require('../../assets/Gallery/IMG_9621.jpg'),
    require('../../assets/Gallery/IMG_9655.jpg'),
    require('../../assets/Gallery/IMG_9659.jpg'),
    require('../../assets/Gallery/IMG_9663.jpg'),
    require('../../assets/Gallery/IMG_9666.jpg'),
    require('../../assets/Gallery/IMG_9675.jpg'),
    require('../../assets/Gallery/IMG_9684.jpg'),
    require('../../assets/Gallery/IMG_9686.jpg'),
    require('../../assets/Gallery/IMG_9691.jpg'),
    require('../../assets/Gallery/IMG_9694.jpg'),
    require('../../assets/Gallery/IMG_9697.jpg'),
    require('../../assets/Gallery/IMG_9699.jpg'),
    require('../../assets/Gallery/IMG_9703.jpg'),
    require('../../assets/Gallery/IMG_9704.jpg'),
    require('../../assets/Gallery/IMG_9705.jpg'),
    require('../../assets/Gallery/IMG_9706.jpg'),
    require('../../assets/Gallery/IMG_9707.jpg'),
    require('../../assets/Gallery/IMG_9708.jpg'),
    require('../../assets/Gallery/IMG_9711.jpg'),
    require('../../assets/Gallery/IMG_9717.jpg'),
    require('../../assets/Gallery/IMG_9719.jpg'),
    require('../../assets/Gallery/IMG_9721.jpg'),
    require('../../assets/Gallery/IMG_9723.jpg'),
    require('../../assets/Gallery/IMG_9726.jpg'),
    require('../../assets/Gallery/IMG_9728.jpg'),
    require('../../assets/Gallery/IMG_9730.jpg'),
    require('../../assets/Gallery/Artboard 2.png'),
    require('../../assets/Gallery/Invitation.png'),
    require('../../assets/Gallery/4.jpg'),
    require('../../assets/Gallery/5.jpg'),
    require('../../assets/Gallery/6.jpg'),
    require('../../assets/Gallery/IMG_0036.jpg'),
    require('../../assets/Gallery/IMG_0038.jpg'),
    require('../../assets/Gallery/IMG_0056.jpg'),
    require('../../assets/Gallery/IMG_0066.jpg'),
    require('../../assets/Gallery/IMG_9517.jpg'),
    require('../../assets/Gallery/IMG_9546.jpg'),
];
import PremiumHeader from '../../components/PremiumHeader';
import PremiumCard from '../../components/PremiumCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';
import { moderateScale, getFontSize, getPadding, getMargin } from '../../utils/responsive';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Image Item Component with fade animation
const ImageItem = ({ item, index, isActive }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, [isActive]);

    return (
        <View style={styles.imageContainer}>
            <Animated.Image
                source={{ uri: item.url }}
                style={[
                    styles.fullImage,
                    { opacity: fadeAnim }
                ]}
                resizeMode="contain"
            />
        </View>
    );
};

const StudentGallery = ({ navigation }) => {
    const [albums, setAlbums] = useState([]);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const flatListRef = useRef(null);

    useEffect(() => {
        loadAlbums();
    }, []);

    const loadAlbums = async () => {
        setLoading(true);
        try {
            let albumsData = await galleryService.getAlbums();
            // Only seed album if not already there
            const hasAlumniMeet = albumsData.some(album => album.title === "Alumni Meet 2025");
            if (!hasAlumniMeet) {
                const images = ALUMNI_MEET_IMAGES.map((img, i) => ({
                    url: Image.resolveAssetSource(img).uri,
                    name: `alumni_meet_${i + 1}.jpg`,
                    order: i,
                }));
                const newAlbum = {
                    id: `alumni-meet-2025`,
                    title: "Alumni Meet 2025",
                    description: `The Department of Computer Science, Pondicherry University organized Footprints Alumni Meet 2025 on 26th January 2025 at the Convention Cum Cultural Complex. The event brought together alumni, faculty members, and current students to reconnect, share experiences, and strengthen industry–academia relationships.\n\nThe program included University Anthem, Welcome Address, Special Address, Honouring of the Guests, Presidential Address, Student Achievement Awards, Alumni Experience Sharing, Cultural Performances, Games, Vote of Thanks, and concluded with National Anthem followed by Lunch & Networking.\n\nThis gallery features key moments from the event including stage sessions, guest interactions, felicitation, award distribution, cultural events, group photographs, and informal networking moments.`,
                    images,
                    postedBy: "Office",
                    createdAt: new Date('2025-01-26').toISOString(),
                    updatedAt: new Date('2025-01-26').toISOString(),
                };
                albumsData = [newAlbum, ...albumsData];
                await AsyncStorage.setItem('gallery_albums', JSON.stringify(albumsData));
            }
            setAlbums(albumsData);
        } catch (error) {
            console.error('Error loading albums:', error);
        } finally {
            setLoading(false);
        }
    };

    const openAlbum = (album) => {
        setSelectedAlbum(album);
        setSelectedImageIndex(0);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedAlbum(null);
        setSelectedImageIndex(0);
    };

    const nextImage = () => {
        if (selectedAlbum && selectedImageIndex < selectedAlbum.images.length - 1) {
            const nextIndex = selectedImageIndex + 1;
            setSelectedImageIndex(nextIndex);
            // Scroll to the next image
            setTimeout(() => {
                if (flatListRef.current) {
                    flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
                }
            }, 100);
        }
    };

    const prevImage = () => {
        if (selectedImageIndex > 0) {
            const prevIndex = selectedImageIndex - 1;
            setSelectedImageIndex(prevIndex);
            // Scroll to the previous image
            setTimeout(() => {
                if (flatListRef.current) {
                    flatListRef.current.scrollToIndex({ index: prevIndex, animated: true });
                }
            }, 100);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.header}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.white} />
                        </TouchableOpacity>
                        <View style={styles.titleContainer}>
                            <Text style={styles.headerTitle}>Gallery</Text>
                        </View>
                        <View style={styles.headerRight} />
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {albums.length === 0 ? (
                    <PremiumCard style={styles.emptyCard}>
                        <MaterialCommunityIcons name="image-off-outline" size={64} color={colors.gray400} />
                        <Text style={styles.emptyText}>No gallery albums yet</Text>
                    </PremiumCard>
                ) : (
                    <View style={styles.gridContainer}>
                        {albums.map((album) => (
                            <TouchableOpacity
                                key={album.id}
                                style={styles.albumCard}
                                onPress={() => openAlbum(album)}
                                activeOpacity={0.8}
                            >
                                <PremiumCard style={styles.cardContent}>
                                    {album.images && album.images.length > 0 ? (
                                        <Image
                                            source={{ uri: album.images[0].url }}
                                            style={styles.albumThumbnail}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View style={[styles.albumThumbnail, styles.placeholderThumbnail]}>
                                            <MaterialCommunityIcons name="image-outline" size={48} color={colors.gray400} />
                                        </View>
                                    )}
                                    <View style={styles.albumOverlay}>
                                        <Text style={styles.albumTitle} numberOfLines={2}>
                                            {album.title}
                                        </Text>
                                        {album.images && (
                                            <Text style={styles.albumCount}>
                                                {album.images.length} {album.images.length === 1 ? 'photo' : 'photos'}
                                            </Text>
                                        )}
                                    </View>
                                </PremiumCard>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Full Screen Image Viewer Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeModal}
            >
                <View style={styles.modalContainer}>
                    <LinearGradient
                        colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.8)']}
                        style={styles.modalGradient}
                    >
                        <SafeAreaView style={styles.modalSafeArea}>
                            {/* Header */}
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={closeModal} style={styles.modalCloseButton}>
                                    <MaterialCommunityIcons name="close" size={28} color={colors.white} />
                                </TouchableOpacity>
                                <View style={styles.modalTitleContainer}>
                                    <Text style={styles.modalTitle} numberOfLines={1}>
                                        {selectedAlbum?.title}
                                    </Text>
                                    <Text style={styles.modalSubtitle}>
                                        {selectedImageIndex + 1} / {selectedAlbum?.images?.length || 0}
                                    </Text>
                                </View>
                                <View style={styles.modalHeaderRight} />
                            </View>

                            {/* Image Carousel */}
                            {selectedAlbum && selectedAlbum.images && (
                                <FlatList
                                    ref={flatListRef}
                                    data={selectedAlbum.images}
                                    horizontal
                                    pagingEnabled
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={(item, index) => `image-${index}`}
                                    initialScrollIndex={selectedImageIndex}
                                    getItemLayout={(data, index) => ({
                                        length: SCREEN_WIDTH,
                                        offset: SCREEN_WIDTH * index,
                                        index,
                                    })}
                                    onMomentumScrollEnd={(event) => {
                                        const index = Math.round(
                                            event.nativeEvent.contentOffset.x / SCREEN_WIDTH
                                        );
                                        setSelectedImageIndex(index);
                                    }}
                                    onScrollToIndexFailed={(info) => {
                                        // Handle scroll to index failure
                                        const wait = new Promise(resolve => setTimeout(resolve, 500));
                                        wait.then(() => {
                                            flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                                        });
                                    }}
                                    renderItem={({ item, index }) => (
                                        <ImageItem
                                            item={item}
                                            index={index}
                                            isActive={index === selectedImageIndex}
                                        />
                                    )}
                                />
                            )}

                            {/* Navigation Buttons */}
                            {selectedAlbum && selectedAlbum.images && selectedAlbum.images.length > 1 && (
                                <>
                                    {selectedImageIndex > 0 && (
                                        <TouchableOpacity
                                            style={[styles.navButton, styles.prevButton]}
                                            onPress={prevImage}
                                        >
                                            <MaterialCommunityIcons name="chevron-left" size={32} color={colors.white} />
                                        </TouchableOpacity>
                                    )}
                                    {selectedImageIndex < selectedAlbum.images.length - 1 && (
                                        <TouchableOpacity
                                            style={[styles.navButton, styles.nextButton]}
                                            onPress={nextImage}
                                        >
                                            <MaterialCommunityIcons name="chevron-right" size={32} color={colors.white} />
                                        </TouchableOpacity>
                                    )}
                                </>
                            )}

                            {/* Description */}
                            {selectedAlbum?.description && (
                                <View style={styles.descriptionContainer}>
                                    <ScrollView style={styles.descriptionScroll}>
                                        <Text style={styles.descriptionText}>
                                            {selectedAlbum.description}
                                        </Text>
                                    </ScrollView>
                                </View>
                            )}
                        </SafeAreaView>
                    </LinearGradient>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingBottom: getPadding(16),
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: getPadding(16),
        paddingTop: getPadding(8),
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: getFontSize(20),
        fontWeight: '700',
        color: colors.white,
    },
    headerRight: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: getPadding(12),
        justifyContent: 'space-between',
    },
    albumCard: {
        width: (SCREEN_WIDTH - 48) / 2,
        marginBottom: getMargin(16),
    },
    cardContent: {
        padding: 0,
        overflow: 'hidden',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    albumThumbnail: {
        width: '100%',
        height: 180,
        backgroundColor: colors.gray100,
    },
    placeholderThumbnail: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    albumOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: getPadding(12),
    },
    albumTitle: {
        fontSize: getFontSize(14),
        fontWeight: '700',
        color: colors.white,
        marginBottom: getMargin(4),
    },
    albumCount: {
        fontSize: getFontSize(12),
        color: colors.white + 'CC',
    },
    emptyCard: {
        margin: getMargin(32),
        padding: getPadding(48),
        alignItems: 'center',
    },
    emptyText: {
        fontSize: getFontSize(16),
        color: colors.textSecondary,
        marginTop: getMargin(16),
    },
    modalContainer: {
        flex: 1,
    },
    modalGradient: {
        flex: 1,
    },
    modalSafeArea: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: getPadding(16),
        paddingVertical: getPadding(12),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    modalCloseButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: getFontSize(18),
        fontWeight: '700',
        color: colors.white,
    },
    modalSubtitle: {
        fontSize: getFontSize(12),
        color: colors.white + 'CC',
        marginTop: getMargin(2),
    },
    modalHeaderRight: {
        width: 40,
    },
    imageContainer: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.7,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: SCREEN_WIDTH - 32,
        height: SCREEN_HEIGHT * 0.7,
    },
    navButton: {
        position: 'absolute',
        top: '50%',
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -25,
    },
    prevButton: {
        left: 16,
    },
    nextButton: {
        right: 16,
    },
    navButtonDisabled: {
        opacity: 0.3,
    },
    descriptionContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: getPadding(16),
        maxHeight: SCREEN_HEIGHT * 0.25,
    },
    descriptionScroll: {
        maxHeight: SCREEN_HEIGHT * 0.25,
    },
    descriptionText: {
        fontSize: getFontSize(14),
        color: colors.white,
        lineHeight: 22,
    },
});

export default StudentGallery;

