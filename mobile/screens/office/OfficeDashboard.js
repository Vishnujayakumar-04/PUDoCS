import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Animated, Alert, Modal, TextInput, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { officeService } from '../../services/officeService';
import { createOrResetStaffAccount } from '../../utils/createSingleStaffAccount';
import { importStaff } from '../../utils/importStaff';
import { safeNavigate } from '../../utils/safeNavigation';
import { saveTimetable, getTimetableFromStorage } from '../../utils/seedTimetable';
import { studentService } from '../../services/studentService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { postAlumniMeetNotice, postHackathonNotice } from '../../utils/postNoticeWithImage';
import timetableData from '../../data/timetables/I_MTECH_DS_Timetable.json';
import btechCSTimetableData from '../../data/timetables/I_BTECH_CS_Timetable.json';
import btechCSE2ndYearTimetableData from '../../data/timetables/II_BTECH_CSE_Timetable.json';
import bscCS2ndYearTimetableData from '../../data/timetables/II_BSc_CS_Timetable.json';
import bscCS3rdYearTimetableData from '../../data/timetables/III_BSc_CS_Timetable.json';
import mscDATimetableData from '../../data/timetables/I_MSc_DA_Timetable.json';
import mtechCSE1stYearTimetableData from '../../data/timetables/I_MTECH_CSE_Timetable.json';
import bscCS1stYearTimetableData from '../../data/timetables/I_BSc_CS_Timetable.json';
import mscCS2ndYearTimetableData from '../../data/timetables/II_MSc_CS_Timetable.json';
import mca2ndYearTimetableData from '../../data/timetables/II_MCA_Timetable.json';
import mscCSIntegrated1stYearTimetableData from '../../data/timetables/V_MSc_CS_Integrated_Timetable.json';
import {
    importMscCS2ndYear,
    importMscDA1stYear,
    importMscCSIntegrated5thYear,
    importMscCSIntegrated6thYear,
    importMCA2ndYear,
    importMCA1stYear,
    importMtechDS1stYear,
    importMtechNIS2ndYear,
    importMtechCSE1stYear,
    importMtechCSE2ndYear,
} from '../../utils/importAllClasses';
import {
    importBTechIT1stYear,
    importBTechIT2ndYear,
    importBTechIT3rdYear,
    importBTechIT4thYear,
    importBTechCSE1stYear,
    importBTechCSE2ndYear,
    importBTechCSE3rdYear,
    importBTechCSE4thYear,
    importBScCS1stYear,
    importBScCS2ndYear,
    importBScCS3rdYear,
} from '../../utils/importUGClasses';
import PremiumHeader from '../../components/PremiumHeader';
import PremiumCard from '../../components/PremiumCard';
import Marquee from '../../components/Marquee';
import LoadingSpinner from '../../components/LoadingSpinner';
import FloatingActionButton from '../../components/FloatingActionButton';
import { SimplePieChart } from '../../components/PieChart';
import colors from '../../styles/colors';
import { moderateScale, getFontSize, getPadding, getMargin } from '../../utils/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const OfficeDashboard = ({ navigation }) => {
    const { user } = useAuth();
    const [notices, setNotices] = useState([]);
    const [events, setEvents] = useState([]);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [notificationModalVisible, setNotificationModalVisible] = useState(false);
    
    // Static notifications
    const notifications = [
        { id: '1', message: 'Examination results have been published.', date: new Date().toISOString() },
        { id: '2', message: 'The college will reopen on 19-01-2026.', date: new Date().toISOString() },
    ];
    const [creatingStaff, setCreatingStaff] = useState(false);
    const [fixAccountModalVisible, setFixAccountModalVisible] = useState(false);
    const [staffEmailToFix, setStaffEmailToFix] = useState('');
    const [cleaningStudents, setCleaningStudents] = useState(false);
    const [savingTimetable, setSavingTimetable] = useState(false);
    const [savingBTechCSTimetable, setSavingBTechCSTimetable] = useState(false);
    const [savingMscCSTimetable, setSavingMscCSTimetable] = useState(false);
    const [savingBTechCSE2ndYearTimetable, setSavingBTechCSE2ndYearTimetable] = useState(false);
    const [savingBScCS2ndYearTimetable, setSavingBScCS2ndYearTimetable] = useState(false);
    const [savingBScCS3rdYearTimetable, setSavingBScCS3rdYearTimetable] = useState(false);
    const [savingMscDATimetable, setSavingMscDATimetable] = useState(false);
    const [savingMtechCSE1stYearTimetable, setSavingMtechCSE1stYearTimetable] = useState(false);
    const [savingBScCS1stYearTimetable, setSavingBScCS1stYearTimetable] = useState(false);
    const [savingMscCS2ndYearTimetable, setSavingMscCS2ndYearTimetable] = useState(false);
    const [savingMCA2ndYearTimetable, setSavingMCA2ndYearTimetable] = useState(false);
    const [savingMscCSIntegrated5thYearTimetable, setSavingMscCSIntegrated5thYearTimetable] = useState(false);
    const [savingMscCSIntegrated6thYearTimetable, setSavingMscCSIntegrated6thYearTimetable] = useState(false);
    const [savingMtechNIS2ndYearTimetable, setSavingMtechNIS2ndYearTimetable] = useState(false);
    const [savingMtechCSE2ndYearTimetable, setSavingMtechCSE2ndYearTimetable] = useState(false);
    const [studentStatsModalVisible, setStudentStatsModalVisible] = useState(false);
    const [studentStats, setStudentStats] = useState(null);

    // Timetable notifications state - tracks which timetables need to be saved
    const [timetableNotifications, setTimetableNotifications] = useState([]);
    const [checkingTimetables, setCheckingTimetables] = useState(true);
    const [savingTimetableId, setSavingTimetableId] = useState(null);

    // Animation Values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        loadData();
        checkTimetableStatus();
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // Check which timetables are already saved
    const checkTimetableStatus = async () => {
        setCheckingTimetables(true);
        try {
            const timetableList = [
                { id: 'mtech-ds-1', label: 'I M.Tech DS Timetable', data: timetableData, program: 'M.Tech DS', year: 1 },
                { id: 'btech-cs-1', label: 'I B.Tech CS Timetable', data: btechCSTimetableData, program: 'B.Tech', year: 1 },
                { id: 'btech-cse-2', label: 'II B.Tech CSE Timetable', data: btechCSE2ndYearTimetableData, program: 'B.Tech', year: 2 },
                { id: 'bsc-cs-2', label: 'II B.Sc CS Timetable', data: bscCS2ndYearTimetableData, program: 'B.Sc CS', year: 2 },
                { id: 'bsc-cs-3', label: 'III B.Sc CS Timetable', data: bscCS3rdYearTimetableData, program: 'B.Sc CS', year: 3 },
                { id: 'msc-da-1', label: 'I M.Sc Data Analytics Timetable', data: mscDATimetableData, program: 'M.Sc Data Analytics', year: 1 },
                { id: 'mtech-cse-1', label: 'I M.Tech CSE Timetable', data: mtechCSE1stYearTimetableData, program: 'M.Tech CSE', year: 1 },
                { id: 'bsc-cs-1', label: 'I B.Sc CS Timetable', data: bscCS1stYearTimetableData, program: 'B.Sc CS', year: 1 },
                { id: 'msc-cs-2', label: 'II M.Sc CS Timetable', data: mscCS2ndYearTimetableData, program: 'M.Sc CS', year: 2 },
                { id: 'mca-2', label: 'II MCA Timetable', data: mca2ndYearTimetableData, program: 'MCA', year: 2 },
                { id: 'msc-cs-int-1', label: 'I M.Sc CS Integrated Timetable', data: mscCSIntegrated1stYearTimetableData, program: 'M.Sc CS Integrated', year: 1 },
            ];

            const unsavedTimetables = [];
            
            for (const timetable of timetableList) {
                try {
                    // Check local storage first
                    const normalizedYear = typeof timetable.year === 'string' ? 
                        (timetable.year === 'I' ? 1 : timetable.year === 'II' ? 2 : parseInt(timetable.year, 10)) : 
                        timetable.year;
                    
                    const storageKey = `timetable_${timetable.program}_${normalizedYear}`;
                    const stored = await AsyncStorage.getItem(storageKey);
                    
                    if (!stored) {
                        // Also check database (quick check)
                        const dbTimetable = await studentService.getTimetable(timetable.program, timetable.year);
                        if (!dbTimetable) {
                            unsavedTimetables.push(timetable);
                        }
                    }
                } catch (error) {
                    console.error(`Error checking ${timetable.label}:`, error);
                    // If check fails, assume it needs to be saved
                    unsavedTimetables.push(timetable);
                }
            }

            setTimetableNotifications(unsavedTimetables);
        } catch (error) {
            console.error('Error checking timetable status:', error);
        } finally {
            setCheckingTimetables(false);
        }
    };

    // Handle timetable save from notification
    const handleSaveTimetable = async (timetable) => {
        setSavingTimetableId(timetable.id);
        try {
            const result = await saveTimetable(timetable.data);
            
            // Remove from notifications list
            setTimetableNotifications(prev => prev.filter(t => t.id !== timetable.id));
            
            Alert.alert(
                'Success',
                `✅ ${timetable.label} saved successfully!\n\n- Database: ✅ Saved\n- Local Storage: ✅ Saved`
            );
        } catch (error) {
            console.error('Error saving timetable:', error);
            Alert.alert(
                'Error',
                error.message || 'Failed to save timetable. Please check console for details.'
            );
        } finally {
            setSavingTimetableId(null);
        }
    };

    const loadData = async () => {
        try {
            const [dashboardDataResult, noticesData, eventsData] = await Promise.all([
                officeService.getDashboard(),
                officeService.getNotices(),
                officeService.getEvents(),
            ]);
            
            setDashboardData(dashboardDataResult);
            setNotices(noticesData.slice(0, 3)); // Max 3 notices
            setEvents(eventsData.slice(0, 5));
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const loadStudentStatistics = async () => {
        try {
            const students = await officeService.getStudents();
            
            // Get all PG collection names for accurate filtering
            const { getAllCollectionsForCourse } = require('../utils/collectionMapper');
            const pgCollectionNames = getAllCollectionsForCourse('PG');
            
            // Determine UG vs PG from collection name, course field, or program
            const ugStudents = students.filter(s => {
                const collectionName = (s._collectionName || '').toLowerCase();
                const course = (s.course || '').toLowerCase();
                const program = (s.program || '').toLowerCase();
                
                // Check if it's a UG collection
                const isUGCollection = collectionName.includes('ug_') || 
                                      collectionName.includes('students_ug_') ||
                                      collectionName.includes('btech') || 
                                      collectionName.includes('bsc');
                
                // Check course and program fields
                const isUGCourse = course === 'ug' || 
                                  program.includes('b.tech') || 
                                  program.includes('btech') || 
                                  program.includes('b.sc') || 
                                  program.includes('bsc') ||
                                  program.includes('bachelor');
                
                return isUGCollection || isUGCourse;
            });
            
            const pgStudents = students.filter(s => {
                const collectionName = (s._collectionName || '').toLowerCase();
                const course = (s.course || '').toLowerCase();
                const program = (s.program || '').toLowerCase();
                
                // Check if student is from a known PG collection
                const isFromPGCollection = pgCollectionNames.some(pgColl => 
                    collectionName.includes(pgColl.toLowerCase()) || 
                    collectionName.includes('students_pg_') ||
                    collectionName.includes('pg_')
                );
                
                // Check if it's a PG program by name
                const isPGProgram = collectionName.includes('msc') || 
                                   collectionName.includes('mtech') || 
                                   collectionName.includes('mca') ||
                                   course === 'pg' || 
                                   program.includes('m.sc') || 
                                   program.includes('msc') ||
                                   program.includes('m.tech') || 
                                   program.includes('mtech') || 
                                   program.includes('mca') ||
                                   program.includes('master');
                
                return isFromPGCollection || isPGProgram;
            });
            
            // Count by gender
            const countByGender = (studentList) => {
                let boys = 0;
                let girls = 0;
                studentList.forEach(s => {
                    const gender = (s.gender || '').toLowerCase();
                    if (gender === 'male' || gender === 'm' || gender === 'boy') {
                        boys++;
                    } else if (gender === 'female' || gender === 'f' || gender === 'girl') {
                        girls++;
                    }
                });
                return { boys, girls, total: studentList.length };
            };
            
            const ugStats = countByGender(ugStudents);
            const pgStats = countByGender(pgStudents);
            const totalStats = countByGender(students);
            
            setStudentStats({
                ug: ugStats,
                pg: pgStats,
                total: totalStats,
            });
        } catch (error) {
            console.error('Error loading student statistics:', error);
            Alert.alert('Error', 'Failed to load student statistics');
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    const formatDate = (dateValue) => {
        if (!dateValue) return '';
        try {
            if (dateValue.toDate) return dateValue.toDate().toLocaleDateString();
            return new Date(dateValue).toLocaleDateString();
        } catch (e) {
            return dateValue.toString();
        }
    };

    const formatEventDate = (dateValue) => {
        if (!dateValue) return '';
        try {
            const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
            if (isNaN(date.getTime())) return '';
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch (e) {
            return '';
        }
    };

    const marqueeItems = [
        "Examination results have been published.",
        "The college will reopen on 19-01-2026.",
        ...notices.map(n => n.title).filter(Boolean),
        ...events.map(e => {
            const eventDate = formatEventDate(e.date);
            return eventDate ? `📅 Event: ${e.name || e.title} (${eventDate})` : `📅 Event: ${e.name || e.title}`;
        }).filter(Boolean),
    ];

    // Quick Access Features with icons
    const features = [
        { title: 'Fee Management', screen: 'Fees', icon: 'cash-multiple', color: colors.success },
        { title: 'Attendance', screen: 'Attendance', icon: 'account-check-outline', color: colors.accent },
        { title: 'Gallery', screen: 'Gallery', icon: 'image-multiple', color: '#9B59B6' },
        { title: 'Results', screen: 'Results', icon: 'trophy-outline', color: colors.info },
        { title: 'Notices', screen: 'Notices', icon: 'bell-outline', color: colors.error },
        { title: 'Events', screen: 'Events', icon: 'calendar-star', color: '#6366F1' },
        { title: 'Timetable', screen: 'Timetable', icon: 'calendar-clock', color: colors.accent },
        { title: 'Faculty', screen: 'StaffDirectory', icon: 'account-group', color: colors.primary },
        { title: 'Admin Access', screen: 'AdminAccess', icon: 'shield-account', color: colors.warning },
    ];

    // Safe navigation helper
    const handleNavigate = (routeName) => {
        safeNavigate(navigation, routeName);
    };

    // FAB Actions
    const fabActions = [
        {
            icon: 'cash-multiple',
            label: 'Fee Management',
            color: colors.success,
            onPress: () => handleNavigate('Fees'),
        },
        {
            icon: 'trophy-outline',
            label: 'Results',
            color: colors.info,
            onPress: () => handleNavigate('Results'),
        },
        {
            icon: 'bell-outline',
            label: 'Notices',
            color: colors.error,
            onPress: () => handleNavigate('Notices'),
        },
        {
            icon: 'calendar-star',
            label: 'Events',
            color: '#6366F1',
            onPress: () => handleNavigate('Events'),
        },
    ];

    const getCategoryColor = (category) => {
        switch (category?.toLowerCase()) {
            case 'academic': return colors.primary;
            case 'exam': return colors.warning;
            case 'event': return colors.info;
            case 'administrative': return colors.accent;
            default: return colors.gray500;
        }
    };

    return (
        <View style={styles.container}>
            <PremiumHeader 
                title="Office Portal" 
                subtitle="Administrative Control"
                showAvatar={true}
                onAvatarPress={() => handleNavigate('Profile')}
                user={user}
                profile={user?.profile}
                showNotification={true}
                onNotificationPress={() => setNotificationModalVisible(true)}
                notificationCount={notifications.length}
            />
            <Marquee items={marqueeItems} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Welcome Card */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <PremiumCard style={styles.welcomeCard}>
                        <Text style={styles.welcomeText}>Welcome, {user?.profile?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Office'}!</Text>
                        <Text style={styles.welcomeSubtext}>Manage administrative activities and student records</Text>
                    </PremiumCard>
                </Animated.View>

                {/* Statistics Section */}
                {dashboardData && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Statistics</Text>
                        <View style={styles.statsGrid}>
                            <TouchableOpacity 
                                onPress={async () => {
                                    await loadStudentStatistics();
                                    setStudentStatsModalVisible(true);
                                }}
                                activeOpacity={0.7}
                            >
                            <PremiumCard style={styles.statCard}>
                                <View style={styles.statCardContent}>
                                    <Text style={styles.statValue} adjustsFontSizeToFit minimumFontScale={0.6} numberOfLines={1}>
                                        {String(dashboardData.totalStudents || 0)}
                                    </Text>
                                    <Text style={styles.statLabel} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>
                                        Total Students
                                    </Text>
                                </View>
                            </PremiumCard>
                            </TouchableOpacity>
                            <PremiumCard style={styles.statCard}>
                                <View style={styles.statCardContent}>
                                    <Text style={[styles.statValue, { color: colors.warning }]} adjustsFontSizeToFit minimumFontScale={0.6} numberOfLines={1}>
                                        {String(dashboardData.upcomingExams?.length || 0)}
                                    </Text>
                                    <Text style={styles.statLabel} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>
                                        Upcoming Exams
                                    </Text>
                                </View>
                            </PremiumCard>
                        </View>
                    </View>
                )}

                {/* Admin Actions and Import Students sections moved to Admin Access Module */}

                {/* Quick Access Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Access</Text>
                    
                    {/* Regular Quick Access Features */}
                    <View style={styles.featuresGrid}>
                        {features.map((feature, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.featureCard}
                                onPress={() => handleNavigate(feature.screen)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.iconBackground, { backgroundColor: feature.color + '15' }]}>
                                    <MaterialCommunityIcons 
                                        name={feature.icon} 
                                        size={24} 
                                        color={feature.color} 
                                    />
                                </View>
                                <Text style={styles.featureTitle} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>
                                    {feature.title}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                </View>

                {/* Fee Status Summary */}
                {dashboardData?.feeStatus && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Fee Status Summary</Text>
                        <PremiumCard style={styles.feeCard}>
                            <View style={styles.feeRow}>
                                <Text style={styles.feeLabel}>Semester Fee Paid:</Text>
                                <Text style={[styles.feeValue, { color: colors.success }]}>
                                    {dashboardData.feeStatus.semesterFeePaid || 0}
                                </Text>
                            </View>
                            <View style={styles.feeRow}>
                                <Text style={styles.feeLabel}>Semester Fee Not Paid:</Text>
                                <Text style={[styles.feeValue, { color: colors.error }]}>
                                    {dashboardData.feeStatus.semesterFeeNotPaid || 0}
                                </Text>
                            </View>
                            <View style={styles.feeRow}>
                                <Text style={styles.feeLabel}>Exam Fee Paid:</Text>
                                <Text style={[styles.feeValue, { color: colors.success }]}>
                                    {dashboardData.feeStatus.examFeePaid || 0}
                                </Text>
                            </View>
                            <View style={styles.feeRow}>
                                <Text style={styles.feeLabel}>Exam Fee Not Paid:</Text>
                                <Text style={[styles.feeValue, { color: colors.error }]}>
                                    {dashboardData.feeStatus.examFeeNotPaid || 0}
                                </Text>
                            </View>
                        </PremiumCard>
                    </View>
                )}

                {/* Upcoming Exams Section */}
                {dashboardData?.upcomingExams && dashboardData.upcomingExams.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Upcoming Exams</Text>
                        </View>
                        {dashboardData.upcomingExams.slice(0, 3).map((exam) => (
                            <PremiumCard key={exam.id || exam._id} style={styles.examCard}>
                                <View style={styles.examContent}>
                                    <View style={styles.examHeader}>
                                        <Text style={styles.examName}>{exam.name || exam.subject || 'Exam'}</Text>
                                        <View style={[styles.examBadge, { backgroundColor: colors.warning + '15' }]}>
                                            <Text style={[styles.examBadgeText, { color: colors.warning }]}>
                                                {exam.examType || 'Exam'}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.examSubject}>{exam.subject || exam.program || ''}</Text>
                                <Text style={styles.examDate}>
                                        📅 {formatDate(exam.date)} {exam.startTime ? `at ${exam.startTime}` : ''}
                                </Text>
                                </View>
                            </PremiumCard>
                        ))}
                    </View>
                )}

                {/* Recent Notices Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Notices</Text>
                        <TouchableOpacity onPress={() => handleNavigate('Notices')}>
                            <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
                    </View>

                    {notices.length === 0 ? (
                        <PremiumCard style={styles.emptyCard}>
                            <MaterialCommunityIcons name="bell-off-outline" size={32} color={colors.gray300} />
                            <Text style={styles.emptyText}>No recent notices</Text>
                        </PremiumCard>
                    ) : (
                        notices.map((notice, idx) => (
                            <PremiumCard key={notice.id || idx} style={styles.noticeCard}>
                                <View style={styles.noticeContent}>
                                    <View style={[styles.categoryIndicator, { backgroundColor: getCategoryColor(notice.category) }]} />
                                    <View style={styles.noticeTextContainer}>
                                        <View style={styles.noticeHeader}>
                                            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(notice.category) + '15' }]}>
                                                <Text style={[styles.categoryText, { color: getCategoryColor(notice.category) }]}>
                                                    {notice.category || 'General'}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={styles.noticeTitle} numberOfLines={2}>{notice.title}</Text>
                                        {notice.content && (
                                            <Text style={styles.noticeDescription} numberOfLines={2}>
                                                {notice.content}
                                            </Text>
                                        )}
                                        <Text style={styles.noticeDate}>
                                            {formatDate(notice.createdAt)}
                                        </Text>
                                    </View>
                                </View>
                            </PremiumCard>
                        ))
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Notification Modal */}
            <Modal
                visible={notificationModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setNotificationModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Notifications</Text>
                            <TouchableOpacity
                                onPress={() => setNotificationModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.notificationList}>
                            {notifications.map((notification) => (
                                <View key={notification.id} style={styles.notificationItem}>
                                    <View style={styles.notificationIcon}>
                                        <MaterialCommunityIcons name="bell" size={20} color={colors.primary} />
                                    </View>
                                    <View style={styles.notificationTextContainer}>
                                        <Text style={styles.notificationText}>{notification.message}</Text>
                                        <Text style={styles.notificationDate}>
                                            {new Date(notification.date).toLocaleDateString('en-US', { 
                                                month: 'short', 
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Fix Staff Account Modal */}
            <Modal
                visible={fixAccountModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setFixAccountModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Fix Staff Account</Text>
                            <TouchableOpacity onPress={() => setFixAccountModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalLabel}>Staff Email</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="krishnapriya.csc@pondiuni.ac.in"
                            value={staffEmailToFix}
                            onChangeText={setStaffEmailToFix}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />

                        <Text style={styles.modalNote}>
                            This will create the account with password: Pass@123{'\n'}
                            If account exists, Firestore will be updated.
                        </Text>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonCancel]}
                                onPress={() => {
                                    setFixAccountModalVisible(false);
                                    setStaffEmailToFix('');
                                }}
                            >
                                <Text style={styles.modalButtonCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonConfirm]}
                                onPress={async () => {
                                    if (!staffEmailToFix || !staffEmailToFix.includes('@pondiuni.ac.in')) {
                                        Alert.alert('Error', 'Please enter a valid staff email');
                                        return;
                                    }
                                    
                                    setCreatingStaff(true);
                                    try {
                                        const result = await createOrResetStaffAccount(staffEmailToFix.trim(), 'Pass@123');
                                        
                                        if (result.success) {
                                            Alert.alert(
                                                'Success', 
                                                result.message + '\n\n' + 
                                                (result.note || `Account is ready!\n\nStaff can login with:\nEmail: ${staffEmailToFix.trim()}\nPassword: Pass@123`)
                                            );
                                            setFixAccountModalVisible(false);
                                            setStaffEmailToFix('');
                                        } else {
                                            let errorMessage = result.message;
                                            if (result.requiresDeletion) {
                                                errorMessage += '\n\n⚠️ IMPORTANT:\n';
                                                errorMessage += '1. Go to Firebase Console\n';
                                                errorMessage += '2. Authentication → Users\n';
                                                errorMessage += '3. Find and DELETE the account\n';
                                                errorMessage += '4. Come back and click "Create/Reset" again';
                                            }
                                            Alert.alert('Account Issue', errorMessage);
                                        }
                                    } catch (error) {
                                        console.error('Error creating account:', error);
                                        Alert.alert(
                                            'Error', 
                                            error.message || 'Failed to create/reset account.\n\nIf account exists with wrong password, delete it from Firebase Console first.'
                                        );
                                    } finally {
                                        setCreatingStaff(false);
                                    }
                                }}
                                disabled={creatingStaff || !staffEmailToFix}
                            >
                                <Text style={styles.modalButtonConfirmText}>
                                    {creatingStaff ? 'Processing...' : 'Create/Reset'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Floating Action Button */}
            <FloatingActionButton
                actions={fabActions}
            />

            {/* Student Statistics Modal */}
            <Modal
                visible={studentStatsModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setStudentStatsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.statsModalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Student Statistics</Text>
                            <TouchableOpacity onPress={() => setStudentStatsModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.statsScrollView} showsVerticalScrollIndicator={false}>
                            {studentStats ? (
                                <>
                                    {/* Total UG Section */}
                                    <View style={styles.statsSection}>
                                        <Text style={styles.statsSectionTitle}>Total UG (Undergraduate)</Text>
                                        <PremiumCard style={styles.statsCard}>
                                            <View style={styles.statsRow}>
                                                <Text style={styles.statsLabel}>Total:</Text>
                                                <Text style={styles.statsValue}>{studentStats.ug.total}</Text>
                                            </View>
                                            <View style={styles.statsRow}>
                                                <Text style={styles.statsLabel}>Boys:</Text>
                                                <Text style={[styles.statsValue, { color: colors.primary }]}>{studentStats.ug.boys}</Text>
                                            </View>
                                            <View style={styles.statsRow}>
                                                <Text style={styles.statsLabel}>Girls:</Text>
                                                <Text style={[styles.statsValue, { color: colors.accent }]}>{studentStats.ug.girls}</Text>
                                            </View>
                                            <View style={styles.pieChartContainer}>
                                                <SimplePieChart
                                                    data={[
                                                        { label: 'Boys', value: studentStats.ug.boys, color: colors.primary },
                                                        { label: 'Girls', value: studentStats.ug.girls, color: colors.accent },
                                                    ]}
                                                    size={150}
                                                />
                                                <View style={styles.legend}>
                                                    <View style={styles.legendItem}>
                                                        <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
                                                        <Text style={styles.legendText}>Boys: {studentStats.ug.boys}</Text>
                                                    </View>
                                                    <View style={styles.legendItem}>
                                                        <View style={[styles.legendColor, { backgroundColor: colors.accent }]} />
                                                        <Text style={styles.legendText}>Girls: {studentStats.ug.girls}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </PremiumCard>
                                    </View>

                                    {/* Total PG Section */}
                                    <View style={styles.statsSection}>
                                        <Text style={styles.statsSectionTitle}>Total PG (Postgraduate)</Text>
                                        <PremiumCard style={styles.statsCard}>
                                            <View style={styles.statsRow}>
                                                <Text style={styles.statsLabel}>Total:</Text>
                                                <Text style={styles.statsValue}>{studentStats.pg.total}</Text>
                                            </View>
                                            <View style={styles.statsRow}>
                                                <Text style={styles.statsLabel}>Boys:</Text>
                                                <Text style={[styles.statsValue, { color: colors.primary }]}>{studentStats.pg.boys}</Text>
                                            </View>
                                            <View style={styles.statsRow}>
                                                <Text style={styles.statsLabel}>Girls:</Text>
                                                <Text style={[styles.statsValue, { color: colors.accent }]}>{studentStats.pg.girls}</Text>
                                            </View>
                                            <View style={styles.pieChartContainer}>
                                                <SimplePieChart
                                                    data={[
                                                        { label: 'Boys', value: studentStats.pg.boys, color: colors.primary },
                                                        { label: 'Girls', value: studentStats.pg.girls, color: colors.accent },
                                                    ]}
                                                    size={150}
                                                />
                                                <View style={styles.legend}>
                                                    <View style={styles.legendItem}>
                                                        <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
                                                        <Text style={styles.legendText}>Boys: {studentStats.pg.boys}</Text>
                                                    </View>
                                                    <View style={styles.legendItem}>
                                                        <View style={[styles.legendColor, { backgroundColor: colors.accent }]} />
                                                        <Text style={styles.legendText}>Girls: {studentStats.pg.girls}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </PremiumCard>
                                    </View>

                                    {/* Total Students Section */}
                                    <View style={styles.statsSection}>
                                        <Text style={styles.statsSectionTitle}>Total Students</Text>
                                        <PremiumCard style={styles.statsCard}>
                                            <View style={styles.statsRow}>
                                                <Text style={styles.statsLabel}>Total:</Text>
                                                <Text style={styles.statsValue}>{studentStats.total.total}</Text>
                                            </View>
                                            <View style={styles.statsRow}>
                                                <Text style={styles.statsLabel}>Boys:</Text>
                                                <Text style={[styles.statsValue, { color: colors.primary }]}>{studentStats.total.boys}</Text>
                                            </View>
                                            <View style={styles.statsRow}>
                                                <Text style={styles.statsLabel}>Girls:</Text>
                                                <Text style={[styles.statsValue, { color: colors.accent }]}>{studentStats.total.girls}</Text>
                                            </View>
                                            <View style={styles.pieChartContainer}>
                                                <SimplePieChart
                                                    data={[
                                                        { label: 'Boys', value: studentStats.total.boys, color: colors.primary },
                                                        { label: 'Girls', value: studentStats.total.girls, color: colors.accent },
                                                    ]}
                                                    size={150}
                                                />
                                                <View style={styles.legend}>
                                                    <View style={styles.legendItem}>
                                                        <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
                                                        <Text style={styles.legendText}>Boys: {studentStats.total.boys}</Text>
                                                    </View>
                                                    <View style={styles.legendItem}>
                                                        <View style={[styles.legendColor, { backgroundColor: colors.accent }]} />
                                                        <Text style={styles.legendText}>Girls: {studentStats.total.girls}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </PremiumCard>
                                    </View>
                                </>
                            ) : (
                                <View style={styles.loadingContainer}>
                                    <Text>Loading statistics...</Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
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
        padding: 20,
    },
    welcomeCard: {
        marginBottom: 8,
    },
    welcomeText: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    welcomeSubtext: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '400',
    },
    section: {
        marginTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.textPrimary,
        letterSpacing: -0.3,
    },
    subsectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: getMargin(12),
        width: '100%',
        paddingHorizontal: getPadding(2),
    },
    statCard: {
        width: (SCREEN_WIDTH - getPadding(60)) / 2,
        maxWidth: moderateScale(180),
        minWidth: moderateScale(150),
        padding: getPadding(16),
        paddingVertical: getPadding(20),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: getMargin(12),
        minHeight: moderateScale(110),
        height: moderateScale(110),
    },
    statCardContent: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: getFontSize(28),
        fontWeight: '700',
        color: colors.primary,
        marginBottom: getMargin(8),
        textAlign: 'center',
        width: '100%',
        lineHeight: getFontSize(34),
    },
    statLabel: {
        fontSize: getFontSize(12),
        color: colors.textSecondary,
        fontWeight: '600',
        textAlign: 'center',
        width: '100%',
        lineHeight: getFontSize(16),
        paddingHorizontal: getPadding(4),
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: getMargin(8),
        paddingHorizontal: getPadding(2),
        marginBottom: getMargin(20),
    },
    adminActionsCategory: {
        marginTop: getMargin(20),
        paddingTop: getMargin(20),
        borderTopWidth: 1,
        borderTopColor: colors.gray200,
    },
    categoryTitle: {
        fontSize: getFontSize(16),
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: getMargin(12),
    },
    adminActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
        paddingHorizontal: getPadding(2),
    },
    adminActionCard: {
        width: (SCREEN_WIDTH - getPadding(60)) / 2,
        maxWidth: moderateScale(180),
        minWidth: moderateScale(150),
        backgroundColor: colors.white,
        borderRadius: moderateScale(12),
        padding: getPadding(16),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: getMargin(12),
        minHeight: moderateScale(80),
        borderWidth: 1,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    adminActionTitle: {
        fontSize: getFontSize(12),
        fontWeight: '600',
        marginTop: getMargin(8),
        textAlign: 'center',
    },
    featureCard: {
        width: (SCREEN_WIDTH - getPadding(60)) / 2,
        maxWidth: moderateScale(180),
        minWidth: moderateScale(150),
        backgroundColor: colors.white,
        borderRadius: moderateScale(16),
        padding: getPadding(16),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: getMargin(16),
        minHeight: moderateScale(100),
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.gray100,
    },
    iconBackground: {
        width: moderateScale(48),
        height: moderateScale(48),
        borderRadius: moderateScale(24),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: getMargin(8),
    },
    featureTitle: {
        fontSize: getFontSize(12),
        fontWeight: '600',
        color: colors.textPrimary,
        textAlign: 'center',
        numberOfLines: 2,
        adjustsFontSizeToFit: true,
        minimumFontScale: 0.8,
        width: '100%',
        paddingHorizontal: getPadding(4),
    },
    feeCard: {
        padding: 16,
    },
    feeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    feeLabel: {
        fontSize: 14,
        color: colors.textPrimary,
        fontWeight: '500',
    },
    feeValue: {
        fontSize: 14,
        fontWeight: '700',
    },
    examCard: {
        padding: 0,
        overflow: 'hidden',
        marginBottom: 12,
    },
    examContent: {
        padding: 16,
    },
    examHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    examName: {
        fontSize: getFontSize(16),
        fontWeight: '700',
        color: colors.textPrimary,
        flex: 1,
        numberOfLines: 2,
    },
    examBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginLeft: 8,
    },
    examBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    examSubject: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 6,
    },
    examDate: {
        fontSize: 12,
        color: colors.textLight,
        fontWeight: '400',
    },
    noticeCard: {
        padding: 0,
        overflow: 'hidden',
        marginBottom: 12,
    },
    noticeContent: {
        flexDirection: 'row',
        padding: 16,
    },
    categoryIndicator: {
        width: 4,
        borderRadius: 2,
        marginRight: 16,
    },
    noticeTextContainer: {
        flex: 1,
    },
    noticeHeader: {
        marginBottom: 8,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    categoryText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    noticeTitle: {
        fontSize: getFontSize(16),
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: getMargin(6),
        lineHeight: getFontSize(22),
        numberOfLines: 2,
    },
    noticeDescription: {
        fontSize: getFontSize(14),
        color: colors.textSecondary,
        marginBottom: getMargin(8),
        lineHeight: getFontSize(20),
        numberOfLines: 2,
    },
    noticeDate: {
        fontSize: 12,
        color: colors.textLight,
        fontWeight: '400',
    },
    seeAllText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '600',
    },
    emptyCard: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: colors.gray50,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    emptyText: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 12,
    },
    adminCard: {
        padding: 16,
        backgroundColor: colors.warning + '10',
        borderWidth: 1,
        borderColor: colors.warning + '30',
    },
    adminButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: getPadding(12),
        minHeight: moderateScale(60),
    },
    adminButtonText: {
        marginLeft: getMargin(16),
        flex: 1,
        minWidth: 0,
    },
    adminButtonTitle: {
        fontSize: getFontSize(14),
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: getMargin(4),
        numberOfLines: 2,
        adjustsFontSizeToFit: true,
        minimumFontScale: 0.85,
    },
    adminButtonSubtitle: {
        fontSize: getFontSize(11),
        color: colors.textSecondary,
        numberOfLines: 2,
        lineHeight: getFontSize(14),
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    modalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    modalInput: {
        backgroundColor: colors.gray50,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: colors.textPrimary,
        borderWidth: 1,
        borderColor: colors.gray200,
        marginBottom: 12,
    },
    modalNote: {
        fontSize: 12,
        color: colors.textSecondary,
        backgroundColor: colors.info + '10',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalButtonCancel: {
        backgroundColor: colors.gray100,
    },
    modalButtonCancelText: {
        color: colors.textSecondary,
        fontSize: 16,
        fontWeight: '600',
    },
    modalButtonConfirm: {
        backgroundColor: colors.info,
    },
    modalButtonConfirmText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    statsModalContent: {
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 24,
        width: '95%',
        maxHeight: '90%',
    },
    statsScrollView: {
        maxHeight: '80%',
    },
    statsSection: {
        marginBottom: 24,
    },
    statsSectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 12,
    },
    statsCard: {
        padding: 16,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    statsLabel: {
        fontSize: 16,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    statsValue: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    pieChartContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    legend: {
        marginTop: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendColor: {
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    legendText: {
        fontSize: 14,
        color: colors.textPrimary,
        fontWeight: '500',
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    closeButton: {
        padding: 4,
    },
    notificationList: {
        padding: 16,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: colors.gray50,
        borderRadius: 12,
        marginBottom: 12,
    },
    notificationIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    notificationTextContainer: {
        flex: 1,
    },
    notificationText: {
        fontSize: 15,
        color: colors.textPrimary,
        fontWeight: '500',
        marginBottom: 4,
        lineHeight: 20,
    },
    notificationDate: {
        fontSize: 12,
        color: colors.textSecondary,
    },
});

export default OfficeDashboard;
