import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    Alert,
    TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { officeService } from '../../services/officeService';
import PremiumHeader from '../../components/PremiumHeader';
import PremiumCard from '../../components/PremiumCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';

const OfficeFeeManagement = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const [feeData, setFeeData] = useState({
        feeType: 'semester',
        status: 'Paid',
        amount: '',
        paidDate: '',
        reference: '',
    });

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            const data = await officeService.getStudents();
            setStudents(data);
        } catch (error) {
            console.error('Error loading students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateFee = (student) => {
        setSelectedStudent(student);
        setFeeData({
            feeType: 'semester',
            status: 'Paid',
            amount: '',
            paidDate: new Date().toISOString().split('T')[0],
            reference: '',
        });
        setModalVisible(true);
    };

    const handleSaveFee = async () => {
        try {
            const studentId = selectedStudent.id || selectedStudent._id || selectedStudent.registerNumber;
            
            // Format fee data for Firestore
            const feeUpdate = {
                [feeData.feeType]: {
                    status: feeData.status,
                    amount: feeData.amount || null,
                    paidDate: feeData.paidDate || null,
                    reference: feeData.reference || null,
                }
            };
            
            await officeService.updateFees(studentId, feeUpdate);
            Alert.alert('Success', 'Fee status updated successfully');
            setModalVisible(false);
            loadStudents();
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to update fee status');
        }
    };

    const getFeeStatusColor = (status) => {
        return status === 'Paid' ? colors.success : colors.error;
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <View style={styles.container}>
            <PremiumHeader 
                title="Fee Management" 
                subtitle="Manage Student Fees"
                showAvatar={false}
            />

            <View style={styles.headerRow}>
                <Text style={styles.countText}>{students.length} Students</Text>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {students.length === 0 ? (
                    <PremiumCard style={styles.emptyCard}>
                        <MaterialCommunityIcons name="account-off-outline" size={48} color={colors.gray300} />
                        <Text style={styles.emptyText}>No students found</Text>
                    </PremiumCard>
                ) : (
                    students.map((student) => (
                        <PremiumCard key={student.id || student._id || student.registerNumber} style={styles.studentCard}>
                        <View style={styles.studentHeader}>
                            <View>
                                <Text style={styles.studentName}>{student.name}</Text>
                                <Text style={styles.registerNumber}>{student.registerNumber}</Text>
                                <Text style={styles.courseInfo}>
                                    {student.course} - {student.program} - Year {student.year}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.feeContainer}>
                            <View style={styles.feeRow}>
                                <Text style={styles.feeLabel}>Semester Fee:</Text>
                                <View
                                    style={[
                                        styles.feeStatus,
                                        { backgroundColor: getFeeStatusColor(student.fees?.semester?.status || 'Not Paid') },
                                    ]}
                                >
                                    <Text style={styles.feeStatusText}>{student.fees?.semester?.status || 'Not Paid'}</Text>
                                </View>
                            </View>

                            <View style={styles.feeRow}>
                                <Text style={styles.feeLabel}>Exam Fee:</Text>
                                <View
                                    style={[
                                        styles.feeStatus,
                                        { backgroundColor: getFeeStatusColor(student.fees?.exam?.status || 'Not Paid') },
                                    ]}
                                >
                                    <Text style={styles.feeStatusText}>{student.fees?.exam?.status || 'Not Paid'}</Text>
                                </View>
                            </View>

                            {student.fees?.hostel?.status && student.fees?.hostel?.status !== 'N/A' && (
                                <View style={styles.feeRow}>
                                    <Text style={styles.feeLabel}>Hostel Fee:</Text>
                                    <View
                                        style={[
                                            styles.feeStatus,
                                            { backgroundColor: getFeeStatusColor(student.fees?.hostel?.status) },
                                        ]}
                                    >
                                        <Text style={styles.feeStatusText}>{student.fees?.hostel?.status}</Text>
                                    </View>
                                </View>
                            )}
                        </View>

                        <TouchableOpacity
                            style={styles.updateButton}
                            onPress={() => handleUpdateFee(student)}
                        >
                            <MaterialCommunityIcons name="pencil" size={16} color={colors.white} />
                            <Text style={styles.updateButtonText}>Update Fee Status</Text>
                        </TouchableOpacity>
                    </PremiumCard>
                    ))
                )}
            </ScrollView>

            {/* Update Fee Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Update Fee Status</Text>

                        {selectedStudent && (
                            <View style={styles.studentInfo}>
                                <Text style={styles.infoText}>{selectedStudent.name}</Text>
                                <Text style={styles.infoSubtext}>{selectedStudent.registerNumber}</Text>
                            </View>
                        )}

                        <Text style={styles.label}>Fee Type</Text>
                        <View style={styles.pickerContainer}>
                            <TouchableOpacity
                                style={[styles.pickerButton, feeData.feeType === 'semester' && styles.pickerButtonActive]}
                                onPress={() => setFeeData({ ...feeData, feeType: 'semester' })}
                            >
                                <Text style={[styles.pickerButtonText, feeData.feeType === 'semester' && styles.pickerButtonTextActive]}>
                                    Semester Fee
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.pickerButton, feeData.feeType === 'exam' && styles.pickerButtonActive]}
                                onPress={() => setFeeData({ ...feeData, feeType: 'exam' })}
                            >
                                <Text style={[styles.pickerButtonText, feeData.feeType === 'exam' && styles.pickerButtonTextActive]}>
                                    Exam Fee
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.pickerButton, feeData.feeType === 'hostel' && styles.pickerButtonActive]}
                                onPress={() => setFeeData({ ...feeData, feeType: 'hostel' })}
                            >
                                <Text style={[styles.pickerButtonText, feeData.feeType === 'hostel' && styles.pickerButtonTextActive]}>
                                    Hostel Fee
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Status</Text>
                        <View style={styles.pickerContainer}>
                            <TouchableOpacity
                                style={[styles.pickerButton, feeData.status === 'Paid' && styles.pickerButtonActive]}
                                onPress={() => setFeeData({ ...feeData, status: 'Paid' })}
                            >
                                <Text style={[styles.pickerButtonText, feeData.status === 'Paid' && styles.pickerButtonTextActive]}>
                                    Paid
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.pickerButton, feeData.status === 'Not Paid' && styles.pickerButtonActive]}
                                onPress={() => setFeeData({ ...feeData, status: 'Not Paid' })}
                            >
                                <Text style={[styles.pickerButtonText, feeData.status === 'Not Paid' && styles.pickerButtonTextActive]}>
                                    Not Paid
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Amount"
                            value={feeData.amount}
                            onChangeText={(text) => setFeeData({ ...feeData, amount: text })}
                            keyboardType="numeric"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Paid Date (YYYY-MM-DD)"
                            value={feeData.paidDate}
                            onChangeText={(text) => setFeeData({ ...feeData, paidDate: text })}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Payment Reference"
                            value={feeData.reference}
                            onChangeText={(text) => setFeeData({ ...feeData, reference: text })}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonCancel]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.modalButtonCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonConfirm]}
                                onPress={handleSaveFee}
                            >
                                <Text style={styles.modalButtonConfirmText}>Update</Text>
                            </TouchableOpacity>
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
    headerRow: {
        padding: 16,
    },
    countText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    studentHeader: {
        marginBottom: 12,
    },
    studentName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    registerNumber: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 2,
    },
    courseInfo: {
        fontSize: 12,
        color: colors.textLight,
        marginTop: 2,
    },
    feeContainer: {
        marginBottom: 12,
    },
    feeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    feeLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    feeStatus: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    feeStatusText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.white,
    },
    studentCard: {
        marginBottom: 16,
        padding: 16,
    },
    updateButton: {
        backgroundColor: colors.primary,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 8,
    },
    updateButtonText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    emptyCard: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyText: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 20,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 16,
    },
    studentInfo: {
        backgroundColor: colors.gray50,
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    infoText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    infoSubtext: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 2,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
        marginTop: 8,
        marginBottom: 4,
    },
    input: {
        backgroundColor: colors.gray100,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 14,
        marginBottom: 12,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
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
        backgroundColor: colors.primary,
    },
    modalButtonConfirmText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    pickerContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    pickerButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: colors.gray100,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    pickerButtonActive: {
        backgroundColor: colors.primary + '15',
        borderColor: colors.primary,
    },
    pickerButtonText: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    pickerButtonTextActive: {
        color: colors.primary,
        fontWeight: '600',
    },
});

export default OfficeFeeManagement;
