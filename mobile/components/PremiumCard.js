import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../styles/colors';

const PremiumCard = ({ children, style, onPress, activeOpacity = 0.7 }) => {
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
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: colors.gray100,
    },
});

export default PremiumCard;

