import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import PremiumCard from '../../components/PremiumCard';
import Button from '../../components/Button';
import colors from '../../styles/colors';
import { useAuth } from '../../context/AuthContext';
import { db, storage } from '../../services/firebaseConfig';

const DOCUMENT_TYPES = [
    { id: 'tenthMarksheet', label: '10th Marksheet (PDF)' },
    { id: 'twelfthMarksheet', label: '12th Marksheet (PDF)' },
    { id: 'ugOverall', label: 'UG Overall Marksheet (PDF)' },
    { id: 'ugProvisional', label: 'UG Provisional Certificate (PDF)' },
    { id: 'incomeCertificate', label: 'Income Certificate (PDF)' },
    { id: 'residencyCertificate', label: 'Residency Certificate (PDF)' },
    { id: 'casteCertificate', label: 'Caste Certificate (PDF)' },
    { id: 'nptel', label: 'NPTEL (PDF)' },
    { id: 'outreachProgram', label: 'Outreach Program (PDF)' },
];

const StudentDocuments = () => {
    const { user } = useAuth();
    const [uploadingId, setUploadingId] = useState(null);

    const handleUploadPress = async (docType) => {
        if (!user?.uid) {
            Alert.alert('Error', 'User not found. Please log in again.');
            return;
        }

        try {
            setUploadingId(docType.id);

            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                multiple: false,
                copyToCacheDirectory: true,
            });

            if (result.canceled || !result.assets || !result.assets[0]) {
                setUploadingId(null);
                return;
            }

            const file = result.assets[0];

            if (file.mimeType && file.mimeType !== 'application/pdf') {
                Alert.alert('Invalid File', 'Please select a PDF document.');
                setUploadingId(null);
                return;
            }

            // Upload to Firebase Storage
            const response = await fetch(file.uri);
            const blob = await response.blob();

            const storageRef = ref(
                storage,
                `studentDocuments/${user.uid}/${docType.id}.pdf`
            );

            await uploadBytes(storageRef, blob);
            const downloadUrl = await getDownloadURL(storageRef);

            // Save metadata in Firestore so staff/office can see it
            const studentDocRef = doc(db, 'studentDocuments', user.uid);
            await setDoc(
                studentDocRef,
                {
                    [docType.id]: {
                        label: docType.label,
                        url: downloadUrl,
                        uploadedAt: new Date().toISOString(),
                    },
                },
                { merge: true }
            );

            Alert.alert('Success', `${docType.label} uploaded successfully.`);
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Upload Failed', 'Could not upload the document. Please try again.');
        } finally {
            setUploadingId(null);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.header}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Documents</Text>
                        <Text style={styles.headerSubtitle}>
                            Upload each required document as a PDF
                        </Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <PremiumCard style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons
                            name="information-outline"
                            size={22}
                            color={colors.primary}
                            style={styles.infoIcon}
                        />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.infoText}>
                                Please upload clear PDF copies of the following documents. Staff and office
                                will be able to verify and download them.
                            </Text>
                            <Text style={styles.infoSubtext}>
                                Once submitted, any corrections must be informed to the department office.
                            </Text>
                        </View>
                    </View>
                </PremiumCard>

                {DOCUMENT_TYPES.map((docType) => (
                    <PremiumCard key={docType.id} style={styles.documentCard}>
                        <View style={styles.documentRow}>
                            <View style={styles.documentLeft}>
                                <MaterialCommunityIcons
                                    name="file-document-outline"
                                    size={24}
                                    color={colors.primary}
                                    style={styles.documentIcon}
                                />
                                <Text style={styles.documentLabel}>{docType.label}</Text>
                            </View>
                            <View style={styles.documentRight}>
                                <Button
                                    title={uploadingId === docType.id ? 'Uploading...' : 'Upload PDF'}
                                    variant="outline"
                                    onPress={() => handleUploadPress(docType)}
                                    style={styles.uploadButton}
                                    textStyle={styles.uploadButtonText}
                                    loading={uploadingId === docType.id}
                                />
                            </View>
                        </View>
                    </PremiumCard>
                ))}

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
        paddingBottom: 12,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.white,
        letterSpacing: 0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: colors.white,
        opacity: 0.9,
        marginTop: 4,
    },
    scrollView: {
        flex: 1,
        marginTop: -20,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 16,
    },
    infoCard: {
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    infoIcon: {
        marginRight: 10,
        marginTop: 2,
    },
    infoText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    infoSubtext: {
        fontSize: 13,
        color: colors.textSecondary,
        lineHeight: 18,
    },
    documentCard: {
        marginBottom: 12,
    },
    documentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    documentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    documentIcon: {
        marginRight: 10,
    },
    documentLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.textPrimary,
        flexShrink: 1,
    },
    documentRight: {
        flexShrink: 0,
    },
    uploadButton: {
        minHeight: 40,
        paddingVertical: 8,
        paddingHorizontal: 14,
        shadowOpacity: 0,
        elevation: 0,
    },
    uploadButtonText: {
        fontSize: 13,
    },
});

export default StudentDocuments;


