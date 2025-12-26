import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    Alert,
    TextInput,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { officeService } from '../../services/officeService';
import PremiumHeader from '../../components/PremiumHeader';
import PremiumCard from '../../components/PremiumCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';
import { moderateScale, getFontSize, getPadding, getMargin } from '../../utils/responsive';
import { getAllStudentCollections } from '../../utils/collectionMapper';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';

// Document Status Component
const DocumentStatusList = ({ student, documentTypes }) => {
    const [docStatuses, setDocStatuses] = useState({});
    const [loadingDocs, setLoadingDocs] = useState(true);

    useEffect(() => {
        const loadDocumentStatuses = async () => {
            setLoadingDocs(true);
            const statuses = {};
            
            try {
                const studentId = student.id || student._id || student.registerNumber;
                if (studentId) {
                    const docRef = doc(db, 'studentDocuments', studentId);
                    const docSnap = await getDoc(docRef);
                    
                    if (docSnap.exists()) {
                        const documents = docSnap.data();
                        
                        documentTypes.forEach(docType => {
                            // Map document type labels to Firestore document keys
                            const docKeyMap = {
                                'Income Certificate': ['incomeCertificate', 'incomecertificate', 'income_certificate'],
                                'Caste Certificate': ['casteCertificate', 'castecertificate', 'caste_certificate'],
                                'Aadhar Card': ['aadharCard', 'aadharcard', 'aadhar_card'],
                                'Bank Passbook': ['bankPassbook', 'bankpassbook', 'bank_passbook'],
                                'Scholarship Form': ['scholarshipForm', 'scholarshipform', 'scholarship_form'],
                                'Medical Certificate': ['medicalCertificate', 'medicalcertificate', 'medical_certificate'],
                                'Transfer Certificate': ['transferCertificate', 'transfercertificate', 'transfer_certificate'],
                                'Migration Certificate': ['migrationCertificate', 'migrationcertificate', 'migration_certificate'],
                            };
                            
                            const possibleKeys = docKeyMap[docType] || [
                                docType.toLowerCase().replace(/\s+/g, ''),
                                docType.toLowerCase().replace(/\s+/g, '_'),
                            ];
                            
                            let found = false;
                            for (const key of possibleKeys) {
                                if (documents[key] && (documents[key].url || documents[key].uploadedAt)) {
                                    statuses[docType] = 'Uploaded';
                                    found = true;
                                    break;
                                }
                            }
                            if (!found) {
                                statuses[docType] = 'Pending';
                            }
                        });
                    } else {
                        documentTypes.forEach(docType => {
                            statuses[docType] = 'Pending';
                        });
                    }
                } else {
                    documentTypes.forEach(docType => {
                        statuses[docType] = 'Pending';
                    });
                }
            } catch (error) {
                console.error('Error loading document statuses:', error);
                documentTypes.forEach(docType => {
                    statuses[docType] = 'Pending';
                });
            }
            
            setDocStatuses(statuses);
            setLoadingDocs(false);
        };
        
        loadDocumentStatuses();
    }, [student, documentTypes]);

    return (
        <View style={styles.documentsSection}>
            <Text style={styles.label}>Document Status</Text>
            {loadingDocs ? (
                <Text style={styles.loadingText}>Loading document statuses...</Text>
            ) : (
                documentTypes.map((docType) => {
                    const status = docStatuses[docType] || 'Pending';
                    return (
                        <View key={docType} style={styles.documentRow}>
                            <Text style={styles.documentLabel}>{docType}:</Text>
                            <View style={[
                                styles.documentStatus,
                                { backgroundColor: status === 'Uploaded' ? colors.success + '20' : colors.error + '20' }
                            ]}>
                                <Text style={[
                                    styles.documentStatusText,
                                    { color: status === 'Uploaded' ? colors.success : colors.error }
                                ]}>
                                    {status}
                                </Text>
                            </View>
                        </View>
                    );
                })
            )}
        </View>
    );
};

