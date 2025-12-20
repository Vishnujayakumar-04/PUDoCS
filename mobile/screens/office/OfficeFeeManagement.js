import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    Alert,
    Picker,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { officeService } from '../../services/officeService';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
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
            await officeService.updateFees(selectedStudent._id, feeData);
            Alert.alert('Success', 'Fee status updated successfully');
            setModalVisible(false);
            loadStudents();
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to update fee status');
        }
    };

    const getFeeStatusColor = (status) => {
        return status === 'Paid' ? colors.paid : colors.notPaid;
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Fee Management" subtitle="Manage Student Fees" />

            <View style={styles.headerRow}>
                <Text style={styles.countText}>{students.length} Students</Text>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {students.map((student) => (
                    <Card key={student._id}>
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
                                        { backgroundColor: getFeeStatusColor(student.fees?.semester?.status) },
                                    ]}
                                >
                                    <Text style={styles.feeStatusText}>{student.fees?.semester?.status}</Text>
                                </View>
                            </View>

                            <View style={styles.feeRow}>
                                <Text style={styles.feeLabel}>Exam Fee:</Text>
                                <View
                                    style={[
                                        styles.feeStatus,
                                        { backgroundColor: getFeeStatusColor(student.fees?.exam?.status) },
                                    ]}
                                >
                                    <Text style={styles.feeStatusText}>{student.fees?.exam?.status}</Text>
                                </View>
                            </View>

                            {student.fees?.hostel?.status !== 'N/A' && (
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
                            <Text style={styles.updateButtonText}>Update Fee Status</Text>
                        </TouchableOpacity>
                    </Card>
                ))}
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
                        <Picker
                            selectedValue={feeData.feeType}
                            onValueChange={(value) => setFeeData({ ...feeData, feeType: value })}
                            style={styles.input}
                        >
                            <Picker.Item label="Semester Fee" value="semester" />
                            <Picker.Item label="Exam Fee" value="exam" />
                            <Picker.Item label="Hostel Fee" value="hostel" />
                        </Picker>

                        <Text style={styles.label}>Status</Text>
                        <Picker
                            selectedValue={feeData.status}
                            onValueChange={(value) => setFeeData({ ...feeData, status: value })}
                            style={styles.input}
                        >
                            <Picker.Item label="Paid" value="Paid" />
                            <Picker.Item label="Not Paid" value="Not Paid" />
                        </Picker>

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
                            <Button
                                title="Cancel"
                                variant="outline"
                                onPress={() => setModalVisible(false)}
                                style={styles.modalButton}
                            />
                            <Button
                                title="Update"
                                onPress={handleSaveFee}
                                style={styles.modalButton}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
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
    updateButton: {
        backgroundColor: colors.accent,
        paddingVertical: 10,
        borderRadius: 6,
        alignItems: 'center',
    },
    updateButtonText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
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
    },
});

export default OfficeFeeManagement;
