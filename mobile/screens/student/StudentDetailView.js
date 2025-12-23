import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db, storage } from '../../services/firebaseConfig';
import { ref, getDownloadURL } from 'firebase/storage';
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
            
            // Determine if viewing own profile
            const currentStudent = await getDoc(doc(db, 'students', user?.uid));
            if (currentStudent.exists()) {
                const currentData = currentStudent.data();
                setIsOwnProfile(
                    currentData.registerNumber === studentRegisterNumber ||
                    currentStudent.id === studentId
                );
            }

            // Load student data
            const studentRef = studentId 
                ? doc(db, 'students', studentId)
                : doc(db, 'students', studentRegisterNumber);
            
            const studentDoc = await getDoc(studentRef);
            
            if (!studentDoc.exists()) {
                Alert.alert('Error', 'Student not found');
                navigation.goBack();
                return;
            }

            const studentData = { id: studentDoc.id, ...studentDoc.data() };
            setStudent(studentData);

            // Load documents
            const documentsRef = doc(db, 'studentDocuments', studentData.id || studentRegisterNumber);
            const documentsDoc = await getDoc(documentsRef);
            
            if (documentsDoc.exists()) {
                setDocuments(documentsDoc.data());
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
                const url = await getDownloadURL(ref(storage, docData.url));
                Linking.openURL(url);
            } else {
                Alert.alert('Error', 'Document URL not found');
            }
        } catch (error) {
            console.error('Error downloading document:', error);
            Alert.alert('Error', 'Failed to download document');
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
                        <MaterialCommunityIcons name="download" size={18} color={colors.primary} />
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
                    <InfoRow icon="calendar-range" label="Academic Year" value={student.academicYear} isLast />
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

