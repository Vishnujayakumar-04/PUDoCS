import React, { useState } from 'react';
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
import { officeService } from '../../services/officeService';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import colors from '../../styles/colors';

const OfficeResultsScreen = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [filters, setFilters] = useState({
        course: 'UG',
        program: 'B.Tech',
        year: 3,
        semester: 5,
    });

    const [resultData, setResultData] = useState({
        studentId: '',
        semester: 5,
        academicYear: '2024-2025',
        results: [
            {
                subject: '',
                subjectCode: '',
                credits: 3,
                grade: 'A',
                gradePoint: 9,
            }
        ],
        sgpa: '',
        cgpa: '',
    });

    const handleUploadResults = async () => {
        try {
            if (!resultData.studentId) {
                Alert.alert('Error', 'Please enter student ID');
                return;
            }

            await officeService.uploadResults(resultData);
            Alert.alert('Success', 'Results uploaded successfully');
            setModalVisible(false);
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to upload results');
        }
    };

    const addSubject = () => {
        setResultData({
            ...resultData,
            results: [
                ...resultData.results,
                {
                    subject: '',
                    subjectCode: '',
                    credits: 3,
                    grade: 'A',
                    gradePoint: 9,
                }
            ]
        });
    };

    const updateSubject = (index, field, value) => {
        const newResults = [...resultData.results];
        newResults[index][field] = value;
        setResultData({ ...resultData, results: newResults });
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Results Management" subtitle="Upload Semester Results" />

            <View style={styles.headerRow}>
                <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.uploadButtonText}>📊 Upload Results</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Card>
                    <Text style={styles.infoText}>
                        📝 Upload semester results for students including subject-wise grades, SGPA, and CGPA. Results can be locked after publication.
                    </Text>
                </Card>

                <Text style={styles.sectionTitle}>Guidelines</Text>

                <Card>
                    <Text style={styles.guideText}>
                        • Enter student register number{'\n'}
                        • Add all subjects with grades{'\n'}
                        • Calculate and enter SGPA and CGPA{'\n'}
                        • Verify before uploading{'\n'}
                        • Results are immediately visible to students
                    </Text>
                </Card>

                <Card title="Grade Points">
                    <View style={styles.gradeRow}>
                        <Text style={styles.gradeText}>O = 10 | A+ = 9 | A = 8</Text>
                    </View>
                    <View style={styles.gradeRow}>
                        <Text style={styles.gradeText}>B+ = 7 | B = 6 | C = 5</Text>
                    </View>
                    <View style={styles.gradeRow}>
                        <Text style={styles.gradeText}>P = 4 | F = 0 | Ab = 0</Text>
                    </View>
                </Card>
            </ScrollView>

            {/* Upload Results Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Upload Results</Text>

                        <ScrollView>
                            <TextInput
                                style={styles.input}
                                placeholder="Student Register Number *"
                                value={resultData.studentId}
                                onChangeText={(text) => setResultData({ ...resultData, studentId: text })}
                            />

                            <View style={styles.row}>
                                <View style={styles.halfWidth}>
                                    <Text style={styles.label}>Semester</Text>
                                    <Picker
                                        selectedValue={resultData.semester}
                                        onValueChange={(value) => setResultData({ ...resultData, semester: value })}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                            <Picker.Item key={sem} label={sem.toString()} value={sem} />
                                        ))}
                                    </Picker>
                                </View>
                                <View style={styles.halfWidth}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Academic Year"
                                        value={resultData.academicYear}
                                        onChangeText={(text) => setResultData({ ...resultData, academicYear: text })}
                                    />
                                </View>
                            </View>

                            <Text style={styles.sectionTitle}>Subjects</Text>
                            {resultData.results.map((subject, index) => (
                                <View key={index} style={styles.subjectCard}>
                                    <Text style={styles.subjectTitle}>Subject {index + 1}</Text>

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Subject Name"
                                        value={subject.subject}
                                        onChangeText={(text) => updateSubject(index, 'subject', text)}
                                    />

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Subject Code"
                                        value={subject.subjectCode}
                                        onChangeText={(text) => updateSubject(index, 'subjectCode', text)}
                                    />

                                    <View style={styles.row}>
                                        <View style={styles.halfWidth}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Credits"
                                                value={subject.credits.toString()}
                                                onChangeText={(text) => updateSubject(index, 'credits', parseInt(text) || 0)}
                                                keyboardType="numeric"
                                            />
                                        </View>
                                        <View style={styles.halfWidth}>
                                            <Picker
                                                selectedValue={subject.grade}
                                                onValueChange={(value) => updateSubject(index, 'grade', value)}
                                            >
                                                <Picker.Item label="O (10)" value="O" />
                                                <Picker.Item label="A+ (9)" value="A+" />
                                                <Picker.Item label="A (8)" value="A" />
                                                <Picker.Item label="B+ (7)" value="B+" />
                                                <Picker.Item label="B (6)" value="B" />
                                                <Picker.Item label="C (5)" value="C" />
                                                <Picker.Item label="P (4)" value="P" />
                                                <Picker.Item label="F (0)" value="F" />
                                            </Picker>
                                        </View>
                                    </View>
                                </View>
                            ))}

                            <TouchableOpacity style={styles.addButton} onPress={addSubject}>
                                <Text style={styles.addButtonText}>+ Add Subject</Text>
                            </TouchableOpacity>

                            <View style={styles.row}>
                                <TextInput
                                    style={[styles.input, styles.halfWidth]}
                                    placeholder="SGPA"
                                    value={resultData.sgpa}
                                    onChangeText={(text) => setResultData({ ...resultData, sgpa: text })}
                                    keyboardType="decimal-pad"
                                />
                                <TextInput
                                    style={[styles.input, styles.halfWidth]}
                                    placeholder="CGPA"
                                    value={resultData.cgpa}
                                    onChangeText={(text) => setResultData({ ...resultData, cgpa: text })}
                                    keyboardType="decimal-pad"
                                />
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
                                title="Upload"
                                onPress={handleUploadResults}
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
    uploadButton: {
        backgroundColor: colors.info,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    uploadButtonText: {
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
    guideText: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    gradeRow: {
        paddingVertical: 4,
    },
    gradeText: {
        fontSize: 14,
        color: colors.textPrimary,
        fontFamily: 'monospace',
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
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    subjectCard: {
        backgroundColor: colors.gray50,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    subjectTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.info,
        marginBottom: 8,
    },
    addButton: {
        backgroundColor: colors.accent,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    addButtonText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
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

export default OfficeResultsScreen;
