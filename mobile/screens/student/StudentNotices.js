import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { studentService } from '../../services/studentService';
import PremiumCard from '../../components/PremiumCard';
import PremiumHeader from '../../components/PremiumHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';

const StudentNotices = () => {
    const [notices, setNotices] = useState([]);
    const [filteredNotices, setFilteredNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [fadeAnim] = useState(new Animated.Value(0));

    const categories = ['All', 'Exam', 'Event', 'Academic'];

    useEffect(() => {
        loadNotices();
    }, []);

    const formatDate = (dateValue) => {
        if (!dateValue) return '';
        try {
            if (dateValue.toDate) return dateValue.toDate().toLocaleDateString();
            return new Date(dateValue).toLocaleDateString();
        } catch (e) {
            return dateValue.toString();
        }
    };

    const loadNotices = async () => {
        try {
            const data = await studentService.getNotices();
            setNotices(data || []);
            setFilteredNotices(data || []);
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

    const handleFilter = (category) => {
        setActiveFilter(category);
        if (category === 'All') {
            setFilteredNotices(notices);
        } else {
            setFilteredNotices(notices.filter(n => n.category === category));
        }
    };

    const handleSearch = (text) => {
        setSearchQuery(text);
        const filtered = notices.filter(n =>
            n.title.toLowerCase().includes(text.toLowerCase()) ||
            n.content?.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredNotices(filtered);
    };

    const getCategoryColor = (category) => {
        switch (category?.toLowerCase()) {
            case 'academic': return colors.primary;
            case 'exam': return colors.warning;
            case 'event': return colors.info;
            case 'fees': return colors.accent;
            default: return colors.gray500;
        }
    };

    if (loading) return <LoadingSpinner />;

    // Separate pinned and regular notices
    const pinnedNotices = filteredNotices.filter(n => n.isPriority);
    const regularNotices = filteredNotices.filter(n => !n.isPriority);

    return (
        <View style={styles.container}>
            <PremiumHeader 
                title="Notices" 
                subtitle="Stay updated with department news"
            />

            {/* Filter Bar */}
            <View style={styles.filterContainer}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={styles.filterScroll}
                >
                    {categories.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => handleFilter(cat)}
                            style={[
                                styles.filterTab,
                                activeFilter === cat && styles.filterTabActive
                            ]}
                            activeOpacity={0.7}
                        >
                            <Text style={[
                                styles.filterText,
                                activeFilter === cat && styles.filterTextActive
                            ]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <Animated.ScrollView
                style={[styles.content, { opacity: fadeAnim }]}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Pinned Notices */}
                {pinnedNotices.length > 0 && (
                    <View style={styles.section}>
                        {pinnedNotices.map((notice, index) => (
                            <PremiumCard key={`pinned-${index}`} style={styles.noticeCard}>
                                <View style={styles.noticeRow}>
                                    <View style={[
                                        styles.accentBar,
                                        { backgroundColor: getCategoryColor(notice.category) }
                                    ]} />
                                    <View style={styles.noticeContent}>
                                        <View style={styles.noticeHeader}>
                                            <View style={[
                                                styles.categoryBadge,
                                                { backgroundColor: getCategoryColor(notice.category) + '15' }
                                            ]}>
                                                <Text style={[
                                                    styles.categoryText,
                                                    { color: getCategoryColor(notice.category) }
                                                ]}>
                                                    {notice.category || 'General'}
                                                </Text>
                                            </View>
                                            <View style={styles.pinnedBadge}>
                                                <MaterialCommunityIcons name="pin" size={12} color={colors.warning} />
                                                <Text style={styles.pinnedText}>Pinned</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.noticeTitle}>{notice.title}</Text>
                                        {notice.content && (
                                            <Text style={styles.noticeDescription} numberOfLines={3}>
                                                {notice.content}
                                            </Text>
                                        )}
                                        <View style={styles.noticeFooter}>
                                            <Text style={styles.postedBy}>
                                                {notice.postedBy || 'Department Office'}
                                            </Text>
                                            <Text style={styles.noticeDate}>
                                                {formatDate(notice.createdAt) || notice.date}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </PremiumCard>
                        ))}
                    </View>
                )}

                {/* Regular Notices */}
                {regularNotices.length === 0 && pinnedNotices.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="bell-off-outline" size={64} color={colors.gray300} />
                        <Text style={styles.emptyText}>No notices found</Text>
                        <Text style={styles.emptySubtext}>Check back later for updates</Text>
                    </View>
                ) : (
                    regularNotices.map((notice, index) => (
                        <PremiumCard key={index} style={styles.noticeCard}>
                            <View style={styles.noticeRow}>
                                <View style={[
                                    styles.accentBar,
                                    { backgroundColor: getCategoryColor(notice.category) }
                                ]} />
                                <View style={styles.noticeContent}>
                                    <View style={styles.noticeHeader}>
                                        <View style={[
                                            styles.categoryBadge,
                                            { backgroundColor: getCategoryColor(notice.category) + '15' }
                                        ]}>
                                            <Text style={[
                                                styles.categoryText,
                                                { color: getCategoryColor(notice.category) }
                                            ]}>
                                                {notice.category || 'General'}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.noticeTitle}>{notice.title}</Text>
                                    {notice.content && (
                                        <Text style={styles.noticeDescription} numberOfLines={3}>
                                            {notice.content}
                                        </Text>
                                    )}
                                    <View style={styles.noticeFooter}>
                                        <Text style={styles.postedBy}>
                                            {notice.postedBy || 'Department Office'}
                                        </Text>
                                        <Text style={styles.noticeDate}>
                                            {formatDate(notice.createdAt) || notice.date}
                                        </Text>
                                    </View>
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
    filterContainer: {
        backgroundColor: colors.white,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    filterScroll: {
        paddingHorizontal: 20,
        gap: 12,
    },
    filterTab: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.gray50,
        marginRight: 8,
    },
    filterTabActive: {
        backgroundColor: colors.primary,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    filterTextActive: {
        color: colors.white,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    section: {
        marginBottom: 8,
    },
    noticeCard: {
        padding: 0,
        overflow: 'hidden',
        marginBottom: 16,
    },
    noticeRow: {
        flexDirection: 'row',
    },
    accentBar: {
        width: 4,
        borderRadius: 2,
    },
    noticeContent: {
        flex: 1,
        padding: 16,
    },
    noticeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    categoryBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    categoryText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    pinnedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.warning + '15',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    pinnedText: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.warning,
    },
    noticeTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 8,
        lineHeight: 24,
    },
    noticeDescription: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
        marginBottom: 12,
    },
    noticeFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    postedBy: {
        fontSize: 12,
        color: colors.textLight,
        fontWeight: '500',
    },
    noticeDate: {
        fontSize: 12,
        color: colors.textLight,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
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
