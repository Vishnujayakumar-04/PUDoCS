import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Dimensions, Modal, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView, PinchGestureHandler, PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    useAnimatedGestureHandler,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '../../components/Header';
import colors from '../../styles/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ZoomableImage = ({ imageSource, onClose }) => {
    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const focalX = useSharedValue(0);
    const focalY = useSharedValue(0);

    const pinchHandler = useAnimatedGestureHandler({
        onStart: (_, ctx) => {
            ctx.startScale = scale.value;
        },
        onActive: (event, ctx) => {
            scale.value = Math.max(1, Math.min(ctx.startScale * event.scale, 4));
        },
        onEnd: () => {
            if (scale.value < 1) {
                scale.value = withTiming(1);
                translateX.value = withTiming(0);
                translateY.value = withTiming(0);
            }
        },
    });

    const panHandler = useAnimatedGestureHandler({
        onStart: (_, ctx) => {
            ctx.startX = translateX.value;
            ctx.startY = translateY.value;
        },
        onActive: (event, ctx) => {
            if (scale.value > 1) {
                translateX.value = ctx.startX + event.translationX;
                translateY.value = ctx.startY + event.translationY;
            }
        },
        onEnd: () => {
            // Keep pan within bounds if needed
        },
    });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: scale.value },
            ],
        };
    });

    const handleClose = () => {
        scale.value = withTiming(1);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        setTimeout(() => {
            onClose();
        }, 200);
    };

    return (
        <Modal
            visible={true}
            transparent={true}
            animationType="fade"
            onRequestClose={handleClose}
        >
            <StatusBar barStyle="light-content" />
            <View style={styles.modalContainer}>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleClose}
                    activeOpacity={0.7}
                >
                    <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>

                <GestureHandlerRootView style={styles.gestureContainer}>
                    <PanGestureHandler
                        onGestureEvent={panHandler}
                        minPointers={1}
                        maxPointers={1}
                        avgTouches
                    >
                        <Animated.View style={styles.panContainer}>
                            <PinchGestureHandler
                                onGestureEvent={pinchHandler}
                                simultaneousHandlers={panHandler}
                            >
                                <Animated.View style={[styles.zoomContainer, animatedStyle]}>
                                    <Image
                                        source={imageSource}
                                        style={styles.zoomImage}
                                        resizeMode="contain"
                                    />
                                </Animated.View>
                            </PinchGestureHandler>
                        </Animated.View>
                    </PanGestureHandler>
                </GestureHandlerRootView>

                <View style={styles.zoomHint}>
                    <Text style={styles.zoomHintText}>Pinch to zoom • Drag to pan • Tap ✕ to close</Text>
                </View>
            </View>
        </Modal>
    );
};

const CalendarImageItem = ({ imageSource, index, total, onImagePress }) => {
    const imageWidth = SCREEN_WIDTH - 16;
    // Image.resolveAssetSource is synchronous, not async
    let aspectRatio = 1.4; // Default aspect ratio for calendar pages
    try {
        const resolvedSource = Image.resolveAssetSource(imageSource);
        if (resolvedSource && resolvedSource.width && resolvedSource.height) {
            aspectRatio = resolvedSource.height / resolvedSource.width;
        }
    } catch (error) {
        console.log('Error resolving image source:', error);
    }
    const imageHeight = imageWidth * aspectRatio;

    return (
        <TouchableOpacity
            style={styles.imageContainer}
            onPress={() => onImagePress(imageSource, index)}
            activeOpacity={0.9}
        >
            <Image
                source={imageSource}
                style={[styles.image, { height: imageHeight }]}
                resizeMode="contain"
            />
            <Text style={styles.pageNumber}>Page {index + 1} of {total} • Tap to zoom</Text>
        </TouchableOpacity>
    );
};

