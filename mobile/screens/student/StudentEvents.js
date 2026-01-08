import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Animated, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import { staffService } from '../../services/staffService';
import { officeService } from '../../services/officeService';
import colors from '../../styles/colors';

const { width } = Dimensions.get('window');

const StudentEvents = () => {
    const { role } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        loadEvents();
    }, [role]);

    const loadEvents = async () => {
        try {
            let data = [];
            // Use appropriate service based on user role
            if (role === 'Staff') {
                data = await staffService.getEvents();
            } else if (role === 'Office') {
                data = await officeService.getEvents();
            } else {
                // Default to student service
                data = await studentService.getEvents();
            }
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

    const handleRegistration = async (event) => {
        if (event.registrationLink) {
            try {
                const supported = await Linking.canOpenURL(event.registrationLink);
                if (supported) {
                    await Linking.openURL(event.registrationLink);
                } else {
                    Alert.alert('Error', 'Cannot open registration link');
                }
            } catch (error) {
                Alert.alert('Error', 'Failed to open registration link');
            }
        } else if (event.contact || event.email) {
            // Show contact info if no registration link
            const contactInfo = [];
            if (event.contact) contactInfo.push(`Phone: ${event.contact}`);
            if (event.email) contactInfo.push(`Email: ${event.email}`);
            Alert.alert('Contact Information', contactInfo.join('\n'));
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
                                
                                {event.theme && (
                                    <View style={styles.themeContainer}>
                                        <Text style={styles.themeLabel}>Theme:</Text>
                                        <Text style={styles.themeText}>{event.theme}</Text>
                                    </View>
                                )}
                                
                                {event.organizedBy && (
                                    <View style={styles.organizedByContainer}>
                                        <Text style={styles.organizedByLabel}>Organized By:</Text>
                                        <Text style={styles.organizedByText}>{event.organizedBy}</Text>
                                    </View>
                                )}

                                {(event.registrationLink || event.registrationRequired) ? (
                                    <TouchableOpacity 
                                        style={styles.registerBtn}
                                        onPress={() => handleRegistration(event)}
                                    >
                                        <Text style={styles.registerBtnText}>
                                            {event.registrationLink ? 'Register Now' : 'Contact for Registration'}
                                        </Text>
                                        <MaterialCommunityIcons name="link" size={18} color={colors.primary} />
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity style={styles.registerBtn}>
                                        <Text style={styles.registerBtnText}>Interesting</Text>
                                        <MaterialCommunityIcons name="star-outline" size={18} color={colors.primary} />
                                    </TouchableOpacity>
                                )}
                                
                                {(event.contact || event.email) && (
                                    <View style={styles.contactContainer}>
                                        {event.contact && (
                                            <View style={styles.contactItem}>
                                                <MaterialCommunityIcons name="phone" size={14} color={colors.textSecondary} />
                                                <Text style={styles.contactText}>{event.contact}</Text>
                                            </View>
                                        )}
                                        {event.email && (
                                            <View style={styles.contactItem}>
                                                <MaterialCommunityIcons name="email" size={14} color={colors.textSecondary} />
                                                <Text style={styles.contactText}>{event.email}</Text>
                                            </View>
                                        )}
                                    </View>
                                )}
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
        paddingBottom: 100, // Extra padding for tab bar
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
    themeContainer: {
        marginTop: 12,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: colors.gray100,
        borderRadius: 8,
    },
    themeLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: 4,
    },
    themeText: {
        fontSize: 14,
        fontStyle: 'italic',
        color: colors.primary,
        fontWeight: '500',
    },
    organizedByContainer: {
        marginTop: 10,
    },
    organizedByLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: 4,
    },
    organizedByText: {
        fontSize: 13,
        color: colors.textSecondary,
        lineHeight: 18,
    },
    contactContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.gray200,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    contactText: {
        fontSize: 13,
        color: colors.textSecondary,
        marginLeft: 6,
    },
});

export default StudentEvents;
