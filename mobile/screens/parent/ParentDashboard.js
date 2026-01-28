import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import colors from '../../styles/colors';
import theme from '../../styles/theme';
import Button from '../../components/Button';

const ParentDashboard = ({ navigation }) => {
    const { logout, user } = useAuth();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudent = async () => {
            if (!user?.uid) return;
            try {
                // Use parentService (Offline First)
                const { parentService } = require('../../services/parentService');
                const wardProfile = await parentService.getWardDetails(user.uid);

                if (wardProfile) {
                    setStudent(wardProfile);
                } else {
                    console.log('No ward details found for parent');
                }
            } catch (e) {
                console.log('Error fetching ward:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchStudent();
    }, [user]);

    const handleLogout = () => {
        logout();
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Parent Dashboard</Text>
                    <Text style={styles.subtitle}>Welcome, {user?.name || 'Parent'}</Text>
                </View>

                {student ? (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Student Details</Text>
                        <Text style={styles.studentName}>{student.name}</Text>
                        <Text style={styles.studentInfo}>{student.registerNumber}</Text>
                        <Text style={styles.studentInfo}>{student.program} - Year {student.year}</Text>
                    </View>
                ) : (
                    <View style={styles.card}>
                        <Text style={styles.infoText}>No student linked to this account.</Text>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Overview</Text>
                    {/* Placeholders for tiles */}
                    <View style={styles.grid}>
                        <View style={styles.tile}>
                            <Text style={styles.tileValue}>---%</Text>
                            <Text style={styles.tileLabel}>Attendance</Text>
                        </View>
                        <View style={styles.tile}>
                            <Text style={styles.tileValue}>---</Text>
                            <Text style={styles.tileLabel}>Results</Text>
                        </View>
                    </View>
                </View>

                <Button title="Logout" onPress={handleLogout} style={styles.logoutButton} outline />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 20,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.gray900,
    },
    subtitle: {
        fontSize: 16,
        color: colors.gray500,
        marginTop: 4,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 20,
        ...theme.shadows.card,
        marginBottom: 24,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.gray400,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    studentName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.gray900,
    },
    studentInfo: {
        fontSize: 16,
        color: colors.gray600,
        marginTop: 4,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.gray900,
        marginBottom: 16,
    },
    grid: {
        flexDirection: 'row',
        gap: 16,
    },
    tile: {
        flex: 1,
        backgroundColor: colors.surface,
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    tileValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
    },
    tileLabel: {
        fontSize: 14,
        color: colors.gray600,
        marginTop: 4,
    },
    logoutButton: {
        marginTop: 20,
        borderColor: colors.error,
    },
    infoText: {
        color: colors.gray500,
        fontStyle: 'italic',
    }
});

export default ParentDashboard;
