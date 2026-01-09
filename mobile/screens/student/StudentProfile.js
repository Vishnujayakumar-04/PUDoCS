import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, TextInput, Alert, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import { studentStorageService } from '../../services/studentStorageService';
import colors from '../../styles/colors';
import { changePassword } from '../../services/authService';
import PremiumCard from '../../components/PremiumCard';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

const StudentProfile = ({ navigation }) => {
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [personalInfoExpanded, setPersonalInfoExpanded] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [drawerAnimation] = useState(new Animated.Value(-DRAWER_WIDTH));

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [formData, setFormData] = useState({
        registerNumber: '',
        name: '',
        phone: '',
        email: '',
        gender: '',
        fatherName: '',
        fatherMobile: '',
        motherName: '',
        motherMobile: '',
        caste: '',
        houseAddress: '',
        photoUrl: '',
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
            setLoading(true);

            // Use studentService to get profile
            console.log('Loading profile via studentService for:', user?.email);
            const studentData = await studentService.getProfile(user?.uid, user?.email);

            // Set profile data
            if (studentData) {
                setProfile(studentData);
                // Initialize form data with loaded values
                setFormData({
                    registerNumber: studentData.registerNumber || studentData.id || '',
                    name: studentData.name || '',
                    phone: studentData.phone || '',
                    email: studentData.email || user?.email || '',
                    gender: studentData.gender || '',
                    fatherName: studentData.fatherName || '',
                    fatherMobile: studentData.fatherMobile || '',
                    motherName: studentData.motherName || '',
                    motherMobile: studentData.motherMobile || '',
                    caste: studentData.caste || '',
                    houseAddress: studentData.houseAddress || '',
                    photoUrl: studentData.photoUrl || '',
                });
                console.log('Profile loaded successfully local:', studentData.name);
            } else {
                // Initialize with user email if no student data found
                console.log('No student data found locally, initializing with user email');
                setFormData({
                    registerNumber: '',
                    name: '',
                    phone: '',
                    email: user?.email || '',
                    gender: '',
                    fatherName: '',
                    fatherMobile: '',
                    motherName: '',
                    motherMobile: '',
                    caste: '',
                    houseAddress: '',
                });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            console.error('Error details:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'image/*',
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];

                // Convert to base64 to save in AsyncStorage
                const base64 = await FileSystem.readAsStringAsync(asset.uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                const base64String = `data:${asset.mimeType};base64,${base64}`;

                // Update local state
                setProfile(prev => ({ ...prev, photoUrl: base64String }));
                setFormData(prev => ({ ...prev, photoUrl: base64String }));

                // Save to storage
                const studentId = user.uid || user.email;
                await studentStorageService.updateStudent(studentId, { photoUrl: base64String });

                // Construct and save the profile object
                const currentProfile = {
                    ...(profile || {}),
                    photoUrl: base64String
                };
                await AsyncStorage.setItem('user_profile', JSON.stringify(currentProfile));

                Alert.alert('Success', 'Profile photo updated!');
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const validateAndSave = async () => {
        // Validate all mandatory fields
        const mandatoryFields = [
            { key: 'name', label: 'Name' },
            { key: 'phone', label: 'Phone Number' },
            { key: 'email', label: 'Email' },
            { key: 'gender', label: 'Gender' },
            { key: 'fatherName', label: 'Father Name' },
            { key: 'fatherMobile', label: 'Father Mobile Number' },
            { key: 'motherName', label: 'Mother Name' },
            { key: 'motherMobile', label: 'Mother Mobile Number' },
            { key: 'caste', label: 'Caste' },
            { key: 'houseAddress', label: 'House Address' },
        ];

        const missingFields = mandatoryFields.filter(field => !formData[field.key] || formData[field.key].trim() === '');

        if (missingFields.length > 0) {
            Alert.alert(
                'Missing Information',
                `Please fill all mandatory fields:\n\n${missingFields.map(f => `• ${f.label}`).join('\n')}\n\nAll fields are required to save your profile.`,
                [{ text: 'OK' }]
            );
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address');
            return;
        }

        // Validate phone numbers (should be 10 digits)
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
            Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number');
            return;
        }
        if (!phoneRegex.test(formData.fatherMobile.replace(/\D/g, ''))) {
            Alert.alert('Invalid Phone', 'Please enter a valid 10-digit father mobile number');
            return;
        }
        if (!phoneRegex.test(formData.motherMobile.replace(/\D/g, ''))) {
            Alert.alert('Invalid Phone', 'Please enter a valid 10-digit mother mobile number');
            return;
        }

        setSaving(true);
        try {
            // Determine register number
            let registerNumber = formData.registerNumber.trim() || profile?.registerNumber;

            // Use email logic if not found
            if (!registerNumber && user?.email) {
                const emailParts = user.email.split('@');
                registerNumber = emailParts[0]?.toUpperCase() || user.uid;
            }

            if (!registerNumber) {
                Alert.alert('Error', 'Unable to determine Register Number. Please contact office.');
                setSaving(false);
                return;
            }

            console.log('Saving profile for registerNumber:', registerNumber);

            const updateData = {
                registerNumber: registerNumber,
                name: formData.name.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim().toLowerCase(),
                gender: formData.gender,
                fatherName: formData.fatherName.trim(),
                fatherMobile: formData.fatherMobile.trim(),
                motherName: formData.motherName.trim(),
                motherMobile: formData.motherMobile.trim(),
                caste: formData.caste,
                houseAddress: formData.houseAddress.trim(),
                profileCompleted: true,
                profileUpdatedAt: new Date().toISOString(),
                // Keep existing fields
                course: profile?.course || 'PG',
                program: profile?.program || '',
                year: profile?.year || 1,
                section: profile?.section || 'A',
                isActive: true,
            };

            // Update using studentStorageService
            await studentStorageService.updateStudent(registerNumber, updateData);
            console.log('Updated local storage via service');

            // Find and update the profile state
            const updatedProfile = await studentService.getProfile(user?.uid, user?.email);

            if (updatedProfile) {
                setProfile(updatedProfile);
                setFormData({
                    registerNumber: updatedProfile.registerNumber || registerNumber,
                    name: updatedProfile.name || '',
                    phone: updatedProfile.phone || '',
                    email: updatedProfile.email || '',
                    gender: updatedProfile.gender || '',
                    fatherName: updatedProfile.fatherName || '',
                    fatherMobile: updatedProfile.fatherMobile || '',
                    motherName: updatedProfile.motherName || '',
                    motherMobile: updatedProfile.motherMobile || '',
                    caste: updatedProfile.caste || '',
                    houseAddress: updatedProfile.houseAddress || '',
                });
            } else {
                // Should hopefully find it now
                await loadProfile();
            }

            Alert.alert('Success', 'Profile updated successfully!');
            setEditModalVisible(false);
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert(
                'Error',
                `Failed to save profile.\n\nError: ${error.message || 'Unknown error'}\n\nPlease check console for details.`
            );
        } finally {
            setSaving(false);
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

        if (profile?.passwordChanged === true) {
            Alert.alert(
                'Password Already Changed',
                'You have already changed your password once. If you forgot your password, please contact the office for assistance.',
                [{ text: 'OK' }]
            );
            return;
        }

        setChangingPassword(true);
        try {
            await changePassword(passwordData.currentPassword, passwordData.newPassword, user.uid);
            Alert.alert('Success', 'Password changed successfully! Please remember your new password. You can only change it once.');
            setPasswordModalVisible(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            await loadProfile();
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
                    <Text style={dynamicStyles.rowLabel} numberOfLines={1}>{label}</Text>
                </View>
                <Text style={dynamicStyles.rowValue} numberOfLines={1} ellipsizeMode="tail">{value || 'N/A'}</Text>
            </View>
            {!isLast && <View style={dynamicStyles.divider} />}
        </>
    );

    const dynamicStyles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        headerTitle: {
            fontSize: 24,
            fontWeight: '700',
            color: colors.white,
            letterSpacing: 0.5,
        },
        studentName: {
            fontSize: 22,
            fontWeight: '700',
            color: colors.textPrimary,
            marginTop: 12,
        },
        cardTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: colors.textPrimary,
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
        },
        divider: {
            height: 1,
            backgroundColor: colors.gray200,
        },
    });

    return (
        <View style={dynamicStyles.container}>
            {/* Premium Gradient Header */}
            <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity
                            onPress={() => setMenuVisible(true)}
                            style={styles.menuButton}
                        >
                            <MaterialCommunityIcons name="menu" size={24} color={colors.white} />
                        </TouchableOpacity>
                        <View style={styles.headerText}>
                            <Text style={dynamicStyles.headerTitle}>Profile</Text>
                        </View>
                        <View style={styles.headerRight} />
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
                    <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} activeOpacity={0.9}>
                        <Image
                            source={
                                profile?.photoUrl
                                    ? { uri: profile.photoUrl }
                                    : profile?.photo
                                        ? (typeof profile.photo === 'string' ? { uri: profile.photo } : profile.photo)
                                        : user?.photoURL
                                            ? { uri: user.photoURL }
                                            : require('../../assets/Vishnu/VISHNU PHOTO.jpeg')
                            }
                            style={styles.avatar}
                        />
                        <View style={styles.cameraBadge}>
                            <MaterialCommunityIcons name="camera" size={16} color={colors.white} />
                        </View>
                        <View style={styles.avatarRing} />
                    </TouchableOpacity>
                    <Text style={dynamicStyles.studentName}>{profile?.name || 'Student Name'}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>Student</Text>
                    </View>
                </View>

                {/* Personal Information Card */}
                <PremiumCard style={styles.infoCard}>
                    <View style={styles.cardHeader}>
                        <Text style={dynamicStyles.cardTitle}>Personal Information</Text>
                        <View style={styles.cardHeaderButtons}>
                            <TouchableOpacity
                                onPress={() => setPersonalInfoExpanded(!personalInfoExpanded)}
                                style={styles.viewMoreButton}
                            >
                                <MaterialCommunityIcons
                                    name={personalInfoExpanded ? "chevron-up" : "chevron-down"}
                                    size={18}
                                    color={colors.primary}
                                />
                                <Text style={styles.viewMoreText}>
                                    {personalInfoExpanded ? 'View Less' : 'View More'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    if (profile) {
                                        setFormData({
                                            registerNumber: profile.registerNumber || '',
                                            name: profile.name || '',
                                            phone: profile.phone || '',
                                            email: profile.email || '',
                                            gender: profile.gender || '',
                                            fatherName: profile.fatherName || '',
                                            fatherMobile: profile.fatherMobile || '',
                                            motherName: profile.motherName || '',
                                            motherMobile: profile.motherMobile || '',
                                            caste: profile.caste || '',
                                            houseAddress: profile.houseAddress || '',
                                        });
                                    }
                                    setEditModalVisible(true);
                                }}
                                style={styles.editButton}
                            >
                                <MaterialCommunityIcons name="pencil" size={18} color={colors.primary} />
                                <Text style={styles.editButtonText}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ProfileRow
                        icon="card-account-details-outline"
                        label="Register Number"
                        value={profile?.registerNumber || 'Not provided'}
                    />
                    <ProfileRow
                        icon="account"
                        label="Name"
                        value={profile?.name || 'Not provided'}
                    />
                    {personalInfoExpanded && (
                        <>
                            <ProfileRow
                                icon="phone"
                                label="Phone Number"
                                value={profile?.phone || 'Not provided'}
                            />
                            <ProfileRow
                                icon="email"
                                label="Email"
                                value={profile?.email || 'Not provided'}
                            />
                            <ProfileRow
                                icon="gender-male-female"
                                label="Gender"
                                value={profile?.gender || 'Not provided'}
                            />
                            <ProfileRow
                                icon="account-male"
                                label="Father Name"
                                value={profile?.fatherName || 'Not provided'}
                            />
                            <ProfileRow
                                icon="phone"
                                label="Father Mobile"
                                value={profile?.fatherMobile || 'Not provided'}
                            />
                            <ProfileRow
                                icon="account-female"
                                label="Mother Name"
                                value={profile?.motherName || 'Not provided'}
                            />
                            <ProfileRow
                                icon="phone"
                                label="Mother Mobile"
                                value={profile?.motherMobile || 'Not provided'}
                            />
                            <ProfileRow
                                icon="account-group"
                                label="Caste"
                                value={profile?.caste || 'Not provided'}
                            />
                            <ProfileRow
                                icon="home"
                                label="House Address"
                                value={profile?.houseAddress || 'Not provided'}
                                isLast={true}
                            />
                        </>
                    )}
                </PremiumCard>

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
                        isLast={true}
                    />
                </PremiumCard>

                {/* Action Buttons */}
                <View style={styles.actionContainer}>
                    <Button
                        title={profile?.passwordChanged ? "Password Already Changed" : "Change Password"}
                        onPress={() => {
                            if (profile?.passwordChanged) {
                                Alert.alert(
                                    'Password Already Changed',
                                    'You have already changed your password once. If you forgot your password, please contact the office for assistance.'
                                );
                            } else {
                                setPasswordModalVisible(true);
                            }
                        }}
                        style={styles.changePasswordButton}
                        disabled={profile?.passwordChanged === true}
                    />

                    <Button
                        title="Log Out"
                        onPress={() => {
                            Alert.alert(
                                "Logout",
                                "Are you sure you want to logout?",
                                [
                                    { text: "Cancel", style: "cancel" },
                                    { text: "Logout", onPress: logout, style: 'destructive' }
                                ]
                            );
                        }}
                        style={{ marginTop: 15, borderColor: colors.error }}
                        variant="outline"
                        textStyle={{ color: colors.error }}
                    />
                </View>

                <View style={{ height: 120 }} />
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

                        <Text style={styles.modalNote}>
                            Note: You can only change your password once. If you forget it later, contact the office.
                        </Text>

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

            {/* Edit Profile Modal */}
            <Modal
                visible={editModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.editModalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Profile</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalNote}>
                            All fields are mandatory. Please fill all information to save your profile.
                        </Text>

                        <ScrollView
                            style={styles.modalScrollView}
                            contentContainerStyle={styles.modalScrollContent}
                            showsVerticalScrollIndicator={true}
                            nestedScrollEnabled={true}
                        >
                            <Text style={styles.modalLabel}>Name</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholder="Full Name"
                            />

                            <Text style={styles.modalLabel}>Phone Number</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={formData.phone}
                                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                placeholder="10-digit number"
                                keyboardType="phone-pad"
                                maxLength={10}
                            />

                            <Text style={styles.modalLabel}>Email</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                                placeholder="Email Address"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            <Text style={styles.modalLabel}>Gender</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={formData.gender}
                                onChangeText={(text) => setFormData({ ...formData, gender: text })}
                                placeholder="Male/Female/Other"
                            />

                            <Text style={styles.modalLabel}>Father Name</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={formData.fatherName}
                                onChangeText={(text) => setFormData({ ...formData, fatherName: text })}
                                placeholder="Father Name"
                            />

                            <Text style={styles.modalLabel}>Father Mobile</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={formData.fatherMobile}
                                onChangeText={(text) => setFormData({ ...formData, fatherMobile: text })}
                                placeholder="10-digit number"
                                keyboardType="phone-pad"
                                maxLength={10}
                            />

                            <Text style={styles.modalLabel}>Mother Name</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={formData.motherName}
                                onChangeText={(text) => setFormData({ ...formData, motherName: text })}
                                placeholder="Mother Name"
                            />

                            <Text style={styles.modalLabel}>Mother Mobile</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={formData.motherMobile}
                                onChangeText={(text) => setFormData({ ...formData, motherMobile: text })}
                                placeholder="10-digit number"
                                keyboardType="phone-pad"
                                maxLength={10}
                            />

                            <Text style={styles.modalLabel}>Caste</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={formData.caste}
                                onChangeText={(text) => setFormData({ ...formData, caste: text })}
                                placeholder="Caste"
                            />

                            <Text style={styles.modalLabel}>House Address</Text>
                            <TextInput
                                style={[styles.modalInput, styles.textArea]}
                                value={formData.houseAddress}
                                onChangeText={(text) => setFormData({ ...formData, houseAddress: text })}
                                placeholder="Full Address"
                                multiline
                                numberOfLines={3}
                            />

                            <View style={styles.modalButtons}>
                                <Button
                                    title="Cancel"
                                    variant="outline"
                                    onPress={() => setEditModalVisible(false)}
                                    style={styles.modalButton}
                                />
                                <Button
                                    title={saving ? "Saving..." : "Save Changes"}
                                    onPress={validateAndSave}
                                    style={styles.modalButton}
                                    loading={saving}
                                />
                            </View>
                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    // Header
    header: {
        paddingBottom: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        zIndex: 10,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    menuButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        flex: 1,
        alignItems: 'center',
    },
    headerRight: {
        width: 40,
    },
    // ScrollView
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    // Avatar
    avatarSection: {
        alignItems: 'center',
        marginTop: -50,
        marginBottom: 20,
    },
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: colors.white,
        backgroundColor: colors.white,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: colors.primary,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.white,
        elevation: 4,
        zIndex: 10,
    },
    avatarRing: {
        position: 'absolute',
        width: 128,
        height: 128,
        borderRadius: 64,
        borderWidth: 2,
        borderColor: colors.primary + '40', // semi-transparent
        zIndex: -1,
    },
    roleBadge: {
        backgroundColor: colors.primary + '15',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        marginTop: 8,
        borderWidth: 1,
        borderColor: colors.primary + '30',
    },
    roleText: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: '600',
    },
    // Cards
    infoCard: {
        marginBottom: 20,
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardHeaderButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: colors.background,
        borderRadius: 12,
    },
    viewMoreText: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: '500',
        marginLeft: 4,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: colors.primary + '15',
        borderRadius: 12,
    },
    editButtonText: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: '600',
        marginLeft: 4,
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
        marginRight: 16,
    },
    iconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    // Actions
    actionContainer: {
        marginTop: 10,
    },
    changePasswordButton: {
        backgroundColor: colors.secondary,
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 20,
        elevation: 5,
    },
    editModalContent: {
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 20,
        height: '80%', // Taller for edit
        elevation: 5,
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
    modalNote: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 20,
        backgroundColor: colors.primary + '10',
        padding: 10,
        borderRadius: 8,
    },
    modalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 8,
        marginTop: 12,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: colors.gray300,
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        color: colors.textPrimary,
        backgroundColor: colors.gray50,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
        gap: 12,
    },
    modalButton: {
        flex: 1,
    },
    modalScrollView: {
        flex: 1,
    },
    modalScrollContent: {
        paddingBottom: 20,
    },
});

export default StudentProfile;
