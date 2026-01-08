import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';

const StudentExams = () => {
    const { user } = useAuth();
    const [view, setView] = useState('landing');
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [studentProfile, setStudentProfile] = useState(null);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
        loadStudentExams();
    }, []);

    const loadStudentExams = async () => {
        if (!user?.uid) {
            setLoading(false);
            return;
        }
        
        setLoading(true);
        try {
            // Get student profile
            const profile = await studentService.getProfile(user.uid, user.email);
            console.log('📅 Loading exam schedule for:', {
                program: profile?.program,
                year: profile?.year,
                registerNumber: profile?.registerNumber
            });
            
            if (profile?.program && profile?.year) {
                setStudentProfile(profile);
                // Load exam schedules (not announcements) for the student's program
                const data = await studentService.getExams(profile.program, profile.year);
                console.log('📅 Exams data received:', data?.length || 0);
                
                // Filter to show only schedules (exams with date/time/venue)
                const schedules = (data || []).filter(exam => 
                    exam.date || exam.time || exam.venue || exam.subject
                );
                console.log('📅 Filtered schedules:', schedules.length);
                
                setExams(schedules);
                setView('exams');
            } else {
                console.warn('⚠️ No program/year in profile for exam schedule');
                setExams([]);
                setView('exams'); // Still show empty state, not landing
            }
        } catch (error) {
            console.error('Error loading exams:', error);
            setExams([]);
            setView('landing');
        } finally {
            setLoading(false);
        }
    };

    const loadExams = async (program) => {
        setLoading(true);
        try {
            const data = await studentService.getExams(program, 'I');
            // Filter to show only schedules
            const schedules = (data || []).filter(exam => 
                exam.date || exam.time || exam.venue || exam.subject
            );
            setExams(schedules);
            setView('exams');
        } catch (error) {
            console.error('Error loading exams:', error);
            setExams([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateValue) => {
        if (!dateValue) return '';
        try {
            if (dateValue.toDate) return dateValue.toDate().toLocaleDateString();
            return new Date(dateValue).toLocaleDateString();
        } catch (e) {
            return dateValue.toString();
        }
    };

    const renderLanding = () => (
        <Animated.View style={[styles.viewContainer, { opacity: fadeAnim }]}>
            <Text style={styles.landingTitle}>Exam Schedules</Text>
            <Text style={styles.landingSubtitle}>Select your program level to view schedules</Text>

            <TouchableOpacity style={styles.programCard} onPress={() => loadExams('UG')}>
                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.programGradient}>
                    <MaterialCommunityIcons name="book-education" size={32} color={colors.white} />
                    <View style={styles.programInfo}>
                        <Text style={styles.programText}>Undergraduate (UG)</Text>
                        <Text style={styles.programSubtext}>B.Tech, B.Sc Computer Science</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={colors.white} />
                </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.programCard} onPress={() => loadExams('PG')}>
                <LinearGradient colors={[colors.secondary, colors.primaryDark]} style={styles.programGradient}>
                    <MaterialCommunityIcons name="school" size={32} color={colors.white} />
                    <View style={styles.programInfo}>
                        <Text style={styles.programText}>Postgraduate (PG)</Text>
                        <Text style={styles.programSubtext}>M.Sc, MCA, M.Tech Programs</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={colors.white} />
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );

    // Check if student is 2nd year (M.Sc CS II or MCA II)
    const isSecondYear = studentProfile && (
        (studentProfile.program === 'M.Sc CS' && (studentProfile.year === 'II' || studentProfile.year === 2)) ||
        (studentProfile.program === 'MCA' && (studentProfile.year === 'II' || studentProfile.year === 2))
    );

    // Project Review & Evaluation Schedule data
    const projectReviewSchedule = [
        {
            milestone: 'Zeroth Review*',
            date: 'January 22, 2026',
            documents: ['Project title', 'Project introduction presentation', 'Internship offer letter'],
            marks: '10'
        },
        {
            milestone: 'First Review*',
            date: 'February 21, 2026',
            documents: ['Presentation about analysis, design and partial implementation', 'Project progress report – I'],
            marks: '10'
        },
        {
            milestone: 'Second Review*',
            date: 'April 07, 2026',
            documents: ['Complete Project demo and presentation', 'Project progress report – II'],
            marks: '10'
        },
        {
            milestone: 'Report Submission',
            date: 'April 28, 2026',
            documents: ['Project report in the specified format'],
            marks: '10'
        },
        {
            milestone: 'Final External Review',
            date: 'May 04, 2026',
            documents: ['Project Demo, Project report, and Viva Voce'],
            marks: '60'
        }
    ];

    const renderProjectReviewTable = () => (
        <Card style={styles.projectReviewCard}>
            <Text style={styles.projectReviewTitle}>Project Review & Evaluation Schedule</Text>
            <View style={styles.tableContainer}>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderCell, styles.tableCellMilestone]}>Milestones</Text>
                    <Text style={[styles.tableHeaderCell, styles.tableCellDate]}>Date</Text>
                    <Text style={[styles.tableHeaderCell, styles.tableCellDocuments]}>Documents to be Submitted</Text>
                    <Text style={[styles.tableHeaderCell, styles.tableCellMarks]}>Evaluation (Marks)</Text>
                </View>
                {/* Table Rows */}
                {projectReviewSchedule.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.tableCellMilestone]}>{item.milestone}</Text>
                        <Text style={[styles.tableCell, styles.tableCellDate]}>{item.date}</Text>
                        <View style={[styles.tableCell, styles.tableCellDocuments]}>
                            {item.documents.map((doc, docIndex) => (
                                <Text key={docIndex} style={styles.documentItem}>
                                    • {doc}
                                </Text>
                            ))}
                        </View>
                        <Text style={[styles.tableCell, styles.tableCellMarks]}>{item.marks}</Text>
                    </View>
                ))}
            </View>
            <View style={styles.notesContainer}>
                <Text style={styles.notesTitle}>Notes:</Text>
                <Text style={styles.notesText}>• ALL students should attend the reviews in person.</Text>
                <Text style={styles.notesText}>• Online reviews will not be conducted.</Text>
            </View>
        </Card>
    );

    const renderExams = () => (
        <Animated.ScrollView
            style={[styles.viewContainer, { opacity: fadeAnim }]}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
            {/* Show Project Review Table for 2nd Year Students */}
            {isSecondYear && renderProjectReviewTable()}
            
            {exams.length === 0 && !isSecondYear ? (
                <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="calendar-blank" size={60} color={colors.gray300} />
                    <Text style={styles.emptyText}>No exam schedules available yet</Text>
                    <Text style={styles.emptySubtext}>Exam schedules will appear here once published by staff</Text>
                </View>
            ) : (
                exams.map((exam, index) => (
                    <View key={index} style={styles.timelineItem}>
                        <View style={styles.timelineSide}>
                            <View style={styles.timelineDot} />
                            {index !== exams.length - 1 && <View style={styles.timelineLine} />}
                        </View>
                        <Card style={styles.examCard}>
                            <Text style={styles.examSubject}>{exam.subject || exam.course || 'N/A'}</Text>
                            {exam.course && exam.course !== exam.subject && (
                                <Text style={styles.examCourse}>{exam.course}</Text>
                            )}

                            <View style={styles.examMeta}>
                                {exam.date && (
                                    <View style={styles.metaItem}>
                                        <MaterialCommunityIcons name="calendar" size={16} color={colors.primary} />
                                        <Text style={styles.metaText}>{formatDate(exam.date)}</Text>
                                    </View>
                                )}
                                {exam.time && (
                                    <View style={styles.metaItem}>
                                        <MaterialCommunityIcons name="clock-outline" size={16} color={colors.primary} />
                                        <Text style={styles.metaText}>{exam.time}</Text>
                                    </View>
                                )}
                                {exam.venue && (
                                    <View style={styles.metaItem}>
                                        <MaterialCommunityIcons name="map-marker" size={16} color={colors.secondary} />
                                        <Text style={styles.metaText}>{exam.venue}</Text>
                                    </View>
                                )}
                            </View>
                        </Card>
                    </View>
                ))
            )}
        </Animated.ScrollView>
    );

    if (loading) return <LoadingSpinner />;

    // Auto-load exams based on student profile, skip landing page
    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.header}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Exam Schedule</Text>
                        <Text style={styles.headerSubtitle}>Your examination schedules</Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>
            {renderExams()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingBottom: 25,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.white,
    },
    headerSubtitle: {
        fontSize: 14,
        color: colors.white,
        opacity: 0.9,
        marginTop: 4,
    },
    flex1: {
        flex: 1,
    },
    viewContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    landingTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginTop: 20,
        paddingHorizontal: 20,
    },
    landingSubtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: 30,
        marginTop: 5,
        paddingHorizontal: 20,
    },
    programCard: {
        marginBottom: 20,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 5,
        marginHorizontal: 20,
    },
    programGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
    },
    programInfo: {
        flex: 1,
        marginLeft: 20,
    },
    programText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.white,
    },
    programSubtext: {
        fontSize: 13,
        color: colors.white,
        opacity: 0.8,
        marginTop: 4,
    },
    examsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: colors.background,
    },
    backButton: {
        padding: 8,
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    timelineItem: {
        flexDirection: 'row',
    },
    timelineSide: {
        width: 30,
        alignItems: 'center',
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.primary,
        marginTop: 20,
        zIndex: 1,
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: colors.gray200,
        marginTop: -10,
    },
    examCard: {
        flex: 1,
        marginLeft: 10,
        marginBottom: 20,
        padding: 16,
    },
    examSubject: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    examCourse: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.primary,
        marginTop: 2,
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    examMeta: {
        gap: 8,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 14,
        color: colors.textSecondary,
        marginLeft: 8,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: colors.textSecondary,
        marginTop: 15,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.textLight,
        marginTop: 8,
        textAlign: 'center',
    },
    projectReviewCard: {
        marginBottom: 20,
        padding: 16,
    },
    projectReviewTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 16,
        textAlign: 'center',
    },
    tableContainer: {
        borderWidth: 1,
        borderColor: colors.gray200,
        borderRadius: 8,
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    tableHeaderCell: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 12,
    },
    tableRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: colors.gray200,
        paddingVertical: 12,
        paddingHorizontal: 8,
        backgroundColor: colors.white,
    },
    tableCell: {
        fontSize: 11,
        color: colors.textPrimary,
    },
    tableCellMilestone: {
        flex: 1.2,
        fontWeight: '600',
    },
    tableCellDate: {
        flex: 1.1,
    },
    tableCellDocuments: {
        flex: 2,
    },
    tableCellMarks: {
        flex: 0.7,
        textAlign: 'center',
        fontWeight: '600',
    },
    documentItem: {
        fontSize: 11,
        color: colors.textSecondary,
        marginBottom: 4,
        lineHeight: 16,
    },
    notesContainer: {
        marginTop: 16,
        padding: 12,
        backgroundColor: colors.gray50,
        borderRadius: 8,
    },
    notesTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    notesText: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 4,
        lineHeight: 18,
    },
});

export default StudentExams;
