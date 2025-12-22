import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Card from '../../components/Card';
import colors from '../../styles/colors';

const { width } = Dimensions.get('window');

const StudentResults = () => {
    // view: 'select' | 'summary' | 'details'
    const [view, setView] = useState('select');
    const [selectedSem, setSelectedSem] = useState(null);
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, [view]);

    const semesters = [
        { id: 1, name: 'Semester 1', gpa: '8.4', status: 'Passed' },
        { id: 2, name: 'Semester 2', gpa: '8.7', status: 'Passed' },
        { id: 3, name: 'Semester 3', gpa: '9.2', status: 'Passed' },
        { id: 4, name: 'Semester 4', gpa: '--', status: 'In Progress' },
    ];

    const detailedResults = {
        'Semester 3': [
            { code: 'CSSC 411', name: 'Software Engineering', credits: 4, grade: 'A+', points: 9 },
            { code: 'CSSC 412', name: 'Computer Networks', credits: 4, grade: 'O', points: 10 },
            { code: 'CSSC 413', name: 'Microprocessors', credits: 3, grade: 'A', points: 8 },
            { code: 'CSEL 541', name: 'Cloud Computing', credits: 3, grade: 'O', points: 10 },
            { code: 'CSSC 451', name: 'Networks Lab', credits: 2, grade: 'O', points: 10 },
        ]
    };

    const handleSemSelect = (sem) => {
        setSelectedSem(sem);
        setView('summary');
    };

    const renderSelection = () => (
        <Animated.ScrollView style={[styles.viewContainer, { opacity: fadeAnim }]} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Select Semester</Text>
            {semesters.map((sem, index) => (
                <TouchableOpacity key={index} style={styles.semCard} onPress={() => handleSemSelect(sem)}>
                    <View style={styles.semInfo}>
                        <Text style={styles.semName}>{sem.name}</Text>
                        <Text style={styles.semStatus}>{sem.status}</Text>
                    </View>
                    <View style={styles.semPerformance}>
                        <Text style={styles.gpaText}>{sem.gpa}</Text>
                        <Text style={styles.gpaLabel}>GPA</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={colors.gray400} />
                </TouchableOpacity>
            ))}
        </Animated.ScrollView>
    );

    const renderSummary = () => (
        <Animated.ScrollView style={[styles.viewContainer, { opacity: fadeAnim }]} showsVerticalScrollIndicator={false}>
            <View style={styles.summaryHeader}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Semester GPA</Text>
                    <Text style={styles.summaryValue}>{selectedSem?.gpa}</Text>
                </View>
                <View style={[styles.summaryCard, { backgroundColor: '#F0FDF4' }]}>
                    <Text style={[styles.summaryLabel, { color: '#16A34A' }]}>CGPA</Text>
                    <Text style={[styles.summaryValue, { color: '#16A34A' }]}>8.76</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Subject-wise Results</Text>
            {detailedResults[selectedSem?.name]?.map((res, index) => (
                <View key={index} style={styles.resultRow}>
                    <View style={styles.resIcon}>
                        <Text style={styles.resGrade}>{res.grade}</Text>
                    </View>
                    <View style={styles.resInfo}>
                        <Text style={styles.resName}>{res.name}</Text>
                        <Text style={styles.resCode}>{res.code} • {res.credits} Credits</Text>
                    </View>
                    <View style={styles.resPoints}>
                        <Text style={styles.pointsValue}>{res.points}</Text>
                        <Text style={styles.pointsLabel}>Points</Text>
                    </View>
                </View>
            )) || (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={40} color={colors.gray300} />
                        <Text style={styles.emptyText}>Detailed results pending</Text>
                    </View>
                )}

            <TouchableOpacity style={styles.downloadBtn}>
                <MaterialCommunityIcons name="file-pdf-box" size={24} color={colors.white} />
                <Text style={styles.downloadBtnText}>Download Marksheet (PDF)</Text>
            </TouchableOpacity>
        </Animated.ScrollView>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.header}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        {view !== 'select' && (
                            <TouchableOpacity onPress={() => setView('select')} style={styles.backButton}>
                                <MaterialCommunityIcons name="arrow-left" size={24} color={colors.white} />
                            </TouchableOpacity>
                        )}
                        <Text style={styles.headerTitle}>
                            {view === 'select' ? 'Results' : selectedSem?.name}
                        </Text>
                        <View style={{ width: 40 }} />
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <View style={styles.content}>
                {view === 'select' ? renderSelection() : renderSummary()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingBottom: 20,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.white,
    },
    content: {
        flex: 1,
    },
    viewContainer: {
        flex: 1,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 15,
        marginTop: 10,
    },
    semCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 15,
        elevation: 3,
        shadowColor: colors.black,
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    semInfo: {
        flex: 1,
    },
    semName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    semStatus: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: '600',
        marginTop: 2,
    },
    semPerformance: {
        alignItems: 'center',
        marginRight: 15,
        paddingHorizontal: 12,
        borderLeftWidth: 1,
        borderLeftColor: colors.gray100,
    },
    gpaText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    gpaLabel: {
        fontSize: 10,
        color: colors.gray500,
        textTransform: 'uppercase',
    },
    summaryHeader: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 20,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: '#EEF2FF',
        padding: 15,
        borderRadius: 16,
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: '600',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
    },
    resultRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
    },
    resIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primaryLight + '20',
        alignItems: 'center',
        justifyContent: 'center',
    },
    resGrade: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
    },
    resInfo: {
        flex: 1,
        marginLeft: 12,
    },
    resName: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    resCode: {
        fontSize: 11,
        color: colors.textSecondary,
        marginTop: 2,
    },
    resPoints: {
        alignItems: 'flex-end',
    },
    pointsValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    pointsLabel: {
        fontSize: 10,
        color: colors.gray500,
    },
    downloadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingVertical: 15,
        borderRadius: 15,
        marginTop: 30,
        marginBottom: 20,
        gap: 10,
    },
    downloadBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.white,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 10,
    },
});

export default StudentResults;
