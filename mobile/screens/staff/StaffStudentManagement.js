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
import { useAuth } from '../../context/AuthContext';
import { staffService } from '../../services/staffService';
import { addMscCS1stYearStudents } from '../../utils/addMscCS1stYearStudents';
import { addMtechDSStudents } from '../../utils/addMtechDSStudents';
import { createStaffAccounts } from '../../utils/createStaffAccounts';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';

const StaffStudentManagement = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
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
        // Auto-import M.Sc CS 1st Year students if no students exist
        checkAndAutoImport();
    }, [course, program, year]);

    const checkAndAutoImport = async () => {
        try {
            console.log('🔍 Checking for M.Sc CS 1st Year students...');
            
            // Wait a bit for component to fully load
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Check if M.Sc CS 1st Year students exist
            const mscCS1stYearStudents = await staffService.getStudents({ program: 'M.Sc CS', year: 1 });
            
            console.log(`📊 Found ${mscCS1stYearStudents.length} M.Sc CS 1st Year students`);
            
            // If no M.Sc CS 1st Year students exist, auto-import them
            if (mscCS1stYearStudents.length === 0) {
                console.log('🚀 No M.Sc CS 1st Year students found. Starting auto-import in 1.5 seconds...');
                
                // Auto-import after a short delay
                setTimeout(async () => {
                    try {
                        console.log('🚀 Auto-import starting now...');
                        setImporting(true);
                        const result = await addMscCS1stYearStudents();
                        
                        console.log(`✅ Auto-import completed: ${result.success} students imported`);
                        if (result.failed > 0) {
                            console.warn(`⚠️ ${result.failed} students failed to import`);
                            console.warn('Errors:', result.errors);
                        }
                        
                        // Reload students list after import
                        setTimeout(async () => {
                            await loadStudents();
                            setImporting(false);
                            console.log('✅ Student list reloaded after auto-import');
                        }, 500);
                    } catch (error) {
                        console.error('❌ Auto-import failed:', error);
                        console.error('Error details:', error.message, error.stack);
                        setImporting(false);
                        Alert.alert(
                            'Auto-Import Failed',
                            `Could not auto-import students: ${error.message}\n\nPlease use the manual import button.`
                        );
                    }
                }, 1500);
            } else {
                console.log(`✅ Found ${mscCS1stYearStudents.length} M.Sc CS 1st Year students already in database`);
            }
        } catch (error) {
            console.error('❌ Error checking students:', error);
            console.error('Error details:', error.message, error.stack);
        }
    };

    const loadStudents = async () => {
        try {
            setLoading(true);
            const params = {};
            if (course) params.course = course;
            if (program) params.program = program;
            if (year) params.year = year;

            const data = await staffService.getStudents(params);
            // Ensure data is always an array
            setStudents(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading students:', error);
            // Set empty array on error to prevent crashes
            setStudents([]);
            Alert.alert('Error', 'Failed to load students. Please try again.');
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

    const handleBulkImportMtechDS = async () => {
        Alert.alert(
            'Bulk Import M.Tech DS & AI 1st Year',
            'This will add 22 M.Tech DS & AI 1st Year students to Firestore and local storage. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Import',
                    onPress: async () => {
                        setImporting(true);
                        try {
                            console.log('🚀 Manual M.Tech DS import triggered');
                            const result = await addMtechDSStudents();
                            
                            let message = `✅ Successfully imported ${result.success} students.`;
                            if (result.failed > 0) {
                                message += `\n\n❌ Failed: ${result.failed} students`;
                                if (result.errors && result.errors.length > 0) {
                                    message += `\n\nErrors:\n${result.errors.slice(0, 3).map(e => `- ${e.name}: ${e.error}`).join('\n')}`;
                                    if (result.errors.length > 3) {
                                        message += `\n... and ${result.errors.length - 3} more`;
                                    }
                                }
                            }
                            
                            Alert.alert(
                                'Import Complete',
                                message,
                                [{ 
                                    text: 'OK', 
                                    onPress: async () => {
                                        await loadStudents();
                                        console.log('✅ Student list reloaded');
                                    }
                                }]
                            );
                        } catch (error) {
                            console.error('❌ Import error:', error);
                            Alert.alert(
                                'Import Failed', 
                                `Error: ${error.message || 'Unknown error'}\n\nCheck console for details.`
                            );
                        } finally {
                            setImporting(false);
                        }
                    }
                }
            ]
        );
    };

    const handleBulkImportMscCS1stYear = async () => {
        Alert.alert(
            'Bulk Import M.Sc CS 1st Year',
            'This will add 50 M.Sc CS 1st Year students to Firestore and local storage. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Import',
                    onPress: async () => {
                        setImporting(true);
                        try {
                            console.log('🚀 Manual import triggered');
                            const result = await addMscCS1stYearStudents();
                            
                            let message = `✅ Successfully imported ${result.success} students.`;
                            if (result.failed > 0) {
                                message += `\n\n❌ Failed: ${result.failed} students`;
                                if (result.errors && result.errors.length > 0) {
                                    message += `\n\nErrors:\n${result.errors.slice(0, 3).map(e => `- ${e.name}: ${e.error}`).join('\n')}`;
                                    if (result.errors.length > 3) {
                                        message += `\n... and ${result.errors.length - 3} more`;
                                    }
                                }
                            }
                            
                            Alert.alert(
                                'Import Complete',
                                message,
                                [{ 
                                    text: 'OK', 
                                    onPress: async () => {
                                        await loadStudents();
                                        console.log('✅ Student list reloaded');
                                    }
                                }]
                            );
                        } catch (error) {
                            console.error('❌ Import error:', error);
                            Alert.alert(
                                'Import Failed', 
                                `Error: ${error.message || 'Unknown error'}\n\nCheck console for details.`
                            );
                        } finally {
                            setImporting(false);
                        }
                    }
                }
            ]
        );
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
                            onValueChange={(value) => {
                                setCourse(value);
                                if (!value) setProgram('');
                            }}
                            style={styles.picker}
                        >
                            <Picker.Item label="All Courses" value="" />
                            <Picker.Item label="UG" value="UG" />
                            <Picker.Item label="PG" value="PG" />
                        </Picker>
                    </View>
                    <View style={styles.filterItem}>
                        <Picker
                            selectedValue={program}
                            onValueChange={setProgram}
                            style={styles.picker}
                            enabled={!!course}
                        >
                            <Picker.Item label="All Programs" value="" />
                            {course === 'UG' && (
                                <>
                                    <Picker.Item label="B.Tech" value="B.Tech" />
                                    <Picker.Item label="B.Sc CS" value="B.Sc CS" />
                                </>
                            )}
                            {course === 'PG' && (
                                <>
                                    <Picker.Item label="M.Sc CS" value="M.Sc CS" />
                                    <Picker.Item label="M.Sc DS" value="M.Sc DS" />
                                    <Picker.Item label="M.Sc CS Integrated" value="M.Sc CS Integrated" />
                                    <Picker.Item label="MCA" value="MCA" />
                                    <Picker.Item label="M.Tech DS" value="M.Tech DS" />
                                    <Picker.Item label="M.Tech NIS" value="M.Tech NIS" />
                                    <Picker.Item label="M.Tech CSE" value="M.Tech CSE" />
                                </>
                            )}
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
                            <Picker.Item label="Year 5" value="5" />
                            <Picker.Item label="Year 6" value="6" />
                        </Picker>
                    </View>
                </View>
            </View>

            <View style={styles.headerRow}>
                <Text style={styles.countText}>{students.length} Students</Text>
                <View style={styles.buttonRow}>
                    <TouchableOpacity 
                        style={[styles.addButton, styles.importButton]} 
                        onPress={handleBulkImportMscCS1stYear}
                        disabled={importing}
                    >
                        <Text style={styles.addButtonText}>
                            {importing ? 'Importing...' : '📥 M.Sc CS 1st'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.addButton, styles.importButton]} 
                        onPress={handleBulkImportMtechDS}
                        disabled={importing}
                    >
                        <Text style={styles.addButtonText}>
                            {importing ? 'Importing...' : '📥 M.Tech DS 1st'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addButton} onPress={handleAddStudent}>
                        <Text style={styles.addButtonText}>+ Add</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Staff Account Creation Button (Office Only) */}
            {user?.profile?.role === 'Office' && (
                <View style={styles.adminSection}>
                    <TouchableOpacity 
                        style={styles.createStaffButton}
                        onPress={async () => {
                            Alert.alert(
                                'Create Staff Accounts',
                                'This will create 19 staff accounts with default password "Pass@123". Continue?',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    {
                                        text: 'Create',
                                        onPress: async () => {
                                            setImporting(true);
                                            try {
                                                const result = await createStaffAccounts();
                                                Alert.alert(
                                                    'Staff Accounts Created',
                                                    `Successfully created/verified ${result.success} staff accounts.\n\nDefault password: Pass@123\n\nStaff can change password in Profile section after login.`
                                                );
                                            } catch (error) {
                                                Alert.alert('Error', error.message || 'Failed to create staff accounts');
                                            } finally {
                                                setImporting(false);
                                            }
                                        }
                                    }
                                ]
                            );
                        }}
                        disabled={importing}
                    >
                        <MaterialCommunityIcons name="account-plus" size={20} color={colors.white} />
                        <Text style={styles.createStaffButtonText}>
                            {importing ? 'Creating...' : 'Create 19 Staff Accounts'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {!loading && students && students.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No students found</Text>
                        <Text style={styles.emptySubtext}>
                            {course || program || year 
                                ? 'Try adjusting your filters' 
                                : 'Add students using the + Add button'}
                        </Text>
                    </View>
                ) : (
                    (students || []).map((student) => {
                        if (!student) return null;
                        const studentId = student.id || student._id || student.registerNumber;
                        return (
                            <Card key={studentId}>
                                <View style={styles.studentHeader}>
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>{student.name?.charAt(0) || '?'}</Text>
                                    </View>
                                    <View style={styles.studentInfo}>
                                        <Text style={styles.studentName}>{student.name || 'Unknown'}</Text>
                                        <Text style={styles.registerNumber}>{student.registerNumber || 'N/A'}</Text>
                                        <Text style={styles.courseInfo}>
                                            {student.course || ''} - {student.program || ''} - Year {student.year || ''}
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
                        );
                    })
                )}
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
    buttonRow: {
        flexDirection: 'row',
        gap: 8,
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
    importButton: {
        backgroundColor: colors.primary,
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
    adminSection: {
        padding: 16,
        backgroundColor: colors.warning + '10',
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.warning + '30',
    },
    createStaffButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.warning,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
    },
    createStaffButtonText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
    },
});

export default StaffStudentManagement;