// Calendar images array (30 pages: 0001-0030)
// Note: React Native require() doesn't support template literals, so all images must be explicitly listed
const CALENDAR_IMAGES = [
    require('../../assets/Calender/Academic-Calendar-2025-26-for-all-UG-PG-Programs-affiliated-colleges-22082025_page-0001.jpg'),
    require('../../assets/Calender/Academic-Calendar-2025-26-for-all-UG-PG-Programs-affiliated-colleges-22082025_page-0002.jpg'),
    require('../../assets/Calender/Academic-Calendar-2025-26-for-all-UG-PG-Programs-affiliated-colleges-22082025_page-0003.jpg'),
    require('../../assets/Calender/Academic-Calendar-2025-26-for-all-UG-PG-Programs-affiliated-colleges-22082025_page-0004.jpg'),
    require('../../assets/Calender/Academic-Calendar-2025-26-for-all-UG-PG-Programs-affiliated-colleges-22082025_page-0005.jpg'),
    require('../../assets/Calender/Academic-Calendar-2025-26-for-all-UG-PG-Programs-affiliated-colleges-22082025_page-0006.jpg'),
    require('../../assets/Calender/Academic-Calendar-2025-26-for-all-UG-PG-Programs-affiliated-colleges-22082025_page-0007.jpg'),
    require('../../assets/Calender/Academic-Calendar-2025-26-for-all-UG-PG-Programs-affiliated-colleges-22082025_page-0008.jpg'),
    require('../../assets/Calender/Academic-Calendar-2025-26-for-all-UG-PG-Programs-affiliated-colleges-22082025_page-0009.jpg'),
    require('../../assets/Calender/Academic-Calendar-2025-26-for-all-UG-PG-Programs-affiliated-colleges-22082025_page-0010.jpg'),
    require('../../assets/Calender/Academic-Calendar-2025-26-for-all-UG-PG-Programs-affiliated-colleges-22082025_page-0011.jpg'),
    require('../../assets/Calender/Academic-Calendar-2025-26-for-all-UG-PG-Programs-affiliated-colleges-22082025_page-0012.jpg'),
    require('../../assets/Calender/Academic-Calendar-2025-26-for-all-UG-PG-Programs-affiliated-colleges-22082025_page-0013.jpg'),
    require('../../assets/Calender/Academic-Calendar-2025-26-for-all-UG-PG-Programs-affiliated-colleges-22082025_page-0014.jpg'),
    require('../../assets/Calender/Academic-Calendar-2025-26-for-all-UG-PG-Programs-affiliated-colleges-22082025_page-0015.jpg'),
    require('../../assets/Calender/Academic-Calendar-2025-26-for-all-UG-PG-Programs-affiliated-colleges-22082025_page-0016.jpg'),
    require('../../assets/Calender/Academic-Calendar-2025-26-for-all-UG-PG-Programs-affiliated-colleges-22082025_page-0017.jpg'),
    require('../../assets/Calender/Academic-Calendar-2025-26-for-all-UG-PG-Programs-affiliated-colleges-22082025_page-0018.jpg'),
    require('../../assets/Calender/Academic-Calendar-2025-26-for-all-UG-PG-Programs-affiliated-colleges-22082025_page-0019.jpg'),
    require('../../assets/Calender/Academic-Calendar-2025-26-for-all-UG-PG-Programs-affiliated-colleges-22082025_page-0020.jpg'),
    require('../../assets/Calender/Academic-Calendar-2025-26-for-all-UG-PG-Programs-affiliated-colleges-22082025_page-0021.jpg'),
    require('../../assets/Calender/Academic-Calendar-2025-26-for-all-UG-PG-Programs-affiliated-colleges-22082025_page-0022.jpg'),
    require('../../assets/Calender/Academic-Calendar-2025-26-for-all-UG-PG-Programs-affiliated-colleges-22082025_page-0023.jpg'),
    require('../../assets/Calender/Academic-Calendar-2025-26-for-all-UG-PG-Programs-affiliated-colleges-22082025_page-0024.jpg'),
    require('../../assets/Calender/Academic-Calendar-2025-26-for-all-UG-PG-Programs-affiliated-colleges-22082025_page-0025.jpg'),
    require('../../assets/Calender/Academic-Calendar-2025-26-for-all-UG-PG-Programs-affiliated-colleges-22082025_page-0026.jpg'),
    require('../../assets/Calender/Academic-Calendar-2025-26-for-all-UG-PG-Programs-affiliated-colleges-22082025_page-0027.jpg'),
    require('../../assets/Calender/Academic-Calendar-2025-26-for-all-UG-PG-Programs-affiliated-colleges-22082025_page-0028.jpg'),
    require('../../assets/Calender/Academic-Calendar-2025-26-for-all-UG-PG-Programs-affiliated-colleges-22082025_page-0029.jpg'),
    require('../../assets/Calender/Academic-Calendar-2025-26-for-all-UG-PG-Programs-affiliated-colleges-22082025_page-0030.jpg'),
];

