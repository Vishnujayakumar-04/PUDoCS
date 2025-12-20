import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { officeService } from '../../services/officeService';
import Header from '../../components/Header';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';

const OfficeDashboard = ({ navigation }) => {
    const { user, logout } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const data = await officeService.getDashboard();
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
        { title: 'Fee Management', icon: '💰', screen: 'Fees', color: colors.success },
        { title: 'Exam Eligibility', icon: '✅', screen: 'Eligibility', color: colors.warning },
        { title: 'Results', icon: '📊', screen: 'Results', color: colors.info },
        { title: 'Notices', icon: '📢', screen: 'Notices', color: colors.error },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Office Portal" subtitle="Administrative Control" />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <Card>
                    <Text style={styles.welcomeText}>Department Office</Text>
                    <Text style={styles.subtitle}>Administrative Authority</Text>
                </Card>

                {dashboardData && (
                    <>
                        <Text style={styles.sectionTitle}>Statistics</Text>
                        <View style={styles.statsGrid}>
                            <View style={[styles.statCard, { borderLeftColor: colors.primary }]}>
                                <Text style={styles.statValue}>{dashboardData.totalStudents}</Text>
                                <Text style={styles.statLabel}>Total Students</Text>
                            </View>
                            <View style={[styles.statCard, { borderLeftColor: colors.success }]}>
                                <Text style={styles.statValue}>
                                    {dashboardData.examEligibility?.eligible || 0}
                                </Text>
                                <Text style={styles.statLabel}>Exam Eligible</Text>
                            </View>
                            <View style={[styles.statCard, { borderLeftColor: colors.error }]}>
                                <Text style={styles.statValue}>
                                    {dashboardData.examEligibility?.notEligible || 0}
                                </Text>
                                <Text style={styles.statLabel}>Not Eligible</Text>
                            </View>
                            <View style={[styles.statCard, { borderLeftColor: colors.warning }]}>
                                <Text style={styles.statValue}>
                                    {dashboardData.upcomingExams?.length || 0}
                                </Text>
                                <Text style={styles.statLabel}>Upcoming Exams</Text>
                            </View>
                        </View>

                        <Card title="Fee Status Summary">
                            <View style={styles.feeRow}>
                                <Text style={styles.feeLabel}>Semester Fee Paid:</Text>
                                <Text style={[styles.feeValue, { color: colors.success }]}>
                                    {dashboardData.feeStatus?.semesterFeePaid || 0}
                                </Text>
                            </View>
                            <View style={styles.feeRow}>
                                <Text style={styles.feeLabel}>Semester Fee Not Paid:</Text>
                                <Text style={[styles.feeValue, { color: colors.error }]}>
                                    {dashboardData.feeStatus?.semesterFeeNotPaid || 0}
                                </Text>
                            </View>
                            <View style={styles.feeRow}>
                                <Text style={styles.feeLabel}>Exam Fee Paid:</Text>
                                <Text style={[styles.feeValue, { color: colors.success }]}>
                                    {dashboardData.feeStatus?.examFeePaid || 0}
                                </Text>
                            </View>
                            <View style={styles.feeRow}>
                                <Text style={styles.feeLabel}>Exam Fee Not Paid:</Text>
                                <Text style={[styles.feeValue, { color: colors.error }]}>
                                    {dashboardData.feeStatus?.examFeeNotPaid || 0}
                                </Text>
                            </View>
                        </Card>
                    </>
                )}

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
    subtitle: {
        fontSize: 14,
        color: colors.accent,
        marginTop: 4,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginTop: 16,
        marginBottom: 12,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statCard: {
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
    },
    statValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    feeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    feeLabel: {
        fontSize: 14,
        color: colors.textPrimary,
    },
    feeValue: {
        fontSize: 14,
        fontWeight: '600',
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
        textAlign: 'center',
    },
    examName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    examSubject: {
        fontSize: 14,
        color: colors.accent,
        marginBottom: 4,
    },
    examDate: {
        fontSize: 12,
        color: colors.textSecondary,
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

export default OfficeDashboard;
