import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FloatingTabBar from '../components/FloatingTabBar';
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
import StudentStaffDirectory from '../screens/student/StudentStaffDirectory';
import StudentEvents from '../screens/student/StudentEvents';
import StudentTimetable from '../screens/student/StudentTimetable';
import StaffProfile from '../screens/staff/StaffProfile';
import StudentGallery from '../screens/student/StudentGallery';

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
            tabBar={(props) => <FloatingTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={StaffDashboard}
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
                name="Students"
                component={StaffStudentManagement}
                options={{
                    tabBarIcon: ({ focused, color, size }) => (
                        <MaterialCommunityIcons 
                            name="account-group-outline" 
                            size={size || 24} 
                            color={color} 
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Exams"
                component={ExamStack}
                options={{
                    tabBarIcon: ({ focused, color, size }) => (
                        <MaterialCommunityIcons 
                            name="file-document-outline" 
                            size={size || 24} 
                            color={color} 
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Notices"
                component={StaffNotices}
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
                name="Attendance"
                component={StaffAttendance}
                options={{
                    tabBarButton: () => null,
                }}
            />
            <Tab.Screen
                name="Timetable"
                component={StudentTimetable}
                options={{
                    tabBarButton: () => null,
                }}
            />
            <Tab.Screen
                name="TimetableManagement"
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
                name="StaffDirectory"
                component={StudentStaffDirectory}
                options={{
                    tabBarButton: () => null, // Accessible via Dashboard
                }}
            />
            <Tab.Screen
                name="Events"
                component={StudentEvents}
                options={{
                    tabBarButton: () => null, // Accessible via Dashboard
                }}
            />
            <Tab.Screen
                name="Profile"
                component={StaffProfile}
                options={{
                    tabBarButton: () => null, // Accessible via Dashboard avatar
                }}
            />
            <Tab.Screen
                name="Gallery"
                component={StudentGallery}
                options={{
                    tabBarButton: () => null, // Accessible via Dashboard
                }}
            />
        </Tab.Navigator>
    );
};

export default StaffNavigator;
