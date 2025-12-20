import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import colors from '../styles/colors';

const WelcomeScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>PUDoCS</Text>
                    <Text style={[styles.subtitle, { color: 'white' }]}>Debug: Welcome Loaded</Text>
                    <Text style={styles.subtitle}>Department of Computer Science</Text>
                    <Text style={styles.university}>Pondicherry University</Text>
                </View>

                <View style={styles.illustration}>
                    <View style={styles.iconCircle}>
                        <Text style={styles.iconText}>🎓</Text>
                    </View>
                </View>

                <View style={styles.description}>
                    <Text style={styles.descriptionText}>
                        Your complete department management system for academic excellence
                    </Text>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Get Started"
                        onPress={() => navigation.navigate('RoleSelection')}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        color: colors.white,
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 18,
        color: colors.white,
        marginTop: 8,
        opacity: 0.9,
    },
    university: {
        fontSize: 16,
        color: colors.white,
        marginTop: 4,
        opacity: 0.8,
    },
    illustration: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCircle: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    iconText: {
        fontSize: 80,
    },
    description: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    descriptionText: {
        fontSize: 16,
        color: colors.white,
        textAlign: 'center',
        lineHeight: 24,
        opacity: 0.9,
    },
    buttonContainer: {
        marginBottom: 20,
    },
});

export default WelcomeScreen;