const OfficeFeeManagement = () => {
    const [view, setView] = useState('landing'); // 'landing' | 'ug' | 'pg' | 'class'
    const [selectedClass, setSelectedClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [feeData, setFeeData] = useState({
        feeType: 'semester',
        status: 'Paid',
        amount: '',
        paidDate: new Date().toISOString().split('T')[0],
        reference: '',
    });

    // Document types that students need to submit
    const documentTypes = [
        'Income Certificate',
        'Caste Certificate',
        'Aadhar Card',
        'Bank Passbook',
        'Scholarship Form',
        'Medical Certificate',
        'Transfer Certificate',
        'Migration Certificate',
    ];

    const loadStudents = async (programName, year) => {
        setLoading(true);
        try {
            // Get all students from all collections
            const allStudents = await officeService.getStudents();
            
            // Filter by program and year
            const filtered = allStudents.filter(s => {
                const sProgram = (s.program || '').toLowerCase();
                const sYear = s.year || '';
                const normalizedYear = typeof sYear === 'string' ? 
                    (sYear === 'I' ? 1 : sYear === 'II' ? 2 : sYear === 'III' ? 3 : sYear === 'IV' ? 4 : parseInt(sYear, 10)) : 
                    sYear;
                
                const targetYear = typeof year === 'string' ? 
                    (year === 'I' ? 1 : year === 'II' ? 2 : year === 'III' ? 3 : year === 'IV' ? 4 : parseInt(year, 10)) : 
                    year;
                
                const programMatch = sProgram.includes(programName.toLowerCase()) || 
                                   (programName === 'B.Tech' && (sProgram.includes('btech') || sProgram.includes('b.tech'))) ||
                                   (programName === 'B.Sc CS' && (sProgram.includes('bsc') || sProgram.includes('b.sc'))) ||
                                   (programName === 'M.Sc CS' && (sProgram.includes('msc') || sProgram.includes('m.sc'))) ||
                                   (programName === 'M.Tech DS' && (sProgram.includes('mtech') || sProgram.includes('m.tech') || sProgram.includes('data science') || sProgram.includes('data analytics'))) ||
                                   (programName === 'M.Tech CSE' && (sProgram.includes('mtech') || sProgram.includes('m.tech')) && sProgram.includes('cse')) ||
                                   (programName === 'M.Tech NIS' && (sProgram.includes('mtech') || sProgram.includes('m.tech')) && sProgram.includes('nis')) ||
                                   (programName === 'M.Sc Data Analytics' && (sProgram.includes('msc') || sProgram.includes('m.sc')) && (sProgram.includes('data') || sProgram.includes('analytics'))) ||
                                   (programName === 'M.Sc CS Integrated' && (sProgram.includes('msc') || sProgram.includes('m.sc')) && sProgram.includes('integrated')) ||
                                   (programName === 'MCA' && sProgram.includes('mca'));
                
                return programMatch && normalizedYear === targetYear;
            });
            
            setStudents(filtered);
        } catch (error) {
            console.error('Error loading students:', error);
            Alert.alert('Error', 'Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (view === 'class') {
            setView(selectedClass?.category === 'UG' ? 'ug' : 'pg');
            setSelectedClass(null);
            setStudents([]);
        } else if (view === 'ug' || view === 'pg') {
            setView('landing');
        }
    };

    const handleClassSelect = (classItem) => {
        setSelectedClass(classItem);
        loadStudents(classItem.name, classItem.year);
        setView('class');
    };

    const handleUpdateFee = (student) => {
        setSelectedStudent(student);
        setFeeData({
            feeType: 'semester',
            status: student.fees?.semester?.status === 'Paid' ? 'Paid' : 'Not Paid',
            amount: student.fees?.semester?.amount || '',
            paidDate: student.fees?.semester?.paidDate || new Date().toISOString().split('T')[0],
            reference: student.fees?.semester?.reference || '',
        });
        setModalVisible(true);
    };

    const handleSaveFee = async () => {
        try {
            const studentId = selectedStudent.id || selectedStudent._id || selectedStudent.registerNumber;
            
            const feeUpdate = {
                [feeData.feeType]: {
                    status: feeData.status,
                    amount: feeData.amount || null,
                    paidDate: feeData.paidDate || null,
                    reference: feeData.reference || null,
                }
            };
            
            await officeService.updateFees(studentId, feeUpdate);
            Alert.alert('Success', 'Fee status updated successfully');
            setModalVisible(false);
            if (selectedClass) {
                loadStudents(selectedClass.name, selectedClass.year);
            }
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to update fee status');
        }
    };

    const getFeeStatus = (student, feeType) => {
        const fee = student.fees?.[feeType];
        if (!fee) return 'Not Paid';
        return fee.status === 'Paid' || fee === true ? 'Paid' : 'Not Paid';
    };

    const getDocumentStatus = async (student, docType) => {
        try {
            const studentId = student.id || student._id || student.registerNumber;
            if (!studentId) return 'Pending';
            
            const docRef = doc(db, 'studentDocuments', studentId);
            const docSnap = await getDoc(docRef);
            
            if (!docSnap.exists()) return 'Pending';
            
            const documents = docSnap.data();
            const docKey = docType.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
            
            // Check various possible key formats
            const possibleKeys = [
                docKey,
                docType.toLowerCase().replace(/\s+/g, '_'),
                docType.toLowerCase().replace(/\s+/g, ''),
                docType,
            ];
            
            for (const key of possibleKeys) {
                if (documents[key] && (documents[key].url || documents[key].uploadedAt)) {
                    return 'Uploaded';
                }
            }
            
            return 'Pending';
        } catch (error) {
            console.error('Error checking document status:', error);
            return 'Pending';
        }
    };

    const calculateClassStats = () => {
        const total = students.length;
        let semesterPaid = 0;
        let examPaid = 0;
        let hostelPaid = 0;
        const pendingDocuments = {};
        
        students.forEach(student => {
            if (getFeeStatus(student, 'semester') === 'Paid') semesterPaid++;
            if (getFeeStatus(student, 'exam') === 'Paid') examPaid++;
            if (getFeeStatus(student, 'hostel') === 'Paid') hostelPaid++;
            
            documentTypes.forEach(docType => {
                if (getDocumentStatus(student, docType) === 'Pending') {
                    pendingDocuments[docType] = (pendingDocuments[docType] || 0) + 1;
                }
            });
        });
        
        return {
            total,
            semesterPaid,
            examPaid,
            hostelPaid,
            semesterPending: total - semesterPaid,
            examPending: total - examPaid,
            hostelPending: total - hostelPaid,
            pendingDocuments,
        };
    };

    const ProgramSection = ({ title, items }) => (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {items.map((item, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.listItem}
                    onPress={() => handleClassSelect(item)}
                >
                    <View style={styles.listItemContent}>
                        <Text style={styles.listItemText}>{item.label}</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.gray400} />
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderLanding = () => (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.landingContainer}>
                <TouchableOpacity
                    style={styles.categoryCard}
                    onPress={() => setView('ug')}
                    activeOpacity={0.7}
                >
                    <LinearGradient
                        colors={[colors.primary, colors.secondary]}
                        style={styles.categoryGradient}
                    >
                        <MaterialCommunityIcons name="school" size={48} color={colors.white} />
                        <Text style={styles.categoryTitle}>Undergraduate (UG)</Text>
                        <Text style={styles.categorySubtitle}>B.Tech & B.Sc Programs</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.categoryCard}
                    onPress={() => setView('pg')}
                    activeOpacity={0.7}
                >
                    <LinearGradient
                        colors={[colors.accent, colors.info]}
                        style={styles.categoryGradient}
                    >
                        <MaterialCommunityIcons name="school-outline" size={48} color={colors.white} />
                        <Text style={styles.categoryTitle}>Postgraduate (PG)</Text>
                        <Text style={styles.categorySubtitle}>M.Sc, M.Tech & MCA Programs</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    const renderUGSelection = () => (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <ProgramSection
                title="B.Tech Programs"
                items={[
                    { label: 'B.Tech – 1st Year', name: 'B.Tech', year: 1, category: 'UG' },
                    { label: 'B.Tech – 2nd Year', name: 'B.Tech', year: 2, category: 'UG' },
                    { label: 'B.Tech – 3rd Year', name: 'B.Tech', year: 3, category: 'UG' },
                    { label: 'B.Tech – 4th Year', name: 'B.Tech', year: 4, category: 'UG' },
                ]}
            />
            <ProgramSection
                title="B.Sc Computer Science"
                items={[
                    { label: 'B.Sc CS – 1st Year', name: 'B.Sc CS', year: 1, category: 'UG' },
                    { label: 'B.Sc CS – 2nd Year', name: 'B.Sc CS', year: 2, category: 'UG' },
                    { label: 'B.Sc CS – 3rd Year', name: 'B.Sc CS', year: 3, category: 'UG' },
                ]}
            />
        </ScrollView>
    );

    const renderPGSelection = () => (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <ProgramSection
                title="M.Tech Programs"
                items={[
                    { label: 'M.Tech Data Science & AI – 1st Year', name: 'M.Tech DS', year: 1, category: 'PG' },
                    { label: 'M.Tech CSE – 1st Year', name: 'M.Tech CSE', year: 1, category: 'PG' },
                    { label: 'M.Tech CSE – 2nd Year', name: 'M.Tech CSE', year: 2, category: 'PG' },
                    { label: 'M.Tech NIS – 2nd Year', name: 'M.Tech NIS', year: 2, category: 'PG' },
                ]}
            />
            <ProgramSection
                title="M.Sc Programs"
                items={[
                    { label: 'M.Sc CS – 1st Year', name: 'M.Sc CS', year: 1, category: 'PG' },
                    { label: 'M.Sc CS – 2nd Year', name: 'M.Sc CS', year: 2, category: 'PG' },
                    { label: 'M.Sc Data Analytics – 1st Year', name: 'M.Sc Data Analytics', year: 1, category: 'PG' },
                    { label: 'M.Sc CS Integrated – 5th Year', name: 'M.Sc CS Integrated', year: 5, category: 'PG' },
                    { label: 'M.Sc CS Integrated – 6th Year', name: 'M.Sc CS Integrated', year: 6, category: 'PG' },
                ]}
            />
            <ProgramSection
                title="MCA Programs"
                items={[
                    { label: 'MCA – 1st Year', name: 'MCA', year: 1, category: 'PG' },
                    { label: 'MCA – 2nd Year', name: 'MCA', year: 2, category: 'PG' },
                ]}
            />
        </ScrollView>
    );

    const renderClassView = () => {
        const stats = classStats || {
            total: students.length,
            semesterPaid: 0,
            examPaid: 0,
            hostelPaid: 0,
            semesterPending: students.length,
            examPending: students.length,
            hostelPending: students.length,
            pendingDocuments: {},
        };
        
        return (
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Class Header */}
                <PremiumCard style={styles.classHeaderCard}>
                    <Text style={styles.classTitle}>{selectedClass?.label}</Text>
                    <Text style={styles.classSubtitle}>Fee & Document Management</Text>
                </PremiumCard>

                {/* Students Table */}
                <PremiumCard style={styles.tableCard}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderText, styles.colSno]}>S.No</Text>
                        <Text style={[styles.tableHeaderText, styles.colRegNo]}>Reg No</Text>
                        <Text style={[styles.tableHeaderText, styles.colName]}>Name</Text>
                        <Text style={[styles.tableHeaderText, styles.colFee]}>Sem</Text>
                        <Text style={[styles.tableHeaderText, styles.colFee]}>Exam</Text>
                        <Text style={[styles.tableHeaderText, styles.colFee]}>Hostel</Text>
                        <Text style={[styles.tableHeaderText, styles.colDocs]}>Docs</Text>
                    </View>

                    {students.length === 0 ? (
                        <View style={styles.emptyTableRow}>
                            <Text style={styles.emptyText}>No students found</Text>
                        </View>
                    ) : (
                        students.map((student, index) => (
                            <TouchableOpacity
                                key={student.id || student._id || student.registerNumber || index}
                                style={styles.tableRow}
                                onPress={() => handleUpdateFee(student)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.tableCell, styles.colSno]}>{index + 1}</Text>
                                <Text style={[styles.tableCell, styles.colRegNo]} numberOfLines={1}>
                                    {student.registerNumber || 'N/A'}
                                </Text>
                                <Text style={[styles.tableCell, styles.colName]} numberOfLines={1}>
                                    {student.name || 'N/A'}
                                </Text>
                                <View style={[styles.tableCell, styles.colFee]}>
                                    <View style={[
                                        styles.statusBadge,
                                        { backgroundColor: getFeeStatus(student, 'semester') === 'Paid' ? colors.success : colors.error }
                                    ]}>
                                        <Text style={styles.statusText}>
                                            {getFeeStatus(student, 'semester') === 'Paid' ? '✓' : '✗'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={[styles.tableCell, styles.colFee]}>
                                    <View style={[
                                        styles.statusBadge,
                                        { backgroundColor: getFeeStatus(student, 'exam') === 'Paid' ? colors.success : colors.error }
                                    ]}>
                                        <Text style={styles.statusText}>
                                            {getFeeStatus(student, 'exam') === 'Paid' ? '✓' : '✗'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={[styles.tableCell, styles.colFee]}>
                                    <View style={[
                                        styles.statusBadge,
                                        { backgroundColor: getFeeStatus(student, 'hostel') === 'Paid' ? colors.success : colors.error }
                                    ]}>
                                        <Text style={styles.statusText}>
                                            {getFeeStatus(student, 'hostel') === 'Paid' ? '✓' : '✗'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={[styles.tableCell, styles.colDocs]}>
                                    <TouchableOpacity
                                        style={styles.docButton}
                                        onPress={() => {
                                            setSelectedStudent(student);
                                            setModalVisible(true);
                                        }}
                                    >
                                        <MaterialCommunityIcons 
                                            name="file-document" 
                                            size={16} 
                                            color={colors.primary} 
                                        />
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </PremiumCard>

                {/* Class Summary */}
                <PremiumCard style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Class Summary</Text>
                    
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Students:</Text>
                        <Text style={styles.summaryValue}>{stats.total}</Text>
                    </View>

                    <View style={styles.summarySection}>
                        <Text style={styles.summarySectionTitle}>Fee Status</Text>
                        
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Semester Fee:</Text>
                            <View style={styles.summaryStatus}>
                                <Text style={[styles.summaryValue, { color: colors.success }]}>
                                    Paid: {stats.semesterPaid}
                                </Text>
                                <Text style={[styles.summaryValue, { color: colors.error, marginLeft: 12 }]}>
                                    Pending: {stats.semesterPending}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Exam Fee:</Text>
                            <View style={styles.summaryStatus}>
                                <Text style={[styles.summaryValue, { color: colors.success }]}>
                                    Paid: {stats.examPaid}
                                </Text>
                                <Text style={[styles.summaryValue, { color: colors.error, marginLeft: 12 }]}>
                                    Pending: {stats.examPending}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Hostel Fee:</Text>
                            <View style={styles.summaryStatus}>
                                <Text style={[styles.summaryValue, { color: colors.success }]}>
                                    Paid: {stats.hostelPaid}
                                </Text>
                                <Text style={[styles.summaryValue, { color: colors.error, marginLeft: 12 }]}>
                                    Pending: {stats.hostelPending}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.summarySection}>
                        <Text style={styles.summarySectionTitle}>Pending Documents</Text>
                        {Object.keys(stats.pendingDocuments).length === 0 ? (
                            <Text style={styles.noPendingText}>✅ All documents uploaded</Text>
                        ) : (
                            Object.entries(stats.pendingDocuments).map(([docType, count]) => (
                                <View key={docType} style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>{docType}:</Text>
                                    <Text style={[styles.summaryValue, { color: colors.warning }]}>
                                        {count} pending
                                    </Text>
                                </View>
                            ))
                        )}
                    </View>
                </PremiumCard>
            </ScrollView>
        );
    };

    if (loading && view === 'class') {
        return <LoadingSpinner />;
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.header}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        {view !== 'landing' && (
                            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                                <MaterialCommunityIcons name="arrow-left" size={24} color={colors.white} />
                            </TouchableOpacity>
                        )}
                        <View style={styles.titleContainer}>
                            <Text style={styles.headerTitle}>
                                {view === 'landing' ? 'Fee Management' :
                                    view === 'ug' ? 'UG Programs' :
                                        view === 'pg' ? 'PG Programs' :
                                            selectedClass?.label}
                            </Text>
                        </View>
                        <View style={styles.headerRight} />
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <View style={styles.content}>
                {view === 'landing' && renderLanding()}
                {view === 'ug' && renderUGSelection()}
                {view === 'pg' && renderPGSelection()}
                {view === 'class' && renderClassView()}
            </View>

            {/* Update Fee Modal */}
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
                                {selectedStudent ? `Update Fee - ${selectedStudent.name}` : 'Update Fee'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        {selectedStudent && (
                            <View style={styles.studentInfo}>
                                <Text style={styles.infoText}>{selectedStudent.name}</Text>
                                <Text style={styles.infoSubtext}>{selectedStudent.registerNumber}</Text>
                            </View>
                        )}

                        <ScrollView style={styles.modalScrollView}>
                            <Text style={styles.label}>Fee Type</Text>
                            <View style={styles.pickerContainer}>
                                <TouchableOpacity
                                    style={[styles.pickerButton, feeData.feeType === 'semester' && styles.pickerButtonActive]}
                                    onPress={() => setFeeData({ ...feeData, feeType: 'semester' })}
                                >
                                    <Text style={[styles.pickerButtonText, feeData.feeType === 'semester' && styles.pickerButtonTextActive]}>
                                        Semester
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.pickerButton, feeData.feeType === 'exam' && styles.pickerButtonActive]}
                                    onPress={() => setFeeData({ ...feeData, feeType: 'exam' })}
                                >
                                    <Text style={[styles.pickerButtonText, feeData.feeType === 'exam' && styles.pickerButtonTextActive]}>
                                        Exam
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.pickerButton, feeData.feeType === 'hostel' && styles.pickerButtonActive]}
                                    onPress={() => setFeeData({ ...feeData, feeType: 'hostel' })}
                                >
                                    <Text style={[styles.pickerButtonText, feeData.feeType === 'hostel' && styles.pickerButtonTextActive]}>
                                        Hostel
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.label}>Status</Text>
                            <View style={styles.pickerContainer}>
                                <TouchableOpacity
                                    style={[styles.pickerButton, feeData.status === 'Paid' && styles.pickerButtonActive]}
                                    onPress={() => setFeeData({ ...feeData, status: 'Paid' })}
                                >
                                    <Text style={[styles.pickerButtonText, feeData.status === 'Paid' && styles.pickerButtonTextActive]}>
                                        Paid
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.pickerButton, feeData.status === 'Not Paid' && styles.pickerButtonActive]}
                                    onPress={() => setFeeData({ ...feeData, status: 'Not Paid' })}
                                >
                                    <Text style={[styles.pickerButtonText, feeData.status === 'Not Paid' && styles.pickerButtonTextActive]}>
                                        Not Paid
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                style={styles.input}
                                placeholder="Amount"
                                value={feeData.amount}
                                onChangeText={(text) => setFeeData({ ...feeData, amount: text })}
                                keyboardType="numeric"
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Paid Date (YYYY-MM-DD)"
                                value={feeData.paidDate}
                                onChangeText={(text) => setFeeData({ ...feeData, paidDate: text })}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Payment Reference"
                                value={feeData.reference}
                                onChangeText={(text) => setFeeData({ ...feeData, reference: text })}
                            />

                            {/* Document Status Section */}
                            {selectedStudent && (
                                <DocumentStatusList student={selectedStudent} documentTypes={documentTypes} />
                            )}
                        </ScrollView>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonCancel]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.modalButtonCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonConfirm]}
                                onPress={handleSaveFee}
                            >
                                <Text style={styles.modalButtonConfirmText}>Update</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingBottom: getPadding(16),
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: getPadding(16),
        paddingTop: getPadding(8),
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: getFontSize(20),
        fontWeight: '700',
        color: colors.white,
    },
    headerRight: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    landingContainer: {
        padding: getPadding(16),
        gap: 16,
    },
    categoryCard: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: getMargin(16),
    },
    categoryGradient: {
        padding: getPadding(32),
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryTitle: {
        fontSize: getFontSize(24),
        fontWeight: '700',
        color: colors.white,
        marginTop: getMargin(12),
    },
    categorySubtitle: {
        fontSize: getFontSize(14),
        color: colors.white + 'CC',
        marginTop: getMargin(4),
    },
    sectionContainer: {
        marginBottom: getMargin(24),
    },
    sectionTitle: {
        fontSize: getFontSize(18),
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: getMargin(12),
        paddingHorizontal: getPadding(16),
    },
    listItem: {
        backgroundColor: colors.white,
        marginHorizontal: getMargin(16),
        marginBottom: getMargin(8),
        borderRadius: 12,
        overflow: 'hidden',
    },
    listItemContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: getPadding(16),
    },
    listItemText: {
        fontSize: getFontSize(16),
        fontWeight: '500',
        color: colors.textPrimary,
    },
    classHeaderCard: {
        margin: getMargin(16),
        padding: getPadding(16),
        alignItems: 'center',
    },
    classTitle: {
        fontSize: getFontSize(20),
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: getMargin(4),
    },
    classSubtitle: {
        fontSize: getFontSize(14),
        color: colors.textSecondary,
    },
    tableCard: {
        marginHorizontal: getMargin(16),
        marginBottom: getMargin(16),
        padding: getPadding(8),
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.primary + '15',
        paddingVertical: getPadding(12),
        paddingHorizontal: getPadding(8),
        borderRadius: 8,
        marginBottom: getMargin(8),
    },
    tableHeaderText: {
        fontSize: getFontSize(12),
        fontWeight: '700',
        color: colors.textPrimary,
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: getPadding(10),
        paddingHorizontal: getPadding(8),
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
        alignItems: 'center',
    },
    tableCell: {
        fontSize: getFontSize(12),
        color: colors.textPrimary,
        textAlign: 'center',
    },
    colSno: {
        width: '8%',
    },
    colRegNo: {
        width: '18%',
    },
    colName: {
        width: '24%',
        textAlign: 'left',
    },
    colFee: {
        width: '10%',
    },
    colDocs: {
        width: '10%',
    },
    statusBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    statusText: {
        fontSize: getFontSize(12),
        color: colors.white,
        fontWeight: 'bold',
    },
    docButton: {
        padding: getPadding(4),
        alignSelf: 'center',
    },
    emptyTableRow: {
        padding: getPadding(20),
        alignItems: 'center',
    },
    emptyText: {
        fontSize: getFontSize(14),
        color: colors.textSecondary,
    },
    summaryCard: {
        marginHorizontal: getMargin(16),
        marginBottom: getMargin(100),
        padding: getPadding(16),
    },
    summaryTitle: {
        fontSize: getFontSize(18),
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: getMargin(16),
    },
    summarySection: {
        marginBottom: getMargin(16),
    },
    summarySectionTitle: {
        fontSize: getFontSize(16),
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: getMargin(8),
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: getPadding(8),
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    summaryLabel: {
        fontSize: getFontSize(14),
        color: colors.textSecondary,
        fontWeight: '500',
    },
    summaryValue: {
        fontSize: getFontSize(14),
        fontWeight: '600',
        color: colors.textPrimary,
    },
    summaryStatus: {
        flexDirection: 'row',
    },
    noPendingText: {
        fontSize: getFontSize(14),
        color: colors.success,
        fontWeight: '500',
        paddingVertical: getPadding(8),
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
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    modalScrollView: {
        maxHeight: '70%',
    },
    studentInfo: {
        backgroundColor: colors.gray50,
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    infoText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    infoSubtext: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 2,
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
    pickerContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    pickerButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: colors.gray100,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    pickerButtonActive: {
        backgroundColor: colors.primary + '15',
        borderColor: colors.primary,
    },
    pickerButtonText: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    pickerButtonTextActive: {
        color: colors.primary,
        fontWeight: '600',
    },
    documentsSection: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
    },
    documentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        marginBottom: 8,
    },
    documentLabel: {
        fontSize: 14,
        color: colors.textPrimary,
        fontWeight: '500',
    },
    documentStatus: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    documentStatusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalButtonCancel: {
        backgroundColor: colors.gray100,
    },
    modalButtonCancelText: {
        color: colors.textSecondary,
        fontSize: 16,
        fontWeight: '600',
    },
    modalButtonConfirm: {
        backgroundColor: colors.primary,
    },
    modalButtonConfirmText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default OfficeFeeManagement;
