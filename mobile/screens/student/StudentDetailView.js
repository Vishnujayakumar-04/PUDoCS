import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import { studentStorageService } from '../../services/studentStorageService';
import PremiumCard from '../../components/PremiumCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';

const StudentDetailView = ({ route, navigation }) => {
    const { user } = useAuth();
    const { studentId, studentRegisterNumber } = route.params || {};
    const [student, setStudent] = useState(null);
    const [documents, setDocuments] = useState({});
    const [loading, setLoading] = useState(true);
    const [isOwnProfile, setIsOwnProfile] = useState(false);

    useEffect(() => {
        loadStudentDetails();
    }, [studentId, studentRegisterNumber]);

    const loadStudentDetails = async () => {
        try {
            setLoading(true);

            // Determine viewing ID
            const targetId = studentId || studentRegisterNumber || user?.uid;

            // Determine if viewing own profile
            // (Simplified logic: if target is user.uid or user.email relates to it)
            // But strict check:
            const currentUserProfile = await studentService.getProfile(user?.uid, user?.email);
            setIsOwnProfile(
                currentUserProfile?.id === targetId ||
                currentUserProfile?.registerNumber === targetId ||
                user?.uid === targetId
            );

            // Load student data using service
            let studentData = null;
            if (studentId) {
                // Try finding by ID or Register Number
                const students = await studentStorageService.getStudents();
                studentData = students.find(s => s.id === studentId || s.registerNumber === studentId);
            }

            if (!studentData && studentRegisterNumber) {
                const students = await studentStorageService.getStudents();
                studentData = students.find(s => s.registerNumber === studentRegisterNumber);
            }

            // Fallback for current user if nothing passed
            if (!studentData && !studentId && !studentRegisterNumber) {
                studentData = currentUserProfile;
            }

            if (!studentData) {
                Alert.alert('Error', 'Student not found');
                navigation.goBack();
                return;
            }

            setStudent(studentData);

            // Load documents from local storage
            // Metadata is stored by user UID (usually) or student ID.
            // StudentDocuments uses user.uid to save.
            // So we should try finding documents by the student's ID (which might be the UID or we might have it in studentData)
            // studentData usually has 'id' which IS the UID if created via Auth.
            const docId = studentData.id || studentData.uid;
            if (docId) {
                const docs = await studentStorageService.getDocumentMetadata(docId);
                setDocuments(docs || {});
            }

        } catch (error) {
            console.error('Error loading student details:', error);
            Alert.alert('Error', 'Failed to load student details');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadDocument = async (docKey, docData) => {
        try {
            if (docData?.url) {
                // Determine if it is a local file or remote URL
                // For local-first, it's likely a file:// URI
                const canOpen = await Linking.canOpenURL(docData.url);
                if (canOpen) {
                    await Linking.openURL(docData.url);
                } else {
                    Alert.alert('Error', 'Cannot open this document type or file not found.');
                }
            } else {
                Alert.alert('Error', 'Document URL not found');
            }
        } catch (error) {
            console.error('Error downloading document:', error);
            Alert.alert('Error', 'Failed to open document');
        }
    };

    const InfoRow = ({ icon, label, value, isLast = false }) => (
        <>
            <View style={styles.infoRow}>
                <View style={styles.infoLeft}>
                    <MaterialCommunityIcons name={icon} size={20} color={colors.primary} />
                    <Text style={styles.infoLabel}>{label}</Text>
                </View>
                <Text style={styles.infoValue}>{value || 'Not provided'}</Text>
            </View>
            {!isLast && <View style={styles.divider} />}
        </>
    );

    const DocumentRow = ({ docKey, docLabel, docData }) => {
        const hasDocument = docData && docData.url;
        return (
            <View style={styles.documentRow}>
                <View style={styles.documentLeft}>
                    <MaterialCommunityIcons
                        name={hasDocument ? "file-check" : "file-remove"}
                        size={20}
                        color={hasDocument ? colors.success : colors.gray400}
                    />
                    <Text style={[styles.documentLabel, !hasDocument && styles.documentLabelMissing]}>
                        {docLabel}
                    </Text>
                </View>
                {hasDocument && (
                    <TouchableOpacity
                        onPress={() => handleDownloadDocument(docKey, docData)}
                        style={styles.downloadBtn}
                    >
                        <MaterialCommunityIcons name="eye" size={18} color={colors.primary} />
                        <Text style={styles.downloadText}>View</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!student) {
        return (
            <View style={styles.container}>
                <Text>Student not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.header}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.white} />
                        </TouchableOpacity>
                        <View style={styles.titleContainer}>
                            <Text style={styles.headerTitle}>Student Details</Text>
                            <Text style={styles.headerSubtitle}>{student.name}</Text>
                        </View>
                        <View style={styles.headerRight} />
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        {student.photoUrl ? (
                            <Image source={{ uri: student.photoUrl }} style={styles.avatar} />
                        ) : (
                            <View style={styles.initialsAvatar}>
                                <Text style={styles.initialsText}>
                                    {(student.name || 'U').charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.studentName}>{student.name}</Text>
                    <Text style={styles.studentRegNo}>{student.registerNumber}</Text>
                </View>

                {/* Basic Information */}
                <PremiumCard style={styles.card}>
                    <Text style={styles.cardTitle}>Basic Information</Text>
                    <InfoRow icon="identifier" label="Register Number" value={student.registerNumber} />
                    <InfoRow icon="account" label="Name" value={student.name} />
                    <InfoRow icon="phone" label="Phone Number" value={student.phone} />
                    <InfoRow icon="email" label="Email" value={student.email} isLast />
                </PremiumCard>

                {/* Family Information */}
                <PremiumCard style={styles.card}>
                    <Text style={styles.cardTitle}>Family Information</Text>
                    <InfoRow icon="account-male" label="Father Name" value={student.fatherName} />
                    <InfoRow icon="phone" label="Father Mobile" value={student.fatherMobile} />
                    <InfoRow icon="account-female" label="Mother Name" value={student.motherName} />
                    <InfoRow icon="phone" label="Mother Mobile" value={student.motherMobile} />
                    <InfoRow icon="account-group" label="Caste" value={student.caste} />
                    <InfoRow icon="home" label="House Address" value={student.houseAddress} isLast />
                </PremiumCard>

                {/* Academic Information */}
                <PremiumCard style={styles.card}>
                    <Text style={styles.cardTitle}>Academic Information</Text>
                    <InfoRow icon="school" label="Course" value={student.course} />
                    <InfoRow icon="book-open-variant" label="Program" value={student.program} />
                    <InfoRow icon="calendar" label="Year" value={student.year?.toString()} />
                    <InfoRow icon="calendar-range" label="Academic Year" value={student.academicYear || new Date().getFullYear().toString()} isLast />
                </PremiumCard>

                {/* Documents */}
                <PremiumCard style={styles.card}>
                    <Text style={styles.cardTitle}>Documents</Text>
                    <DocumentRow docKey="tenthMarksheet" docLabel="10th Marksheet" docData={documents.tenthMarksheet} />
                    <DocumentRow docKey="twelfthMarksheet" docLabel="12th Marksheet" docData={documents.twelfthMarksheet} />
                    <DocumentRow docKey="ugOverall" docLabel="UG Overall Marksheet" docData={documents.ugOverall} />
                    <DocumentRow docKey="ugProvisional" docLabel="UG Provisional Certificate" docData={documents.ugProvisional} />
                    <DocumentRow docKey="incomeCertificate" docLabel="Income Certificate" docData={documents.incomeCertificate} />
                    <DocumentRow docKey="residencyCertificate" docLabel="Residency Certificate" docData={documents.residencyCertificate} />
                    <DocumentRow docKey="casteCertificate" docLabel="Caste Certificate" docData={documents.casteCertificate} />
                    <DocumentRow docKey="nptel" docLabel="NPTEL Certificate" docData={documents.nptel} />
                    <DocumentRow docKey="outreachProgram" docLabel="Outreach Program Certificate" docData={documents.outreachProgram} />
                </PremiumCard>

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
    titleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.white,
    },
    headerSubtitle: {
        fontSize: 14,
        color: colors.white,
        opacity: 0.9,
        marginTop: 2,
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
    avatarSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 3,
        borderColor: colors.white,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    initialsAvatar: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.primary + '10',
    },
    initialsText: {
        fontSize: 40,
        fontWeight: '700',
        color: colors.primary,
    },
    studentName: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    studentRegNo: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    card: {
        marginBottom: 16,
        padding: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 12,
    },
    infoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    infoLabel: {
        fontSize: 14,
        color: colors.textSecondary,
        marginLeft: 10,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: colors.textPrimary,
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
        marginLeft: 12,
    },
    divider: {
        height: 1,
        backgroundColor: colors.gray100,
        marginLeft: 30,
    },
    documentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    documentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    documentLabel: {
        fontSize: 14,
        color: colors.textPrimary,
        marginLeft: 10,
        fontWeight: '500',
    },
    documentLabelMissing: {
        color: colors.textSecondary,
    },
    downloadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: colors.primary + '15',
    },
    downloadText: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: '600',
        marginLeft: 4,
    },
});

export default StudentDetailView;
