import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import colors from '../styles/colors';

// Student screens
import StudentDashboard from '../screens/student/StudentDashboard';
import StudentProfile from '../screens/student/StudentProfile';
import StudentTimetable from '../screens/student/StudentTimetable';
import StudentNotices from '../screens/student/StudentNotices';
import StudentExams from '../screens/student/StudentExams';
import StudentStaffDirectory from '../screens/student/StudentStaffDirectory';
import { StudentEvents, StudentResults, StudentLetterFormats } from '../screens/student/PlaceholderScreens';

const Tab = createBottomTabNavigator();

const StudentNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.gray500,
                tabBarStyle: {
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={StudentDashboard}
                options={{
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text>,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={StudentProfile}
                options={{
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>👤</Text>,
                }}
            />
            <Tab.Screen
                name="Timetable"
                component={StudentTimetable}
                options={{
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📅</Text>,
                }}
            />
            <Tab.Screen
                name="Exams"
                component={StudentExams}
                options={{
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📝</Text>,
                }}
            />
            <Tab.Screen
                name="Staff"
                component={StudentStaffDirectory}
                options={{
                    tabBarButton: () => null, // Hidden from tab bar, accessible from dashboard
                }}
            />
            <Tab.Screen
                name="Events"
                component={StudentEvents}
                options={{
                    tabBarButton: () => null,
                }}
            />
            <Tab.Screen
                name="Results"
                component={StudentResults}
                options={{
                    tabBarButton: () => null,
                }}
            />
            <Tab.Screen
                name="Letters"
                component={StudentLetterFormats}
                options={{
                    tabBarButton: () => null,
                }}
            />
        </Tab.Navigator>
    );
};

export default StudentNavigator;
