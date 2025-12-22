import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Card from '../../components/Card';
import colors from '../../styles/colors';

const { width } = Dimensions.get('window');

const StudentEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const data = await studentService.getEvents();
            setEvents(data || []);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }).start();
        } catch (error) {
            console.error('Error loading events:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateValue) => {
        if (!dateValue) return '';
        try {
            if (dateValue.toDate) return dateValue.toDate().toLocaleDateString();
            return new Date(dateValue).toLocaleDateString();
        } catch (e) {
            return dateValue.toString();
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <View style={styles.container}>
            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.header}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Events</Text>
                        <Text style={styles.headerSubtitle}>Discover what's happening on campus</Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <Animated.ScrollView
                style={[styles.content, { opacity: fadeAnim }]}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {events.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="calendar-blank" size={60} color={colors.gray300} />
                        <Text style={styles.emptyText}>No upcoming events found</Text>
                    </View>
                ) : (
                    events.map((event, index) => (
                        <Card key={index} style={styles.eventCard}>
                            {event.image && (
                                <View style={styles.imageContainer}>
                                    <Image source={{ uri: event.image }} style={styles.eventImage} />
                                    {event.category && (
                                        <View style={styles.categoryBadge}>
                                            <Text style={styles.categoryText}>{event.category}</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                            <View style={styles.cardInfo}>
                                <Text style={styles.eventTitle}>{event.name || event.title}</Text>
                                <View style={styles.metaRow}>
                                    <View style={styles.metaItem}>
                                        <MaterialCommunityIcons name="calendar" size={16} color={colors.primary} />
                                        <Text style={styles.metaText}>{formatDate(event.date)}</Text>
                                    </View>
                                    {event.time && (
                                        <View style={styles.metaItem}>
                                            <MaterialCommunityIcons name="clock-outline" size={16} color={colors.primary} />
                                            <Text style={styles.metaText}>{event.time}</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.metaItem}>
                                    <MaterialCommunityIcons name="map-marker" size={16} color={colors.primary} />
                                    <Text style={styles.metaText}>{event.location}</Text>
                                </View>
                                {event.description && <Text style={styles.description}>{event.description}</Text>}

                                <TouchableOpacity style={styles.registerBtn}>
                                    <Text style={styles.registerBtnText}>Interesting</Text>
                                    <MaterialCommunityIcons name="star-outline" size={18} color={colors.primary} />
                                </TouchableOpacity>
                            </View>
                        </Card>
                    ))
                )}
            </Animated.ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingBottom: 25,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: colors.white,
    },
    headerSubtitle: {
        fontSize: 14,
        color: colors.white,
        opacity: 0.8,
        marginTop: 4,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginTop: 20,
        gap: 15,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    activeTab: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    activeTabText: {
        color: colors.white,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    eventCard: {
        padding: 0,
        overflow: 'hidden',
        marginBottom: 25,
        borderRadius: 20,
    },
    imageContainer: {
        width: '100%',
        height: 180,
    },
    eventImage: {
        width: '100%',
        height: '100%',
    },
    categoryBadge: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: colors.white,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        elevation: 5,
    },
    categoryText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.primary,
        textTransform: 'uppercase',
    },
    cardInfo: {
        padding: 16,
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 8,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    metaText: {
        fontSize: 13,
        color: colors.textSecondary,
        marginLeft: 6,
    },
    description: {
        fontSize: 14,
        color: colors.gray600,
        marginTop: 8,
        lineHeight: 20,
    },
    registerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.primary,
        gap: 8,
    },
    registerBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: colors.textSecondary,
        marginTop: 15,
    },
});

export default StudentEvents;
