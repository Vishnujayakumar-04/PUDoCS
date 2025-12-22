import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import FloatingTabBar from '../components/FloatingTabBar';
import colors from '../styles/colors';

// Student screens
import StudentDashboard from '../screens/student/StudentDashboard';
import StudentProfile from '../screens/student/StudentProfile';
import StudentTimetable from '../screens/student/StudentTimetable';
import StudentNotices from '../screens/student/StudentNotices';
import StudentExams from '../screens/student/StudentExams';
import StudentStaffDirectory from '../screens/student/StudentStaffDirectory';
import StudentDirectory from '../screens/student/StudentDirectory';
import StudentResults from '../screens/student/StudentResults';
import StudentEvents from '../screens/student/StudentEvents';
import StudentLetters from '../screens/student/StudentLetters';
import StudentCalendar from '../screens/student/StudentCalendar';

const Tab = createBottomTabNavigator();


const StudentNavigator = () => {
    return (
        <Tab.Navigator
            tabBar={(props) => <FloatingTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={StudentDashboard}
                options={{
                    tabBarIcon: ({ focused, color, size }) => (
                        <MaterialCommunityIcons 
                            name="home-outline" 
                            size={size || 24} 
                            color={color} 
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Timetable"
                component={StudentTimetable}
                options={{
                    tabBarIcon: ({ focused, color, size }) => (
                        <MaterialCommunityIcons 
                            name="calendar" 
                            size={size || 24} 
                            color={color} 
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Notices"
                component={StudentNotices}
                options={{
                    tabBarIcon: ({ focused, color, size }) => (
                        <MaterialCommunityIcons 
                            name="bell-outline" 
                            size={size || 24} 
                            color={color} 
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={StudentProfile}
                options={{
                    tabBarIcon: ({ focused, color, size }) => (
                        <MaterialCommunityIcons 
                            name="account-outline" 
                            size={size || 24} 
                            color={color} 
                        />
                    ),
                }}
            />

            {/* Hidden Screens */}
            <Tab.Screen
                name="Exams"
                component={StudentExams}
                options={{ tabBarButton: () => null }}
            />
            <Tab.Screen
                name="Staff"
                component={StudentStaffDirectory}
                options={{ tabBarButton: () => null }}
            />
            <Tab.Screen
                name="Events"
                component={StudentEvents}
                options={{ tabBarButton: () => null }}
            />
            <Tab.Screen
                name="Results"
                component={StudentResults}
                options={{ tabBarButton: () => null }}
            />
            <Tab.Screen
                name="Letters"
                component={StudentLetters}
                options={{ tabBarButton: () => null }}
            />
            <Tab.Screen
                name="Calendar"
                component={StudentCalendar}
                options={{ tabBarButton: () => null }}
            />
            <Tab.Screen
                name="Students"
                component={StudentDirectory}
                options={{ tabBarButton: () => null }}
            />
        </Tab.Navigator>
    );
};

export default StudentNavigator;
