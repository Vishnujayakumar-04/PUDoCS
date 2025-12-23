import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Picker,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { staffService } from '../../services/staffService';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';

const StaffAttendanceScreen = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [attendance, setAttendance] = useState({});

    // Filters
    const [course, setCourse] = useState('UG');
    const [program, setProgram] = useState('B.Tech');
    const [year, setYear] = useState('3');
    const [section, setSection] = useState('A');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        loadStudents();
    }, [course, program, year, section]);

    const loadStudents = async () => {
        setLoading(true);
        try {
            const params = { course, program, year, section };
            const data = await staffService.getStudents(params);
            setStudents(data);

            // Initialize attendance state
            const initialAttendance = {};
            data.forEach(student => {
                const studentId = student.id || student._id || student.registerNumber;
                initialAttendance[studentId] = 'Present';
            });
            setAttendance(initialAttendance);
        } catch (error) {
            console.error('Error loading students:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleAttendance = (studentId) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present'
        }));
    };

    const handleSubmitAttendance = async () => {
        try {
            const attendanceData = {
                course,
                program,
                year,
                section,
                date,
                records: Object.entries(attendance).map(([studentId, status]) => ({
                    student: studentId,
                    status
                }))
            };

            await staffService.markAttendance(attendanceData);
            Alert.alert('Success', 'Attendance marked successfully');
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to mark attendance');
        }
    };

    const getPresentCount = () => {
        return Object.values(attendance).filter(status => status === 'Present').length;
    };

    const getAbsentCount = () => {
        return Object.values(attendance).filter(status => status === 'Absent').length;
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Attendance" subtitle="Mark Student Attendance" />

            <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Select Class:</Text>
                <View style={styles.filterRow}>
                    <View style={styles.filterItem}>
                        <Picker
                            selectedValue={course}
                            onValueChange={setCourse}
                            style={styles.picker}
                        >
                            <Picker.Item label="UG" value="UG" />
                            <Picker.Item label="PG" value="PG" />
                        </Picker>
                    </View>
                    <View style={styles.filterItem}>
                        <Picker
                            selectedValue={year}
                            onValueChange={setYear}
                            style={styles.picker}
                        >
                            <Picker.Item label="Year 1" value="1" />
                            <Picker.Item label="Year 2" value="2" />
                            <Picker.Item label="Year 3" value="3" />
                            <Picker.Item label="Year 4" value="4" />
                        </Picker>
                    </View>
                </View>
            </View>

            <View style={styles.summaryContainer}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>{students.length}</Text>
                    <Text style={styles.summaryLabel}>Total</Text>
                </View>
                <View style={[styles.summaryCard, { backgroundColor: colors.success + '20' }]}>
                    <Text style={[styles.summaryValue, { color: colors.success }]}>
                        {getPresentCount()}
                    </Text>
                    <Text style={styles.summaryLabel}>Present</Text>
                </View>
                <View style={[styles.summaryCard, { backgroundColor: colors.error + '20' }]}>
                    <Text style={[styles.summaryValue, { color: colors.error }]}>
                        {getAbsentCount()}
                    </Text>
                    <Text style={styles.summaryLabel}>Absent</Text>
                </View>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {students.map((student) => {
                    const studentId = student.id || student._id || student.registerNumber;
                    return (
                        <TouchableOpacity
                            key={studentId}
                            style={[
                                styles.studentCard,
                                attendance[studentId] === 'Absent' && styles.studentCardAbsent
                            ]}
                            onPress={() => toggleAttendance(studentId)}
                        >
                            <View style={styles.studentInfo}>
                                <Text style={styles.studentName}>{student.name}</Text>
                                <Text style={styles.registerNumber}>{student.registerNumber}</Text>
                            </View>
                            <View
                                style={[
                                    styles.statusBadge,
                                    {
                                        backgroundColor:
                                            attendance[studentId] === 'Present'
                                                ? colors.success
                                                : colors.error
                                    }
                                ]}
                            >
                                <Text style={styles.statusText}>
                                    {attendance[studentId] === 'Present' ? '✓' : '✗'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <View style={styles.footer}>
                <Button
                    title={`Submit Attendance (${getPresentCount()}/${students.length})`}
                    onPress={handleSubmitAttendance}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    filterContainer: {
        backgroundColor: colors.white,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    filterRow: {
        flexDirection: 'row',
        gap: 12,
    },
    filterItem: {
        flex: 1,
    },
    picker: {
        backgroundColor: colors.gray100,
        borderRadius: 8,
    },
    summaryContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: colors.primary + '20',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    studentCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: colors.success,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    studentCardAbsent: {
        borderColor: colors.error,
        backgroundColor: colors.gray50,
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    registerNumber: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 2,
    },
    statusBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusText: {
        fontSize: 20,
        color: colors.white,
        fontWeight: 'bold',
    },
    footer: {
        padding: 16,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
});

export default StaffAttendanceScreen;
