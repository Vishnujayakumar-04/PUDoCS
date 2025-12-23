import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { studentService } from '../../services/studentService';
import PremiumCard from '../../components/PremiumCard';
import PremiumHeader from '../../components/PremiumHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';

const StudentNotices = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        loadNotices();
    }, []);

    const formatDate = (dateValue) => {
        if (!dateValue) return '';
        try {
            if (dateValue.toDate) return dateValue.toDate().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            return new Date(dateValue).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        } catch (e) {
            return dateValue.toString();
        }
    };

    const loadNotices = async () => {
        try {
            const data = await studentService.getNotices();
            // Filter only vacation/holiday notices
            const vacationNotices = (data || []).filter(notice => {
                const title = (notice.title || '').toLowerCase();
                const content = (notice.content || '').toLowerCase();
                const category = (notice.category || '').toLowerCase();
                return (
                    category === 'vacation' || 
                    category === 'holiday' ||
                    title.includes('vacation') ||
                    title.includes('holiday') ||
                    title.includes('reopen') ||
                    title.includes('college reopen') ||
                    content.includes('vacation') ||
                    content.includes('holiday') ||
                    content.includes('reopen')
                );
            });
            setNotices(vacationNotices);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }).start();
        } catch (error) {
            console.error('Error loading notices:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <View style={styles.container}>
            <PremiumHeader 
                title="Vacations & Holidays" 
                subtitle="College reopening dates"
            />

            <Animated.ScrollView
                style={[styles.content, { opacity: fadeAnim }]}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {notices.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="calendar-blank-outline" size={64} color={colors.gray300} />
                        <Text style={styles.emptyText}>No vacation notices</Text>
                        <Text style={styles.emptySubtext}>Check back later for updates</Text>
                    </View>
                ) : (
                    notices.map((notice, index) => (
                        <PremiumCard key={index} style={styles.noticeCard}>
                            <View style={styles.noticeRow}>
                                <View style={styles.iconContainer}>
                                    <MaterialCommunityIcons 
                                        name="calendar-check" 
                                        size={32} 
                                        color={colors.primary} 
                                    />
                                </View>
                                <View style={styles.noticeContent}>
                                    <Text style={styles.noticeTitle}>{notice.title}</Text>
                                    {notice.content && (
                                        <Text style={styles.noticeDescription}>
                                            {notice.content}
                                        </Text>
                                    )}
                                    {notice.vacationStartDate && (
                                        <View style={styles.dateRow}>
                                            <MaterialCommunityIcons 
                                                name="calendar-start" 
                                                size={16} 
                                                color={colors.textSecondary} 
                                            />
                                            <Text style={styles.dateLabel}>Starts: </Text>
                                            <Text style={styles.dateValue}>
                                                {formatDate(notice.vacationStartDate)}
                                            </Text>
                                        </View>
                                    )}
                                    {notice.vacationEndDate && (
                                        <View style={styles.dateRow}>
                                            <MaterialCommunityIcons 
                                                name="calendar-end" 
                                                size={16} 
                                                color={colors.textSecondary} 
                                            />
                                            <Text style={styles.dateLabel}>Ends: </Text>
                                            <Text style={styles.dateValue}>
                                                {formatDate(notice.vacationEndDate)}
                                            </Text>
                                        </View>
                                    )}
                                    {notice.reopenDate && (
                                        <View style={styles.dateRow}>
                                            <MaterialCommunityIcons 
                                                name="calendar-clock" 
                                                size={16} 
                                                color={colors.success} 
                                            />
                                            <Text style={styles.reopenLabel}>College Reopens: </Text>
                                            <Text style={styles.reopenValue}>
                                                {formatDate(notice.reopenDate)}
                                            </Text>
                                        </View>
                                    )}
                                    {notice.date && !notice.vacationStartDate && !notice.reopenDate && (
                                        <View style={styles.dateRow}>
                                            <MaterialCommunityIcons 
                                                name="calendar" 
                                                size={16} 
                                                color={colors.textSecondary} 
                                            />
                                            <Text style={styles.dateValue}>
                                                {formatDate(notice.date)}
                                            </Text>
                                        </View>
                                    )}
                                    {notice.createdAt && (
                                        <Text style={styles.postedDate}>
                                            Posted: {formatDate(notice.createdAt)}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        </PremiumCard>
                    ))
                )}

                <View style={{ height: 100 }} />
            </Animated.ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    noticeCard: {
        padding: 0,
        overflow: 'hidden',
        marginBottom: 20,
    },
    noticeRow: {
        flexDirection: 'row',
        padding: 20,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    noticeContent: {
        flex: 1,
    },
    noticeTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 12,
        lineHeight: 24,
    },
    noticeDescription: {
        fontSize: 15,
        color: colors.textSecondary,
        lineHeight: 22,
        marginBottom: 16,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    dateLabel: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
        marginLeft: 6,
    },
    dateValue: {
        fontSize: 14,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    reopenLabel: {
        fontSize: 15,
        color: colors.success,
        fontWeight: '600',
        marginLeft: 6,
    },
    reopenValue: {
        fontSize: 15,
        color: colors.success,
        fontWeight: '700',
    },
    postedDate: {
        fontSize: 12,
        color: colors.textLight,
        marginTop: 12,
        fontStyle: 'italic',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textSecondary,
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.textLight,
        marginTop: 8,
    },
});

export default StudentNotices;
