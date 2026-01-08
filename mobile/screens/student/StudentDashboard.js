import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Animated, Dimensions, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import PremiumHeader from '../../components/PremiumHeader';
import PremiumCard from '../../components/PremiumCard';
import Marquee from '../../components/Marquee';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';
import { moderateScale, getFontSize, getPadding, getMargin } from '../../utils/responsive';
import { safeNavigate } from '../../utils/safeNavigation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const StudentDashboard = ({ navigation }) => {
    const { user } = useAuth();
    const [notices, setNotices] = useState([]);
    const [events, setEvents] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [notificationModalVisible, setNotificationModalVisible] = useState(false);
    
    // Static notifications
    const notifications = [
        { id: '1', message: 'Examination results have been published.', date: new Date().toISOString() },
        { id: '2', message: 'The college will reopen on 19-01-2026.', date: new Date().toISOString() },
    ];

    // Animation Values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        loadData();
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const loadData = async () => {
        try {
            const [noticesData, eventsData] = await Promise.all([
                studentService.getNotices(),
                studentService.getEvents(),
            ]);
            setNotices(noticesData.slice(0, 3)); // Max 3 notices
            setEvents(eventsData.slice(0, 5));
            
            // Load profile if user is available
            if (user?.uid) {
                try {
                    const profileData = await studentService.getProfile(user.uid, user.email);
                    setProfile(profileData);
                } catch (error) {
                    console.error('Error loading profile:', error);
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    const formatDate = (dateValue) => {
        if (!dateValue) return '';
        try {
            if (dateValue.toDate) return dateValue.toDate().toLocaleDateString();
            return new Date(dateValue).toLocaleDateString();
        } catch (e) {
            return dateValue.toString();
        }
    };

    const formatEventDate = (dateValue) => {
        if (!dateValue) return '';
        try {
            const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
            if (isNaN(date.getTime())) return '';
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch (e) {
            return '';
        }
    };

    const marqueeItems = [
        "Examination results have been published.",
        "The college will reopen on 19-01-2026.",
        ...notices.map(n => n.title).filter(Boolean),
        ...events.map(e => {
            const eventDate = formatEventDate(e.date);
            return eventDate ? `📅 Event: ${e.name || e.title} (${eventDate})` : `📅 Event: ${e.name || e.title}`;
        }).filter(Boolean),
    ];

    // Quick Access Features with icons
    const features = [
        { title: 'Faculty', screen: 'Staff', icon: 'account-group-outline', color: '#6366F1' },
        { title: 'Events', screen: 'Events', icon: 'calendar-star', color: colors.info },
        { title: 'Gallery', screen: 'Gallery', icon: 'image-multiple', color: '#9B59B6' },
    ];

    const getCategoryColor = (category) => {
        switch (category?.toLowerCase()) {
            case 'academic': return colors.primary;
            case 'exam': return colors.warning;
            case 'event': return colors.info;
            case 'fees': return colors.accent;
            default: return colors.gray500;
        }
    };

    return (
        <View style={styles.container}>
            <PremiumHeader 
                title="PUDoCS" 
                subtitle="Department of Computer Science"
                showAvatar={true}
                onAvatarPress={() => safeNavigate(navigation, 'Profile')}
                user={user}
                profile={profile}
                showNotification={true}
                onNotificationPress={() => setNotificationModalVisible(true)}
                notificationCount={notifications.length}
            />
            <Marquee items={marqueeItems} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Welcome Card */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <PremiumCard style={styles.welcomeCard}>
                        <Text style={styles.welcomeText}>Welcome, {user?.profile?.name?.split(' ')[0] || 'Student'}!</Text>
                        <Text style={styles.welcomeSubtext}>Stay updated with your academic activities</Text>
                    </PremiumCard>
                </Animated.View>

                {/* Quick Access Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Access</Text>
                    <View style={styles.featuresGrid}>
                        {features.map((feature, index) => (
                            <PremiumCard
                                key={index}
                                style={styles.featureCard}
                                onPress={() => safeNavigate(navigation, feature.screen)}
                                delay={200}
                                index={index}
                            >
                                <View style={[styles.iconBackground, { backgroundColor: feature.color + '15' }]}>
                                    <MaterialCommunityIcons 
                                        name={feature.icon} 
                                        size={moderateScale(24)} 
                                        color={feature.color} 
                                    />
                                </View>
                                <Text style={styles.featureTitle} numberOfLines={1} adjustsFontSizeToFit>
                                    {feature.title}
                                </Text>
                            </PremiumCard>
                        ))}
                    </View>
                </View>

                <View style={{ height: getMargin(100) }} />
            </ScrollView>

            {/* Notification Modal */}
            <Modal
                visible={notificationModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setNotificationModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Notifications</Text>
                            <TouchableOpacity
                                onPress={() => setNotificationModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.notificationList}>
                            {notifications.map((notification) => (
                                <View key={notification.id} style={styles.notificationItem}>
                                    <View style={styles.notificationIcon}>
                                        <MaterialCommunityIcons name="bell" size={20} color={colors.primary} />
                                    </View>
                                    <View style={styles.notificationTextContainer}>
                                        <Text style={styles.notificationText}>{notification.message}</Text>
                                        <Text style={styles.notificationDate}>
                                            {new Date(notification.date).toLocaleDateString('en-US', { 
                                                month: 'short', 
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: getPadding(20),
        paddingBottom: getPadding(100),
    },
    welcomeCard: {
        marginBottom: getMargin(8),
    },
    welcomeText: {
        fontSize: getFontSize(22),
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: getMargin(4),
        lineHeight: getFontSize(28),
    },
    welcomeSubtext: {
        fontSize: getFontSize(14),
        color: colors.textSecondary,
        fontWeight: '400',
        lineHeight: getFontSize(20),
    },
    section: {
        marginTop: getMargin(24),
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: getMargin(16),
        paddingHorizontal: getPadding(2),
    },
    sectionTitle: {
        fontSize: getFontSize(20),
        fontWeight: '700',
        color: colors.textPrimary,
        letterSpacing: -0.3,
        lineHeight: getFontSize(26),
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: getMargin(8),
    },
    featureCard: {
        width: (SCREEN_WIDTH - getPadding(60)) / 2,
        maxWidth: moderateScale(180),
        padding: getPadding(16),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: getMargin(12),
        minHeight: moderateScale(100),
    },
    iconBackground: {
        width: moderateScale(48),
        height: moderateScale(48),
        borderRadius: moderateScale(24),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: getMargin(8),
    },
    featureTitle: {
        fontSize: getFontSize(12),
        fontWeight: '600',
        color: colors.textPrimary,
        textAlign: 'center',
        lineHeight: getFontSize(16),
        maxWidth: '100%',
    },
    noticeCard: {
        padding: 0,
        overflow: 'hidden',
        marginBottom: getMargin(12),
    },
    noticeContent: {
        flexDirection: 'row',
        padding: getPadding(16),
    },
    categoryIndicator: {
        width: moderateScale(4),
        borderRadius: moderateScale(2),
        marginRight: getMargin(16),
    },
    noticeTextContainer: {
        flex: 1,
        minWidth: 0, // Prevents text overflow
    },
    noticeHeader: {
        marginBottom: getMargin(8),
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: getPadding(10),
        paddingVertical: getPadding(4),
        borderRadius: moderateScale(8),
    },
    categoryText: {
        fontSize: getFontSize(11),
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    noticeTitle: {
        fontSize: getFontSize(16),
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: getMargin(6),
        lineHeight: getFontSize(22),
    },
    noticeDescription: {
        fontSize: getFontSize(14),
        color: colors.textSecondary,
        marginBottom: getMargin(8),
        lineHeight: getFontSize(20),
    },
    noticeDate: {
        fontSize: getFontSize(12),
        color: colors.textLight,
        fontWeight: '400',
    },
    seeAllText: {
        fontSize: getFontSize(14),
        color: colors.primary,
        fontWeight: '600',
    },
    emptyCard: {
        alignItems: 'center',
        paddingVertical: getPadding(32),
        backgroundColor: colors.gray50,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    emptyText: {
        fontSize: getFontSize(14),
        color: colors.textSecondary,
        marginTop: getMargin(12),
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: moderateScale(24),
        borderTopRightRadius: moderateScale(24),
        maxHeight: '80%',
        paddingBottom: getPadding(20),
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: getPadding(20),
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },
    modalTitle: {
        fontSize: getFontSize(20),
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    closeButton: {
        padding: getPadding(4),
    },
    notificationList: {
        padding: getPadding(16),
    },
    notificationItem: {
        flexDirection: 'row',
        padding: getPadding(16),
        backgroundColor: colors.gray50,
        borderRadius: moderateScale(12),
        marginBottom: getMargin(12),
    },
    notificationIcon: {
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(20),
        backgroundColor: colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: getMargin(12),
    },
    notificationTextContainer: {
        flex: 1,
    },
    notificationText: {
        fontSize: getFontSize(15),
        color: colors.textPrimary,
        fontWeight: '500',
        marginBottom: getMargin(4),
        lineHeight: getFontSize(20),
    },
    notificationDate: {
        fontSize: getFontSize(12),
        color: colors.textSecondary,
    },
});

export default StudentDashboard;
