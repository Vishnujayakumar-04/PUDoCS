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

const StaffStudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Filters
    const [course, setCourse] = useState('');
    const [program, setProgram] = useState('');
    const [year, setYear] = useState('');

    // Form data
    const [formData, setFormData] = useState({
        name: '',
        registerNumber: '',
        email: '',
        course: 'UG',
        program: '',
        year: 1,
        section: 'A',
    });

    useEffect(() => {
        loadStudents();
    }, [course, program, year]);

    const loadStudents = async () => {
        try {
            const params = {};
            if (course) params.course = course;
            if (program) params.program = program;
            if (year) params.year = year;

            const data = await staffService.getStudents(params);
            setStudents(data);
        } catch (error) {
            console.error('Error loading students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStudent = () => {
        setEditMode(false);
        setFormData({
            name: '',
            registerNumber: '',
            email: '',
            course: 'UG',
            program: '',
            year: 1,
            section: 'A',
        });
        setModalVisible(true);
    };

    const handleEditStudent = (student) => {
        setEditMode(true);
        setSelectedStudent(student);
        setFormData({
            name: student.name,
            registerNumber: student.registerNumber,
            email: student.email,
            course: student.course,
            program: student.program,
            year: student.year,
            section: student.section,
        });
        setModalVisible(true);
    };

    const handleSaveStudent = async () => {
        try {
            if (editMode) {
                await staffService.updateStudent(selectedStudent._id, formData);
                Alert.alert('Success', 'Student updated successfully');
            } else {
                await staffService.addStudent(formData);
                Alert.alert('Success', 'Student added successfully');
            }
            setModalVisible(false);
            loadStudents();
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to save student');
        }
    };

    const handleDeleteStudent = (student) => {
        Alert.alert(
            'Confirm Delete',
            `Are you sure you want to deactivate ${student.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await staffService.deleteStudent(student._id);
                            Alert.alert('Success', 'Student deactivated');
                            loadStudents();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete student');
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Student Management" subtitle="Add, Edit, Remove Students" />

            <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Filter Students:</Text>
                <View style={styles.filterRow}>
                    <View style={styles.filterItem}>
                        <Picker
                            selectedValue={course}
                            onValueChange={setCourse}
                            style={styles.picker}
                        >
                            <Picker.Item label="All Courses" value="" />
                            <Picker.Item label="UG" value="UG" />
                            <Picker.Item label="PG" value="PG" />
                        </Picker>
                    </View>
                    <View style={styles.filterItem}>
                        <Picker
                            selectedValue={year}
                            onValueChange={setYear}
                            style={styles.picker}
                        >
                            <Picker.Item label="All Years" value="" />
                            <Picker.Item label="Year 1" value="1" />
                            <Picker.Item label="Year 2" value="2" />
                            <Picker.Item label="Year 3" value="3" />
                            <Picker.Item label="Year 4" value="4" />
                        </Picker>
                    </View>
                </View>
            </View>

            <View style={styles.headerRow}>
                <Text style={styles.countText}>{students.length} Students</Text>
                <TouchableOpacity style={styles.addButton} onPress={handleAddStudent}>
                    <Text style={styles.addButtonText}>+ Add Student</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {students.map((student) => (
                    <Card key={student._id}>
                        <View style={styles.studentHeader}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{student.name.charAt(0)}</Text>
                            </View>
                            <View style={styles.studentInfo}>
                                <Text style={styles.studentName}>{student.name}</Text>
                                <Text style={styles.registerNumber}>{student.registerNumber}</Text>
                                <Text style={styles.courseInfo}>
                                    {student.course} - {student.program} - Year {student.year}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: colors.info }]}
                                onPress={() => handleEditStudent(student)}
                            >
                                <Text style={styles.actionButtonText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: colors.error }]}
                                onPress={() => handleDeleteStudent(student)}
                            >
                                <Text style={styles.actionButtonText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </Card>
                ))}
            </ScrollView>

            {/* Add/Edit Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {editMode ? 'Edit Student' : 'Add New Student'}
                        </Text>

                        <ScrollView>
                            <TextInput
                                style={styles.input}
                                placeholder="Name"
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Register Number"
                                value={formData.registerNumber}
                                onChangeText={(text) => setFormData({ ...formData, registerNumber: text })}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                                keyboardType="email-address"
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

                            <Text style={styles.label}>Year</Text>
                            <Picker
                                selectedValue={formData.year}
                                onValueChange={(value) => setFormData({ ...formData, year: value })}
                                style={styles.input}
                            >
                                <Picker.Item label="1" value={1} />
                                <Picker.Item label="2" value={2} />
                                <Picker.Item label="3" value={3} />
                                <Picker.Item label="4" value={4} />
                            </Picker>

                            <TextInput
                                style={styles.input}
                                placeholder="Section"
                                value={formData.section}
                                onChangeText={(text) => setFormData({ ...formData, section: text })}
                            />
                        </ScrollView>

                        <View style={styles.modalButtons}>
                            <Button
                                title="Cancel"
                                variant="outline"
                                onPress={() => setModalVisible(false)}
                                style={styles.modalButton}
                            />
                            <Button
                                title="Save"
                                onPress={handleSaveStudent}
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
    filterContainer: {
        backgroundColor: colors.white,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    filterRow: {
        flexDirection: 'row',
        gap: 12,
    },
    filterItem: {
        flex: 1,
    },
    picker: {
        backgroundColor: colors.gray100,
        borderRadius: 8,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    countText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    addButton: {
        backgroundColor: colors.secondary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    studentHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.white,
    },
    studentInfo: {
        flex: 1,
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
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: 'center',
    },
    actionButtonText: {
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

export default StaffStudentManagement;
