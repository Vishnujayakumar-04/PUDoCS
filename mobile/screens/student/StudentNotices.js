import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { studentService } from '../../services/studentService';
import Header from '../../components/Header';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../styles/colors';

const StudentNotices = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotices();
    }, []);

    const loadNotices = async () => {
        try {
            const data = await studentService.getNotices();
            setNotices(data);
        } catch (error) {
            console.error('Error loading notices:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Urgent':
                return colors.error;
            case 'High':
                return colors.warning;
            case 'Medium':
                return colors.info;
            default:
                return colors.gray500;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Notices" subtitle="Official Department Notices" />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {notices.length === 0 ? (
                    <Card>
                        <Text style={styles.noDataText}>No notices available</Text>
                    </Card>
                ) : (
                    notices.map((notice) => (
                        <Card key={notice._id}>
                            <View style={styles.noticeHeader}>
                                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(notice.priority) }]}>
                                    <Text style={styles.priorityText}>{notice.priority}</Text>
                                </View>
                                <View style={[styles.categoryBadge, { backgroundColor: colors.primary }]}>
                                    <Text style={styles.categoryText}>{notice.category}</Text>
                                </View>
                            </View>

                            <Text style={styles.noticeTitle}>{notice.title}</Text>
                            <Text style={styles.noticeContent}>{notice.content}</Text>

                            <View style={styles.noticeFooter}>
                                <Text style={styles.postedBy}>
                                    Posted by: {notice.postedBy?.name || 'Department'}
                                </Text>
                                <Text style={styles.date}>
                                    {new Date(notice.createdAt).toLocaleDateString()}
                                </Text>
                            </View>
                        </Card>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    noticeHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    priorityBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 8,
    },
    priorityText: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.white,
    },
    categoryBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    categoryText: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.white,
    },
    noticeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    noticeContent: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
        marginBottom: 12,
    },
    noticeFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
    postedBy: {
        fontSize: 12,
        color: colors.textLight,
    },
    date: {
        fontSize: 12,
        color: colors.textLight,
    },
    noDataText: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});

export default StudentNotices;
