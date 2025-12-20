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
import { staffService } from '../../services/staffService';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import colors from '../../styles/colors';

const StaffTimetableScreen = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [formData, setFormData] = useState({
        category: 'Regular',
        course: 'UG',
        program: 'B.Tech',
        year: 3,
        section: 'A',
        semester: 5,
        academicYear: '2024-2025',
    });

    const [scheduleData, setScheduleData] = useState({
        day: 'Monday',
        slots: [
            {
                startTime: '09:00',
                endTime: '10:00',
                subject: '',
                type: 'Lecture',
                faculty: '',
                room: '',
            }
        ]
    });

    const handleCreateTimetable = async () => {
        try {
            const timetableData = {
                ...formData,
                schedule: [scheduleData]
            };

            await staffService.createTimetable(timetableData);
            Alert.alert('Success', 'Timetable created successfully');
            setModalVisible(false);
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to create timetable');
        }
    };

    const addSlot = () => {
        setScheduleData({
            ...scheduleData,
            slots: [
                ...scheduleData.slots,
                {
                    startTime: '',
                    endTime: '',
                    subject: '',
                    type: 'Lecture',
                    faculty: '',
                    room: '',
                }
            ]
        });
    };

    const updateSlot = (index, field, value) => {
        const newSlots = [...scheduleData.slots];
        newSlots[index][field] = value;
        setScheduleData({ ...scheduleData, slots: newSlots });
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Timetable Management" subtitle="Create & Update Timetables" />

            <View style={styles.headerRow}>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.createButtonText}>+ Create Timetable</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Card>
                    <Text style={styles.infoText}>
                        📅 Create timetables for different courses, programs, and years. Add time slots with subjects, faculty, and room assignments.
                    </Text>
                </Card>

                <Text style={styles.sectionTitle}>Quick Guide</Text>

                <Card>
                    <Text style={styles.guideTitle}>1. Select Class Details</Text>
                    <Text style={styles.guideText}>
                        Choose course (UG/PG), program, year, section, and semester
                    </Text>
                </Card>

                <Card>
                    <Text style={styles.guideTitle}>2. Add Time Slots</Text>
                    <Text style={styles.guideText}>
                        For each day, add slots with subject, faculty, type (Lecture/Lab/Tutorial), and room
                    </Text>
                </Card>

                <Card>
                    <Text style={styles.guideTitle}>3. Save Timetable</Text>
                    <Text style={styles.guideText}>
                        Review and save the timetable. Students will see it in their app.
                    </Text>
                </Card>
            </ScrollView>

            {/* Create Timetable Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Create Timetable</Text>

                        <ScrollView>
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

                            <View style={styles.row}>
                                <View style={styles.halfWidth}>
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
                                <View style={styles.halfWidth}>
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

                            <TextInput
                                style={styles.input}
                                placeholder="Section"
                                value={formData.section}
                                onChangeText={(text) => setFormData({ ...formData, section: text })}
                            />

                            <Text style={styles.sectionTitle}>Time Slots</Text>
                            {scheduleData.slots.map((slot, index) => (
                                <View key={index} style={styles.slotCard}>
                                    <Text style={styles.slotTitle}>Slot {index + 1}</Text>

                                    <View style={styles.row}>
                                        <TextInput
                                            style={[styles.input, styles.halfWidth]}
                                            placeholder="Start Time (HH:MM)"
                                            value={slot.startTime}
                                            onChangeText={(text) => updateSlot(index, 'startTime', text)}
                                        />
                                        <TextInput
                                            style={[styles.input, styles.halfWidth]}
                                            placeholder="End Time (HH:MM)"
                                            value={slot.endTime}
                                            onChangeText={(text) => updateSlot(index, 'endTime', text)}
                                        />
                                    </View>

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Subject"
                                        value={slot.subject}
                                        onChangeText={(text) => updateSlot(index, 'subject', text)}
                                    />

                                    <Picker
                                        selectedValue={slot.type}
                                        onValueChange={(value) => updateSlot(index, 'type', value)}
                                        style={styles.input}
                                    >
                                        <Picker.Item label="Lecture" value="Lecture" />
                                        <Picker.Item label="Lab" value="Lab" />
                                        <Picker.Item label="Tutorial" value="Tutorial" />
                                    </Picker>

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Faculty Name"
                                        value={slot.faculty}
                                        onChangeText={(text) => updateSlot(index, 'faculty', text)}
                                    />

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Room"
                                        value={slot.room}
                                        onChangeText={(text) => updateSlot(index, 'room', text)}
                                    />
                                </View>
                            ))}

                            <TouchableOpacity style={styles.addSlotButton} onPress={addSlot}>
                                <Text style={styles.addSlotText}>+ Add Slot</Text>
                            </TouchableOpacity>
                        </ScrollView>

                        <View style={styles.modalButtons}>
                            <Button
                                title="Cancel"
                                variant="outline"
                                onPress={() => setModalVisible(false)}
                                style={styles.modalButton}
                            />
                            <Button
                                title="Create"
                                onPress={handleCreateTimetable}
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
    guideTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: 8,
    },
    guideText: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
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
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    slotCard: {
        backgroundColor: colors.gray50,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    slotTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.secondary,
        marginBottom: 8,
    },
    addSlotButton: {
        backgroundColor: colors.accent,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    addSlotText: {
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

export default StaffTimetableScreen;
