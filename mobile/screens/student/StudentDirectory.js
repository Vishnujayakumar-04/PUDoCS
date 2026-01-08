import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { studentService } from '../../services/studentService';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';
import { isSmallScreen } from '../../utils/responsive';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const StudentDirectory = () => {
    const navigation = useNavigation();
    const [view, setView] = useState('landing');
    const [selectedClass, setSelectedClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [classTimetable, setClassTimetable] = useState(null);
    const [loadingTimetable, setLoadingTimetable] = useState(false);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, [view]);

    const loadClassTimetable = async (program, year) => {
        setLoadingTimetable(true);
        try {
            // Map program name to match timetable format
            let mappedProgram = program;
            if (program === 'B.Tech') {
                mappedProgram = 'B.Tech';
            } else if (program === 'B.Sc CS') {
                mappedProgram = 'B.Sc CS';
            } else if (program === 'M.Sc CS') {
                mappedProgram = 'M.Sc CS';
            } else if (program === 'M.Sc Data Analytics') {
                mappedProgram = 'M.Sc Data Analytics';
            } else if (program === 'M.Sc CS Integrated') {
                mappedProgram = 'M.Sc CS Integrated';
            } else if (program === 'M.Tech DS' || program === 'M.Tech Data Analytics') {
                mappedProgram = 'M.Tech DS';
            } else if (program === 'M.Tech CSE') {
                mappedProgram = 'M.Tech CSE';
            } else if (program === 'M.Tech NIS') {
                mappedProgram = 'M.Tech NIS';
            } else if (program === 'MCA') {
                mappedProgram = 'MCA';
            }
            
            const timetableData = await studentService.getTimetable(mappedProgram, year, true);
            setClassTimetable(timetableData);
        } catch (error) {
            console.error('Error loading class timetable:', error);
            setClassTimetable(null);
        } finally {
            setLoadingTimetable(false);
        }
    };

    const loadStudents = async (program, year) => {
        setLoading(true);
        setStudents([]); // Clear previous students
        setClassTimetable(null); // Clear previous timetable
        try {
            console.log('=== Loading Students ===');
            console.log('Program:', program);
            console.log('Year:', year, '(type:', typeof year, ')');
            
            // Map program names to database format
            let mappedProgram = program;
            if (program === 'M.Tech DS') {
                mappedProgram = 'M.Tech Data Analytics';
            } else if (program === 'M.Tech NIS') {
                mappedProgram = 'M.Tech NIS';
            } else if (program === 'M.Sc DS') {
                mappedProgram = 'M.Sc Data Analytics';
            }
            
            const data = await studentService.getStudentsByProgram(mappedProgram, year);
            
            console.log('=== Results ===');
            console.log('Received students data:', data?.length || 0, 'students');
            
            if (data && data.length > 0) {
                console.log('First student sample:', JSON.stringify(data[0], null, 2));
            }
            
            setStudents(data || []);
            setView('directory');
            
            // Load timetable for this class
            loadClassTimetable(program, year);
            
            if (!data || data.length === 0) {
                console.warn('⚠️ No students found. Possible reasons:');
                console.warn('1. Students not added to Firestore yet');
                console.warn('2. Program/year values don\'t match');
                console.warn('3. Firestore index not created');
                console.warn('Check console logs above for details.');
            }
        } catch (error) {
            console.error('=== Error Loading Students ===');
            console.error('Error:', error);
            console.error('Error message:', error.message);
            console.error('Error code:', error.code);
            Alert.alert('Error', `Failed to load students: ${error.message || 'Unknown error'}`);
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

    // Classroom Allocation Data
    const ugClassroomAllocation = [
        { courseName: 'I BTECH (CSE)', roomNumber: '103', location: 'Ground Floor (CS Annexe)' },
        { courseName: 'II BTECH (CSE)', roomNumber: '203', location: 'First Floor (CS Annexe)' },
        { courseName: 'I BSC (Computer Science)', roomNumber: 'SH 220', location: 'First Floor (West)' },
        { courseName: 'II BSC (Computer Science)', roomNumber: '204', location: 'First Floor (CS Annexe)' },
        { courseName: 'III BSC (Computer Science)', roomNumber: '205', location: 'First Floor (CS Annexe)' },
    ];

    const pgClassroomAllocation = [
        { courseName: 'I MSC (Data Analytics)', roomNumber: 'SH 314', location: 'Second Floor (North)' },
        { courseName: 'I MCA', roomNumber: 'SH 367', location: 'Second Floor (South)' },
        { courseName: 'I MSC Int (Computer Science)', roomNumber: 'SH 308', location: 'Second Floor (East)' },
        { courseName: 'I MTECH (Data Science)', roomNumber: 'SH 310', location: 'Second Floor (East)' },
        { courseName: 'I MTECH (Computer Science)', roomNumber: 'SH 221', location: 'First Floor (West)' },
        { courseName: 'II MSC (Computer Science)', roomNumber: 'SH 321', location: 'Second Floor (West)' },
        { courseName: 'II MCA', roomNumber: 'SH 346', location: 'Second Floor (East)' },
    ];

    const ClassroomAllocationTable = ({ data, title }) => (
        <View style={styles.classroomSection}>
            <View style={styles.classroomHeader}>
                <MaterialCommunityIcons name="map-marker" size={20} color={colors.primary} />
                <Text style={styles.classroomTitle}>{title}</Text>
            </View>
            <Card style={styles.classroomTableCard}>
                <View style={styles.classroomTableHeader}>
                    <Text style={[styles.classroomTableHeaderText, styles.classroomCourseCol]}>Course Name</Text>
                    <Text style={[styles.classroomTableHeaderText, styles.classroomRoomCol]}>Room</Text>
                    <Text style={[styles.classroomTableHeaderText, styles.classroomLocationCol]}>Location</Text>
                </View>
                {data.map((item, index) => (
                    <View key={index} style={[styles.classroomTableRow, index % 2 === 1 && styles.classroomTableRowEven]}>
                        <Text style={[styles.classroomTableCell, styles.classroomCourseCol]}>{item.courseName}</Text>
                        <Text style={[styles.classroomTableCell, styles.classroomRoomCol]}>{item.roomNumber}</Text>
                        <Text style={[styles.classroomTableCell, styles.classroomLocationCol]}>{item.location}</Text>
                    </View>
                ))}
            </Card>
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
            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.selectionScrollContent}
            >
                <ClassroomAllocationTable 
                    data={ugClassroomAllocation} 
                    title="Classroom Allocation - Even Semester (2025 - 2026)"
                />
                <ProgramSection
                    title="B.Tech CSE programs"
                    items={[
                        { label: 'B.Tech CSE – 1st Year', name: 'B.Tech', year: 1, category: 'UG' },
                        { label: 'B.Tech CSE – 2nd Year', name: 'B.Tech', year: 2, category: 'UG' },
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
            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.selectionScrollContent}
            >
                <ClassroomAllocationTable 
                    data={pgClassroomAllocation} 
                    title="Classroom Allocation - Even Semester (2025 - 2026)"
                />
                <ProgramSection
                    title="M.Sc – Master of Science"
                    items={[
                        { 
                            label: 'M.Sc Computer Science – 2nd Year', 
                            name: 'M.Sc CS', 
                            year: 2, 
                            category: 'PG',
                            classRepBoy: 'Not assigned',
                            classRepGirl: 'Not assigned',
                            staffCoordinator: 'Not assigned',
                            courseCoordinator: 'M.Sc Programmes'
                        },
                        { 
                            label: 'M.Sc Data Analytics – 1st Year', 
                            name: 'M.Sc Data Analytics', 
                            year: 1, 
                            category: 'PG',
                            classRepBoy: 'Not assigned',
                            classRepGirl: 'Not assigned',
                            staffCoordinator: 'Not assigned',
                            courseCoordinator: 'M.Sc Data Analytics'
                        },
                        { 
                            label: 'M.Sc CS Integrated – 1st Year', 
                            name: 'M.Sc CS Integrated', 
                            year: 1, 
                            category: 'PG',
                            classRepBoy: 'Not assigned',
                            classRepGirl: 'Not assigned',
                            staffCoordinator: 'Not assigned',
                            courseCoordinator: 'M.Sc Programmes'
                        },
                    ]}
                />
                <ProgramSection
                    title="MCA – Master of Applications"
                    items={[
                        { 
                            label: 'MCA – 1st Year', 
                            name: 'MCA', 
                            year: 1, 
                            category: 'PG',
                            classRepBoy: 'Not assigned',
                            classRepGirl: 'Not assigned',
                            staffCoordinator: 'Not assigned',
                            courseCoordinator: 'MCA Programme'
                        },
                        { 
                            label: 'MCA – 2nd Year', 
                            name: 'MCA', 
                            year: 2, 
                            category: 'PG',
                            classRepBoy: 'Not assigned',
                            classRepGirl: 'Not assigned',
                            staffCoordinator: 'Not assigned',
                            courseCoordinator: 'MCA Programme'
                        },
                    ]}
                />
                <ProgramSection
                    title="M.Tech – Master of Technology"
                    items={[
                        { 
                            label: 'M.Tech Data Science – 1st Year', 
                            name: 'M.Tech Data Analytics', 
                            year: 1, 
                            category: 'PG',
                            classRepBoy: 'Not assigned',
                            classRepGirl: 'Not assigned',
                            staffCoordinator: 'Not assigned',
                            courseCoordinator: 'M.Tech Data Analytics'
                        },
                        { 
                            label: 'M.Tech CSE – 1st Year', 
                            name: 'M.Tech CSE', 
                            year: 1, 
                            category: 'PG',
                            classRepBoy: 'Not assigned',
                            classRepGirl: 'Not assigned',
                            staffCoordinator: 'Not assigned',
                            courseCoordinator: 'M.Tech CSE'
                        },
                        { 
                            label: 'M.Tech CSE – 2nd Year', 
                            name: 'M.Tech CSE', 
                            year: 2, 
                            category: 'PG',
                            classRepBoy: 'Not assigned',
                            classRepGirl: 'Not assigned',
                            staffCoordinator: 'Not assigned',
                            courseCoordinator: 'M.Tech CSE'
                        },
                        { 
                            label: 'M.Tech NIS – 2nd Year', 
                            name: 'M.Tech NIS', 
                            year: 2, 
                            category: 'PG',
                            classRepBoy: 'Not assigned',
                            classRepGirl: 'Not assigned',
                            staffCoordinator: 'Not assigned',
                            courseCoordinator: 'M.Tech NIS'
                        },
                    ]}
                />
            </ScrollView>
        </Animated.View>
    );

    const renderDirectory = () => (
        <Animated.View style={[styles.directoryContainer, { opacity: fadeAnim }]}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
            >
                {loading ? (
                    <View style={styles.emptyState}>
                        <LoadingSpinner />
                        <Text style={styles.emptyText}>Loading students...</Text>
                    </View>
                ) : students.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="account-search-outline" size={60} color={colors.gray300} />
                        <Text style={styles.emptyText}>No students found</Text>
                        <Text style={styles.emptySubtext}>
                            {selectedClass ? `${selectedClass.label}` : 'in this class'}
                        </Text>
                        {selectedClass && (
                            <Text style={styles.debugInfo}>
                                Searching: Program = "{selectedClass.name}", Year = {selectedClass.year}
                            </Text>
                        )}
                        <Text style={styles.emptyHint}>
                            Students may not be added to Firestore yet.{'\n'}
                            Check console logs for detailed debugging information.
                        </Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.studentCount}>
                            <Text style={styles.studentCountText}>
                                {students.length} {students.length === 1 ? 'Student' : 'Students'}
                            </Text>
                        </View>
                        
                        {/* Table Format */}
                        <Card style={styles.tableCard}>
                            {/* Table Header */}
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderText, styles.snoColumn]}>S. No</Text>
                                <Text style={[styles.tableHeaderText, styles.regnoColumn]}>Reg No</Text>
                                <Text style={[styles.tableHeaderText, styles.nameColumn]}>Name</Text>
                            </View>
                            
                            {/* Table Rows */}
                            {students.map((student, index) => {
                                return (
                                    <TouchableOpacity
                                        key={student.id || student.registerNumber || `student-${index}`}
                                        style={[
                                            styles.tableRow,
                                            index % 2 === 0 && styles.tableRowEven
                                        ]}
                                        onPress={() => navigation.navigate('StudentDetail', {
                                            studentId: student.id,
                                            studentRegisterNumber: student.registerNumber || student.RegisterNumber
                                        })}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.tableCell, styles.snoColumn]}>
                                            {index + 1}
                                        </Text>
                                        <Text style={[styles.tableCell, styles.regnoColumn]}>
                                            {student.registerNumber || student.RegisterNumber || 'N/A'}
                                        </Text>
                                        <Text style={[styles.tableCell, styles.nameColumn]} numberOfLines={1}>
                                            {student.name || student.Name || 'Unknown'}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </Card>

                        {/* Class Timetable Section */}
                        {selectedClass && (
                            <View style={styles.timetableSection}>
                                <View style={styles.timetableHeader}>
                                    <MaterialCommunityIcons name="calendar-clock" size={20} color={colors.primary} />
                                    <Text style={styles.timetableTitle}>Class Timetable</Text>
                                </View>
                                {loadingTimetable ? (
                                    <Card style={styles.timetableCard}>
                                        <LoadingSpinner />
                                    </Card>
                                ) : classTimetable && classTimetable.schedule && classTimetable.schedule.length > 0 ? (
                                    <Card style={styles.timetableCard}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                // Map program name for navigation
                                                let mappedProgram = selectedClass.name;
                                                if (selectedClass.name === 'B.Tech') {
                                                    mappedProgram = 'B.Tech';
                                                } else if (selectedClass.name === 'B.Sc CS') {
                                                    mappedProgram = 'B.Sc CS';
                                                } else if (selectedClass.name === 'M.Sc CS') {
                                                    mappedProgram = 'M.Sc CS';
                                                } else if (selectedClass.name === 'M.Sc Data Analytics') {
                                                    mappedProgram = 'M.Sc Data Analytics';
                                                } else if (selectedClass.name === 'M.Sc CS Integrated') {
                                                    mappedProgram = 'M.Sc CS Integrated';
                                                } else if (selectedClass.name === 'M.Tech CSE') {
                                                    mappedProgram = 'M.Tech CSE';
                                                } else if (selectedClass.name === 'M.Tech NIS') {
                                                    mappedProgram = 'M.Tech NIS';
                                                } else if (selectedClass.name === 'M.Tech DS' || selectedClass.name === 'M.Tech Data Analytics') {
                                                    mappedProgram = 'M.Tech DS';
                                                } else if (selectedClass.name === 'M.Tech CSE') {
                                                    mappedProgram = 'M.Tech CSE';
                                                } else if (selectedClass.name === 'MCA') {
                                                    mappedProgram = 'MCA';
                                                }
                                                
                                                navigation.navigate('Timetable', {
                                                    program: mappedProgram,
                                                    year: selectedClass.year,
                                                    autoLoad: true
                                                });
                                            }}
                                            style={styles.timetableCardContent}
                                        >
                                            <View style={styles.timetableInfo}>
                                                <Text style={styles.timetableText}>
                                                    View {selectedClass.label} Timetable
                                                </Text>
                                                <Text style={styles.timetableSubtext}>
                                                    Tap to view full schedule
                                                </Text>
                                            </View>
                                            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.primary} />
                                        </TouchableOpacity>
                                    </Card>
                                ) : (
                                    <Card style={styles.timetableCard}>
                                        <View style={styles.timetableCardContent}>
                                            <Text style={styles.timetableEmptyText}>
                                                No timetable available for {selectedClass.label}
                                            </Text>
                                        </View>
                                    </Card>
                                )}
                            </View>
                        )}
                    </>
                )}

                {/* Class Representatives and Coordinators - Always show when students are loaded */}
                {selectedClass && students.length > 0 && (
                    <View style={styles.representativesSection}>
                        <Card style={styles.representativesCard}>
                            <View style={styles.representativeRow}>
                                <Text style={styles.representativeLabel}>Class Reps (Boy):</Text>
                                <Text style={styles.representativeValue}>
                                    {selectedClass.classRepBoy || 'Not assigned'}
                                </Text>
                            </View>
                            <View style={styles.representativeRow}>
                                <Text style={styles.representativeLabel}>Class Reps (Girl):</Text>
                                <Text style={styles.representativeValue}>
                                    {selectedClass.classRepGirl || 'Not assigned'}
                                </Text>
                            </View>
                            <View style={styles.representativeRow}>
                                <Text style={styles.representativeLabel}>Staff Coordinator:</Text>
                                <Text style={styles.representativeValue}>
                                    {selectedClass.staffCoordinator || 'Not assigned'}
                                </Text>
                            </View>
                            <View style={[styles.representativeRow, { borderBottomWidth: 0 }]}>
                                <Text style={styles.representativeLabel}>Course Coordinator:</Text>
                                <Text style={styles.representativeValue}>
                                    {selectedClass.courseCoordinator || 'Not assigned'}
                                </Text>
                            </View>
                        </Card>
                    </View>
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
    selectionScrollContent: {
        paddingBottom: 120, // Extra padding to ensure content doesn't hide behind navigation bar
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
        padding: isSmallScreen() ? 16 : 20, // Less padding on small screens
        paddingBottom: 120, // Extra padding to ensure class reps section and tab bar don't overlap
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
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textSecondary,
        marginTop: 15,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.textLight,
        marginTop: 8,
        textAlign: 'center',
    },
    emptyHint: {
        fontSize: 12,
        color: colors.textLight,
        marginTop: 12,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    debugInfo: {
        fontSize: 11,
        color: colors.primary,
        marginTop: 8,
        textAlign: 'center',
        fontFamily: 'monospace',
        backgroundColor: colors.gray50,
        padding: 8,
        borderRadius: 6,
        marginHorizontal: 20,
    },
    studentCount: {
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    studentCountText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    representativesSection: {
        marginTop: 24,
        marginBottom: 12,
    },
    representativesTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 12,
    },
    representativesCard: {
        padding: 16,
    },
    representativeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    representativeLabel: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
        flex: 1,
    },
    representativeValue: {
        fontSize: 14,
        color: colors.textPrimary,
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
    },
    // Timetable Styles
    timetableSection: {
        marginTop: 20,
        marginBottom: 10,
    },
    timetableHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    timetableTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    timetableCard: {
        padding: 16,
    },
    timetableCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    timetableInfo: {
        flex: 1,
    },
    timetableText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    timetableSubtext: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    timetableEmptyText: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    // Table Styles
    tableCard: {
        padding: 0,
        overflow: 'hidden',
        marginTop: 16,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        paddingVertical: isSmallScreen() ? 10 : 12,
        paddingHorizontal: isSmallScreen() ? 8 : 12,
        borderBottomWidth: 2,
        borderBottomColor: colors.primaryDark,
    },
    tableHeaderText: {
        fontSize: isSmallScreen() ? 11 : 12, // Smaller font for better fit on small screens
        fontWeight: '700',
        color: colors.white,
        textTransform: 'uppercase',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: isSmallScreen() ? 10 : 12,
        paddingHorizontal: isSmallScreen() ? 8 : 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
        minHeight: isSmallScreen() ? 40 : 44,
    },
    tableRowEven: {
        backgroundColor: colors.gray50,
    },
    tableCell: {
        fontSize: 12, // Smaller font for better fit on small screens
        color: colors.textPrimary,
        paddingVertical: 4,
    },
    snoColumn: {
        width: 50, // Smaller width for small screens
        minWidth: 40,
        textAlign: 'center',
    },
    regnoColumn: {
        flex: 1.2,
        paddingHorizontal: 4, // Less padding on small screens
        minWidth: 80,
    },
    nameColumn: {
        flex: 2,
        paddingHorizontal: 4, // Less padding on small screens
        minWidth: 100,
    },
    // Classroom Allocation Table Styles
    classroomSection: {
        marginBottom: 25,
        marginTop: 10,
    },
    classroomHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        marginLeft: 4,
    },
    classroomTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginLeft: 8,
    },
    classroomTableCard: {
        padding: 0,
        overflow: 'hidden',
        borderRadius: 12,
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    classroomTableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: 2,
        borderBottomColor: colors.primaryDark,
    },
    classroomTableHeaderText: {
        fontSize: isSmallScreen() ? 10 : 11,
        fontWeight: '700',
        color: colors.white,
        textTransform: 'uppercase',
    },
    classroomTableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
        minHeight: 44,
    },
    classroomTableRowEven: {
        backgroundColor: colors.gray50,
    },
    classroomTableCell: {
        fontSize: isSmallScreen() ? 11 : 12,
        color: colors.textPrimary,
        paddingVertical: 4,
    },
    classroomCourseCol: {
        flex: 2.5,
        paddingRight: 8,
    },
    classroomRoomCol: {
        flex: 1,
        paddingHorizontal: 4,
        textAlign: 'center',
    },
    classroomLocationCol: {
        flex: 2,
        paddingLeft: 8,
    },
});

export default StudentDirectory;
