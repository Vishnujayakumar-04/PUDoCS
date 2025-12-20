import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { studentService } from '../../services/studentService';
import Header from '../../components/Header';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';

const StudentExams = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadExams();
    }, []);

    const loadExams = async () => {
        try {
            const data = await studentService.getExams();
            setExams(data);
        } catch (error) {
            console.error('Error loading exams:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Exams" subtitle="Exam Schedule & Seat Allocation" />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {exams.length === 0 ? (
                    <Card>
                        <Text style={styles.noDataText}>No exams scheduled</Text>
                    </Card>
                ) : (
                    exams.map((exam) => (
                        <Card key={exam._id}>
                            <View style={styles.examHeader}>
                                <Text style={styles.examName}>{exam.name}</Text>
                                <View style={[styles.typeBadge, { backgroundColor: colors.secondary }]}>
                                    <Text style={styles.typeBadgeText}>{exam.examType}</Text>
                                </View>
                            </View>

                            <Text style={styles.subject}>{exam.subject}</Text>

                            <View style={styles.infoRow}>
                                <Text style={styles.label}>📅 Date:</Text>
                                <Text style={styles.value}>
                                    {new Date(exam.date).toLocaleDateString()}
                                </Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.label}>⏰ Time:</Text>
                                <Text style={styles.value}>
                                    {exam.startTime} - {exam.endTime}
                                </Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.label}>⏱️ Duration:</Text>
                                <Text style={styles.value}>{exam.duration} minutes</Text>
                            </View>

                            {exam.mySeat && (
                                <View style={styles.seatAllocation}>
                                    <Text style={styles.seatTitle}>🪑 Your Seat Allocation</Text>
                                    <View style={styles.seatDetails}>
                                        <View style={styles.seatInfo}>
                                            <Text style={styles.seatLabel}>Hall:</Text>
                                            <Text style={styles.seatValue}>
                                                {exam.mySeat.classroom?.name}
                                            </Text>
                                        </View>
                                        <View style={styles.seatInfo}>
                                            <Text style={styles.seatLabel}>Building:</Text>
                                            <Text style={styles.seatValue}>
                                                {exam.mySeat.classroom?.building}
                                            </Text>
                                        </View>
                                        <View style={styles.seatInfo}>
                                            <Text style={styles.seatLabel}>Seat Number:</Text>
                                            <Text style={[styles.seatValue, styles.seatNumber]}>
                                                {exam.mySeat.seatNumber}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )}

                            {!exam.mySeat && exam.isSeatsAllocated && (
                                <View style={styles.noSeatContainer}>
                                    <Text style={styles.noSeatText}>
                                        ⚠️ You are not allocated a seat for this exam
                                    </Text>
                                </View>
                            )}

                            {!exam.isSeatsAllocated && (
                                <View style={styles.pendingContainer}>
                                    <Text style={styles.pendingText}>
                                        ⏳ Seat allocation pending
                                    </Text>
                                </View>
                            )}
                        </Card>
                    ))
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
    examHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    examName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        flex: 1,
        marginRight: 8,
    },
    typeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    typeBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.white,
    },
    subject: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: '600',
        marginBottom: 12,
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
    seatAllocation: {
        marginTop: 16,
        padding: 12,
        backgroundColor: colors.gray50,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: colors.success,
    },
    seatTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.success,
        marginBottom: 12,
    },
    seatDetails: {
        gap: 8,
    },
    seatInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    seatLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    seatValue: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    seatNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.success,
    },
    noSeatContainer: {
        marginTop: 12,
        padding: 12,
        backgroundColor: colors.warning + '20',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.warning,
    },
    noSeatText: {
        fontSize: 14,
        color: colors.warning,
        textAlign: 'center',
    },
    pendingContainer: {
        marginTop: 12,
        padding: 12,
        backgroundColor: colors.info + '20',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.info,
    },
    pendingText: {
        fontSize: 14,
        color: colors.info,
        textAlign: 'center',
    },
    noDataText: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});

export default StudentExams;
