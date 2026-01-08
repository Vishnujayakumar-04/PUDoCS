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
import { attendanceService } from '../../services/attendanceService';
import { officeService } from '../../services/officeService';
import PremiumHeader from '../../components/PremiumHeader';
import PremiumCard from '../../components/PremiumCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';
import { moderateScale, getFontSize, getPadding, getMargin } from '../../utils/responsive';

const OfficeAttendance = ({ navigation }) => {
    const [view, setView] = useState('landing'); // 'landing' | 'ug' | 'pg' | 'class'
    const [selectedClass, setSelectedClass] = useState(null);
    const [studentsWithAttendance, setStudentsWithAttendance] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (view === 'class' && selectedClass) {
            loadClassAttendance();
        }
    }, [view, selectedClass]);

    const loadClassAttendance = async () => {
        setLoading(true);
        try {
            const data = await attendanceService.getClassAttendance(
                selectedClass.name,
                selectedClass.year
            );
            setStudentsWithAttendance(data);
        } catch (error) {
            console.error('Error loading class attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (view === 'class') {
            setView(selectedClass?.category === 'UG' ? 'ug' : 'pg');
            setSelectedClass(null);
            setStudentsWithAttendance([]);
        } else if (view === 'ug' || view === 'pg') {
            setView('landing');
        }
    };

    const handleClassSelect = (classItem) => {
        setSelectedClass(classItem);
        setView('class');
    };

    const ProgramSection = ({ title, items }) => (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {items.map((item, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.listItem}
                    onPress={() => handleClassSelect(item)}
                >
                    <View style={styles.listItemContent}>
                        <Text style={styles.listItemText}>{item.label}</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.gray400} />
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderLanding = () => (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.landingContainer}>
                <TouchableOpacity
                    style={styles.categoryCard}
                    onPress={() => setView('ug')}
                    activeOpacity={0.7}
                >
                    <LinearGradient
                        colors={[colors.primary, colors.secondary]}
                        style={styles.categoryGradient}
                    >
                        <MaterialCommunityIcons name="school" size={48} color={colors.white} />
                        <Text style={styles.categoryTitle}>Undergraduate (UG)</Text>
                        <Text style={styles.categorySubtitle}>B.Tech & B.Sc Programs</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.categoryCard}
                    onPress={() => setView('pg')}
                    activeOpacity={0.7}
                >
                    <LinearGradient
                        colors={[colors.accent, colors.info]}
                        style={styles.categoryGradient}
                    >
                        <MaterialCommunityIcons name="school-outline" size={48} color={colors.white} />
                        <Text style={styles.categoryTitle}>Postgraduate (PG)</Text>
                        <Text style={styles.categorySubtitle}>M.Sc, M.Tech & MCA Programs</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    const renderUGSelection = () => (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <ProgramSection
                title="B.Tech Programs"
                items={[
                    { label: 'B.Tech – 1st Year', name: 'B.Tech', year: 1, category: 'UG' },
                    { label: 'B.Tech – 2nd Year', name: 'B.Tech', year: 2, category: 'UG' },
                    { label: 'B.Tech – 3rd Year', name: 'B.Tech', year: 3, category: 'UG' },
                    { label: 'B.Tech – 4th Year', name: 'B.Tech', year: 4, category: 'UG' },
                ]}
            />
            <ProgramSection
                title="B.Sc Computer Science"
                items={[
                    { label: 'B.Sc CS – 1st Year', name: 'B.Sc CS', year: 1, category: 'UG' },
                    { label: 'B.Sc CS – 2nd Year', name: 'B.Sc CS', year: 2, category: 'UG' },
                    { label: 'B.Sc CS – 3rd Year', name: 'B.Sc CS', year: 3, category: 'UG' },
                ]}
            />
        </ScrollView>
    );

    const renderPGSelection = () => (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <ProgramSection
                title="M.Tech Programs"
                items={[
                    { label: 'M.Tech Data Science & AI – 1st Year', name: 'M.Tech DS', year: 1, category: 'PG' },
                    { label: 'M.Tech CSE – 1st Year', name: 'M.Tech CSE', year: 1, category: 'PG' },
                    { label: 'M.Tech CSE – 2nd Year', name: 'M.Tech CSE', year: 2, category: 'PG' },
                    { label: 'M.Tech NIS – 2nd Year', name: 'M.Tech NIS', year: 2, category: 'PG' },
                ]}
            />
            <ProgramSection
                title="M.Sc Programs"
                items={[
                    { label: 'M.Sc CS – 2nd Year', name: 'M.Sc CS', year: 2, category: 'PG' },
                    { label: 'M.Sc Data Analytics – 1st Year', name: 'M.Sc Data Analytics', year: 1, category: 'PG' },
                    { label: 'M.Sc CS Integrated – 1st Year', name: 'M.Sc CS Integrated', year: 1, category: 'PG' },
                ]}
            />
            <ProgramSection
                title="MCA Programs"
                items={[
                    { label: 'MCA – 1st Year', name: 'MCA', year: 1, category: 'PG' },
                    { label: 'MCA – 2nd Year', name: 'MCA', year: 2, category: 'PG' },
                ]}
            />
        </ScrollView>
    );

    const renderClassView = () => {
        if (loading) {
            return <LoadingSpinner />;
        }

        // Calculate class statistics
        const totalStudents = studentsWithAttendance.length;
        let eligibleCount = 0;
        let notEligibleCount = 0;

        studentsWithAttendance.forEach(student => {
            const overallAttendance = student.attendance?.reduce((sum, subj) => {
                const credits = subj.credits || 3;
                return sum + (subj.attendancePercentage * credits);
            }, 0) / (student.attendance?.reduce((sum, subj) => sum + (subj.credits || 3), 0) || 1);
            
            if (overallAttendance >= 75) {
                eligibleCount++;
            } else {
                notEligibleCount++;
            }
        });

        return (
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <PremiumCard style={styles.classHeaderCard}>
                    <Text style={styles.classTitle}>{selectedClass?.label}</Text>
                    <Text style={styles.classSubtitle}>Attendance Overview</Text>
                </PremiumCard>

                <PremiumCard style={styles.statsCard}>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Total Students</Text>
                            <Text style={styles.statValue}>{totalStudents}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Eligible</Text>
                            <Text style={[styles.statValue, { color: colors.success }]}>{eligibleCount}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Not Eligible</Text>
                            <Text style={[styles.statValue, { color: colors.error }]}>{notEligibleCount}</Text>
                        </View>
                    </View>
                </PremiumCard>

                {studentsWithAttendance.length === 0 ? (
                    <PremiumCard style={styles.emptyCard}>
                        <Text style={styles.emptyText}>No students found</Text>
                    </PremiumCard>
                ) : (
                    studentsWithAttendance.map((student, index) => {
                        // Calculate overall attendance
                        const overallAttendance = student.attendance?.reduce((sum, subj) => {
                            const credits = subj.credits || 3;
                            return sum + (subj.attendancePercentage * credits);
                        }, 0) / (student.attendance?.reduce((sum, subj) => sum + (subj.credits || 3), 0) || 1);
                        const overall = Math.round(overallAttendance * 100) / 100;
                        const isEligible = overall >= 75;

                        return (
                            <PremiumCard key={index} style={styles.studentCard}>
                                <View style={styles.studentHeader}>
                                    <View>
                                        <Text style={styles.studentName}>{student.name}</Text>
                                        <Text style={styles.studentRegNo}>{student.registerNumber}</Text>
                                    </View>
                                    <View style={[
                                        styles.overallBadge,
                                        { backgroundColor: isEligible ? colors.success + '20' : colors.error + '20' }
                                    ]}>
                                        <Text style={[
                                            styles.overallText,
                                            { color: isEligible ? colors.success : colors.error }
                                        ]}>
                                            {overall}%
                                        </Text>
                                        <Text style={[
                                            styles.eligibleText,
                                            { color: isEligible ? colors.success : colors.error }
                                        ]}>
                                            {isEligible ? 'Eligible' : 'Not Eligible'}
                                        </Text>
                                    </View>
                                </View>

                                {/* Subject-wise attendance table */}
                                {student.attendance && student.attendance.length > 0 && (
                                    <View style={styles.attendanceTable}>
                                        <View style={styles.tableHeader}>
                                            <Text style={[styles.tableHeaderText, styles.colSubject]}>Subject</Text>
                                            <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
                                            <Text style={[styles.tableHeaderText, styles.colAttended]}>Attended</Text>
                                            <Text style={[styles.tableHeaderText, styles.colNotAttended]}>Not Attended</Text>
                                            <Text style={[styles.tableHeaderText, styles.colPercentage]}>%</Text>
                                            <Text style={[styles.tableHeaderText, styles.colEligible]}>Eligible</Text>
                                        </View>
                                        {student.attendance.map((subject, subIndex) => (
                                            <View key={subIndex} style={styles.tableRow}>
                                                <View style={[styles.tableCell, styles.colSubject]}>
                                                    <Text style={styles.subjectCode} numberOfLines={1}>{subject.code}</Text>
                                                </View>
                                                <Text style={[styles.tableCell, styles.colTotal]}>{subject.totalClasses}</Text>
                                                <Text style={[styles.tableCell, styles.colAttended]}>{subject.attendedClasses}</Text>
                                                <Text style={[styles.tableCell, styles.colNotAttended]}>{subject.notAttendedClasses}</Text>
                                                <Text style={[
                                                    styles.tableCell,
                                                    styles.colPercentage,
                                                    { color: subject.attendancePercentage >= 75 ? colors.success : colors.error }
                                                ]}>
                                                    {subject.attendancePercentage}%
                                                </Text>
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
                                        ))}
                                    </View>
                                )}
                            </PremiumCard>
                        );
                    })
                )}
            </ScrollView>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.header}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        {view !== 'landing' && (
                            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                                <MaterialCommunityIcons name="arrow-left" size={24} color={colors.white} />
                            </TouchableOpacity>
                        )}
                        <View style={styles.titleContainer}>
                            <Text style={styles.headerTitle}>
                                {view === 'landing' ? 'Attendance Management' :
                                    view === 'ug' ? 'UG Programs' :
                                        view === 'pg' ? 'PG Programs' :
                                            selectedClass?.label}
                            </Text>
                        </View>
                        <View style={styles.headerRight} />
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <View style={styles.content}>
                {view === 'landing' && renderLanding()}
                {view === 'ug' && renderUGSelection()}
                {view === 'pg' && renderPGSelection()}
                {view === 'class' && renderClassView()}
            </View>
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
    content: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    landingContainer: {
        padding: getPadding(16),
        gap: 16,
    },
    categoryCard: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: getMargin(16),
    },
    categoryGradient: {
        padding: getPadding(32),
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryTitle: {
        fontSize: getFontSize(24),
        fontWeight: '700',
        color: colors.white,
        marginTop: getMargin(12),
    },
    categorySubtitle: {
        fontSize: getFontSize(14),
        color: colors.white + 'CC',
        marginTop: getMargin(4),
    },
    sectionContainer: {
        marginBottom: getMargin(24),
    },
    sectionTitle: {
        fontSize: getFontSize(18),
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: getMargin(12),
        paddingHorizontal: getPadding(16),
    },
    listItem: {
        backgroundColor: colors.white,
        marginHorizontal: getMargin(16),
        marginBottom: getMargin(8),
        borderRadius: 12,
        overflow: 'hidden',
    },
    listItemContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: getPadding(16),
    },
    listItemText: {
        fontSize: getFontSize(16),
        fontWeight: '500',
        color: colors.textPrimary,
    },
    classHeaderCard: {
        margin: getMargin(16),
        padding: getPadding(16),
        alignItems: 'center',
    },
    classTitle: {
        fontSize: getFontSize(20),
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: getMargin(4),
    },
    classSubtitle: {
        fontSize: getFontSize(14),
        color: colors.textSecondary,
    },
    statsCard: {
        marginHorizontal: getMargin(16),
        marginBottom: getMargin(16),
        padding: getPadding(16),
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: getFontSize(12),
        color: colors.textSecondary,
        marginBottom: getMargin(4),
    },
    statValue: {
        fontSize: getFontSize(20),
        fontWeight: '700',
        color: colors.textPrimary,
    },
    studentCard: {
        marginHorizontal: getMargin(16),
        marginBottom: getMargin(16),
        padding: getPadding(16),
    },
    studentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: getMargin(12),
    },
    studentName: {
        fontSize: getFontSize(16),
        fontWeight: '700',
        color: colors.textPrimary,
    },
    studentRegNo: {
        fontSize: getFontSize(14),
        color: colors.textSecondary,
        marginTop: getMargin(2),
    },
    overallBadge: {
        paddingHorizontal: getPadding(12),
        paddingVertical: getPadding(8),
        borderRadius: 12,
        alignItems: 'center',
    },
    overallText: {
        fontSize: getFontSize(18),
        fontWeight: '700',
    },
    eligibleText: {
        fontSize: getFontSize(10),
        fontWeight: '600',
        marginTop: getMargin(2),
    },
    attendanceTable: {
        marginTop: getMargin(12),
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.primary + '15',
        paddingVertical: getPadding(8),
        paddingHorizontal: getPadding(4),
        borderRadius: 8,
        marginBottom: getMargin(4),
    },
    tableHeaderText: {
        fontSize: getFontSize(10),
        fontWeight: '700',
        color: colors.textPrimary,
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: getPadding(8),
        paddingHorizontal: getPadding(4),
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
        alignItems: 'center',
    },
    tableCell: {
        fontSize: getFontSize(11),
        color: colors.textPrimary,
    },
    colSubject: {
        width: '28%',
        textAlign: 'left',
    },
    colTotal: {
        width: '12%',
        textAlign: 'center',
    },
    colAttended: {
        width: '14%',
        textAlign: 'center',
    },
    colNotAttended: {
        width: '16%',
        textAlign: 'center',
    },
    colPercentage: {
        width: '14%',
        textAlign: 'center',
        fontWeight: '600',
    },
    colEligible: {
        width: '16%',
        textAlign: 'center',
    },
    subjectCode: {
        fontSize: getFontSize(10),
        fontWeight: '600',
        color: colors.textPrimary,
    },
    eligibleBadge: {
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    emptyCard: {
        margin: getMargin(16),
        padding: getPadding(32),
        alignItems: 'center',
    },
    emptyText: {
        fontSize: getFontSize(14),
        color: colors.textSecondary,
    },
});

export default OfficeAttendance;

