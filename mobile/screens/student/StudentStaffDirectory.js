import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Modal,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import colors from '../../styles/colors';
import staffData from '../../data/staffData';
import staffImages from '../../assets/staffImages';
import { moderateScale, verticalScale, getFontSize, getPadding, getMargin } from '../../utils/responsive';

const StudentStaffDirectory = () => {
    const [selectedCategory, setSelectedCategory] = useState('Professor');
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const categories = ['Professor', 'Associate Professor', 'Assistant Professor'];

    const getFilteredStaff = () => {
        return staffData.filter(staff => staff.designation === selectedCategory);
    };

    const handleStaffClick = (staff) => {
        setSelectedStaff(staff);
        setModalVisible(true);
    };

    const handleEmailPress = (email) => {
        Linking.openURL(`mailto:${email}`);
    };

    const handlePhonePress = (phone) => {
        Linking.openURL(`tel:${phone}`);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Staff Directory" subtitle="Department Faculty" />

            {/* Category Tabs */}
            <View style={styles.tabContainer}>
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category}
                        style={[
                            styles.tab,
                            selectedCategory === category && styles.tabActive
                        ]}
                        onPress={() => setSelectedCategory(category)}
                    >
                        <Text style={[
                            styles.tabText,
                            selectedCategory === category && styles.tabTextActive
                        ]}>
                            {category}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Staff Grid */}
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <View style={styles.grid}>
                    {getFilteredStaff().map((staff, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.staffCard}
                            onPress={() => handleStaffClick(staff)}
                        >
                            <Image
                                source={staffImages[staff.imageKey]}
                                style={styles.staffImage}
                                resizeMode="cover"
                            />
                            <View style={styles.staffInfo}>
                                <Text style={styles.staffName} numberOfLines={2}>
                                    {staff.name}
                                </Text>
                                <View style={styles.designationBadge}>
                                    <Text style={styles.designationText}>{staff.designation}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Staff Detail Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {selectedStaff && (
                                <>
                                    <Image
                                        source={staffImages[selectedStaff.imageKey]}
                                        style={styles.modalImage}
                                        resizeMode="cover"
                                    />

                                    <Text style={styles.modalName}>{selectedStaff.name}</Text>

                                    <View style={styles.modalBadge}>
                                        <Text style={styles.modalBadgeText}>{selectedStaff.designation}</Text>
                                    </View>

                                    <View style={styles.detailSection}>
                                        <Text style={styles.detailLabel}>Department</Text>
                                        <Text style={styles.detailValue}>{selectedStaff.department}</Text>
                                    </View>

                                    <View style={styles.detailSection}>
                                        <Text style={styles.detailLabel}>Subjects Handled</Text>
                                        {selectedStaff.subjectsHandled.map((subject, idx) => (
                                            <View key={idx} style={styles.subjectItem}>
                                                <Text style={styles.bullet}>•</Text>
                                                <Text style={styles.subjectText}>{subject}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    <View style={styles.detailSection}>
                                        <Text style={styles.detailLabel}>Course Coordinator</Text>
                                        <Text style={styles.detailValue}>{selectedStaff.courseCoordinator}</Text>
                                    </View>

                                    <View style={styles.detailSection}>
                                        <Text style={styles.detailLabel}>Faculty In-Charge</Text>
                                        <Text style={styles.detailValue}>
                                            {selectedStaff.facultyInCharge || 'Not Assigned'}
                                        </Text>
                                    </View>

                                    <View style={styles.contactSection}>
                                        <TouchableOpacity
                                            style={styles.contactButton}
                                            onPress={() => handlePhonePress(selectedStaff.contact)}
                                        >
                                            <Text style={styles.contactLabel}>Mobile</Text>
                                            <Text style={styles.contactText}>{selectedStaff.contact}</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.contactButton}
                                            onPress={() => handleEmailPress(selectedStaff.email)}
                                        >
                                            <Text style={styles.contactLabel}>Email</Text>
                                            <Text style={styles.contactText} numberOfLines={1}>
                                                {selectedStaff.email}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
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
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    tab: {
        flex: 1,
        paddingVertical: getPadding(14),
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: colors.primary,
    },
    tabText: {
        fontSize: getFontSize(13),
        fontWeight: '600',
        color: colors.textSecondary,
    },
    tabTextActive: {
        color: colors.primary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: getPadding(16),
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    staffCard: {
        width: '48%',
        backgroundColor: colors.white,
        borderRadius: moderateScale(12),
        marginBottom: getMargin(16),
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: verticalScale(2) },
        shadowOpacity: 0.1,
        shadowRadius: moderateScale(4),
        elevation: 3,
        overflow: 'hidden',
    },
    staffImage: {
        width: '100%',
        height: verticalScale(180),
        backgroundColor: colors.gray200,
    },
    staffInfo: {
        padding: getPadding(12),
    },
    staffName: {
        fontSize: getFontSize(14),
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: getMargin(8),
        minHeight: verticalScale(36),
    },
    designationBadge: {
        backgroundColor: '#FFD700',
        paddingHorizontal: getPadding(8),
        paddingVertical: getPadding(4),
        borderRadius: moderateScale(4),
        alignSelf: 'flex-start',
    },
    designationText: {
        fontSize: getFontSize(10),
        fontWeight: '600',
        color: colors.textPrimary,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: getPadding(20),
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: moderateScale(12),
        padding: getPadding(20),
        maxHeight: '90%',
    },
    modalImage: {
        width: '100%',
        height: verticalScale(250),
        borderRadius: moderateScale(12),
        marginBottom: getMargin(16),
        backgroundColor: colors.gray200,
    },
    modalName: {
        fontSize: getFontSize(22),
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: getMargin(12),
        textAlign: 'center',
    },
    modalBadge: {
        backgroundColor: '#FFD700',
        paddingHorizontal: getPadding(16),
        paddingVertical: getPadding(8),
        borderRadius: moderateScale(8),
        alignSelf: 'center',
        marginBottom: getMargin(20),
    },
    modalBadgeText: {
        fontSize: getFontSize(14),
        fontWeight: '600',
        color: colors.textPrimary,
    },
    detailSection: {
        marginBottom: getMargin(16),
        paddingBottom: getPadding(16),
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    detailLabel: {
        fontSize: getFontSize(12),
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: getMargin(6),
        textTransform: 'uppercase',
    },
    detailValue: {
        fontSize: getFontSize(15),
        color: colors.textPrimary,
        lineHeight: getFontSize(22),
    },
    subjectItem: {
        flexDirection: 'row',
        marginBottom: getMargin(4),
    },
    bullet: {
        fontSize: getFontSize(15),
        color: colors.primary,
        marginRight: getMargin(8),
    },
    subjectText: {
        fontSize: getFontSize(15),
        color: colors.textPrimary,
        flex: 1,
    },
    contactSection: {
        marginTop: getMargin(8),
        gap: getMargin(12),
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray50,
        padding: getPadding(12),
        borderRadius: moderateScale(8),
        borderWidth: 1,
        borderColor: colors.border,
    },
    contactLabel: {
        fontSize: getFontSize(12),
        color: colors.textSecondary,
        marginRight: getMargin(12),
        fontWeight: '600',
        textTransform: 'uppercase',
        width: moderateScale(60), // Fixed width for alignment
    },
    contactText: {
        fontSize: getFontSize(14),
        color: colors.primary,
        flex: 1,
        fontWeight: '500',
    },
    closeButton: {
        backgroundColor: colors.primary,
        paddingVertical: getPadding(14),
        borderRadius: moderateScale(8),
        alignItems: 'center',
        marginTop: getMargin(16),
    },
    closeButtonText: {
        color: colors.white,
        fontSize: getFontSize(16),
        fontWeight: '600',
    },
});

export default StudentStaffDirectory;
