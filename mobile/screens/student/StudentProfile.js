import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import PremiumCard from '../../components/PremiumCard';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';

const StudentProfile = ({ navigation }) => {
    const { logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await studentService.getProfile();
            setProfile(data);
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    // Profile Info Row Component
    const ProfileRow = ({ icon, label, value, isLast = false }) => (
        <>
            <View style={styles.profileRow}>
                <View style={styles.rowLeft}>
                    <View style={styles.iconWrapper}>
                        <MaterialCommunityIcons name={icon} size={20} color={colors.primary} />
                    </View>
                    <Text style={styles.rowLabel}>{label}</Text>
                </View>
                <Text style={styles.rowValue}>{value || 'N/A'}</Text>
            </View>
            {!isLast && <View style={styles.divider} />}
        </>
    );

    return (
        <View style={styles.container}>
            {/* Premium Gradient Header */}
            <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <View style={styles.headerText}>
                            <Text style={styles.headerTitle}>Profile</Text>
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={require('../../assets/Vishnu/VISHNU PHOTO.jpeg')}
                            style={styles.avatar}
                        />
                        <View style={styles.avatarRing} />
                    </View>
                    <Text style={styles.studentName}>{profile?.name || 'Student Name'}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>Student</Text>
                    </View>
                </View>

                {/* Academic Information Card */}
                <PremiumCard style={styles.infoCard}>
                    <Text style={styles.cardTitle}>Academic Information</Text>
                    
                    <ProfileRow 
                        icon="school-outline"
                        label="Course"
                        value={profile?.course || "Master of Science"}
                    />
                    <ProfileRow 
                        icon="book-education-outline"
                        label="Program"
                        value={profile?.program || "Computer Science"}
                    />
                    <ProfileRow 
                        icon="calendar-outline"
                        label="Year"
                        value={profile?.year ? `${profile.year} Year` : "2nd Year"}
                    />
                    <ProfileRow 
                        icon="account-group-outline"
                        label="Section"
                        value={profile?.section || "Batch II"}
                    />
                    <ProfileRow 
                        icon="card-account-details-outline"
                        label="Register Number"
                        value={profile?.registerNumber || "24MSCSPY0054"}
                        isLast={true}
                    />
                </PremiumCard>

                {/* Action Buttons */}
                <View style={styles.actionContainer}>
                    <Button
                        title="Change Password"
                        onPress={() => {}}
                        style={styles.changePasswordButton}
                    />
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={logout}
                        activeOpacity={0.8}
                    >
                        <MaterialCommunityIcons name="logout" size={20} color={colors.error} />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
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
        paddingBottom: 24,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    headerText: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.white,
        letterSpacing: 0.5,
    },
    scrollView: {
        flex: 1,
        marginTop: -30,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 8,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: colors.white,
    },
    avatarRing: {
        position: 'absolute',
        top: -4,
        left: -4,
        right: -4,
        bottom: -4,
        borderRadius: 54,
        borderWidth: 2,
        borderColor: colors.primary + '20',
    },
    studentName: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    roleBadge: {
        backgroundColor: colors.success + '15',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 12,
    },
    roleText: {
        color: colors.success,
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoCard: {
        marginTop: 8,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 20,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: colors.gray50,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    rowLabel: {
        fontSize: 15,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    rowValue: {
        fontSize: 15,
        color: colors.textPrimary,
        fontWeight: '600',
        textAlign: 'right',
        flex: 1,
        marginLeft: 16,
    },
    divider: {
        height: 1,
        backgroundColor: colors.gray100,
        marginLeft: 48,
    },
    actionContainer: {
        marginTop: 32,
        gap: 12,
    },
    changePasswordButton: {
        backgroundColor: colors.primary,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.error,
        gap: 8,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.error,
    },
});

export default StudentProfile;
