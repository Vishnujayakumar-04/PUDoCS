import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Card from '../../components/Card';
import colors from '../../styles/colors';

const StudentLetters = () => {
    const [requestType, setRequestType] = useState(null);
    const [statusView, setStatusView] = useState(false);

    const letterTypes = [
        { id: 1, title: 'Bonafide Certificate', icon: 'file-certificate', description: 'For bank account, passport, or scholarship purposes.', fee: '₹50' },
        { id: 2, title: 'Course Completion', icon: 'school-outline', description: 'Formal letter stating the current status of your degree.', fee: '₹100' },
        { id: 3, title: 'Fee Structure', icon: 'cash-register', description: 'Official document detailing semester-wise fee breakdown.', fee: 'Free' },
        { id: 4, title: 'Character Certificate', icon: 'account-check', description: 'Attestation of conduct during the academic period.', fee: '₹50' },
    ];

    const pastRequests = [
        { id: 1, type: 'Bonafide Certificate', date: '12 Dec 2025', status: 'Approved', color: '#10B981' },
        { id: 2, type: 'Fee Structure', date: '05 Nov 2025', status: 'Collected', color: '#4F46E5' },
    ];

    const renderList = () => (
        <ScrollView style={styles.viewContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Request New Document</Text>
            {letterTypes.map((item) => (
                <TouchableOpacity key={item.id} style={styles.letterCard} onPress={() => { }}>
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
        <ScrollView style={styles.viewContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Request History</Text>
            {pastRequests.map((req) => (
                <Card key={req.id} style={styles.historyCard}>
                    <View style={styles.historyTop}>
                        <Text style={styles.historyType}>{req.type}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: req.color + '20' }]}>
                            <Text style={[styles.statusText, { color: req.color }]}>{req.status}</Text>
                        </View>
                    </View>
                    <View style={styles.historyBottom}>
                        <Text style={styles.historyDate}>Requested on {req.date}</Text>
                        <TouchableOpacity>
                            <Text style={styles.viewAction}>View Details</Text>
                        </TouchableOpacity>
                    </View>
                </Card>
            ))}
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

            {statusView ? renderStatus() : renderList()}
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
    }
});

export default StudentLetters;
