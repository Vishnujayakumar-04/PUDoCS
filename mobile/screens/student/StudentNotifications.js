import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PremiumHeader from '../../components/PremiumHeader';
import PremiumCard from '../../components/PremiumCard';
import colors from '../../styles/colors';
import { moderateScale, getFontSize, getPadding, getMargin } from '../../utils/responsive';

const StudentNotifications = () => {
    // Static notifications
    const notifications = [
        { id: '1', message: 'Examination results have been published.', date: new Date().toISOString() },
        { id: '2', message: 'The college will reopen on 19-01-2026.', date: new Date().toISOString() },
    ];

    return (
        <View style={styles.container}>
            <PremiumHeader 
                title="Notifications" 
                subtitle="Important updates and announcements"
            />
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                {notifications.length === 0 ? (
                    <PremiumCard style={styles.emptyCard}>
                        <MaterialCommunityIcons name="bell-off-outline" size={48} color={colors.gray300} />
                        <Text style={styles.emptyText}>No notifications</Text>
                    </PremiumCard>
                ) : (
                    notifications.map((notification) => (
                        <PremiumCard key={notification.id} style={styles.notificationCard}>
                            <View style={styles.notificationItem}>
                                <View style={styles.notificationIcon}>
                                    <MaterialCommunityIcons name="bell" size={24} color={colors.primary} />
                                </View>
                                <View style={styles.notificationTextContainer}>
                                    <Text style={styles.notificationText}>{notification.message}</Text>
                                    <Text style={styles.notificationDate}>
                                        {new Date(notification.date).toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </Text>
                                </View>
                            </View>
                        </PremiumCard>
                    ))
                )}
            </ScrollView>
        </View>
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
        padding: getPadding(20),
        paddingBottom: getPadding(100),
    },
    notificationCard: {
        marginBottom: getMargin(12),
        padding: getPadding(16),
    },
    notificationItem: {
        flexDirection: 'row',
    },
    notificationIcon: {
        width: moderateScale(48),
        height: moderateScale(48),
        borderRadius: moderateScale(24),
        backgroundColor: colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: getMargin(16),
    },
    notificationTextContainer: {
        flex: 1,
    },
    notificationText: {
        fontSize: getFontSize(16),
        color: colors.textPrimary,
        fontWeight: '500',
        marginBottom: getMargin(6),
        lineHeight: getFontSize(22),
    },
    notificationDate: {
        fontSize: getFontSize(12),
        color: colors.textSecondary,
    },
    emptyCard: {
        alignItems: 'center',
        paddingVertical: getPadding(48),
        backgroundColor: colors.gray50,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    emptyText: {
        fontSize: getFontSize(14),
        color: colors.textSecondary,
        marginTop: getMargin(12),
    },
});

export default StudentNotifications;
