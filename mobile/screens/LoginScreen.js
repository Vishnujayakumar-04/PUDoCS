import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import colors from '../styles/colors';

const LoginScreen = ({ route, navigation }) => {
    const { role } = route.params;
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        setLoading(true);
        try {
            await login(email, password, role);
            // Navigation will be handled by AuthContext
        } catch (error) {
            Alert.alert(
                'Login Failed',
                error.message || 'Invalid credentials. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const getRoleIcon = () => {
        switch (role) {
            case 'Student':
                return '👨‍🎓';
            case 'Staff':
                return '👨‍🏫';
            case 'Office':
                return '🏢';
            default:
                return '🎓';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.header}>
                    <Text style={styles.icon}>{getRoleIcon()}</Text>
                    <Text style={styles.title}>{role} Login</Text>
                    <Text style={styles.subtitle}>PUDoCS Department Management</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            placeholderTextColor={colors.gray400}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            placeholderTextColor={colors.gray400}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                    </View>

                    <Button
                        title="Login"
                        onPress={handleLogin}
                        loading={loading}
                        style={styles.loginButton}
                    />

                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Text style={styles.backButtonText}>Change Role</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        backgroundColor: colors.primary,
        padding: 40,
        alignItems: 'center',
    },
    icon: {
        fontSize: 60,
        marginBottom: 16,
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
    form: {
        flex: 1,
        padding: 24,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        color: colors.textPrimary,
    },
    loginButton: {
        marginTop: 12,
    },
    backButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    backButtonText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default LoginScreen;
