import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import PremiumCard from '../../components/PremiumCard';
import Button from '../../components/Button';
import colors from '../../styles/colors';

const StudentComplaint = () => {
    const { user } = useAuth();
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('Academic');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const categories = ['Academic', 'Administrative', 'Infrastructure', 'Hostel', 'Other'];

    const handleSubmit = async () => {
        if (!subject.trim()) {
            Alert.alert('Error', 'Please enter a subject');
            return;
        }
        if (!description.trim()) {
            Alert.alert('Error', 'Please enter complaint details');
            return;
        }

        setSubmitting(true);
        try {
            await addDoc(collection(db, 'complaints'), {
                studentId: user?.uid,
                studentEmail: user?.email,
                subject: subject.trim(),
                category,
                description: description.trim(),
                status: 'Pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            Alert.alert(
                'Success',
                'Your complaint has been submitted successfully. We will review it and get back to you soon.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setSubject('');
                            setDescription('');
                            setCategory('Academic');
                        },
                    },
                ]
            );
        } catch (error) {
            console.error('Error submitting complaint:', error);
            Alert.alert('Error', 'Failed to submit complaint. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.header}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>File a Complaint</Text>
                        <Text style={styles.headerSubtitle}>We're here to help</Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <PremiumCard style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons
                            name="information-outline"
                            size={22}
                            color={colors.primary}
                            style={styles.infoIcon}
                        />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.infoText}>
                                Please provide detailed information about your complaint. Our team will review
                                and respond to your concern as soon as possible.
                            </Text>
                        </View>
                    </View>
                </PremiumCard>

                <PremiumCard style={styles.formCard}>
                    <Text style={styles.label}>Category</Text>
                    <View style={styles.categoryContainer}>
                        {categories.map((cat) => (
                            <Button
                                key={cat}
                                title={cat}
                                variant={category === cat ? 'primary' : 'outline'}
                                onPress={() => setCategory(cat)}
                                style={styles.categoryButton}
                                textStyle={styles.categoryButtonText}
                            />
                        ))}
                    </View>

                    <Text style={styles.label}>Subject *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Brief description of your complaint"
                        value={subject}
                        onChangeText={setSubject}
                        maxLength={100}
                    />

                    <Text style={styles.label}>Details *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Please provide detailed information about your complaint..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                        maxLength={1000}
                    />

                    <Text style={styles.charCount}>
                        {description.length}/1000 characters
                    </Text>

                    <Button
                        title={submitting ? 'Submitting...' : 'Submit Complaint'}
                        onPress={handleSubmit}
                        loading={submitting}
                        style={styles.submitButton}
                    />
                </PremiumCard>

                <View style={{ height: 40 }} />
            </ScrollView>
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
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: colors.white,
        opacity: 0.9,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    infoCard: {
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    infoIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    infoText: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    formCard: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 8,
        marginTop: 16,
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 8,
    },
    categoryButton: {
        flex: 1,
        minWidth: '30%',
        marginBottom: 8,
    },
    categoryButtonText: {
        fontSize: 12,
    },
    input: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.gray200,
        borderRadius: 12,
        padding: 16,
        fontSize: 15,
        color: colors.textPrimary,
        marginBottom: 8,
    },
    textArea: {
        height: 120,
        paddingTop: 16,
    },
    charCount: {
        fontSize: 12,
        color: colors.textLight,
        textAlign: 'right',
        marginBottom: 16,
    },
    submitButton: {
        marginTop: 8,
    },
});

export default StudentComplaint;

