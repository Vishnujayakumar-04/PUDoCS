import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Modal, TextInput, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import colors from '../../styles/colors';

const StudentLetters = () => {
    const { user } = useAuth();
    const [requestType, setRequestType] = useState(null);
    const [statusView, setStatusView] = useState(false);
    const [letterRequests, setLetterRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [purpose, setPurpose] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const letterTypes = [
        { id: 1, title: 'Bonafide Certificate', icon: 'file-certificate', description: 'For bank account, passport, or scholarship purposes.', fee: '₹50' },
        { id: 2, title: 'Course Completion', icon: 'school-outline', description: 'Formal letter stating the current status of your degree.', fee: '₹100' },
        { id: 3, title: 'Fee Structure', icon: 'cash-register', description: 'Official document detailing semester-wise fee breakdown.', fee: 'Free' },
        { id: 4, title: 'Character Certificate', icon: 'account-check', description: 'Attestation of conduct during the academic period.', fee: '₹50' },
    ];

    useEffect(() => {
        loadLetterRequests();
    }, []);

    const loadLetterRequests = async () => {
        if (!user?.uid) {
            setLoading(false);
            return;
        }
        
        try {
            setRefreshing(true);
            const requests = await studentService.getLetterRequests(user.uid);
            setLetterRequests(requests);
        } catch (error) {
            console.error('Error loading letter requests:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRequestPress = (type) => {
        setRequestType(type);
        setPurpose('');
        setModalVisible(true);
    };

    const handleSubmitRequest = async () => {
        if (!purpose.trim()) {
            Alert.alert('Error', 'Please provide a purpose for this request');
            return;
        }

        setSubmitting(true);
        try {
            await studentService.requestLetter(user.uid, requestType.title, purpose.trim());
            Alert.alert('Success', 'Your request has been submitted successfully. We will process it within 3-5 working days.');
            setModalVisible(false);
            setPurpose('');
            setRequestType(null);
            loadLetterRequests();
        } catch (error) {
            console.error('Error submitting request:', error);
            Alert.alert('Error', 'Failed to submit request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateValue) => {
        if (!dateValue) return '';
        try {
            if (dateValue.toDate) return dateValue.toDate().toLocaleDateString();
            return new Date(dateValue).toLocaleDateString();
        } catch (e) {
            return dateValue.toString();
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return '#10B981';
            case 'rejected': return '#EF4444';
            case 'collected': return '#4F46E5';
            case 'pending': return '#F59E0B';
            default: return colors.gray500;
        }
    };

    const renderList = () => (
        <ScrollView 
            style={styles.viewContainer} 
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={loadLetterRequests} />
            }
        >
            <Text style={styles.sectionTitle}>Request New Document</Text>
            {letterTypes.map((item) => (
                <TouchableOpacity key={item.id} style={styles.letterCard} onPress={() => handleRequestPress(item)}>
                    <View style={styles.iconBox}>
                        <MaterialCommunityIcons name={item.icon} size={28} color={colors.primary} />
                    </View>
                    <View style={styles.letterInfo}>
                        <Text style={styles.letterTitle}>{item.title}</Text>
                        <Text style={styles.letterDesc}>{item.description}</Text>
                        <Text style={styles.letterFee}>Application Fee: {item.fee}</Text>
                    </View>
                    <MaterialCommunityIcons name="plus-circle" size={24} color={colors.primary} />
                </TouchableOpacity>
            ))}

            <View style={styles.footerInfo}>
                <MaterialCommunityIcons name="information-outline" size={20} color={colors.gray500} />
                <Text style={styles.footerText}>Documents are usually processed within 3-5 working days.</Text>
            </View>
        </ScrollView>
    );

    const renderStatus = () => (
        <ScrollView 
            style={styles.viewContainer} 
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={loadLetterRequests} />
            }
        >
            <Text style={styles.sectionTitle}>Request History</Text>
            {letterRequests.length === 0 ? (
                <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="file-document-outline" size={60} color={colors.gray300} />
                    <Text style={styles.emptyText}>No requests yet</Text>
                    <Text style={styles.emptySubtext}>Submit a request to see it here</Text>
                </View>
            ) : (
                letterRequests.map((req) => {
                    const statusColor = getStatusColor(req.status);
                    return (
                        <Card key={req.id} style={styles.historyCard}>
                            <View style={styles.historyTop}>
                                <Text style={styles.historyType}>{req.type}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                                    <Text style={[styles.statusText, { color: statusColor }]}>
                                        {req.status || 'Pending'}
                                    </Text>
                                </View>
                            </View>
                            {req.purpose && (
                                <Text style={styles.purposeText}>Purpose: {req.purpose}</Text>
                            )}
                            <View style={styles.historyBottom}>
                                <Text style={styles.historyDate}>
                                    Requested on {formatDate(req.createdAt)}
                                </Text>
                            </View>
                        </Card>
                    );
                })
            )}
        </ScrollView>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.header}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Letters & Requests</Text>
                        <Text style={styles.headerSubtitle}>Apply for certificates and documents</Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    onPress={() => setStatusView(false)}
                    style={[styles.tab, !statusView && styles.activeTab]}
                >
                    <Text style={[styles.tabText, !statusView && styles.activeTabText]}>New Request</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setStatusView(true)}
                    style={[styles.tab, statusView && styles.activeTab]}
                >
                    <Text style={[styles.tabText, statusView && styles.activeTabText]}>Status</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <LoadingSpinner />
            ) : (
                statusView ? renderStatus() : renderList()
            )}

            {/* Request Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Request {requestType?.title}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>
                        
                        <Text style={styles.modalLabel}>Purpose *</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Please specify the purpose for this request..."
                            value={purpose}
                            onChangeText={setPurpose}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            maxLength={500}
                        />
                        <Text style={styles.charCount}>{purpose.length}/500 characters</Text>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setModalVisible(false);
                                    setPurpose('');
                                    setRequestType(null);
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.submitButton]}
                                onPress={handleSubmitRequest}
                                disabled={submitting || !purpose.trim()}
                            >
                                <Text style={styles.submitButtonText}>
                                    {submitting ? 'Submitting...' : 'Submit Request'}
                                </Text>
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
        paddingBottom: 25,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.white,
    },
    headerSubtitle: {
        fontSize: 14,
        color: colors.white,
        opacity: 0.8,
        marginTop: 4,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginTop: 20,
        gap: 10,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: colors.white,
    },
    activeTab: {
        backgroundColor: colors.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.textSecondary,
    },
    activeTabText: {
        color: colors.white,
    },
    viewContainer: {
        flex: 1,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 20,
    },
    letterCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 15,
        elevation: 2,
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    letterInfo: {
        flex: 1,
        marginLeft: 15,
    },
    letterTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    letterDesc: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 4,
    },
    letterFee: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.secondary,
        marginTop: 4,
    },
    historyCard: {
        marginBottom: 15,
    },
    historyTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    historyType: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    historyBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
        paddingTop: 12,
    },
    historyDate: {
        fontSize: 12,
        color: colors.gray500,
    },
    viewAction: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.primary,
    },
    footerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    footerText: {
        fontSize: 12,
        color: colors.gray500,
        marginLeft: 10,
        flex: 1,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textSecondary,
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.textLight,
        marginTop: 8,
    },
    purposeText: {
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: 8,
        fontStyle: 'italic',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 20,
        width: '90%',
        maxWidth: 500,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    modalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    modalInput: {
        backgroundColor: colors.gray50,
        borderWidth: 1,
        borderColor: colors.gray200,
        borderRadius: 12,
        padding: 16,
        fontSize: 15,
        color: colors.textPrimary,
        minHeight: 100,
        marginBottom: 8,
    },
    charCount: {
        fontSize: 12,
        color: colors.textLight,
        textAlign: 'right',
        marginBottom: 20,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: colors.gray200,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    submitButton: {
        backgroundColor: colors.primary,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.white,
    },
});

export default StudentLetters;
