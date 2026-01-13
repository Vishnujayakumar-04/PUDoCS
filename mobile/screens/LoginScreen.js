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
    useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import colors from '../styles/colors';

const LoginScreen = ({ route, navigation }) => {
    const { login } = useAuth();
    const { role } = route.params;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { width } = useWindowDimensions();
    const isLargeScreen = width > 768;

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        const lowerEmail = email.toLowerCase().trim();
        if (!lowerEmail.endsWith('@pondiuni.ac.in')) {
            Alert.alert('Invalid Email', 'Please use your official university email (@pondiuni.ac.in)');
            return;
        }

        setLoading(true);
        try {
            await login(lowerEmail, password, role);
        } catch (error) {
            console.log("Login error:", error);

            let errorMessage = error.message;
            if (error.code === 'auth/invalid-credential' || error.message.includes('invalid-credential')) {
                errorMessage = "Invalid credentials. Please check your email and password.";
            } else if (error.message.includes('No user record found in Firestore')) {
                errorMessage = "Access Denied: Your account is not authorized in the department database.";
            }

            Alert.alert('Login Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={[styles.content, isLargeScreen && styles.contentLarge]}>
                    <View style={styles.topBar}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
                            <Text style={styles.backLinkText}>← Change Role</Text>
                        </TouchableOpacity>
                        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(role) }]}>
                            <Text style={styles.roleBadgeText}>{role}</Text>
                        </View>
                    </View>

                    <View style={styles.mainSection}>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.welcomeTitle}>Welcome Back</Text>
                            <Text style={styles.welcomeSub}>Enter your credentials to access the portal</Text>
                        </View>

                        <View style={styles.formContainer}>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>University Email</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 24mscscpy0054@pondiuni.ac.in"
                                    placeholderTextColor={colors.gray400}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>

                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>Password</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••"
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
                                style={styles.actionButton}
                            />

                            <View style={styles.demoHint}>
                                <Text style={styles.demoText}>Use your official University ID & Password</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

// Helper for badge color
const getRoleColor = (role) => {
    if (role === 'Student') return colors.primaryLight;
    if (role === 'Staff') return colors.secondary;
    return colors.accent;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40,
    },
    backLinkText: {
        color: colors.gray500,
        fontSize: 15,
        fontWeight: '500',
    },
    roleBadge: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    roleBadgeText: {
        color: colors.white,
        fontWeight: '700',
        fontSize: 13,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    mainSection: {
        flex: 1,
        justifyContent: 'center', // Center vertically
        paddingBottom: 80, // Push up slightly
    },
    headerTextContainer: {
        marginBottom: 32,
    },
    welcomeTitle: {
        fontSize: 30,
        fontWeight: '800',
        color: colors.gray900,
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    welcomeSub: {
        fontSize: 16,
        color: colors.gray500,
    },
    formContainer: {
        gap: 20,
    },
    inputWrapper: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.gray700,
        marginLeft: 4,
    },
    input: {
        backgroundColor: colors.surface,
        borderWidth: 1.5,
        borderColor: colors.gray200,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        color: colors.textPrimary,
        height: 56, // Tall inputs
    },
    actionButton: {
        marginTop: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },
    demoHint: {
        alignItems: 'center',
        padding: 12,
        backgroundColor: colors.gray100,
        borderRadius: 8,
        marginTop: 8,
        width: '100%',
    },
    demoText: {
        color: colors.gray600,
        fontSize: 13,
        marginBottom: 8,
    },
    credentialsBox: {
        marginTop: 12,
        padding: 12,
        backgroundColor: colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.primary + '30',
        width: '100%',
    },
    credentialsTitle: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    credentialsText: {
        fontSize: 11,
        color: colors.textPrimary,
        fontFamily: 'monospace',
        lineHeight: 16,
    },
    toggleButton: {
        alignItems: 'center',
        marginTop: 16,
        padding: 8,
    },
    toggleText: {
        color: colors.primary,
        fontWeight: '600',
        fontSize: 15,
    },
    contentLarge: {
        width: '100%',
        maxWidth: 480,
        alignSelf: 'center',
    },
});

export default LoginScreen;
