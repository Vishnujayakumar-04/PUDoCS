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

const OfficeNoticesScreen = () => {
    const [modalVisible, setModalVisible] = useState(false);

    const [noticeData, setNoticeData] = useState({
        title: '',
        content: '',
        category: 'Administrative',
        priority: 'High',
        targetAudience: {
            course: '',
            program: '',
            year: '',
        }
    });

    const handlePostNotice = async () => {
        try {
            if (!noticeData.title || !noticeData.content) {
                Alert.alert('Error', 'Please fill title and content');
                return;
            }

            await officeService.postNotice(noticeData);
            Alert.alert('Success', 'Official notice posted successfully');
            setModalVisible(false);
            resetForm();
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to post notice');
        }
    };

    const handleApproveNotice = async (noticeId) => {
        try {
            await officeService.approveNotice(noticeId);
            Alert.alert('Success', 'Notice approved successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to approve notice');
        }
    };

    const resetForm = () => {
        setNoticeData({
            title: '',
            content: '',
            category: 'Administrative',
            priority: 'High',
            targetAudience: {
                course: '',
                program: '',
                year: '',
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Notices Management" subtitle="Post & Approve Official Notices" />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.actionIcon}>📢</Text>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Post Official Notice</Text>
                        <Text style={styles.actionDescription}>
                            Post official circulars and announcements. Auto-approved.
                        </Text>
                    </View>
                </TouchableOpacity>

                <Card title="Office Privileges">
                    <Text style={styles.privilegeText}>
                        ✓ Post official notices (auto-approved){'\n'}
                        ✓ Approve staff notices{'\n'}
                        ✓ Set priority levels{'\n'}
                        ✓ Target specific audiences{'\n'}
                        ✓ Attach official documents
                    </Text>
                </Card>

                <Card title="Notice Categories">
                    <View style={styles.categoryList}>
                        <View style={styles.categoryItem}>
                            <Text style={styles.categoryDot}>•</Text>
                            <Text style={styles.categoryText}>
                                <Text style={styles.categoryBold}>Administrative:</Text> Official circulars, policies
                            </Text>
                        </View>
                        <View style={styles.categoryItem}>
                            <Text style={styles.categoryDot}>•</Text>
                            <Text style={styles.categoryText}>
                                <Text style={styles.categoryBold}>Academic:</Text> Course updates, schedules
                            </Text>
                        </View>
                        <View style={styles.categoryItem}>
                            <Text style={styles.categoryDot}>•</Text>
                            <Text style={styles.categoryText}>
                                <Text style={styles.categoryBold}>Exam:</Text> Exam notifications, results
                            </Text>
                        </View>
                        <View style={styles.categoryItem}>
                            <Text style={styles.categoryDot}>•</Text>
                            <Text style={styles.categoryText}>
                                <Text style={styles.categoryBold}>Event:</Text> Official events, ceremonies
                            </Text>
                        </View>
                    </View>
                </Card>

                <Card title="Priority Levels">
                    <View style={styles.priorityList}>
                        <View style={[styles.priorityItem, { backgroundColor: colors.error + '20' }]}>
                            <Text style={[styles.priorityLabel, { color: colors.error }]}>Urgent</Text>
                            <Text style={styles.priorityDesc}>Immediate attention required</Text>
                        </View>
                        <View style={[styles.priorityItem, { backgroundColor: colors.warning + '20' }]}>
                            <Text style={[styles.priorityLabel, { color: colors.warning }]}>High</Text>
                            <Text style={styles.priorityDesc}>Important announcements</Text>
                        </View>
                        <View style={[styles.priorityItem, { backgroundColor: colors.info + '20' }]}>
                            <Text style={[styles.priorityLabel, { color: colors.info }]}>Medium</Text>
                            <Text style={styles.priorityDesc}>Regular notices</Text>
                        </View>
                    </View>
                </Card>
            </ScrollView>

            {/* Post Notice Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Post Official Notice</Text>

                        <ScrollView>
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
                                numberOfLines={6}
                            />

                            <Text style={styles.label}>Category</Text>
                            <Picker
                                selectedValue={noticeData.category}
                                onValueChange={(value) => setNoticeData({ ...noticeData, category: value })}
                                style={styles.input}
                            >
                                <Picker.Item label="Administrative" value="Administrative" />
                                <Picker.Item label="Academic" value="Academic" />
                                <Picker.Item label="Exam" value="Exam" />
                                <Picker.Item label="Event" value="Event" />
                            </Picker>

                            <Text style={styles.label}>Priority</Text>
                            <Picker
                                selectedValue={noticeData.priority}
                                onValueChange={(value) => setNoticeData({ ...noticeData, priority: value })}
                                style={styles.input}
                            >
                                <Picker.Item label="Urgent" value="Urgent" />
                                <Picker.Item label="High" value="High" />
                                <Picker.Item label="Medium" value="Medium" />
                                <Picker.Item label="Low" value="Low" />
                            </Picker>

                            <Text style={styles.sectionTitle}>Target Audience (Optional)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Course (UG/PG) - Leave empty for all"
                                value={noticeData.targetAudience.course}
                                onChangeText={(text) => setNoticeData({
                                    ...noticeData,
                                    targetAudience: { ...noticeData.targetAudience, course: text }
                                })}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Program - Leave empty for all"
                                value={noticeData.targetAudience.program}
                                onChangeText={(text) => setNoticeData({
                                    ...noticeData,
                                    targetAudience: { ...noticeData.targetAudience, program: text }
                                })}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Year - Leave empty for all"
                                value={noticeData.targetAudience.year}
                                onChangeText={(text) => setNoticeData({
                                    ...noticeData,
                                    targetAudience: { ...noticeData.targetAudience, year: text }
                                })}
                                keyboardType="numeric"
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
                                title="Post Notice"
                                onPress={handlePostNotice}
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
        marginBottom: 16,
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
    privilegeText: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    categoryList: {
        gap: 8,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    categoryDot: {
        fontSize: 16,
        color: colors.primary,
        marginRight: 8,
        marginTop: 2,
    },
    categoryText: {
        flex: 1,
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    categoryBold: {
        fontWeight: '600',
        color: colors.textPrimary,
    },
    priorityList: {
        gap: 8,
    },
    priorityItem: {
        padding: 12,
        borderRadius: 8,
    },
    priorityLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    priorityDesc: {
        fontSize: 12,
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
        height: 120,
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

export default OfficeNoticesScreen;
