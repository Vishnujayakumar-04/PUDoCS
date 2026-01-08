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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { officeService } from '../../services/officeService';
import { studentStorageService } from '../../services/studentStorageService';
import PremiumCard from '../../components/PremiumCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';
import { getFontSize, getPadding, getMargin } from '../../utils/responsive';

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
                    const documents = await studentStorageService.getDocumentMetadata(studentId);

                    documentTypes.forEach(docType => {
                        // Map document type labels to local keys (same as in StudentDocuments.js)
                        const docKeyMap = {
                            'Income Certificate': 'incomeCertificate',
                            'Caste Certificate': 'casteCertificate',
                            'Aadhar Card': 'aadharCard', // Not in StudentDocuments list? adding here just in case
                            'Bank Passbook': 'bankPassbook',
                            'Scholarship Form': 'scholarshipForm',
                            'Medical Certificate': 'medicalCertificate',
                            'Transfer Certificate': 'transferCertificate',
                            'Migration Certificate': 'migrationCertificate',
                            // Add others if needed
                        };

                        // Check exact match or mapped key
                        const key = docKeyMap[docType] || docType;

                        if (documents[key] && (documents[key].url || documents[key].uploadedAt)) {
                            statuses[docType] = 'Uploaded';
                        } else {
                            statuses[docType] = 'Pending';
                        }
                    });
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
            // Get all students using officeService (which checks local storage)
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
                    (programName === 'B.Tech' && (sProgram.includes('btech') || sProgram.includes('b.tech')) && sProgram.includes('cse')) ||
                    (programName === 'B.Sc CS' && (sProgram.includes('bsc') || sProgram.includes('b.sc'))) ||
                    (programName === 'M.Sc CS' && (sProgram.includes('msc') || sProgram.includes('m.sc')) && !sProgram.includes('integrated') && !sProgram.includes('data')) ||
                    (programName === 'M.Tech DS' && (sProgram.includes('mtech') || sProgram.includes('m.tech')) && (sProgram.includes('data science') || sProgram.includes('data analytics') || sProgram.includes('da'))) ||
                    (programName === 'M.Tech CSE' && (sProgram.includes('mtech') || sProgram.includes('m.tech')) && sProgram.includes('cse')) ||
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

    const calculateClassStats = () => {
        const total = students.length;
        let semesterPaid = 0;
        let examPaid = 0;
        let hostelPaid = 0;
        const pendingDocuments = {};

        // This is tricky as we process docs async now. 
        // For simplicity in this view, we might not count perfectly without extra logic.
        // We will just show detailed report for paid/unpaid fees which is sync from student list
        // and simplified doc summary if possible or skip doc summary for class view to avoid complexity.
        // For now, I'll count paid fees.

        students.forEach(student => {
            if (getFeeStatus(student, 'semester') === 'Paid') semesterPaid++;
            if (getFeeStatus(student, 'exam') === 'Paid') examPaid++;
            if (getFeeStatus(student, 'hostel') === 'Paid') hostelPaid++;
        });

        return {
            total,
            semesterPaid,
            examPaid,
            hostelPaid,
            semesterPending: total - semesterPaid,
            examPending: total - examPaid,
            hostelPending: total - hostelPaid,
            // pendingDocuments omitted for now as it requires async lookups per student
            pendingDocuments: {},
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
                title="B.Tech CSE Programs"
                items={[
                    { label: 'B.Tech CSE – 1st Year', name: 'B.Tech', year: 1, category: 'UG' },
                    { label: 'B.Tech CSE – 2nd Year', name: 'B.Tech', year: 2, category: 'UG' },
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
                    { label: 'M.Tech Data Science – 1st Year', name: 'M.Tech DS', year: 1, category: 'PG' },
                    { label: 'M.Tech CSE – 1st Year', name: 'M.Tech CSE', year: 1, category: 'PG' },
                ]}
            />
            <ProgramSection
                title="M.Sc Programs"
                items={[
                    { label: 'M.Sc CS – 2nd Year', name: 'M.Sc CS', year: 2, category: 'PG' },
                    { label: 'M.Sc Data Analytics – 1st Year', name: 'M.Sc Data Analytics', year: 1, category: 'PG' },
                    { label: 'M.Sc CS Integrated – 1st Year', name: 'M.Sc CS Integrated', year: 1, category: 'PG' },
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
        const stats = calculateClassStats();

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
        marginTop: 16,
        marginBottom: 8,
    },
    categorySubtitle: {
        fontSize: getFontSize(16),
        color: colors.white,
        opacity: 0.9,
    },
    sectionContainer: {
        padding: getPadding(16),
    },
    sectionTitle: {
        fontSize: getFontSize(18),
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 16,
    },
    listItem: {
        backgroundColor: colors.white,
        borderRadius: 12,
        marginBottom: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    listItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    listItemText: {
        fontSize: getFontSize(16),
        color: colors.textPrimary,
        fontWeight: '500',
    },
    classHeaderCard: {
        margin: 16,
        marginBottom: 8,
        alignItems: 'center',
        padding: 24,
    },
    classTitle: {
        fontSize: getFontSize(20),
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    classSubtitle: {
        fontSize: getFontSize(14),
        color: colors.textSecondary,
    },
    tableCard: {
        margin: 16,
        padding: 0,
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.primary + '10',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },
    tableHeaderText: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.primary,
    },
    tableRow: {
        flexDirection: 'row',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
        alignItems: 'center',
    },
    emptyTableRow: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        color: colors.textSecondary,
    },
    tableCell: {
        fontSize: 12,
        color: colors.textPrimary,
    },
    colSno: {
        width: 40,
        textAlign: 'center',
    },
    colRegNo: {
        flex: 1,
        paddingHorizontal: 4,
    },
    colName: {
        flex: 1.5,
        paddingHorizontal: 4,
    },
    colFee: {
        width: 50,
        alignItems: 'center',
        paddingHorizontal: 2,
    },
    colDocs: {
        width: 50,
        alignItems: 'center',
    },
    statusBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusText: {
        color: colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    docButton: {
        padding: 4,
    },
    summaryCard: {
        margin: 16,
        marginTop: 0,
        marginBottom: 32,
    },
    summaryTitle: {
        fontSize: getFontSize(18),
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
    },
    summarySection: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: colors.gray200,
    },
    summarySectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 12,
    },
    summaryStatus: {
        flexDirection: 'row',
    },
    noPendingText: {
        color: colors.success,
        fontSize: 14,
        fontStyle: 'italic',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: 20,
        maxHeight: '80%',
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    modalScrollView: {
        padding: 20,
    },
    studentInfo: {
        padding: 20,
        backgroundColor: colors.gray100,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },
    infoText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    infoSubtext: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 8,
        marginTop: 16,
    },
    pickerContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    pickerButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.gray300,
        backgroundColor: colors.white,
    },
    pickerButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    pickerButtonText: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    pickerButtonTextActive: {
        color: colors.white,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.gray300,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 14,
    },
    modalButtons: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: colors.gray200,
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalButtonCancel: {
        backgroundColor: colors.gray200,
    },
    modalButtonConfirm: {
        backgroundColor: colors.primary,
    },
    modalButtonCancelText: {
        color: colors.textPrimary,
        fontWeight: '600',
    },
    modalButtonConfirmText: {
        color: colors.white,
        fontWeight: '600',
    },
    // Document Status Styles inside Modal
    documentsSection: {
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: colors.gray200,
    },
    loadingText: {
        color: colors.textSecondary,
        fontStyle: 'italic',
        fontSize: 13,
    },
    documentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    documentLabel: {
        fontSize: 13,
        color: colors.textSecondary,
        flex: 1,
    },
    documentStatus: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
    },
    documentStatusText: {
        fontSize: 10,
        fontWeight: '600',
    },
});

export default OfficeFeeManagement;
