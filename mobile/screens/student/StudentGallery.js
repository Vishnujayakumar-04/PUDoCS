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
import PremiumHeader from '../../components/PremiumHeader';
import PremiumCard from '../../components/PremiumCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';
import { moderateScale, getFontSize, getPadding, getMargin } from '../../utils/responsive';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const StudentGallery = ({ navigation }) => {
    const [albums, setAlbums] = useState([]);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [imageAnimations] = useState([]);

    useEffect(() => {
        loadAlbums();
    }, []);

    const loadAlbums = async () => {
        setLoading(true);
        try {
            const albumsData = await galleryService.getAlbums();
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
            setSelectedImageIndex(selectedImageIndex + 1);
        }
    };

    const prevImage = () => {
        if (selectedImageIndex > 0) {
            setSelectedImageIndex(selectedImageIndex - 1);
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
                                    data={selectedAlbum.images}
                                    horizontal
                                    pagingEnabled
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={(item, index) => index.toString()}
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
                                    renderItem={({ item, index }) => (
                                        <View style={styles.imageContainer}>
                                            <Animated.Image
                                                source={{ uri: item.url }}
                                                style={styles.fullImage}
                                                resizeMode="contain"
                                            />
                                        </View>
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

