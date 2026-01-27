import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import colors from '../styles/colors';
import theme from '../styles/theme';


const RoleSelectionScreen = ({ navigation }) => {
    const [loadingRole, setLoadingRole] = useState(null);

    const roles = [
        {
            id: 'Student',
            title: 'Student',
            description: 'Access profile, timetable & results',
            color: colors.primary,
            bg: colors.gray50,
        },
        {
            id: 'Staff',
            title: 'Staff / Faculty',
            description: 'Manage students, exams & attendance',
            color: colors.secondary,
            bg: '#EEF2FF',
        },
        {
            id: 'Office',
            title: 'Office / Admin',
            description: 'Administrative & fee controls',
            color: colors.accent,
            bg: '#ECFEFF',
        },
        {
            id: 'Parent',
            title: 'Parent / Guardian',
            description: 'Monitor student progress & attendance',
            color: '#8B5CF6',
            bg: '#F3E8FF',
        },
    ];

    const handleRoleSelect = (role) => {
        navigation.navigate('Login', { role: role.id });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.content}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.appName}>PUDoCS</Text>
                    <Text style={styles.deptName}>Department of Computer Science</Text>
                    <Text style={styles.subtitle}>Select your role to continue</Text>
                </View>

                {/* Roles Grid */}
                <View style={styles.rolesContainer}>
                    {roles.map((role) => (
                        <TouchableOpacity
                            key={role.id}
                            style={[
                                styles.roleCard,
                                { borderLeftColor: role.color }
                            ]}
                            onPress={() => handleRoleSelect(role)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.textContainer}>
                                <Text style={styles.roleTitle}>{role.title}</Text>
                                <Text style={styles.roleDesc}>{role.description}</Text>
                            </View>
                            <Text style={[styles.arrow, { color: colors.gray400 }]}>›</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.footerText}>© 2024 Pondicherry University</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background, // Soft Off-White
    },
    content: {
        flex: 1,
        padding: theme.spacing.screenPadding,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.xxl,
    },
    logoBadge: {
        width: 64,
        height: 64,
        backgroundColor: colors.white,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.md,
        ...theme.shadows.soft,
    },
    logoIcon: {
        fontSize: 32,
    },
    appName: {
        fontSize: 32,
        fontWeight: '800',
        color: colors.primary,
        letterSpacing: -1,
        marginBottom: 4,
    },
    deptName: {
        ...theme.typography.body2,
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: theme.spacing.sm,
        fontWeight: '600',
    },
    subtitle: {
        fontSize: 16,
        color: colors.gray500,
    },
    rolesContainer: {
        gap: 16, // Modern gap spacing
    },
    roleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: 20,
        borderRadius: 16,
        borderLeftWidth: 4, // Creative accent
        ...theme.shadows.card,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    cardIcon: {
        fontSize: 24,
    },
    textContainer: {
        flex: 1,
    },
    roleTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.gray900,
        marginBottom: 4,
    },
    roleDesc: {
        fontSize: 13,
        color: colors.gray500,
        lineHeight: 18,
    },
    arrow: {
        fontSize: 24,
        fontWeight: '300',
        marginLeft: 12,
    },
    footerText: {
        textAlign: 'center',
        marginTop: 40,
        color: colors.gray400,
        fontSize: 12,
    },
});

export default RoleSelectionScreen;
