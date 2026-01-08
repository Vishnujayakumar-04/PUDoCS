import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import { attendanceService } from '../../services/attendanceService';
import PremiumCard from '../../components/PremiumCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';
import { safeNavigate } from '../../utils/safeNavigation';

const StudentDetails = ({ navigation }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [timetable, setTimetable] = useState(null);
    const [attendance, setAttendance] = useState(null);
    const [exams, setExams] = useState([]);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        if (!user?.uid) {
            setLoading(false);
            return;
        }

        try {
            setRefreshing(true);
            
            // Load profile to get program and year
            const profileData = await studentService.getProfile(user.uid, user.email);
            setProfile(profileData);

            if (profileData) {
                const { program, year } = profileData;
                
                // Load timetable
                try {
                    const timetableData = await studentService.getTimetable(program, year);
                    setTimetable(timetableData);
                } catch (error) {
                    console.error('Error loading timetable:', error);
                }

                // Load attendance
                try {
                    const attendanceData = await attendanceService.getStudentAttendance(user.uid, program, year);
                    setAttendance(attendanceData);
                } catch (error) {
                    console.error('Error loading attendance:', error);
                }

                // Load exams
                try {
                    const examsData = await studentService.getExams(program, year);
                    setExams(examsData.slice(0, 3)); // Show only next 3 exams
                } catch (error) {
                    console.error('Error loading exams:', error);
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
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
                        <Text style={styles.headerTitle}>Student Details</Text>
                        <Text style={styles.headerSubtitle}>Your academic information</Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={loadData} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Timetable Section */}
                <PremiumCard style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons name="calendar-clock" size={24} color={colors.primary} />
                        </View>
                        <View style={styles.sectionInfo}>
                            <Text style={styles.sectionTitle}>Timetable</Text>
                            <Text style={styles.sectionSubtitle}>
                                {timetable ? 'View your class schedule' : 'No timetable available'}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                if (profile?.program && profile?.year) {
                                    // Map program name to match timetable format
                                    let mappedProgram = profile.program;
                                    if (profile.program.includes('B.Tech') || profile.program.includes('BTech')) {
                                        mappedProgram = 'B.Tech';
                                    } else if (profile.program.includes('B.Sc') || profile.program.includes('BSC')) {
                                        mappedProgram = 'B.Sc CS';
                                    } else if (profile.program.includes('M.Sc') || profile.program.includes('MSC')) {
                                        if (profile.program.includes('Data Analytics') || profile.program.includes('Data Science')) {
                                            mappedProgram = 'M.Sc Data Analytics';
                                        } else if (profile.program.includes('Integrated')) {
                                            mappedProgram = 'M.Sc CS Integrated';
                                        } else {
                                            mappedProgram = 'M.Sc CS';
                                        }
                                    } else if (profile.program.includes('M.Tech') || profile.program.includes('MTech')) {
                                        if (profile.program.includes('Data Science') || profile.program.includes('Data Analytics')) {
                                            mappedProgram = 'M.Tech DS';
                                        } else if (profile.program.includes('CSE') || profile.program.includes('Computer Science')) {
                                            mappedProgram = 'M.Tech CSE';
                                        }
                                    } else if (profile.program.includes('MCA')) {
                                        mappedProgram = 'MCA';
                                    }
                                    
                                    navigation.navigate('Timetable', {
                                        program: mappedProgram,
                                        year: profile.year,
                                        autoLoad: true
                                    });
                                } else {
                                    safeNavigate(navigation, 'Timetable');
                                }
                            }}
                            style={styles.arrowButton}
                        >
                            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                </PremiumCard>

                {/* Attendance Section */}
                <PremiumCard style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons name="account-check-outline" size={24} color={colors.accent} />
                        </View>
                        <View style={styles.sectionInfo}>
                            <Text style={styles.sectionTitle}>Attendance</Text>
                            {attendance ? (
                                <View style={styles.attendanceInfo}>
                                    <Text style={styles.attendancePercentage}>
                                        {attendance.overallPercentage?.toFixed(1) || '0.0'}%
                                    </Text>
                                    <Text style={styles.attendanceStatus}>
                                        {attendance.eligible ? 'Eligible' : 'Not Eligible'}
                                    </Text>
                                </View>
                            ) : (
                                <Text style={styles.sectionSubtitle}>No attendance data</Text>
                            )}
                        </View>
                        <TouchableOpacity
                            onPress={() => safeNavigate(navigation, 'Attendance')}
                            style={styles.arrowButton}
                        >
                            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.accent} />
                        </TouchableOpacity>
                    </View>
                </PremiumCard>

                {/* Exams Section */}
                <PremiumCard style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.iconContainer, { backgroundColor: colors.warning + '15' }]}>
                            <MaterialCommunityIcons name="file-document-outline" size={24} color={colors.warning} />
                        </View>
                        <View style={styles.sectionInfo}>
                            <Text style={styles.sectionTitle}>Exam Schedule</Text>
                            <Text style={styles.sectionSubtitle}>
                                {exams.length > 0 ? `${exams.length} upcoming exam(s)` : 'View exam schedule'}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => safeNavigate(navigation, 'Exams')}
                            style={styles.arrowButton}
                        >
                            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.warning} />
                        </TouchableOpacity>
                    </View>
                </PremiumCard>

                {/* Exam Results Section */}
                <PremiumCard style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons name="trophy-outline" size={24} color={colors.success} />
                        </View>
                        <View style={styles.sectionInfo}>
                            <Text style={styles.sectionTitle}>Exam Results</Text>
                            <Text style={styles.sectionSubtitle}>View your academic results</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => safeNavigate(navigation, 'Results')}
                            style={styles.arrowButton}
                        >
                            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.success} />
                        </TouchableOpacity>
                    </View>
                </PremiumCard>

                {/* Upcoming Exams */}
                {exams.length > 0 && (
                    <View style={styles.examsSection}>
                        <Text style={styles.examsTitle}>Upcoming Exams</Text>
                        {exams.map((exam, index) => (
                            <PremiumCard key={index} style={styles.examCard}>
                                <View style={styles.examHeader}>
                                    <Text style={styles.examSubject}>{exam.subject || exam.course}</Text>
                                    <Text style={styles.examDate}>{exam.date || exam.time}</Text>
                                </View>
                                {exam.venue && (
                                    <Text style={styles.examVenue}>
                                        <MaterialCommunityIcons name="map-marker" size={14} color={colors.textSecondary} /> {exam.venue}
                                    </Text>
                                )}
                            </PremiumCard>
                        ))}
                    </View>
                )}

                <View style={{ height: 100 }} />
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    sectionCard: {
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    sectionInfo: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    attendanceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    attendancePercentage: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.primary,
    },
    attendanceStatus: {
        fontSize: 12,
        color: colors.textSecondary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        backgroundColor: colors.gray100,
        borderRadius: 8,
    },
    arrowButton: {
        padding: 8,
    },
    examsSection: {
        marginTop: 8,
    },
    examsTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 16,
    },
    examCard: {
        marginBottom: 12,
    },
    examHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    examSubject: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        flex: 1,
    },
    examDate: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    examVenue: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 4,
    },
});

export default StudentDetails;

