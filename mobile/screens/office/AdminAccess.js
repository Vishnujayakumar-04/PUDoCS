import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
    FlatList,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { staffService } from '../../services/staffService';
import { studentStorageService } from '../../services/studentStorageService';
import { officeService } from '../../services/officeService';
import Header from '../../components/Header';
import Card from '../../components/Card';
import CustomPicker from '../../components/CustomPicker';
import colors from '../../styles/colors';

const AdminAccess = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('staff'); // staff, student, notice, timetable, officer, exam, fees
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form states
    const [staffData, setStaffData] = useState({ name: '', email: '', designation: '', department: 'Computer Science', phone: '' });
    const [studentData, setStudentData] = useState({ name: '', registerNumber: '', email: '', course: '', program: '', year: '', section: '' });
    const [noticeData, setNoticeData] = useState({ title: '', content: '', category: 'Administrative', priority: 'High' });
    const [eventData, setEventData] = useState({ name: '', description: '', category: 'Academic', date: '', time: '', venue: '', location: '', registrationLink: '', contact: '', email: '', theme: '', organizedBy: '' });
    const [timetableData, setTimetableData] = useState({ program: '', year: '', room: '' });
    const [officerData, setOfficerData] = useState({ name: '', email: '', designation: '', department: 'Computer Science', phone: '' });
    const [examData, setExamData] = useState({ name: '', subject: '', date: '', time: '', venue: '', course: '', program: '', year: '' });
    const [feeData, setFeeData] = useState({ studentId: '', semesterFee: false, examFee: false, amount: '' });

    const tabs = [
        { id: 'staff', label: 'Staff', icon: 'account-tie' },
        { id: 'student', label: 'Student', icon: 'school' },
        { id: 'notice', label: 'Notice', icon: 'bell' },
        { id: 'event', label: 'Event', icon: 'calendar-star' },
        { id: 'timetable', label: 'Timetable', icon: 'calendar-clock' },
        { id: 'officer', label: 'Officer', icon: 'account-cog' },
        { id: 'exam', label: 'Exam Schedule', icon: 'file-document-edit' },
        { id: 'fees', label: 'Fees', icon: 'cash-multiple' },
    ];

    const loadItems = async () => {
        setLoading(true);
        try {
            let data = [];
            switch (activeTab) {
                case 'staff':
                    data = await staffService.getAllStaff();
                    break;
                case 'student':
                    data = await studentStorageService.getStudents();
                    break;
                case 'notice':
                    data = await officeService.getNotices();
                    break;
                case 'event':
                    data = await officeService.getEvents();
                    break;
                case 'timetable':
                    data = await officeService.getTimetables();
                    break;
                case 'officer':
                    data = await officeService.getOfficers();
                    break;
                case 'exam':
                    data = await officeService.getExams();
                    break;
                case 'fees':
                    // Fees uses students list
                    data = await studentStorageService.getStudents();
                    break;
            }
            setItems(data);
        } catch (error) {
            console.error('Error loading items:', error);
            Alert.alert('Error', 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadItems();
    }, [activeTab]);

    const handleAdd = () => {
        setEditingItem(null);
        resetForm();
        setModalVisible(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        // Populate form based on active tab
        switch (activeTab) {
            case 'staff':
                setStaffData({
                    name: item.name || '',
                    email: item.email || '',
                    designation: item.designation || '',
                    department: item.department || 'Computer Science',
                    phone: item.phone || '',
                });
                break;
            case 'student':
                setStudentData({
                    name: item.name || '',
                    registerNumber: item.registerNumber || '',
                    email: item.email || '',
                    course: item.course || '',
                    program: item.program || '',
                    year: item.year ? String(item.year) : '',
                    section: item.section || '',
                });
                break;
            case 'notice':
                setNoticeData({
                    title: item.title || '',
                    content: item.content || '',
                    category: item.category || 'Administrative',
                    priority: item.priority || 'High',
                });
                break;
            case 'event':
                setEventData({
                    name: item.name || item.title || '',
                    description: item.description || '',
                    category: item.category || 'Academic',
                    date: item.date || '',
                    time: item.time || '',
                    venue: item.venue || '',
                    location: item.location || '',
                    registrationLink: item.registrationLink || '',
                    contact: item.contact || '',
                    email: item.email || '',
                    theme: item.theme || '',
                    organizedBy: item.organizedBy || '',
                });
                break;
            case 'timetable':
                setTimetableData({
                    program: item.program || '',
                    year: item.year ? String(item.year) : '',
                    room: item.room || '',
                });
                break;
            case 'officer':
                setOfficerData({
                    name: item.name || '',
                    email: item.email || '',
                    designation: item.designation || '',
                    department: item.department || 'Computer Science',
                    phone: item.phone || '',
                });
                break;
            case 'exam':
                setExamData({
                    name: item.name || '',
                    subject: item.subject || '',
                    date: item.date || '',
                    time: item.time || '',
                    venue: item.venue || '',
                    course: item.course || '',
                    program: item.program || '',
                    year: item.year ? String(item.year) : '',
                });
                break;
            case 'fees':
                setFeeData({
                    studentId: item.id || item.registerNumber || '',
                    semesterFee: item.fees?.semester?.status === 'Paid' || item.fees?.semester === true,
                    examFee: item.fees?.exam?.status === 'Paid' || item.fees?.exam === true,
                    amount: typeof item.fees?.semester?.amount === 'string' ? item.fees?.semester?.amount : '',
                });
                break;
        }
        setModalVisible(true);
    };

    const handleDelete = (item) => {
        Alert.alert(
            'Delete Item',
            `Are you sure you want to delete this ${activeTab}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            switch (activeTab) {
                                case 'staff':
                                    await staffService.deleteStaff(item.email);
                                    break;
                                case 'student':
                                    await studentStorageService.deleteStudent(item.id || item.registerNumber);
                                    break;
                                case 'notice':
                                    await officeService.deleteNotice(item.id);
                                    break;
                                case 'event':
                                    await officeService.deleteEvent(item.id);
                                    break;
                                case 'timetable':
                                    await officeService.deleteTimetable(item.id);
                                    break;
                                case 'officer':
                                    await officeService.deleteOfficer(item.id);
                                    break;
                                case 'exam':
                                    await officeService.deleteExam(item.id);
                                    break;
                                case 'fees':
                                    // Reset fees
                                    const studentId = item.id || item.registerNumber;
                                    await officeService.updateFees(studentId, {
                                        semester: { status: 'Not Paid' },
                                        exam: { status: 'Not Paid' }
                                    });
                                    break;
                            }
                            Alert.alert('Success', 'Item deleted successfully');
                            loadItems();
                        } catch (error) {
                            console.error('Error deleting item:', error);
                            Alert.alert('Error', 'Failed to delete item');
                        }
                    }
                }
            ]
        );
    };

    const handleSave = async () => {
        try {
            switch (activeTab) {
                case 'staff':
                    if (!staffData.name || !staffData.email) return Alert.alert('Error', 'Fill name and email');
                    if (editingItem) {
                        await staffService.updateStaff(editingItem.email, staffData);
                    } else {
                        await staffService.addStaff(staffData);
                    }
                    break;
                case 'student':
                    if (!studentData.name || !studentData.registerNumber) return Alert.alert('Error', 'Fill name and register number');
                    if (editingItem) {
                        await studentStorageService.updateStudent(editingItem.id || editingItem.registerNumber, studentData);
                    } else {
                        await studentStorageService.addStudent(studentData);
                    }
                    break;
                case 'notice':
                    if (!noticeData.title || !noticeData.content) return Alert.alert('Error', 'Fill title and content');
                    if (editingItem) {
                        await officeService.updateNotice(editingItem.id, noticeData);
                    } else {
                        await officeService.postNotice(noticeData);
                    }
                    break;
                case 'event':
                    if (!eventData.name || !eventData.date) return Alert.alert('Error', 'Fill event name and date');
                    if (editingItem) {
                        await officeService.updateEvent(editingItem.id, eventData);
                    } else {
                        await officeService.postEvent(eventData);
                    }
                    break;
                case 'timetable':
                    if (!timetableData.program || !timetableData.year) return Alert.alert('Error', 'Fill program and year');
                    // Timetable save uses saveTimetable
                    await officeService.saveTimetable({ ...timetableData, id: editingItem?.id });
                    break;
                case 'officer':
                    if (!officerData.name || !officerData.email) return Alert.alert('Error', 'Fill name and email');
                    if (editingItem) {
                        await officeService.updateOfficer(editingItem.id, officerData);
                    } else {
                        await officeService.addOfficer(officerData);
                    }
                    break;
                case 'exam':
                    if (!examData.name || !examData.date) return Alert.alert('Error', 'Fill exam name and date');
                    if (editingItem) {
                        await officeService.updateExam(editingItem.id, examData);
                    } else {
                        await officeService.createExam(examData);
                    }
                    break;
                case 'fees':
                    if (!feeData.studentId) return Alert.alert('Error', 'Select student');
                    const feesUpdate = {
                        semester: {
                            status: feeData.semesterFee ? 'Paid' : 'Not Paid',
                            amount: feeData.amount
                        },
                        exam: {
                            status: feeData.examFee ? 'Paid' : 'Not Paid',
                        }
                    };
                    await officeService.updateFees(feeData.studentId, feesUpdate);
                    break;
            }

            setModalVisible(false);
            resetForm();
            loadItems();
            Alert.alert('Success', editingItem ? 'Updated successfully' : 'Added successfully');
        } catch (error) {
            console.error('Error saving item:', error);
            Alert.alert('Error', error.message || 'Failed to save');
        }
    };

    const resetForm = () => {
        setStaffData({ name: '', email: '', designation: '', department: 'Computer Science', phone: '' });
        setStudentData({ name: '', registerNumber: '', email: '', course: '', program: '', year: '', section: '' });
        setNoticeData({ title: '', content: '', category: 'Administrative', priority: 'High' });
        setEventData({ name: '', description: '', category: 'Academic', date: '', time: '', venue: '', location: '', registrationLink: '', contact: '', email: '', theme: '', organizedBy: '' });
        setTimetableData({ program: '', year: '', room: '' });
        setOfficerData({ name: '', email: '', designation: '', department: 'Computer Science', phone: '' });
        setExamData({ name: '', subject: '', date: '', time: '', venue: '', course: '', program: '', year: '' });
        setFeeData({ studentId: '', semesterFee: false, examFee: false, amount: '' });
    };

    const renderItem = ({ item }) => (
        <Card style={styles.itemCard}>
            <View style={styles.itemHeader}>
                <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>
                        {item.name || item.title || item.subject || (item.program ? `${item.program} - Year ${item.year}` : 'Item')}
                    </Text>
                    {item.email && <Text style={styles.itemSubtitle}>{item.email}</Text>}
                    {item.registerNumber && <Text style={styles.itemSubtitle}>Reg: {item.registerNumber}</Text>}
                    {item.category && <Text style={styles.itemSubtitle}>{item.category} • {item.priority}</Text>}
                    {item.date && <Text style={styles.itemSubtitle}>{item.date} {item.time}</Text>}
                </View>
                <View style={styles.itemActions}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
                        onPress={() => handleEdit(item)}
                    >
                        <MaterialCommunityIcons name="pencil" size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.error + '20', marginLeft: 8 }]}
                        onPress={() => handleDelete(item)}
                    >
                        <MaterialCommunityIcons name="delete" size={20} color={colors.error} />
                    </TouchableOpacity>
                </View>
            </View>
        </Card>
    );

    const renderForm = () => {
        switch (activeTab) {
            case 'staff':
                return (
                    <>
                        <Text style={styles.label}>Name *</Text>
                        <TextInput style={styles.input} placeholder="Name" value={staffData.name} onChangeText={t => setStaffData({ ...staffData, name: t })} />
                        <Text style={styles.label}>Email *</Text>
                        <TextInput style={styles.input} placeholder="Email" value={staffData.email} onChangeText={t => setStaffData({ ...staffData, email: t })} keyboardType="email-address" autoCapitalize="none" editable={!editingItem} />
                        <Text style={styles.label}>Designation</Text>
                        <TextInput style={styles.input} placeholder="Designation" value={staffData.designation} onChangeText={t => setStaffData({ ...staffData, designation: t })} />
                        <Text style={styles.label}>Phone</Text>
                        <TextInput style={styles.input} placeholder="Phone" value={staffData.phone} onChangeText={t => setStaffData({ ...staffData, phone: t })} keyboardType="phone-pad" />
                    </>
                );
            case 'student':
                return (
                    <>
                        <Text style={styles.label}>Name *</Text>
                        <TextInput style={styles.input} placeholder="Name" value={studentData.name} onChangeText={t => setStudentData({ ...studentData, name: t })} />
                        <Text style={styles.label}>Register Number *</Text>
                        <TextInput style={styles.input} placeholder="Register Number" value={studentData.registerNumber} onChangeText={t => setStudentData({ ...studentData, registerNumber: t })} editable={!editingItem} />
                        <Text style={styles.label}>Email</Text>
                        <TextInput style={styles.input} placeholder="Email" value={studentData.email} onChangeText={t => setStudentData({ ...studentData, email: t })} keyboardType="email-address" />
                        <Text style={styles.label}>Program</Text>
                        <TextInput style={styles.input} placeholder="Program" value={studentData.program} onChangeText={t => setStudentData({ ...studentData, program: t })} />
                        <Text style={styles.label}>Year</Text>
                        <TextInput style={styles.input} placeholder="Year" value={studentData.year} onChangeText={t => setStudentData({ ...studentData, year: t })} />
                    </>
                );
            case 'notice':
                return (
                    <>
                        <Text style={styles.label}>Title *</Text>
                        <TextInput style={styles.input} placeholder="Title" value={noticeData.title} onChangeText={t => setNoticeData({ ...noticeData, title: t })} />
                        <Text style={styles.label}>Content *</Text>
                        <TextInput style={[styles.input, styles.textArea]} placeholder="Content" value={noticeData.content} onChangeText={t => setNoticeData({ ...noticeData, content: t })} multiline />
                        <Text style={styles.label}>Category</Text>
                        <CustomPicker selectedValue={noticeData.category} onValueChange={v => setNoticeData({ ...noticeData, category: v })} items={[{ label: 'Administrative', value: 'Administrative' }, { label: 'Academic', value: 'Academic' }, { label: 'Exam', value: 'Exam' }, { label: 'Event', value: 'Event' }]} style={styles.input} />
                    </>
                );
            case 'event':
                return (
                    <>
                        <Text style={styles.label}>Event Name *</Text>
                        <TextInput style={styles.input} placeholder="Event Name" value={eventData.name} onChangeText={t => setEventData({ ...eventData, name: t })} />
                        <Text style={styles.label}>Description</Text>
                        <TextInput style={[styles.input, styles.textArea]} placeholder="Description" value={eventData.description} onChangeText={t => setEventData({ ...eventData, description: t })} multiline />
                        <Text style={styles.label}>Category</Text>
                        <CustomPicker selectedValue={eventData.category} onValueChange={v => setEventData({ ...eventData, category: v })} items={[{ label: 'Academic', value: 'Academic' }, { label: 'Alumni / University Event', value: 'Alumni / University Event' }, { label: 'Cultural', value: 'Cultural' }, { label: 'Sports', value: 'Sports' }, { label: 'Workshop', value: 'Workshop' }]} style={styles.input} />
                        <Text style={styles.label}>Date *</Text>
                        <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={eventData.date} onChangeText={t => setEventData({ ...eventData, date: t })} />
                        <Text style={styles.label}>Time</Text>
                        <TextInput style={styles.input} placeholder="Time (e.g., 10:00 AM)" value={eventData.time} onChangeText={t => setEventData({ ...eventData, time: t })} />
                        <Text style={styles.label}>Venue</Text>
                        <TextInput style={styles.input} placeholder="Venue" value={eventData.venue} onChangeText={t => setEventData({ ...eventData, venue: t, location: t })} />
                        <Text style={styles.label}>Registration Link</Text>
                        <TextInput style={styles.input} placeholder="Registration URL" value={eventData.registrationLink} onChangeText={t => setEventData({ ...eventData, registrationLink: t })} keyboardType="url" />
                        <Text style={styles.label}>Contact</Text>
                        <TextInput style={styles.input} placeholder="Phone" value={eventData.contact} onChangeText={t => setEventData({ ...eventData, contact: t })} />
                        <Text style={styles.label}>Email</Text>
                        <TextInput style={styles.input} placeholder="Email" value={eventData.email} onChangeText={t => setEventData({ ...eventData, email: t })} keyboardType="email-address" />
                        <Text style={styles.label}>Theme</Text>
                        <TextInput style={styles.input} placeholder="Theme/Tagline" value={eventData.theme} onChangeText={t => setEventData({ ...eventData, theme: t })} />
                        <Text style={styles.label}>Organized By</Text>
                        <TextInput style={[styles.input, styles.textArea]} placeholder="Organized By" value={eventData.organizedBy} onChangeText={t => setEventData({ ...eventData, organizedBy: t })} multiline />
                    </>
                );
            case 'timetable':
                return (
                    <>
                        <Text style={styles.label}>Program *</Text>
                        <TextInput style={styles.input} placeholder="Program" value={timetableData.program} onChangeText={t => setTimetableData({ ...timetableData, program: t })} />
                        <Text style={styles.label}>Year *</Text>
                        <TextInput style={styles.input} placeholder="Year" value={timetableData.year} onChangeText={t => setTimetableData({ ...timetableData, year: t })} />
                        <Text style={styles.label}>Room</Text>
                        <TextInput style={styles.input} placeholder="Room" value={timetableData.room} onChangeText={t => setTimetableData({ ...timetableData, room: t })} />
                    </>
                );
            case 'officer':
                return (
                    <>
                        <Text style={styles.label}>Name *</Text>
                        <TextInput style={styles.input} placeholder="Name" value={officerData.name} onChangeText={t => setOfficerData({ ...officerData, name: t })} />
                        <Text style={styles.label}>Email *</Text>
                        <TextInput style={styles.input} placeholder="Email" value={officerData.email} onChangeText={t => setOfficerData({ ...officerData, email: t })} keyboardType="email-address" />
                        <Text style={styles.label}>Designation</Text>
                        <TextInput style={styles.input} placeholder="Designation" value={officerData.designation} onChangeText={t => setOfficerData({ ...officerData, designation: t })} />
                    </>
                );
            case 'exam':
                return (
                    <>
                        <Text style={styles.label}>Name *</Text>
                        <TextInput style={styles.input} placeholder="Exam Name" value={examData.name} onChangeText={t => setExamData({ ...examData, name: t })} />
                        <Text style={styles.label}>Date *</Text>
                        <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={examData.date} onChangeText={t => setExamData({ ...examData, date: t })} />
                        <Text style={styles.label}>Time</Text>
                        <TextInput style={styles.input} placeholder="Time" value={examData.time} onChangeText={t => setExamData({ ...examData, time: t })} />
                    </>
                );
            case 'fees':
                return (
                    <>
                        <Text style={styles.label}>Select Student *</Text>
                        <CustomPicker
                            selectedValue={feeData.studentId}
                            onValueChange={v => setFeeData({ ...feeData, studentId: v })}
                            items={items.map(s => ({ label: `${s.name} (${s.registerNumber})`, value: s.id || s.registerNumber }))}
                            style={styles.input}
                            enabled={!editingItem}
                        />
                        <TouchableOpacity style={styles.checkbox} onPress={() => setFeeData({ ...feeData, semesterFee: !feeData.semesterFee })}>
                            <MaterialCommunityIcons name={feeData.semesterFee ? "checkbox-marked" : "checkbox-blank-outline"} size={24} color={colors.primary} />
                            <Text style={styles.checkboxLabel}>Semester Fee Paid</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.checkbox} onPress={() => setFeeData({ ...feeData, examFee: !feeData.examFee })}>
                            <MaterialCommunityIcons name={feeData.examFee ? "checkbox-marked" : "checkbox-blank-outline"} size={24} color={colors.primary} />
                            <Text style={styles.checkboxLabel}>Exam Fee Paid</Text>
                        </TouchableOpacity>
                    </>
                );
            default: return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Admin Access" subtitle="Manage System Data" />

            <View style={styles.tabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                            onPress={() => setActiveTab(tab.id)}
                        >
                            <MaterialCommunityIcons
                                name={tab.icon}
                                size={20}
                                color={activeTab === tab.id ? colors.white : colors.textSecondary}
                            />
                            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.content}>
                <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>{tabs.find(t => t.id === activeTab)?.label} List</Text>
                    <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                        <MaterialCommunityIcons name="plus" size={24} color={colors.white} />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <Text style={styles.loadingText}>Loading...</Text>
                ) : (
                    <FlatList
                        data={items}
                        renderItem={renderItem}
                        keyExtractor={item => item.id || item.email || item.registerNumber || Math.random().toString()}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={<Text style={styles.emptyText}>No items found</Text>}
                    />
                )}
            </View>

            <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{editingItem ? 'Edit Item' : 'Add New Item'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            {renderForm()}
                        </ScrollView>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSave}>
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    tabsContainer: { paddingVertical: 12, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray200 },
    tabsContent: { paddingHorizontal: 16, gap: 12 },
    tab: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: colors.gray100, gap: 8 },
    activeTab: { backgroundColor: colors.primary },
    tabText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
    activeTabText: { color: colors.white },
    content: { flex: 1, padding: 16 },
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    listTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
    addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
    listContent: { paddingBottom: 20 },
    itemCard: { marginBottom: 12 },
    itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    itemInfo: { flex: 1 },
    itemTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 },
    itemSubtitle: { fontSize: 12, color: colors.textSecondary },
    itemActions: { flexDirection: 'row' },
    actionButton: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    loadingText: { textAlign: 'center', marginTop: 20, color: colors.textSecondary },
    emptyText: { textAlign: 'center', marginTop: 20, color: colors.textSecondary, fontStyle: 'italic' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: colors.white, borderRadius: 16, maxHeight: '80%', overflow: 'hidden' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.gray200 },
    modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
    modalBody: { padding: 16 },
    label: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8, marginTop: 12 },
    input: { backgroundColor: colors.gray100, borderRadius: 8, padding: 12, fontSize: 14, color: colors.textPrimary },
    textArea: { height: 100, textAlignVertical: 'top' },
    modalFooter: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: colors.gray200, gap: 12 },
    modalButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    cancelButton: { backgroundColor: colors.gray200 },
    saveButton: { backgroundColor: colors.primary },
    cancelButtonText: { fontWeight: '600', color: colors.textPrimary },
    saveButtonText: { fontWeight: '600', color: colors.white },
    checkbox: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 },
    checkboxLabel: { fontSize: 14, color: colors.textPrimary },
});

export default AdminAccess;
