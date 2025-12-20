import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import colors from '../styles/colors';

// Staff screens
import StaffDashboard from '../screens/staff/StaffDashboard';
import StaffStudentManagement from '../screens/staff/StaffStudentManagement';
import StaffExamManagement from '../screens/staff/StaffExamManagement';
import StaffSeatAllocation from '../screens/staff/StaffSeatAllocation';
import StaffAttendance from '../screens/staff/StaffAttendance';
import StaffTimetable from '../screens/staff/StaffTimetable';
import StaffInternals from '../screens/staff/StaffInternals';
import StaffNotices from '../screens/staff/StaffNotices';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Exam Stack Navigator
const ExamStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ExamManagement" component={StaffExamManagement} />
            <Stack.Screen name="SeatAllocation" component={StaffSeatAllocation} />
        </Stack.Navigator>
    );
};

const StaffNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.secondary,
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
                component={StaffDashboard}
                options={{
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text>,
                }}
            />
            <Tab.Screen
                name="Students"
                component={StaffStudentManagement}
                options={{
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>👥</Text>,
                }}
            />
            <Tab.Screen
                name="Exams"
                component={ExamStack}
                options={{
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📝</Text>,
                }}
            />
            <Tab.Screen
                name="Attendance"
                component={StaffAttendance}
                options={{
                    tabBarButton: () => null, // Hidden from tab bar, accessible from dashboard
                }}
            />
            <Tab.Screen
                name="Timetable"
                component={StaffTimetable}
                options={{
                    tabBarButton: () => null,
                }}
            />
            <Tab.Screen
                name="Internals"
                component={StaffInternals}
                options={{
                    tabBarButton: () => null,
                }}
            />
            <Tab.Screen
                name="Notices"
                component={StaffNotices}
                options={{
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📢</Text>,
                }}
            />
        </Tab.Navigator>
    );
};

export default StaffNavigator;
