import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import colors from '../styles/colors';

const Button = ({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    style,
    textStyle
}) => {
    const buttonStyles = [
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'outline' && styles.buttonOutline,
        disabled && styles.buttonDisabled,
        style,
    ];

    const textStyles = [
        styles.buttonText,
        variant === 'secondary' && styles.buttonSecondaryText,
        variant === 'outline' && styles.buttonOutlineText,
        disabled && styles.buttonDisabledText,
        textStyle,
    ];

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'primary' ? colors.white : colors.primary} />
            ) : (
                <Text style={textStyles}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: colors.primary,
        paddingVertical: 16, // Taller button
        paddingHorizontal: 24,
        borderRadius: 12, // More rounded 12px
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56, // Larger touch target
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, // Subtle colored shadow
        shadowRadius: 8,
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
        borderWidth: 1.5, // Thinner border
        borderColor: colors.primary,
        elevation: 0,
        shadowOpacity: 0,
    },
    buttonDisabled: {
        backgroundColor: colors.gray200,
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    buttonSecondaryText: {
        color: colors.textPrimary,
    },
    buttonOutlineText: {
        color: colors.primary,
    },
    buttonDisabledText: {
        color: colors.gray400,
    },
});

export default Button;
