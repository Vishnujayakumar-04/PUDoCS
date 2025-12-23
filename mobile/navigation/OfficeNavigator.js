import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FloatingTabBar from '../components/FloatingTabBar';
import colors from '../styles/colors';

// Office screens
import OfficeDashboard from '../screens/office/OfficeDashboard';
import OfficeFeeManagement from '../screens/office/OfficeFeeManagement';
import OfficeExamEligibility from '../screens/office/OfficeExamEligibility';
import OfficeResults from '../screens/office/OfficeResults';
import OfficeNotices from '../screens/office/OfficeNotices';
import StudentStaffDirectory from '../screens/student/StudentStaffDirectory';
import StudentEvents from '../screens/student/StudentEvents';
import OfficeProfile from '../screens/office/OfficeProfile';

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
                name="Eligibility"
                component={OfficeExamEligibility}
                options={{
                    tabBarIcon: ({ focused, color, size }) => (
                        <MaterialCommunityIcons 
                            name="check-circle-outline" 
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
                component={StudentStaffDirectory}
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
        </Tab.Navigator>
    );
};

export default OfficeNavigator;
