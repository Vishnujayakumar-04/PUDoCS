import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import Header from '../../components/Header';
import Marquee from '../../components/Marquee';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';

const StudentDashboard = ({ navigation }) => {
    const { user, logout } = useAuth();
    const [notices, setNotices] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [noticesData, eventsData] = await Promise.all([
                studentService.getNotices(),
                studentService.getEvents(),
            ]);
            setNotices(noticesData.slice(0, 5));
            setEvents(eventsData.slice(0, 5));
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

    const marqueeItems = [
        ...notices.map(n => n.title),
        ...events.map(e => e.name),
    ];

    const features = [
        { title: 'Profile', icon: '👤', screen: 'Profile' },
        { title: 'Timetable', icon: '📅', screen: 'Timetable' },
        { title: 'Notices', icon: '📢', screen: 'Notices' },
        { title: 'Exams', icon: '📝', screen: 'Exams' },
        { title: 'Events', icon: '🎉', screen: 'Events' },
        { title: 'Results', icon: '📊', screen: 'Results' },
        { title: 'Staff', icon: '👨‍🏫', screen: 'Staff' },
        { title: 'Letters', icon: '📄', screen: 'Letters' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <Header title="PUDoCS" subtitle="Department of Computer Science" />
            <Marquee items={marqueeItems} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <Card>
                    <Text style={styles.welcomeText}>
                        Welcome, {user?.profile?.name || 'Student'}!
                    </Text>
                    <Text style={styles.registerNumber}>
                        {user?.profile?.registerNumber}
                    </Text>
                </Card>

                <Text style={styles.sectionTitle}>Quick Access</Text>
                <View style={styles.featuresGrid}>
                    {features.map((feature, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.featureCard}
                            onPress={() => navigation.navigate(feature.screen)}
                        >
                            <Text style={styles.featureIcon}>{feature.icon}</Text>
                            <Text style={styles.featureTitle}>{feature.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Recent Notices</Text>
                {notices.map((notice) => (
                    <Card key={notice._id}>
                        <View style={styles.noticeHeader}>
                            <Text style={styles.noticeTitle}>{notice.title}</Text>
                            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                                <Text style={styles.badgeText}>{notice.category}</Text>
                            </View>
                        </View>
                        <Text style={styles.noticeContent} numberOfLines={2}>
                            {notice.content}
                        </Text>
                        <Text style={styles.noticeDate}>
                            {new Date(notice.createdAt).toLocaleDateString()}
                        </Text>
                    </Card>
                ))}

                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
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
        padding: 16,
    },
    welcomeText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    registerNumber: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginTop: 16,
        marginBottom: 12,
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    featureCard: {
        width: '23%',
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    featureIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    featureTitle: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.textPrimary,
        textAlign: 'center',
    },
    noticeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    noticeTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        flex: 1,
        marginRight: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.white,
    },
    noticeContent: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    noticeDate: {
        fontSize: 12,
        color: colors.textLight,
    },
    logoutButton: {
        backgroundColor: colors.error,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 32,
    },
    logoutText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default StudentDashboard;
