import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Animated, Alert, Modal, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { officeService } from '../../services/officeService';
import { createStaffAccounts } from '../../utils/createStaffAccounts';
import { createOrResetStaffAccount } from '../../utils/createSingleStaffAccount';
import { updateExistingStaffAccounts } from '../../utils/updateExistingStaffAccounts';
import { addMtechDSStudents } from '../../utils/addMtechDSStudents';
import { cleanupStudents } from '../../utils/cleanupStudents';
import { importStaff } from '../../utils/importStaff';
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
import colors from '../../styles/colors';

const OfficeDashboard = ({ navigation }) => {
    const { user } = useAuth();
    const [notices, setNotices] = useState([]);
    const [events, setEvents] = useState([]);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [creatingStaff, setCreatingStaff] = useState(false);
    const [fixAccountModalVisible, setFixAccountModalVisible] = useState(false);
    const [staffEmailToFix, setStaffEmailToFix] = useState('');
    const [cleaningStudents, setCleaningStudents] = useState(false);

    // Animation Values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        loadData();
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

    const marqueeItems = [
        "Welcome to Office Portal! Manage fees, exam eligibility, and administrative tasks.",
        ...notices.map(n => n.title).filter(Boolean),
        ...events.map(e => e.name).filter(Boolean),
    ];

    // Quick Access Features with icons
    const features = [
        { title: 'Fee Management', screen: 'Fees', icon: 'cash-multiple', color: colors.success },
        { title: 'Exam Eligibility', screen: 'Eligibility', color: colors.warning, icon: 'file-check-outline' },
        { title: 'Results', screen: 'Results', icon: 'trophy-outline', color: colors.info },
        { title: 'Notices', screen: 'Notices', icon: 'bell-outline', color: colors.error },
        { title: 'Events', screen: 'Events', icon: 'calendar-star', color: '#6366F1' },
        { title: 'Faculty', screen: 'StaffDirectory', icon: 'account-group', color: colors.primary },
    ];

    // FAB Actions
    const fabActions = [
        {
            icon: 'cash-multiple',
            label: 'Fee Management',
            color: colors.success,
            onPress: () => navigation.navigate('Fees'),
        },
        {
            icon: 'file-check-outline',
            label: 'Exam Eligibility',
            color: colors.warning,
            onPress: () => navigation.navigate('Eligibility'),
        },
        {
            icon: 'trophy-outline',
            label: 'Results',
            color: colors.info,
            onPress: () => navigation.navigate('Results'),
        },
        {
            icon: 'bell-outline',
            label: 'Notices',
            color: colors.error,
            onPress: () => navigation.navigate('Notices'),
        },
        {
            icon: 'calendar-star',
            label: 'Events',
            color: '#6366F1',
            onPress: () => navigation.navigate('Events'),
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
                onAvatarPress={() => navigation.navigate('Profile')}
                user={user}
                profile={user?.profile}
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
                            <PremiumCard style={styles.statCard}>
                                <Text style={styles.statValue}>{dashboardData.totalStudents || 0}</Text>
                                <Text style={styles.statLabel}>Total Students</Text>
                            </PremiumCard>
                            <PremiumCard style={styles.statCard}>
                                <Text style={[styles.statValue, { color: colors.success }]}>
                                    {dashboardData.examEligibility?.eligible || 0}
                                </Text>
                                <Text style={styles.statLabel}>Exam Eligible</Text>
                            </PremiumCard>
                            <PremiumCard style={styles.statCard}>
                                <Text style={[styles.statValue, { color: colors.error }]}>
                                    {dashboardData.examEligibility?.notEligible || 0}
                                </Text>
                                <Text style={styles.statLabel}>Not Eligible</Text>
                            </PremiumCard>
                            <PremiumCard style={styles.statCard}>
                                <Text style={[styles.statValue, { color: colors.warning }]}>
                                    {dashboardData.upcomingExams?.length || 0}
                                </Text>
                                <Text style={styles.statLabel}>Upcoming Exams</Text>
                            </PremiumCard>
                        </View>
                    </View>
                )}

                {/* Admin Actions Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Admin Actions</Text>
                    <PremiumCard style={styles.adminCard}>
                        {/* Import Staff - Remove Old and Add New */}
                        <TouchableOpacity 
                            style={[styles.adminButton, { backgroundColor: colors.primary + '15', borderWidth: 1, borderColor: colors.primary + '30' }]}
                            onPress={async () => {
                                Alert.alert(
                                    'Import Staff Data',
                                    'This will:\n\n1. Remove all old staff data from the database\n2. Add all 19 staff members to the "staff" collection\n3. Create/update Firebase Auth accounts\n4. Update "users" collection\n\n⚠️ This will replace all existing staff data.\n\nContinue?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Import Staff',
                                            onPress: async () => {
                                                setCreatingStaff(true);
                                                try {
                                                    console.log('🚀 Starting staff import...');
                                                    const result = await importStaff();
                                                    
                                                    let message = `✅ Successfully imported ${result.success} staff members.\n\n`;
                                                    
                                                    if (result.failed > 0) {
                                                        message += `❌ Failed: ${result.failed} staff members\n\n`;
                                                        if (result.errors && result.errors.length > 0) {
                                                            message += `Errors:\n`;
                                                            result.errors.slice(0, 3).forEach(err => {
                                                                message += `• ${err.name}: ${err.error}\n`;
                                                            });
                                                            if (result.errors.length > 3) {
                                                                message += `... and ${result.errors.length - 3} more`;
                                                            }
                                                        }
                                                    } else {
                                                        message += `All 19 staff members have been added to the database!\n\n`;
                                                        message += `Staff can login with:\n`;
                                                        message += `Email: their email\n`;
                                                        message += `Password: Pass@123`;
                                                    }
                                                    
                                                    Alert.alert('Staff Import Complete', message);
                                                } catch (error) {
                                                    console.error('Error importing staff:', error);
                                                    Alert.alert(
                                                        'Error', 
                                                        error.message || 'Failed to import staff. Please check console for details.'
                                                    );
                                                } finally {
                                                    setCreatingStaff(false);
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                            disabled={creatingStaff}
                        >
                            <MaterialCommunityIcons 
                                name="account-plus" 
                                size={24} 
                                color={colors.primary} 
                            />
                            <View style={styles.adminButtonText}>
                                <Text style={[styles.adminButtonTitle, { color: colors.primary }]}>
                                    {creatingStaff ? 'Importing Staff...' : 'Import Staff (Remove Old & Add New)'}
                                </Text>
                                <Text style={styles.adminButtonSubtitle}>
                                    Remove old staff data and add all 19 staff members to database
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </PremiumCard>
                </View>

                {/* Import Students by Class Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Import Students by Class</Text>
                    <PremiumCard style={styles.adminCard}>
                        <Text style={styles.subsectionTitle}>PG - Postgraduate (10 Classes)</Text>
                        
                        {/* 1. M.Sc CS 2nd Year */}
                        <TouchableOpacity 
                            style={[styles.adminButton, { marginTop: 8, backgroundColor: colors.primary + '15', borderWidth: 1, borderColor: colors.primary + '30' }]}
                            onPress={async () => {
                                Alert.alert(
                                    'Import M.Sc CS 2nd Year',
                                    'This will add M.Sc Computer Science 2nd Year students to the database.\n\nContinue?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Import',
                                            onPress: async () => {
                                                setCreatingStaff(true);
                                                try {
                                                    const result = await importMscCS2ndYear();
                                                    Alert.alert(
                                                        'Import Complete',
                                                        `✅ Successfully imported ${result.success} students.\n\n${result.failed > 0 ? `❌ Failed: ${result.failed}` : ''}`
                                                    );
                                                } catch (error) {
                                                    Alert.alert('Error', error.message || 'Failed to import students.');
                                                } finally {
                                                    setCreatingStaff(false);
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                            disabled={creatingStaff}
                        >
                            <MaterialCommunityIcons name="account-plus" size={18} color={colors.primary} />
                            <View style={styles.adminButtonText}>
                                <Text style={[styles.adminButtonTitle, { color: colors.primary, fontSize: 14 }]}>
                                    1. M.Sc CS - 2nd Year
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* 2. M.Sc Data Analytics 1st Year */}
                        <TouchableOpacity 
                            style={[styles.adminButton, { marginTop: 8, backgroundColor: colors.primary + '15', borderWidth: 1, borderColor: colors.primary + '30' }]}
                            onPress={async () => {
                                Alert.alert(
                                    'Import M.Sc Data Analytics 1st Year',
                                    'This will add M.Sc Data Analytics 1st Year students to the database.\n\nContinue?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Import',
                                            onPress: async () => {
                                                setCreatingStaff(true);
                                                try {
                                                    const result = await importMscDA1stYear();
                                                    Alert.alert(
                                                        'Import Complete',
                                                        `✅ Successfully imported ${result.success} students.\n\n${result.failed > 0 ? `❌ Failed: ${result.failed}` : ''}`
                                                    );
                                                } catch (error) {
                                                    Alert.alert('Error', error.message || 'Failed to import students.');
                                                } finally {
                                                    setCreatingStaff(false);
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                            disabled={creatingStaff}
                        >
                            <MaterialCommunityIcons name="account-plus" size={18} color={colors.primary} />
                            <View style={styles.adminButtonText}>
                                <Text style={[styles.adminButtonTitle, { color: colors.primary, fontSize: 14 }]}>
                                    2. M.Sc Data Analytics - 1st Year
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* 3. M.Sc CS Integrated 5th Year */}
                        <TouchableOpacity 
                            style={[styles.adminButton, { marginTop: 8, backgroundColor: colors.primary + '15', borderWidth: 1, borderColor: colors.primary + '30' }]}
                            onPress={async () => {
                                Alert.alert(
                                    'Import M.Sc CS Integrated 5th Year',
                                    'This will add M.Sc CS Integrated 5th Year students to the database.\n\nContinue?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Import',
                                            onPress: async () => {
                                                setCreatingStaff(true);
                                                try {
                                                    const result = await importMscCSIntegrated5thYear();
                                                    Alert.alert(
                                                        'Import Complete',
                                                        `✅ Successfully imported ${result.success} students.\n\n${result.failed > 0 ? `❌ Failed: ${result.failed}` : ''}`
                                                    );
                                                } catch (error) {
                                                    Alert.alert('Error', error.message || 'Failed to import students.');
                                                } finally {
                                                    setCreatingStaff(false);
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                            disabled={creatingStaff}
                        >
                            <MaterialCommunityIcons name="account-plus" size={18} color={colors.primary} />
                            <View style={styles.adminButtonText}>
                                <Text style={[styles.adminButtonTitle, { color: colors.primary, fontSize: 14 }]}>
                                    3. M.Sc CS Integrated - 5th Year
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* 4. M.Sc CS Integrated 6th Year */}
                        <TouchableOpacity 
                            style={[styles.adminButton, { marginTop: 8, backgroundColor: colors.primary + '15', borderWidth: 1, borderColor: colors.primary + '30' }]}
                            onPress={async () => {
                                Alert.alert(
                                    'Import M.Sc CS Integrated 6th Year',
                                    'This will add M.Sc CS Integrated 6th Year students to the database.\n\nContinue?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Import',
                                            onPress: async () => {
                                                setCreatingStaff(true);
                                                try {
                                                    const result = await importMscCSIntegrated6thYear();
                                                    Alert.alert(
                                                        'Import Complete',
                                                        `✅ Successfully imported ${result.success} students.\n\n${result.failed > 0 ? `❌ Failed: ${result.failed}` : ''}`
                                                    );
                                                } catch (error) {
                                                    Alert.alert('Error', error.message || 'Failed to import students.');
                                                } finally {
                                                    setCreatingStaff(false);
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                            disabled={creatingStaff}
                        >
                            <MaterialCommunityIcons name="account-plus" size={18} color={colors.primary} />
                            <View style={styles.adminButtonText}>
                                <Text style={[styles.adminButtonTitle, { color: colors.primary, fontSize: 14 }]}>
                                    4. M.Sc CS Integrated - 6th Year
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* 5. MCA 2nd Year */}
                        <TouchableOpacity 
                            style={[styles.adminButton, { marginTop: 8, backgroundColor: colors.primary + '15', borderWidth: 1, borderColor: colors.primary + '30' }]}
                            onPress={async () => {
                                Alert.alert(
                                    'Import MCA 2nd Year',
                                    'This will add MCA 2nd Year students to the database.\n\nContinue?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Import',
                                            onPress: async () => {
                                                setCreatingStaff(true);
                                                try {
                                                    const result = await importMCA2ndYear();
                                                    Alert.alert(
                                                        'Import Complete',
                                                        `✅ Successfully imported ${result.success} students.\n\n${result.failed > 0 ? `❌ Failed: ${result.failed}` : ''}`
                                                    );
                                                } catch (error) {
                                                    Alert.alert('Error', error.message || 'Failed to import students.');
                                                } finally {
                                                    setCreatingStaff(false);
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                            disabled={creatingStaff}
                        >
                            <MaterialCommunityIcons name="account-plus" size={18} color={colors.primary} />
                            <View style={styles.adminButtonText}>
                                <Text style={[styles.adminButtonTitle, { color: colors.primary, fontSize: 14 }]}>
                                    5. MCA - 2nd Year
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* 6. MCA 1st Year */}
                        <TouchableOpacity 
                            style={[styles.adminButton, { marginTop: 8, backgroundColor: colors.primary + '15', borderWidth: 1, borderColor: colors.primary + '30' }]}
                            onPress={async () => {
                                Alert.alert(
                                    'Import MCA 1st Year',
                                    'This will add MCA 1st Year students to the database.\n\nContinue?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Import',
                                            onPress: async () => {
                                                setCreatingStaff(true);
                                                try {
                                                    const result = await importMCA1stYear();
                                                    Alert.alert(
                                                        'Import Complete',
                                                        `✅ Successfully imported ${result.success} students.\n\n${result.failed > 0 ? `❌ Failed: ${result.failed}` : ''}`
                                                    );
                                                } catch (error) {
                                                    Alert.alert('Error', error.message || 'Failed to import students.');
                                                } finally {
                                                    setCreatingStaff(false);
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                            disabled={creatingStaff}
                        >
                            <MaterialCommunityIcons name="account-plus" size={18} color={colors.primary} />
                            <View style={styles.adminButtonText}>
                                <Text style={[styles.adminButtonTitle, { color: colors.primary, fontSize: 14 }]}>
                                    6. MCA - 1st Year
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* 7. M.Tech Data Analytics 1st Year */}
                        <TouchableOpacity 
                            style={[styles.adminButton, { marginTop: 8, backgroundColor: colors.primary + '15', borderWidth: 1, borderColor: colors.primary + '30' }]}
                            onPress={async () => {
                                Alert.alert(
                                    'Import M.Tech Data Analytics 1st Year',
                                    'This will add M.Tech Data Analytics 1st Year students to the database.\n\nContinue?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Import',
                                            onPress: async () => {
                                                setCreatingStaff(true);
                                                try {
                                                    const result = await importMtechDS1stYear();
                                                    Alert.alert(
                                                        'Import Complete',
                                                        `✅ Successfully imported ${result.success} students.\n\n${result.failed > 0 ? `❌ Failed: ${result.failed}` : ''}`
                                                    );
                                                } catch (error) {
                                                    Alert.alert('Error', error.message || 'Failed to import students.');
                                                } finally {
                                                    setCreatingStaff(false);
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                            disabled={creatingStaff}
                        >
                            <MaterialCommunityIcons name="account-plus" size={18} color={colors.primary} />
                            <View style={styles.adminButtonText}>
                                <Text style={[styles.adminButtonTitle, { color: colors.primary, fontSize: 14 }]}>
                                    7. M.Tech Data Analytics - 1st Year
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* 8. M.Tech NIS 2nd Year */}
                        <TouchableOpacity 
                            style={[styles.adminButton, { marginTop: 8, backgroundColor: colors.primary + '15', borderWidth: 1, borderColor: colors.primary + '30' }]}
                            onPress={async () => {
                                Alert.alert(
                                    'Import M.Tech NIS 2nd Year',
                                    'This will add M.Tech NIS 2nd Year students to the database.\n\nContinue?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Import',
                                            onPress: async () => {
                                                setCreatingStaff(true);
                                                try {
                                                    const result = await importMtechNIS2ndYear();
                                                    Alert.alert(
                                                        'Import Complete',
                                                        `✅ Successfully imported ${result.success} students.\n\n${result.failed > 0 ? `❌ Failed: ${result.failed}` : ''}`
                                                    );
                                                } catch (error) {
                                                    Alert.alert('Error', error.message || 'Failed to import students.');
                                                } finally {
                                                    setCreatingStaff(false);
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                            disabled={creatingStaff}
                        >
                            <MaterialCommunityIcons name="account-plus" size={18} color={colors.primary} />
                            <View style={styles.adminButtonText}>
                                <Text style={[styles.adminButtonTitle, { color: colors.primary, fontSize: 14 }]}>
                                    8. M.Tech NIS - 2nd Year
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* 9. M.Tech CSE 1st Year */}
                        <TouchableOpacity 
                            style={[styles.adminButton, { marginTop: 8, backgroundColor: colors.primary + '15', borderWidth: 1, borderColor: colors.primary + '30' }]}
                            onPress={async () => {
                                Alert.alert(
                                    'Import M.Tech CSE 1st Year',
                                    'This will add M.Tech CSE 1st Year students to the database.\n\nContinue?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Import',
                                            onPress: async () => {
                                                setCreatingStaff(true);
                                                try {
                                                    const result = await importMtechCSE1stYear();
                                                    Alert.alert(
                                                        'Import Complete',
                                                        `✅ Successfully imported ${result.success} students.\n\n${result.failed > 0 ? `❌ Failed: ${result.failed}` : ''}`
                                                    );
                                                } catch (error) {
                                                    Alert.alert('Error', error.message || 'Failed to import students.');
                                                } finally {
                                                    setCreatingStaff(false);
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                            disabled={creatingStaff}
                        >
                            <MaterialCommunityIcons name="account-plus" size={18} color={colors.primary} />
                            <View style={styles.adminButtonText}>
                                <Text style={[styles.adminButtonTitle, { color: colors.primary, fontSize: 14 }]}>
                                    9. M.Tech CSE - 1st Year
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* 10. M.Tech CSE 2nd Year */}
                        <TouchableOpacity 
                            style={[styles.adminButton, { marginTop: 8, backgroundColor: colors.primary + '15', borderWidth: 1, borderColor: colors.primary + '30' }]}
                            onPress={async () => {
                                Alert.alert(
                                    'Import M.Tech CSE 2nd Year',
                                    'This will add M.Tech CSE 2nd Year students to the database.\n\nContinue?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Import',
                                            onPress: async () => {
                                                setCreatingStaff(true);
                                                try {
                                                    const result = await importMtechCSE2ndYear();
                                                    Alert.alert(
                                                        'Import Complete',
                                                        `✅ Successfully imported ${result.success} students.\n\n${result.failed > 0 ? `❌ Failed: ${result.failed}` : ''}`
                                                    );
                                                } catch (error) {
                                                    Alert.alert('Error', error.message || 'Failed to import students.');
                                                } finally {
                                                    setCreatingStaff(false);
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                            disabled={creatingStaff}
                        >
                            <MaterialCommunityIcons name="account-plus" size={18} color={colors.primary} />
                            <View style={styles.adminButtonText}>
                                <Text style={[styles.adminButtonTitle, { color: colors.primary, fontSize: 14 }]}>
                                    10. M.Tech CSE - 2nd Year
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </PremiumCard>

                    {/* UG Programs */}
                    <PremiumCard style={[styles.adminCard, { marginTop: 16 }]}>
                        <Text style={styles.subsectionTitle}>UG - Undergraduate (11 Classes)</Text>
                        
                        {/* 1. BTech IT 1st Year */}
                        <TouchableOpacity 
                            style={[styles.adminButton, { marginTop: 8, backgroundColor: colors.secondary + '15', borderWidth: 1, borderColor: colors.secondary + '30' }]}
                            onPress={async () => {
                                Alert.alert(
                                    'Import BTech IT 1st Year',
                                    'This will add BTech IT 1st Year students to the database.\n\nContinue?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Import',
                                            onPress: async () => {
                                                setCreatingStaff(true);
                                                try {
                                                    const result = await importBTechIT1stYear();
                                                    Alert.alert(
                                                        'Import Complete',
                                                        `✅ Successfully imported ${result.success} students.\n\n${result.failed > 0 ? `❌ Failed: ${result.failed}` : ''}`
                                                    );
                                                } catch (error) {
                                                    Alert.alert('Error', error.message || 'Failed to import students.');
                                                } finally {
                                                    setCreatingStaff(false);
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                            disabled={creatingStaff}
                        >
                            <MaterialCommunityIcons name="account-plus" size={18} color={colors.secondary} />
                            <View style={styles.adminButtonText}>
                                <Text style={[styles.adminButtonTitle, { color: colors.secondary, fontSize: 14 }]}>
                                    1. BTech IT - 1st Year
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* 2. BTech IT 2nd Year */}
                        <TouchableOpacity 
                            style={[styles.adminButton, { marginTop: 8, backgroundColor: colors.secondary + '15', borderWidth: 1, borderColor: colors.secondary + '30' }]}
                            onPress={async () => {
                                Alert.alert(
                                    'Import BTech IT 2nd Year',
                                    'This will add BTech IT 2nd Year students to the database.\n\nContinue?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Import',
                                            onPress: async () => {
                                                setCreatingStaff(true);
                                                try {
                                                    const result = await importBTechIT2ndYear();
                                                    Alert.alert(
                                                        'Import Complete',
                                                        `✅ Successfully imported ${result.success} students.\n\n${result.failed > 0 ? `❌ Failed: ${result.failed}` : ''}`
                                                    );
                                                } catch (error) {
                                                    Alert.alert('Error', error.message || 'Failed to import students.');
                                                } finally {
                                                    setCreatingStaff(false);
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                            disabled={creatingStaff}
                        >
                            <MaterialCommunityIcons name="account-plus" size={18} color={colors.secondary} />
                            <View style={styles.adminButtonText}>
                                <Text style={[styles.adminButtonTitle, { color: colors.secondary, fontSize: 14 }]}>
                                    2. BTech IT - 2nd Year
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* 3. BTech IT 3rd Year */}
                        <TouchableOpacity 
                            style={[styles.adminButton, { marginTop: 8, backgroundColor: colors.secondary + '15', borderWidth: 1, borderColor: colors.secondary + '30' }]}
                            onPress={async () => {
                                Alert.alert(
                                    'Import BTech IT 3rd Year',
                                    'This will add BTech IT 3rd Year students to the database.\n\nContinue?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Import',
                                            onPress: async () => {
                                                setCreatingStaff(true);
                                                try {
                                                    const result = await importBTechIT3rdYear();
                                                    Alert.alert(
                                                        'Import Complete',
                                                        `✅ Successfully imported ${result.success} students.\n\n${result.failed > 0 ? `❌ Failed: ${result.failed}` : ''}`
                                                    );
                                                } catch (error) {
                                                    Alert.alert('Error', error.message || 'Failed to import students.');
                                                } finally {
                                                    setCreatingStaff(false);
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                            disabled={creatingStaff}
                        >
                            <MaterialCommunityIcons name="account-plus" size={18} color={colors.secondary} />
                            <View style={styles.adminButtonText}>
                                <Text style={[styles.adminButtonTitle, { color: colors.secondary, fontSize: 14 }]}>
                                    3. BTech IT - 3rd Year
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* 4. BTech IT 4th Year */}
                        <TouchableOpacity 
                            style={[styles.adminButton, { marginTop: 8, backgroundColor: colors.secondary + '15', borderWidth: 1, borderColor: colors.secondary + '30' }]}
                            onPress={async () => {
                                Alert.alert(
                                    'Import BTech IT 4th Year',
                                    'This will add BTech IT 4th Year students to the database.\n\nContinue?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Import',
                                            onPress: async () => {
                                                setCreatingStaff(true);
                                                try {
                                                    const result = await importBTechIT4thYear();
                                                    Alert.alert(
                                                        'Import Complete',
                                                        `✅ Successfully imported ${result.success} students.\n\n${result.failed > 0 ? `❌ Failed: ${result.failed}` : ''}`
                                                    );
                                                } catch (error) {
                                                    Alert.alert('Error', error.message || 'Failed to import students.');
                                                } finally {
                                                    setCreatingStaff(false);
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                            disabled={creatingStaff}
                        >
                            <MaterialCommunityIcons name="account-plus" size={18} color={colors.secondary} />
                            <View style={styles.adminButtonText}>
                                <Text style={[styles.adminButtonTitle, { color: colors.secondary, fontSize: 14 }]}>
                                    4. BTech IT - 4th Year
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* 5. BTech CSE 1st Year */}
                        <TouchableOpacity 
                            style={[styles.adminButton, { marginTop: 8, backgroundColor: colors.secondary + '15', borderWidth: 1, borderColor: colors.secondary + '30' }]}
                            onPress={async () => {
                                Alert.alert(
                                    'Import BTech CSE 1st Year',
                                    'This will add BTech CSE 1st Year students to the database.\n\nContinue?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Import',
                                            onPress: async () => {
                                                setCreatingStaff(true);
                                                try {
                                                    const result = await importBTechCSE1stYear();
                                                    Alert.alert(
                                                        'Import Complete',
                                                        `✅ Successfully imported ${result.success} students.\n\n${result.failed > 0 ? `❌ Failed: ${result.failed}` : ''}`
                                                    );
                                                } catch (error) {
                                                    Alert.alert('Error', error.message || 'Failed to import students.');
                                                } finally {
                                                    setCreatingStaff(false);
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                            disabled={creatingStaff}
                        >
                            <MaterialCommunityIcons name="account-plus" size={18} color={colors.secondary} />
                            <View style={styles.adminButtonText}>
                                <Text style={[styles.adminButtonTitle, { color: colors.secondary, fontSize: 14 }]}>
                                    5. BTech CSE - 1st Year
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* 6. BTech CSE 2nd Year */}
                        <TouchableOpacity 
                            style={[styles.adminButton, { marginTop: 8, backgroundColor: colors.secondary + '15', borderWidth: 1, borderColor: colors.secondary + '30' }]}
                            onPress={async () => {
                                Alert.alert(
                                    'Import BTech CSE 2nd Year',
                                    'This will add BTech CSE 2nd Year students to the database.\n\nContinue?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Import',
                                            onPress: async () => {
                                                setCreatingStaff(true);
                                                try {
                                                    const result = await importBTechCSE2ndYear();
                                                    Alert.alert(
                                                        'Import Complete',
                                                        `✅ Successfully imported ${result.success} students.\n\n${result.failed > 0 ? `❌ Failed: ${result.failed}` : ''}`
                                                    );
                                                } catch (error) {
                                                    Alert.alert('Error', error.message || 'Failed to import students.');
                                                } finally {
                                                    setCreatingStaff(false);
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                            disabled={creatingStaff}
                        >
                            <MaterialCommunityIcons name="account-plus" size={18} color={colors.secondary} />
                            <View style={styles.adminButtonText}>
                                <Text style={[styles.adminButtonTitle, { color: colors.secondary, fontSize: 14 }]}>
                                    6. BTech CSE - 2nd Year
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* 7. BTech CSE 3rd Year */}
                        <TouchableOpacity 
                            style={[styles.adminButton, { marginTop: 8, backgroundColor: colors.secondary + '15', borderWidth: 1, borderColor: colors.secondary + '30' }]}
                            onPress={async () => {
                                Alert.alert(
                                    'Import BTech CSE 3rd Year',
                                    'This will add BTech CSE 3rd Year students to the database.\n\nContinue?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Import',
                                            onPress: async () => {
                                                setCreatingStaff(true);
                                                try {
                                                    const result = await importBTechCSE3rdYear();
                                                    Alert.alert(
                                                        'Import Complete',
                                                        `✅ Successfully imported ${result.success} students.\n\n${result.failed > 0 ? `❌ Failed: ${result.failed}` : ''}`
                                                    );
                                                } catch (error) {
                                                    Alert.alert('Error', error.message || 'Failed to import students.');
                                                } finally {
                                                    setCreatingStaff(false);
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                            disabled={creatingStaff}
                        >
                            <MaterialCommunityIcons name="account-plus" size={18} color={colors.secondary} />
                            <View style={styles.adminButtonText}>
                                <Text style={[styles.adminButtonTitle, { color: colors.secondary, fontSize: 14 }]}>
                                    7. BTech CSE - 3rd Year
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* 8. BTech CSE 4th Year */}
                        <TouchableOpacity 
                            style={[styles.adminButton, { marginTop: 8, backgroundColor: colors.secondary + '15', borderWidth: 1, borderColor: colors.secondary + '30' }]}
                            onPress={async () => {
                                Alert.alert(
                                    'Import BTech CSE 4th Year',
                                    'This will add BTech CSE 4th Year students to the database.\n\nContinue?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Import',
                                            onPress: async () => {
                                                setCreatingStaff(true);
                                                try {
                                                    const result = await importBTechCSE4thYear();
                                                    Alert.alert(
                                                        'Import Complete',
                                                        `✅ Successfully imported ${result.success} students.\n\n${result.failed > 0 ? `❌ Failed: ${result.failed}` : ''}`
                                                    );
                                                } catch (error) {
                                                    Alert.alert('Error', error.message || 'Failed to import students.');
                                                } finally {
                                                    setCreatingStaff(false);
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                            disabled={creatingStaff}
                        >
                            <MaterialCommunityIcons name="account-plus" size={18} color={colors.secondary} />
                            <View style={styles.adminButtonText}>
                                <Text style={[styles.adminButtonTitle, { color: colors.secondary, fontSize: 14 }]}>
                                    8. BTech CSE - 4th Year
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* 9. BSc CS 1st Year */}
                        <TouchableOpacity 
                            style={[styles.adminButton, { marginTop: 8, backgroundColor: colors.secondary + '15', borderWidth: 1, borderColor: colors.secondary + '30' }]}
                            onPress={async () => {
                                Alert.alert(
                                    'Import BSc CS 1st Year',
                                    'This will add BSc Computer Science 1st Year students to the database.\n\nContinue?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Import',
                                            onPress: async () => {
                                                setCreatingStaff(true);
                                                try {
                                                    const result = await importBScCS1stYear();
                                                    Alert.alert(
                                                        'Import Complete',
                                                        `✅ Successfully imported ${result.success} students.\n\n${result.failed > 0 ? `❌ Failed: ${result.failed}` : ''}`
                                                    );
                                                } catch (error) {
                                                    Alert.alert('Error', error.message || 'Failed to import students.');
                                                } finally {
                                                    setCreatingStaff(false);
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                            disabled={creatingStaff}
                        >
                            <MaterialCommunityIcons name="account-plus" size={18} color={colors.secondary} />
                            <View style={styles.adminButtonText}>
                                <Text style={[styles.adminButtonTitle, { color: colors.secondary, fontSize: 14 }]}>
                                    9. BSc CS - 1st Year
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* 10. BSc CS 2nd Year */}
                        <TouchableOpacity 
                            style={[styles.adminButton, { marginTop: 8, backgroundColor: colors.secondary + '15', borderWidth: 1, borderColor: colors.secondary + '30' }]}
                            onPress={async () => {
                                Alert.alert(
                                    'Import BSc CS 2nd Year',
                                    'This will add BSc Computer Science 2nd Year students to the database.\n\nContinue?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Import',
                                            onPress: async () => {
                                                setCreatingStaff(true);
                                                try {
                                                    const result = await importBScCS2ndYear();
                                                    Alert.alert(
                                                        'Import Complete',
                                                        `✅ Successfully imported ${result.success} students.\n\n${result.failed > 0 ? `❌ Failed: ${result.failed}` : ''}`
                                                    );
                                                } catch (error) {
                                                    Alert.alert('Error', error.message || 'Failed to import students.');
                                                } finally {
                                                    setCreatingStaff(false);
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                            disabled={creatingStaff}
                        >
                            <MaterialCommunityIcons name="account-plus" size={18} color={colors.secondary} />
                            <View style={styles.adminButtonText}>
                                <Text style={[styles.adminButtonTitle, { color: colors.secondary, fontSize: 14 }]}>
                                    10. BSc CS - 2nd Year
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* 11. BSc CS 3rd Year */}
                        <TouchableOpacity 
                            style={[styles.adminButton, { marginTop: 8, backgroundColor: colors.secondary + '15', borderWidth: 1, borderColor: colors.secondary + '30' }]}
                            onPress={async () => {
                                Alert.alert(
                                    'Import BSc CS 3rd Year',
                                    'This will add BSc Computer Science 3rd Year students to the database.\n\nContinue?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Import',
                                            onPress: async () => {
                                                setCreatingStaff(true);
                                                try {
                                                    const result = await importBScCS3rdYear();
                                                    Alert.alert(
                                                        'Import Complete',
                                                        `✅ Successfully imported ${result.success} students.\n\n${result.failed > 0 ? `❌ Failed: ${result.failed}` : ''}`
                                                    );
                                                } catch (error) {
                                                    Alert.alert('Error', error.message || 'Failed to import students.');
                                                } finally {
                                                    setCreatingStaff(false);
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                            disabled={creatingStaff}
                        >
                            <MaterialCommunityIcons name="account-plus" size={18} color={colors.secondary} />
                            <View style={styles.adminButtonText}>
                                <Text style={[styles.adminButtonTitle, { color: colors.secondary, fontSize: 14 }]}>
                                    11. BSc CS - 3rd Year
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </PremiumCard>
                </View>

                {/* Quick Access Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Access</Text>
                    <View style={styles.featuresGrid}>
                        {features.map((feature, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.featureCard}
                                onPress={() => navigation.navigate(feature.screen)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.iconBackground, { backgroundColor: feature.color + '15' }]}>
                                    <MaterialCommunityIcons 
                                        name={feature.icon} 
                                        size={24} 
                                        color={feature.color} 
                                    />
                                </View>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
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
                            <TouchableOpacity onPress={() => navigation.navigate('Eligibility')}>
                                <Text style={styles.seeAllText}>See All</Text>
                            </TouchableOpacity>
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
                        <TouchableOpacity onPress={() => navigation.navigate('Notices')}>
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
                onPress={(action) => {
                    console.log('FAB action pressed:', action.label);
                }}
            />
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
        marginTop: 8,
    },
    statCard: {
        width: '48%',
        padding: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 32,
        fontWeight: '700',
        color: colors.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '600',
        textAlign: 'center',
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    featureCard: {
        width: '48%',
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        minHeight: 100,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.gray100,
    },
    iconBackground: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    featureTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textPrimary,
        textAlign: 'center',
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
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
        flex: 1,
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
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 6,
        lineHeight: 22,
    },
    noticeDescription: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 8,
        lineHeight: 20,
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
        padding: 12,
    },
    adminButtonText: {
        marginLeft: 16,
        flex: 1,
    },
    adminButtonTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    adminButtonSubtitle: {
        fontSize: 12,
        color: colors.textSecondary,
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
});

export default OfficeDashboard;
