import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { staffService } from '../../services/staffService';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import colors from '../../styles/colors';

const OfficeStaffDirectory = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        designation: '',
        department: 'Computer Science',
        courseCoordinator: '',
        subjectsHandledText: '',
    });

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async () => {
        try {
            setLoading(true);
            const list = await staffService.getAllStaff();
            // Show only active staff by default
            const active = Array.isArray(list) ? list.filter(s => s.isActive !== false) : [];
            setStaff(active);
        } catch (error) {
            console.error('Error loading staff directory:', error);
            Alert.alert('Error', 'Failed to load staff directory.');
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditMode(false);
        setSelectedStaff(null);
        setFormData({
            name: '',
            email: '',
            designation: '',
            department: 'Computer Science',
            courseCoordinator: '',
            subjectsHandledText: '',
        });
        setModalVisible(true);
    };

    const openEditModal = (staffMember) => {
        setEditMode(true);
        setSelectedStaff(staffMember);
        setFormData({
            name: staffMember.name || '',
            email: staffMember.email || staffMember.id || '',
            designation: staffMember.designation || '',
            department: staffMember.department || 'Computer Science',
            courseCoordinator: staffMember.courseCoordinator || '',
            subjectsHandledText: Array.isArray(staffMember.subjectsHandled)
                ? staffMember.subjectsHandled.join(', ')
                : '',
        });
        setModalVisible(true);
    };

    const handleSave = async () => {
        try {
            if (!formData.name.trim() || !formData.email.trim()) {
                Alert.alert('Validation', 'Name and Email are required.');
                return;
            }

            const payload = {
                name: formData.name.trim(),
                email: formData.email.toLowerCase().trim(),
                designation: formData.designation.trim(),
                department: formData.department.trim() || 'Computer Science',
                courseCoordinator: formData.courseCoordinator.trim(),
                subjectsHandled: formData.subjectsHandledText
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean),
                isActive: true,
            };

            if (editMode && selectedStaff) {
                await staffService.updateStaff(payload.email, payload);
                Alert.alert('Success', 'Staff details updated successfully.');
            } else {
                await staffService.addStaff(payload);
                Alert.alert('Success', 'Staff added successfully.');
            }

            setModalVisible(false);
            setSelectedStaff(null);
            await loadStaff();
        } catch (error) {
            console.error('Error saving staff:', error);
            Alert.alert('Error', error.message || 'Failed to save staff details.');
        }
    };

    const handleDelete = async (staffMember) => {
        Alert.alert(
            'Remove Staff',
            `Are you sure you want to remove ${staffMember.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const email = (staffMember.email || staffMember.id || '').toLowerCase().trim();
                            if (!email) {
                                Alert.alert('Error', 'Staff email is missing.');
                                return;
                            }
                            await staffService.deleteStaff(email);
                            Alert.alert('Success', 'Staff removed successfully.');
                            await loadStaff();
                        } catch (error) {
                            console.error('Error removing staff:', error);
                            Alert.alert('Error', error.message || 'Failed to remove staff.');
                        }
                    },
                },
            ]
        );
    };

    const renderStaffCard = (staffMember) => {
        return (
            <Card key={staffMember.id || staffMember.email}>
                <View style={styles.staffRow}>
                    <View style={styles.staffInfo}>
                        <Text style={styles.staffName} numberOfLines={1}>
                            {staffMember.name}
                        </Text>
                        <Text style={styles.staffEmail} numberOfLines={1}>
                            {staffMember.email}
                        </Text>
                        <Text style={styles.staffMeta} numberOfLines={2}>
                            {staffMember.designation || 'Staff'} • {staffMember.department || 'Computer Science'}
                        </Text>
                    </View>
                    <View style={styles.actionsColumn}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.editButton]}
                            onPress={() => openEditModal(staffMember)}
                        >
                            <MaterialCommunityIcons name="pencil" size={16} color={colors.white} />
                            <Text style={styles.actionButtonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={() => handleDelete(staffMember)}
                        >
                            <MaterialCommunityIcons name="delete" size={16} color={colors.white} />
                            <Text style={styles.actionButtonText}>Remove</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Card>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Staff Directory" subtitle="Manage Department Staff" />

            <View style={styles.headerRow}>
                <Text style={styles.countText}>{staff.length} Staff Members</Text>
                <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
                    <MaterialCommunityIcons name="account-plus" size={18} color={colors.white} />
                    <Text style={styles.addButtonText}>Add Staff</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {loading ? (
                    <Text style={styles.loadingText}>Loading staff...</Text>
                ) : staff.length === 0 ? (
                    <Card>
                        <Text style={styles.emptyText}>
                            No staff records found. Use &quot;Add Staff&quot; to create a new staff record.
                        </Text>
                    </Card>
                ) : (
                    staff.map(renderStaffCard)
                )}
            </ScrollView>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editMode ? 'Edit Staff' : 'Add Staff'}</Text>

                        <ScrollView>
                            <Text style={styles.label}>Name *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Full Name"
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                            />

                            <Text style={styles.label}>Email *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                            />

                            <Text style={styles.label}>Designation</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Professor / Associate Professor / Assistant Professor"
                                value={formData.designation}
                                onChangeText={(text) => setFormData({ ...formData, designation: text })}
                            />

                            <Text style={styles.label}>Department</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Department"
                                value={formData.department}
                                onChangeText={(text) => setFormData({ ...formData, department: text })}
                            />

                            <Text style={styles.label}>Course Coordinator</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Course / Programme"
                                value={formData.courseCoordinator}
                                onChangeText={(text) => setFormData({ ...formData, courseCoordinator: text })}
                            />

                            <Text style={styles.label}>Subjects Handled (comma separated)</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="e.g., Data Structures, Algorithms, Operating Systems"
                                value={formData.subjectsHandledText}
                                onChangeText={(text) => setFormData({ ...formData, subjectsHandledText: text })}
                                multiline
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
                                title={editMode ? 'Update Staff' : 'Add Staff'}
                                onPress={handleSave}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    countText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    addButtonText: {
        color: colors.white,
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 6,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 24,
    },
    loadingText: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: 24,
    },
    emptyText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    staffRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
    },
    staffInfo: {
        flex: 1,
        minWidth: 0,
    },
    staffName: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    staffEmail: {
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    staffMeta: {
        fontSize: 12,
        color: colors.textLight,
    },
    actionsColumn: {
        alignItems: 'flex-end',
        gap: 6,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
    },
    editButton: {
        backgroundColor: colors.info,
    },
    deleteButton: {
        backgroundColor: colors.error,
    },
    actionButtonText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
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
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 4,
        marginTop: 8,
    },
    input: {
        backgroundColor: colors.gray100,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 14,
        fontSize: 14,
        marginBottom: 8,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    modalButton: {
        flex: 1,
    },
});

export default OfficeStaffDirectory;


