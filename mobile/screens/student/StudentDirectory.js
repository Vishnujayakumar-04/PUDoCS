import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { studentService } from '../../services/studentService';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';

const { width } = Dimensions.get('window');

const StudentDirectory = () => {
    const [view, setView] = useState('landing');
    const [selectedClass, setSelectedClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, [view]);

    const loadStudents = async (program, year) => {
        setLoading(true);
        try {
            const data = await studentService.getStudentsByProgram(program, year);
            setStudents(data);
            setView('directory');
        } catch (error) {
            console.error('Error loading students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (view === 'directory') setView(selectedClass.category === 'UG' ? 'ug' : 'pg');
        else setView('landing');
    };

    const ProgramSection = ({ title, items }) => (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {items.map((item, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.listItem}
                    onPress={() => {
                        setSelectedClass(item);
                        loadStudents(item.name, item.year);
                    }}
                >
                    <View style={styles.listItemContent}>
                        <Text style={styles.listItemText}>{item.label}</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.gray400} />
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderLanding = () => (
        <Animated.View style={[styles.viewContainer, { opacity: fadeAnim }]}>
            <Text style={styles.landingTitle}>Student Directory</Text>
            <Text style={styles.landingSubtitle}>Explore your department classmates</Text>

            <TouchableOpacity style={styles.categoryCard} onPress={() => setView('ug')}>
                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.categoryGradient}>
                    <MaterialCommunityIcons name="account-group" size={40} color={colors.white} />
                    <Text style={styles.categoryText}>Undergraduate</Text>
                    <Text style={styles.categorySubtext}>B.Tech, B.Sc Computer Science</Text>
                </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.categoryCard} onPress={() => setView('pg')}>
                <LinearGradient colors={[colors.secondary, colors.primaryDark]} style={styles.categoryGradient}>
                    <MaterialCommunityIcons name="account-tie-outline" size={40} color={colors.white} />
                    <Text style={styles.categoryText}>Postgraduate</Text>
                    <Text style={styles.categorySubtext}>M.Sc, MCA, M.Tech Students</Text>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );

    const renderUGSelection = () => (
        <Animated.View style={[styles.viewContainer, { opacity: fadeAnim }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <ProgramSection
                    title="B.Tech programs"
                    items={[
                        { label: 'B.Tech – 1st Year', name: 'B.Tech', year: 1, category: 'UG' },
                        { label: 'B.Tech – 2nd Year', name: 'B.Tech', year: 2, category: 'UG' },
                        { label: 'B.Tech – 3rd Year', name: 'B.Tech', year: 3, category: 'UG' },
                        { label: 'B.Tech – 4th Year', name: 'B.Tech', year: 4, category: 'UG' },
                    ]}
                />
                <ProgramSection
                    title="B.Sc Computer Science"
                    items={[
                        { label: 'B.Sc CS – 1st Year', name: 'B.Sc CS', year: 1, category: 'UG' },
                        { label: 'B.Sc CS – 2nd Year', name: 'B.Sc CS', year: 2, category: 'UG' },
                        { label: 'B.Sc CS – 3rd Year', name: 'B.Sc CS', year: 3, category: 'UG' },
                    ]}
                />
            </ScrollView>
        </Animated.View>
    );

    const renderPGSelection = () => (
        <Animated.View style={[styles.viewContainer, { opacity: fadeAnim }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <ProgramSection
                    title="M.Sc – Master of Science"
                    items={[
                        { label: 'M.Sc Computer Science – 2nd Year', name: 'Computer Science', year: 2, category: 'PG' },
                        { label: 'M.Sc Data Science – 1st Year', name: 'Data Science', year: 1, category: 'PG' },
                    ]}
                />
                <ProgramSection
                    title="MCA – Master of Applications"
                    items={[
                        { label: 'MCA – 1st Year', name: 'MCA', year: 1, category: 'PG' },
                        { label: 'MCA – 2nd Year', name: 'MCA', year: 2, category: 'PG' },
                    ]}
                />
                <ProgramSection
                    title="M.Tech – Master of Technology"
                    items={[
                        { label: 'M.Tech Data Analytics – 1st Year', name: 'M.Tech DA', year: 1, category: 'PG' },
                        { label: 'M.Tech NIS – 2nd Year', name: 'M.Tech NIS', year: 2, category: 'PG' },
                        { label: 'M.Tech CSE – 1st Year', name: 'M.Tech CSE', year: 1, category: 'PG' },
                        { label: 'M.Tech CSE – 2nd Year', name: 'M.Tech CSE', year: 2, category: 'PG' },
                    ]}
                />
            </ScrollView>
        </Animated.View>
    );

    const renderDirectory = () => (
        <Animated.View style={[styles.directoryContainer, { opacity: fadeAnim }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {students.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="account-search-outline" size={60} color={colors.gray300} />
                        <Text style={styles.emptyText}>No students found in this class</Text>
                    </View>
                ) : (
                    students.map((student, index) => (
                        <Card key={index} style={styles.studentCard}>
                            <View style={styles.studentInfo}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>
                                        {student.name?.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.details}>
                                    <Text style={styles.studentName}>{student.name}</Text>
                                    <Text style={styles.regNo}>{student.registerNumber}</Text>
                                </View>
                            </View>
                            <View style={styles.contactActions}>
                                <TouchableOpacity
                                    style={styles.contactBtn}
                                    onPress={() => Linking.openURL(`mailto:${student.email}`)}
                                >
                                    <MaterialCommunityIcons name="email-outline" size={20} color={colors.primary} />
                                </TouchableOpacity>
                                {student.phone && (
                                    <TouchableOpacity
                                        style={styles.contactBtn}
                                        onPress={() => Linking.openURL(`tel:${student.phone}`)}
                                    >
                                        <MaterialCommunityIcons name="phone-outline" size={20} color={colors.primary} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </Card>
                    ))
                )}
            </ScrollView>
        </Animated.View>
    );

    if (loading) return <LoadingSpinner />;

    return (
        <View style={styles.container}>
            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.header}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        {view !== 'landing' && (
                            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                                <MaterialCommunityIcons name="arrow-left" size={24} color={colors.white} />
                            </TouchableOpacity>
                        )}
                        <View style={styles.titleContainer}>
                            <Text style={styles.headerTitle}>
                                {view === 'landing' ? 'Students' :
                                    view === 'ug' ? 'UG Directory' :
                                        view === 'pg' ? 'PG Directory' :
                                            selectedClass?.label}
                            </Text>
                        </View>
                        <View style={styles.headerRight} />
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <View style={styles.content}>
                {view === 'landing' && renderLanding()}
                {view === 'ug' && renderUGSelection()}
                {view === 'pg' && renderPGSelection()}
                {view === 'directory' && renderDirectory()}
            </View>
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    titleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.white,
    },
    headerRight: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    viewContainer: {
        flex: 1,
        padding: 20,
    },
    landingTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    landingSubtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: 30,
    },
    categoryCard: {
        width: '100%',
        height: 150,
        borderRadius: 20,
        marginBottom: 20,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    categoryGradient: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.white,
        marginTop: 10,
    },
    categorySubtext: {
        fontSize: 14,
        color: colors.white,
        opacity: 0.8,
        marginTop: 4,
    },
    sectionContainer: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    listItem: {
        backgroundColor: colors.white,
        borderRadius: 12,
        marginBottom: 10,
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    listItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    listItemText: {
        fontSize: 16,
        color: colors.textPrimary,
        fontWeight: '500',
    },
    directoryContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    studentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderRadius: 15,
        marginBottom: 12,
    },
    studentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.gray100,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
    },
    details: {
        flex: 1,
    },
    studentName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    regNo: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    contactActions: {
        flexDirection: 'row',
    },
    contactBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.gray50,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
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

export default StudentDirectory;