const StudentCalendar = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(null);

    // Use the pre-defined calendar images array
    const calendarImages = CALENDAR_IMAGES;

    const handleImagePress = (imageSource, index) => {
        setSelectedImage(imageSource);
        setSelectedIndex(index);
    };

    const handleCloseZoom = () => {
        setSelectedImage(null);
        setSelectedIndex(null);
    };

    const handleDownloadPDF = async () => {
        try {
            const [pdfAsset] = await Asset.loadAsync(require('../../assets/Calender/Academic-Calendar-2025-26-for-all-UG-PG-Programs-affiliated-colleges-22082025.pdf'));
            const pdfUri = pdfAsset.localUri || pdfAsset.uri;

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(pdfUri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Download Academic Calendar'
                });
            } else {
                alert('Sharing is not available on this device');
            }
        } catch (error) {
            console.error('Error sharing PDF:', error);
            alert('Failed to download PDF');
        }
    };

    // Calculate item layout for FlatList optimization
    const getItemLayout = (data, index) => {
        const imageWidth = SCREEN_WIDTH - 16;
        const aspectRatio = 1.4; // Default aspect ratio
        const imageHeight = imageWidth * aspectRatio;
        const itemHeight = imageHeight + 40; // Image height + padding + text
        return {
            length: itemHeight,
            offset: itemHeight * index,
            index,
        };
    };

    // Render item for FlatList with lazy loading
    const renderItem = ({ item, index }) => (
        <CalendarImageItem
            imageSource={item}
            index={index}
            total={calendarImages.length}
            onImagePress={handleImagePress}
        />
    );

    // Render footer with download button
    const renderFooter = () => (
        <View>
            <View style={styles.downloadSection}>
                <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadPDF}>
                    <MaterialCommunityIcons name="file-pdf-box" size={24} color={colors.white} />
                    <Text style={styles.downloadButtonText}>Download Original PDF</Text>
                </TouchableOpacity>
            </View>
            <View style={{ height: 40 }} />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Academic Calendar" subtitle="2025-26 Academic Year" />
            <FlatList
                data={calendarImages}
                renderItem={renderItem}
                keyExtractor={(item, index) => `calendar-page-${index}`}
                getItemLayout={getItemLayout}
                ListFooterComponent={renderFooter}
                initialNumToRender={3}
                maxToRenderPerBatch={5}
                windowSize={5}
                removeClippedSubviews={true}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.scrollContent}
            />

            {selectedImage && (
                <ZoomableImage
                    imageSource={selectedImage}
                    onClose={handleCloseZoom}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: 0,
    },
    imageContainer: {
        width: SCREEN_WIDTH,
        backgroundColor: colors.white,
        marginBottom: 2,
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    image: {
        width: SCREEN_WIDTH - 16, // Full width minus small padding
        height: undefined, // Let height be determined by image aspect ratio
        backgroundColor: colors.gray50,
    },
    pageNumber: {
        fontSize: 11,
        color: colors.textSecondary,
        marginTop: 4,
        marginBottom: 2,
        fontWeight: '500',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1000,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        color: colors.white,
        fontSize: 24,
        fontWeight: 'bold',
    },
    gestureContainer: {
        flex: 1,
        width: SCREEN_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
    },
    panContainer: {
        flex: 1,
        width: SCREEN_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
    },
    zoomContainer: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    zoomImage: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    zoomHint: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    zoomHintText: {
        color: colors.white,
        fontSize: 12,
        textAlign: 'center',
    },
    downloadSection: {
        padding: 20,
        alignItems: 'center',
    },
    downloadButton: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    downloadButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});

export default StudentCalendar;
