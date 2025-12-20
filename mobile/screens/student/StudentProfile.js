import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { studentService } from '../../services/studentService';
import Header from '../../components/Header';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';

const StudentProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await studentService.getProfile();
            setProfile(data);
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    const calculateAttendancePercentage = () => {
        if (!profile?.attendance || profile.attendance.length === 0) return 0;
        const present = profile.attendance.filter(a => a.status === 'Present').length;
        return ((present / profile.attendance.length) * 100).toFixed(1);
    };

    const getFeeStatusColor = (status) => {
        return status === 'Paid' ? colors.paid : colors.notPaid;
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header title="My Profile" />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Card>
                    <View style={styles.profileHeader}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {profile?.name?.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.name}>{profile?.name}</Text>
                            <Text style={styles.registerNumber}>{profile?.registerNumber}</Text>
                            <Text style={styles.email}>{profile?.email}</Text>
                        </View>
                    </View>
                </Card>

                <Card title="Academic Information">
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Course:</Text>
                        <Text style={styles.value}>{profile?.course}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Program:</Text>
                        <Text style={styles.value}>{profile?.program}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Year:</Text>
                        <Text style={styles.value}>{profile?.year}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Section:</Text>
                        <Text style={styles.value}>{profile?.section}</Text>
                    </View>
                </Card>

                <Card title="Attendance">
                    <View style={styles.attendanceContainer}>
                        <Text style={styles.attendancePercentage}>
                            {calculateAttendancePercentage()}%
                        </Text>
                        <Text style={styles.attendanceLabel}>Overall Attendance</Text>
                    </View>
                </Card>

                <Card title="Fee Status">
                    <View style={styles.feeRow}>
                        <Text style={styles.feeLabel}>Semester Fee:</Text>
                        <View style={[styles.feeStatus, { backgroundColor: getFeeStatusColor(profile?.fees?.semester?.status) }]}>
                            <Text style={styles.feeStatusText}>{profile?.fees?.semester?.status}</Text>
                        </View>
                    </View>
                    <View style={styles.feeRow}>
                        <Text style={styles.feeLabel}>Exam Fee:</Text>
                        <View style={[styles.feeStatus, { backgroundColor: getFeeStatusColor(profile?.fees?.exam?.status) }]}>
                            <Text style={styles.feeStatusText}>{profile?.fees?.exam?.status}</Text>
                        </View>
                    </View>
                    {profile?.fees?.hostel?.status !== 'N/A' && (
                        <View style={styles.feeRow}>
                            <Text style={styles.feeLabel}>Hostel Fee:</Text>
                            <View style={[styles.feeStatus, { backgroundColor: getFeeStatusColor(profile?.fees?.hostel?.status) }]}>
                                <Text style={styles.feeStatusText}>{profile?.fees?.hostel?.status}</Text>
                            </View>
                        </View>
                    )}
                </Card>

                {profile?.isExamEligible !== undefined && (
                    <Card>
                        <View style={styles.eligibilityContainer}>
                            <Text style={styles.eligibilityLabel}>Exam Eligibility:</Text>
                            <View style={[
                                styles.eligibilityBadge,
                                { backgroundColor: profile.isExamEligible ? colors.success : colors.error }
                            ]}>
                                <Text style={styles.eligibilityText}>
                                    {profile.isExamEligible ? 'Eligible' : 'Not Eligible'}
                                </Text>
                            </View>
                        </View>
                    </Card>
                )}
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
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.white,
    },
    profileInfo: {
        flex: 1,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    registerNumber: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
    },
    email: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 2,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    value: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    attendanceContainer: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    attendancePercentage: {
        fontSize: 48,
        fontWeight: 'bold',
        color: colors.primary,
    },
    attendanceLabel: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 8,
    },
    feeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    feeLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    feeStatus: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    feeStatusText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.white,
    },
    eligibilityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    eligibilityLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    eligibilityBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
    },
    eligibilityText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.white,
    },
});

export default StudentProfile;
