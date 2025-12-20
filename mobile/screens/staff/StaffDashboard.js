import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { staffService } from '../../services/staffService';
import Header from '../../components/Header';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';

const StaffDashboard = ({ navigation }) => {
    const { user, logout } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const data = await staffService.getDashboard();
            setDashboardData(data);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadDashboard();
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    const quickActions = [
        { title: 'Students', icon: '👥', screen: 'Students', color: colors.primary },
        { title: 'Attendance', icon: '✅', screen: 'Attendance', color: colors.secondary },
        { title: 'Timetable', icon: '📅', screen: 'Timetable', color: colors.accent },
        { title: 'Exams', icon: '📝', screen: 'Exams', color: colors.warning },
        { title: 'Internals', icon: '📊', screen: 'Internals', color: colors.info },
        { title: 'Notices', icon: '📢', screen: 'Notices', color: colors.success },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Staff Portal" subtitle={user?.profile?.name || 'Faculty'} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <Card>
                    <Text style={styles.welcomeText}>Welcome, {user?.profile?.name}!</Text>
                    <Text style={styles.designation}>{user?.profile?.designation}</Text>
                    <Text style={styles.department}>{user?.profile?.department}</Text>
                </Card>

                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                    {quickActions.map((action, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.actionCard, { borderLeftColor: action.color }]}
                            onPress={() => navigation.navigate(action.screen)}
                        >
                            <Text style={styles.actionIcon}>{action.icon}</Text>
                            <Text style={styles.actionTitle}>{action.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {dashboardData?.assignedClasses && dashboardData.assignedClasses.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Assigned Classes</Text>
                        {dashboardData.assignedClasses.map((cls, index) => (
                            <Card key={index}>
                                <View style={styles.classHeader}>
                                    <Text style={styles.classTitle}>
                                        {cls.program} - Year {cls.year} ({cls.section})
                                    </Text>
                                    <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
                                        <Text style={styles.badgeText}>{cls.course}</Text>
                                    </View>
                                </View>
                                <Text style={styles.subject}>{cls.subject}</Text>
                            </Card>
                        ))}
                    </>
                )}

                {dashboardData?.upcomingExams && dashboardData.upcomingExams.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Upcoming Exams</Text>
                        {dashboardData.upcomingExams.map((exam) => (
                            <Card key={exam._id}>
                                <Text style={styles.examName}>{exam.name}</Text>
                                <Text style={styles.examSubject}>{exam.subject}</Text>
                                <Text style={styles.examDate}>
                                    📅 {new Date(exam.date).toLocaleDateString()} at {exam.startTime}
                                </Text>
                            </Card>
                        ))}
                    </>
                )}

                {dashboardData?.recentNotices && dashboardData.recentNotices.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Recent Notices</Text>
                        {dashboardData.recentNotices.map((notice) => (
                            <Card key={notice._id}>
                                <Text style={styles.noticeTitle}>{notice.title}</Text>
                                <Text style={styles.noticeDate}>
                                    {new Date(notice.createdAt).toLocaleDateString()}
                                </Text>
                            </Card>
                        ))}
                    </>
                )}

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
    designation: {
        fontSize: 14,
        color: colors.secondary,
        marginTop: 4,
        fontWeight: '600',
    },
    department: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginTop: 16,
        marginBottom: 12,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    actionCard: {
        width: '48%',
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center',
    },
    actionIcon: {
        fontSize: 36,
        marginBottom: 8,
    },
    actionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    classHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    classTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        flex: 1,
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
    subject: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    examName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    examSubject: {
        fontSize: 14,
        color: colors.secondary,
        marginBottom: 4,
    },
    examDate: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    noticeTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 4,
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

export default StaffDashboard;
