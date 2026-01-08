import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendanceService';
import { studentService } from '../../services/studentService';
import { getDefaultSubjects } from '../../utils/defaultSubjects';
import PremiumHeader from '../../components/PremiumHeader';
import PremiumCard from '../../components/PremiumCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';
import { moderateScale, getFontSize, getPadding, getMargin } from '../../utils/responsive';

const StudentAttendance = ({ navigation }) => {
    const { user } = useAuth();
    const [attendance, setAttendance] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [overallAttendance, setOverallAttendance] = useState(0);
    const [overallEligible, setOverallEligible] = useState(true);

    useEffect(() => {
        loadAttendance();
    }, []);

    const loadAttendance = async () => {
        setLoading(true);
        try {
            // Get student profile to get program and year
            const studentProfile = await studentService.getProfile(user?.uid, user?.email);
            setProfile(studentProfile);
            console.log('📊 Student Profile loaded:', studentProfile);
            
            if (studentProfile && studentProfile.program && studentProfile.year) {
                console.log('📊 Loading attendance for:', {
                    program: studentProfile.program,
                    year: studentProfile.year,
                    registerNumber: studentProfile.registerNumber
                });
                
                const studentId = user?.uid || studentProfile.registerNumber || studentProfile.id;
                let attendanceData = await attendanceService.getStudentAttendance(
                    studentId,
                    studentProfile.program,
                    studentProfile.year
                );
                
                console.log('📊 Attendance data received:', attendanceData.length, 'subjects');
                
                // If no attendance data but we have default subjects, show them with 0 attendance
                if (attendanceData.length === 0) {
                    const defaultSubjects = getDefaultSubjects(studentProfile.program, studentProfile.year);
                    console.log('📊 Using default subjects:', defaultSubjects.length);
                    attendanceData = defaultSubjects.map(subject => ({
                        code: subject.code,
                        name: subject.name,
                        credits: subject.hours || 3,
                        type: subject.type || 'Hardcore',
                        faculty: subject.faculty || '',
                        totalClasses: 0,
                        attendedClasses: 0,
                        notAttendedClasses: 0,
                        attendancePercentage: 0,
                        isEligible: false,
                        records: [],
                    }));
                }
                
                setAttendance(attendanceData);
                
                // Calculate overall attendance
                if (attendanceData.length > 0) {
                    const totalCredits = attendanceData.reduce((sum, subj) => sum + (subj.credits || 3), 0);
                    const weightedSum = attendanceData.reduce((sum, subj) => {
                        const credits = subj.credits || 3;
                        return sum + (subj.attendancePercentage * credits);
                    }, 0);
                    const overall = totalCredits > 0 ? weightedSum / totalCredits : 100;
                    setOverallAttendance(Math.round(overall * 100) / 100);
                    setOverallEligible(overall >= 75);
                }
            }
        } catch (error) {
            console.error('Error loading attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.header}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.white} />
                        </TouchableOpacity>
                        <View style={styles.titleContainer}>
                            <Text style={styles.headerTitle}>My Attendance</Text>
                        </View>
                        <View style={styles.headerRight} />
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Overall Attendance Summary */}
                <PremiumCard style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Overall Attendance</Text>
                            <Text style={[styles.summaryValue, { color: overallEligible ? colors.success : colors.error }]}>
                                {overallAttendance}%
                            </Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Exam Eligibility</Text>
                            <View style={[
                                styles.eligibilityBadge,
                                { backgroundColor: overallEligible ? colors.success + '20' : colors.error + '20' }
                            ]}>
                                <Text style={[
                                    styles.eligibilityText,
                                    { color: overallEligible ? colors.success : colors.error }
                                ]}>
                                    {overallEligible ? 'Eligible' : 'Not Eligible'}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <Text style={styles.summaryNote}>
                        Minimum 75% attendance required for exam eligibility
                    </Text>
                </PremiumCard>

                {/* Attendance Table */}
                <PremiumCard style={styles.tableCard}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderText, styles.colSubject]}>Subject</Text>
                        <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
                        <Text style={[styles.tableHeaderText, styles.colAttended]}>Attended</Text>
                        <Text style={[styles.tableHeaderText, styles.colNotAttended]}>Not Attended</Text>
                        <Text style={[styles.tableHeaderText, styles.colPercentage]}>Attendance</Text>
                        <Text style={[styles.tableHeaderText, styles.colEligible]}>Eligible</Text>
                    </View>

                    {attendance.length === 0 ? (
                        <View style={styles.emptyRow}>
                            <Text style={styles.emptyText}>No attendance records found</Text>
                        </View>
                    ) : (
                        attendance.map((subject, index) => (
                            <View key={index} style={styles.tableRow}>
                                <View style={[styles.tableCell, styles.colSubject]}>
                                    <Text style={styles.subjectCode} numberOfLines={1}>{subject.code}</Text>
                                    <Text style={styles.subjectName} numberOfLines={1}>{subject.name}</Text>
                                </View>
                                <Text style={[styles.tableCell, styles.colTotal]}>{subject.totalClasses}</Text>
                                <Text style={[styles.tableCell, styles.colAttended]}>{subject.attendedClasses}</Text>
                                <Text style={[styles.tableCell, styles.colNotAttended]}>{subject.notAttendedClasses}</Text>
                                <View style={[styles.tableCell, styles.colPercentage]}>
                                    <Text style={[
                                        styles.percentageText,
                                        { color: subject.attendancePercentage >= 75 ? colors.success : colors.error }
                                    ]}>
                                        {subject.attendancePercentage}%
                                    </Text>
                                </View>
                                <View style={[styles.tableCell, styles.colEligible]}>
                                    <View style={[
                                        styles.eligibleBadge,
                                        { backgroundColor: subject.isEligible ? colors.success + '20' : colors.error + '20' }
                                    ]}>
                                        <Text style={[
                                            styles.eligibleText,
                                            { color: subject.isEligible ? colors.success : colors.error }
                                        ]}>
                                            {subject.isEligible ? '✓' : '✗'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </PremiumCard>

                {/* Info Card */}
                <PremiumCard style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="information-outline" size={20} color={colors.primary} />
                        <Text style={styles.infoText}>
                            Attendance is calculated based on credits. Missing 1 class of a 3-credit course reduces attendance by 3%.
                        </Text>
                    </View>
                </PremiumCard>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingBottom: getPadding(16),
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: getPadding(16),
        paddingTop: getPadding(8),
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: getFontSize(20),
        fontWeight: '700',
        color: colors.white,
    },
    headerRight: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    summaryCard: {
        margin: getMargin(16),
        padding: getPadding(16),
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: getMargin(12),
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: getFontSize(14),
        color: colors.textSecondary,
        marginBottom: getMargin(4),
    },
    summaryValue: {
        fontSize: getFontSize(24),
        fontWeight: '700',
    },
    eligibilityBadge: {
        paddingHorizontal: getPadding(12),
        paddingVertical: getPadding(6),
        borderRadius: 12,
    },
    eligibilityText: {
        fontSize: getFontSize(14),
        fontWeight: '600',
    },
    summaryNote: {
        fontSize: getFontSize(12),
        color: colors.textSecondary,
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: getMargin(8),
    },
    tableCard: {
        marginHorizontal: getMargin(16),
        marginBottom: getMargin(16),
        padding: getPadding(8),
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.primary + '15',
        paddingVertical: getPadding(12),
        paddingHorizontal: getPadding(8),
        borderRadius: 8,
        marginBottom: getMargin(8),
    },
    tableHeaderText: {
        fontSize: getFontSize(11),
        fontWeight: '700',
        color: colors.textPrimary,
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: getPadding(12),
        paddingHorizontal: getPadding(8),
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
        alignItems: 'center',
    },
    tableCell: {
        fontSize: getFontSize(12),
        color: colors.textPrimary,
    },
    colSubject: {
        width: '30%',
        textAlign: 'left',
    },
    colTotal: {
        width: '12%',
        textAlign: 'center',
    },
    colAttended: {
        width: '12%',
        textAlign: 'center',
    },
    colNotAttended: {
        width: '14%',
        textAlign: 'center',
    },
    colPercentage: {
        width: '16%',
        textAlign: 'center',
    },
    colEligible: {
        width: '16%',
        textAlign: 'center',
    },
    subjectCode: {
        fontSize: getFontSize(11),
        fontWeight: '600',
        color: colors.textPrimary,
    },
    subjectName: {
        fontSize: getFontSize(10),
        color: colors.textSecondary,
        marginTop: getMargin(2),
    },
    percentageText: {
        fontSize: getFontSize(12),
        fontWeight: '600',
    },
    eligibleBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    eligibleText: {
        fontSize: getFontSize(14),
        fontWeight: 'bold',
    },
    emptyRow: {
        padding: getPadding(20),
        alignItems: 'center',
    },
    emptyText: {
        fontSize: getFontSize(14),
        color: colors.textSecondary,
    },
    infoCard: {
        marginHorizontal: getMargin(16),
        marginBottom: getMargin(100),
        padding: getPadding(12),
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: getMargin(8),
    },
    infoText: {
        flex: 1,
        fontSize: getFontSize(12),
        color: colors.textSecondary,
        lineHeight: 18,
    },
});

export default StudentAttendance;

