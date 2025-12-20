import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
    Picker,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { staffService } from '../../services/staffService';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';

const StaffExamManagement = ({ navigation }) => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        examType: 'Internal',
        date: '',
        startTime: '',
        endTime: '',
        duration: '',
        course: 'UG',
        program: '',
        year: 1,
        semester: 1,
    });

    const loadExams = async () => {
        // In a real app, you'd fetch exams from the backend
        // For now, we'll keep it simple
    };

    const handleCreateExam = async () => {
        try {
            if (!formData.name || !formData.subject || !formData.date) {
                Alert.alert('Error', 'Please fill all required fields');
                return;
            }

            await staffService.createExam(formData);
            Alert.alert('Success', 'Exam created successfully');
            setModalVisible(false);
            resetForm();
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to create exam');
        }
    };

    const handleAllocateSeats = async (examId) => {
        Alert.alert(
            'Allocate Seats',
            'This will automatically allocate seats to all eligible students. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Allocate',
                    onPress: async () => {
                        try {
                            const result = await staffService.allocateSeats(examId);
                            Alert.alert(
                                'Success',
                                `Seats allocated successfully!\n\nTotal Students: ${result.stats.totalStudents}\nHalls Used: ${result.stats.hallsUsed}`
                            );
                            navigation.navigate('SeatAllocation', { exam: result.exam });
                        } catch (error) {
                            Alert.alert('Error', error.message || 'Failed to allocate seats');
                        }
                    },
                },
            ]
        );
    };

    const resetForm = () => {
        setFormData({
            name: '',
            subject: '',
            examType: 'Internal',
            date: '',
            startTime: '',
            endTime: '',
            duration: '',
            course: 'UG',
            program: '',
            year: 1,
            semester: 1,
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Exam Management" subtitle="Create & Manage Exams" />

            <View style={styles.headerRow}>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.createButtonText}>+ Create Exam</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Card>
                    <Text style={styles.infoText}>
                        📝 Create exams and allocate seats automatically based on student eligibility
                    </Text>
                </Card>

                <Text style={styles.sectionTitle}>Quick Actions</Text>

                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.actionIcon}>📝</Text>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Create New Exam</Text>
                        <Text style={styles.actionDescription}>
                            Set up exam details and schedule
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => navigation.navigate('SeatAllocation')}
                >
                    <Text style={styles.actionIcon}>🪑</Text>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>View Seat Allocations</Text>
                        <Text style={styles.actionDescription}>
                            Check and manage seat assignments
                        </Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>

            {/* Create Exam Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Create New Exam</Text>

                        <ScrollView>
                            <TextInput
                                style={styles.input}
                                placeholder="Exam Name *"
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Subject *"
                                value={formData.subject}
                                onChangeText={(text) => setFormData({ ...formData, subject: text })}
                            />

                            <Text style={styles.label}>Exam Type</Text>
                            <Picker
                                selectedValue={formData.examType}
                                onValueChange={(value) => setFormData({ ...formData, examType: value })}
                                style={styles.input}
                            >
                                <Picker.Item label="Internal" value="Internal" />
                                <Picker.Item label="Semester" value="Semester" />
                                <Picker.Item label="Supplementary" value="Supplementary" />
                            </Picker>

                            <TextInput
                                style={styles.input}
                                placeholder="Date (YYYY-MM-DD) *"
                                value={formData.date}
                                onChangeText={(text) => setFormData({ ...formData, date: text })}
                            />

                            <View style={styles.timeRow}>
                                <TextInput
                                    style={[styles.input, styles.timeInput]}
                                    placeholder="Start Time (HH:MM)"
                                    value={formData.startTime}
                                    onChangeText={(text) => setFormData({ ...formData, startTime: text })}
                                />
                                <TextInput
                                    style={[styles.input, styles.timeInput]}
                                    placeholder="End Time (HH:MM)"
                                    value={formData.endTime}
                                    onChangeText={(text) => setFormData({ ...formData, endTime: text })}
                                />
                            </View>

                            <TextInput
                                style={styles.input}
                                placeholder="Duration (minutes)"
                                value={formData.duration}
                                onChangeText={(text) => setFormData({ ...formData, duration: text })}
                                keyboardType="numeric"
                            />

                            <Text style={styles.label}>Course</Text>
                            <Picker
                                selectedValue={formData.course}
                                onValueChange={(value) => setFormData({ ...formData, course: value })}
                                style={styles.input}
                            >
                                <Picker.Item label="UG" value="UG" />
                                <Picker.Item label="PG" value="PG" />
                            </Picker>

                            <TextInput
                                style={styles.input}
                                placeholder="Program (e.g., B.Tech, M.Sc CS)"
                                value={formData.program}
                                onChangeText={(text) => setFormData({ ...formData, program: text })}
                            />

                            <View style={styles.timeRow}>
                                <View style={styles.timeInput}>
                                    <Text style={styles.label}>Year</Text>
                                    <Picker
                                        selectedValue={formData.year}
                                        onValueChange={(value) => setFormData({ ...formData, year: value })}
                                    >
                                        <Picker.Item label="1" value={1} />
                                        <Picker.Item label="2" value={2} />
                                        <Picker.Item label="3" value={3} />
                                        <Picker.Item label="4" value={4} />
                                    </Picker>
                                </View>
                                <View style={styles.timeInput}>
                                    <Text style={styles.label}>Semester</Text>
                                    <Picker
                                        selectedValue={formData.semester}
                                        onValueChange={(value) => setFormData({ ...formData, semester: value })}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                            <Picker.Item key={sem} label={sem.toString()} value={sem} />
                                        ))}
                                    </Picker>
                                </View>
                            </View>
                        </ScrollView>

                        <View style={styles.modalButtons}>
                            <Button
                                title="Cancel"
                                variant="outline"
                                onPress={() => setModalVisible(false)}
                                style={styles.modalButton}
                            />
                            <Button
                                title="Create Exam"
                                onPress={handleCreateExam}
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
    createButton: {
        backgroundColor: colors.secondary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    createButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    infoText: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginTop: 16,
        marginBottom: 12,
    },
    actionCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionIcon: {
        fontSize: 40,
        marginRight: 16,
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    actionDescription: {
        fontSize: 14,
        color: colors.textSecondary,
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
        maxHeight: '90%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 16,
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
    timeRow: {
        flexDirection: 'row',
        gap: 12,
    },
    timeInput: {
        flex: 1,
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

export default StaffExamManagement;
