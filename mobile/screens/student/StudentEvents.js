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
import { moderateScale, verticalScale, getFontSize, getPadding, getMargin } from '../../utils/responsive';

const { width } = Dimensions.get('window');

const StudentEvents = ({ navigation }) => {
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
            if (role === 'Staff') {
                data = await staffService.getEvents();
            } else if (role === 'Office') {
                data = await officeService.getEvents();
            } else {
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
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}
                        >
                            <MaterialCommunityIcons name="arrow-left" size={moderateScale(24)} color={colors.white} />
                        </TouchableOpacity>
                        <View style={styles.titleContainer}>
                            <Text style={styles.headerTitle}>Events</Text>
                            <Text style={styles.headerSubtitle}>Discover what's happening on campus</Text>
                        </View>
                        <View style={styles.placeholderButton} />
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
                        <MaterialCommunityIcons name="calendar-blank" size={moderateScale(60)} color={colors.gray300} />
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
                                        <MaterialCommunityIcons name="calendar" size={moderateScale(16)} color={colors.primary} />
                                        <Text style={styles.metaText}>{formatDate(event.date)}</Text>
                                    </View>
                                    {event.time && (
                                        <View style={styles.metaItem}>
                                            <MaterialCommunityIcons name="clock-outline" size={moderateScale(16)} color={colors.primary} />
                                            <Text style={styles.metaText}>{event.time}</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.metaItem}>
                                    <MaterialCommunityIcons name="map-marker" size={moderateScale(16)} color={colors.primary} />
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
                                        <MaterialCommunityIcons name="link" size={moderateScale(18)} color={colors.primary} />
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity style={styles.registerBtn}>
                                        <Text style={styles.registerBtnText}>Interesting</Text>
                                        <MaterialCommunityIcons name="star-outline" size={moderateScale(18)} color={colors.primary} />
                                    </TouchableOpacity>
                                )}

                                {(event.contact || event.email) && (
                                    <View style={styles.contactContainer}>
                                        {event.contact && (
                                            <View style={styles.contactItem}>
                                                <MaterialCommunityIcons name="phone" size={moderateScale(14)} color={colors.textSecondary} />
                                                <Text style={styles.contactText}>{event.contact}</Text>
                                            </View>
                                        )}
                                        {event.email && (
                                            <View style={styles.contactItem}>
                                                <MaterialCommunityIcons name="email" size={moderateScale(14)} color={colors.textSecondary} />
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
        paddingBottom: getPadding(25),
        borderBottomLeftRadius: moderateScale(30),
        borderBottomRightRadius: moderateScale(30),
    },
    headerContent: {
        paddingHorizontal: getPadding(20),
        paddingTop: getPadding(10),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: moderateScale(40),
        height: moderateScale(40),
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    placeholderButton: {
        width: moderateScale(40),
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: getFontSize(24),
        fontWeight: 'bold',
        color: colors.white,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: getFontSize(14),
        color: colors.white,
        opacity: 0.8,
        marginTop: getMargin(4),
        textAlign: 'center',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: getPadding(20),
        paddingBottom: getPadding(100),
    },
    eventCard: {
        padding: 0,
        overflow: 'hidden',
        marginBottom: getMargin(25),
        borderRadius: moderateScale(20),
    },
    imageContainer: {
        width: '100%',
        height: verticalScale(180),
    },
    eventImage: {
        width: '100%',
        height: '100%',
    },
    categoryBadge: {
        position: 'absolute',
        top: getMargin(15),
        right: getMargin(15),
        backgroundColor: colors.white,
        paddingHorizontal: getPadding(12),
        paddingVertical: getPadding(6),
        borderRadius: moderateScale(12),
        elevation: 5,
    },
    categoryText: {
        fontSize: getFontSize(11),
        fontWeight: 'bold',
        color: colors.primary,
        textTransform: 'uppercase',
    },
    cardInfo: {
        padding: getPadding(16),
    },
    eventTitle: {
        fontSize: getFontSize(18),
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: getMargin(8),
    },
    metaRow: {
        flexDirection: 'row',
        gap: getMargin(15),
        marginBottom: getMargin(8),
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: getMargin(4),
    },
    metaText: {
        fontSize: getFontSize(13),
        color: colors.textSecondary,
        marginLeft: getMargin(6),
    },
    description: {
        fontSize: getFontSize(14),
        color: colors.gray600,
        marginTop: getMargin(8),
        lineHeight: getFontSize(20),
    },
    registerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: getMargin(15),
        paddingVertical: getPadding(10),
        borderRadius: moderateScale(12),
        borderWidth: 1,
        borderColor: colors.primary,
        gap: getMargin(8),
    },
    registerBtnText: {
        fontSize: getFontSize(14),
        fontWeight: '600',
        color: colors.primary,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: getMargin(100),
    },
    emptyText: {
        fontSize: getFontSize(16),
        color: colors.textSecondary,
        marginTop: getMargin(15),
    },
    themeContainer: {
        marginTop: getMargin(12),
        paddingVertical: getPadding(8),
        paddingHorizontal: getPadding(12),
        backgroundColor: colors.gray100,
        borderRadius: moderateScale(8),
    },
    themeLabel: {
        fontSize: getFontSize(12),
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: getMargin(4),
    },
    themeText: {
        fontSize: getFontSize(14),
        fontStyle: 'italic',
        color: colors.primary,
        fontWeight: '500',
    },
    organizedByContainer: {
        marginTop: getMargin(10),
    },
    organizedByLabel: {
        fontSize: getFontSize(12),
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: getMargin(4),
    },
    organizedByText: {
        fontSize: getFontSize(13),
        color: colors.textSecondary,
        lineHeight: getFontSize(18),
    },
    contactContainer: {
        marginTop: getMargin(12),
        paddingTop: getPadding(12),
        borderTopWidth: 1,
        borderTopColor: colors.gray200,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: getMargin(6),
    },
    contactText: {
        fontSize: getFontSize(13),
        color: colors.textSecondary,
        marginLeft: getMargin(6),
    },
});

export default StudentEvents;
