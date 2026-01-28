import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { crService } from '../../services/crService';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const CRDashboard = () => {
    const { user, role, logout } = useAuth();
    // Assuming profile is stored in user object or fetched via separate service. 
    // AuthContext usually provides user and role. 
    // We might need to fetch profile explicitly if not present.
    // user object from login usually has profile attached as `user.profile` or similar if modified authService.
    const [profile, setProfile] = useState(user?.profile || {});

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('attendance'); // attendance | notices
    const [attendanceMap, setAttendanceMap] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadClassData();
    }, []);

    const loadClassData = async () => {
        setLoading(true);
        try {
            // Unpack profile
            // If profile is missing program/year, we can't do much.
            // For now assuming AuthContext returned the full profile object.

            const program = profile?.program || user?.program; // Fallback
            const year = profile?.year || user?.year;

            if (program && year) {
                const studentList = await crService.getClassStudents(program, year);
                setStudents(studentList);

                // Init Map
                const initial = {};
                studentList.forEach(s => initial[s.id] = 'Present');
                setAttendanceMap(initial);
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to load class data');
        } finally {
            setLoading(false);
        }
    };

    const toggleAttendance = (id) => {
        setAttendanceMap(prev => ({
            ...prev,
            [id]: prev[id] === 'Present' ? 'Absent' : 'Present'
        }));
    };

    const submitAttendance = async () => {
        setSubmitting(true);
        try {
            // Transform map to list
            const attendanceList = students.map(s => ({
                studentId: s.id,
                name: s.name,
                status: attendanceMap[s.id]
            }));

            const result = await crService.submitAttendance(
                attendanceList,
                new Date().toISOString().split('T')[0],
                user.uid,
                "Class Attendance"
            );

            if (result.success) {
                Alert.alert('Success', result.offline ? 'Attendance Queued (Offline)' : 'Attendance Submitted');
            }
        } catch (e) {
            Alert.alert('Error', 'Failed to submit attendance');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcomeText}>CR Portal</Text>
                    <Text style={styles.subText}>{profile?.program} - Year {profile?.year}</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                </TouchableOpacity>
            </View>

            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'attendance' && styles.activeTab]}
                    onPress={() => setActiveTab('attendance')}
                >
                    <Text style={[styles.tabText, activeTab === 'attendance' && styles.activeTabText]}>Attendance</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'notices' && styles.activeTab]}
                    onPress={() => setActiveTab('notices')}
                >
                    <Text style={[styles.tabText, activeTab === 'notices' && styles.activeTabText]}>Notices</Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'attendance' ? (
                <View style={{ flex: 1 }}>
                    <View style={styles.listHeader}>
                        <Text style={styles.listTitle}>Mark Attendance</Text>
                        <TouchableOpacity
                            style={styles.submitBtn}
                            onPress={submitAttendance}
                            disabled={submitting}
                        >
                            <Text style={styles.submitBtnText}>{submitting ? 'Sending...' : 'Submit'}</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        {students.map(student => (
                            <View key={student.id} style={styles.studentCard}>
                                <View>
                                    <Text style={styles.studentName}>{student.name}</Text>
                                    <Text style={styles.studentId}>{student.registerNumber}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => toggleAttendance(student.id)}
                                    style={[
                                        styles.statusBadge,
                                        { backgroundColor: attendanceMap[student.id] === 'Present' ? '#D1FAE5' : '#FEE2E2' }
                                    ]}
                                >
                                    <Text style={{
                                        color: attendanceMap[student.id] === 'Present' ? '#059669' : '#DC2626',
                                        fontWeight: 'bold'
                                    }}>
                                        {attendanceMap[student.id]}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            ) : (
                <View style={styles.centerContent}>
                    <Text style={styles.placeholderText}>Notices Module Coming Soon</Text>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' },
    welcomeText: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
    subText: { color: '#6B7280' },
    logoutBtn: { padding: 8 },
    tabs: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 10 },
    tab: { marginRight: 20, paddingBottom: 10 },
    activeTab: { borderBottomWidth: 2, borderBottomColor: '#4F46E5' },
    tabText: { color: '#6B7280', fontWeight: '600' },
    activeTabText: { color: '#4F46E5' },
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
    listTitle: { fontSize: 18, fontWeight: 'bold' },
    submitBtn: { backgroundColor: '#4F46E5', paddingHorizontal: 20, paddingVertical: 10, rounded: 8, borderRadius: 8 },
    submitBtnText: { color: '#fff', fontWeight: 'bold' },
    scrollContent: { padding: 20, paddingTop: 0 },
    studentCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10 },
    studentName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
    studentId: { fontSize: 12, color: '#9CA3AF' },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    placeholderText: { color: '#9CA3AF' }
});

export default CRDashboard;
