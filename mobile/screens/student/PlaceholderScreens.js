// Placeholder screens for remaining student features
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import colors from '../../styles/colors';

const PlaceholderScreen = ({ title, subtitle }) => {
    return (
        <SafeAreaView style={styles.container}>
            <Header title={title} subtitle={subtitle} />
            <View style={styles.content}>
                <Text style={styles.icon}>🚧</Text>
                <Text style={styles.text}>This screen is under development</Text>
                <Text style={styles.subtext}>
                    The backend API is ready. UI implementation coming soon.
                </Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    icon: {
        fontSize: 64,
        marginBottom: 16,
    },
    text: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtext: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});

export const StudentEvents = () => (
    <PlaceholderScreen title="Events & Gallery" subtitle="Upcoming and Past Events" />
);

export const StudentResults = () => (
    <PlaceholderScreen title="Results" subtitle="Internal Marks & Semester Results" />
);

export const StudentLetterFormats = () => (
    <PlaceholderScreen title="Letter Formats" subtitle="Official Document Templates" />
);
