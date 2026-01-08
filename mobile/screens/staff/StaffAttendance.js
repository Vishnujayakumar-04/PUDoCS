import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Modal,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendanceService';
import { officeService } from '../../services/officeService';
import { studentService } from '../../services/studentService';
import PremiumHeader from '../../components/PremiumHeader';
import PremiumCard from '../../components/PremiumCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import CustomPicker from '../../components/CustomPicker';
import colors from '../../styles/colors';
import { moderateScale, getFontSize, getPadding, getMargin } from '../../utils/responsive';

const StaffAttendance = ({ navigation }) => {
    const { user } = useAuth();
    const [view, setView] = useState('landing'); // 'landing' | 'ug' | 'pg' | 'class' | 'mark'
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [markingAttendance, setMarkingAttendance] = useState(false);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceMap, setAttendanceMap] = useState({});

    useEffect(() => {
        if (view === 'class' && selectedClass) {
            loadClassData();
        }
    }, [view, selectedClass]);

    const loadClassData = async () => {
        setLoading(true);
        try {
            // Get students
            const allStudents = await officeService.getStudents();
            const filtered = allStudents.filter(s => {
                const sProgram = (s.program || '').toLowerCase();
                const sYear = s.year || '';
                const normalizedYear = typeof sYear === 'string' ? 
                    (sYear === 'I' ? 1 : sYear === 'II' ? 2 : sYear === 'III' ? 3 : sYear === 'IV' ? 4 : parseInt(sYear, 10)) : 
                    sYear;
                
                const targetYear = typeof selectedClass.year === 'string' ? 
                    (selectedClass.year === 'I' ? 1 : selectedClass.year === 'II' ? 2 : selectedClass.year === 'III' ? 3 : selectedClass.year === 'IV' ? 4 : parseInt(selectedClass.year, 10)) : 
                    selectedClass.year;
                
                const programMatch = sProgram.includes(selectedClass.name.toLowerCase()) || 
                                   (selectedClass.name === 'B.Tech' && (sProgram.includes('btech') || sProgram.includes('b.tech')) && sProgram.includes('cse')) ||
                                   (selectedClass.name === 'B.Sc CS' && (sProgram.includes('bsc') || sProgram.includes('b.sc'))) ||
                                   (selectedClass.name === 'M.Sc CS' && (sProgram.includes('msc') || sProgram.includes('m.sc')) && !sProgram.includes('integrated') && !sProgram.includes('data')) ||
                                   (selectedClass.name === 'M.Tech DS' && (sProgram.includes('mtech') || sProgram.includes('m.tech')) && (sProgram.includes('data science') || sProgram.includes('data analytics') || sProgram.includes('da'))) ||
                                   (selectedClass.name === 'M.Tech CSE' && (sProgram.includes('mtech') || sProgram.includes('m.tech')) && sProgram.includes('cse')) ||
                                   (selectedClass.name === 'M.Sc Data Analytics' && (sProgram.includes('msc') || sProgram.includes('m.sc')) && (sProgram.includes('data') || sProgram.includes('analytics'))) ||
                                   (selectedClass.name === 'M.Sc CS Integrated' && (sProgram.includes('msc') || sProgram.includes('m.sc')) && sProgram.includes('integrated')) ||
                                   (selectedClass.name === 'MCA' && sProgram.includes('mca'));
                
                return programMatch && normalizedYear === targetYear;
            });
            setStudents(filtered);

            // Get subjects from timetable
            const timetableSubjects = await attendanceService.getStudentSubjects(
                selectedClass.name,
                selectedClass.year
            );
            setSubjects(timetableSubjects);

            // Initialize attendance map (all Present by default)
            const initialMap = {};
            filtered.forEach(student => {
                const studentId = student.id || student._id || student.registerNumber;
                initialMap[studentId] = 'Present';
            });
            setAttendanceMap(initialMap);
        } catch (error) {
            console.error('Error loading class data:', error);
            Alert.alert('Error', 'Failed to load class data');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (view === 'mark') {
            setView('class');
            setSelectedSubject(null);
        } else if (view === 'class') {
            setView(selectedClass?.category === 'UG' ? 'ug' : 'pg');
            setSelectedClass(null);
        } else if (view === 'ug' || view === 'pg') {
            setView('landing');
        }
    };

    const handleClassSelect = (classItem) => {
        setSelectedClass(classItem);
        setView('class');
    };

    const handleSubjectSelect = (subject) => {
        setSelectedSubject(subject);
        setView('mark');
    };

    const toggleStudentAttendance = (studentId) => {
        setAttendanceMap(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present'
        }));
    };

    const handleSaveAttendance = async () => {
        if (!selectedSubject) {
            Alert.alert('Error', 'Please select a subject');
            return;
        }

        setMarkingAttendance(true);
        try {
            const markedBy = user?.email || user?.uid || 'Staff';
            let successCount = 0;
            let errorCount = 0;

            // Mark attendance for each student one by one
            for (const student of students) {
                const studentId = student.id || student._id || student.registerNumber;
                const status = attendanceMap[studentId] || 'Absent';
                
                try {
                    await attendanceService.addAttendanceRecord(
                        studentId,
                        selectedSubject.code,
                        selectedSubject.name,
                        attendanceDate,
                        status,
                        markedBy
                    );
                    successCount++;
                } catch (error) {
                    console.error(`Error marking attendance for ${studentId}:`, error);
                    errorCount++;
                }
            }

            if (successCount > 0) {
                Alert.alert(
                    'Success',
                    `Attendance marked for ${successCount} student(s)${errorCount > 0 ? `\n${errorCount} failed` : ''}`
                );
                // Reset and go back
                setView('class');
                setSelectedSubject(null);
                setAttendanceMap({});
            } else {
                Alert.alert('Error', 'Failed to mark attendance for all students');
            }
        } catch (error) {
            console.error('Error saving attendance:', error);
            Alert.alert('Error', 'Failed to save attendance');
        } finally {
            setMarkingAttendance(false);
        }
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
                title="B.Tech CSE Programs"
                items={[
                    { label: 'B.Tech CSE – 1st Year', name: 'B.Tech', year: 1, category: 'UG' },
                    { label: 'B.Tech CSE – 2nd Year', name: 'B.Tech', year: 2, category: 'UG' },
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
                    { label: 'M.Tech Data Science – 1st Year', name: 'M.Tech DS', year: 1, category: 'PG' },
                    { label: 'M.Tech CSE – 1st Year', name: 'M.Tech CSE', year: 1, category: 'PG' },
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

        return (
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <PremiumCard style={styles.classHeaderCard}>
                    <Text style={styles.classTitle}>{selectedClass?.label}</Text>
                    <Text style={styles.classSubtitle}>Select Subject to Mark Attendance</Text>
                </PremiumCard>

                {subjects.length === 0 ? (
                    <PremiumCard style={styles.emptyCard}>
                        <Text style={styles.emptyText}>No subjects found for this class</Text>
                    </PremiumCard>
                ) : (
                    subjects.map((subject, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.subjectCard}
                            onPress={() => handleSubjectSelect(subject)}
                            activeOpacity={0.7}
                        >
                            <PremiumCard style={styles.subjectCardContent}>
                                <View style={styles.subjectInfo}>
                                    <Text style={styles.subjectCode}>{subject.code}</Text>
                                    <Text style={styles.subjectName}>{subject.name}</Text>
                                    <Text style={styles.subjectDetails}>
                                        {subject.credits} Credits • {subject.type}
                                    </Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={24} color={colors.primary} />
                            </PremiumCard>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        );
    };

    const renderMarkAttendance = () => {
        const presentCount = Object.values(attendanceMap).filter(s => s === 'Present').length;
        const absentCount = students.length - presentCount;

        return (
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <PremiumCard style={styles.markHeaderCard}>
                    <Text style={styles.markTitle}>Mark Attendance</Text>
                    <Text style={styles.markSubtitle}>{selectedSubject?.code} - {selectedSubject?.name}</Text>
                    <Text style={styles.markSubtitle}>{selectedClass?.label}</Text>
                </PremiumCard>

                <PremiumCard style={styles.dateCard}>
                    <Text style={styles.dateLabel}>Date</Text>
                    <TextInput
                        style={styles.dateInput}
                        value={attendanceDate}
                        onChangeText={setAttendanceDate}
                        placeholder="YYYY-MM-DD"
                    />
                </PremiumCard>

                <PremiumCard style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Total</Text>
                            <Text style={styles.summaryValue}>{students.length}</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Present</Text>
                            <Text style={[styles.summaryValue, { color: colors.success }]}>{presentCount}</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Absent</Text>
                            <Text style={[styles.summaryValue, { color: colors.error }]}>{absentCount}</Text>
                        </View>
                    </View>
                </PremiumCard>

                <PremiumCard style={styles.studentsCard}>
                    <Text style={styles.studentsTitle}>Students</Text>
                    {students.map((student, index) => {
                        const studentId = student.id || student._id || student.registerNumber;
                        const status = attendanceMap[studentId] || 'Present';
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.studentRow,
                                    status === 'Absent' && styles.studentRowAbsent
                                ]}
                                onPress={() => toggleStudentAttendance(studentId)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.studentInfo}>
                                    <Text style={styles.studentName}>{student.name}</Text>
                                    <Text style={styles.studentRegNo}>{student.registerNumber}</Text>
                                </View>
                                <View style={[
                                    styles.statusBadge,
                                    { backgroundColor: status === 'Present' ? colors.success : colors.error }
                                ]}>
                                    <Text style={styles.statusText}>
                                        {status === 'Present' ? '✓' : '✗'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </PremiumCard>

                <TouchableOpacity
                    style={[styles.saveButton, markingAttendance && styles.saveButtonDisabled]}
                    onPress={handleSaveAttendance}
                    disabled={markingAttendance}
                >
                    <MaterialCommunityIcons name="check-circle" size={20} color={colors.white} />
                    <Text style={styles.saveButtonText}>
                        {markingAttendance ? 'Saving...' : 'Save Attendance'}
                    </Text>
                </TouchableOpacity>
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
                                {view === 'landing' ? 'Mark Attendance' :
                                    view === 'ug' ? 'UG Programs' :
                                        view === 'pg' ? 'PG Programs' :
                                            view === 'class' ? selectedClass?.label :
                                                'Mark Attendance'}
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
                {view === 'mark' && renderMarkAttendance()}
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
    subjectCard: {
        marginHorizontal: getMargin(16),
        marginBottom: getMargin(12),
    },
    subjectCardContent: {
        padding: getPadding(16),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    subjectInfo: {
        flex: 1,
    },
    subjectCode: {
        fontSize: getFontSize(16),
        fontWeight: '700',
        color: colors.textPrimary,
    },
    subjectName: {
        fontSize: getFontSize(14),
        color: colors.textSecondary,
        marginTop: getMargin(4),
    },
    subjectDetails: {
        fontSize: getFontSize(12),
        color: colors.textLight,
        marginTop: getMargin(2),
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
    markHeaderCard: {
        margin: getMargin(16),
        padding: getPadding(16),
        alignItems: 'center',
    },
    markTitle: {
        fontSize: getFontSize(20),
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: getMargin(8),
    },
    markSubtitle: {
        fontSize: getFontSize(14),
        color: colors.textSecondary,
        marginBottom: getMargin(4),
    },
    dateCard: {
        marginHorizontal: getMargin(16),
        marginBottom: getMargin(16),
        padding: getPadding(16),
    },
    dateLabel: {
        fontSize: getFontSize(14),
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: getMargin(8),
    },
    dateInput: {
        backgroundColor: colors.gray100,
        borderRadius: 8,
        padding: getPadding(12),
        fontSize: getFontSize(16),
        color: colors.textPrimary,
    },
    summaryCard: {
        marginHorizontal: getMargin(16),
        marginBottom: getMargin(16),
        padding: getPadding(16),
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: getFontSize(12),
        color: colors.textSecondary,
        marginBottom: getMargin(4),
    },
    summaryValue: {
        fontSize: getFontSize(24),
        fontWeight: '700',
        color: colors.textPrimary,
    },
    studentsCard: {
        marginHorizontal: getMargin(16),
        marginBottom: getMargin(16),
        padding: getPadding(16),
    },
    studentsTitle: {
        fontSize: getFontSize(18),
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: getMargin(12),
    },
    studentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: getPadding(12),
        paddingHorizontal: getPadding(8),
        marginBottom: getMargin(8),
        borderRadius: 8,
        backgroundColor: colors.gray50,
        borderWidth: 2,
        borderColor: colors.success,
    },
    studentRowAbsent: {
        borderColor: colors.error,
        backgroundColor: colors.error + '10',
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: getFontSize(16),
        fontWeight: '600',
        color: colors.textPrimary,
    },
    studentRegNo: {
        fontSize: getFontSize(14),
        color: colors.textSecondary,
        marginTop: getMargin(2),
    },
    statusBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusText: {
        fontSize: getFontSize(18),
        color: colors.white,
        fontWeight: 'bold',
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        marginHorizontal: getMargin(16),
        marginBottom: getMargin(100),
        paddingVertical: getPadding(16),
        borderRadius: 12,
        gap: getMargin(8),
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        fontSize: getFontSize(16),
        fontWeight: '600',
        color: colors.white,
    },
});

export default StaffAttendance;
