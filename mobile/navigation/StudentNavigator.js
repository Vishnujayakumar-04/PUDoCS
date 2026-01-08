import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import CustomBottomTabBar from '../components/CustomBottomTabBar';
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
import StudentDocuments from '../screens/student/StudentDocuments';
import StudentCalendar from '../screens/student/StudentCalendar';
import StudentComplaint from '../screens/student/StudentComplaint';
import StudentDetailView from '../screens/student/StudentDetailView';
import StudentAttendance from '../screens/student/StudentAttendance';
import StudentGallery from '../screens/student/StudentGallery';
import StudentDetails from '../screens/student/StudentDetails';

const Tab = createBottomTabNavigator();


// List of main screens where tab bar should be visible
const MAIN_SCREENS = ['Dashboard', 'Students', 'StudentDetails', 'Notices', 'Profile'];

const getTabBarVisibility = (route) => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? route.name;
    return MAIN_SCREENS.includes(routeName);
};

const StudentNavigator = () => {
    return (
        <Tab.Navigator
            tabBar={(props) => {
                const route = props.state.routes[props.state.index];
                if (!getTabBarVisibility(route)) {
                    return null; // Hide tab bar on sub-pages
                }
                return <CustomBottomTabBar {...props} />;
            }}
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
                name="Students"
                component={StudentDirectory}
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
                name="StudentDetails"
                component={StudentDetails}
                options={{
                    tabBarIcon: ({ focused, color, size }) => (
                        <MaterialCommunityIcons 
                            name="leaf" 
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
                name="Documents"
                component={StudentDocuments}
                options={{ tabBarButton: () => null }}
            />
            <Tab.Screen
                name="Calendar"
                component={StudentCalendar}
                options={{ tabBarButton: () => null }}
            />
            <Tab.Screen
                name="Timetable"
                component={StudentTimetable}
                options={{ tabBarButton: () => null }}
            />
            <Tab.Screen
                name="Complaint"
                component={StudentComplaint}
                options={{ tabBarButton: () => null }}
            />
            <Tab.Screen
                name="StudentDetail"
                component={StudentDetailView}
                options={{ tabBarButton: () => null }}
            />
            <Tab.Screen
                name="Attendance"
                component={StudentAttendance}
                options={{ tabBarButton: () => null }}
            />
            <Tab.Screen
                name="Gallery"
                component={StudentGallery}
                options={{ tabBarButton: () => null }}
            />
        </Tab.Navigator>
    );
};

export default StudentNavigator;
