import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Modal,
    Alert,
    Picker,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { staffService } from '../../services/staffService';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';

const StaffInternalsScreen = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const [filters, setFilters] = useState({
        course: 'UG',
        program: 'B.Tech',
        year: 3,
        section: 'A',
    });

    const [internalsData, setInternalsData] = useState({
        subject: '',
        examName: '',
        maxMarks: 50,
        marks: {}
    });

    useEffect(() => {
        loadStudents();
    }, [filters]);

    const loadStudents = async () => {
        setLoading(true);
        try {
            const data = await staffService.getStudents(filters);
            setStudents(data);

            // Initialize marks
            const initialMarks = {};
            data.forEach(student => {
                initialMarks[student._id] = '';
            });
            setInternalsData(prev => ({ ...prev, marks: initialMarks }));
        } catch (error) {
            console.error('Error loading students:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateMarks = (studentId, marks) => {
        setInternalsData(prev => ({
            ...prev,
            marks: {
                ...prev.marks,
                [studentId]: marks
            }
        }));
    };

    const handleSubmitInternals = async () => {
        try {
            if (!internalsData.subject || !internalsData.examName) {
                Alert.alert('Error', 'Please fill subject and exam name');
                return;
            }

            const marksData = Object.entries(internalsData.marks)
                .filter(([_, marks]) => marks !== '')
                .map(([studentId, marks]) => ({
                    student: studentId,
                    subject: internalsData.subject,
                    examName: internalsData.examName,
                    maxMarks: internalsData.maxMarks,
                    marksObtained: parseInt(marks),
                }));

            await staffService.uploadInternals(marksData);
            Alert.alert('Success', 'Internal marks uploaded successfully');
            setModalVisible(false);
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to upload marks');
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Internal Marks" subtitle="Upload Student Internals" />

            <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Select Class:</Text>
                <View style={styles.filterRow}>
                    <View style={styles.filterItem}>
                        <Picker
                            selectedValue={filters.course}
                            onValueChange={(value) => setFilters({ ...filters, course: value })}
                            style={styles.picker}
                        >
                            <Picker.Item label="UG" value="UG" />
                            <Picker.Item label="PG" value="PG" />
                        </Picker>
                    </View>
                    <View style={styles.filterItem}>
                        <Picker
                            selectedValue={filters.year}
                            onValueChange={(value) => setFilters({ ...filters, year: value })}
                            style={styles.picker}
                        >
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
                <TouchableOpacity
                    style={styles.configButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.configButtonText}>⚙️ Configure</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {internalsData.subject && internalsData.examName ? (
                    <>
                        <Card>
                            <Text style={styles.examInfo}>
                                Subject: <Text style={styles.examValue}>{internalsData.subject}</Text>
                            </Text>
                            <Text style={styles.examInfo}>
                                Exam: <Text style={styles.examValue}>{internalsData.examName}</Text>
                            </Text>
                            <Text style={styles.examInfo}>
                                Max Marks: <Text style={styles.examValue}>{internalsData.maxMarks}</Text>
                            </Text>
                        </Card>

                        {students.map((student) => (
                            <Card key={student._id}>
                                <View style={styles.studentRow}>
                                    <View style={styles.studentInfo}>
                                        <Text style={styles.studentName}>{student.name}</Text>
                                        <Text style={styles.registerNumber}>{student.registerNumber}</Text>
                                    </View>
                                    <TextInput
                                        style={styles.marksInput}
                                        placeholder="Marks"
                                        value={internalsData.marks[student._id]}
                                        onChangeText={(text) => updateMarks(student._id, text)}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </Card>
                        ))}

                        <Button
                            title="Submit Internal Marks"
                            onPress={handleSubmitInternals}
                            style={styles.submitButton}
                        />
                    </>
                ) : (
                    <Card>
                        <Text style={styles.emptyText}>
                            Configure subject and exam details to start entering marks
                        </Text>
                    </Card>
                )}
            </ScrollView>

            {/* Configuration Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Configure Internal Exam</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Subject Name *"
                            value={internalsData.subject}
                            onChangeText={(text) => setInternalsData({ ...internalsData, subject: text })}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Exam Name (e.g., Internal 1) *"
                            value={internalsData.examName}
                            onChangeText={(text) => setInternalsData({ ...internalsData, examName: text })}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Maximum Marks"
                            value={internalsData.maxMarks.toString()}
                            onChangeText={(text) => setInternalsData({ ...internalsData, maxMarks: parseInt(text) || 50 })}
                            keyboardType="numeric"
                        />

                        <View style={styles.modalButtons}>
                            <Button
                                title="Cancel"
                                variant="outline"
                                onPress={() => setModalVisible(false)}
                                style={styles.modalButton}
                            />
                            <Button
                                title="Save"
                                onPress={() => setModalVisible(false)}
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
    configButton: {
        backgroundColor: colors.info,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    configButtonText: {
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
    examInfo: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    examValue: {
        fontWeight: '600',
        color: colors.primary,
    },
    studentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    marksInput: {
        width: 80,
        backgroundColor: colors.gray100,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        borderWidth: 2,
        borderColor: colors.primary,
    },
    submitButton: {
        marginTop: 16,
        marginBottom: 32,
    },
    emptyText: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
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
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 16,
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

export default StaffInternalsScreen;
