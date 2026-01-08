import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Animated, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { staffService } from '../../services/staffService';
import PremiumHeader from '../../components/PremiumHeader';
import PremiumCard from '../../components/PremiumCard';
import Marquee from '../../components/Marquee';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';
import { safeNavigate } from '../../utils/safeNavigation';

const StaffDashboard = ({ navigation }) => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [notices, setNotices] = useState([]);
    const [events, setEvents] = useState([]);
    const [upcomingExams, setUpcomingExams] = useState([]);
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
            // Load staff profile
            const profileData = await staffService.getProfile(user?.uid);
            setProfile(profileData);
            
            const dashboardData = await staffService.getDashboard(user?.uid);
            
            // Get notices and events
            const noticesData = await staffService.getNotices();
            const eventsData = await staffService.getEvents();
            
            setNotices(noticesData.slice(0, 3)); // Max 3 notices
            setEvents(eventsData.slice(0, 5));
            setUpcomingExams(dashboardData?.upcomingExams || []);
        } catch (error) {
            console.error('Error loading dashboard:', error);
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
        { title: 'Students', screen: 'Students', icon: 'account-group-outline', color: colors.primary },
        { title: 'Attendance', screen: 'Attendance', icon: 'account-check-outline', color: colors.secondary },
        { title: 'Gallery', screen: 'Gallery', icon: 'image-multiple', color: '#9B59B6' },
        { title: 'Timetable', screen: 'Timetable', icon: 'calendar-clock', color: colors.accent },
        { title: 'Exams', screen: 'Exams', icon: 'file-document-outline', color: colors.warning },
        { title: 'Internals', screen: 'Internals', icon: 'book-edit-outline', color: colors.info },
        { title: 'Notices', screen: 'Notices', icon: 'bell-outline', color: '#6366F1' },
        { title: 'Events', screen: 'Events', icon: 'calendar-star', color: colors.success },
        { title: 'Faculty', screen: 'StaffDirectory', icon: 'account-group', color: colors.primaryDark },
    ];

    const getCategoryColor = (category) => {
        switch (category?.toLowerCase()) {
            case 'academic': return colors.primary;
            case 'exam': return colors.warning;
            case 'event': return colors.info;
            case 'administrative': return colors.accent;
            default: return colors.gray500;
        }
    };

    return (
        <View style={styles.container}>
            <PremiumHeader 
                title="Staff Portal" 
                subtitle="Faculty Management"
                showAvatar={true}
                onAvatarPress={() => safeNavigate(navigation, 'Profile')}
                user={user}
                profile={user?.profile}
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
                        <Text style={styles.welcomeText}>Welcome, {profile?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Staff'}!</Text>
                        <Text style={styles.welcomeSubtext}>
                            {profile?.designation || 'Faculty'} • {profile?.department || 'Computer Science'}
                        </Text>
                    </PremiumCard>
                </Animated.View>

                {/* Quick Access Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Access</Text>
                    <View style={styles.featuresGrid}>
                        {features.map((feature, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.featureCard}
                                onPress={() => safeNavigate(navigation, feature.screen)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.iconBackground, { backgroundColor: feature.color + '15' }]}>
                                    <MaterialCommunityIcons 
                                        name={feature.icon} 
                                        size={24} 
                                        color={feature.color} 
                                    />
                                </View>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Upcoming Exams Section */}
                {upcomingExams.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Upcoming Exams</Text>
                            <TouchableOpacity onPress={() => safeNavigate(navigation, 'Exams')}>
                                <Text style={styles.seeAllText}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        {upcomingExams.slice(0, 3).map((exam) => (
                            <PremiumCard key={exam.id || exam._id} style={styles.examCard}>
                                <View style={styles.examContent}>
                                    <View style={styles.examHeader}>
                                        <Text style={styles.examName}>{exam.name || exam.subject || 'Exam'}</Text>
                                        <View style={[styles.examBadge, { backgroundColor: colors.warning + '15' }]}>
                                            <Text style={[styles.examBadgeText, { color: colors.warning }]}>
                                                {exam.examType || 'Exam'}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.examSubject}>{exam.subject || exam.program || ''}</Text>
                                    <Text style={styles.examDate}>
                                        📅 {formatDate(exam.date)} {exam.startTime ? `at ${exam.startTime}` : ''}
                                    </Text>
                                </View>
                            </PremiumCard>
                        ))}
                    </View>
                )}

                {/* Recent Notices Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Notices</Text>
                        <TouchableOpacity onPress={() => safeNavigate(navigation, 'Notices')}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {notices.length === 0 ? (
                        <PremiumCard style={styles.emptyCard}>
                            <MaterialCommunityIcons name="bell-off-outline" size={32} color={colors.gray300} />
                            <Text style={styles.emptyText}>No recent notices</Text>
                        </PremiumCard>
                    ) : (
                        notices.map((notice, idx) => (
                            <PremiumCard key={notice.id || idx} style={styles.noticeCard}>
                                <View style={styles.noticeContent}>
                                    <View style={[styles.categoryIndicator, { backgroundColor: getCategoryColor(notice.category) }]} />
                                    <View style={styles.noticeTextContainer}>
                                        <View style={styles.noticeHeader}>
                                            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(notice.category) + '15' }]}>
                                                <Text style={[styles.categoryText, { color: getCategoryColor(notice.category) }]}>
                                                    {notice.category || 'General'}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={styles.noticeTitle} numberOfLines={2}>{notice.title}</Text>
                                        {notice.content && (
                                            <Text style={styles.noticeDescription} numberOfLines={2}>
                                                {notice.content}
                                            </Text>
                                        )}
                                        <Text style={styles.noticeDate}>
                                            {formatDate(notice.createdAt)}
                                        </Text>
                                    </View>
                                </View>
                            </PremiumCard>
                        ))
                    )}
                </View>

                <View style={{ height: 100 }} />
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
        padding: 20,
    },
    welcomeCard: {
        marginBottom: 8,
    },
    welcomeText: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    welcomeSubtext: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '400',
    },
    section: {
        marginTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.textPrimary,
        letterSpacing: -0.3,
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    featureCard: {
        width: '48%',
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        minHeight: 100,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.gray100,
    },
    iconBackground: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    featureTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textPrimary,
        textAlign: 'center',
    },
    examCard: {
        padding: 0,
        overflow: 'hidden',
        marginBottom: 12,
    },
    examContent: {
        padding: 16,
    },
    examHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    examName: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
        flex: 1,
    },
    examBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginLeft: 8,
    },
    examBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    examSubject: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 6,
    },
    examDate: {
        fontSize: 12,
        color: colors.textLight,
        fontWeight: '400',
    },
    noticeCard: {
        padding: 0,
        overflow: 'hidden',
        marginBottom: 12,
    },
    noticeContent: {
        flexDirection: 'row',
        padding: 16,
    },
    categoryIndicator: {
        width: 4,
        borderRadius: 2,
        marginRight: 16,
    },
    noticeTextContainer: {
        flex: 1,
    },
    noticeHeader: {
        marginBottom: 8,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    categoryText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    noticeTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 6,
        lineHeight: 22,
    },
    noticeDescription: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 8,
        lineHeight: 20,
    },
    noticeDate: {
        fontSize: 12,
        color: colors.textLight,
        fontWeight: '400',
    },
    seeAllText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '600',
    },
    emptyCard: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: colors.gray50,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    emptyText: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    closeButton: {
        padding: 4,
    },
    notificationList: {
        padding: 16,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: colors.gray50,
        borderRadius: 12,
        marginBottom: 12,
    },
    notificationIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    notificationTextContainer: {
        flex: 1,
    },
    notificationText: {
        fontSize: 15,
        color: colors.textPrimary,
        fontWeight: '500',
        marginBottom: 4,
        lineHeight: 20,
    },
    notificationDate: {
        fontSize: 12,
        color: colors.textSecondary,
    },
});

export default StaffDashboard;
