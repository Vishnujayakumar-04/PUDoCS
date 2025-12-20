import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import colors from '../styles/colors';

// Office screens
import OfficeDashboard from '../screens/office/OfficeDashboard';
import OfficeFeeManagement from '../screens/office/OfficeFeeManagement';
import OfficeExamEligibility from '../screens/office/OfficeExamEligibility';
import OfficeResults from '../screens/office/OfficeResults';
import OfficeNotices from '../screens/office/OfficeNotices';

const Tab = createBottomTabNavigator();

const OfficeNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.accent,
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
                component={OfficeDashboard}
                options={{
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text>,
                }}
            />
            <Tab.Screen
                name="Fees"
                component={OfficeFeeManagement}
                options={{
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>💰</Text>,
                }}
            />
            <Tab.Screen
                name="Eligibility"
                component={OfficeExamEligibility}
                options={{
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>✅</Text>,
                }}
            />
            <Tab.Screen
                name="Results"
                component={OfficeResults}
                options={{
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📊</Text>,
                }}
            />
            <Tab.Screen
                name="Notices"
                component={OfficeNotices}
                options={{
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📢</Text>,
                }}
            />
        </Tab.Navigator>
    );
};

export default OfficeNavigator;
