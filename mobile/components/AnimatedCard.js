/**
 * Animated Premium Card Component
 * Enhanced with animations and responsive sizing
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import PropTypes from 'prop-types';
import colors from '../styles/colors';
import { moderateScale, getPadding } from '../utils/responsive';

const AnimatedCard = ({ 
    children, 
    style, 
    onPress, 
    activeOpacity = 0.7,
    delay = 0,
    index = 0,
}) => {
    const Container = onPress ? TouchableOpacity : View;
    
    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        // Staggered entrance animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                delay: delay + (index * 50),
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                delay: delay + (index * 50),
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 400,
                delay: delay + (index * 50),
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const animatedStyle = {
        opacity: fadeAnim,
        transform: [
            { scale: scaleAnim },
            { translateY },
        ],
    };

    return (
        <Animated.View style={animatedStyle}>
            <Container
                style={[styles.card, style]}
                onPress={onPress}
                activeOpacity={onPress ? activeOpacity : 1}
            >
                {children}
            </Container>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: moderateScale(16),
        padding: getPadding(20),
        marginBottom: moderateScale(16),
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: moderateScale(8),
        elevation: 4,
        borderWidth: 1,
        borderColor: colors.gray100,
    },
});

AnimatedCard.propTypes = {
    children: PropTypes.node.isRequired,
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    onPress: PropTypes.func,
    activeOpacity: PropTypes.number,
    delay: PropTypes.number,
    index: PropTypes.number,
};

AnimatedCard.defaultProps = {
    style: null,
    onPress: null,
    activeOpacity: 0.7,
    delay: 0,
    index: 0,
};

export default AnimatedCard;

