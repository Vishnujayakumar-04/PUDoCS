import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../styles/colors';
import { useAuth } from '../context/AuthContext';

const RoleSelectionScreen = ({ navigation }) => {
    const { login } = useAuth();
    const [loadingRole, setLoadingRole] = useState(null);

    const roles = [
        {
            id: 'Student',
            title: 'Student',
            icon: '👨‍🎓',
            email: 'student@pu.edu',
            description: 'Access your profile, timetable, exams, and results',
            color: colors.primary,
        },
        {
            id: 'Staff',
            title: 'Staff',
            icon: '👨‍🏫',
            email: 'staff@pu.edu',
            description: 'Manage students, attendance, exams, and notices',
            color: colors.secondary,
        },
        {
            id: 'Office',
            title: 'Office',
            icon: '🏢',
            email: 'office@pu.edu',
            description: 'Administrative control, fees, and records management',
            color: colors.accent,
        },
    ];

    const handleRoleSelect = async (role) => {
        setLoadingRole(role.id);
        try {
            // Auto-login with test credentials
            await login(role.email, 'test123', role.id);
            // No need to navigate, AuthNavigator will handle switching based on isAuthenticated
        } catch (error) {
            console.error('Auto-login error:', error);
            Alert.alert(
                'Selection Failed',
                'Could not connect to the backend. Please ensure the server is running and you are on the same WiFi.'
            );
        } finally {
            setLoadingRole(null);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Welcome to PUDoCS</Text>
                <Text style={styles.subtitle}>Select your role to continue</Text>
            </View>

            <View style={styles.rolesContainer}>
                {roles.map((role) => (
                    <TouchableOpacity
                        key={role.id}
                        style={[styles.roleCard, { borderColor: role.color }]}
                        onPress={() => handleRoleSelect(role)}
                        activeOpacity={0.7}
                        disabled={loadingRole !== null}
                    >
                        {loadingRole === role.id ? (
                            <ActivityIndicator size="large" color={role.color} />
                        ) : (
                            <>
                                <View style={[styles.iconContainer, { backgroundColor: role.color }]}>
                                    <Text style={styles.icon}>{role.icon}</Text>
                                </View>
                                <Text style={styles.roleTitle}>{role.title}</Text>
                                <Text style={styles.roleDescription}>{role.description}</Text>
                            </>
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        padding: 24,
        backgroundColor: colors.primary,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.white,
    },
    subtitle: {
        fontSize: 14,
        color: colors.white,
        marginTop: 8,
        opacity: 0.9,
    },
    rolesContainer: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    roleCard: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        alignItems: 'center',
        borderWidth: 3,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    icon: {
        fontSize: 40,
    },
    roleTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    roleDescription: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default RoleSelectionScreen;
