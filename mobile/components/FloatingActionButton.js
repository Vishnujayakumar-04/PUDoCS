import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Modal,
    Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../styles/colors';

const { width, height } = Dimensions.get('window');

const FloatingActionButton = ({ actions = [], onPress }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [backdropVisible, setBackdropVisible] = useState(false);
    
    // Animation values
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const actionAnimations = useRef(
        actions.map(() => ({
            scale: new Animated.Value(0),
            translateY: new Animated.Value(0),
            opacity: new Animated.Value(0),
        }))
    ).current;

    const toggleMenu = () => {
        const toValue = isOpen ? 0 : 1;
        setIsOpen(!isOpen);
        setBackdropVisible(!isOpen);

        // Rotate main button
        Animated.spring(rotateAnim, {
            toValue,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
        }).start();

        // Backdrop animation
        Animated.timing(backdropOpacity, {
            toValue: !isOpen ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            if (isOpen) {
                setBackdropVisible(false);
            }
        });

        // Animate action buttons
        actionAnimations.forEach((anim, index) => {
            const delay = index * 50;
            
            Animated.parallel([
                Animated.spring(anim.scale, {
                    toValue: !isOpen ? 1 : 0,
                    delay,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 7,
                }),
                Animated.timing(anim.translateY, {
                    toValue: !isOpen ? -(80 * (index + 1)) : 0,
                    delay,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(anim.opacity, {
                    toValue: !isOpen ? 1 : 0,
                    delay,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        });
    };

    const handleActionPress = (action) => {
        toggleMenu();
        if (action.onPress) {
            setTimeout(() => {
                action.onPress();
            }, 300);
        }
        if (onPress) {
            setTimeout(() => {
                onPress(action);
            }, 300);
        }
    };

    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '45deg'],
    });

    return (
        <>
            {/* Backdrop */}
            {backdropVisible && (
                <Animated.View
                    style={[
                        styles.backdrop,
                        {
                            opacity: backdropOpacity,
                        },
                    ]}
                >
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={toggleMenu}
                    />
                </Animated.View>
            )}

            {/* Action Buttons */}
            {actions.map((action, index) => {
                const anim = actionAnimations[index];
                const actionStyle = {
                    transform: [
                        { scale: anim.scale },
                        { translateY: anim.translateY },
                    ],
                    opacity: anim.opacity,
                };

                return (
                    <Animated.View
                        key={index}
                        style={[styles.actionButtonContainer, actionStyle]}
                    >
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                { backgroundColor: action.color || colors.primary },
                            ]}
                            onPress={() => handleActionPress(action)}
                            activeOpacity={0.8}
                        >
                            <MaterialCommunityIcons
                                name={action.icon}
                                size={24}
                                color="#FFFFFF"
                            />
                        </TouchableOpacity>
                        {action.label && (
                            <View style={styles.actionLabelContainer}>
                                <Text style={styles.actionLabel}>{action.label}</Text>
                            </View>
                        )}
                    </Animated.View>
                );
            })}

            {/* Main FAB Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={toggleMenu}
                activeOpacity={0.8}
            >
                <Animated.View
                    style={{
                        transform: [{ rotate: rotateInterpolate }],
                    }}
                >
                    <MaterialCommunityIcons
                        name={isOpen ? 'close' : 'plus'}
                        size={28}
                        color="#FFFFFF"
                    />
                </Animated.View>
            </TouchableOpacity>
        </>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 998,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        zIndex: 1000,
    },
    actionButtonContainer: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        alignItems: 'center',
        zIndex: 999,
    },
    actionButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    actionLabelContainer: {
        position: 'absolute',
        right: 60,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        marginTop: -24,
    },
    actionLabel: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
});

export default FloatingActionButton;

