import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Modal,
    Alert,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { officeService } from '../../services/officeService';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import CustomPicker from '../../components/CustomPicker';
import colors from '../../styles/colors';

const OfficeNoticesScreen = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [isEventMode, setIsEventMode] = useState(false); // Toggle between Notice and Event
    const [posting, setPosting] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedPDFs, setSelectedPDFs] = useState([]);
    const [links, setLinks] = useState([]);
    const [linkInput, setLinkInput] = useState('');

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

    // Event-specific fields
    const [eventData, setEventData] = useState({
        name: '',
        description: '',
        date: '',
        time: '',
        venue: '',
        registrationLink: '',
        contact: '',
        theme: '',
        organizedBy: 'Department of Computer Science, Pondicherry University',
        association: '',
    });

    const handlePickImages = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*'],
                multiple: true,
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets) {
                const newImages = result.assets.map(asset => asset.uri);
                setSelectedImages([...selectedImages, ...newImages]);
            }
        } catch (error) {
            console.error('Error picking images:', error);
            Alert.alert('Error', 'Failed to pick images. Please try again.');
        }
    };

    const handlePickPDFs = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                multiple: true,
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets) {
                const newPDFs = result.assets.map(asset => ({
                    uri: asset.uri,
                    name: asset.name || 'document.pdf',
                }));
                setSelectedPDFs([...selectedPDFs, ...newPDFs]);
            }
        } catch (error) {
            console.error('Error picking PDFs:', error);
            Alert.alert('Error', 'Failed to pick PDFs. Please try again.');
        }
    };

    const removeImage = (index) => {
        const newImages = selectedImages.filter((_, i) => i !== index);
        setSelectedImages(newImages);
    };

    const removePDF = (index) => {
        const newPDFs = selectedPDFs.filter((_, i) => i !== index);
        setSelectedPDFs(newPDFs);
    };

    const handleAddLink = () => {
        if (linkInput.trim()) {
            // Basic URL validation
            let url = linkInput.trim();
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            setLinks([...links, url]);
            setLinkInput('');
        }
    };

    const removeLink = (index) => {
        const newLinks = links.filter((_, i) => i !== index);
        setLinks(newLinks);
    };

    const handlePostNotice = async () => {
        try {
            if (isEventMode) {
                // Post as Event
                if (!eventData.name || !eventData.date) {
                    Alert.alert('Error', 'Please fill in the event name and date');
                    return;
                }

                setPosting(true);

                // Prepare event payload for local storage
                const eventPayload = {
                    name: eventData.name,
                    description: eventData.description || `Join us for ${eventData.name}!`,
                    date: eventData.date,
                    time: eventData.time || 'TBA',
                    venue: eventData.venue || 'TBA',
                    location: eventData.venue || 'TBA', // duplicate for safety
                    registrationLink: eventData.registrationLink || '',
                    contact: eventData.contact || '',
                    theme: eventData.theme || '',
                    organizedBy: eventData.organizedBy || '',
                    association: eventData.association || '',
                    links: links.length > 0 ? links : (eventData.registrationLink ? [eventData.registrationLink] : []),
                    imageUrls: selectedImages,
                    pdfUrls: selectedPDFs,
                    // Map first image to imageUrl for compatibility
                    imageUrl: selectedImages.length > 0 ? selectedImages[0] : null,
                    images: selectedImages,
                    visibleTo: ['students', 'staff', 'office'],
                };

                await officeService.postEvent(eventPayload);

                Alert.alert(
                    'Success',
                    'Event posted successfully! (Local Storage)',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                setModalVisible(false);
                                resetForm();
                            }
                        }
                    ]
                );
            } else {
                // Post as Notice
                if (!noticeData.title || !noticeData.content) {
                    Alert.alert('Error', 'Please fill in the heading and description');
                    return;
                }

                setPosting(true);

                // Prepare notice payload
                const noticePayload = {
                    ...noticeData,
                    links: links.length > 0 ? links : null,
                    imageUrls: selectedImages.length > 0 ? selectedImages : null,
                    pdfUrls: selectedPDFs.length > 0 ? selectedPDFs : null,
                    // Compat
                    imageUrl: selectedImages.length > 0 ? selectedImages[0] : null,
                };

                await officeService.postNotice(noticePayload);

                Alert.alert(
                    'Success',
                    'Notice posted successfully! (Local Storage)',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                setModalVisible(false);
                                resetForm();
                            }
                        }
                    ]
                );
            }
        } catch (error) {
            console.error('Error posting:', error);
            Alert.alert('Error', error.message || 'Failed to post. Please try again.');
        } finally {
            setPosting(false);
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
        setEventData({
            name: '',
            description: '',
            date: '',
            time: '',
            venue: '',
            registrationLink: '',
            contact: '',
            theme: '',
            organizedBy: 'Department of Computer Science, Pondicherry University',
            association: '',
        });
        setSelectedImages([]);
        setSelectedPDFs([]);
        setLinks([]);
        setLinkInput('');
        setIsEventMode(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Notices Management" subtitle="Post & Approve Official Notices" />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Card title="Office Privileges">
                    <Text style={styles.privilegeText}>
                        ✓ Post official notices (auto-approved){'\n'}
                        ✓ Approve staff notices{'\n'}
                        ✓ Set priority levels{'\n'}
                        ✓ Target specific audiences{'\n'}
                        ✓ Attach multiple images and PDFs{'\n'}
                        ✓ Send notifications to all roles
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

            {/* Floating Plus Icon */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.8}
            >
                <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Post Notice Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => !posting && setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {isEventMode ? 'Create New Event' : 'Create New Notice'}
                            </Text>
                            <View style={styles.modalHeaderRight}>
                                <TouchableOpacity
                                    style={styles.toggleButton}
                                    onPress={() => setIsEventMode(!isEventMode)}
                                    disabled={posting}
                                >
                                    <Text style={styles.toggleButtonText}>
                                        {isEventMode ? 'Switch to Notice' : 'Switch to Event'}
                                    </Text>
                                </TouchableOpacity>
                                {!posting && (
                                    <TouchableOpacity
                                        onPress={() => {
                                            resetForm();
                                            setModalVisible(false);
                                        }}
                                    >
                                        <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={true}>
                            {isEventMode ? (
                                <>
                                    {/* Event Name */}
                                    <Text style={styles.label}>Event Name *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter event name (e.g., Alumni Meet 2026)"
                                        value={eventData.name}
                                        onChangeText={(text) => setEventData({ ...eventData, name: text })}
                                        editable={!posting}
                                    />

                                    {/* Event Description */}
                                    <Text style={styles.label}>Description</Text>
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        placeholder="Enter event description"
                                        value={eventData.description}
                                        onChangeText={(text) => setEventData({ ...eventData, description: text })}
                                        multiline
                                        numberOfLines={4}
                                        editable={!posting}
                                    />

                                    {/* Event Date */}
                                    <Text style={styles.label}>Date *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter date (e.g., January 26, 2026 or 2026-01-26)"
                                        value={eventData.date}
                                        onChangeText={(text) => setEventData({ ...eventData, date: text })}
                                        editable={!posting}
                                    />

                                    {/* Event Time */}
                                    <Text style={styles.label}>Time</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter time (e.g., 10:00 AM)"
                                        value={eventData.time}
                                        onChangeText={(text) => setEventData({ ...eventData, time: text })}
                                        editable={!posting}
                                    />

                                    {/* Venue */}
                                    <Text style={styles.label}>Venue</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter venue location"
                                        value={eventData.venue}
                                        onChangeText={(text) => setEventData({ ...eventData, venue: text })}
                                        editable={!posting}
                                    />

                                    {/* Registration Link */}
                                    <Text style={styles.label}>Registration Link</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter registration URL (e.g., https://forms.gle/...)"
                                        value={eventData.registrationLink}
                                        onChangeText={(text) => setEventData({ ...eventData, registrationLink: text })}
                                        keyboardType="url"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        editable={!posting}
                                    />

                                    {/* Contact */}
                                    <Text style={styles.label}>Contact</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter contact number or email"
                                        value={eventData.contact}
                                        onChangeText={(text) => setEventData({ ...eventData, contact: text })}
                                        editable={!posting}
                                    />

                                    {/* Theme */}
                                    <Text style={styles.label}>Theme/Caption</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter event theme or caption"
                                        value={eventData.theme}
                                        onChangeText={(text) => setEventData({ ...eventData, theme: text })}
                                        editable={!posting}
                                    />

                                    {/* Organized By */}
                                    <Text style={styles.label}>Organized By</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter organizing body"
                                        value={eventData.organizedBy}
                                        onChangeText={(text) => setEventData({ ...eventData, organizedBy: text })}
                                        editable={!posting}
                                    />

                                    {/* Association */}
                                    <Text style={styles.label}>Association</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter association name (optional)"
                                        value={eventData.association}
                                        onChangeText={(text) => setEventData({ ...eventData, association: text })}
                                        editable={!posting}
                                    />
                                </>
                            ) : (
                                <>
                                    {/* Heading Input */}
                                    <Text style={styles.label}>Heading *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter notice heading"
                                        value={noticeData.title}
                                        onChangeText={(text) => setNoticeData({ ...noticeData, title: text })}
                                        editable={!posting}
                                    />

                                    {/* Description Input */}
                                    <Text style={styles.label}>Description *</Text>
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        placeholder="Enter notice description"
                                        value={noticeData.content}
                                        onChangeText={(text) => setNoticeData({ ...noticeData, content: text })}
                                        multiline
                                        numberOfLines={6}
                                        editable={!posting}
                                    />

                                    {/* Category */}
                                    <Text style={styles.label}>Category</Text>
                                    <CustomPicker
                                        selectedValue={noticeData.category}
                                        onValueChange={(value) => setNoticeData({ ...noticeData, category: value })}
                                        items={[
                                            { label: 'Administrative', value: 'Administrative' },
                                            { label: 'Academic', value: 'Academic' },
                                            { label: 'Exam', value: 'Exam' },
                                            { label: 'Event', value: 'Event' },
                                        ]}
                                        placeholder="Select Category"
                                        style={styles.input}
                                        enabled={!posting}
                                    />

                                    {/* Priority */}
                                    <Text style={styles.label}>Priority</Text>
                                    <CustomPicker
                                        selectedValue={noticeData.priority}
                                        onValueChange={(value) => setNoticeData({ ...noticeData, priority: value })}
                                        items={[
                                            { label: 'Urgent', value: 'Urgent' },
                                            { label: 'High', value: 'High' },
                                            { label: 'Medium', value: 'Medium' },
                                            { label: 'Low', value: 'Low' },
                                        ]}
                                        placeholder="Select Priority"
                                        style={styles.input}
                                        enabled={!posting}
                                    />
                                </>
                            )}

                            {/* Add Images Section */}
                            <Text style={styles.sectionTitle}>Images (Optional)</Text>
                            <TouchableOpacity
                                style={styles.fileButton}
                                onPress={handlePickImages}
                                disabled={posting}
                            >
                                <MaterialCommunityIcons name="image" size={20} color={colors.primary} />
                                <Text style={styles.fileButtonText}>Add Images</Text>
                            </TouchableOpacity>

                            {selectedImages.length > 0 && (
                                <View style={styles.selectedFilesContainer}>
                                    {selectedImages.map((uri, index) => (
                                        <View key={index} style={styles.fileItem}>
                                            <Image source={{ uri }} style={styles.imagePreview} />
                                            <TouchableOpacity
                                                style={styles.removeFileButton}
                                                onPress={() => removeImage(index)}
                                                disabled={posting}
                                            >
                                                <MaterialCommunityIcons name="close" size={20} color={colors.error} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Add PDFs Section */}
                            <Text style={styles.sectionTitle}>PDFs (Optional)</Text>
                            <TouchableOpacity
                                style={styles.fileButton}
                                onPress={handlePickPDFs}
                                disabled={posting}
                            >
                                <MaterialCommunityIcons name="file-document-outline" size={20} color={colors.primary} />
                                <Text style={styles.fileButtonText}>Add PDFs</Text>
                            </TouchableOpacity>

                            {selectedPDFs.length > 0 && (
                                <View style={styles.selectedFilesContainer}>
                                    {selectedPDFs.map((pdf, index) => (
                                        <View key={index} style={styles.pdfItem}>
                                            <MaterialCommunityIcons name="file-document-outline" size={24} color={colors.error} />
                                            <Text style={styles.pdfName} numberOfLines={1}>
                                                {pdf.name}
                                            </Text>
                                            <TouchableOpacity
                                                style={styles.removeFileButton}
                                                onPress={() => removePDF(index)}
                                                disabled={posting}
                                            >
                                                <MaterialCommunityIcons name="close" size={20} color={colors.error} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Add Links Section */}
                            <Text style={styles.sectionTitle}>Links (Optional)</Text>
                            <View style={styles.linkInputContainer}>
                                <TextInput
                                    style={[styles.input, styles.linkInput]}
                                    placeholder="Enter URL (e.g., https://example.com)"
                                    value={linkInput}
                                    onChangeText={setLinkInput}
                                    keyboardType="url"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!posting}
                                />
                                <TouchableOpacity
                                    style={styles.addLinkButton}
                                    onPress={handleAddLink}
                                    disabled={posting || !linkInput.trim()}
                                >
                                    <MaterialCommunityIcons name="plus" size={20} color={colors.white} />
                                </TouchableOpacity>
                            </View>

                            {links.length > 0 && (
                                <View style={styles.linksContainer}>
                                    {links.map((link, index) => (
                                        <View key={index} style={styles.linkItem}>
                                            <MaterialCommunityIcons name="link" size={20} color={colors.primary} />
                                            <Text style={styles.linkText} numberOfLines={1}>
                                                {link}
                                            </Text>
                                            <TouchableOpacity
                                                style={styles.removeFileButton}
                                                onPress={() => removeLink(index)}
                                                disabled={posting}
                                            >
                                                <MaterialCommunityIcons name="close" size={20} color={colors.error} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Target Audience (Optional) */}
                            <Text style={styles.sectionTitle}>Target Audience (Optional)</Text>
                            <Text style={styles.hintText}>Leave empty to broadcast to all users</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Course (UG/PG) - Leave empty for all"
                                value={noticeData.targetAudience.course}
                                onChangeText={(text) => setNoticeData({
                                    ...noticeData,
                                    targetAudience: { ...noticeData.targetAudience, course: text }
                                })}
                                editable={!posting}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Program - Leave empty for all"
                                value={noticeData.targetAudience.program}
                                onChangeText={(text) => setNoticeData({
                                    ...noticeData,
                                    targetAudience: { ...noticeData.targetAudience, program: text }
                                })}
                                editable={!posting}
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
                                editable={!posting}
                            />
                        </ScrollView>

                        {/* Modal Buttons */}
                        <View style={styles.modalButtons}>
                            <Button
                                title="Cancel"
                                variant="outline"
                                onPress={() => {
                                    if (!posting) {
                                        resetForm();
                                        setModalVisible(false);
                                    }
                                }}
                                style={styles.modalButton}
                                disabled={posting}
                            />
                            <Button
                                title={posting ? 'Posting...' : (isEventMode ? 'Post Event' : 'Post Notice')}
                                onPress={handlePostNotice}
                                style={styles.modalButton}
                                loading={posting}
                                disabled={posting}
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
        paddingBottom: 100, // Space for FAB
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
        fontWeight: '700',
        marginBottom: 4,
    },
    priorityDesc: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    fab: {
        position: 'absolute',
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        right: 20,
        bottom: 20,
        backgroundColor: colors.primary,
        borderRadius: 28,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end', // Bottom sheet style could be used, but centered is fine
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '90%', // Almost full screen
        width: '100%',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    modalHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    toggleButton: {
        marginRight: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: colors.primary + '20',
        borderRadius: 16,
    },
    toggleButtonText: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: '600',
    },
    modalScrollView: {
        padding: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: colors.gray100,
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: colors.textPrimary,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
        marginTop: 24,
        marginBottom: 12,
    },
    fileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 8,
        borderStyle: 'dashed',
        marginBottom: 12,
    },
    fileButtonText: {
        marginLeft: 8,
        color: colors.primary,
        fontWeight: '600',
    },
    selectedFilesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    fileItem: {
        width: 80,
        height: 80,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    removeFileButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: colors.white,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    pdfItem: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: colors.gray100,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    pdfName: {
        fontSize: 10,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: 4,
    },
    linkInputContainer: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    linkInput: {
        flex: 1,
        marginBottom: 0,
    },
    addLinkButton: {
        backgroundColor: colors.primary,
        width: 44,
        height: 44,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    linksContainer: {
        marginTop: 12,
        gap: 8,
    },
    linkItem: {
        flexDirection: 'row',
        alignItems: 'center', // Changed from flex-start to center for better alignment
        backgroundColor: colors.gray100,
        padding: 8,
        borderRadius: 8,
    },
    linkText: {
        flex: 1,
        marginLeft: 8,
        color: colors.primary,
        fontSize: 13,
        marginRight: 24, // Space for remove button
    },
    hintText: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 12,
        fontStyle: 'italic',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: colors.gray200,
    },
    modalButton: {
        flex: 1,
        // Force the button to expand
    },
});

export default OfficeNoticesScreen;
