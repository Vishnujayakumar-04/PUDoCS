import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';
import { studentService } from '../../services/studentService';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';

const { width } = Dimensions.get('window');

const StudentTimetable = () => {
    // Navigation State: 'landing' | 'ug' | 'pg' | 'viewer'
    const [view, setView] = useState('landing');
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [timetable, setTimetable] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedDay, setSelectedDay] = useState('Monday');
    const [availableDays, setAvailableDays] = useState([]);
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, [view]);

    // Update available days when timetable loads
    useEffect(() => {
        if (timetable?.schedule) {
            const scheduledDays = timetable.schedule
                .filter(day => day.slots && day.slots.length > 0)
                .map(day => day.day);

            setAvailableDays(scheduledDays);

            // Default to first available day if current selection is invalid
            if (scheduledDays.length > 0 && !scheduledDays.includes(selectedDay)) {
                setSelectedDay(scheduledDays[0]);
            }
        }
    }, [timetable]);

    // Check if timetable exists in Firestore or show empty state
    const hasTimetable = async (program, year) => {
        try {
            const timetableData = await studentService.getTimetable(program, year);
            return timetableData && timetableData.schedule && timetableData.schedule.length > 0;
        } catch (error) {
            console.error('Error checking timetable:', error);
            return false;
        }
    };

    const loadTimetable = async (program, year) => {
        setLoading(true);
        try {
            // Try to fetch timetable from Firestore
            const timetableData = await studentService.getTimetable(program, year);
            
            if (timetableData && timetableData.schedule && timetableData.schedule.length > 0) {
                // Has schedule data - show schedule viewer
                setTimetable({ ...timetableData, program, year });
                setView('viewer');
            } else {
                // No timetable data - show empty state
                setTimetable({ type: 'empty', program, year });
                setView('viewer');
            }
        } catch (error) {
            console.error('Error loading timetable:', error);
            // On error, show empty state
            setTimetable({ type: 'empty', program, year });
            setView('viewer');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (view === 'viewer') setView(selectedProgram.category === 'UG' ? 'ug' : 'pg');
        else setView('landing');
    };

    const mergeConsecutiveSlots = (slots) => {
        if (!slots || slots.length === 0) return [];

        const merged = [];
        let current = { ...slots[0], periods: 1 };

        for (let i = 1; i < slots.length; i++) {
            const next = slots[i];
            if (next.subject === current.subject &&
                next.faculty?.name === current.faculty?.name &&
                next.room === current.room) {
                current.endTime = next.endTime;
                current.periods += 1;
            } else {
                merged.push(current);
                current = { ...next, periods: 1 };
            }
        }
        merged.push(current);
        return merged;
    };

    const ProgramSection = ({ title, items }) => (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {items.map((item, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.listItem}
                    onPress={() => {
                        setSelectedProgram(item);
                        loadTimetable(item.name, item.year);
                    }}
                    activeOpacity={0.7}
                >
                    <View style={styles.listItemContent}>
                        <Text style={styles.listItemText}>{item.label}</Text>
                        <MaterialCommunityIcons name="chevron-right" size={24} color={colors.gray400} />
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderLanding = () => (
        <Animated.View style={[styles.viewContainer, { opacity: fadeAnim }]}>
            <View style={styles.landingHeader}>
                <Text style={styles.landingTitle}>Select Category</Text>
                <Text style={styles.landingSubtitle}>Choose your educational level</Text>
            </View>

            <View style={styles.categoryContainer}>
                <TouchableOpacity 
                    style={styles.categoryCard} 
                    onPress={() => setView('ug')}
                    activeOpacity={0.9}
                >
                    <LinearGradient 
                        colors={[colors.primary, colors.secondary]} 
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.categoryGradient}
                    >
                        <MaterialCommunityIcons name="school" size={48} color={colors.white} />
                        <Text style={styles.categoryText}>Undergraduate</Text>
                        <Text style={styles.categorySubtext}>UG Programs (B.Tech, B.Sc)</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.categoryCard} 
                    onPress={() => setView('pg')}
                    activeOpacity={0.9}
                >
                    <LinearGradient 
                        colors={[colors.secondary, colors.primaryDark]} 
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.categoryGradient}
                    >
                        <MaterialCommunityIcons name="certificate" size={48} color={colors.white} />
                        <Text style={styles.categoryText}>Postgraduate</Text>
                        <Text style={styles.categorySubtext}>PG Programs (M.Sc, MCA, M.Tech)</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
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
                        { label: 'M.Sc Computer Science – 1st Year', name: 'M.Sc CS', year: 1, category: 'PG' },
                        { label: 'M.Sc Computer Science – 2nd Year', name: 'M.Sc CS', year: 2, category: 'PG' },
                        { label: 'M.Sc CS Integrated – 5th Year', name: 'M.Sc CS Integrated', year: 5, category: 'PG' },
                        { label: 'M.Sc CS Integrated – 6th Year', name: 'M.Sc CS Integrated', year: 6, category: 'PG' },
                    ]}
                />
                <ProgramSection
                    title="M.Sc Data Science"
                    items={[
                        { label: 'M.Sc Data Science – 1st Year', name: 'M.Sc DS', year: 1, category: 'PG' },
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
                        { label: 'M.Tech Data Science & AI – 1st Year', name: 'M.Tech DS', year: 1, category: 'PG' },
                        { label: 'M.Tech NIS – 2nd Year', name: 'M.Tech NIS', year: 2, category: 'PG' },
                        { label: 'M.Tech CSE – 1st Year', name: 'M.Tech CSE', year: 1, category: 'PG' },
                        { label: 'M.Tech CSE – 2nd Year', name: 'M.Tech CSE', year: 2, category: 'PG' },
                    ]}
                />
            </ScrollView>
        </Animated.View>
    );

    const renderViewer = () => {
        // If timetable is PDF type, show PDF viewer
        if (timetable?.type === 'pdf') {
            return renderPDFViewer();
        }
        
        // If timetable is empty, show empty state
        if (timetable?.type === 'empty') {
            return renderEmptyTimetable();
        }

        // Legacy schedule-based viewer (if timetable has schedule data)
        const getDaySchedule = () => {
            const rawSlots = timetable?.schedule?.find(s => s.day === selectedDay)?.slots || [];
            return mergeConsecutiveSlots(rawSlots);
        };

        const getTypeColor = (type) => {
            switch (type) {
                case 'Lecture': return colors.primary;
                case 'Lab': return colors.secondary;
                case 'Tutorial': return colors.accent;
                default: return colors.gray500;
            }
        };

        return (
            <Animated.View style={[styles.viewerContainer, { opacity: fadeAnim }]}>
                <View style={styles.daySelector}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayScroll}>
                        {availableDays.map(day => (
                            <TouchableOpacity
                                key={day}
                                onPress={() => setSelectedDay(day)}
                                style={[styles.dayTab, selectedDay === day && styles.dayTabActive]}
                            >
                                <Text style={[styles.dayTabText, selectedDay === day && styles.dayTabTextActive]}>
                                    {day.substring(0, 3)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.summaryRow}>
                    <View style={styles.summaryChip}>
                        <MaterialCommunityIcons name="clock-check-outline" size={16} color={colors.primary} />
                        <Text style={styles.summaryChipText}>
                            Total: {getDaySchedule().reduce((acc, slot) => acc + slot.periods, 0)} Periods
                        </Text>
                    </View>
                </View>

                <ScrollView style={styles.contentScroll} contentContainerStyle={styles.contentScrollInner}>
                    {getDaySchedule().length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="calendar-blank" size={60} color={colors.gray300} />
                            <Text style={styles.emptyText}>No classes scheduled for {selectedDay}</Text>
                        </View>
                    ) : (
                        getDaySchedule().map((slot, index) => (
                            <Card key={index} style={styles.slotCard}>
                                <View style={styles.slotLeft}>
                                    <View style={styles.timeBox}>
                                        <Text style={styles.timeText}>{slot.startTime}</Text>
                                        <View style={styles.timeLine} />
                                        <Text style={styles.timeText}>{slot.endTime}</Text>
                                    </View>
                                </View>
                                <View style={styles.slotRight}>
                                    <View style={styles.slotHeader}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.subjectText}>{slot.subject}</Text>
                                            {slot.periods > 1 && (
                                                <View style={styles.periodBadge}>
                                                    <Text style={styles.periodText}>{slot.periods} Periods</Text>
                                                </View>
                                            )}
                                        </View>
                                        <View style={[styles.typeBadge, { backgroundColor: getTypeColor(slot.type) }]}>
                                            <Text style={styles.typeBadgeText}>{slot.type}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.facultyText}>
                                        <MaterialCommunityIcons name="account-tie" size={14} /> {slot.faculty?.name || 'TBA'}
                                    </Text>
                                    {slot.room && (
                                        <Text style={styles.roomText}>
                                            <MaterialCommunityIcons name="map-marker" size={14} /> Room: {slot.room}
                                        </Text>
                                    )}
                                </View>
                            </Card>
                        ))
                    )}
                </ScrollView>
            </Animated.View>
        );
    };

    const renderPDFViewer = () => {
        const handleViewPDF = async () => {
            try {
                const [pdfAsset] = await Asset.loadAsync(require('../../assets/Timetable/even_sem TT.pdf'));
                const pdfUri = pdfAsset.localUri || pdfAsset.uri;
                
                // Try to open with system viewer
                const canOpen = await Linking.canOpenURL(pdfUri);
                if (canOpen) {
                    await Linking.openURL(pdfUri);
                } else {
                    // Fallback: Try sharing
                    const isAvailable = await Sharing.isAvailableAsync();
                    if (isAvailable) {
                        await Sharing.shareAsync(pdfUri);
                    }
                }
            } catch (error) {
                console.error('Error opening PDF:', error);
            }
        };

        const handleSharePDF = async () => {
            try {
                const [pdfAsset] = await Asset.loadAsync(require('../../assets/Timetable/even_sem TT.pdf'));
                const pdfUri = pdfAsset.localUri || pdfAsset.uri;
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(pdfUri);
                }
            } catch (error) {
                console.error('Error sharing PDF:', error);
            }
        };

        return (
            <Animated.View style={[styles.viewerContainer, { opacity: fadeAnim }]}>
                <View style={styles.pdfViewerContainer}>
                    <MaterialCommunityIcons name="file-pdf-box" size={80} color={colors.primary} />
                    <Text style={styles.pdfTitle}>Even Semester Timetable</Text>
                    <Text style={styles.pdfSubtitle}>{selectedProgram?.label}</Text>
                    <Text style={styles.pdfDescription}>
                        The timetable PDF is available for viewing. Tap the button below to open it.
                    </Text>
                    <TouchableOpacity 
                        style={styles.pdfButton} 
                        onPress={handleViewPDF}
                        activeOpacity={0.8}
                    >
                        <MaterialCommunityIcons name="eye" size={20} color={colors.white} />
                        <Text style={styles.pdfButtonText}>View Timetable PDF</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.pdfButton, styles.pdfButtonSecondary]} 
                        onPress={handleSharePDF}
                        activeOpacity={0.8}
                    >
                        <MaterialCommunityIcons name="share-variant" size={20} color={colors.primary} />
                        <Text style={[styles.pdfButtonText, { color: colors.primary }]}>Share PDF</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        );
    };

    const renderEmptyTimetable = () => {
        const programLabel = selectedProgram?.label || timetable?.program || 'this class';
        return (
            <Animated.View style={[styles.viewerContainer, { opacity: fadeAnim }]}>
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="calendar-remove" size={80} color={colors.gray300} />
                    <Text style={styles.emptyTitle}>No Timetable Available</Text>
                    <Text style={styles.emptySubtext}>
                        Timetable for {programLabel} is not available at the moment.
                    </Text>
                    <Text style={styles.emptyNote}>
                        Please check back later or contact the department office.
                    </Text>
                </View>
            </Animated.View>
        );
    };

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
                                {view === 'landing' ? 'Timetable' :
                                    view === 'ug' ? 'Undergraduate' :
                                        view === 'pg' ? 'Postgraduate' :
                                            selectedProgram?.label}
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
                {view === 'viewer' && renderViewer()}
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
    landingHeader: {
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 16,
    },
    landingTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    landingSubtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        fontWeight: '400',
    },
    categoryContainer: {
        marginTop: 8,
        gap: 16,
    },
    categoryCard: {
        width: '100%',
        height: 160,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
    },
    categoryGradient: {
        flex: 1,
        padding: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryText: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.white,
        marginTop: 12,
        letterSpacing: 0.5,
    },
    categorySubtext: {
        fontSize: 14,
        color: colors.white,
        opacity: 0.9,
        marginTop: 6,
        fontWeight: '400',
    },
    sectionContainer: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 16,
        marginTop: 8,
        letterSpacing: -0.3,
    },
    listItem: {
        backgroundColor: colors.white,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.gray100,
    },
    listItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 18,
    },
    listItemText: {
        fontSize: 16,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    viewerContainer: {
        flex: 1,
    },
    daySelector: {
        backgroundColor: colors.white,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
        zIndex: 10,
    },
    dayScroll: {
        paddingHorizontal: 20,
    },
    dayTab: {
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 24,
        marginRight: 12,
        backgroundColor: colors.gray50,
    },
    dayTabActive: {
        backgroundColor: colors.primary,
    },
    dayTabText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    dayTabTextActive: {
        color: colors.white,
    },
    contentScroll: {
        flex: 1,
    },
    contentScrollInner: {
        padding: 20,
    },
    slotCard: {
        flexDirection: 'row',
        padding: 0,
        marginBottom: 16,
        overflow: 'hidden',
        borderRadius: 16,
        backgroundColor: colors.white,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.gray100,
    },
    slotLeft: {
        width: 100,
        backgroundColor: colors.gray50,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeBox: {
        alignItems: 'center',
    },
    timeText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.primary,
    },
    timeLine: {
        width: 2,
        height: 25,
        backgroundColor: colors.gray200,
        marginVertical: 4,
    },
    slotRight: {
        flex: 1,
        padding: 15,
    },
    slotHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    subjectText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginRight: 10,
    },
    periodBadge: {
        marginTop: 4,
        backgroundColor: colors.primaryLight + '20',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    periodText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.primary,
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    typeBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.white,
    },
    facultyText: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    roomText: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: '500',
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
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginTop: 20,
        marginBottom: 10,
    },
    emptySubtext: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 8,
    },
    emptyNote: {
        fontSize: 14,
        color: colors.textLight,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    pdfViewerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    pdfTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginTop: 20,
        marginBottom: 8,
    },
    pdfSubtitle: {
        fontSize: 18,
        color: colors.primary,
        fontWeight: '600',
        marginBottom: 16,
    },
    pdfDescription: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 20,
    },
    pdfButton: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        minWidth: 200,
    },
    pdfButtonSecondary: {
        backgroundColor: colors.white,
        borderWidth: 2,
        borderColor: colors.primary,
    },
    pdfButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    summaryRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 5,
    },
    summaryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primaryLight + '15',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.primaryLight + '30',
        gap: 6,
    },
    summaryChipText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: colors.primary,
    },
});

export default StudentTimetable;
