/**
 * Animated Button Component
 * Enhanced with press animations and responsive sizing
 */

import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../styles/colors';
import { moderateScale, getFontSize, getPadding } from '../utils/responsive';

const AnimatedButton = ({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    style,
    textStyle,
    icon,
    iconPosition = 'left',
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
            tension: 300,
            friction: 10,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 300,
            friction: 10,
        }).start();
    };

    const buttonStyles = [
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'outline' && styles.buttonOutline,
        variant === 'success' && styles.buttonSuccess,
        variant === 'danger' && styles.buttonDanger,
        disabled && styles.buttonDisabled,
        style,
    ];

    const textStyles = [
        styles.buttonText,
        variant === 'secondary' && styles.buttonSecondaryText,
        variant === 'outline' && styles.buttonOutlineText,
        variant === 'success' && styles.buttonSuccessText,
        variant === 'danger' && styles.buttonDangerText,
        disabled && styles.buttonDisabledText,
        textStyle,
    ];

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
                style={buttonStyles}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || loading}
                activeOpacity={0.8}
            >
                {loading ? (
                    <ActivityIndicator 
                        color={variant === 'primary' || variant === 'success' || variant === 'danger' ? colors.white : colors.primary} 
                    />
                ) : (
                    <View style={styles.buttonContent}>
                        {icon && iconPosition === 'left' && (
                            <MaterialCommunityIcons 
                                name={icon} 
                                size={moderateScale(20)} 
                                color={textStyles[0]?.color || colors.white}
                                style={styles.iconLeft}
                            />
                        )}
                        <Text style={textStyles} numberOfLines={1} adjustsFontSizeToFit>
                            {title}
                        </Text>
                        {icon && iconPosition === 'right' && (
                            <MaterialCommunityIcons 
                                name={icon} 
                                size={moderateScale(20)} 
                                color={textStyles[0]?.color || colors.white}
                                style={styles.iconRight}
                            />
                        )}
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: colors.primary,
        paddingVertical: getPadding(14),
        paddingHorizontal: getPadding(24),
        borderRadius: moderateScale(12),
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: moderateScale(50),
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: moderateScale(8),
        elevation: 4,
    },
    buttonSecondary: {
        backgroundColor: colors.surface,
        borderWidth: 1.5,
        borderColor: colors.border,
        shadowColor: colors.black,
        shadowOpacity: 0.05,
    },
    buttonOutline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.primary,
        elevation: 0,
        shadowOpacity: 0,
    },
    buttonSuccess: {
        backgroundColor: colors.success,
        shadowColor: colors.success,
    },
    buttonDanger: {
        backgroundColor: colors.error,
        shadowColor: colors.error,
    },
    buttonDisabled: {
        backgroundColor: colors.gray200,
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: colors.white,
        fontSize: getFontSize(16),
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    buttonSecondaryText: {
        color: colors.textPrimary,
    },
    buttonOutlineText: {
        color: colors.primary,
    },
    buttonSuccessText: {
        color: colors.white,
    },
    buttonDangerText: {
        color: colors.white,
    },
    buttonDisabledText: {
        color: colors.gray400,
    },
    iconLeft: {
        marginRight: moderateScale(8),
    },
    iconRight: {
        marginLeft: moderateScale(8),
    },
});

export default AnimatedButton;

