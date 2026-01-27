import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ParentDashboard from '../screens/parent/ParentDashboard';

const Stack = createStackNavigator();

const ParentNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ParentDashboard" component={ParentDashboard} />
        </Stack.Navigator>
    );
};

export default ParentNavigator;
