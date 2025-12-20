import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { officeService } from '../../services/officeService';
import Header from '../../components/Header';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';

const OfficeExamEligibility = () => {
    const [eligibilityData, setEligibilityData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEligibility();
    }, []);

    const loadEligibility = async () => {
        try {
            const data = await officeService.getExamEligibility();
            setEligibilityData(data);
        } catch (error) {
            console.error('Error loading eligibility:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Exam Eligibility" subtitle="Student Eligibility Report" />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {eligibilityData && (
                    <>
                        <Card>
                            <View style={styles.summaryRow}>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryValue}>{eligibilityData.summary?.totalStudents || 0}</Text>
                                    <Text style={styles.summaryLabel}>Total Students</Text>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Text style={[styles.summaryValue, { color: colors.success }]}>
                                        {eligibilityData.summary?.eligibleCount || 0}
                                    </Text>
                                    <Text style={styles.summaryLabel}>Eligible</Text>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Text style={[styles.summaryValue, { color: colors.error }]}>
                                        {eligibilityData.summary?.notEligibleCount || 0}
                                    </Text>
                                    <Text style={styles.summaryLabel}>Not Eligible</Text>
                                </View>
                            </View>
                        </Card>

                        <Text style={styles.sectionTitle}>✅ Eligible Students</Text>
                        {eligibilityData.eligible && eligibilityData.eligible.length > 0 ? (
                            eligibilityData.eligible.map((student) => (
                                <Card key={student._id}>
                                    <View style={styles.studentRow}>
                                        <View style={styles.studentInfo}>
                                            <Text style={styles.studentName}>{student.name}</Text>
                                            <Text style={styles.registerNumber}>{student.registerNumber}</Text>
                                            <Text style={styles.courseInfo}>
                                                {student.course} - {student.program} - Year {student.year}
                                            </Text>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: colors.success }]}>
                                            <Text style={styles.statusText}>✓</Text>
                                        </View>
                                    </View>
                                    <View style={styles.feeInfo}>
                                        <Text style={styles.feeText}>
                                            Semester: <Text style={{ color: colors.success }}>Paid</Text>
                                        </Text>
                                        <Text style={styles.feeText}>
                                            Exam: <Text style={{ color: colors.success }}>Paid</Text>
                                        </Text>
                                    </View>
                                </Card>
                            ))
                        ) : (
                            <Card>
                                <Text style={styles.emptyText}>No eligible students</Text>
                            </Card>
                        )}

                        <Text style={styles.sectionTitle}>⚠️ Not Eligible Students</Text>
                        {eligibilityData.notEligible && eligibilityData.notEligible.length > 0 ? (
                            eligibilityData.notEligible.map((student) => (
                                <Card key={student._id}>
                                    <View style={styles.studentRow}>
                                        <View style={styles.studentInfo}>
                                            <Text style={styles.studentName}>{student.name}</Text>
                                            <Text style={styles.registerNumber}>{student.registerNumber}</Text>
                                            <Text style={styles.courseInfo}>
                                                {student.course} - {student.program} - Year {student.year}
                                            </Text>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: colors.error }]}>
                                            <Text style={styles.statusText}>✗</Text>
                                        </View>
                                    </View>
                                    <View style={styles.reasonContainer}>
                                        <Text style={styles.reasonLabel}>Reason:</Text>
                                        <Text style={styles.reasonText}>{student.reason}</Text>
                                    </View>
                                    <View style={styles.feeInfo}>
                                        <Text style={styles.feeText}>
                                            Semester: <Text style={{ color: student.semesterFee === 'Paid' ? colors.success : colors.error }}>
                                                {student.semesterFee}
                                            </Text>
                                        </Text>
                                        <Text style={styles.feeText}>
                                            Exam: <Text style={{ color: student.examFee === 'Paid' ? colors.success : colors.error }}>
                                                {student.examFee}
                                            </Text>
                                        </Text>
                                    </View>
                                </Card>
                            ))
                        ) : (
                            <Card>
                                <Text style={styles.emptyText}>All students are eligible!</Text>
                            </Card>
                        )}
                    </>
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
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginTop: 16,
        marginBottom: 12,
    },
    studentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    registerNumber: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 2,
    },
    courseInfo: {
        fontSize: 12,
        color: colors.textLight,
        marginTop: 2,
    },
    statusBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusText: {
        fontSize: 20,
        color: colors.white,
        fontWeight: 'bold',
    },
    reasonContainer: {
        backgroundColor: colors.warning + '20',
        padding: 8,
        borderRadius: 6,
        marginBottom: 8,
    },
    reasonLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.warning,
        marginBottom: 2,
    },
    reasonText: {
        fontSize: 12,
        color: colors.textPrimary,
    },
    feeInfo: {
        flexDirection: 'row',
        gap: 16,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
    feeText: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    emptyText: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});

export default OfficeExamEligibility;
