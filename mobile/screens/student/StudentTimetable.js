import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Picker } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { studentService } from '../../services/studentService';
import Header from '../../components/Header';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';

const StudentTimetable = () => {
    const [timetable, setTimetable] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState('Monday');

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => {
        loadTimetable();
    }, []);

    const loadTimetable = async () => {
        try {
            const data = await studentService.getTimetable();
            setTimetable(data);
        } catch (error) {
            console.error('Error loading timetable:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    const getDaySchedule = () => {
        return timetable?.schedule?.find(s => s.day === selectedDay)?.slots || [];
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Timetable" subtitle={`${timetable?.program} - Year ${timetable?.year}`} />

            <View style={styles.daySelector}>
                <Text style={styles.daySelectorLabel}>Select Day:</Text>
                <View style={styles.pickerContainer}>
                    {days.map(day => (
                        <Text
                            key={day}
                            style={[
                                styles.dayButton,
                                selectedDay === day && styles.dayButtonActive
                            ]}
                            onPress={() => setSelectedDay(day)}
                        >
                            {day.substring(0, 3)}
                        </Text>
                    ))}
                </View>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {getDaySchedule().length === 0 ? (
                    <Card>
                        <Text style={styles.noDataText}>No classes scheduled for {selectedDay}</Text>
                    </Card>
                ) : (
                    getDaySchedule().map((slot, index) => (
                        <Card key={index}>
                            <View style={styles.slotHeader}>
                                <Text style={styles.timeText}>
                                    {slot.startTime} - {slot.endTime}
                                </Text>
                                <View style={[styles.typeBadge, { backgroundColor: getTypeColor(slot.type) }]}>
                                    <Text style={styles.typeBadgeText}>{slot.type}</Text>
                                </View>
                            </View>
                            <Text style={styles.subjectText}>{slot.subject}</Text>
                            <Text style={styles.facultyText}>
                                {slot.faculty?.name || 'TBA'}
                            </Text>
                            {slot.room && (
                                <Text style={styles.roomText}>Room: {slot.room}</Text>
                            )}
                        </Card>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const getTypeColor = (type) => {
    switch (type) {
        case 'Lecture':
            return colors.primary;
        case 'Lab':
            return colors.secondary;
        case 'Tutorial':
            return colors.accent;
        default:
            return colors.gray500;
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    daySelector: {
        backgroundColor: colors.white,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    daySelectorLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 12,
    },
    pickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: colors.gray100,
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    dayButtonActive: {
        backgroundColor: colors.primary,
        color: colors.white,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    slotHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    timeText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
    },
    typeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    typeBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.white,
    },
    subjectText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    facultyText: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    roomText: {
        fontSize: 12,
        color: colors.textLight,
    },
    noDataText: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});

export default StudentTimetable;
