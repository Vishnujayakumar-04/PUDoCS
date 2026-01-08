import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../styles/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CustomBottomTabBarOffice = ({ state, descriptors, navigation }) => {
    const insets = useSafeAreaInsets();

    // Define the 5 main tabs in order for Office
    const mainTabs = ['Dashboard', 'Fees', 'AdminAccess', 'Notifications', 'Profile'];
    
    // Map route names to icons
    const getIcon = (routeName, isFocused) => {
        switch (routeName) {
            case 'Dashboard':
                return { name: 'home-outline', color: isFocused ? colors.primary : colors.gray400 };
            case 'Fees':
                return { name: 'cash-multiple', color: isFocused ? colors.primary : colors.gray400 };
            case 'AdminAccess':
                return { name: 'shield-account', color: colors.white }; // Center button - always white
            case 'Notifications':
                return { name: 'bell-outline', color: isFocused ? colors.primary : colors.gray400 };
            case 'Profile':
                return { name: 'account-outline', color: isFocused ? colors.primary : colors.gray400 };
            default:
                return { name: 'circle', color: colors.gray400 };
        }
    };

    return (
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
            <View style={styles.tabBar}>
                {mainTabs.map((routeName, index) => {
                    // Find the actual route in state
                    const route = state.routes.find(r => r.name === routeName);
                    if (!route) return null;

                    const { options } = descriptors[route.key];
                    const isFocused = state.index === state.routes.findIndex(r => r.key === route.key);

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const icon = getIcon(routeName, isFocused);
                    const isCenter = routeName === 'AdminAccess';

                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel || route.name}
                            testID={options.tabBarTestID}
                            onPress={onPress}
                            style={styles.tabButton}
                            activeOpacity={0.7}
                        >
                            {isCenter ? (
                                // Center button with primary color circle
                                <View style={styles.centerButton}>
                                    <MaterialCommunityIcons 
                                        name={icon.name} 
                                        size={24} 
                                        color={icon.color} 
                                    />
                                </View>
                            ) : (
                                // Regular buttons
                                <View style={styles.regularButton}>
                                    <MaterialCommunityIcons 
                                        name={icon.name} 
                                        size={24} 
                                        color={icon.color} 
                                    />
                                    {/* Green dot for Fees tab */}
                                    {routeName === 'Fees' && (
                                        <View style={styles.notificationDot} />
                                    )}
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: 12,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        borderRadius: 30,
        paddingVertical: 12,
        paddingHorizontal: 8,
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
        alignItems: 'center',
        justifyContent: 'space-around',
        minHeight: 70,
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    regularButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -20, // Pull it up to create the curved effect
        shadowColor: colors.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    notificationDot: {
        position: 'absolute',
        bottom: -4,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
    },
});

export default CustomBottomTabBarOffice;

