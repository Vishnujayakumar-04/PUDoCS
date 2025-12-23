import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import { changePassword } from '../../services/authService';
import { doc, getDoc, updateDoc, setDoc, query, where, getDocs, collection } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { getCollectionFromDisplayName } from '../../utils/collectionMapper';
import PremiumCard from '../../components/PremiumCard';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';

const StudentProfile = ({ navigation }) => {
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [personalInfoExpanded, setPersonalInfoExpanded] = useState(false);
    
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
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            
            // Try multiple methods to find the student document
            let studentData = null;
            let registerNumber = null;
            
            // Method 1: Try to get registerNumber from email
            if (user?.email) {
                const emailParts = user.email.split('@');
                if (emailParts[0]) {
                    registerNumber = emailParts[0].toUpperCase();
                    console.log('Trying registerNumber from email:', registerNumber);
                    const studentRef = doc(db, 'students', registerNumber);
                    const studentDoc = await getDoc(studentRef);
                    if (studentDoc.exists()) {
                        studentData = { id: studentDoc.id, ...studentDoc.data() };
                        console.log('Found student by registerNumber:', registerNumber);
                    }
                }
            }
            
            // Method 2: Try to find by email
            if (!studentData && user?.email) {
                console.log('Searching by email:', user.email);
                const q = query(
                    collection(db, 'students'),
                    where('email', '==', user.email.toLowerCase())
                );
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    studentData = { id: doc.id, ...doc.data() };
                    registerNumber = doc.id;
                    console.log('Found student by email query, registerNumber:', registerNumber);
                }
            }
            
            // Method 3: Try by user.uid
            if (!studentData && user?.uid) {
                console.log('Trying user.uid:', user.uid);
                const studentRef = doc(db, 'students', user.uid);
                const studentDoc = await getDoc(studentRef);
                if (studentDoc.exists()) {
                    studentData = { id: studentDoc.id, ...studentDoc.data() };
                    registerNumber = studentData.registerNumber || studentDoc.id;
                    console.log('Found student by uid');
                }
            }
            
            // Method 4: Try studentService.getProfile
            if (!studentData) {
                console.log('Trying studentService.getProfile');
                studentData = await studentService.getProfile(user?.uid);
                if (studentData) {
                    registerNumber = studentData.registerNumber || user?.uid;
                }
            }
            
            // Set profile data
            if (studentData) {
                setProfile(studentData);
                // Initialize form data with loaded values
                setFormData({
                    registerNumber: studentData.registerNumber || registerNumber || '',
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
                });
                console.log('Profile loaded successfully:', studentData);
            } else {
                // Initialize with user email if no student data found
                console.log('No student data found, initializing with user email');
                setFormData({
                    registerNumber: registerNumber || '',
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
            console.error('Error details:', error.message, error.stack);
        } finally {
            setLoading(false);
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
            // Try to get registerNumber from multiple sources
            let registerNumber = formData.registerNumber.trim() || profile?.registerNumber;
            
            // If not found, try to extract from email (e.g., 24mscscpy0054@pondiuni.ac.in -> 24mscscpy0054)
            if (!registerNumber && user?.email) {
                const emailParts = user.email.split('@');
                if (emailParts[0]) {
                    registerNumber = emailParts[0].toUpperCase();
                }
            }
            
            // If still not found, try to find student by email
            if (!registerNumber && user?.email) {
                console.log('RegisterNumber not found, searching by email:', user.email);
                const q = query(
                    collection(db, 'students'),
                    where('email', '==', user.email.toLowerCase())
                );
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const studentDoc = querySnapshot.docs[0];
                    registerNumber = studentDoc.id; // Document ID is registerNumber
                    console.log('Found student by email, registerNumber:', registerNumber);
                }
            }
            
            // If still not found, try to find by user.uid (in case student was stored with uid)
            if (!registerNumber) {
                const studentRefByUid = doc(db, 'students', user?.uid);
                const studentDocByUid = await getDoc(studentRefByUid);
                if (studentDocByUid.exists()) {
                    const data = studentDocByUid.data();
                    registerNumber = data.registerNumber || user.uid;
                    console.log('Found student by uid, registerNumber:', registerNumber);
                }
            }
            
            // Last resort: use email prefix as registerNumber (will create new document)
            if (!registerNumber && user?.email) {
                const emailParts = user.email.split('@');
                registerNumber = emailParts[0]?.toUpperCase() || user.uid;
                console.log('Using email prefix as registerNumber:', registerNumber);
            }
            
            if (!registerNumber) {
                Alert.alert(
                    'Error', 
                    'Unable to determine Register Number.\n\nPlease contact the office to set up your account properly.'
                );
                setSaving(false);
                return;
            }

            console.log('Saving profile for registerNumber:', registerNumber);
            console.log('Form data:', formData);

            // Get the correct collection name
            const { getCollectionFromDisplayName } = require('../../utils/collectionMapper');
            const collectionName = getCollectionFromDisplayName(
                profile?.program || formData.program || 'M.Sc Computer Science',
                profile?.year || formData.year || 1
            );
            
            console.log('Using collection:', collectionName);
            const studentRef = doc(db, collectionName, registerNumber);
            
            // Check if document exists
            const studentDoc = await getDoc(studentRef);
            console.log('Student document exists:', studentDoc.exists());
            
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
            };

            // Use setDoc with merge to update or create document
            if (studentDoc.exists()) {
                // Merge with existing data to preserve course, program, year, etc.
                const existingData = studentDoc.data();
                await setDoc(studentRef, {
                    ...existingData,
                    ...updateData,
                }, { merge: true });
                console.log('Updated existing student document');
            } else {
                // Create new document if it doesn't exist
                await setDoc(studentRef, {
                    ...updateData,
                    course: profile?.course || 'PG',
                    program: profile?.program || '',
                    year: profile?.year || 1,
                    section: profile?.section || 'A',
                    isActive: true,
                    createdAt: new Date().toISOString(),
                }, { merge: true });
                console.log('Created new student document');
            }

            // Also update local storage
            try {
                const updatedStudent = {
                    id: registerNumber,
                    registerNumber: registerNumber,
                    ...updateData,
                    course: profile?.course || 'PG',
                    program: profile?.program || '',
                    year: profile?.year || 1,
                };
                await studentStorageService.updateStudent(updatedStudent);
                console.log('Updated local storage');
            } catch (storageError) {
                console.warn('Local storage update failed:', storageError);
            }

            // Reload profile using the registerNumber we just saved
            console.log('Reloading profile with registerNumber:', registerNumber);
            const updatedStudentRef = doc(db, 'students', registerNumber);
            const updatedStudentDoc = await getDoc(updatedStudentRef);
            
            if (updatedStudentDoc.exists()) {
                const updatedData = { id: updatedStudentDoc.id, ...updatedStudentDoc.data() };
                setProfile(updatedData);
                setFormData({
                    registerNumber: updatedData.registerNumber || registerNumber,
                    name: updatedData.name || '',
                    phone: updatedData.phone || '',
                    email: updatedData.email || '',
                    gender: updatedData.gender || '',
                    fatherName: updatedData.fatherName || '',
                    fatherMobile: updatedData.fatherMobile || '',
                    motherName: updatedData.motherName || '',
                    motherMobile: updatedData.motherMobile || '',
                    caste: updatedData.caste || '',
                    houseAddress: updatedData.houseAddress || '',
                });
                console.log('Profile reloaded successfully:', updatedData);
            } else {
                // Fallback to loadProfile
                await loadProfile();
            }
            
            Alert.alert('Success', 'Profile updated successfully!');
            setEditModalVisible(false);
        } catch (error) {
            console.error('Error saving profile:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            Alert.alert(
                'Error', 
                `Failed to save profile.\n\nError: ${error.message || error.code || 'Unknown error'}\n\nPlease check console for details.`
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

        // Check if password was already changed
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
            // Reload profile to update passwordChanged status
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
                    <Text style={styles.rowLabel} numberOfLines={1}>{label}</Text>
                </View>
                <Text style={styles.rowValue} numberOfLines={1} ellipsizeMode="tail">{value || 'N/A'}</Text>
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

                {/* Personal Information Card */}
                <PremiumCard style={styles.infoCard}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Personal Information</Text>
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
                                    console.log('Edit button pressed');
                                    console.log('Current profile:', profile);
                                    console.log('Current formData:', formData);
                                    // Ensure formData is initialized before opening modal
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

                {/* Documents Section */}
                <PremiumCard
                    style={styles.infoCard}
                    onPress={() => navigation.navigate('Documents')}
                >
                    <Text style={styles.cardTitle}>Documents</Text>
                    <View style={styles.documentsContainer}>
                        <MaterialCommunityIcons
                            name="file-document-outline"
                            size={22}
                            color={colors.primary}
                            style={styles.documentsIcon}
                        />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.documentsText}>
                                Tap here to view and upload your documents one by one.
                            </Text>
                            <Text style={styles.documentsSubtext}>
                                Use the Upload button for each document in the next screen.
                            </Text>
                        </View>
                    </View>
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
                            <View style={styles.infoBox}>
                                <MaterialCommunityIcons name="information-outline" size={18} color={colors.primary} />
                                <Text style={styles.infoBoxText}>
                                    Register Number: {formData.registerNumber || profile?.registerNumber || 'N/A'}
                                </Text>
                            </View>

                            <Text style={styles.modalLabel}>Name *</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                            />

                            <Text style={styles.modalLabel}>Phone Number *</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Enter 10-digit phone number"
                                value={formData.phone}
                                onChangeText={(text) => setFormData({ ...formData, phone: text.replace(/\D/g, '') })}
                                keyboardType="phone-pad"
                                maxLength={10}
                            />

                            <Text style={styles.modalLabel}>Email *</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Enter email address"
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            <Text style={styles.modalLabel}>Gender *</Text>
                            <View style={styles.genderContainer}>
                                {['Male', 'Female', 'Other'].map((genderOption) => (
                                    <TouchableOpacity
                                        key={genderOption}
                                        style={[
                                            styles.optionButton,
                                            formData.gender === genderOption && styles.optionButtonActive
                                        ]}
                                        onPress={() => setFormData({ ...formData, gender: genderOption })}
                                    >
                                        <Text style={[
                                            styles.optionButtonText,
                                            formData.gender === genderOption && styles.optionButtonTextActive
                                        ]}>
                                            {genderOption}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.modalLabel}>Father Name *</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Enter father's name"
                                value={formData.fatherName}
                                onChangeText={(text) => setFormData({ ...formData, fatherName: text })}
                            />

                            <Text style={styles.modalLabel}>Father Mobile Number *</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Enter father's 10-digit mobile number"
                                value={formData.fatherMobile}
                                onChangeText={(text) => setFormData({ ...formData, fatherMobile: text.replace(/\D/g, '') })}
                                keyboardType="phone-pad"
                                maxLength={10}
                            />

                            <Text style={styles.modalLabel}>Mother Name *</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Enter mother's name"
                                value={formData.motherName}
                                onChangeText={(text) => setFormData({ ...formData, motherName: text })}
                            />

                            <Text style={styles.modalLabel}>Mother Mobile Number *</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Enter mother's 10-digit mobile number"
                                value={formData.motherMobile}
                                onChangeText={(text) => setFormData({ ...formData, motherMobile: text.replace(/\D/g, '') })}
                                keyboardType="phone-pad"
                                maxLength={10}
                            />

                            <Text style={styles.modalLabel}>Caste *</Text>
                            <View style={styles.casteContainer}>
                                {['OBC', 'ST', 'General', 'SC'].map((casteOption) => (
                                    <TouchableOpacity
                                        key={casteOption}
                                        style={[
                                            styles.optionButton,
                                            formData.caste === casteOption && styles.optionButtonActive
                                        ]}
                                        onPress={() => setFormData({ ...formData, caste: casteOption })}
                                    >
                                        <Text style={[
                                            styles.optionButtonText,
                                            formData.caste === casteOption && styles.optionButtonTextActive
                                        ]}>
                                            {casteOption}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.modalLabel}>House Address *</Text>
                            <TextInput
                                style={[styles.modalInput, styles.textArea]}
                                placeholder="Enter permanent house address (not hostel or staying address)"
                                value={formData.houseAddress}
                                onChangeText={(text) => setFormData({ ...formData, houseAddress: text })}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </ScrollView>

                        <View style={styles.modalButtonsContainer}>
                            <Button
                                title="Cancel"
                                variant="outline"
                                onPress={() => {
                                    setEditModalVisible(false);
                                    // Reset form data to current profile
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
                                }}
                                style={styles.modalButton}
                            />
                            <Button
                                title={saving ? "Saving..." : "Save Profile"}
                                onPress={validateAndSave}
                                style={styles.modalButton}
                                loading={saving}
                            />
                        </View>
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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        flex: 1,
    },
    cardHeaderButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    viewMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: colors.gray50,
    },
    viewMoreText: {
        fontSize: 13,
        color: colors.primary,
        fontWeight: '600',
        marginLeft: 4,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: colors.primary + '15',
    },
    editButtonText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '600',
        marginLeft: 4,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        minHeight: 44,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        flexShrink: 1,
        marginRight: 12,
    },
    iconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: colors.gray50,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        flexShrink: 0,
    },
    rowLabel: {
        fontSize: 15,
        color: colors.textSecondary,
        fontWeight: '500',
        flexShrink: 1,
    },
    rowValue: {
        fontSize: 15,
        color: colors.textPrimary,
        fontWeight: '600',
        textAlign: 'right',
        flexShrink: 0,
        marginLeft: 12,
        maxWidth: '50%',
    },
    divider: {
        height: 1,
        backgroundColor: colors.gray100,
        marginLeft: 48,
    },
    documentsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    documentsIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    documentsText: {
        fontSize: 14,
        color: colors.textPrimary,
        fontWeight: '500',
        marginBottom: 4,
    },
    documentsSubtext: {
        fontSize: 13,
        color: colors.textSecondary,
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
    editModalContent: {
        backgroundColor: colors.white,
        borderRadius: 20,
        width: '100%',
        maxWidth: 400,
        maxHeight: '85%',
        padding: 24,
        flexDirection: 'column',
    },
    modalScrollView: {
        maxHeight: 400,
        flexGrow: 0,
    },
    modalScrollContent: {
        paddingBottom: 10,
        flexGrow: 0,
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
        fontSize: 12,
        color: colors.warning,
        backgroundColor: colors.warning + '15',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        fontWeight: '500',
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
    modalButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        gap: 12,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
    },
    modalButton: {
        flex: 1,
    },
    genderContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    casteContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    optionButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: colors.gray50,
        borderWidth: 2,
        borderColor: 'transparent',
        alignItems: 'center',
        minHeight: 44,
        justifyContent: 'center',
    },
    optionButtonActive: {
        backgroundColor: colors.primary + '15',
        borderColor: colors.primary,
    },
    optionButtonText: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    optionButtonTextActive: {
        color: colors.primary,
        fontWeight: '600',
    },
    textArea: {
        height: 100,
        paddingTop: 14,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary + '10',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    infoBoxText: {
        fontSize: 14,
        color: colors.textPrimary,
        fontWeight: '500',
        marginLeft: 8,
    },
});

export default StudentProfile;
