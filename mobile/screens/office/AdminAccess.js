import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db } from '../../services/firebaseConfig';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy } from 'firebase/firestore';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import CustomPicker from '../../components/CustomPicker';
import colors from '../../styles/colors';
import { moderateScale, getFontSize, getPadding, getMargin } from '../../utils/responsive';

const AdminAccess = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('staff'); // staff, student, notice, timetable, officer, exam, fees
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form states for each entity type
    const [staffData, setStaffData] = useState({
        name: '',
        email: '',
        designation: '',
        department: 'Computer Science',
        phone: '',
    });

    const [studentData, setStudentData] = useState({
        name: '',
        registerNumber: '',
        email: '',
        course: '',
        program: '',
        year: '',
        section: '',
    });

    const [noticeData, setNoticeData] = useState({
        title: '',
        content: '',
        category: 'Administrative',
        priority: 'High',
    });

    const [timetableData, setTimetableData] = useState({
        program: '',
        year: '',
        room: '',
    });

    const [officerData, setOfficerData] = useState({
        name: '',
        email: '',
        designation: '',
        department: 'Computer Science',
        phone: '',
    });

    const [examData, setExamData] = useState({
        name: '',
        subject: '',
        date: '',
        time: '',
        venue: '',
        course: '',
        program: '',
        year: '',
    });

    const [feeData, setFeeData] = useState({
        studentId: '',
        semesterFee: false,
        examFee: false,
        amount: '',
    });

    const tabs = [
        { id: 'staff', label: 'Staff', icon: 'account-tie' },
        { id: 'student', label: 'Student', icon: 'school' },
        { id: 'notice', label: 'Notice', icon: 'bell' },
        { id: 'timetable', label: 'Timetable', icon: 'calendar-clock' },
        { id: 'officer', label: 'Officer', icon: 'account-cog' },
        { id: 'exam', label: 'Exam Schedule', icon: 'file-document-edit' },
        { id: 'fees', label: 'Fees', icon: 'cash-multiple' },
    ];

    const loadItems = async () => {
        setLoading(true);
        try {
            let collectionName = '';
            switch (activeTab) {
                case 'staff':
                    collectionName = 'staff';
                    break;
                case 'student':
                    // Students are stored in multiple collections, fetch from all
                    collectionName = 'students'; // Will fetch from all collections
                    break;
                case 'notice':
                    collectionName = 'notices';
                    break;
                case 'timetable':
                    collectionName = 'timetables';
                    break;
                case 'officer':
                    collectionName = 'officers';
                    break;
                case 'exam':
                    collectionName = 'exams';
                    break;
                case 'fees':
                    // Fees are stored in students collection
                    collectionName = 'students';
                    break;
            }

            if (collectionName) {
                if (activeTab === 'student') {
                    // For students, fetch from all collections
                    const { getAllStudentCollections } = require('../../utils/collectionMapper');
                    const allStudents = [];
                    const collections = getAllStudentCollections();
                    
                    // Also include the old 'students' collection
                    collections.push('students');
                    
                    for (const collName of collections) {
                        try {
                            const snapshot = await getDocs(collection(db, collName));
                            const collStudents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                            allStudents.push(...collStudents);
                        } catch (error) {
                            console.error(`Error fetching from ${collName}:`, error);
                        }
                    }
                    setItems(allStudents);
                } else {
                    let snapshot;
                    try {
                        // Try to order by createdAt first
                        const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
                        snapshot = await getDocs(q);
                    } catch (error) {
                        // If createdAt doesn't exist, fetch without ordering
                        console.log('Ordering by createdAt failed, fetching without order:', error.message);
                        snapshot = await getDocs(collection(db, collectionName));
                    }
                    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setItems(data);
                }
            }
        } catch (error) {
            console.error('Error loading items:', error);
            Alert.alert('Error', 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadItems();
    }, [activeTab]);

    const handleAdd = () => {
        setEditingItem(null);
        resetForm();
        setModalVisible(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        // Populate form with item data based on active tab
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
                    year: item.year || '',
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
            case 'timetable':
                setTimetableData({
                    program: item.program || '',
                    year: item.year || '',
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
                    year: item.year || '',
                });
                break;
            case 'fees':
                setFeeData({
                    studentId: item.id || '',
                    semesterFee: item.fees?.semester || false,
                    examFee: item.fees?.exam || false,
                    amount: item.fees?.amount || '',
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
                            let collectionName = '';
                            switch (activeTab) {
                                case 'staff':
                                    collectionName = 'staff';
                                    break;
                                case 'student':
                                    collectionName = 'students';
                                    break;
                                case 'notice':
                                    collectionName = 'notices';
                                    break;
                                case 'timetable':
                                    collectionName = 'timetables';
                                    break;
                                case 'officer':
                                    collectionName = 'officers';
                                    break;
                                case 'exam':
                                    collectionName = 'exams';
                                    break;
                                case 'fees':
                                    // Fees are updated in students collection
                                    collectionName = 'students';
                                    break;
                            }

                            if (activeTab === 'fees') {
                                // Update fees in student document
                                const studentRef = doc(db, 'students', item.id);
                                await updateDoc(studentRef, {
                                    fees: {
                                        semester: false,
                                        exam: false,
                                    }
                                });
                            } else {
                                await deleteDoc(doc(db, collectionName, item.id));
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
            let collectionName = '';
            let dataToSave = {};

            switch (activeTab) {
                case 'staff':
                    if (!staffData.name || !staffData.email) {
                        Alert.alert('Error', 'Please fill in name and email');
                        return;
                    }
                    collectionName = 'staff';
                    dataToSave = {
                        ...staffData,
                        createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };
                    break;
                case 'student':
                    if (!studentData.name || !studentData.registerNumber) {
                        Alert.alert('Error', 'Please fill in name and register number');
                        return;
                    }
                    collectionName = 'students';
                    dataToSave = {
                        ...studentData,
                        isActive: true,
                        createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };
                    break;
                case 'notice':
                    if (!noticeData.title || !noticeData.content) {
                        Alert.alert('Error', 'Please fill in title and content');
                        return;
                    }
                    collectionName = 'notices';
                    dataToSave = {
                        ...noticeData,
                        isApproved: true,
                        postedBy: 'Office',
                        createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };
                    break;
                case 'timetable':
                    if (!timetableData.program || !timetableData.year) {
                        Alert.alert('Error', 'Please fill in program and year');
                        return;
                    }
                    collectionName = 'timetables';
                    dataToSave = {
                        ...timetableData,
                        createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };
                    break;
                case 'officer':
                    if (!officerData.name || !officerData.email) {
                        Alert.alert('Error', 'Please fill in name and email');
                        return;
                    }
                    collectionName = 'officers';
                    dataToSave = {
                        ...officerData,
                        createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };
                    break;
                case 'exam':
                    if (!examData.name || !examData.date) {
                        Alert.alert('Error', 'Please fill in exam name and date');
                        return;
                    }
                    collectionName = 'exams';
                    dataToSave = {
                        ...examData,
                        createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };
                    break;
                case 'fees':
                    if (!feeData.studentId) {
                        Alert.alert('Error', 'Please select a student');
                        return;
                    }
                    // Update fees in student document
                    const studentRef = doc(db, 'students', feeData.studentId);
                    await updateDoc(studentRef, {
                        fees: {
                            semester: feeData.semesterFee,
                            exam: feeData.examFee,
                            amount: feeData.amount || 0,
                        },
                        updatedAt: new Date().toISOString(),
                    });
                    Alert.alert('Success', 'Fees updated successfully');
                    setModalVisible(false);
                    loadItems();
                    return;
            }

            if (editingItem) {
                // Update existing item
                await updateDoc(doc(db, collectionName, editingItem.id), dataToSave);
                Alert.alert('Success', 'Item updated successfully');
            } else {
                // Create new item
                await addDoc(collection(db, collectionName), dataToSave);
                Alert.alert('Success', 'Item added successfully');
            }

            setModalVisible(false);
            resetForm();
            loadItems();
        } catch (error) {
            console.error('Error saving item:', error);
            Alert.alert('Error', 'Failed to save item');
        }
    };

    const resetForm = () => {
        setStaffData({ name: '', email: '', designation: '', department: 'Computer Science', phone: '' });
        setStudentData({ name: '', registerNumber: '', email: '', course: '', program: '', year: '', section: '' });
        setNoticeData({ title: '', content: '', category: 'Administrative', priority: 'High' });
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
                        {item.name || item.title || item.subject || `${item.program} - Year ${item.year}` || 'Item'}
                    </Text>
                    {item.email && <Text style={styles.itemSubtitle}>{item.email}</Text>}
                    {item.registerNumber && <Text style={styles.itemSubtitle}>Reg: {item.registerNumber}</Text>}
                    {item.category && <Text style={styles.itemSubtitle}>Category: {item.category}</Text>}
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
                        <TextInput
                            style={styles.input}
                            placeholder="Enter staff name"
                            value={staffData.name}
                            onChangeText={(text) => setStaffData({ ...staffData, name: text })}
                        />
                        <Text style={styles.label}>Email *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter email"
                            value={staffData.email}
                            onChangeText={(text) => setStaffData({ ...staffData, email: text })}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <Text style={styles.label}>Designation</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter designation"
                            value={staffData.designation}
                            onChangeText={(text) => setStaffData({ ...staffData, designation: text })}
                        />
                        <Text style={styles.label}>Department</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter department"
                            value={staffData.department}
                            onChangeText={(text) => setStaffData({ ...staffData, department: text })}
                        />
                        <Text style={styles.label}>Phone</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter phone number"
                            value={staffData.phone}
                            onChangeText={(text) => setStaffData({ ...staffData, phone: text })}
                            keyboardType="phone-pad"
                        />
                    </>
                );
            case 'student':
                return (
                    <>
                        <Text style={styles.label}>Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter student name"
                            value={studentData.name}
                            onChangeText={(text) => setStudentData({ ...studentData, name: text })}
                        />
                        <Text style={styles.label}>Register Number *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter register number"
                            value={studentData.registerNumber}
                            onChangeText={(text) => setStudentData({ ...studentData, registerNumber: text })}
                        />
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter email"
                            value={studentData.email}
                            onChangeText={(text) => setStudentData({ ...studentData, email: text })}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <Text style={styles.label}>Course</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter course (e.g., M.Sc Computer Science)"
                            value={studentData.course}
                            onChangeText={(text) => setStudentData({ ...studentData, course: text })}
                        />
                        <Text style={styles.label}>Program</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter program"
                            value={studentData.program}
                            onChangeText={(text) => setStudentData({ ...studentData, program: text })}
                        />
                        <Text style={styles.label}>Year</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter year (e.g., I, II)"
                            value={studentData.year}
                            onChangeText={(text) => setStudentData({ ...studentData, year: text })}
                        />
                        <Text style={styles.label}>Section</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter section (optional)"
                            value={studentData.section}
                            onChangeText={(text) => setStudentData({ ...studentData, section: text })}
                        />
                    </>
                );
            case 'notice':
                return (
                    <>
                        <Text style={styles.label}>Title *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter notice title"
                            value={noticeData.title}
                            onChangeText={(text) => setNoticeData({ ...noticeData, title: text })}
                        />
                        <Text style={styles.label}>Content *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Enter notice content"
                            value={noticeData.content}
                            onChangeText={(text) => setNoticeData({ ...noticeData, content: text })}
                            multiline
                            numberOfLines={6}
                        />
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
                        />
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
                        />
                    </>
                );
            case 'timetable':
                return (
                    <>
                        <Text style={styles.label}>Program *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter program name"
                            value={timetableData.program}
                            onChangeText={(text) => setTimetableData({ ...timetableData, program: text })}
                        />
                        <Text style={styles.label}>Year *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter year (e.g., 1, 2, I, II)"
                            value={timetableData.year}
                            onChangeText={(text) => setTimetableData({ ...timetableData, year: text })}
                        />
                        <Text style={styles.label}>Room</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter room number"
                            value={timetableData.room}
                            onChangeText={(text) => setTimetableData({ ...timetableData, room: text })}
                        />
                    </>
                );
            case 'officer':
                return (
                    <>
                        <Text style={styles.label}>Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter officer name"
                            value={officerData.name}
                            onChangeText={(text) => setOfficerData({ ...officerData, name: text })}
                        />
                        <Text style={styles.label}>Email *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter email"
                            value={officerData.email}
                            onChangeText={(text) => setOfficerData({ ...officerData, email: text })}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <Text style={styles.label}>Designation</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter designation"
                            value={officerData.designation}
                            onChangeText={(text) => setOfficerData({ ...officerData, designation: text })}
                        />
                        <Text style={styles.label}>Department</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter department"
                            value={officerData.department}
                            onChangeText={(text) => setOfficerData({ ...officerData, department: text })}
                        />
                        <Text style={styles.label}>Phone</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter phone number"
                            value={officerData.phone}
                            onChangeText={(text) => setOfficerData({ ...officerData, phone: text })}
                            keyboardType="phone-pad"
                        />
                    </>
                );
            case 'exam':
                return (
                    <>
                        <Text style={styles.label}>Exam Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter exam name"
                            value={examData.name}
                            onChangeText={(text) => setExamData({ ...examData, name: text })}
                        />
                        <Text style={styles.label}>Subject</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter subject"
                            value={examData.subject}
                            onChangeText={(text) => setExamData({ ...examData, subject: text })}
                        />
                        <Text style={styles.label}>Date *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter date (e.g., 2026-01-15)"
                            value={examData.date}
                            onChangeText={(text) => setExamData({ ...examData, date: text })}
                        />
                        <Text style={styles.label}>Time</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter time (e.g., 10:00 AM - 1:00 PM)"
                            value={examData.time}
                            onChangeText={(text) => setExamData({ ...examData, time: text })}
                        />
                        <Text style={styles.label}>Venue</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter venue"
                            value={examData.venue}
                            onChangeText={(text) => setExamData({ ...examData, venue: text })}
                        />
                        <Text style={styles.label}>Course</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter course"
                            value={examData.course}
                            onChangeText={(text) => setExamData({ ...examData, course: text })}
                        />
                        <Text style={styles.label}>Program</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter program"
                            value={examData.program}
                            onChangeText={(text) => setExamData({ ...examData, program: text })}
                        />
                        <Text style={styles.label}>Year</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter year"
                            value={examData.year}
                            onChangeText={(text) => setExamData({ ...examData, year: text })}
                        />
                    </>
                );
            case 'fees':
                return (
                    <>
                        <Text style={styles.label}>Select Student *</Text>
                        <CustomPicker
                            selectedValue={feeData.studentId}
                            onValueChange={(value) => setFeeData({ ...feeData, studentId: value })}
                            items={items.map(item => ({
                                label: `${item.name} (${item.registerNumber})`,
                                value: item.id
                            }))}
                            placeholder="Select Student"
                            style={styles.input}
                        />
                        <Text style={styles.label}>Semester Fee Paid</Text>
                        <TouchableOpacity
                            style={styles.checkboxContainer}
                            onPress={() => setFeeData({ ...feeData, semesterFee: !feeData.semesterFee })}
                        >
                            <MaterialCommunityIcons
                                name={feeData.semesterFee ? 'checkbox-marked' : 'checkbox-blank-outline'}
                                size={24}
                                color={feeData.semesterFee ? colors.success : colors.gray500}
                            />
                            <Text style={styles.checkboxLabel}>Semester Fee Paid</Text>
                        </TouchableOpacity>
                        <Text style={styles.label}>Exam Fee Paid</Text>
                        <TouchableOpacity
                            style={styles.checkboxContainer}
                            onPress={() => setFeeData({ ...feeData, examFee: !feeData.examFee })}
                        >
                            <MaterialCommunityIcons
                                name={feeData.examFee ? 'checkbox-marked' : 'checkbox-blank-outline'}
                                size={24}
                                color={feeData.examFee ? colors.success : colors.gray500}
                            />
                            <Text style={styles.checkboxLabel}>Exam Fee Paid</Text>
                        </TouchableOpacity>
                        <Text style={styles.label}>Amount</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter amount"
                            value={feeData.amount}
                            onChangeText={(text) => setFeeData({ ...feeData, amount: text })}
                            keyboardType="numeric"
                        />
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Admin Access" subtitle="Manage All System Data" />

            {/* Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[
                            styles.tab,
                            activeTab === tab.id && styles.activeTab,
                        ]}
                        onPress={() => setActiveTab(tab.id)}
                    >
                        <MaterialCommunityIcons
                            name={tab.icon}
                            size={20}
                            color={activeTab === tab.id ? colors.primary : colors.textSecondary}
                        />
                        <Text
                            style={[
                                styles.tabLabel,
                                activeTab === tab.id && styles.activeTabLabel,
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.sectionTitle}>
                        {tabs.find(t => t.id === activeTab)?.label || 'Items'}
                    </Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleAdd}
                    >
                        <MaterialCommunityIcons name="plus" size={24} color={colors.white} />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <Text>Loading...</Text>
                    </View>
                ) : items.length === 0 ? (
                    <View style={styles.center}>
                        <MaterialCommunityIcons name="inbox" size={48} color={colors.gray400} />
                        <Text style={styles.emptyText}>No items found</Text>
                        <Text style={styles.emptySubtext}>Tap + to add a new item</Text>
                    </View>
                ) : (
                    <FlatList
                        data={items}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                    />
                )}
            </View>

            {/* Add/Edit Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingItem ? 'Edit' : 'Add'} {tabs.find(t => t.id === activeTab)?.label}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalScrollView}>
                            {renderForm()}
                        </ScrollView>

                        <View style={styles.modalButtons}>
                            <Button
                                title="Cancel"
                                variant="outline"
                                onPress={() => {
                                    setModalVisible(false);
                                    resetForm();
                                }}
                                style={styles.modalButton}
                            />
                            <Button
                                title={editingItem ? 'Update' : 'Add'}
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
    tabsContainer: {
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
        paddingVertical: getPadding(8),
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: getPadding(16),
        paddingVertical: getPadding(8),
        marginHorizontal: getMargin(4),
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: colors.primary + '15',
    },
    tabLabel: {
        marginLeft: getMargin(8),
        fontSize: getFontSize(14),
        color: colors.textSecondary,
        fontWeight: '500',
    },
    activeTabLabel: {
        color: colors.primary,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: getPadding(16),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: getMargin(16),
    },
    sectionTitle: {
        fontSize: getFontSize(18),
        fontWeight: '600',
        color: colors.textPrimary,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: getFontSize(16),
        color: colors.textSecondary,
        marginTop: getMargin(16),
    },
    emptySubtext: {
        fontSize: getFontSize(14),
        color: colors.textSecondary,
        marginTop: getMargin(8),
    },
    listContent: {
        paddingBottom: getPadding(100),
    },
    itemCard: {
        marginBottom: getMargin(12),
        padding: getPadding(16),
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemInfo: {
        flex: 1,
    },
    itemTitle: {
        fontSize: getFontSize(16),
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: getMargin(4),
    },
    itemSubtitle: {
        fontSize: getFontSize(14),
        color: colors.textSecondary,
        marginTop: getMargin(2),
    },
    itemActions: {
        flexDirection: 'row',
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: getPadding(20),
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: getPadding(20),
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: getMargin(16),
    },
    modalTitle: {
        fontSize: getFontSize(20),
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    modalScrollView: {
        maxHeight: '70%',
    },
    label: {
        fontSize: getFontSize(14),
        fontWeight: '600',
        color: colors.textPrimary,
        marginTop: getMargin(8),
        marginBottom: getMargin(4),
    },
    input: {
        backgroundColor: colors.gray100,
        borderRadius: 8,
        paddingVertical: getPadding(12),
        paddingHorizontal: getPadding(16),
        fontSize: getFontSize(14),
        marginBottom: getMargin(12),
        color: colors.textPrimary,
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: getMargin(12),
    },
    checkboxLabel: {
        marginLeft: getMargin(8),
        fontSize: getFontSize(14),
        color: colors.textPrimary,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: getMargin(16),
    },
    modalButton: {
        flex: 1,
    },
});

export default AdminAccess;

