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

const StaffNoticesScreen = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [noticeType, setNoticeType] = useState('notice');

    const [noticeData, setNoticeData] = useState({
        title: '',
        content: '',
        category: 'Academic',
        priority: 'Medium',
        targetAudience: {
            course: '',
            program: '',
            year: '',
        }
    });

    const [eventData, setEventData] = useState({
        name: '',
        description: '',
        category: 'Academic',
        date: '',
        venue: '',
        registrationRequired: false,
    });

    const handlePostNotice = async () => {
        try {
            if (!noticeData.title || !noticeData.content) {
                Alert.alert('Error', 'Please fill title and content');
                return;
            }

            await staffService.postNotice(noticeData);
            Alert.alert('Success', 'Notice posted successfully. Pending office approval.');
            setModalVisible(false);
            resetNoticeForm();
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to post notice');
        }
    };

    const handleCreateEvent = async () => {
        try {
            if (!eventData.name || !eventData.date) {
                Alert.alert('Error', 'Please fill event name and date');
                return;
            }

            await staffService.createEvent(eventData);
            Alert.alert('Success', 'Event created successfully');
            setModalVisible(false);
            resetEventForm();
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to create event');
        }
    };

    const resetNoticeForm = () => {
        setNoticeData({
            title: '',
            content: '',
            category: 'Academic',
            priority: 'Medium',
            targetAudience: {
                course: '',
                program: '',
                year: '',
            }
        });
    };

    const resetEventForm = () => {
        setEventData({
            name: '',
            description: '',
            category: 'Academic',
            date: '',
            venue: '',
            registrationRequired: false,
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Notices & Events" subtitle="Post Notices and Create Events" />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => {
                        setNoticeType('notice');
                        setModalVisible(true);
                    }}
                >
                    <Text style={styles.actionIcon}>📢</Text>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Post Notice</Text>
                        <Text style={styles.actionDescription}>
                            Create academic notices for students. Requires office approval.
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => {
                        setNoticeType('event');
                        setModalVisible(true);
                    }}
                >
                    <Text style={styles.actionIcon}>🎉</Text>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Create Event</Text>
                        <Text style={styles.actionDescription}>
                            Organize department events with photo gallery support.
                        </Text>
                    </View>
                </TouchableOpacity>

                <Card title="Guidelines">
                    <Text style={styles.guideText}>
                        • Notices posted by staff require office approval{'\n'}
                        • Use appropriate priority levels{'\n'}
                        • Target specific audience when needed{'\n'}
                        • Events are visible to all students immediately
                    </Text>
                </Card>
            </ScrollView>

            {/* Notice/Event Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {noticeType === 'notice' ? 'Post Notice' : 'Create Event'}
                        </Text>

                        <ScrollView>
                            {noticeType === 'notice' ? (
                                <>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Notice Title *"
                                        value={noticeData.title}
                                        onChangeText={(text) => setNoticeData({ ...noticeData, title: text })}
                                    />

                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        placeholder="Notice Content *"
                                        value={noticeData.content}
                                        onChangeText={(text) => setNoticeData({ ...noticeData, content: text })}
                                        multiline
                                        numberOfLines={4}
                                    />

                                    <Text style={styles.label}>Category</Text>
                                    <Picker
                                        selectedValue={noticeData.category}
                                        onValueChange={(value) => setNoticeData({ ...noticeData, category: value })}
                                        style={styles.input}
                                    >
                                        <Picker.Item label="Academic" value="Academic" />
                                        <Picker.Item label="Exam" value="Exam" />
                                        <Picker.Item label="Event" value="Event" />
                                        <Picker.Item label="Administrative" value="Administrative" />
                                    </Picker>

                                    <Text style={styles.label}>Priority</Text>
                                    <Picker
                                        selectedValue={noticeData.priority}
                                        onValueChange={(value) => setNoticeData({ ...noticeData, priority: value })}
                                        style={styles.input}
                                    >
                                        <Picker.Item label="Low" value="Low" />
                                        <Picker.Item label="Medium" value="Medium" />
                                        <Picker.Item label="High" value="High" />
                                        <Picker.Item label="Urgent" value="Urgent" />
                                    </Picker>

                                    <Text style={styles.sectionTitle}>Target Audience (Optional)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Course (UG/PG)"
                                        value={noticeData.targetAudience.course}
                                        onChangeText={(text) => setNoticeData({
                                            ...noticeData,
                                            targetAudience: { ...noticeData.targetAudience, course: text }
                                        })}
                                    />
                                </>
                            ) : (
                                <>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Event Name *"
                                        value={eventData.name}
                                        onChangeText={(text) => setEventData({ ...eventData, name: text })}
                                    />

                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        placeholder="Event Description"
                                        value={eventData.description}
                                        onChangeText={(text) => setEventData({ ...eventData, description: text })}
                                        multiline
                                        numberOfLines={4}
                                    />

                                    <Text style={styles.label}>Category</Text>
                                    <Picker
                                        selectedValue={eventData.category}
                                        onValueChange={(value) => setEventData({ ...eventData, category: value })}
                                        style={styles.input}
                                    >
                                        <Picker.Item label="Academic" value="Academic" />
                                        <Picker.Item label="Cultural" value="Cultural" />
                                        <Picker.Item label="Technical" value="Technical" />
                                        <Picker.Item label="Sports" value="Sports" />
                                        <Picker.Item label="Workshop" value="Workshop" />
                                    </Picker>

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Date (YYYY-MM-DD) *"
                                        value={eventData.date}
                                        onChangeText={(text) => setEventData({ ...eventData, date: text })}
                                    />

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Venue"
                                        value={eventData.venue}
                                        onChangeText={(text) => setEventData({ ...eventData, venue: text })}
                                    />
                                </>
                            )}
                        </ScrollView>

                        <View style={styles.modalButtons}>
                            <Button
                                title="Cancel"
                                variant="outline"
                                onPress={() => setModalVisible(false)}
                                style={styles.modalButton}
                            />
                            <Button
                                title={noticeType === 'notice' ? 'Post Notice' : 'Create Event'}
                                onPress={noticeType === 'notice' ? handlePostNotice : handleCreateEvent}
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
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
        lineHeight: 20,
    },
    guideText: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 22,
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
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginTop: 12,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.gray100,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 14,
        marginBottom: 12,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
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

export default StaffNoticesScreen;
