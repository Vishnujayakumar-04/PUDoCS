import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

// Common screens
import WelcomeScreen from '../screens/WelcomeScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import LoginScreen from '../screens/LoginScreen';

// Role-based navigators
import StudentNavigator from './StudentNavigator';
import StaffNavigator from './StaffNavigator';
import OfficeNavigator from './OfficeNavigator';
import ParentNavigator from './ParentNavigator';

const Stack = createStackNavigator();

const AppNavigator = () => {
    const { isAuthenticated, role, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    <>
                        <Stack.Screen name="Welcome" component={WelcomeScreen} />
                        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
                        <Stack.Screen name="Login" component={LoginScreen} />
                    </>
                ) : (
                    <>
                        {role === 'Student' && (
                            <Stack.Screen name="StudentApp" component={StudentNavigator} />
                        )}
                        {role === 'Parent' && (
                            <Stack.Screen name="ParentApp" component={ParentNavigator} />
                        )}
                        {(role === 'Staff' || role === 'Faculty') && (
                            <Stack.Screen name="StaffApp" component={StaffNavigator} />
                        )}
                        {role === 'Office' && (
                            <Stack.Screen name="OfficeApp" component={OfficeNavigator} />
                        )}
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
