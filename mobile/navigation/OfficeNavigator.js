import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FloatingTabBar from '../components/FloatingTabBar';
import colors from '../styles/colors';

// Office screens
import OfficeDashboard from '../screens/office/OfficeDashboard';
import OfficeFeeManagement from '../screens/office/OfficeFeeManagement';
import OfficeResults from '../screens/office/OfficeResults';
import OfficeNotices from '../screens/office/OfficeNotices';
import OfficeStaffDirectory from '../screens/office/OfficeStaffDirectory';
import StudentEvents from '../screens/student/StudentEvents';
import OfficeProfile from '../screens/office/OfficeProfile';
import StudentTimetable from '../screens/student/StudentTimetable';
import AdminAccess from '../screens/office/AdminAccess';
import OfficeAttendance from '../screens/office/OfficeAttendance';
import OfficeGallery from '../screens/office/OfficeGallery';

const Tab = createBottomTabNavigator();

const OfficeNavigator = () => {
    return (
        <Tab.Navigator
            tabBar={(props) => <FloatingTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={OfficeDashboard}
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
                name="Fees"
                component={OfficeFeeManagement}
                options={{
                    tabBarIcon: ({ focused, color, size }) => (
                        <MaterialCommunityIcons 
                            name="cash-multiple" 
                            size={size || 24} 
                            color={color} 
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Results"
                component={OfficeResults}
                options={{
                    tabBarIcon: ({ focused, color, size }) => (
                        <MaterialCommunityIcons 
                            name="file-document-edit-outline" 
                            size={size || 24} 
                            color={color} 
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Notices"
                component={OfficeNotices}
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
                name="StaffDirectory"
                component={OfficeStaffDirectory}
                options={{
                    tabBarButton: () => null,
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
                component={OfficeProfile}
                options={{
                    tabBarButton: () => null, // Accessible via Dashboard avatar
                }}
            />
            <Tab.Screen
                name="Timetable"
                component={StudentTimetable}
                options={{
                    tabBarButton: () => null, // Accessible via Dashboard
                }}
            />
            <Tab.Screen
                name="AdminAccess"
                component={AdminAccess}
                options={{
                    tabBarButton: () => null, // Accessible via Dashboard
                }}
            />
            <Tab.Screen
                name="Attendance"
                component={OfficeAttendance}
                options={{
                    tabBarButton: () => null, // Accessible via Dashboard
                }}
            />
            <Tab.Screen
                name="Gallery"
                component={OfficeGallery}
                options={{
                    tabBarButton: () => null, // Accessible via Dashboard
                }}
            />
        </Tab.Navigator>
    );
};

export default OfficeNavigator;
