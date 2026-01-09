import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../styles/colors';
import { typography, spacing, shadows } from '../styles/theme';

const WebSidebar = ({ role = 'Student' }) => {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    
    // Get current route name to highlight active tab
    // We need to access the state from the navigator if possible, 
    // or rely on the fact that this sidebar tracks the "current" screen.
    // However, since this component is outside the Tab.Navigator in our logic,
    // we might need to pass the current route name or use navigation state.
    // A simpler way for the wrapper pattern is to check navigation state.
    const state = navigation.getState();
    const currentRouteName = state ? state.routes[state.index].name : 'Dashboard';

    // Define menus based on role
    const getMenuItems = () => {
        switch(role) {
            case 'Student':
                return [
                    { name: 'Dashboard', icon: 'home-outline', label: 'Dashboard' },
                    { name: 'Students', icon: 'account-group-outline', label: 'Classmates' },
                    { name: 'StudentDetails', icon: 'leaf', label: 'My Details' },
                    { name: 'Notifications', icon: 'bell-outline', label: 'Notifications' },
                    { name: 'Profile', icon: 'account-outline', label: 'Profile' },
                    // Secondary
                    { isDivider: true },
                    { name: 'Timetable', icon: 'calendar-clock', label: 'Timetable' },
                    { name: 'Attendance', icon: 'chart-box-outline', label: 'Attendance' },
                    { name: 'Results', icon: 'school-outline', label: 'Results' },
                    { name: 'Calendar', icon: 'calendar-month', label: 'Academic Calendar' },
                    { name: 'Documents', icon: 'file-document-outline', label: 'Documents' },
                ];
            case 'Staff':
                return [
                    { name: 'Dashboard', icon: 'view-dashboard-outline', label: 'Dashboard' },
                    { name: 'Attendance', icon: 'clipboard-check-outline', label: 'Attendance' },
                    { name: 'StudentManagement', icon: 'account-school-outline', label: 'Students' },
                    { name: 'Internals', icon: 'format-list-numbered', label: 'Internals' },
                    { name: 'Timetable', icon: 'calendar-clock', label: 'My Schedule' },
                    { name: 'Profile', icon: 'account-outline', label: 'Profile' },
                ];
            case 'Office':
                return [
                    { name: 'Dashboard', icon: 'office-building', label: 'Dashboard' },
                    { name: 'FeeManagement', icon: 'cash-multiple', label: 'Fee Management' },
                    { name: 'ExamEligibility', icon: 'clipboard-check', label: 'Exam Eligibility' },
                    { name: 'StaffDirectory', icon: 'account-tie', label: 'Staff Directory' },
                    { name: 'Notices', icon: 'bullhorn-outline', label: 'Notices' },
                    { name: 'Profile', icon: 'account-circle', label: 'Profile' },
                ];
            default:
                return [];
        }
    };

    const menuItems = getMenuItems();

    // Navigation handler
    const handleNavigate = (screenName) => {
        navigation.navigate(screenName);
    };

    return (
        <View style={[styles.sidebar, { paddingTop: insets.top }]}>
            {/* Header / Logo */}
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <MaterialCommunityIcons name="school" size={32} color={colors.primary} />
                </View>
                <Text style={styles.appName}>PUDoCS</Text>
                <Text style={styles.roleLabel}>{role}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.menuContainer} showsVerticalScrollIndicator={false}>
                {menuItems.map((item, index) => {
                    if (item.isDivider) {
                        return <View key={`divider-${index}`} style={styles.divider} />;
                    }

                    const isActive = currentRouteName === item.name;

                    return (
                        <TouchableOpacity
                            key={item.name}
                            style={[
                                styles.menuItem,
                                isActive && styles.menuItemActive
                            ]}
                            onPress={() => handleNavigate(item.name)}
                        >
                            <MaterialCommunityIcons 
                                name={item.icon} 
                                size={22} 
                                color={isActive ? colors.primary : colors.gray600} 
                            />
                            <Text style={[
                                styles.menuLabel,
                                isActive && styles.menuLabelActive
                            ]}>
                                {item.label}
                            </Text>
                            {isActive && <View style={styles.activeIndicator} />}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Footer / User Info */}
            <View style={styles.footer}>
                 <Text style={styles.footerText}>© 2026 PUDoCS</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    sidebar: {
        width: 260,
        backgroundColor: '#ffffff',
        borderRightWidth: 1,
        borderRightColor: '#e0e0e0',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...shadows.medium,
    },
    header: {
        padding: 24,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    logoContainer: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    appName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.gray900,
        letterSpacing: 0.5,
    },
    roleLabel: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: '600',
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
        backgroundColor: colors.primary + '15', // 15% opacity
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    menuContainer: {
        padding: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 4,
    },
    menuItemActive: {
        backgroundColor: colors.primary + '10', // 10% opacity
    },
    menuLabel: {
        marginLeft: 12,
        fontSize: 15,
        color: colors.gray600,
        fontWeight: '500',
    },
    menuLabelActive: {
        color: colors.primary,
        fontWeight: '700',
    },
    activeIndicator: {
        position: 'absolute',
        left: 0,
        top: 8,
        bottom: 8,
        width: 4,
        backgroundColor: colors.primary,
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#ebedf0',
        marginVertical: 16,
        marginHorizontal: 8,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: colors.gray400,
    },
});

export default WebSidebar;
