import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { studentService } from '../../services/studentService';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';

const StudentExams = () => {
    const [view, setView] = useState('landing');
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, [view]);

    const loadExams = async (program) => {
        setLoading(true);
        try {
            const data = await studentService.getExams(program, 'I'); // Defaulting to year I for now
            setExams(data || []);
            setView('exams');
        } catch (error) {
            console.error('Error loading exams:', error);
            setExams([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateValue) => {
        if (!dateValue) return '';
        try {
            if (dateValue.toDate) return dateValue.toDate().toLocaleDateString();
            return new Date(dateValue).toLocaleDateString();
        } catch (e) {
            return dateValue.toString();
        }
    };

    const renderLanding = () => (
        <Animated.View style={[styles.viewContainer, { opacity: fadeAnim }]}>
            <Text style={styles.landingTitle}>Exam Schedules</Text>
            <Text style={styles.landingSubtitle}>Select your program level to view schedules</Text>

            <TouchableOpacity style={styles.programCard} onPress={() => loadExams('UG')}>
                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.programGradient}>
                    <MaterialCommunityIcons name="book-education" size={32} color={colors.white} />
                    <View style={styles.programInfo}>
                        <Text style={styles.programText}>Undergraduate (UG)</Text>
                        <Text style={styles.programSubtext}>B.Tech, B.Sc Computer Science</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={colors.white} />
                </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.programCard} onPress={() => loadExams('PG')}>
                <LinearGradient colors={[colors.secondary, colors.primaryDark]} style={styles.programGradient}>
                    <MaterialCommunityIcons name="school" size={32} color={colors.white} />
                    <View style={styles.programInfo}>
                        <Text style={styles.programText}>Postgraduate (PG)</Text>
                        <Text style={styles.programSubtext}>M.Sc, MCA, M.Tech Programs</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={colors.white} />
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );

    const renderExams = () => (
        <View style={styles.flex1}>
            <View style={styles.examsHeader}>
                <TouchableOpacity onPress={() => setView('landing')} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Examination Schedule</Text>
            </View>

            <Animated.ScrollView
                style={[styles.viewContainer, { opacity: fadeAnim }]}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {exams.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="calendar-blank" size={60} color={colors.gray300} />
                        <Text style={styles.emptyText}>No exams scheduled yet</Text>
                    </View>
                ) : (
                    exams.map((exam, index) => (
                        <View key={index} style={styles.timelineItem}>
                            <View style={styles.timelineSide}>
                                <View style={styles.timelineDot} />
                                {index !== exams.length - 1 && <View style={styles.timelineLine} />}
                            </View>
                            <Card style={styles.examCard}>
                                <Text style={styles.examSubject}>{exam.subject}</Text>
                                <Text style={styles.examCourse}>{exam.course}</Text>

                                <View style={styles.examMeta}>
                                    <View style={styles.metaItem}>
                                        <MaterialCommunityIcons name="calendar" size={16} color={colors.primary} />
                                        <Text style={styles.metaText}>{formatDate(exam.date)}</Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <MaterialCommunityIcons name="clock-outline" size={16} color={colors.primary} />
                                        <Text style={styles.metaText}>{exam.time}</Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <MaterialCommunityIcons name="map-marker" size={16} color={colors.secondary} />
                                        <Text style={styles.metaText}>{exam.venue}</Text>
                                    </View>
                                </View>
                            </Card>
                        </View>
                    ))
                )}
            </Animated.ScrollView>
        </View>
    );

    if (loading) return <LoadingSpinner />;

    return (
        <SafeAreaView style={styles.container}>
            {view === 'landing' ? renderLanding() : renderExams()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    flex1: {
        flex: 1,
    },
    viewContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    landingTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginTop: 20,
        paddingHorizontal: 20,
    },
    landingSubtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: 30,
        marginTop: 5,
        paddingHorizontal: 20,
    },
    programCard: {
        marginBottom: 20,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 5,
        marginHorizontal: 20,
    },
    programGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
    },
    programInfo: {
        flex: 1,
        marginLeft: 20,
    },
    programText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.white,
    },
    programSubtext: {
        fontSize: 13,
        color: colors.white,
        opacity: 0.8,
        marginTop: 4,
    },
    examsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: colors.background,
    },
    backButton: {
        padding: 8,
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    timelineItem: {
        flexDirection: 'row',
    },
    timelineSide: {
        width: 30,
        alignItems: 'center',
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.primary,
        marginTop: 20,
        zIndex: 1,
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: colors.gray200,
        marginTop: -10,
    },
    examCard: {
        flex: 1,
        marginLeft: 10,
        marginBottom: 20,
        padding: 16,
    },
    examSubject: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    examCourse: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.primary,
        marginTop: 2,
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    examMeta: {
        gap: 8,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 14,
        color: colors.textSecondary,
        marginLeft: 8,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: colors.textSecondary,
        marginTop: 15,
    },
});

export default StudentExams;
