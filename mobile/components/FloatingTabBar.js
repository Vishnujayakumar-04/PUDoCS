import React, { useEffect, useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PropTypes from 'prop-types';
import colors from '../styles/colors';

// Optional haptic feedback (gracefully handle if not available)
let Haptics = null;
try {
    Haptics = require('expo-haptics');
} catch (e) {
    // Haptics not available, continue without it
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const FloatingTabBar = ({ state, descriptors, navigation }) => {
    const insets = useSafeAreaInsets();
    const translateX = useSharedValue(0);

    // Calculate visible routes and tab width using useMemo
    const { visibleRoutes, tabWidth, visibleRouteMap } = useMemo(() => {
        const visible = state.routes.filter((route) => {
            const { options } = descriptors[route.key];
            return !options.tabBarButton;
        });

        const visibleCount = visible.length || 1; // Prevent division by zero
        const tabBarWidth = SCREEN_WIDTH - 32;
        const width = tabBarWidth / visibleCount;

        // Map of route index to visible position
        const routeMap = new Map();
        let visibleIndex = 0;
        state.routes.forEach((route, index) => {
            const { options } = descriptors[route.key];
            if (!options.tabBarButton) {
                routeMap.set(index, visibleIndex++);
            }
        });

        return {
            visibleRoutes: visible,
            tabWidth: width,
            visibleRouteMap: routeMap,
        };
    }, [state.routes, descriptors]);

    useEffect(() => {
        // Find the position of the current active tab among visible tabs
        const currentVisibleIndex = visibleRouteMap.get(state.index);
        if (currentVisibleIndex !== undefined && tabWidth > 0) {
            translateX.value = withSpring(currentVisibleIndex * tabWidth, {
                damping: 15,
                stiffness: 150,
                mass: 0.5,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.index, visibleRouteMap, tabWidth]);

    const animatedIndicatorStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    return (
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
            <View style={styles.tabBar}>
                {/* Floating Active Indicator */}
                <Animated.View style={[styles.activeIndicator, animatedIndicatorStyle]}>
                    <View style={styles.indicatorDot} />
                </Animated.View>

                {/* Tab Buttons */}
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;
                    
                    // Skip hidden tabs
                    if (options.tabBarButton) {
                        return null;
                    }

                    const onPress = () => {
                        // Optional haptic feedback
                        if (Haptics && Platform.OS === 'ios') {
                            try {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            } catch (e) {
                                // Ignore haptic errors
                            }
                        }

                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    // Render icon from options.tabBarIcon function
                    const iconElement = options.tabBarIcon
                        ? options.tabBarIcon({
                              focused: isFocused,
                              color: isFocused ? colors.white : colors.gray400,
                              size: 24,
                          })
                        : null;

                    return (
                        <AnimatedTouchable
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={options.tabBarTestID}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={[styles.tabButton, { width: tabWidth }]}
                            activeOpacity={0.7}
                        >
                            <View
                                style={[
                                    styles.iconContainer,
                                    isFocused && styles.iconContainerActive,
                                ]}
                            >
                                {iconElement}
                            </View>
                        </AnimatedTouchable>
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
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        borderRadius: 32,
        paddingVertical: 8,
        paddingHorizontal: 8,
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        position: 'relative',
        minHeight: 72,
        alignItems: 'center',
    },
    activeIndicator: {
        position: 'absolute',
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        left: 8,
        zIndex: 0,
        shadowColor: colors.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    indicatorDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.white,
        position: 'absolute',
        bottom: 6,
    },
    tabButton: {
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    iconContainerActive: {
        backgroundColor: 'transparent',
    },
});

FloatingTabBar.propTypes = {
    state: PropTypes.shape({
        index: PropTypes.number.isRequired,
        routes: PropTypes.arrayOf(
            PropTypes.shape({
                key: PropTypes.string.isRequired,
                name: PropTypes.string.isRequired,
            })
        ).isRequired,
    }).isRequired,
    descriptors: PropTypes.objectOf(
        PropTypes.shape({
            options: PropTypes.shape({
                tabBarButton: PropTypes.func,
                tabBarIcon: PropTypes.func,
                tabBarAccessibilityLabel: PropTypes.string,
                tabBarTestID: PropTypes.string,
            }),
        })
    ).isRequired,
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
        emit: PropTypes.func.isRequired,
    }).isRequired,
};

export default FloatingTabBar;
