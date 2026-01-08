import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import { getDefaultSubjects } from '../../utils/defaultSubjects';
import colors from '../../styles/colors';

const { width } = Dimensions.get('window');

const StudentResults = () => {
    const { user } = useAuth();
    // category: 'internal' | 'assignment'
    const [category, setCategory] = useState('internal');
    // view: 'select' | 'summary' | 'details'
    const [view, setView] = useState('select');
    const [selectedSem, setSelectedSem] = useState(null);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [results, setResults] = useState(null);
    const [internalMarks, setInternalMarks] = useState([]);
    const [assignmentMarks, setAssignmentMarks] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadAllData();
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, []);

    useEffect(() => {
        // Always show summary view for internal and assignment marks
        setView('summary');
    }, [category]);

    const loadAllData = async () => {
        if (!user?.uid) {
            setLoading(false);
            return;
        }
        
        try {
            setRefreshing(true);
            const [resultsData, internalData, assignmentData, profileData] = await Promise.all([
                studentService.getResults(user.uid),
                studentService.getInternalMarks(user.uid, user.email),
                studentService.getAssignmentMarks(user.uid, user.email),
                studentService.getProfile(user.uid, user.email)
            ]);
            setResults(resultsData);
            setProfile(profileData);
            
            // Merge default subjects with actual marks data
            if (profileData?.program && profileData?.year) {
                console.log('📊 Loading marks for:', {
                    program: profileData.program,
                    year: profileData.year,
                    registerNumber: profileData.registerNumber
                });
                
                // Check if student is 2nd year (M.Sc CS II or MCA II) - they only have projects, no marks
                const isSecondYear = profileData && (
                    (profileData.program === 'M.Sc CS' && (profileData.year === 'II' || profileData.year === 2)) ||
                    (profileData.program === 'MCA' && (profileData.year === 'II' || profileData.year === 2))
                );
                
                if (isSecondYear) {
                    console.log('📊 2nd Year student - No internal/assignment marks (project work only)');
                    setInternalMarks([]);
                    setAssignmentMarks([]);
                    setLoading(false);
                    return;
                }
                
                const defaultSubjects = getDefaultSubjects(profileData.program, profileData.year);
                console.log('📊 Default subjects:', defaultSubjects.length);
                console.log('📊 Internal marks received:', internalData.length);
                console.log('📊 Assignment marks received:', assignmentData.length);
                
                // For internal marks - merge with defaults
                const mergedInternal = defaultSubjects.map(defaultSubj => {
                    const existingMark = internalData.find(mark => 
                        (mark.subjectCode || mark.code) === defaultSubj.code ||
                        (mark.subjectName || mark.subject) === defaultSubj.name
                    );
                    return existingMark || {
                        subjectCode: defaultSubj.code,
                        code: defaultSubj.code,
                        subjectName: defaultSubj.name,
                        subject: defaultSubj.name,
                        totalMark: null,
                        maxMarks: null,
                        markSecured: null,
                        marks: null,
                    };
                });
                setInternalMarks(mergedInternal);
                
                // For assignment marks - merge with defaults
                const mergedAssignment = defaultSubjects.map(defaultSubj => {
                    const existingMark = assignmentData.find(mark => 
                        (mark.subjectCode || mark.code) === defaultSubj.code ||
                        (mark.subjectName || mark.subject) === defaultSubj.name
                    );
                    return existingMark || {
                        subjectCode: defaultSubj.code,
                        code: defaultSubj.code,
                        subjectName: defaultSubj.name,
                        subject: defaultSubj.name,
                        totalMark: null,
                        maxMarks: null,
                        markSecured: null,
                        marks: null,
                    };
                });
                setAssignmentMarks(mergedAssignment);
            } else {
                setInternalMarks(internalData);
                setAssignmentMarks(assignmentData);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const loadResults = loadAllData;

    const formatDate = (dateValue) => {
        if (!dateValue) return '';
        try {
            if (dateValue.toDate) return dateValue.toDate().toLocaleDateString();
            return new Date(dateValue).toLocaleDateString();
        } catch (e) {
            return dateValue.toString();
        }
    };

    // Calculate semester GPA
    const calculateSemesterGPA = (subjects) => {
        if (!subjects || !Array.isArray(subjects) || subjects.length === 0) return '--';
        
        let totalCredits = 0;
        let totalPoints = 0;
        
        subjects.forEach(subject => {
            const credits = subject.credits || 0;
            const points = subject.points || 0;
            totalCredits += credits;
            totalPoints += (points * credits);
        });
        
        if (totalCredits === 0) return '--';
        return (totalPoints / totalCredits).toFixed(2);
    };

    const getStatus = (subjects) => {
        if (!subjects || !Array.isArray(subjects) || subjects.length === 0) return 'In Progress';
        
        // Check if all subjects have grades
        const allGraded = subjects.every(s => s.grade && s.grade !== '--' && s.grade !== '');
        return allGraded ? 'Passed' : 'In Progress';
    };

    const semesters = results?.semesters?.map((sem, index) => ({
        id: sem.id || index + 1,
        name: `Semester ${sem.semester || index + 1}`,
        gpa: calculateSemesterGPA(sem.subjects),
        status: getStatus(sem.subjects),
        data: sem,
    })) || [];

    const handleSemSelect = (sem) => {
        setSelectedSem(sem);
        setView('summary');
    };

    const renderSelection = () => (
        <Animated.ScrollView 
            style={[styles.viewContainer, { opacity: fadeAnim }]} 
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={loadResults} />
            }
        >
            <Text style={styles.sectionTitle}>Select Semester</Text>
            {semesters.length === 0 ? (
                <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="file-document-outline" size={60} color={colors.gray300} />
                    <Text style={styles.emptyText}>No results available yet</Text>
                    <Text style={styles.emptySubtext}>Results will appear here once published</Text>
                </View>
            ) : (
                semesters.map((sem, index) => (
                    <TouchableOpacity key={sem.id || index} style={styles.semCard} onPress={() => handleSemSelect(sem)}>
                        <View style={styles.semInfo}>
                            <Text style={styles.semName}>{sem.name}</Text>
                            <Text style={styles.semStatus}>{sem.status}</Text>
                        </View>
                        <View style={styles.semPerformance}>
                            <Text style={styles.gpaText}>{sem.gpa}</Text>
                            <Text style={styles.gpaLabel}>GPA</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color={colors.gray400} />
                    </TouchableOpacity>
                ))
            )}
        </Animated.ScrollView>
    );

    const renderSummary = () => {
        const semData = selectedSem?.data;
        const subjects = semData?.subjects || [];
        
        return (
            <Animated.ScrollView style={[styles.viewContainer, { opacity: fadeAnim }]} showsVerticalScrollIndicator={false}>
                <View style={styles.summaryHeader}>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Semester GPA</Text>
                        <Text style={styles.summaryValue}>{selectedSem?.gpa || '--'}</Text>
                    </View>
                    <View style={[styles.summaryCard, { backgroundColor: '#F0FDF4' }]}>
                        <Text style={[styles.summaryLabel, { color: '#16A34A' }]}>CGPA</Text>
                        <Text style={[styles.summaryValue, { color: '#16A34A' }]}>
                            {results?.cgpa?.toFixed(2) || '0.00'}
                        </Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Subject-wise Results</Text>
                {subjects.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={40} color={colors.gray300} />
                        <Text style={styles.emptyText}>Detailed results pending</Text>
                    </View>
                ) : (
                    subjects.map((subject, index) => (
                        <View key={index} style={styles.resultRow}>
                            <View style={styles.resIcon}>
                                <Text style={styles.resGrade}>{subject.grade || '--'}</Text>
                            </View>
                            <View style={styles.resInfo}>
                                <Text style={styles.resName}>{subject.name || subject.subject || 'N/A'}</Text>
                                <Text style={styles.resCode}>
                                    {subject.code || ''} {subject.code && '•'} {subject.credits || 0} Credits
                                </Text>
                            </View>
                            <View style={styles.resPoints}>
                                <Text style={styles.pointsValue}>{subject.points || '--'}</Text>
                                <Text style={styles.pointsLabel}>Points</Text>
                            </View>
                        </View>
                    ))
                )}

                {subjects.length > 0 && (
                    <TouchableOpacity style={styles.downloadBtn}>
                        <MaterialCommunityIcons name="file-pdf-box" size={24} color={colors.white} />
                        <Text style={styles.downloadBtnText}>Download Marksheet (PDF)</Text>
                    </TouchableOpacity>
                )}
            </Animated.ScrollView>
        );
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    const renderInternalMarks = () => {
        // Always show table with default subjects if available
        const marksToShow = internalMarks && internalMarks.length > 0 ? internalMarks : [];

        return (
            <Animated.ScrollView 
                style={[styles.viewContainer, { opacity: fadeAnim }]} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={loadAllData} />
                }
            >
                <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.horizontalScroll}>
                    <View style={styles.tableContainer}>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderText, styles.tableCellSNo]}>S.No</Text>
                            <Text style={[styles.tableHeaderText, styles.tableCellSubjectCode]}>Subject Code</Text>
                            <Text style={[styles.tableHeaderText, styles.tableCellSubjectName]}>Subject Name</Text>
                            <Text style={[styles.tableHeaderText, styles.tableCellMark]}>Total Marks</Text>
                            <Text style={[styles.tableHeaderText, styles.tableCellMark]}>Mark Secured</Text>
                        </View>
                        {marksToShow.length === 0 ? (
                            <View style={styles.emptyTableRow}>
                                <Text style={[styles.emptyTableText, { flex: 1, textAlign: 'center' }]}>
                                    No internal marks available yet
                                </Text>
                            </View>
                        ) : (
                            marksToShow.map((mark, index) => (
                                <View key={mark.id || mark.subjectCode || mark.code || index} style={styles.tableRow}>
                                    <Text style={[styles.tableCellText, styles.tableCellSNo]}>{index + 1}</Text>
                                    <Text style={[styles.tableCellText, styles.tableCellSubjectCode]} numberOfLines={1}>{mark.subjectCode || mark.code || 'N/A'}</Text>
                                    <Text style={[styles.tableCellText, styles.tableCellSubjectName]} numberOfLines={1}>{mark.subjectName || mark.subject || 'N/A'}</Text>
                                    <Text style={[styles.tableCellText, styles.tableCellMark]}>{mark.totalMark || mark.maxMarks || '--'}</Text>
                                    <Text style={[styles.tableCellText, styles.tableCellBold, styles.tableCellMark]}>{mark.markSecured || mark.marks || '--'}</Text>
                                </View>
                            ))
                        )}
                    </View>
                </ScrollView>
            </Animated.ScrollView>
        );
    };

    const renderAssignmentMarks = () => {
        // Always show table with default subjects if available
        const marksToShow = assignmentMarks && assignmentMarks.length > 0 ? assignmentMarks : [];

        return (
            <Animated.ScrollView 
                style={[styles.viewContainer, { opacity: fadeAnim }]} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={loadAllData} />
                }
            >
                <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.horizontalScroll}>
                    <View style={styles.tableContainer}>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderText, styles.tableCellSNo]}>S.No</Text>
                            <Text style={[styles.tableHeaderText, styles.tableCellSubjectCode]}>Subject Code</Text>
                            <Text style={[styles.tableHeaderText, styles.tableCellSubjectName]}>Subject Name</Text>
                            <Text style={[styles.tableHeaderText, styles.tableCellMark]}>Total Marks</Text>
                            <Text style={[styles.tableHeaderText, styles.tableCellMark]}>Mark Secured</Text>
                        </View>
                        {marksToShow.length === 0 ? (
                            <View style={styles.emptyTableRow}>
                                <Text style={[styles.emptyTableText, { flex: 1, textAlign: 'center' }]}>
                                    No assignment marks available yet
                                </Text>
                            </View>
                        ) : (
                            marksToShow.map((mark, index) => (
                                <View key={mark.id || mark.subjectCode || mark.code || index} style={styles.tableRow}>
                                    <Text style={[styles.tableCellText, styles.tableCellSNo]}>{index + 1}</Text>
                                    <Text style={[styles.tableCellText, styles.tableCellSubjectCode]} numberOfLines={1}>{mark.subjectCode || mark.code || 'N/A'}</Text>
                                    <Text style={[styles.tableCellText, styles.tableCellSubjectName]} numberOfLines={1}>{mark.subjectName || mark.subject || 'N/A'}</Text>
                                    <Text style={[styles.tableCellText, styles.tableCellMark]}>{mark.totalMark || mark.maxMarks || '--'}</Text>
                                    <Text style={[styles.tableCellText, styles.tableCellBold, styles.tableCellMark]}>{mark.markSecured || mark.marks || '--'}</Text>
                                </View>
                            ))
                        )}
                    </View>
                </ScrollView>
            </Animated.ScrollView>
        );
    };

    // Check if student is 2nd year (M.Sc CS II or MCA II) - they only have projects, no marks
    const isSecondYear = profile && (
        (profile.program === 'M.Sc CS' && (profile.year === 'II' || profile.year === 2)) ||
        (profile.program === 'MCA' && (profile.year === 'II' || profile.year === 2))
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.header}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>
                            {isSecondYear ? 'Exam Results' : (category === 'internal' ? 'Internal Marks' : 'Assignment Marks')}
                        </Text>
                        <View style={{ width: 40 }} />
                    </View>
                </SafeAreaView>
            </LinearGradient>

            {isSecondYear ? (
                <View style={styles.content}>
                    <Animated.ScrollView 
                        style={[styles.viewContainer, { opacity: fadeAnim }]} 
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="briefcase-outline" size={60} color={colors.gray300} />
                            <Text style={styles.emptyText}>Project Work Only</Text>
                            <Text style={styles.emptySubtext}>
                                2nd Year students work on projects only.{'\n'}
                                Internal Marks and Assignment Marks are not applicable.
                            </Text>
                        </View>
                    </Animated.ScrollView>
                </View>
            ) : (
                <>
                    {/* Category Tabs */}
                    <View style={styles.categoryTabs}>
                        <TouchableOpacity 
                            style={[styles.categoryTab, category === 'internal' && styles.categoryTabActive]}
                            onPress={() => setCategory('internal')}
                        >
                            <MaterialCommunityIcons 
                                name="file-document-edit-outline" 
                                size={20} 
                                color={category === 'internal' ? colors.primary : colors.gray500} 
                            />
                            <Text style={[styles.categoryTabText, category === 'internal' && styles.categoryTabTextActive]}>
                                Internal Marks
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.categoryTab, category === 'assignment' && styles.categoryTabActive]}
                            onPress={() => setCategory('assignment')}
                        >
                            <MaterialCommunityIcons 
                                name="file-edit-outline" 
                                size={20} 
                                color={category === 'assignment' ? colors.primary : colors.gray500} 
                            />
                            <Text style={[styles.categoryTabText, category === 'assignment' && styles.categoryTabTextActive]}>
                                Assignment Marks
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        {category === 'internal' && renderInternalMarks()}
                        {category === 'assignment' && renderAssignmentMarks()}
                    </View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingBottom: 20,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.white,
    },
    content: {
        flex: 1,
    },
    viewContainer: {
        flex: 1,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 15,
        marginTop: 10,
    },
    semCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 15,
        elevation: 3,
        shadowColor: colors.black,
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    semInfo: {
        flex: 1,
    },
    semName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    semStatus: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: '600',
        marginTop: 2,
    },
    semPerformance: {
        alignItems: 'center',
        marginRight: 15,
        paddingHorizontal: 12,
        borderLeftWidth: 1,
        borderLeftColor: colors.gray100,
    },
    gpaText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    gpaLabel: {
        fontSize: 10,
        color: colors.gray500,
        textTransform: 'uppercase',
    },
    summaryHeader: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 20,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: '#EEF2FF',
        padding: 15,
        borderRadius: 16,
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: '600',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
    },
    resultRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
    },
    resIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primaryLight + '20',
        alignItems: 'center',
        justifyContent: 'center',
    },
    resGrade: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
    },
    resInfo: {
        flex: 1,
        marginLeft: 12,
    },
    resName: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    resCode: {
        fontSize: 11,
        color: colors.textSecondary,
        marginTop: 2,
    },
    resPoints: {
        alignItems: 'flex-end',
    },
    pointsValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    pointsLabel: {
        fontSize: 10,
        color: colors.gray500,
    },
    downloadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingVertical: 15,
        borderRadius: 15,
        marginTop: 30,
        marginBottom: 20,
        gap: 10,
    },
    downloadBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.white,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 10,
    },
    emptySubtext: {
        fontSize: 12,
        color: colors.textLight,
        marginTop: 4,
    },
    categoryTabs: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    categoryTab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 8,
        gap: 6,
    },
    categoryTabActive: {
        backgroundColor: colors.primaryLight + '15',
    },
    categoryTabText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.gray500,
    },
    categoryTabTextActive: {
        color: colors.primary,
    },
    horizontalScroll: {
        marginBottom: 20,
    },
    tableContainer: {
        backgroundColor: colors.white,
        borderRadius: 12,
        overflow: 'hidden',
        minWidth: width - 40,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 2,
        borderBottomColor: colors.primaryDark,
    },
    tableHeaderText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.white,
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
        alignItems: 'center',
        minHeight: 50,
    },
    tableCellText: {
        fontSize: 12,
        color: colors.textPrimary,
        textAlign: 'center',
    },
    tableCellBold: {
        fontWeight: 'bold',
        color: colors.primary,
    },
    tableCellSNo: {
        width: 50,
    },
    tableCellRegNo: {
        width: 120,
    },
    tableCellName: {
        width: 150,
    },
    tableCellSubjectCode: {
        width: 120,
    },
    tableCellSubjectName: {
        width: 180,
    },
    tableCellSubject: {
        width: 150,
    },
    tableCellMark: {
        width: 90,
    },
    emptyTableRow: {
        flexDirection: 'row',
        paddingVertical: 40,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 100,
    },
    emptyTableText: {
        fontSize: 14,
        color: colors.textSecondary,
        fontStyle: 'italic',
    },
});

export default StudentResults;
