import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import colors from '../styles/colors';

const { width } = Dimensions.get('window');

const Marquee = ({ items = [] }) => {
    const scrollX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (items.length > 0) {
            const animation = Animated.loop(
                Animated.timing(scrollX, {
                    toValue: -width,
                    duration: 15000,
                    useNativeDriver: true,
                })
            );
            animation.start();
            return () => animation.stop();
        }
    }, [items]);

    if (items.length === 0) return null;

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.scrollContainer,
                    {
                        transform: [{ translateX: scrollX }],
                    },
                ]}
            >
                {items.map((item, index) => (
                    <Text key={index} style={styles.text}>
                        {item} •{' '}
                    </Text>
                ))}
                {/* Duplicate for seamless loop */}
                {items.map((item, index) => (
                    <Text key={`dup-${index}`} style={styles.text}>
                        {item} •{' '}
                    </Text>
                ))}
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.secondaryLight,
        paddingVertical: 8,
        overflow: 'hidden',
    },
    scrollContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
    },
    text: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '500',
    },
});

export default Marquee;
