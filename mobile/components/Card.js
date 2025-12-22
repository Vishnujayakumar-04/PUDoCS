import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '../styles/theme';

const Card = ({ children, style, onPress, activeOpacity = 0.7 }) => {
    const Container = onPress ? TouchableOpacity : View;

    return (
        <Container
            style={[styles.card, style]}
            onPress={onPress}
            activeOpacity={onPress ? activeOpacity : 1}
        >
            {children}
        </Container>
    );
};

const styles = StyleSheet.create({
    card: {
        ...theme.layout.card,
        marginBottom: theme.spacing.md,
    },
});

export default Card;
