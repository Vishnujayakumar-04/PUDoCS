import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../services/authService';
import PremiumCard from '../../components/PremiumCard';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

const OfficeProfile = ({ navigation }) => {
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [drawerAnimation] = useState(new Animated.Value(-DRAWER_WIDTH));
    
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        loadProfile();
    }, []);

    useEffect(() => {
        Animated.timing(drawerAnimation, {
            toValue: menuVisible ? 0 : -DRAWER_WIDTH,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [menuVisible]);

    const loadProfile = async () => {
        try {
            // Profile data comes from user context
            if (user?.profile) {
                setProfile(user.profile);
            } else {
                setProfile({
                    name: user?.email?.split('@')[0] || 'Office',
                    email: user?.email || '',
                    designation: 'Administrative Staff',
                    department: 'Computer Science',
                });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            Alert.alert('Error', 'Please fill all password fields');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            Alert.alert('Error', 'New password and confirm password do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long');
            return;
        }

        setChangingPassword(true);
        try {
            await changePassword(passwordData.currentPassword, passwordData.newPassword, user.uid);
            Alert.alert('Success', 'Password changed successfully!');
            setPasswordModalVisible(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error) {
            console.error('Password change error:', error);
            Alert.alert('Error', error.message || 'Failed to change password. Please try again.');
        } finally {
            setChangingPassword(false);
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
            <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={styles.header}
            >
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.white} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Profile</Text>
                        <TouchableOpacity
                            onPress={() => setMenuVisible(true)}
                            style={styles.menuButton}
                        >
                            <MaterialCommunityIcons name="menu" size={24} color={colors.white} />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Profile Header */}
                <PremiumCard style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {profile?.name?.charAt(0)?.toUpperCase() || 'O'}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.profileName}>{profile?.name || 'Office Staff'}</Text>
                    <Text style={styles.profileEmail}>{profile?.email || user?.email || ''}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>Administrative Authority</Text>
                    </View>
                </PremiumCard>

                {/* Personal Information */}
                <PremiumCard style={styles.infoCard}>
                    <Text style={styles.cardTitle}>Personal Information</Text>
                    <ProfileRow icon="account" label="Name" value={profile?.name} />
                    <ProfileRow icon="email" label="Email" value={profile?.email || user?.email} />
                    <ProfileRow icon="briefcase" label="Designation" value={profile?.designation || 'Administrative Staff'} />
                    <ProfileRow icon="office-building" label="Department" value={profile?.department || 'Computer Science'} isLast />
                </PremiumCard>

                {/* Access Information */}
                <PremiumCard style={styles.infoCard}>
                    <Text style={styles.cardTitle}>Access Permissions</Text>
                    <View style={styles.permissionItem}>
                        <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} />
                        <Text style={styles.permissionText}>Full access to all modules</Text>
                    </View>
                    <View style={styles.permissionItem}>
                        <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} />
                        <Text style={styles.permissionText}>Student management (Add/Edit/Delete)</Text>
                    </View>
                    <View style={styles.permissionItem}>
                        <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} />
                        <Text style={styles.permissionText}>Fee management</Text>
                    </View>
                    <View style={styles.permissionItem}>
                        <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} />
                        <Text style={styles.permissionText}>Results upload</Text>
                    </View>
                </PremiumCard>

                {/* Action Buttons */}
                <View style={styles.actionContainer}>
                    <Button
                        title="Change Password"
                        onPress={() => setPasswordModalVisible(true)}
                        style={styles.changePasswordButton}
                    />
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Change Password Modal */}
            <Modal
                visible={passwordModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setPasswordModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Change Password</Text>
                            <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalLabel}>Current Password</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter current password"
                            secureTextEntry
                            value={passwordData.currentPassword}
                            onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
                        />

                        <Text style={styles.modalLabel}>New Password</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter new password (min 6 characters)"
                            secureTextEntry
                            value={passwordData.newPassword}
                            onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
                        />

                        <Text style={styles.modalLabel}>Confirm New Password</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Confirm new password"
                            secureTextEntry
                            value={passwordData.confirmPassword}
                            onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
                        />

                        <View style={styles.modalButtons}>
                            <Button
                                title="Cancel"
                                variant="outline"
                                onPress={() => {
                                    setPasswordModalVisible(false);
                                    setPasswordData({
                                        currentPassword: '',
                                        newPassword: '',
                                        confirmPassword: '',
                                    });
                                }}
                                style={styles.modalButton}
                            />
                            <Button
                                title={changingPassword ? "Changing..." : "Change Password"}
                                onPress={handleChangePassword}
                                style={styles.modalButton}
                                loading={changingPassword}
                            />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Side Menu Drawer */}
            {menuVisible && (
                <TouchableOpacity
                    style={styles.drawerOverlay}
                    activeOpacity={1}
                    onPress={() => {
                        setMenuVisible(false);
                        navigation.goBack();
                    }}
                >
                    <Animated.View
                        style={[
                            styles.drawer,
                            {
                                transform: [{ translateX: drawerAnimation }],
                                backgroundColor: colors.surface,
                            }
                        ]}
                        onStartShouldSetResponder={() => true}
                    >
                        <View style={styles.drawerHeader}>
                            <Text style={styles.drawerTitle}>Settings</Text>
                            <TouchableOpacity onPress={() => setMenuVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={colors.white} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.drawerContent}>
                            <Text style={[styles.drawerSectionTitle, { color: colors.textSecondary }]}>Actions</Text>
                        </View>

                        {/* Logout Button at Bottom */}
                        <View style={styles.drawerFooter}>
                            <TouchableOpacity
                                style={styles.logoutMenuButton}
                                onPress={() => {
                                    setMenuVisible(false);
                                    logout();
                                }}
                                activeOpacity={0.8}
                            >
                                <MaterialCommunityIcons name="logout" size={20} color={colors.error} />
                                <Text style={styles.logoutMenuText}>Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </TouchableOpacity>
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
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.white,
        flex: 1,
    },
    headerRight: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 24,
        marginBottom: 16,
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: colors.white,
    },
    profileName: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 12,
    },
    roleBadge: {
        backgroundColor: colors.accent + '15',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 12,
    },
    roleText: {
        color: colors.accent,
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoCard: {
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 16,
    },
    profileRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.gray50,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    rowLabel: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    rowValue: {
        fontSize: 14,
        color: colors.textPrimary,
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
    },
    divider: {
        height: 1,
        backgroundColor: colors.gray100,
        marginLeft: 44,
    },
    permissionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingLeft: 4,
    },
    permissionText: {
        fontSize: 14,
        color: colors.textPrimary,
        marginLeft: 12,
        fontWeight: '500',
    },
    actionContainer: {
        marginTop: 8,
    },
    changePasswordButton: {
        marginBottom: 12,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.error,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.error,
        marginLeft: 8,
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
        marginTop: 12,
    },
    modalInput: {
        backgroundColor: colors.gray50,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: colors.textPrimary,
        borderWidth: 1,
        borderColor: colors.gray200,
        marginBottom: 8,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 12,
    },
    modalButton: {
        flex: 1,
    },
    menuButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    drawerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
    },
    drawer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: DRAWER_WIDTH,
        height: '100%',
        backgroundColor: colors.white,
        shadowColor: colors.black,
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
        zIndex: 1001,
        flexDirection: 'column',
    },
    drawerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
        backgroundColor: colors.primary,
    },
    drawerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.white,
    },
    drawerContent: {
        flex: 1,
        padding: 20,
    },
    drawerSectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    drawerFooter: {
        marginTop: 'auto',
        paddingTop: 20,
        paddingBottom: 100, // Extra padding to account for bottom navigation bar
        borderTopWidth: 1,
        borderTopColor: colors.gray200,
    },
    logoutMenuButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.error,
        marginHorizontal: 16,
    },
    logoutMenuText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.error,
        marginLeft: 8,
    },
});

export default OfficeProfile;

